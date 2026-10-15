#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generatePartnerLogosHTML } = require('../scripts/partner-logos.js');

console.log('Starting build process...\n');

// Step 1: Sync version strings from the VERSION file
// VERSION is the single source of truth. To release, bump it manually
// (PATCH in a normal edit, MAJOR/MINOR deliberately), then run the build:
// it syncs sw.js/index.html/privacy.html here and rebuilds deploy/ from
// the same value, so source and deploy artifacts can never disagree.
// The build does NOT bump versions: CI commits only deploy/, so an
// auto-bump here drifted the deployed version ahead of source (deploy/
// ended up at v2.1.5 while the committed source said v2.1.4).
console.log('Syncing versions from VERSION...');
try {
  const versionPath = path.join(__dirname, '../VERSION');
  let versionData = fs.readFileSync(versionPath, 'utf8');
  const semverRe = /(v\d+\.\d+\.\d+)/;
  const cacheMatch = versionData.match(new RegExp('CACHE_NAME=' + semverRe.source));
  const assetMatch = versionData.match(new RegExp('ASSET_VERSION=' + semverRe.source));
  if (!cacheMatch || !assetMatch) {
    throw new Error('CACHE_NAME/ASSET_VERSION (vMAJOR.MINOR.PATCH) not found in VERSION file');
  }
  const cacheVersion = cacheMatch[1];
  const assetVersion = assetMatch[1];

  // Update Service Worker
  const swPath = path.join(__dirname, 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-v[\d.]+'/g, `const CACHE_NAME = 'remotelabs-${cacheVersion}'`);
  swContent = swContent.replace(/const ASSET_VERSION = '[\d.]+'/g, `const ASSET_VERSION = '${assetVersion.substring(1)}'`);
  fs.writeFileSync(swPath, swContent);

  // Update HTML files
  const htmlFiles = ['index.html', 'privacy.html', 'feedback.html', 'online-learning.html'];
  for (const htmlFile of htmlFiles) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    htmlContent = htmlContent.replace(/\?v=[\d.]+/g, `?v=${assetVersion.substring(1)}`);
    fs.writeFileSync(htmlFile, htmlContent);
  }

  console.log(`✓ Versions synced to ${cacheVersion} (cache) / ${assetVersion} (assets)\n`);
} catch (error) {
  console.error('✗ Version sync failed:', error.message);
  process.exit(1);
}

// Step 2: Build CSS
console.log('Building CSS...');
try {
  // The clean-css package's executable is named `cleancss`, so
  // `npx clean-css` cannot resolve it (this silently shipped a stale
  // styles.min.css for weeks). Use the library API instead, and treat
  // minification failure as fatal so a stale artifact can never ship.
  const CleanCSS = require('clean-css');
  const cssSource = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  const minified = new CleanCSS().minify(cssSource);
  if (minified.errors && minified.errors.length > 0) {
    throw new Error(minified.errors.join('; '));
  }
  fs.writeFileSync(path.join(__dirname, '../deploy/styles.min.css'), minified.styles);
  console.log('✓ CSS minified successfully\n');
} catch (error) {
  console.error('✗ CSS build failed:', error.message);
  process.exit(1);
}

// Step 3: Build JavaScript
console.log('Building JavaScript...');
try {
  execSync('npx uglifyjs script.js -o ../deploy/script.min.js -c -m', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✓ JavaScript minified successfully\n');
} catch (error) {
  console.error('✗ JavaScript build failed:', error.message);
  process.exit(1);
}

// Step 4: Copy HTML files
console.log('Copying HTML and Service Worker files...');
try {
  const filesToCopy = ['index.html', 'privacy.html', 'feedback.html', 'online-learning.html', 'sw.js', 'robots.txt', 'sitemap.xml', '.htaccess'];
  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, '../deploy', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ Source file ${file} not found, skipping`);
    }
  });
  console.log('');
} catch (error) {
  console.error('✗ HTML copy failed:', error.message);
  process.exit(1);
}

// Step 5: Copy icon files
console.log('Copying icon files...');
try {
  const iconFiles = ['icon-192x192.svg', 'icon-512x512.svg'];
  iconFiles.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, '../deploy', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ Icon file ${file} not found, skipping`);
    }
  });
  console.log('');
} catch (error) {
  console.error('✗ Icon copy failed:', error.message);
}

// Step 6: Copy assets folder
console.log('Copying assets folder...');
try {
  const sourceAssets = path.join(__dirname, 'assets');
  const destAssets = path.join(__dirname, '../deploy/assets');
  
  if (fs.existsSync(sourceAssets)) {
    // Remove existing deploy/assets if it exists
    if (fs.existsSync(destAssets)) {
      fs.rmSync(destAssets, { recursive: true, force: true });
    }
    
    // Copy entire assets folder recursively
    fs.cpSync(sourceAssets, destAssets, { recursive: true });
    console.log('✓ Copied assets folder');
  } else {
    console.warn('⚠ Source assets folder not found, skipping');
  }
  console.log('');
} catch (error) {
  console.error('✗ Assets copy failed:', error.message);
}

// Step 7: Generate partner logos HTML
console.log('Generating partner logos...');
try {
  const logosDir = path.join(__dirname, 'assets', 'images', 'logos', 'partner-logos');
  const htmlPath = path.join(__dirname, '../deploy/index.html');
  const count = generatePartnerLogosHTML(logosDir, htmlPath);
  console.log('');
} catch (error) {
  console.error('✗ Partner logos generation failed:', error.message);
}

console.log('Build completed successfully! ✓');
console.log('\nGenerated files:');
console.log('  - deploy/styles.min.css');
console.log('  - deploy/script.min.js');
console.log('  - deploy/index.html');
console.log('  - deploy/privacy.html');
console.log('  - deploy/feedback.html / online-learning.html (campaign pages)');
console.log('  - deploy/sw.js');
console.log('  - deploy/icon-192x192.png (or .svg)');
console.log('  - deploy/icon-512x512.png (or .svg)');
console.log('  - deploy/assets/');
console.log('\n⚠️  REMEMBER: Deploy to server for changes to take effect!');
console.log('   Test in incognito mode to verify cache invalidation.');
