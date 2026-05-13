// scripts/bump-version.js
// Automatically bumps version numbers for caching management
// Run with: node scripts/bump-version.js

const fs = require('fs');
const path = require('path');

console.log('Bumping version numbers for cache invalidation...\n');

try {
    // Step 1: Read current version
    const versionFile = path.join(__dirname, '../VERSION');
    const versionData = fs.readFileSync(versionFile, 'utf8');
    
    // Parse version from file
    const cacheMatch = versionData.match(/CACHE_NAME=(v\d+)/);
    const assetMatch = versionData.match(/ASSET_VERSION=(v\d+)/);
    
    const currentCacheVersion = cacheMatch ? cacheMatch[1] : 'v1';
    const currentAssetVersion = assetMatch ? assetMatch[1] : 'v1';
    
    // Bump version numbers
    const newCacheVersion = `v${parseInt(currentCacheVersion.substring(1)) + 1}`;
    const newAssetVersion = `v${parseInt(currentAssetVersion.substring(1)) + 1}`;
    
    console.log(`Current versions: CACHE_NAME=${currentCacheVersion}, ASSET_VERSION=${currentAssetVersion}`);
    console.log(`New versions:     CACHE_NAME=${newCacheVersion}, ASSET_VERSION=${newAssetVersion}\n`);
    
    // Step 2: Update VERSION file
    fs.writeFileSync(versionFile, `CACHE_NAME=${newCacheVersion}\nASSET_VERSION=${newAssetVersion}\n`);
    console.log('✓ Updated VERSION file');
    
    // Step 3: Update Service Worker
    const swPath = path.join(__dirname, '../production_source/sw.js');
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-\d+'/g, `const CACHE_NAME = 'remotelabs-${newCacheVersion.substring(1)}'`);
    fs.writeFileSync(swPath, swContent);
    console.log('✓ Updated production_source/sw.js');
    
    // Step 4: Update HTML files in production_source
    const htmlFiles = [
        '../production_source/index.html',
        '../production_source/privacy.html'
    ];
    
    for (const htmlFile of htmlFiles) {
        const fullPath = path.join(__dirname, htmlFile);
        if (fs.existsSync(fullPath)) {
            let htmlContent = fs.readFileSync(fullPath, 'utf8');
            
            // Replace version query strings
            htmlContent = htmlContent.replace(/\?v=\d+/g, `?v=${newAssetVersion.substring(1)}`);
            
            // Replace .min.css and .min.js references that don't have version
            htmlContent = htmlContent.replace(/(\.min\.css)("|')/g, `$1?v=${newAssetVersion.substring(1)}$2`);
            htmlContent = htmlContent.replace(/(\.min\.js)("|')/g, `$1?v=${newAssetVersion.substring(1)}$2`);
            
            // Also handle /path/to/file.min.css references
            htmlContent = htmlContent.replace(/(\/\w+\.min\.css)("|')/g, `$1?v=${newAssetVersion.substring(1)}$2`);
            htmlContent = htmlContent.replace(/(\/\w+\.min\.js)("|')/g, `$1?v=${newAssetVersion.substring(1)}$2`);
            
            fs.writeFileSync(fullPath, htmlContent);
            console.log(`✓ Updated ${htmlFile}`);
        } else {
            console.warn(`⚠ File not found: ${htmlFile}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Version bump completed successfully!');
    console.log('='.repeat(60));
    console.log(`\nNew CACHE_NAME: ${newCacheVersion}`);
    console.log(`New ASSET_VERSION: ${newAssetVersion}`);
    console.log('\nNext steps:');
    console.log('  1. Rebuild assets: cd production_source && node build.js');
    console.log('  2. Or manually: npm run build');
    console.log('  3. Copy files to deploy/ folder');
    console.log('  4. Deploy to server');
    console.log('  5. Test in incognito mode to verify cache invalidation');
    
} catch (error) {
    console.error('✗ Error during version bump:', error.message);
    console.error(error.stack);
    process.exit(1);
}
