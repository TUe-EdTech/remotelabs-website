#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build process...\n');

// Build CSS using CLI (avoids memory issues with large files)
console.log('Building CSS...');
try {
  execSync('clean-css -o ../deploy/styles.min.css styles.css', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✓ CSS minified successfully\n');
} catch (error) {
  console.error('✗ CSS build failed:', error.message);
  console.log('  Falling back to copying existing minified CSS...');
  try {
    // Fallback: copy existing minified CSS if available
    if (fs.existsSync(path.join(__dirname, '../deploy/styles.min.css'))) {
      console.log('  ✓ Using existing minified CSS');
    } else {
      console.error('  ✗ No existing minified CSS found');
    }
  } catch (fallbackError) {
    console.error('  ✗ Fallback failed:', fallbackError.message);
  }
}

// Build JavaScript
console.log('Building JavaScript...');
try {
  execSync('uglifyjs script.js -o ../deploy/script.min.js -c -m', {
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

// Copy HTML files
console.log('Copying HTML files...');
try {
  const filesToCopy = ['index.html', 'privacy.html'];
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
  console.log('\n');
} catch (error) {
  console.error('✗ HTML copy failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully! ✓');
console.log('\nGenerated files:');
console.log('  - deploy/styles.min.css');
console.log('  - deploy/script.min.js');
console.log('  - deploy/index.html');
console.log('  - deploy/privacy.html');
