#!/usr/bin/env node

/**
 * Link and asset-integrity checks for a built site directory.
 *
 * Verifies that every local reference found in the built HTML pages
 * (href, src, srcset/imagesrcset, poster, data-src), in manifest.json
 * (icon paths) and in sitemap.xml (<loc> URLs) resolves to a real file
 * on disk, and that every in-page fragment link (#anchor, including SVG
 * <use href="#icon-...">) has a matching id in the target page.
 *
 * Absolute/remote URLs (http, https, mailto, tel, data:) are skipped:
 * this only guards against broken local references, which is what a
 * static build can break silently.
 *
 * Usage:
 *   node scripts/check-links.js [siteDir]
 *
 * siteDir defaults to "deploy". CI runs this against the freshly built
 * deploy/ output before it is committed; it can also be run manually
 * against experimental_deploy/ to check an experimental preview.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve(process.argv[2] || 'deploy');

let failures = 0;
let checkedRefs = 0;

function fail(page, ref, reason) {
  console.error(`  FAIL ${page}: ${ref} ${reason}`);
  failures++;
}

if (!fs.existsSync(SITE_DIR) || !fs.statSync(SITE_DIR).isDirectory()) {
  console.error(`Site directory not found: ${SITE_DIR}`);
  process.exit(1);
}

function walk(dir, list) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, list);
    else list.push(full);
  }
  return list;
}

const allFiles = walk(SITE_DIR, []);
const pages = allFiles.filter((f) => /\.(html|shtml)$/i.test(f));

if (pages.length === 0) {
  console.error(`No HTML pages found in ${SITE_DIR}`);
  process.exit(1);
}

console.log(`\nLink/asset integrity checks for ${path.relative('.', SITE_DIR)}/:`);
console.log(`Scanning ${pages.length} page(s)...\n`);

// Collect ids (including SVG symbol ids) per page for fragment checks.
const idsPerPage = new Map();
const pageByRelative = new Map();
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\bid\s*=\s*(?:"([^"]+)"|'([^']+)')/g)) {
    ids.add(m[1] !== undefined ? m[1] : m[2]);
  }
  idsPerPage.set(page, ids);
  pageByRelative.set(path.relative(SITE_DIR, page).replace(/\\/g, '/'), page);
}

const REMOTE_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

// Resolve a root-relative or page-relative reference to a file inside
// SITE_DIR. Returns null for remote/unsupported refs.
function resolveLocal(page, ref) {
  const trimmed = ref.trim();
  if (!trimmed || REMOTE_RE.test(trimmed)) return null;

  const hashIndex = trimmed.indexOf('#');
  const frag = hashIndex >= 0 ? trimmed.slice(hashIndex + 1) : null;
  let url = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0) url = url.slice(0, queryIndex);
  url = url.trim();

  if (url === '') {
    return { file: page, frag };
  }

  let file;
  if (url.startsWith('/')) {
    file = path.join(SITE_DIR, url);
    if (url.endsWith('/')) file = path.join(file, 'index.html');
  } else {
    file = path.resolve(path.dirname(page), url);
  }
  return { file, frag };
}

function checkRef(page, ref, kind) {
  const resolved = resolveLocal(page, ref);
  if (!resolved) return;

  checkedRefs++;

  const { file, frag } = resolved;
  if (!fs.existsSync(file)) {
    fail(page, ref, `-> missing file ${path.relative(SITE_DIR, file)}`);
    return;
  }

  if (frag) {
    const targetIds = idsPerPage.get(file);
    if (targetIds === undefined) return; // non-HTML target, no anchor to check
    if (!targetIds.has(frag)) {
      fail(page, ref, `-> #${frag} not found in ${path.relative(SITE_DIR, file)}`);
    }
  }
}

const ATTR_RE = /\b(?:href|src|poster|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const SRCSET_RE = /\b(?:srcset|imagesrcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const relPage = path.relative('.', page).replace(/\\/g, '/');

  for (const m of html.matchAll(ATTR_RE)) {
    checkRef(page, m[1] !== undefined ? m[1] : m[2], 'attr');
  }

  // srcset values are comma-separated "url widthDescriptor" pairs.
  for (const m of html.matchAll(SRCSET_RE)) {
    const value = m[1] !== undefined ? m[1] : m[2];
    for (const candidate of value.split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) checkRef(page, url, 'srcset');
    }
  }

  console.log(`  ok   ${relPage}`);
}

// --- manifest.json icons ---
const manifestPath = path.join(SITE_DIR, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const relPage = path.relative('.', manifestPath).replace(/\\/g, '/');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    for (const icon of manifest.icons || []) {
      if (icon && icon.src && !REMOTE_RE.test(icon.src)) {
        checkedRefs++;
        const file = path.resolve(SITE_DIR, icon.src.split('?')[0].split('#')[0]);
        if (!fs.existsSync(file)) {
          fail(relPage, icon.src, `-> missing icon file ${icon.src}`);
        }
      }
    }
    console.log(`  ok   ${relPage}`);
  } catch (e) {
    fail(relPage, 'manifest.json', `-> invalid JSON: ${e.message}`);
  }
}

// --- sitemap.xml URLs must map to real pages ---
const sitemapPath = path.join(SITE_DIR, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const relPage = path.relative('.', sitemapPath).replace(/\\/g, '/');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  let locs = 0;
  for (const m of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    const loc = m[1];
    if (!/^https?:\/\//i.test(loc)) continue; // only absolute URLs expected
    checkedRefs++;
    locs++;
    const url = loc.replace(/^https?:\/\/[^/]+/i, '') || '/';
    const file = path.join(SITE_DIR, url.endsWith('/') ? url + 'index.html' : url);
    if (!fs.existsSync(file)) {
      fail(relPage, loc, `-> no matching page in build output`);
    }
  }
  console.log(`  ok   ${relPage} (${locs} URL(s))`);
}

console.log(`\n${checkedRefs} local reference(s) checked.`);
if (failures > 0) {
  console.error(`\n${failures} broken reference(s) found.`);
  process.exit(1);
}
console.log('All references resolve.\n');
