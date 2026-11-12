#!/usr/bin/env node

/**
 * Shared partner-logo HTML generation.
 *
 * Reads image files from a partner-logos directory, generates <a>/<img>
 * markup for each, and injects it into the #partnerLogos placeholder in
 * the given HTML file. Used by both production_source/build.js and
 * scripts/build-experimental.js to avoid duplicating the logic.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PARTNER_URL_MAP = {
    'tue': 'https://www.tue.nl/en/',
    'avans': 'https://www.avans.nl/',
    'eires': 'https://www.tue.nl/en/research/institutes/eindhoven-institute-for-renewable-energy-systems/research',
    'mnext': 'https://www.mnext.nl/',
    'summa': 'https://summa-onderwijs.nl/',
    'zpnu': 'https://zp.edu.ua/en/',
    'fontys': 'https://www.fontys.nl/'
};

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];

/**
 * Look up a partner URL for a logo filename.
 * Prefers an exact filename match; falls back to a guarded substring
 * match so unrelated logos don't get mis-linked.
 */
function getPartnerLink(filename) {
    let href = '#';
    const lowerName = filename.toLowerCase();
    if (PARTNER_URL_MAP[lowerName]) {
        href = PARTNER_URL_MAP[lowerName];
    } else {
        for (const [key, url] of Object.entries(PARTNER_URL_MAP)) {
            if (lowerName.includes(key)) {
                href = url;
                break;
            }
        }
    }
    return href;
}

/**
 * Resolve the asset version to append to logo URLs. Explicit argument
 * wins; otherwise read ASSET_VERSION from the root VERSION file; empty
 * string when neither is available (URL stays unversioned).
 */
function resolveAssetVersion(version) {
    if (version) return version;
    try {
        const data = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8');
        const m = data.match(/ASSET_VERSION=v([\d.]+)/);
        if (m) return m[1];
    } catch (e) { /* fall through */ }
    return '';
}

/**
 * Generate partner-logo HTML and inject it into the #partnerLogos
 * placeholder in the given HTML file.
 *
 * @param {string} logosDir - Absolute path to the partner-logos directory.
 * @param {string} htmlPath - Absolute path to the HTML file to update.
 * @param {function} [log] - Optional logger function (msg, type).
 * @param {string} [version] - Asset version for the ?v= query string
 *   (defaults to ASSET_VERSION from the root VERSION file).
 * @returns {number} Number of logos generated, or -1 if skipped.
 */
function generatePartnerLogosHTML(logosDir, htmlPath, log, version) {
    function logger(msg, type) {
        if (log) log(msg, type);
        else console.log((type ? type.toUpperCase() + ': ' : '') + msg);
    }

    if (!fs.existsSync(logosDir)) {
        logger('Partner logos directory not found, skipping logo generation', 'warning');
        return -1;
    }

    const logoFiles = fs.readdirSync(logosDir)
        .filter(file => SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    if (logoFiles.length === 0) {
        logger('No logo files found in partner-logos directory, skipping', 'warning');
        return -1;
    }

    const v = resolveAssetVersion(version);
    const vQuery = v ? `?v=${v}` : '';

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const logoHTML = logoFiles.map(file => {
        const filename = path.parse(file).name;
        const src = `assets/images/logos/partner-logos/${file}${vQuery}`;
        const alt = filename.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const href = getPartnerLink(filename);

        return `                                <a href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${alt}">
                                    <img src="${src}" alt="${alt}" class="partner-logo" width="120" height="40" loading=\"lazy\" decoding=\"async\">
                                </a>`;
    }).join('\n');

    htmlContent = htmlContent.replace(
        /<div class="partner-logos" id="partnerLogos">[\s\S]*?<\/div>/,
        `<div class="partner-logos" id="partnerLogos">\n${logoHTML}\n                            </div>`
    );

    fs.writeFileSync(htmlPath, htmlContent);
    logger(`Generated HTML for ${logoFiles.length} partner logos`, 'success');
    return logoFiles.length;
}

module.exports = { generatePartnerLogosHTML, getPartnerLink, PARTNER_URL_MAP };
