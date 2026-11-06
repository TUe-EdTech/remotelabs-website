# Remote Labs Website Development Guide

**Comprehensive documentation for developers working on the Remote Labs website project.**

> **Note for agents**: read the root `TODO.md` before planning any work —
> it tracks completed and pending improvements with commit references and
> lists current priorities. Keep it up to date as work completes. The root
> `AGENTS.md` summarizes the essential workflow rules.

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Getting Started](#-getting-started)
3. [Project Structure](#-project-structure)
4. [Development Workflow](#-development-workflow)
5. [Development Guidelines](#-development-guidelines)
6. [Code Standards](#-code-standards)
7. [Common Tasks](#-common-tasks)
8. [Caching & Version Management](#-caching--version-management)
9. [Testing & Quality Assurance](#-testing--quality-assurance)
10. [Deployment](#-deployment)
11. [Maintenance](#-maintenance)
12. [Security](#-security)

---

## 🎯 Project Overview

This guide provides comprehensive documentation for the Remote Labs website at Eindhoven University of Technology. The website has been optimized for performance, accessibility, and user experience with modern features including scroll-based navigation hiding, interactive toggle switches, responsive design, and security headers.

**Key Features**:
- Scroll-based header hiding (desktop & mobile)
- Modern toggle switch for workflow selection
- Optimized mobile experience
- Performance-focused design
- Accessible components
- Security headers (CSP, X-Frame-Options, HSTS, etc.)
- Service worker for offline support (registered by script.js on page load over http/https)

**Domain**: remote-labs.eu (site; the Remote Labs platform app lives at remotelabs.tue.nl)

---

## 🚀 Getting Started

### Prerequisites
- Basic knowledge of HTML, CSS, and JavaScript
- Text editor (VS Code recommended)
- Node.js (for minification tools)
- Git (for version control)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/TUe-EdTech/remotelabs-website.git
cd remotelabs-website

# Install dependencies
npm install
```

### Development Workflow

**For development**: Edit files in `production_source/`
**For deployment**: Use files from `deploy/`

---

## 📁 Project Structure

```
remotelabs-website/
├── .git/                          # Git repository (do not deploy)
├── .gitattributes                 # Git configuration
├── README.md                      # Project README (overview, structure, workflows)
├── deploy/                        # ✅ PRODUCTION FILES - Upload to server
│   ├── index.html                 # Main landing page
│   ├── privacy.html               # Privacy policy page
│   ├── manifest.json              # Web app manifest
│   ├── script.min.js              # Minified JavaScript (production)
│   ├── styles.min.css             # Minified CSS (production)
│   ├── sw.js                      # Service worker for offline support (registered by script.js)
│   ├── assets/                    # Static assets
│   │   ├── Partner logos/          # Partner organization logos
│   │   ├── Publications/           # Publication PDFs (footer Publications list)
│   │   ├── TUe-logo-descriptor-line-scarlet-S.png
│   │   └── videos/                # Video files
│   ├── 400.shtml                  # Custom error pages (at deploy root, not a subfolder)
│   ├── 401.shtml
│   ├── 403.shtml
│   ├── 404.shtml
│   └── 500.shtml
└── production_source/            # 🛠️ DEVELOPMENT FILES
    ├── index.html                 # Source HTML
    ├── styles.css                 # Source CSS (minified artifact — see inline critical CSS in index.html for the canonical source)
    ├── script.js                  # Source JavaScript
    ├── sw.js                      # Source Service Worker
    ├── package.json              # Node.js package configuration
    └── package-lock.json          # Dependency lock file (node_modules/ is gitignored, not tracked)
```

### Color Scheme
The design is monochrome: black, white, and a gray scale. There is no
branded accent color — `--highlight-color` resolves to `#000`, so buttons,
borders, icons, and active states are all black.
- **Highlight** (`--highlight-color`): `#000` (black)
- **Black**: `#000`
- **White**: `#fff`
- **Gray 50**: `#f9fafb`
- **Gray 100**: `#f3f4f6`
- **Gray 600**: `#4b5563` (body secondary text)
- **Gray 900**: `#111827` (footer background)
- **Dark**: `#111827`

---

## 🔄 Development Workflow

### Making Changes

1. **Edit** files in `production_source/` folder
2. **Test** locally by opening in browser
3. **Minify** assets:
   ```bash
   # Minify CSS
   npx clean-css -o deploy/styles.min.css production_source/styles.css
   
   # Minify JavaScript
   npx uglifyjs production_source/script.js -o deploy/script.min.js -c -m
   ```
4. **Copy** to deploy folder:
   ```bash
   # Copy updated files
   cp production_source/index.html deploy/
   cp production_source/privacy.html deploy/
   cp production_source/sw.js deploy/
   ```
5. **Test** deploy version locally
6. **Deploy** to server

### Quick Edits (Direct to Deploy)

For simple content changes (text, images):
- Edit directly in `deploy/` folder
- Test in browser
- Upload to server

---

## 🛠️ Development Guidelines

### File Naming Conventions
- **HTML/CSS/JS**: `lowercase-with-hyphens.ext`
- **Backup files**: `original_backup.ext`
- **Images**: `descriptive-name.jpg/png`
- **Folders**: `lowercase_with_underscores/`

### HTML Standards
- Use semantic HTML5 elements (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`)
- Include ARIA labels for accessibility
- Add alt text for all images
- Maintain proper heading hierarchy (h1 → h2 → h3 → h4)
- Use meta tags for SEO and social media
- Indentation: 2 spaces

### CSS Architecture
- **Methodology**: Consistent class naming (not strict BEM, but predictable and component-scoped)
- **Organization**: Group styles by component/functionality
- **Variables**: Use CSS variables for colors and common values
- **Responsive**: Mobile-first approach
- **Breakpoints**: 480px (mobile), 768px (tablet), 1024px (desktop)
- **Specificity**: Keep low, avoid `!important` (exception: the inline critical CSS in `index.html` uses `!important` on video padding to override responsive media-query rules — this is the only justified use)

### JavaScript Practices
- Use ES6+ features (arrow functions, template literals, etc.)
- Keep functions small and focused (single responsibility)
- Implement proper error handling with try/catch
- Ensure DOM is ready before manipulation
- Document complex logic with comments
- Use event delegation for dynamic elements
- Optimize scroll events with throttling/debouncing

---

## 🎯 Common Tasks

### Adding/Updating Content

**Text changes**:
- Edit directly in `deploy/index.html` or `production_source/index.html`
- Update headings, paragraphs, button text

**Image updates**:
- Replace files in `deploy/assets/`
- Update image references in HTML
- Optimize images before adding (compress, proper format)

**Video updates**:
- Replace files in `deploy/assets/videos/`
- Update video sources in HTML
- Ensure proper video formats (MP4 for compatibility)

### Adding Partner Logos
1. Add logo file to `deploy/assets/Partner logos/`
2. Update HTML to include new logo
3. Test on all devices

### Updating Styles
- The inline `<style>` block in `production_source/index.html` (lines ~80-526) is the canonical source for critical CSS; edit styles there
- `production_source/styles.css` is a minified artifact generated by `npx clean-css` — do not hand-edit it
- Minify and copy to `deploy/styles.min.css` via `npm run build:full`
- Test responsiveness on mobile, tablet, desktop

### Updating JavaScript
- Edit `production_source/script.js`
- Minify and copy to `deploy/script.min.js`
- Test all interactive elements

### Adding New Page
1. Create HTML file in `production_source/`
2. Add corresponding styles to `production_source/styles.css` (or an inline
   `<style>` block for self-contained pages - CSP allows inline styles, but
   never inline scripts)
3. Add functionality to `production_source/script.js` (if needed)
4. Register the page in three places: the `filesToSync` and `filesToCopy`
   lists in `build.js`, and `PAGES` in `test.js` (keeps `?v=` sync, the
   deploy copy and the CSP/inline-script checks working for the new page)
5. Add to navigation (if applicable)
6. Test across browsers and devices

---

## 🚀 Caching & Version Management

### ⚠️ IMPORTANT: The Caching Problem

**Issue**: Visitors see outdated content after deployment due to multiple caching layers:
1. **Service Worker** - Caches assets locally (most common issue)
2. **Browser Cache** - Aggressively caches static files
3. **CDN/Proxy Cache** - TU/e hosting may cache responses

### ✅ Automated Version Management

To prevent caching issues, **ALL deployments MUST include version bumps**:

#### 1. Version Tracking File (NEW)

Create a `VERSION` file in the project root to track the current version:

```
# VERSION
CACHE_NAME=v2.1.1
ASSET_VERSION=v2.1.1
```

#### 2. Version Bump (manual; build.js only syncs)

**`VERSION` is the single source of truth.** The build never changes it.

To release (or whenever assets change and clients must get fresh copies):

1. Edit the root `VERSION` file and bump `CACHE_NAME` / `ASSET_VERSION`
   (normally the PATCH number; MAJOR/MINOR deliberately) — or run
   `node scripts/bump-version.js`, which bumps PATCH and runs the build
   in one step (safe: CI never runs that script, only `build:full`).
2. Run `cd production_source && npm run build:full`. The build **syncs**
   (does not bump): it writes the VERSION value into `sw.js`,
   `index.html`, `privacy.html`, and `assets/fonts/fonts.css`, and
   rebuilds `deploy/` from the same value — so source and deploy
   artifacts can never disagree.
3. Commit everything (source + `deploy/`).

Background: the build used to auto-bump PATCH on every run. Because CI
commits only `deploy/`, each CI run pushed the deployed version one
patch ahead of the committed source (deploy/ reached v2.1.5 while source
said v2.1.4). `npm test` now fails if `deploy/` and source versions
drift, with a message telling you to rebuild and commit.

#### 3. Full Build

`production_source/build.js` is the canonical build script. It:
1. Syncs version strings from the `VERSION` file (sw.js + HTML files +
   `assets/fonts/fonts.css`, so every local asset URL is versioned)
2. Minifies CSS via the clean-css library API (minify failure is fatal — a
   failed minification must never silently ship a stale artifact)
3. Minifies JS via the uglify-js library API (failure is fatal; no `npx`
   bin-name resolution involved)
4. Copies HTML, sw.js, robots.txt, sitemap.xml, .htaccess to `deploy/`
5. Copies icon files and assets folder to `deploy/`
6. Generates partner-logo HTML (via `scripts/partner-logos.js`)

Run with: `cd production_source && npm run build:full`

### Manual Version Update Steps

If not using the build (not recommended):

1. **Update the root `VERSION` file** (both lines) — the source of truth
2. **Update Service Worker version** in `production_source/sw.js`:
   ```javascript
   const CACHE_NAME = 'remotelabs-v2.1.1';  // must match VERSION
   ```
3. **Update asset query strings** in `production_source/index.html`,
   `production_source/privacy.html` and `assets/fonts/fonts.css` (all
   `?v=` references — every local asset URL is versioned: images, videos,
   posters, fonts, partner logos)
4. **Rebuild and commit `deploy/`** — or just run `npm run build:full`
   which does all of the above automatically
5. **Verify**: `npm test` passes (it checks source and deploy/ against
   VERSION), then test in incognito mode before deploying

### Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | Initial | Original service worker |
| v2 | 2024 | Network-first strategy, cache-control meta tags |
| v2.1.x | 2025-2026 | Semver versioning, runtime cache-as-you-go SW, a11y/perf improvements, privacy.html alignment |

---

## 🧪 Testing & Quality Assurance

### Automated CI Checks (every push/PR to main)

The GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) runs these gates against the freshly built `deploy/` output before it is committed:

1. `npm test` (in `production_source/`) — JS syntax, CSP without `unsafe-inline`, version consistency
2. `node scripts/check-links.js deploy` — every local link, asset, manifest icon and sitemap URL must resolve to a real file; every in-page anchor (including SVG `<use>` icon refs) must have a matching id
3. Lighthouse CI (`lighthouserc.json`) — minimum scores: performance >= 0.7 (measured at ~0.75 in CI, dragged down by the 8.9 MB hero video), accessibility >= 0.9, best-practices >= 0.9, SEO >= 0.9

   **Standing decision (commit `5d785a50`): the original hero video stays — do not
   re-propose re-encoding or trimming it.** The 8.9 MB `hero-loop.mp4` is already
   efficiently encoded (1280x720, ~500 kbps, 145 s loop); CRF re-encodes gave no
   meaningful win (8.45 MB at crf 26, 7.02 MB at crf 28), and shortening the
   145 s loop (60 s -> 4.1 MB, 30 s -> 2.5 MB) was declined to keep the full
   footage. The performance budget therefore stays at 0.7.

`scripts/check-links.js` can also be run locally, e.g. `node scripts/check-links.js experimental_deploy` to validate an experimental preview build.

### Testing Checklist (Before Deployment)
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile (iOS Safari)
- [ ] Mobile (Android Chrome)
- [ ] Tablet (iPad)
- [ ] Console error-free
- [ ] Responsive design (320px to 1920px+)
- [ ] All links work
- [ ] All images load
- [ ] Videos play correctly (hero autoplays on normal connections; the workflow video loads/plays when scrolled near — see `setupWorkflowVideoLazyPlay` in script.js; on Save-Data/2G the hero video shows the poster until Play)
- [ ] Forms submit (if any)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] **Incognito mode test** (verifies no caching issues)

### Cache-Specific Testing
- [ ] Chrome DevTools > Application > Service Workers shows current version (e.g. `remotelabs-v2.1.1`)
- [ ] Chrome DevTools > Network tab shows CSS/JS with `?v=2.1.1` in URL
- [ ] Hard refresh (Ctrl+F5) loads fresh content
- [ ] Offline mode works (service worker fallback)

### Validation Tools
- **HTML**: https://validator.w3.org/
- **CSS**: https://jigsaw.w3.org/css-validator/
- **Accessibility**: https://wave.webaim.org/
- **Performance**: Chrome DevTools Lighthouse

### Performance Targets
- Lighthouse Score: 90+ (Performance, Accessibility, SEO)
- Load Time: < 2 seconds (3G connection)
- Page Size: < 1MB (including images)
- Requests: < 20 HTTP requests

---

## 🚀 Deployment

### Preparation
1. Ensure all changes are tested locally
2. Run the build process:
   ```bash
   cd production_source
   node build.js  # Uses auto-versioning
   # OR manually:
   npm run build
   ```
3. Verify files in `deploy/` folder
4. Test `deploy/` version locally

### Deployment Steps
1. **Upload** all files from `deploy/` folder to server root
2. **Verify** file permissions (readable by web server)
3. **Test** live site:
   - Open in incognito mode
   - Check DevTools > Application > Service Workers
   - Verify CSS/JS URLs have version query strings
4. **Check** all links and functionality

### Server Configuration
- **HTTPS**: Required (HSTS header enforced)
- **MIME Types**: Ensure proper types for .mp4, .webmanifest, etc.
- **Caching Headers** (recommended):
  ```
  # For HTML files
  Cache-Control: no-cache, no-store, must-revalidate
  
  # For static assets (CSS, JS, images)
  Cache-Control: public, max-age=31536000, immutable
  
  # For service worker
  Cache-Control: no-cache
  ```
- **Root Directory**: `/` or `/public_html/` depending on hosting

### Post-Deployment
- Verify all pages load correctly
- Test all interactive elements
- Check video playback
- Monitor for errors in console
- Test on mobile devices
- Ask a colleague to verify (they won't have cached version)

---

## 🔧 Maintenance

### Regular Tasks (Monthly)
- Content review and updates
- Check for broken links
- Test on latest browser versions
- Review analytics (if configured)

### As Needed
- Update partner logos
- Update video content
- Update team information
- Update publications list
- Review and update privacy policy
- Update contact information

### Version Control
- Commit messages: Descriptive and concise
- Branching: Use feature branches for new development
- Tags: Version tags for major releases
- Issues: Track bugs and feature requests

### Before Each Deployment
- [ ] Run `node scripts/bump-version.js` OR manually update versions
- [ ] Run `node production_source/build.js` OR `npm run build`
- [ ] Test in incognito mode
- [ ] Verify service worker version in DevTools

---

## 🔒 Security

### Security Headers Implemented
Security headers are delivered as real HTTP response headers via
`deploy/.htaccess` (Apache). CSP is also set via `<meta>` in the HTML as a
fallback. The headers include:
- **Content-Security-Policy**: Restricts resource loading to prevent XSS
- **X-Frame-Options**: SAMEORIGIN (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **Strict-Transport-Security**: max-age=63072000; includeSubDomains; preload
- **Permissions-Policy**: Restricts browser features (geolocation, microphone, camera, payment)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Cross-Origin-Opener-Policy**: same-origin

Note: the deprecated `X-XSS-Protection` and `Expect-CT` headers are not used.

### Security Best Practices
- No cookies collected
- No eval() or dynamic code evaluation
- DOM manipulation instead of document.write()
- Icons use an inline SVG sprite (no external CDN dependency, no SRI needed)
- HTTPS enforced via HSTS
- Clickjacking protection via X-Frame-Options
- XSS protection via CSP (no `unsafe-inline` in script-src)

### Security Considerations
- All external resources loaded via HTTPS
- Service worker only registers on HTTP/HTTPS (not file://)
- The Umami analytics script-src hash (`sha256-...`) is fragile — if Umami
  changes their snippet, the hash must be updated in the CSP or analytics will
  break
- No user input processed on client side
- No forms that could be vulnerable to CSRF

---

## 📚 Additional Resources

### Learning Materials
- **HTML/CSS**: MDN Web Docs (https://developer.mozilla.org/)
- **JavaScript**: JavaScript.info (https://javascript.info/)
- **Accessibility**: WebAIM (https://webaim.org/)
- **Performance**: Google Web Fundamentals
- **Service Workers**: https://developers.google.com/web/fundamentals/primers/service-workers

### Tools
- **Code Editor**: VS Code with ESLint, Prettier
- **Browser Testing**: Chrome DevTools
- **Performance**: WebPageTest (https://www.webpagetest.org/)
- **Design**: Figma, Adobe XD
- **Image Optimization**: TinyPNG, ImageOptim

---

## 🤝 Handover Information

### Documentation Maintenance

Review and update `README.md` (root project README), this file, the root
`AGENTS.md` and `TODO.md` in the same commit as any major change — and
periodically otherwise. If a command, version ritual, file list or
behaviour description here no longer matches reality, the doc is stale and
must be fixed. See the root `AGENTS.md` for the full rule.

### For New Developers
- **Repository**: https://github.com/TUe-EdTech/remotelabs-website
- **Hosting**: TU/e web servers
- **Domain**: remote-labs.eu (site; the Remote Labs platform app lives at remotelabs.tue.nl)
- **Primary Contact**: Karel Aarts (k.m.a.aarts@tue.nl)
- **Technical Support**: TU/e IT Department

### Transition Checklist
- [ ] Provide GitHub repository access
- [ ] Provide hosting access credentials
- [ ] Explain deployment process
- [ ] Review current file structure
- [ ] Demonstrate common update procedures
- [ ] Answer questions about the codebase
- [ ] Provide contact information for follow-up

---

## 📋 Quick Reference: Commands

```bash
# === DEVELOPMENT ===

# Install dependencies
npm install

# Build all assets (includes version bump)
cd production_source && node build.js

# Or build individually
npm run build:css    # Minify CSS
npm run build:js     # Minify JavaScript
npm run build:html   # Copy HTML files
npm run build        # Run all build steps

# Bump version only
node scripts/bump-version.js

# === DEPLOYMENT ===

# Copy to deploy folder
cp production_source/index.html production_source/privacy.html production_source/sw.js deploy/

# Verify deployment
curl -I https://remote-labs.eu/sw.js  # Check service worker header
curl -I https://remote-labs.eu/      # Check HTML cache headers

# === TROUBLESHOOTING ===

# Force cache clear in browser
Ctrl+Shift+R  # Windows/Linux hard refresh
Cmd+Shift+R   # Mac hard refresh

# Check service worker in Chrome
chrome://serviceworker-internals/  # View registered service workers

# Unregister service worker manually
navigator.serviceWorker.getRegistrations().then(r => r.forEach(f => f.unregister()))
```

---

**Last Updated**: 2026
**Maintainer**: Development Team
**Repository**: https://github.com/TUe-EdTech/remotelabs-website (public)
