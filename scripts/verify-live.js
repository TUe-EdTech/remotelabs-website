#!/usr/bin/env node

/**
 * Post-upload verification: every file in the built site directory must be
 * served by the live web server with the same byte count as on disk.
 *
 * Why this exists: the v2.1.33 upload wrote 0-byte styles.min.css and
 * script.min.js to the server (every other file landed intact), so the
 * site rendered unstyled while all local checks stayed green. A truncated
 * upload is invisible until you compare the served bytes - this script
 * does exactly that, in seconds, right after every upload.
 *
 * Dotfiles (e.g. .htaccess) are skipped: the server blocks them with 403
 * by design, so they are never expected to be fetchable.
 *
 * Usage:
 *   node scripts/verify-live.js [baseUrl] [siteDir]
 *
 * Defaults: baseUrl = https://remote-labs.eu, siteDir = deploy.
 * Run from the repo root. Exits non-zero on any non-200 or size mismatch.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const BASE_URL = (process.argv[2] || 'https://remote-labs.eu').replace(/\/+$/, '');
const SITE_DIR = path.resolve(process.argv[3] || 'deploy');

let failures = 0;
let checkedFiles = 0;

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

// GET a URL (following redirects) and resolve { status, bytes }.
function fetchSize(url, redirectsLeft) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http;
    const req = mod.get(url, (res) => {
      const status = res.statusCode;
      if ([301, 302, 303, 307, 308].includes(status) && res.headers.location && redirectsLeft > 0) {
        res.resume();
        resolve(fetchSize(new URL(res.headers.location, url).toString(), redirectsLeft - 1));
        return;
      }
      let bytes = 0;
      res.on('data', (chunk) => { bytes += chunk.length; });
      res.on('end', () => resolve({ status, bytes, headers: res.headers }));
      res.on('error', reject);
    });
    req.setTimeout(30000, () => req.destroy(new Error('request timed out')));
    req.on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with polite pacing: the server rate-limits bursts (HTTP 429), so
// wait between requests and back off on 429/503 honoring Retry-After.
async function fetchSizePolite(url, attemptsLeft) {
  const result = await fetchSize(url, 5);
  if ((result.status === 429 || result.status === 503) && attemptsLeft > 0) {
    const retryAfter = Number(result.headers['retry-after']);
    await sleep(Number.isFinite(retryAfter) ? retryAfter * 1000 : 5000);
    return fetchSizePolite(url, attemptsLeft - 1);
  }
  return result;
}

async function main() {
  const allFiles = walk(SITE_DIR, []);
  const files = allFiles.filter((f) => !path.basename(f).startsWith('.'));
  const skipped = allFiles.length - files.length;

  console.log(`\nLive upload verification against ${BASE_URL}`);
  console.log(`Comparing ${files.length} file(s) in ${path.relative('.', SITE_DIR)}/ with the server` +
    (skipped > 0 ? ` (${skipped} dotfile(s) skipped, blocked by the server on purpose)` : '') + `...\n`);

  for (const file of files) {
    const rel = path.relative(SITE_DIR, file).replace(/\\/g, '/');
    const expected = fs.statSync(file).size;
    checkedFiles++;

    let result;
    try {
      result = await fetchSizePolite(`${BASE_URL}/${encodeURI(rel)}`, 3);
    } catch (e) {
      console.error(`  FAIL ${rel}: ${e.message}`);
      failures++;
      continue;
    }
    await sleep(250);

    if (result.status !== 200) {
      console.error(`  FAIL ${rel}: HTTP ${result.status} (expected 200, ${expected} bytes)`);
      failures++;
    } else if (result.bytes !== expected) {
      const note = result.bytes === 0 ? ' - served as 0 bytes, the upload truncated this file' : '';
      console.error(`  FAIL ${rel}: served ${result.bytes} bytes, expected ${expected}${note}`);
      failures++;
    } else {
      console.log(`  ok   ${rel} (${expected} bytes)`);
    }
  }

  console.log(`\n${checkedFiles} file(s) checked.`);
  if (failures > 0) {
    console.error(`\n${failures} mismatch(es) found - re-upload deploy/ and run this script again.`);
    process.exit(1);
  }
  console.log('Every served file matches the build byte-for-byte.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
