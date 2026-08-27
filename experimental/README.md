# Experimental Layout Development

This folder is for developing and testing new website layouts before merging them into production.

## Folder Structure

```
experimental/
├── index.html          # New layout HTML
├── styles.css          # New layout CSS
├── script.js           # New layout JavaScript
├── assets/             # New images and assets
│   └── ...
└── README.md           # This file
```

## Workflow

### 1. Develop in Experimental
- Create and edit files in this `experimental/` folder
- Test locally by opening files directly in your browser
- Iterate on the design without affecting production

### 2. Sync to Production Source
Once you're ready to integrate your changes:

```bash
# Run the sync script with dry-run first to see what will be copied
node scripts/sync-experimental.js --dry-run

# If everything looks good, sync the files
node scripts/sync-experimental.js

# Or force sync without confirmation
node scripts/sync-experimental.js --force
```

This will copy your experimental files to `production_source/`.

### 3. Build and Deploy
After syncing, build and deploy:

```bash
# Full workflow: sync, build, and deploy
node scripts/sync-experimental.js --build --deploy

# Or step by step:
node scripts/sync-experimental.js --force
cd production_source
npm run build
# Manually copy files to deploy/ or use the script
node scripts/sync-experimental.js --deploy  # (requires --build)
```

## Sync Script Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be copied without actually copying |
| `--build` | Run npm build after syncing |
| `--deploy` | Copy to deploy/ folder after building |
| `--force` | Overwrite without confirmation |
| `--interactive` | Ask for confirmation for each file |
| `--all` | Sync all files (including deleted files) |

## Important Notes

### Version Updates Required
When syncing the following files, remember to update version numbers:

1. **sw.js** - Update `CACHE_NAME` (e.g., `remotelabs-v2` → `remotelabs-v3`)
2. **index.html** - Update CSS/JS version query strings (`?v=2` → `?v=3`)
3. **privacy.html** - Update CSS/JS version query strings if applicable

The sync script will remind you about these!

### Testing
Always test in `deploy/index.html` before deploying to the server, as this is the production-ready version.

### Safety
- The sync script only copies modified or new files
- It preserves existing files in production_source
- Use `--dry-run` first to verify what will be changed
- Files are never deleted automatically (use `--all` to sync deletions)

## Quick Start

1. Copy current production files to experimental:
   ```bash
   cp production_source/index.html experimental/
   cp production_source/styles.css experimental/
   cp production_source/script.js experimental/
   cp -r production_source/assets experimental/
   ```

2. Start developing in `experimental/`

3. When ready, sync to production:
   ```bash
   node scripts/sync-experimental.js --dry-run
   node scripts/sync-experimental.js --force --build --deploy
   ```

4. Test in `deploy/index.html`

5. Deploy to server by copying `deploy/` contents

## Best Practices

1. **Commit often** - Commit your experimental changes to git
2. **Test in multiple browsers** - Chrome, Firefox, Safari, Edge
3. **Test on mobile** - Use browser dev tools device emulation
4. **Validate HTML/CSS** - Use W3C validators
5. **Check accessibility** - Use Lighthouse or axe tools
6. **Backup first** - Make sure production_source is committed before syncing
