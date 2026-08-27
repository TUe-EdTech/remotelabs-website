# Remote Labs Website - Handover Guide

## Overview

This is the official website for Remote Labs at Eindhoven University of Technology. It's a static website that provides information about our 24/7 access to physical lab experiments.

## Quick Start

The website is a simple static site. No build process or server required.

### To view locally:
Just open `deploy/index.html` in your web browser.

### To deploy:
Copy all files from the `deploy/` folder to your web server's root directory.

## Folder Structure

```
remotelabs-website/
├── .git/                          # Version control (do not deploy)
├── deploy/                        # ✅ PRODUCTION FILES - Upload to server
│   ├── index.html                 # Main page
│   ├── privacy.html               # Privacy policy
│   ├── styles.min.css             # Minified styles (versioned with ?v=3)
│   ├── script.min.js              # Minified JavaScript (versioned with ?v=3)
│   ├── sw.js                      # Service Worker (version: remotelabs-v3)
│   ├── manifest.json              # Web app manifest
│   ├── robots.txt                 # Search engine crawl rules + sitemap pointer
│   ├── sitemap.xml                # XML sitemap
│   ├── .htaccess                  # Real HTTP security headers (see Security)
│   ├── assets/                    # Images, videos, logos
│   └── error_pages/               # Custom error pages (400, 401, 403, 404, 500)
├── experimental/                  # 🧪 EXPERIMENTAL DEVELOPMENT
│   ├── index.html                 # Experimental HTML source
│   ├── styles.css                 # Experimental CSS source
│   ├── script.js                  # Experimental JavaScript source
│   └── assets/                    # Experimental assets (symlinked to production)
├── experimental_deploy/           # 🎯 EXPERIMENTAL BUILD OUTPUT
│   └── ...                        # Built files (ready for preview)
├── scripts/                      # Build and utility scripts
│   ├── build-experimental.js      # Build script for experimental folder
│   └── build-experimental.bat     # Windows batch version
└── production_source/            # Development files (keep for future edits)
    ├── index.html                 # Source HTML
    ├── styles.css                 # Source CSS
    ├── script.js                  # Source JavaScript
    ├── sw.js                      # Source Service Worker
    └── package.json               # Build configuration
```

## Making Changes

### 🎯 Experimental Workflow (NEW)

The `experimental/` folder provides a sandbox environment for testing new designs and features before merging into production. This allows for rapid iteration and A/B testing.

**Key Features:**
- Black and white minimalistic color scheme (replaces blue)
- More squared/less rounded button corners
- Block-style benefits section (replaces button-style)
- Left-aligned title with natural balance
- Two-column hero layout with summary panel
- Static video display (removed full-width on scroll)
- Pulsing dot indicator for active workflow step

**Workflow:**

1. **Edit files** in the `experimental/` folder:
   - `experimental/index.html` - HTML structure
   - `experimental/styles.css` - CSS styles
   - `experimental/script.js` - JavaScript behavior

2. **Build for preview**:
   ```bash
   # Using Node.js (preferred)
   node scripts/build-experimental.js
   
   # Or on Windows (double-click)
   scripts/build-experimental.bat
   ```
   This creates minified files in `experimental_deploy/`

3. **Preview locally**:
   Open `experimental_deploy/index.html` in your browser to see the built version exactly as it will appear in production.

4. **Test changes**: Verify all functionality works as expected in the experimental version.

5. **Merge to production**: Once approved, manually copy changes from `experimental/` to `production_source/` and rebuild.

6. **Commit to git**: All changes in `experimental/` and `experimental_deploy/` are tracked. The build is automatic on commit via the build script.

**Automatic Build on Commit:**
A git hook can be set up to automatically run `node scripts/build-experimental.js` when committing changes to the experimental folder. This ensures `experimental_deploy/` is always up-to-date.

---

### Production Workflow

1. **Edit files** in the `production_source/` folder
2. **Test locally** by opening the file in your browser
3. **Build assets** (minify CSS/JS):
   ```bash
   cd production_source
   npm install  # First time only
   npm run build
   # Or manually:
   npx clean-css -o ../deploy/styles.min.css styles.css
   npx uglifyjs script.js -o ../deploy/script.min.js -c -m
   cp index.html privacy.html sw.js ../deploy/
   ```
4. **Copy** built files to `deploy/` folder
5. **Test** the deploy version before uploading to server

## Important Files

- **Main Page**: `deploy/index.html` - Edit this for content changes
- **Styles**: `deploy/styles.min.css` - Main stylesheet
- **JavaScript**: `deploy/script.min.js` - Main JavaScript
- **Service Worker**: `deploy/sw.js` - Offline caching (update version when deploying!)
- **Images/Logos**: `deploy/assets/` - All images and videos
- **Error Pages**: `deploy/error_pages/` - Custom error pages

## Domain & Hosting

- **Domain**: remotelabs.tue.nl
- **Current Hosting**: TU/e web servers
- **SSL**: HTTPS enabled (required)

## Security

**Content-Security-Policy** is delivered as a `<meta>` tag in the `<head>` of
`index.html` (this is the one security header browsers honour via `<meta>`).

All other security headers are **ignored by browsers when set via `<meta>`** and
must be sent as real HTTP response headers. They live in `deploy/.htaccess`
(Apache). If the site is hosted behind Nginx / IIS / a TU/e proxy, replicate the
same headers there:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security
- Permissions-Policy

Note: the deprecated `X-XSS-Protection` and `Expect-CT` headers were removed.

## SEO

- `robots.txt` and `sitemap.xml` live in `deploy/` and are copied by the build.
- `index.html` includes Open Graph / Twitter Card tags, a canonical link, and
  JSON-LD Organization structured data. Update the URLs/description there if the
  domain or messaging changes.

## Caching & Deployment

### ⚠️ IMPORTANT: Preventing Caching Issues

**Problem**: Visitors may see outdated content even after deployment due to aggressive caching by:
1. **Service Worker** - Caches assets locally in the browser
2. **Browser Cache** - Caches static files (CSS, JS, HTML)
3. **CDN/Proxy Cache** - TU/e hosting may cache responses

### ✅ Solution: Versioning & Cache Control

#### Before Each Deployment:

1. **Update Service Worker Version** in `production_source/sw.js`:
   ```javascript
   const CACHE_NAME = 'remotelabs-v2';  // ⬅️ Bump this number!
   ```

2. **Update Asset Version Query Strings** in HTML files:
   ```html
   <link rel="stylesheet" href="styles.min.css?v=2">  <!-- Bump v=2 to v=3 -->
   <script src="script.min.js?v=2" defer></script>     <!-- Bump v=2 to v=3 -->
   ```

3. **Cache-Control Meta Tags** (already added to index.html and privacy.html):
   ```html
   <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
   <meta http-equiv="Pragma" content="no-cache">
   <meta http-equiv="Expires" content="0">
   ```

#### Deployment Steps:

1. Make your changes in `production_source/`
2. Build and minify assets
3. **Update version numbers** (CACHE_NAME in sw.js, v= parameter in HTML)
4. Copy files to `deploy/`
5. Upload to server
6. **Verify**: Open in incognito mode or clear cache before testing

### 🔧 Service Worker Behavior

The updated `sw.js` uses a **Network-First** strategy:
- **HTML files**: Always fetched from network (never cached)
- **CSS/JS/images**: Try network first, fall back to cache if offline
- **Old caches**: Automatically cleaned up on activation
- **Immediate activation**: `skipWaiting()` and `clients.claim()` ensure no delays

This means:
- ✅ Users always get fresh HTML
- ✅ Users get fresh CSS/JS when online
- ✅ Offline support still works
- ✅ Old versions don't persist

### 📋 Caching Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Visitors see old content | Service worker cache not invalidated | Bump `CACHE_NAME` version |
| CSS/JS not updating | Browser cache | Add/bump `?v=2` query string |
| HTML not updating | Browser cache | `Cache-Control: no-cache` meta tag |
| Some users still see old version | CDN cache | Contact TU/e IT to clear cache |

### 🎯 Verification Checklist

After deploying:
- [ ] Open site in **incognito/private window** (bypasses cache)
- [ ] Check Chrome DevTools > Application > Service Workers (should show `remotelabs-v2`)
- [ ] Check DevTools > Network tab: CSS/JS should have `?v=2` in URL
- [ ] Hard refresh (Ctrl+F5) to ensure fresh load
- [ ] Test on mobile device
- [ ] Ask a colleague to verify (they won't have cached version)

### 💡 Pro Tip: Force Update Script

For emergency cache busting, add this temporarily to your HTML:
```html
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => reg.update())
            .then(() => location.reload(true));
    }
</script>
```
Remove after all users have updated.

## Maintenance Tasks

### Regular:
- Content updates (text, images)
- Check links are working
- Test on mobile devices

### As Needed:
- Update partner logos in `assets/Partner logos/`
- Update video content in `assets/videos/`
- Review and update privacy policy

### Version Updates (After Changes):
1. Update `CACHE_NAME` in `production_source/sw.js` (e.g., `remotelabs-v2` → `remotelabs-v3`)
2. Update `v=2` to `v=3` in all CSS/JS references in HTML files
3. Rebuild and deploy

## Emergency Contacts

- **Primary**: Karel Aarts (k.m.a.aarts@tue.nl)
- **Technical Support**: TU/e IT Department

## Notes

- This is a static site - no database, no server-side code
- All files are HTML, CSS, and JavaScript
- No cookies are collected (as stated on the site)
- Service worker provides basic offline support
- **AppCache is deprecated** - Removed `cache.manifest` reference

## Quick Reference: Build Commands

```bash
# Install dependencies (once)
cd production_source
npm install

# Build all assets
npm run build

# Or build individually
npm run build:css    # Minify CSS
npm run build:js     # Minify JavaScript
npm run build:html   # Copy HTML files
npm run build:full   # Full build via build.js

# Manual minification
npx clean-css -o ../deploy/styles.min.css styles.css
npx uglifyjs script.js -o ../deploy/script.min.js -c -m
```

---

## Recent Changes (Experimental v1)

### Applied User Feedback:

1. **Removed** "Explore Features" button from hero section
2. **Implemented** 2-column hero layout with summary panel on the right
   - Title and subtitle in left column (middle-aligned, max-width: 500px)
   - "What is Remote Labs?" summary in right column
3. **Reverted** video to static display (removed full-width on scroll as it caused layout issues)
4. **Replaced** "▶ Playing" button with pulsing dot indicator
   - Animated black dot that pulses (scales from 1x to 1.2x)
   - Cleaner, more minimalistic look
5. **Revamped** Key Benefits section
   - Changed from 3 icon-based benefit blocks to 4 numbered benefit items
   - New layout: 2-column grid with numbered items
   - Each benefit has a number (01-04) and descriptive text
   - Benefits: Access Anywhere, Real Equipment, Flexible Learning, Cost Effective
6. **Centered** bottom CTA section
   - "Interested in exploring Remote Labs..." text now centered
   - CTA buttons centered with max-width: 800px
   - Secondary CTA text also centered

### Visual Design Updates:

- **Color Scheme**: Black and white minimalistic (no blue accent)
- **Button Style**: Less rounded corners (3px border-radius for standard buttons, 4px for hero CTA)
- **Typography**: Maintained Poppins for headings, Lato for body text
- **Spacing**: Improved margins and padding for better visual hierarchy

---

**Last Updated**: 2026
**Maintained by**: Karel Aarts | DRIVE | Eindhoven University of Technology
