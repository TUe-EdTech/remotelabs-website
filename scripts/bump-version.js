// scripts/bump-version.js
// Automatically bumps version numbers for caching management
// Run with: node scripts/bump-version.js
// Note: This now delegates to the main build script which handles version bumping

const { execSync } = require('child_process');
const path = require('path');

console.log('Bumping version numbers for cache invalidation...\n');
console.log('Running full build process (includes version bump)...\n');

try {
  // Execute the main build script which handles version bumping and all build steps
  execSync('node production_source/build.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('Version bump and build completed successfully!');
  console.log('='.repeat(60));
  console.log('\nThe build script has:');
  console.log('  - Bumped version numbers in VERSION file');
  console.log('  - Updated Service Worker with new cache name');
  console.log('  - Updated HTML files with new asset versions');
  console.log('  - Minified CSS and JavaScript');
  console.log('  - Copied all files to deploy/ folder');
  console.log('\nNext steps:');
  console.log('  1. Deploy to server for changes to take effect');
  console.log('  2. Test in incognito mode to verify cache invalidation');
  
} catch (error) {
  console.error('\n✗ Error during version bump and build:', error.message);
  if (error.stdout) console.error(error.stdout);
  if (error.stderr) console.error(error.stderr);
  process.exit(1);
}
