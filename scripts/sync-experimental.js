#!/usr/bin/env node
// Sync changes from experimental/ into production_source/, with optional
// build/deploy steps. Use this after a redesign is approved in the
// experimental sandbox (built with scripts/build-experimental.js).
//
// Usage:
//   node scripts/sync-experimental.js [options]
//
// Options:
//   --dry-run       Show what would be copied without actually copying
//   --build         Also run the canonical build (npm run build:full)
//   --deploy        Also copy the built files to deploy/ (requires --build)
//   --exp-build     Also build experimental/ to experimental_deploy/
//   --force         Overwrite without confirmation
//   --all           (accepted for compatibility; all eligible files sync)
//   --interactive   Ask for confirmation for each file
//
// Examples:
//   node scripts/sync-experimental.js --dry-run
//   node scripts/sync-experimental.js --build --deploy
//   node scripts/sync-experimental.js --exp-build
//   node scripts/sync-experimental.js --force

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { execSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const EXPERIMENTAL_DIR = path.join(REPO_ROOT, 'experimental');
const PRODUCTION_DIR = path.join(REPO_ROOT, 'production_source');
const DEPLOY_DIR = path.join(REPO_ROOT, 'deploy');

// Junk files that are never synced.
const EXCLUDED_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'node_modules',
  '.git',
  '*.log',
  '*.tmp'
];

// Files whose version strings are synced from the VERSION file by the build;
// syncing them is a reminder to re-run the build, not a manual edit.
const VERSIONED_FILES = ['sw.js', 'index.html', 'privacy.html'];

// Only these file types are eligible for syncing.
const SYNCABLE_EXTENSIONS = ['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.txt', '.xml', '.htaccess'];

function log(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    build: argv.includes('--build'),
    deploy: argv.includes('--deploy'),
    expBuild: argv.includes('--exp-build'),
    force: argv.includes('--force'),
    all: argv.includes('--all'),
    interactive: argv.includes('--interactive')
  };
}

function isExcluded(relativePath) {
  return EXCLUDED_FILES.some((excluded) => {
    if (excluded.startsWith('*.')) {
      return relativePath.endsWith(excluded.substring(1));
    }
    return relativePath.includes(excluded);
  });
}

function getFileHash(filePath) {
  return crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest('hex');
}

function getAllFiles(dir, baseDir = dir, fileList = []) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const relativePath = path.relative(baseDir, fullPath);
    if (isExcluded(relativePath)) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, baseDir, fileList);
    } else {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

function isSyncable(file) {
  return SYNCABLE_EXTENSIONS.some((ext) => file.endsWith(ext));
}

// Diff experimental/ against production_source/ by content hash and return
// the files that are new or modified.
function getFilesToSync(experimentalFiles, productionFiles) {
  const toSync = [];
  for (const file of experimentalFiles) {
    if (!isSyncable(file)) continue;
    const experimentalPath = path.join(EXPERIMENTAL_DIR, file);
    const productionPath = path.join(PRODUCTION_DIR, file);
    if (!productionFiles.has(file)) {
      toSync.push({ file, status: 'new', experimentalPath, productionPath });
    } else if (getFileHash(experimentalPath) !== getFileHash(productionPath)) {
      toSync.push({ file, status: 'modified', experimentalPath, productionPath });
    }
  }
  return toSync;
}

function copyFile(src, dest, dryRun = false) {
  if (dryRun) {
    log(`[DRY RUN] Would copy: ${path.relative(REPO_ROOT, src)} -> ${path.relative(REPO_ROOT, dest)}`);
    return true;
  }
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    log(`Copied: ${path.relative(REPO_ROOT, src)} -> ${path.relative(REPO_ROOT, dest)}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to copy ${src}: ${error.message}`, 'error');
    return false;
  }
}

function runCommand(command, cwd, dryRun, dryRunMessage) {
  if (dryRun) {
    log(`[DRY RUN] Would run: ${dryRunMessage}`);
    return true;
  }
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Command failed (${command}): ${error.message}`, 'error');
    return false;
  }
}

function runBuild(dryRun) {
  log('Running build process...');
  // Canonical build: build.js syncs VERSION, minifies via the library APIs,
  // and regenerates deploy/ including assets and partner logos.
  const okRun = runCommand('npm run build:full', PRODUCTION_DIR, dryRun, 'npm run build:full in production_source/');
  if (okRun && !dryRun) log('Build completed successfully!', 'success');
  return okRun;
}

function buildExperimentalDeploy(dryRun) {
  log('Building experimental to experimental_deploy/...');
  const okRun = runCommand('node scripts/build-experimental.js', REPO_ROOT, dryRun, 'node scripts/build-experimental.js');
  if (okRun && !dryRun) log('Experimental build complete!', 'success');
  return okRun;
}

// Copy the built production files into deploy/. The minified
// styles.min.css / script.min.js are build outputs written straight into
// deploy/ by `npm run build:full` (which --deploy implies via --build), so
// they are not copied from production_source/ here.
function copyToDeploy(dryRun) {
  log('Copying built files to deploy/...');
  const filesToCopy = [
    'index.html',
    'privacy.html',
    'sw.js',
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    '.htaccess'
  ];
  for (const file of filesToCopy) {
    const src = path.join(PRODUCTION_DIR, file);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(DEPLOY_DIR, file), dryRun);
    } else {
      log(`File not found: ${path.relative(REPO_ROOT, src)}`, 'warning');
    }
  }
  const assetsSrc = path.join(PRODUCTION_DIR, 'assets');
  const assetsDest = path.join(DEPLOY_DIR, 'assets');
  if (fs.existsSync(assetsSrc)) {
    if (dryRun) {
      log('[DRY RUN] Would replace deploy/assets with production_source/assets');
    } else {
      if (fs.existsSync(assetsDest)) {
        fs.rmSync(assetsDest, { recursive: true, force: true });
      }
      fs.cpSync(assetsSrc, assetsDest, { recursive: true });
      log('Copied assets/ directory', 'success');
    }
  }
  if (!dryRun) log('Deploy files updated!', 'success');
  return true;
}

function warnAboutVersionedFiles(filesToSync) {
  const versioned = filesToSync.filter((f) =>
    VERSIONED_FILES.includes(f.file) || VERSIONED_FILES.includes(path.basename(f.file))
  );
  if (versioned.length === 0) return;
  log('VERSION UPDATE REMINDER', 'warning');
  log('The following files are being synced and their version strings are managed by the build:', 'warning');
  versioned.forEach((f) => log(`  - ${f.file}`, 'warning'));
  log('Remember: the build (npm run build:full) syncs CACHE_NAME in sw.js and the ?v= query strings in the HTML files from the root VERSION file.\n', 'warning');
}

function promptConfirmation(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  log('Starting experimental sync...');
  log(`Options: dry-run=${options.dryRun}, build=${options.build}, deploy=${options.deploy}, force=${options.force}`);

  if (!fs.existsSync(EXPERIMENTAL_DIR)) {
    log(`Experimental directory not found: ${EXPERIMENTAL_DIR}`, 'error');
    process.exit(1);
  }
  if (!fs.existsSync(PRODUCTION_DIR)) {
    log(`Production directory not found: ${PRODUCTION_DIR}`, 'error');
    process.exit(1);
  }

  log('Scanning experimental directory...');
  const experimentalFiles = getAllFiles(EXPERIMENTAL_DIR);
  const productionFiles = getAllFiles(PRODUCTION_DIR);
  log(`Found ${experimentalFiles.length} files in experimental/, ${productionFiles.length} in production_source/`);
  const filesToSync = getFilesToSync(experimentalFiles, new Set(productionFiles));

  if (filesToSync.length === 0) {
    log('No files need to be synced. Everything is up to date!', 'success');
    if (options.build) {
      await runBuild(options.dryRun);
      if (options.deploy) await copyToDeploy(options.dryRun);
    }
    process.exit(0);
  }

  log(`\n${filesToSync.length} file(s) to sync:`);
  filesToSync.forEach((f) => log(`  [${f.status}] ${f.file}`));

  warnAboutVersionedFiles(filesToSync);

  if (!options.force && !options.dryRun) {
    const confirmed = await promptConfirmation('\nDo you want to sync these files to production_source?');
    if (!confirmed) {
      log('Sync cancelled.', 'warning');
      process.exit(0);
    }
  }

  log('\nSyncing files...');
  let allSuccess = true;
  for (const { experimentalPath, productionPath, file } of filesToSync) {
    if (options.interactive && !options.force) {
      const confirmed = await promptConfirmation(`Copy ${file}?`);
      if (!confirmed) {
        log(`Skipped: ${file}`, 'warning');
        continue;
      }
    }
    if (!copyFile(experimentalPath, productionPath, options.dryRun)) {
      allSuccess = false;
    }
  }
  if (!allSuccess) {
    log('\nSome files failed to sync.', 'error');
    process.exit(1);
  }
  log('\nFiles synced successfully!', 'success');

  if (options.build && !await runBuild(options.dryRun)) {
    process.exit(1);
  }
  if (options.expBuild && !await buildExperimentalDeploy(options.dryRun)) {
    process.exit(1);
  }
  if (options.deploy) {
    if (options.build) {
      if (!await copyToDeploy(options.dryRun)) process.exit(1);
    } else {
      log('Warning: --deploy requires --build. Skipping deploy.', 'warning');
    }
  }

  log('\nSync complete!', 'success');
  if (!options.dryRun) {
    log('\nNext steps:');
    if (!options.build) log('  Run: npm run build:full (in production_source/)');
    if (!options.deploy) log('  Commit source and deploy/ together after rebuilding');
    log('  Test in deploy/index.html');
  }
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
