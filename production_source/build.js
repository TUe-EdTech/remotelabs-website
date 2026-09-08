#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generatePartnerLogosHTML } = require('../scripts/partner-logos.js');

console.log('Starting build process...\n');

// Step 1: Bump version
console.log('Bumping version...');
try {
  const versionPath = path.join(__dirname, '../VERSION');
  let versionData = fs.readFileSync(versionPath, 'utf8');
  // Semantic versioning: vMAJOR.MINOR.PATCH (e.g. v2.1.0).
  // The build only auto-bumps the PATCH number. MAJOR and MINOR bumps are
  // done manually in the VERSION file when directed.
  const semverRe = /(v\d+\.\d+\.\d+)/;
  const cacheMatch = versionData.match(new RegExp('CACHE_NAME=' + semverRe.source));
  const assetMatch = versionData.match(new RegExp('ASSET_VERSION=' + semverRe.source));

  function bumpPatch(v) {
    const parts = v.substring(1).split('.').map(Number);
    return `v${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }

  const currentCacheVersion = cacheMatch ? cacheMatch[1] : 'v2.1.0';
  const currentAssetVersion = assetMatch ? assetMatch[1] : 'v2.1.0';
  const newCacheVersion = bumpPatch(currentCacheVersion);
  const newAssetVersion = bumpPatch(currentAssetVersion);

  // Update VERSION file
  fs.writeFileSync(versionPath, `CACHE_NAME=${newCacheVersion}\nASSET_VERSION=${newAssetVersion}\n`);

  // Update Service Worker
  const swPath = path.join(__dirname, 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-v[\d.]+'/g, `const CACHE_NAME = 'remotelabs-${newCacheVersion}'`);
  swContent = swContent.replace(/const ASSET_VERSION = '[\d.]+'/g, `const ASSET_VERSION = '${newAssetVersion.substring(1)}'`);
  fs.writeFileSync(swPath, swContent);

  // Update HTML files
  const htmlFiles = ['index.html', 'privacy.html'];
  for (const htmlFile of htmlFiles) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    htmlContent = htmlContent.replace(/\?v=[\d.]+/g, `?v=${newAssetVersion.substring(1)}`);
    fs.writeFileSync(htmlFile, htmlContent);
  }

  console.log(`✓ Version bumped to ${newCacheVersion} (cache) / ${newAssetVersion} (assets)\n`);
} catch (error) {
  console.warn('⚠ Version bump skipped (no VERSION file found):', error.message);
}

// Step 2: Build CSS
console.log('Building CSS...');
try {
  execSync('npx clean-css -o ../deploy/styles.min.css styles.css', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✓ CSS minified successfully\n');
} catch (error) {
  console.error('✗ CSS build failed:', error.message);
  console.log('  Falling back to copying existing minified CSS...');
  try {
    if (fs.existsSync(path.join(__dirname, '../deploy/styles.min.css'))) {
      console.log('  ✓ Using existing minified CSS');
    } else {
      console.error('  ✗ No existing minified CSS found');
    }
  } catch (fallbackError) {
    console.error('  ✗ Fallback failed:', fallbackError.message);
  }
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
  console.log('  Falling back to copying existing minified JS...');
  try {
    if (fs.existsSync(path.join(__dirname, '../deploy/script.min.js'))) {
      console.log('  ✓ Using existing minified JavaScript');
    } else {
      console.error('  ✗ No existing minified JavaScript found');
    }
  } catch (fallbackError) {
    console.error('  ✗ Fallback failed:', fallbackError.message);
  }
}

// Step 4: Copy HTML files
console.log('Copying HTML and Service Worker files...');
try {
  const filesToCopy = ['index.html', 'privacy.html', 'sw.js', 'robots.txt', 'sitemap.xml', '.htaccess'];
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
console.log('  - deploy/sw.js');
console.log('  - deploy/icon-192x192.png (or .svg)');
console.log('  - deploy/icon-512x512.png (or .svg)');
console.log('  - deploy/assets/');
console.log('\n⚠️  REMEMBER: Deploy to server for changes to take effect!');
console.log('   Test in incognito mode to verify cache invalidation.');
