#!/usr/bin/env node
// Bumps the PATCH number in the root VERSION file (the single source of
// truth for CACHE_NAME / ASSET_VERSION) and then runs the canonical build
// (production_source/build.js), which syncs the new version into sw.js,
// the HTML pages and fonts.css and regenerates deploy/.
//
// CI never runs this script - it only runs `npm run build:full`, which
// never bumps - so this cannot drift deploy/ ahead of the committed source
// the way the old auto-bump inside build.js did.
//
// Run with: node scripts/bump-version.js
// (equivalent manual ritual: edit VERSION, then `npm run build:full`)

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const VERSION_PATH = path.join(ROOT, 'VERSION');

console.log('Bumping PATCH version in VERSION and rebuilding...\n');

let data;
try {
  data = fs.readFileSync(VERSION_PATH, 'utf8');
} catch (error) {
  console.error('✗ Cannot read VERSION file:', error.message);
  process.exit(1);
}

const cacheMatch = data.match(/^CACHE_NAME=(v\d+\.\d+\.\d+)$/m);
const assetMatch = data.match(/^ASSET_VERSION=(v\d+\.\d+\.\d+)$/m);
if (!cacheMatch || !assetMatch) {
  console.error('✗ CACHE_NAME/ASSET_VERSION (vMAJOR.MINOR.PATCH) not found in VERSION');
  process.exit(1);
}
if (cacheMatch[1] !== assetMatch[1]) {
  console.error('✗ CACHE_NAME (' + cacheMatch[1] + ') and ASSET_VERSION (' + assetMatch[1] + ') differ - fix VERSION first');
  process.exit(1);
}

const bumped = 'v' + cacheMatch[1].substring(1).split('.').map((n, i) => (i === 2 ? String(Number(n) + 1) : n)).join('.');
const updated = data
  .replace(/^CACHE_NAME=v\d+\.\d+\.\d+$/m, 'CACHE_NAME=' + bumped)
  .replace(/^ASSET_VERSION=v\d+\.\d+\.\d+$/m, 'ASSET_VERSION=' + bumped);
fs.writeFileSync(VERSION_PATH, updated);
console.log('✓ VERSION: ' + cacheMatch[1] + ' -> ' + bumped + '\n');

try {
  execSync('npm run build:full', {
    cwd: path.join(ROOT, 'production_source'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('\n✗ Build failed:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('Version bumped to ' + bumped + ' and build completed.');
console.log('='.repeat(60));
console.log('\nThe build synced the new version into sw.js, index.html,');
console.log('privacy.html and fonts.css, and regenerated deploy/.');
console.log('\nNext steps:');
console.log('  1. Run `npm test` in production_source/ and `node scripts/check-links.js deploy`');
console.log('  2. Commit source and deploy/ together');
console.log('  3. Deploy to server; test in incognito mode to verify cache invalidation');
