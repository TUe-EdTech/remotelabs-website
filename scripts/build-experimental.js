#!/usr/bin/env node
// Build the experimental/ sandbox into experimental_deploy/ (gitignored), so
// a redesign can be previewed as a built site before syncing it into
// production_source/ (see scripts/sync-experimental.js).
//
// Differences from the canonical production build (production_source/build.js):
//   - inputs come from experimental/ instead of production_source/
//   - asset URLs get the literal ?v=exp query (no VERSION sync)
//   - shared assets (fonts, images, videos) are taken from production_source/
//     and merged with experimental/'s own extras (fontawesome)
//
// Like build.js, minification uses the clean-css / uglify-js library APIs
// (resolved from production_source/node_modules) and a minification failure
// is fatal - a preview build must never silently ship unminified assets.
//
// Usage: node scripts/build-experimental.js

'use strict';

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');
const { generatePartnerLogosHTML } = require('./partner-logos.js');

const REPO_ROOT = path.join(__dirname, '..');
const EXPERIMENTAL_DIR = path.join(REPO_ROOT, 'experimental');
const EXPERIMENTAL_DEPLOY_DIR = path.join(REPO_ROOT, 'experimental_deploy');
const PRODUCTION_DIR = path.join(REPO_ROOT, 'production_source');

// Minifier libraries live in production_source/node_modules.
const prodRequire = createRequire(path.join(PRODUCTION_DIR, 'package.json'));

// Files copied verbatim from experimental/ to experimental_deploy/.
const FILES_TO_COPY = [
  'index.html',
  'script.js',
  'styles.css',
  'manifest.json',
  'robots.txt',
  'sitemap.xml'
];

const ICON_FILES = ['icon-192x192.svg', 'icon-512x512.svg'];

// Experimental builds are cache-busted with a fixed literal query.
const EXP_VERSION_QUERY = 'exp';

function log(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${path.relative(REPO_ROOT, dir)}`);
  }
}

function copyFile(src, dest) {
  try {
    ensureDirectory(path.dirname(dest));
    fs.copyFileSync(src, dest);
    log(`Copied: ${path.relative(REPO_ROOT, src)} -> ${path.relative(REPO_ROOT, dest)}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to copy ${src}: ${error.message}`, 'error');
    return false;
  }
}

function copyDirectory(srcDir, destDir) {
  try {
    ensureDirectory(destDir);
    for (const entry of fs.readdirSync(srcDir)) {
      const srcPath = path.join(srcDir, entry);
      const destPath = path.join(destDir, entry);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDirectory(srcPath, destPath);
      } else {
        copyFile(srcPath, destPath);
      }
    }
    log(`Copied directory: ${path.relative(REPO_ROOT, srcDir)} -> ${path.relative(REPO_ROOT, destDir)}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to copy directory ${srcDir}: ${error.message}`, 'error');
    return false;
  }
}

// Minify with the library API; throws on failure (fatal by design).
function minifyCss() {
  const CleanCSS = prodRequire('clean-css');
  const source = fs.readFileSync(path.join(EXPERIMENTAL_DIR, 'styles.css'), 'utf8');
  const result = new CleanCSS().minify(source);
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors.join('; '));
  }
  fs.writeFileSync(path.join(EXPERIMENTAL_DEPLOY_DIR, 'styles.min.css'), result.styles);
  log('styles.css -> experimental_deploy/styles.min.css', 'success');
}

function minifyJs() {
  const UglifyJS = prodRequire('uglify-js');
  const source = fs.readFileSync(path.join(EXPERIMENTAL_DIR, 'script.js'), 'utf8');
  const result = UglifyJS.minify(source, { compress: true, mangle: true });
  if (result.error) {
    throw new Error(result.error.message);
  }
  fs.writeFileSync(path.join(EXPERIMENTAL_DEPLOY_DIR, 'script.min.js'), result.code);
  log('script.js -> experimental_deploy/script.min.js', 'success');
}

// Point the built index.html at the minified assets with ?v=exp.
function updateHtmlReferences() {
  const htmlPath = path.join(EXPERIMENTAL_DEPLOY_DIR, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/styles\.css/g, `styles.min.css?v=${EXP_VERSION_QUERY}`);
  html = html.replace(/script\.js/g, `script.min.js?v=${EXP_VERSION_QUERY}`);
  fs.writeFileSync(htmlPath, html);
  log('Updated HTML references to minified files', 'success');
}

// Inject partner-logo markup into the built page (logos live in
// production_source/assets, versioned with the same ?v=exp query).
function generatePartnerLogos() {
  const logosDir = path.join(PRODUCTION_DIR, 'assets', 'images', 'logos', 'partner-logos');
  const htmlPath = path.join(EXPERIMENTAL_DEPLOY_DIR, 'index.html');
  generatePartnerLogosHTML(logosDir, htmlPath, log, EXP_VERSION_QUERY);
}

function main() {
  log('Building experimental layout...');

  if (!fs.existsSync(EXPERIMENTAL_DIR)) {
    log(`Experimental directory not found: ${EXPERIMENTAL_DIR}`, 'error');
    process.exit(1);
  }

  // Start from a clean output directory.
  if (fs.existsSync(EXPERIMENTAL_DEPLOY_DIR)) {
    fs.rmSync(EXPERIMENTAL_DEPLOY_DIR, { recursive: true, force: true });
    log('Cleaned experimental_deploy directory');
  }
  ensureDirectory(EXPERIMENTAL_DEPLOY_DIR);

  // Copy the experimental source files.
  for (const file of FILES_TO_COPY) {
    const src = path.join(EXPERIMENTAL_DIR, file);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(EXPERIMENTAL_DEPLOY_DIR, file));
    } else {
      log(`File not found: ${path.relative(REPO_ROOT, src)}`, 'warning');
    }
  }

  // Shared assets live only in production_source/; experimental/ keeps just
  // its extra fontawesome folder. Copy production assets first, then overlay.
  copyDirectory(path.join(PRODUCTION_DIR, 'assets'), path.join(EXPERIMENTAL_DEPLOY_DIR, 'assets'));
  const fontawesomeSrc = path.join(EXPERIMENTAL_DIR, 'assets', 'fontawesome');
  if (fs.existsSync(fontawesomeSrc)) {
    copyDirectory(fontawesomeSrc, path.join(EXPERIMENTAL_DEPLOY_DIR, 'assets', 'fontawesome'));
  }

  // Icons live at the repo root.
  for (const icon of ICON_FILES) {
    const src = path.join(REPO_ROOT, icon);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(EXPERIMENTAL_DEPLOY_DIR, icon));
    }
  }

  // Optional per-sandbox server config.
  const htaccessSrc = path.join(EXPERIMENTAL_DIR, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    copyFile(htaccessSrc, path.join(EXPERIMENTAL_DEPLOY_DIR, '.htaccess'));
  }

  generatePartnerLogos();
  minifyCss();
  minifyJs();
  updateHtmlReferences();

  log('Build complete!', 'success');
  log(`Preview in: ${path.relative(REPO_ROOT, EXPERIMENTAL_DEPLOY_DIR)}/index.html`, 'info');
}

try {
  main();
} catch (error) {
  log(`Build failed: ${error.message}`, 'error');
  process.exit(1);
}
