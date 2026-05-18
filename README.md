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
│   ├── styles.min.css             # Minified styles (versioned with ?v=2)
│   ├── script.min.js              # Minified JavaScript (versioned with ?v=2)
│   ├── sw.js                      # Service Worker (version: remotelabs-v2)
│   ├── manifest.json              # Web app manifest
│   ├── assets/                    # Images, videos, logos
│   └── error_pages/               # Custom error pages (400, 401, 403, 404, 500)
└── production_source/            # Development files (keep for future edits)
    ├── index.html                 # Source HTML
    ├── styles.css                 # Source CSS
    ├── script.js                  # Source JavaScript
    ├── sw.js                      # Source Service Worker
    └── package.json               # Build configuration
```

## Making Changes

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

The site has security headers implemented via meta tags:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Strict-Transport-Security
- Permissions-Policy
- Expect-CT

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

**Last Updated**: 2026
**Maintained by**: Karel Aarts | DRIVE | Eindhoven University of Technology
