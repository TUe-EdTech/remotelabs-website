#!/usr/bin/env node
// Source-consistency checks for the Remote Labs website.
// Guards the security/robustness improvements (no inline scripts, no onclick
// handlers, CSP without 'unsafe-inline' in script-src, consistent asset
// versioning). Run with: npm test

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const PAGES = ['index.html', 'privacy.html', 'feedback.html', 'online-learning.html'];

let failures = 0;

function fail(file, msg) {
    console.error('  FAIL ' + file + ': ' + msg);
    failures++;
}

function assertSyntax(file) {
    try {
        execSync('node --check ' + file, { cwd: ROOT, stdio: 'pipe' });
        console.log('  ok   ' + file + ' parses');
    } catch (e) {
        fail(file, 'syntax error - ' + (e.stderr || e.message).toString().split('\n')[0]);
    }
}

console.log('\nJS syntax checks:');
['script.js', 'sw.js', 'build.js', 'test.js'].forEach(assertSyntax);

console.log('\nHTML consistency checks:');
for (const page of PAGES) {
    const file = path.join(ROOT, page);
    if (!fs.existsSync(file)) { fail(page, 'missing'); continue; }
    const html = fs.readFileSync(file, 'utf8');

    // No inline event handler attributes (onclick, onload, onerror, etc.)
    const handlers = html.match(/\son[a-z]+="/gi);
    if (handlers) fail(page, handlers.length + ' inline event handler(s) found (e.g. onclick)');

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
            console.log('  ok   ' + page + ' script-src has no unsafe-inline');
        }
    }

    // Email links must be real mailto: (not href="#")
    const emailLinks = html.match(/k\.m\.a\.aarts@tue\.nl/g) || [];
    const mailtoLinks = html.match(/mailto:k\.m\.a\.aarts@tue\.nl/g) || [];
    if (emailLinks.length && mailtoLinks.length === 0) {
        fail(page, 'email address present but no mailto: link');
    }
}

console.log('\nVersion consistency checks:');
const versionPath = path.join(ROOT, '../VERSION');
if (fs.existsSync(versionPath)) {
    const versionData = fs.readFileSync(versionPath, 'utf8');
    const cacheMatch = versionData.match(/CACHE_NAME=(v\d+\.\d+\.\d+)/);
    const assetMatch = versionData.match(/ASSET_VERSION=(v\d+\.\d+\.\d+)/);
    const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    const swCache = sw.match(/const CACHE_NAME = 'remotelabs-v(\d+\.\d+\.\d+)'/);
    const swAsset = sw.match(/const ASSET_VERSION = '(\d+\.\d+\.\d+)'/);

    if (cacheMatch && swCache && cacheMatch[1].substring(1) !== swCache[1]) {
        fail('sw.js', 'CACHE_NAME (' + swCache[1] + ') != VERSION (' + cacheMatch[1] + ')');
    }
    if (assetMatch && swAsset && assetMatch[1].substring(1) !== swAsset[1]) {
        fail('sw.js', 'ASSET_VERSION (' + swAsset[1] + ') != VERSION (' + assetMatch[1] + ')');
    }
    if (cacheMatch && swCache && assetMatch && swAsset) {
        console.log('  ok   VERSION/sw.js cache (' + swCache[1] + ') and asset (' + swAsset[1] + ') versions match');
    }

    // index.html asset references must match VERSION (catches "bumped
    // VERSION but did not run the build" before deploy/ is involved).
    if (assetMatch) {
        const expected = '?v=' + assetMatch[1].substring(1);
        const refs = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(/\?v=[\d.]+/g) || [];
        const bad = refs.filter(r => r !== expected);
        if (refs.length === 0) {
            fail('index.html', 'no ?v= asset references found');
        } else if (bad.length) {
            fail('index.html', 'asset references ' + bad[0] + ' != VERSION (' + expected + ') - run npm run build:full to sync');
        } else {
            console.log('  ok   index.html asset references match VERSION (' + refs.length + ' refs)');
        }
    }

    // deploy/ artifacts must carry the same version as the source.
    // CI regenerates deploy/ from source on every run, so committed
    // drift means someone pushed source changes (or a VERSION bump)
    // without rebuilding and committing deploy/.
    if (assetMatch) {
        const deployIndex = path.join(ROOT, '../deploy/index.html');
        if (fs.existsSync(deployIndex)) {
            const expected = '?v=' + assetMatch[1].substring(1);
            const refs = fs.readFileSync(deployIndex, 'utf8').match(/\?v=[\d.]+/g) || [];
            const bad = refs.filter(r => r !== expected);
            if (refs.length === 0) {
                fail('../deploy/index.html', 'no ?v= asset references found');
            } else if (bad.length) {
                fail('../deploy/index.html', 'asset references ' + bad[0] + ' != VERSION (' + expected + ') - run npm run build:full and commit deploy/');
            } else {
                console.log('  ok   deploy/index.html asset references match VERSION (' + refs.length + ' refs)');
            }
        }
    }
    if (cacheMatch) {
        const deploySw = path.join(ROOT, '../deploy/sw.js');
        if (fs.existsSync(deploySw)) {
            const swdCache = fs.readFileSync(deploySw, 'utf8').match(/const CACHE_NAME = 'remotelabs-v(\d+\.\d+\.\d+)'/);
            if (!swdCache) {
                fail('../deploy/sw.js', 'CACHE_NAME not found');
            } else if (swdCache[1] !== cacheMatch[1].substring(1)) {
                fail('../deploy/sw.js', 'CACHE_NAME (' + swdCache[1] + ') != VERSION (' + cacheMatch[1] + ') - run npm run build:full and commit deploy/');
            } else {
                console.log('  ok   deploy/sw.js CACHE_NAME matches VERSION');
            }
        }
    }
} else {
    console.log('  --   VERSION file not found, skipping version checks');
}

// Campaign pages must stay out of search: noindex meta in the page and
// no entry in sitemap.xml (which robots.txt points to). Dropping either
// would silently make ad landing pages indexable.
console.log('\nCampaign noindex checks:');
const CAMPAIGN_PAGES = ['feedback.html', 'online-learning.html'];
for (const page of CAMPAIGN_PAGES) {
    const file = path.join(ROOT, page);
    if (!fs.existsSync(file)) { fail(page, 'missing'); continue; }
    const html = fs.readFileSync(file, 'utf8');
    if (/<meta name="robots" content="noindex, follow">/i.test(html)) {
        console.log('  ok   ' + page + ' has noindex, follow');
    } else {
        fail(page, 'missing <meta name="robots" content="noindex, follow">');
    }
    if (/rel="canonical" href="https:\/\/remote-labs\.eu\/">/i.test(html)) {
        console.log('  ok   ' + page + ' canonical points to the homepage');
    } else {
        fail(page, 'canonical does not point to https://remote-labs.eu/');
    }
}
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
for (const page of CAMPAIGN_PAGES) {
    if (sitemap.includes('remote-labs.eu/' + page)) {
        fail('sitemap.xml', 'campaign page ' + page + ' listed - remove it');
    } else {
        console.log('  ok   sitemap.xml does not list ' + page);
    }
}

console.log('\n' + (failures === 0 ? 'All checks passed.' : failures + ' check(s) failed.'));
process.exit(failures === 0 ? 0 : 1);
