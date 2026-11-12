#!/usr/bin/env node
// Canonical build for the Remote Labs website. Run with: npm run build:full
//
// What the build does, in order:
//   1. Sync version strings from the root VERSION file into sw.js, the HTML
//      pages and fonts.css (every local asset URL carries ?v=<ASSET_VERSION>)
//   2. Minify styles.css  -> ../deploy/styles.min.css   (clean-css library API)
//   3. Minify script.js    -> ../deploy/script.min.js    (uglify-js library API)
//   4. Copy HTML/config files (filesToCopy) into ../deploy/ (inline <style>
//      blocks are minified in the deploy copy only, and the empty
//      <style id="critical-css"> placeholder in index.html is filled from
//      the marked critical section of styles.css - sources stay readable)
//   5. Copy icons into ../deploy/
//   6. Replace ../deploy/assets with the source assets folder
//   7. Inject partner-logo markup into ../deploy/index.html
//
// VERSION is the single source of truth and the build never bumps it (CI
// commits only deploy/, so an auto-bump here used to drift deploy/ ahead of
// the committed source). To release: bump VERSION (or run
// `node scripts/bump-version.js`, which bumps PATCH and builds in one step),
// then run this build. Any step failure is fatal - a partial deploy/ must
// never ship.
//
// Adding a new page? Register it in three places: filesToSync and filesToCopy
// below, and PAGES in test.js.

'use strict';

const fs = require('fs');
const path = require('path');
const { generatePartnerLogosHTML } = require('../scripts/partner-logos.js');

const SOURCE_DIR = __dirname;
const DEPLOY_DIR = path.join(SOURCE_DIR, '..', 'deploy');
const VERSION_PATH = path.join(SOURCE_DIR, '..', 'VERSION');

// Files whose ?v= asset references are synced from the VERSION file.
const filesToSync = ['index.html', 'privacy.html', 'assets/fonts/fonts.css'];

// Files copied verbatim from production_source/ into deploy/.
const filesToCopy = ['index.html', 'privacy.html', 'sw.js', 'robots.txt', 'sitemap.xml', '.htaccess'];

const iconFiles = ['icon-192x192.svg', 'icon-512x512.svg'];

// ---------------------------------------------------------------------------
// Step 1: version sync
// ---------------------------------------------------------------------------

// Read CACHE_NAME / ASSET_VERSION (vMAJOR.MINOR.PATCH) from the VERSION file.
function readVersions() {
  const versionData = fs.readFileSync(VERSION_PATH, 'utf8');
  const cacheMatch = versionData.match(/CACHE_NAME=(v\d+\.\d+\.\d+)/);
  const assetMatch = versionData.match(/ASSET_VERSION=(v\d+\.\d+\.\d+)/);
  if (!cacheMatch || !assetMatch) {
    throw new Error('CACHE_NAME/ASSET_VERSION (vMAJOR.MINOR.PATCH) not found in VERSION file');
  }
  return { cacheVersion: cacheMatch[1], assetVersion: assetMatch[1] };
}

function syncVersions() {
  const { cacheVersion, assetVersion } = readVersions();

  // Service worker: the cache name and asset version literals must keep the
  // exact `const ... = '...'` shape - test.js and this build match on them.
  const swPath = path.join(SOURCE_DIR, 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-v[\d.]+'/g, `const CACHE_NAME = 'remotelabs-${cacheVersion}'`);
  swContent = swContent.replace(/const ASSET_VERSION = '[\d.]+'/g, `const ASSET_VERSION = '${assetVersion.substring(1)}'`);
  fs.writeFileSync(swPath, swContent);

  // HTML pages and the fonts stylesheet: every ?v=x.y.z becomes the current
  // ASSET_VERSION so all local asset URLs are cache-busted together.
  for (const file of filesToSync) {
    const filePath = path.join(SOURCE_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\?v=[\d.]+/g, `?v=${assetVersion.substring(1)}`);
    fs.writeFileSync(filePath, content);
  }

  console.log(`  synced to ${cacheVersion} (cache) / ${assetVersion} (assets)`);
  return assetVersion;
}

// ---------------------------------------------------------------------------
// Steps 2-3: minification (library APIs; failure is fatal so a stale
// artifact can never ship - never shell out to `npx <bin>` here)
// ---------------------------------------------------------------------------

function buildCss() {
  const CleanCSS = require('clean-css');
  const cssSource = fs.readFileSync(path.join(SOURCE_DIR, 'styles.css'), 'utf8');
  const minified = new CleanCSS().minify(cssSource);
  if (minified.errors && minified.errors.length > 0) {
    throw new Error(minified.errors.join('; '));
  }
  fs.writeFileSync(path.join(DEPLOY_DIR, 'styles.min.css'), minified.styles);
  console.log('  styles.css -> deploy/styles.min.css');
}

function buildJs() {
  const UglifyJS = require('uglify-js');
  const jsSource = fs.readFileSync(path.join(SOURCE_DIR, 'script.js'), 'utf8');
  const result = UglifyJS.minify(jsSource, { compress: true, mangle: true });
  if (result.error) {
    throw new Error(result.error.message);
  }
  fs.writeFileSync(path.join(DEPLOY_DIR, 'script.min.js'), result.code);
  console.log('  script.js -> deploy/script.min.js');
}

// ---------------------------------------------------------------------------
// Steps 4-6: file copies
// ---------------------------------------------------------------------------

// Minify inline <style> blocks in an HTML string. The sources keep readable
// CSS; the deployed HTML ships compact render-blocking CSS (less main-thread
// parse time on slow devices). Minification failure is fatal, like the
// stylesheet minification above.
function minifyInlineStyles(html) {
  const CleanCSS = require('clean-css');
  return html.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
    const result = new CleanCSS().minify(css);
    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.join('; '));
    }
    return '<style>' + result.styles + '</style>';
  });
}

// Extract the marked critical section (/* critical-start */ ...
// /* critical-end */) from styles.css and minify it. styles.css is the single
// source for the above-the-fold CSS; index.html only carries an empty
// <style id="critical-css"> placeholder that this fills in the deploy copy.
function getCriticalCss() {
  const css = fs.readFileSync(path.join(SOURCE_DIR, 'styles.css'), 'utf8');
  const m = css.match(/\/\* critical-start \*\/([\s\S]*?)\/\* critical-end \*\//);
  if (!m) {
    throw new Error('critical-start/critical-end markers not found in styles.css');
  }
  const CleanCSS = require('clean-css');
  const result = new CleanCSS().minify(m[1]);
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors.join('; '));
  }
  return result.styles;
}

function injectCriticalCss(html) {
  if (!html.includes('id="critical-css"')) return html;
  const critical = getCriticalCss();
  // Anchor on the EMPTY placeholder only. A looser match would also hit the
  // literal tag quoted inside an HTML comment and swallow the injected CSS
  // (plus the tags after it) into that comment - test.js guards against it.
  return html.replace(
    /<style id="critical-css">\s*<\/style>/,
    `<style id="critical-css">${critical}</style>`
  );
}

function copyFiles(files, label) {
  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DEPLOY_DIR, file);
    if (fs.existsSync(sourcePath)) {
      if (file.endsWith('.html')) {
        const html = fs.readFileSync(sourcePath, 'utf8');
        fs.writeFileSync(destPath, injectCriticalCss(minifyInlineStyles(html)));
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
      console.log(`  copied ${file}`);
    } else {
      console.warn(`  warning: source file ${file} not found, skipping`);
    }
  }
  if (label) console.log(`  (${label})`);
}

// Copy srcDir over destDir (overwriting existing files). Files that cannot
// be overwritten because the OS locks them (OneDrive does this on Windows)
// are skipped with a warning instead of failing the build - the locked file
// is unchanged, so the copy already on disk is still correct. Any other
// error is fatal: a partial assets folder must never ship.
function copyDirOverwrite(srcDir, destDir, warnings) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirOverwrite(srcPath, destPath, warnings);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (error) {
        if (error.code === 'EPERM' && fs.existsSync(destPath)) {
          warnings.push(path.relative(destDir, destPath) + ' (locked, kept existing copy)');
        } else {
          throw error;
        }
      }
    }
  }
}

// Remove files/dirs in destDir that no longer exist in srcDir. Locked files
// (EPERM) are left in place with a warning - they cannot be stale content we
// just wrote, and deleting them is not worth failing the build over.
function removeStale(srcDir, destDir, warnings) {
  if (!fs.existsSync(destDir)) return;
  for (const entry of fs.readdirSync(destDir, { withFileTypes: true })) {
    const destPath = path.join(destDir, entry.name);
    const srcPath = path.join(srcDir, entry.name);
    if (!fs.existsSync(srcPath)) {
      try {
        fs.rmSync(destPath, { recursive: true, force: true });
      } catch (error) {
        if (error.code === 'EPERM') {
          warnings.push(path.relative(destDir, destPath) + ' (locked, could not remove)');
        } else {
          throw error;
        }
      }
    } else if (entry.isDirectory()) {
      removeStale(srcPath, destPath, warnings);
    }
  }
}

function copyAssets() {
  const sourceAssets = path.join(SOURCE_DIR, 'assets');
  const destAssets = path.join(DEPLOY_DIR, 'assets');
  if (!fs.existsSync(sourceAssets)) {
    console.warn('  warning: source assets folder not found, skipping');
    return;
  }
  // Copy-over instead of delete+recreate: deleting first breaks on
  // Windows/OneDrive, where a freshly written file can still be locked
  // (EPERM) and the delete then aborts midway, leaving a partial
  // deploy/assets. Copying over keeps the old files in place until they are
  // overwritten, and removeStale() afterwards drops anything that is no
  // longer in the source, so deploy/assets still mirrors the source exactly.
  const warnings = [];
  copyDirOverwrite(sourceAssets, destAssets, warnings);
  removeStale(sourceAssets, destAssets, warnings);
  for (const w of warnings) console.warn(`  warning: assets/${w}`);
  console.log(`  assets/ synced (${warnings.length} locked file(s) kept as-is)`);
}

// ---------------------------------------------------------------------------
// Step 7: partner logos
// ---------------------------------------------------------------------------

function generatePartnerLogos(assetVersion) {
  const logosDir = path.join(SOURCE_DIR, 'assets', 'images', 'logos', 'partner-logos');
  const htmlPath = path.join(DEPLOY_DIR, 'index.html');
  // Inject the current ASSET_VERSION so logo URLs are cache-busted like
  // every other local asset (?v= is synced from the VERSION file above).
  generatePartnerLogosHTML(logosDir, htmlPath, null, assetVersion.substring(1));
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function main() {
  console.log('Starting build process...\n');

  const steps = [
    ['Syncing versions from VERSION', () => { syncVersions(); }],
    ['Building CSS', buildCss],
    ['Building JavaScript', buildJs],
    ['Copying HTML and Service Worker files', () => copyFiles(filesToCopy)],
    ['Copying icon files', () => copyFiles(iconFiles)],
    ['Copying assets folder', copyAssets],
    ['Generating partner logos', () => {
      // Needs the synced asset version, so capture it from step 1.
      generatePartnerLogos(readVersions().assetVersion);
    }]
  ];

  for (const [name, step] of steps) {
    console.log(name + '...');
    try {
      step();
    } catch (error) {
      console.error(`✗ ${name} failed: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\nBuild completed successfully! ✓');
  console.log('\nGenerated files:');
  console.log('  - deploy/styles.min.css');
  console.log('  - deploy/script.min.js');
  console.log('  - deploy/index.html');
  console.log('  - deploy/privacy.html');
  console.log('  - deploy/sw.js');
  console.log('  - deploy/icon-192x192.svg');
  console.log('  - deploy/icon-512x512.svg');
  console.log('  - deploy/assets/');
  console.log('\n⚠️  REMEMBER: Deploy to server for changes to take effect!');
  console.log('   Test in incognito mode to verify cache invalidation.');
}

main();
