#!/usr/bin/env node
// Source-consistency checks for the Remote Labs website. Run with: npm test
//
// Guards the security and robustness invariants:
//   - all JS files parse (node --check)
//   - no inline event handlers (onclick, ...) and no executable inline
//     <script> blocks in the HTML pages (CSP keeps script-src without
//     'unsafe-inline')
//   - CSP script-src never contains 'unsafe-inline'
//   - the email address is a real mailto: link
//   - the render-blocking main stylesheet link (and the absence of the old
//     media="print" async trick) survives HTML comment stripping in the
//     deploy pages (guards against an unstyled or layout-shifting ship)
//   - VERSION, sw.js and every ?v= asset reference in every text file
//     (source and deploy/) all carry the same version (catches "bumped
//     VERSION but did not run the build" and source/deploy drift)
//
// Adding a new page? Add it to PAGES below, and to filesToSync/filesToCopy
// in build.js.

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const PAGES = ['index.html', 'privacy.html'];

let failures = 0;

function fail(file, msg) {
  console.error(`  FAIL ${file}: ${msg}`);
  failures++;
}

function ok(msg) {
  console.log(`  ok   ${msg}`);
}

// ---------------------------------------------------------------------------
// JS syntax
// ---------------------------------------------------------------------------

function assertSyntax(file) {
  try {
    execSync(`node --check ${file}`, { cwd: ROOT, stdio: 'pipe' });
    ok(`${file} parses`);
  } catch (e) {
    fail(file, 'syntax error - ' + (e.stderr || e.message).toString().split('\n')[0]);
  }
}

console.log('\nJS syntax checks:');
['script.js', 'consent.js', 'sw.js', 'umami-tracker.js', 'build.js', 'test.js', 'check-render.js'].forEach(assertSyntax);

// ---------------------------------------------------------------------------
// Analytics tracker SRI consistency
// ---------------------------------------------------------------------------

// The self-hosted Umami tracker (umami-tracker.js, a byte-exact copy of
// https://cloud.umami.is/script.js) is pinned by sha384 in consent.js
// (UMAMI_INTEGRITY). Source and deploy/ copies must hash to that value -
// a drifted tracker would fail SRI at runtime and silently disable analytics.
console.log('\nAnalytics tracker SRI checks:');
{
  const crypto = require('crypto');
  const consentSrc = fs.readFileSync(path.join(ROOT, 'consent.js'), 'utf8');
  const integrityMatch = consentSrc.match(/UMAMI_INTEGRITY = '(sha384-[^']+)'/);
  if (!integrityMatch) {
    fail('consent.js', 'UMAMI_INTEGRITY not found');
  } else {
    for (const rel of ['umami-tracker.js', path.join('..', 'deploy', 'umami-tracker.js')]) {
      const filePath = path.join(ROOT, rel);
      if (!fs.existsSync(filePath)) {
        fail(rel, 'missing');
        continue;
      }
      const hash = 'sha384-' + crypto.createHash('sha384').update(fs.readFileSync(filePath)).digest('base64');
      if (hash === integrityMatch[1]) {
        ok(`${rel} sha384 matches UMAMI_INTEGRITY`);
      } else {
        fail(rel, `sha384 ${hash} != UMAMI_INTEGRITY ${integrityMatch[1]}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// HTML page checks
// ---------------------------------------------------------------------------

function checkPage(page) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) { fail(page, 'missing'); return; }
  const html = fs.readFileSync(file, 'utf8');

  // No inline event handler attributes (onclick, onload, onerror, etc.)
  const handlers = html.match(/\son[a-z]+="/gi);
  if (handlers) fail(page, `${handlers.length} inline event handler(s) found (e.g. onclick)`);

  // No executable inline <script> blocks. Allowed: external src, and
  // type="application/ld+json" structured data (not executed as JS).
  const scriptTags = html.match(/<script\b[^>]*>/gi) || [];
  for (const tag of scriptTags) {
    if (/src=/.test(tag)) continue;
    if (/type="application\/ld\+json"/i.test(tag)) continue;
    fail(page, 'executable inline <script> block found: ' + tag.trim());
  }

  // CSP must not allow 'unsafe-inline' for script-src
  const csp = html.match(/Content-Security-Policy"[^>]*content="([^"]*)"/i);
  if (csp) {
    const scriptSrc = (csp[1].match(/script-src\s+([^;]+)/i) || [])[1] || '';
    if (/unsafe-inline/i.test(scriptSrc)) {
      fail(page, "CSP script-src still contains 'unsafe-inline'");
    } else {
      ok(`${page} script-src has no unsafe-inline`);
    }
  }

  // Email links must be real mailto: (not href="#")
  const emailLinks = html.match(/k\.m\.a\.aarts@tue\.nl/g) || [];
  const mailtoLinks = html.match(/mailto:k\.m\.a\.aarts@tue\.nl/g) || [];
  if (emailLinks.length && mailtoLinks.length === 0) {
    fail(page, 'email address present but no mailto: link');
  }
}

console.log('\nHTML consistency checks:');
for (const page of PAGES) checkPage(page);

// ---------------------------------------------------------------------------
// Version consistency
// ---------------------------------------------------------------------------

function readVersionFile() {
  const versionPath = path.join(ROOT, '../VERSION');
  if (!fs.existsSync(versionPath)) return null;
  const versionData = fs.readFileSync(versionPath, 'utf8');
  const cacheMatch = versionData.match(/CACHE_NAME=(v\d+\.\d+\.\d+)/);
  const assetMatch = versionData.match(/ASSET_VERSION=(v\d+\.\d+\.\d+)/);
  if (!cacheMatch || !assetMatch) return null;
  return { cacheVersion: cacheMatch[1], assetVersion: assetMatch[1] };
}

// Every ?v= reference in `file` must equal `expected`; reports the first
// mismatch with a hint about which command fixes it. `label` is the name
// shown in the output.
function checkAssetRefs(label, file, expected, hint) {
  const refs = fs.readFileSync(file, 'utf8').match(/\?v=[\d.]+/g) || [];
  const bad = refs.filter((r) => r !== expected);
  if (refs.length === 0) {
    fail(label, 'no ?v= asset references found');
  } else if (bad.length) {
    fail(label, `asset references ${bad[0]} != VERSION (${expected}) - ${hint}`);
  } else {
    ok(`${label} asset references match VERSION (${refs.length} refs)`);
  }
}

console.log('\nVersion consistency checks:');
const versions = readVersionFile();
if (!versions) {
  console.log('  --   VERSION file not found or unparsable, skipping version checks');
} else {
  const { cacheVersion, assetVersion } = versions;
  const expectedAssetRef = '?v=' + assetVersion.substring(1);

  // sw.js must carry the same versions as the VERSION file. The literal
  // declaration shape matters: build.js rewrites these exact patterns.
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const swCache = sw.match(/const CACHE_NAME = 'remotelabs-v(\d+\.\d+\.\d+)'/);
  const swAsset = sw.match(/const ASSET_VERSION = '(\d+\.\d+\.\d+)'/);
  if (swCache && cacheVersion.substring(1) !== swCache[1]) {
    fail('sw.js', `CACHE_NAME (${swCache[1]}) != VERSION (${cacheVersion})`);
  }
  if (swAsset && assetVersion.substring(1) !== swAsset[1]) {
    fail('sw.js', `ASSET_VERSION (${swAsset[1]}) != VERSION (${assetVersion})`);
  }
  if (swCache && swAsset) {
    ok(`VERSION/sw.js cache (${swCache[1]}) and asset (${swAsset[1]}) versions match`);
  }

  // Every text file that carries ?v= asset references (HTML pages,
  // fonts.css, ...) must match VERSION, in source and in deploy/. CI
  // regenerates deploy/ from source on every run, so committed drift means
  // someone pushed source changes (or a VERSION bump) without rebuilding
  // and committing deploy/. This also guards against a partially synced
  // deploy/ on the server: a stale fonts.css makes the font preload URLs
  // miss and downloads the fonts twice.
  const textExts = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);
  const walkTextFiles = (dir, out = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'deploy') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walkTextFiles(p, out);
      else if (textExts.has(path.extname(e.name).toLowerCase())) out.push(p);
    }
    return out;
  };
  const versionedFiles = [...walkTextFiles(ROOT), ...walkTextFiles(path.join(ROOT, '../deploy'))];
  for (const f of versionedFiles) {
    // ?v= followed by a digit is a real asset reference; bare "?v=" in
    // comments/docs (?v=<ASSET_VERSION>, ?v=...) is not.
    if (!/\?v=\d/.test(fs.readFileSync(f, 'utf8'))) continue;
    checkAssetRefs(path.relative(ROOT, f), f, expectedAssetRef, 'run npm run build:full and commit deploy/');
  }
  const deploySw = path.join(ROOT, '../deploy/sw.js');
  if (fs.existsSync(deploySw)) {
    const swdCache = fs.readFileSync(deploySw, 'utf8').match(/const CACHE_NAME = 'remotelabs-v(\d+\.\d+\.\d+)'/);
    if (!swdCache) {
      fail('../deploy/sw.js', 'CACHE_NAME not found');
    } else if (swdCache[1] !== cacheVersion.substring(1)) {
      fail('../deploy/sw.js', `CACHE_NAME (${swdCache[1]}) != VERSION (${cacheVersion}) - run npm run build:full and commit deploy/`);
    } else {
      ok('deploy/sw.js CACHE_NAME matches VERSION');
    }
  }
}

// ---------------------------------------------------------------------------
// Render-blocking stylesheet checks (deploy output)
// ---------------------------------------------------------------------------
// The pages load styles.min.css via a plain render-blocking <link>. If that
// tag ever ends up inside an HTML comment, the page renders unstyled; and
// the old media="print" async-swap pattern must not come back (it caused
// layout shifts whenever the swap landed after first paint). With HTML
// comments stripped, the deploy page must still carry the blocking link.

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

console.log('\nRender-blocking stylesheet checks:');
for (const page of PAGES) {
  const deployPath = path.join(ROOT, '../deploy', page);
  if (!fs.existsSync(deployPath)) continue;
  const visible = stripHtmlComments(fs.readFileSync(deployPath, 'utf8'));
  const srcVisible = stripHtmlComments(fs.readFileSync(path.join(ROOT, page), 'utf8'));
  if (/id="main-stylesheet"/.test(srcVisible)) {
    const linkOk = /<link[^>]*rel="stylesheet"[^>]*id="main-stylesheet"[^>]*>|<link[^>]*id="main-stylesheet"[^>]*rel="stylesheet"[^>]*>/.test(visible);
    if (!linkOk) {
      fail(`deploy/${page}`, 'render-blocking main stylesheet link missing outside HTML comments');
    } else if (/media="print"/.test(visible)) {
      fail(`deploy/${page}`, 'stylesheet must be render-blocking - media="print" async swap causes layout shifts');
    } else {
      ok(`deploy/${page} render-blocking stylesheet link present outside comments`);
    }
  }
}

console.log('\n' + (failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`));
process.exit(failures === 0 ? 0 : 1);
