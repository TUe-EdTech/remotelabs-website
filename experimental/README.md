# Experimental Layout Development

This folder is your **sandbox environment** for developing, testing, and refining new website layouts before they are merged into production. It provides a complete workflow that mirrors the production build process, allowing you to experiment freely without affecting the live site.

---

## 📁 Folder Structure

```
remotelabs-website/
├── experimental/                    # ⭐ YOUR WORKSPACE
│   ├── index.html                 # Main HTML file (edit here)
│   ├── styles.css                 # Main stylesheet (edit here)
│   ├── script.js                  # JavaScript file (edit here)
│   ├── manifest.json              # Web app manifest (edit here)
│   ├── assets/                    # Only experimental-only assets (fontawesome)
│   │   └── fontawesome/            # Shared fonts/images/videos are NOT stored
│   │                              # here; the build copies them from
│   │                              # production_source/assets/
│   └── README.md                  # This file
│
├── experimental_deploy/           # 🎯 BUILD OUTPUT (auto-generated)
│   ├── index.html                 # Minified HTML
│   ├── styles.min.css             # Minified CSS
│   ├── script.min.js              # Minified JavaScript
│   ├── manifest.json
│   └── assets/                    # Copied assets
│
├── production_source/            # Current production source
│   └── ...                        # (do not edit directly)
│
├── deploy/                       # Current production build
│   └── ...                        # (do not edit directly)
│
└── scripts/
    ├── sync-experimental.js       # Cross-platform sync script
    ├── sync-experimental.bat      # Windows sync script
    ├── build-experimental.js      # Build experimental version
    └── build-experimental.bat     # Windows build script
```

---

## 🚀 Quick Start

### 1. Make Your Changes
Edit files directly in the `experimental/` folder:
```bash
# Your experimental files are here:
experimental/index.html     # Edit HTML structure and content
experimental/styles.css     # Edit CSS styles
experimental/script.js      # Edit JavaScript
experimental/assets/       # Add/modify images, fonts, videos
```

### 2. Preview Your Changes
You have **two preview options**:

**Option A: Direct Preview (Fastest)**
```bash
# Simply open the file in your browser
open experimental/index.html
# or on Windows:
start experimental\index.html
```

**Option B: Built Preview (Most Accurate)**
This shows exactly how your final production build will look:
```bash
# Build the experimental version
node scripts/build-experimental.js

# Then open the built version
open experimental_deploy/index.html
```

---

## 🔄 Complete Workflow

### Phase 1: Development
```
┌─────────────────────────────────────────────────────────────┐
│  DEVELOP in experimental/                                │
│  └── Edit: index.html, styles.css, script.js, assets/   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
```

### Phase 2: Preview & Test
```
┌─────────────────────────────────────────────────────────────┐
│  PREVIEW Option A: Direct                               │
│  └── Open: experimental/index.html                      │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│  PREVIEW Option B: Built (Recommended)                   │
│  └── Run: node scripts/build-experimental.js            │
│  └── Open: experimental_deploy/index.html               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
```

### Phase 3: Sync to Production
```
┌─────────────────────────────────────────────────────────────┐
│  SYNC to production_source/                            │
│  └── Dry run first:                                    │
│      node scripts/sync-experimental.js --dry-run        │
│  └── Then sync:                                        │
│      node scripts/sync-experimental.js --force         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
```

### Phase 4: Build & Deploy
```
┌─────────────────────────────────────────────────────────────┐
│  BUILD production                                    │
│  └── cd production_source                             │
│  └── npm run build                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  DEPLOY to server                                     │
│  └── Copy files from deploy/ to your web server          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Script Reference

### sync-experimental.js / sync-experimental.bat
Synchronizes files from `experimental/` to `production_source/`.

**Usage:**
```bash
node scripts/sync-experimental.js [options]
```

**Options:**

| Option | Description | Example |
|--------|-------------|---------|
| `--dry-run` | Preview changes without copying | `node scripts/sync-experimental.js --dry-run` |
| `--force` | Skip confirmation prompts | `node scripts/sync-experimental.js --force` |
| `--build` | Run `npm run build` after syncing | `node scripts/sync-experimental.js --force --build` |
| `--deploy` | Copy to `deploy/` after building | `node scripts/sync-experimental.js --force --build --deploy` |
| `--exp-build` | Build `experimental_deploy/` | `node scripts/sync-experimental.js --exp-build` |
| `--interactive` | Confirm each file individually | `node scripts/sync-experimental.js --interactive` |
| `--all` | Sync all files (including deletions) | `node scripts/sync-experimental.js --all` |

**Common Combinations:**
```bash
# Preview what will change
node scripts/sync-experimental.js --dry-run

# Sync with confirmation
node scripts/sync-experimental.js

# Full sync: copy, build, deploy
node scripts/sync-experimental.js --force --build --deploy

# Build experimental preview only
node scripts/sync-experimental.js --exp-build
```

### build-experimental.js / build-experimental.bat
Creates a production-like build in `experimental_deploy/` for preview.

**Usage:**
```bash
node scripts/build-experimental.js
```

**What it does:**
- Cleans the `experimental_deploy/` folder
- Copies all files from `experimental/` to `experimental_deploy/`
- Minifies CSS to `styles.min.css`
- Minifies JavaScript to `script.min.js`
- Updates HTML references to use minified files with version query strings
- Copies shared assets (fonts/images/videos) from `production_source/assets/`
- Merges in `experimental/assets/fontawesome/`
- Copies icons from root

**Note:** Requires `clean-css` and `uglify-js` npm packages to be installed. If not available, it falls back to copying original files.

---

## 🎨 Design System (Current Experimental)

### Color Palette
Since we converted to a minimalistic black and white scheme:

| Color | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Black | `--black` | `#000` | Primary text, buttons, icons |
| White | `--white` | `#fff` | Backgrounds, text on dark |
| Gray 50 | `--gray-50` | `#f9fafb` | Lightest background |
| Gray 100 | `--gray-100` | `#f3f4f6` | Borders, dividers |
| Gray 200 | `--gray-200` | `#e5e7eb` | Subtle borders |
| Gray 300 | `--gray-300` | `#d1d5db` | Hover states |
| Gray 400 | `--gray-400` | `#9ca3af` | Placeholder text |
| Gray 500 | `--gray-500` | `#6b7280` | Secondary text |
| Gray 600 | `--gray-600` | `#4b5563` | Body text |
| Gray 700 | `--gray-700` | `#374151` | Headings |
| Gray 800 | `--gray-800` | `#1f2937` | Dark text |
| Gray 900 | `--gray-900` | `#111827` | Footer background |

### Typography
- **Primary Font:** Lato
- **Heading Font:** Poppins (Bold)
- **Base Size:** 16px
- **Line Height:** 1.6

### Spacing
- **Container Width:** 1200px max
- **Section Padding:** 4rem (desktop), 3rem (tablet), 2.5rem (mobile)
- **Grid Gap:** 2rem

### Border Radius (Minimalistic)
- **CTA Buttons:** 3px
- **Hero Buttons:** 4px
- **Cards/Blocks:** 6px
- **Circular Elements:** 50%

---

## 📝 Current Changes in Experimental

This experimental version includes the following modifications from production:

### 1. Color Scheme
- ✅ **Changed:** Blue color scheme to Black & White minimalistic
- **Before:** `--highlight-color: #2563eb` (Blue)
- **After:** `--highlight-color: #000` (Black)
- All blue references replaced with black or grayscale equivalents

### 2. Button Styling
- ✅ **Changed:** Rounded corners to Sharper corners
- CTA buttons: 6px to 3px
- Hero buttons: 8px to 4px
- Cards: 12px to 6px
- More minimalistic appearance

### 3. Benefits Section
- ✅ **Changed:** Button-like cards to Clean content blocks
- **Before:** Cards with background, shadow, border, hover effects
- **After:** Simple blocks with bottom border separator
- Removed: background, box-shadow, border, text-align center
- Added: `border-bottom: 1px solid var(--gray-200)`

---

## 🎯 Best Practices

### 1. Version Control
```bash
# Commit often with descriptive messages
git add experimental/
git commit -m "Experimental: Describe your changes"

# Create branches for major experiments
git checkout -b experimental/new-layout
git push origin experimental/new-layout
```

### 2. Testing
- **Test in multiple browsers:** Chrome, Firefox, Safari, Edge
- **Test on mobile:** Use browser DevTools device emulation
- **Test responsive:** Check at 480px, 768px, 1024px, 1440px
- **Validate:** Use [W3C Validator](https://validator.w3.org/)
- **Accessibility:** Use [Lighthouse](https://developers.google.com/web/tools/lighthouse) or [axe](https://www.deque.com/axe/)

### 3. Before Syncing to Production
- [ ] Test in `experimental/index.html`
- [ ] Build and test in `experimental_deploy/index.html`
- [ ] Check all links work
- [ ] Verify images load correctly
- [ ] Test on mobile viewport
- [ ] Commit your experimental changes
- [ ] Run `node scripts/sync-experimental.js --dry-run`

### 4. After Syncing
- [ ] Run `npm run build` in `production_source/`
- [ ] Test in `deploy/index.html`
- [ ] Update version numbers (see below)
- [ ] Commit the production changes

---

## ⚠️ Important: Version Updates

When syncing files that affect caching, **you must update version numbers**:

### Files Requiring Version Updates:

1. **`sw.js`** - Service Worker
   ```javascript
   const CACHE_NAME = 'remotelabs-v3';  // Bump this number!
   ```

2. **HTML Files** - Asset references
   ```html
   <link rel="stylesheet" href="styles.min.css?v=3">
   <script src="script.min.js?v=3" defer></script>
   ```

3. **`manifest.json`** - Theme color (if changed)

**The sync script will remind you about these!**

---

## 🔧 Troubleshooting

### "Module not found" errors
If you get errors about missing modules when running build scripts:
```bash
# Install the required packages
cd production_source
npm install
```

The required packages are:
- `clean-css` - For CSS minification
- `uglify-js` - For JavaScript minification

### experimental_deploy not updating
```bash
# Clean and rebuild
rm -rf experimental_deploy/
node scripts/build-experimental.js
```

### Sync not working
```bash
# Check what will be synced first
node scripts/sync-experimental.js --dry-run

# Force sync if needed
node scripts/sync-experimental.js --force
```

---

## 📊 Comparison: Development vs Production

| Aspect | experimental/ | production_source/ | deploy/ |
|--------|--------------|-------------------|---------|
| Purpose | Development sandbox | Source of truth | Production-ready |
| Files | Full source | Full source | Minified |
| Editing | ✅ Yes | ❌ No (sync from experimental) | ❌ No |
| Testing | Direct or via experimental_deploy/ | Via deploy/ | Final check |
| Build | Manual (build-experimental.js) | `npm run build` | Auto-generated |
| Deploy | Never | Never | Copy to server |

---

## 🎓 Example: Full Workflow in Action

### Scenario: You want to change the hero section color

**1. Start in experimental/:**
```bash
# Open experimental/styles.css
# Change the hero background color
# Save the file
```

**2. Preview directly:**
```bash
open experimental/index.html
```

**3. Preview built version:**
```bash
node scripts/build-experimental.js
open experimental_deploy/index.html
```

**4. Happy with changes? Sync to production:**
```bash
# First, dry run
node scripts/sync-experimental.js --dry-run

# Then sync
node scripts/sync-experimental.js --force
```

**5. Build production:**
```bash
cd production_source
npm run build
cd ..
```

**6. Test production build:**
```bash
open deploy/index.html
```

**7. Deploy to server:**
```bash
# Copy all files from deploy/ to your web server
scp -r deploy/* user@server:/path/to/website/
```

---

## 📞 Support & Contacts

- **Primary:** Karel Aarts (k.m.a.aarts@tue.nl)
- **Repository:** https://github.com/KarelAarts/remotelabs-website
- **Documentation:** See main README.md for overall project info

---

**Last Updated:** 2026  
**Maintained by:** Remote Labs Team | DRIVE | Eindhoven University of Technology
