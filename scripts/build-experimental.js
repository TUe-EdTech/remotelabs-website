#!/usr/bin/env node

/**
 * Build Experimental Layout
 * 
 * This script builds the experimental version and creates a deployable
 * version in the experimental_deploy/ folder, similar to how
 * production_source/ builds to deploy/.
 * 
 * Usage:
 *   node scripts/build-experimental.js
 * 
 * This allows you to preview the final built version of your experimental
 * layout before syncing to production.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generatePartnerLogosHTML: generateLogosHTML } = require('./partner-logos.js');

// Configuration
const REPO_ROOT = path.join(__dirname, '..');
const EXPERIMENTAL_DIR = path.join(REPO_ROOT, 'experimental');
const EXPERIMENTAL_DEPLOY_DIR = path.join(REPO_ROOT, 'experimental_deploy');
const PRODUCTION_DIR = path.join(REPO_ROOT, 'production_source');

// Files to copy directly
const FILES_TO_COPY = [
  'index.html',
  'script.js',
  'styles.css',
  'manifest.json',
  'robots.txt',
  'sitemap.xml'
];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m'
  };
  const color = colors[type] || '';
  const reset = '\x1b[0m';
  console.log(`${color}${type.toUpperCase()}:${reset} ${message}`);
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`, 'info');
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
    const files = fs.readdirSync(srcDir);
    
    for (const file of files) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
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

function minifyCSS() {
  try {
    const src = path.join(EXPERIMENTAL_DIR, 'styles.css');
    const dest = path.join(EXPERIMENTAL_DEPLOY_DIR, 'styles.min.css');
    
    log('Minifying CSS...', 'info');
    execSync(`npx cleancss -o "${dest}" "${src}"`, { stdio: 'inherit' });
    log('CSS minified successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to minify CSS: ${error.message}`, 'error');
    // Copy original if minification fails
    const src = path.join(EXPERIMENTAL_DIR, 'styles.css');
    const dest = path.join(EXPERIMENTAL_DEPLOY_DIR, 'styles.min.css');
    copyFile(src, dest);
    return false;
  }
}

function minifyJS() {
  try {
    const src = path.join(EXPERIMENTAL_DIR, 'script.js');
    const dest = path.join(EXPERIMENTAL_DEPLOY_DIR, 'script.min.js');
    
    log('Minifying JavaScript...', 'info');
    execSync(`npx uglifyjs "${src}" -o "${dest}" -c -m`, { stdio: 'inherit' });
    log('JavaScript minified successfully', 'success');
    return true;
  } catch (error) {
    log(`Failed to minify JavaScript: ${error.message}`, 'error');
    // Copy original if minification fails
    const src = path.join(EXPERIMENTAL_DIR, 'script.js');
    const dest = path.join(EXPERIMENTAL_DEPLOY_DIR, 'script.min.js');
    copyFile(src, dest);
    return false;
  }
}

function generatePartnerLogosHTML() {
  const logosDir = path.join(PRODUCTION_DIR, 'assets', 'images', 'logos', 'partner-logos');
  const htmlPath = path.join(EXPERIMENTAL_DEPLOY_DIR, 'index.html');
  const count = generateLogosHTML(logosDir, htmlPath, log);
  return count >= 0;
}

function updateHTMLReferences() {
  try {
    const htmlPath = path.join(EXPERIMENTAL_DEPLOY_DIR, 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Update CSS reference
    htmlContent = htmlContent.replace(
      /styles\.css/g,
      'styles.min.css?v=exp'
    );
    
    // Update JS reference
    htmlContent = htmlContent.replace(
      /script\.js/g,
      'script.min.js?v=exp'
    );
    
    fs.writeFileSync(htmlPath, htmlContent);
    log('Updated HTML references to minified files', 'success');
    return true;
  } catch (error) {
    log(`Failed to update HTML references: ${error.message}`, 'error');
    return false;
  }
}

function main() {
  log('Building experimental layout...', 'info');
  
  // Check if experimental directory exists
  if (!fs.existsSync(EXPERIMENTAL_DIR)) {
    log(`Experimental directory not found: ${EXPERIMENTAL_DIR}`, 'error');
    process.exit(1);
  }
  
  // Clean experimental_deploy directory
  if (fs.existsSync(EXPERIMENTAL_DEPLOY_DIR)) {
    fs.rmSync(EXPERIMENTAL_DEPLOY_DIR, { recursive: true, force: true });
    log('Cleaned experimental_deploy directory', 'info');
  }
  
  // Create experimental_deploy directory
  ensureDirectory(EXPERIMENTAL_DEPLOY_DIR);
  
  // Copy all files
  log('Copying files...', 'info');
  
  // Copy individual files
  for (const file of FILES_TO_COPY) {
    const src = path.join(EXPERIMENTAL_DIR, file);
    const dest = path.join(EXPERIMENTAL_DEPLOY_DIR, file);
    
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      log(`File not found: ${src}`, 'warning');
    }
  }
  
  // Copy assets directory. Shared assets (fonts, images, videos) live only
  // in production_source/; experimental/ keeps just the extra fontawesome
  // folder. Copy the production assets first, then merge in fontawesome.
  copyDirectory(path.join(PRODUCTION_DIR, 'assets'), path.join(EXPERIMENTAL_DEPLOY_DIR, 'assets'));
  const fontawesomeSrc = path.join(EXPERIMENTAL_DIR, 'assets', 'fontawesome');
  if (fs.existsSync(fontawesomeSrc)) {
    copyDirectory(fontawesomeSrc, path.join(EXPERIMENTAL_DEPLOY_DIR, 'assets', 'fontawesome'));
  }
  
  // Copy icons
  for (const icon of ['icon-192x192.svg', 'icon-512x512.svg']) {
    const src = path.join(REPO_ROOT, icon);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(EXPERIMENTAL_DEPLOY_DIR, icon));
    }
  }
  
  // Copy .htaccess if exists
  const htaccessSrc = path.join(EXPERIMENTAL_DIR, '.htaccess');
  if (fs.existsSync(htaccessSrc)) {
    copyFile(htaccessSrc, path.join(EXPERIMENTAL_DEPLOY_DIR, '.htaccess'));
  }
  
  // Generate partner logos HTML
  log('\nGenerating partner logos...', 'info');
  const logosSuccess = generatePartnerLogosHTML();
  
  // Minify assets
  log('\nMinifying assets...', 'info');
  const cssSuccess = minifyCSS();
  const jsSuccess = minifyJS();
  
  // Update HTML references
  if (cssSuccess || jsSuccess) {
    updateHTMLReferences();
  }
  
  log('\nBuild complete!', 'success');
  log(`\nYour experimental build is ready in: ${path.relative(REPO_ROOT, EXPERIMENTAL_DEPLOY_DIR)}/`, 'success');
  log('Open experimental_deploy/index.html in your browser to preview.', 'info');
  
  if (!fs.existsSync(path.join(EXPERIMENTAL_DIR, '.gitignore'))) {
    log('\nNote: Add "experimental_deploy/" to .gitignore if you want to keep it out of version control.', 'warning');
  }
}

main();
