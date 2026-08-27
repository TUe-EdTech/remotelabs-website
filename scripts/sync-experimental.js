#!/usr/bin/env node

/**
 * Sync Experimental Layout to Production
 * 
 * This script synchronizes changes from the experimental/ folder to production_source/
 * and optionally builds and deploys to the deploy/ folder.
 * 
 * Usage:
 *   node scripts/sync-experimental.js [options]
 * 
 * Options:
 *   --dry-run       Show what would be copied without actually copying
 *   --build         Also run npm build after syncing
 *   --deploy        Also copy to deploy/ folder after building
 *   --exp-build     Build experimental to experimental_deploy/ folder
 *   --force         Overwrite without confirmation
 *   --all          Sync all files (including deleted files)
 *   --interactive   Ask for confirmation for each file (default for new files)
 * 
 * Examples:
 *   node scripts/sync-experimental.js --dry-run
 *   node scripts/sync-experimental.js --build --deploy
 *   node scripts/sync-experimental.js --exp-build
 *   node scripts/sync-experimental.js --force
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPO_ROOT = path.join(__dirname, '..');
const EXPERIMENTAL_DIR = path.join(REPO_ROOT, 'experimental');
const EXPERIMENTAL_DEPLOY_DIR = path.join(REPO_ROOT, 'experimental_deploy');
const PRODUCTION_DIR = path.join(REPO_ROOT, 'production_source');
const DEPLOY_DIR = path.join(REPO_ROOT, 'deploy');

// File patterns to sync (default: all files)
const DEFAULT_PATTERNS = ['**/*'];

// Files to exclude from sync
const EXCLUDED_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'node_modules',
  '.git',
  '*.log',
  '*.tmp'
];

// Files that require manual version updates
const VERSIONED_FILES = [
  'sw.js',
  'index.html',
  'privacy.html'
];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    bold: '\x1b[1m'
  };
  const color = colors[type] || '';
  const reset = '\x1b[0m';
  console.log(`${color}${type.toUpperCase()}:${reset} ${message}`);
}

function isExcluded(filePath) {
  return EXCLUDED_FILES.some(excluded => 
    filePath.includes(excluded) || 
    filePath.includes(path.join('node_modules'))
  );
}

function getAllFiles(dir, baseDir = dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (isExcluded(relativePath)) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, baseDir, fileList);
    } else {
      fileList.push(relativePath);
    }
  }
  
  return fileList;
}

function shouldSyncFile(filePath) {
  // Always sync these file types
  const alwaysSyncExtensions = ['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.txt', '.xml', '.htaccess'];
  
  return alwaysSyncExtensions.some(ext => filePath.endsWith(ext));
}

function getFilesToSync(experimentalFiles, productionFiles) {
  const toSync = [];
  
  for (const file of experimentalFiles) {
    if (!shouldSyncFile(file)) {
      continue;
    }
    
    const experimentalPath = path.join(EXPERIMENTAL_DIR, file);
    const productionPath = path.join(PRODUCTION_DIR, file);
    
    const experimentalStat = fs.statSync(experimentalPath);
    const productionExists = productionFiles.includes(file);
    
    if (!productionExists) {
      // New file in experimental
      toSync.push({
        file,
        status: 'new',
        experimentalPath,
        productionPath
      });
    } else {
      // Check if modified
      const productionStat = fs.statSync(productionPath);
      const experimentalMtime = experimentalStat.mtime.getTime();
      const productionMtime = productionStat.mtime.getTime();
      
      if (experimentalMtime > productionMtime) {
        toSync.push({
          file,
          status: 'modified',
          experimentalPath,
          productionPath
        });
      }
    }
  }
  
  return toSync;
}

function copyFile(src, dest, dryRun = false) {
  if (dryRun) {
    log(`[DRY RUN] Would copy: ${src} -> ${dest}`, 'info');
    return true;
  }
  
  try {
    // Ensure directory exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(src, dest);
    log(`Copied: ${src} -> ${dest}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to copy ${src}: ${error.message}`, 'error');
    return false;
  }
}

function runBuild(dryRun = false) {
  if (dryRun) {
    log('[DRY RUN] Would run: npm run build in production_source/', 'info');
    return true;
  }
  
  try {
    log('Running build process...', 'info');
    
    // Change to production_source directory
    const originalDir = process.cwd();
    process.chdir(PRODUCTION_DIR);
    
    // Run build
    execSync('npm run build', { stdio: 'inherit' });
    
    process.chdir(originalDir);
    
    log('Build completed successfully!', 'success');
    return true;
  } catch (error) {
    log(`Build failed: ${error.message}`, 'error');
    return false;
  }
}

function buildExperimentalDeploy(dryRun = false) {
  if (dryRun) {
    log('[DRY RUN] Would build experimental to experimental_deploy/', 'info');
    return true;
  }
  
  try {
    log('Building experimental to experimental_deploy/...', 'info');
    
    // Run the build-experimental script
    const originalDir = process.cwd();
    process.chdir(REPO_ROOT);
    
    execSync('node scripts/build-experimental.js', { stdio: 'inherit' });
    
    process.chdir(originalDir);
    
    log('Experimental build complete!', 'success');
    return true;
  } catch (error) {
    log(`Failed to build experimental: ${error.message}`, 'error');
    return false;
  }
}

function copyToDeploy(dryRun = false) {
  if (dryRun) {
    log('[DRY RUN] Would copy built files to deploy/', 'info');
    return true;
  }
  
  try {
    log('Copying built files to deploy/...', 'info');
    
    // Copy key files from production_source to deploy
    const filesToCopy = [
      'index.html',
      'privacy.html',
      'styles.min.css',
      'script.min.js',
      'sw.js',
      'manifest.json',
      'robots.txt',
      'sitemap.xml',
      '.htaccess'
    ];
    
    for (const file of filesToCopy) {
      const src = path.join(PRODUCTION_DIR, file);
      const dest = path.join(DEPLOY_DIR, file);
      
      if (fs.existsSync(src)) {
        copyFile(src, dest, false);
      } else {
        log(`File not found: ${src}`, 'warning');
      }
    }
    
    // Copy assets directory
    const assetsSrc = path.join(PRODUCTION_DIR, 'assets');
    const assetsDest = path.join(DEPLOY_DIR, 'assets');
    
    if (fs.existsSync(assetsSrc)) {
      // Remove old assets
      if (fs.existsSync(assetsDest)) {
        fs.rmSync(assetsDest, { recursive: true, force: true });
      }
      
      // Copy new assets
      fs.cpSync(assetsSrc, assetsDest, { recursive: true });
      log(`Copied assets/ directory`, 'success');
    }
    
    log('Deploy files updated!', 'success');
    return true;
  } catch (error) {
    log(`Failed to copy to deploy: ${error.message}`, 'error');
    return false;
  }
}

function checkVersionedFiles(filesToSync) {
  const versionedFilesInSync = filesToSync.filter(f => 
    VERSIONED_FILES.includes(f.file) || VERSIONED_FILES.includes(path.basename(f.file))
  );
  
  if (versionedFilesInSync.length > 0) {
    log('\n⚠️  VERSION UPDATE REMINDER', 'warning');
    log('The following files are being synced and may require version updates:', 'warning');
    versionedFilesInSync.forEach(f => log(`  - ${f.file}`, 'warning'));
    log('\nRemember to update:', 'warning');
    log('  1. CACHE_NAME in sw.js', 'warning');
    log('  2. Version query strings (?v=X) in HTML files', 'warning');
    log('  3. Service worker version in manifest.json (if applicable)\n', 'warning');
  }
}

function promptConfirmation(message) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    build: args.includes('--build'),
    deploy: args.includes('--deploy'),
    expBuild: args.includes('--exp-build'),
    force: args.includes('--force'),
    all: args.includes('--all'),
    interactive: args.includes('--interactive')
  };
  
  log('Starting experimental sync...', 'info');
  log(`Options: dry-run=${options.dryRun}, build=${options.build}, deploy=${options.deploy}, force=${options.force}`, 'info');
  
  // Check if experimental directory exists
  if (!fs.existsSync(EXPERIMENTAL_DIR)) {
    log(`Experimental directory not found: ${EXPERIMENTAL_DIR}`, 'error');
    process.exit(1);
  }
  
  // Check if production_source directory exists
  if (!fs.existsSync(PRODUCTION_DIR)) {
    log(`Production directory not found: ${PRODUCTION_DIR}`, 'error');
    process.exit(1);
  }
  
  // Get all files
  log('Scanning experimental directory...', 'info');
  const experimentalFiles = getAllFiles(EXPERIMENTAL_DIR);
  const productionFiles = getAllFiles(PRODUCTION_DIR);
  
  log(`Found ${experimentalFiles.length} files in experimental/`, 'info');
  log(`Found ${productionFiles.length} files in production_source/`, 'info');
  
  // Get files to sync
  const filesToSync = getFilesToSync(experimentalFiles, productionFiles);
  
  if (filesToSync.length === 0) {
    log('No files need to be synced. Everything is up to date!', 'success');
    
    if (options.build) {
      await runBuild(options.dryRun);
      if (options.deploy) {
        await copyToDeploy(options.dryRun);
      }
    }
    
    process.exit(0);
  }
  
  log(`\n${filesToSync.length} file(s) to sync:`, 'info');
  filesToSync.forEach(f => {
    log(`  [${f.status}] ${f.file}`, 'info');
  });
  
  // Check for versioned files
  checkVersionedFiles(filesToSync);
  
  // Prompt for confirmation if not force mode
  if (!options.force && !options.dryRun) {
    const confirmed = await promptConfirmation('\nDo you want to sync these files to production_source?');
    if (!confirmed) {
      log('Sync cancelled.', 'warning');
      process.exit(0);
    }
  }
  
  // Sync files
  log('\nSyncing files...', 'info');
  let allSuccess = true;
  
  for (const { experimentalPath, productionPath, file } of filesToSync) {
    // Check interactive mode
    if (options.interactive && !options.force) {
      const confirmed = await promptConfirmation(`Copy ${file}?`);
      if (!confirmed) {
        log(`Skipped: ${file}`, 'warning');
        continue;
      }
    }
    
    const success = copyFile(experimentalPath, productionPath, options.dryRun);
    if (!success) {
      allSuccess = false;
    }
  }
  
  if (!allSuccess) {
    log('\nSome files failed to sync.', 'error');
    process.exit(1);
  }
  
  log('\nFiles synced successfully!', 'success');
  
  // Run build if requested
  if (options.build) {
    const buildSuccess = await runBuild(options.dryRun);
    if (!buildSuccess) {
      process.exit(1);
    }
  }
  
  // Build experimental if requested
  if (options.expBuild) {
    const expBuildSuccess = await buildExperimentalDeploy(options.dryRun);
    if (!expBuildSuccess) {
      process.exit(1);
    }
  }

  // Deploy if requested
  if (options.deploy && options.build) {
    const deploySuccess = await copyToDeploy(options.dryRun);
    if (!deploySuccess) {
      process.exit(1);
    }
  } else if (options.deploy && !options.build) {
    log('Warning: --deploy requires --build. Skipping deploy.', 'warning');
  }
  
  log('\nSync complete!', 'success');
  
  if (!options.dryRun) {
    log('\nNext steps:', 'info');
    if (!options.build) {
      log('  Run: npm run build (in production_source/)', 'info');
    }
    if (!options.deploy) {
      log('  Run: Copy built files to deploy/', 'info');
    }
    log('  Update version numbers if needed', 'info');
    log('  Test in deploy/index.html', 'info');
  }
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
