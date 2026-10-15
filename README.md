# Remote Labs Website - Handover Guide

## Overview

This is the official website for Remote Labs at Eindhoven University of Technology. It's a static website that provides information about our 24/7 access to physical lab experiments.

> **Start here**: `TODO.md` tracks completed and pending improvements with
> commit references; `AGENTS.md` summarizes the workflow rules for agents
> and contributors; `production_source/AGENTS.md` is the detailed
> development guide.

## Quick Start

The website is a simple static site. No build process or server required.

### To view locally:
Just open `deploy/index.html` in your web browser.

### To deploy:
Copy all files from the `deploy/` folder to your web server's root directory.

## Folder Structure

```
remotelabs-website/
├── AGENTS.md                     # Agent/contributor guide (read before planning work)
├── TODO.md                       # Improvement tracker: done/pending work
├── VERSION                       # Single source of truth for asset/cache versions
├── .gitattributes                # LF normalization (prevents phantom diffs)
├── .github/workflows/             # CI: build, tests, link check, Lighthouse
├── deploy/                        # ✅ PRODUCTION FILES - Upload to server (CI-built)
│   ├── index.html                 # Main page
│   ├── privacy.html               # Privacy policy
│   ├── landing-a.html             # Campaign page (Remote Labs ad, feedback form, noindex)
│   ├── landing-b.html             # Campaign page (online learning ad, notice only, noindex)
│   ├── styles.min.css             # Minified styles (versioned ?v= from VERSION)
│   ├── script.min.js              # Minified JavaScript
│   ├── sw.js                      # Service Worker (cache name from VERSION)
│   ├── manifest.json              # Web app manifest
│   ├── robots.txt                 # Search engine crawl rules + sitemap pointer
│   ├── sitemap.xml                # XML sitemap
│   ├── .htaccess                  # Real HTTP security headers (see Security)
│   ├── assets/                    # Images, videos, logos, fonts
│   ├── 400-500 .shtml             # Custom error pages (at deploy root)
│   └── cookie_consent.html / dnt_script.html  # TU/e integration fragments
├── experimental/                  # 🧪 EXPERIMENTAL DEVELOPMENT
│   ├── index.html                 # Experimental HTML source
│   ├── styles.css                 # Experimental CSS source
│   ├── script.js                  # Experimental JavaScript source
│   └── assets/fontawesome/        # Experimental-only assets (shared assets come from production_source/ at build time)
├── experimental_deploy/           # 🎯 EXPERIMENTAL BUILD OUTPUT (gitignored)
├── scripts/                      # Build and utility scripts
│   ├── build-experimental.js      # Build script for experimental folder
│   ├── build-experimental.bat     # Windows batch version
│   ├── check-links.js             # Link/asset/anchor integrity check
│   ├── partner-logos.js           # Shared partner-logo HTML generation
│   └── sync-experimental.js       # Sync experimental → production_source
├── lighthouserc.json             # CI Lighthouse budgets
└── production_source/            # Development source of truth
    ├── AGENTS.md                  # Detailed development guide
    ├── index.html                 # Source HTML
    ├── privacy.html               # Privacy policy source
    ├── landing-a.html              # Campaign page source (Remote Labs ad)
    ├── landing-b.html              # Campaign page source (online learning ad)
    ├── styles.css                 # Source CSS
    ├── script.js                  # Source JavaScript
    ├── sw.js                      # Source Service Worker
    ├── build.js                   # Canonical build (syncs VERSION, minifies, fills deploy/)
    ├── test.js                    # Source + version consistency tests (npm test)
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

### Automated Quality Gates (CI)

Every push and pull request to `main` runs these checks in GitHub Actions (`.github/workflows/build-and-deploy.yml`) against the freshly built `deploy/` output:

1. **Source consistency tests** — `npm test` in `production_source/` (JS syntax, CSP without `unsafe-inline`, version consistency).
2. **Link and asset integrity** — `node scripts/check-links.js deploy` verifies that every local link, image, video, font, icon, manifest entry and sitemap URL resolves to a real file, and that every in-page anchor (including SVG `<use>` icon refs) has a matching id. Run it manually with `node scripts/check-links.js experimental_deploy` to check an experimental preview.
3. **Lighthouse budgets** — `lighthouserc.json` fails the build if any category drops below its minimum score (accessibility / best-practices / SEO >= 0.9; performance >= 0.7, which is the current measured level minus margin — tighten it once the hero video is re-encoded, see the performance notes in `production_source/AGENTS.md`).

---

### Production Workflow

1. **Edit files** in the `production_source/` folder
2. **Bump the version** in the root `VERSION` file (PATCH) whenever assets changed and visitors must get fresh copies — this is the only place versions are ever set
3. **Build** (syncs version strings from `VERSION` into `sw.js`/HTML, minifies CSS/JS, regenerates `deploy/`):
   ```bash
   cd production_source
   npm install    # First time only
   npm run build:full
   ```
4. **Verify locally**: `npm test`, then `node scripts/check-links.js deploy`
5. **Commit source and `deploy/` together**. CI rebuilds, re-runs all gates and auto-commits the `deploy/` output on main.

Never hand-edit `?v=` strings or `CACHE_NAME` — bump `VERSION` and rebuild; `npm test` fails if source or `deploy/` drift from `VERSION`.

### Campaign Landing Pages

`landing-a.html` and `landing-b.html` are lean campaign pages, one per ad:

- **`landing-a.html`** (ad: Remote Labs) - pre-launch "coming soon" message
  with a **Share your feedback** button linking to an external feedback
  form (placeholder URL until the campaign form exists).
- **`landing-b.html`** (ad: online learning / MOOCs, without Remote Labs) -
  informational notice that the course isn't available yet. No CTA and no
  form link, by design.

- **Shared chrome**: both pages reproduce the index page's layout exactly:
  the same header/footer markup (including the inline SVG sprite and
  status badge), the same inline critical-CSS block copied from
  `index.html` (the fixed-header and base hero styles live there, not
  in `styles.min.css` - without it the header renders unstyled), the
  same `.hero` / `.hero-display` two-column hero structure, and
  `styles.min.css` loaded with a normal stylesheet link. Three
  functional deviations: the footer Quick Links to Benefits/Contact
  point to `https://remote-labs.eu/#benefits|#contact` (those sections
  don't exist on the landing pages), the header doesn't hide on scroll
  (`script.js` is not loaded on campaign pages), and the hero has no
  video (campaign pages stay lightweight). The CSP adds
  `https://img.shields.io` to `img-src` for the footer status badge.
- **No client-side experiment script** - the ads link directly to their
  landing page, so the strict CSP stays untouched.
- **SEO**: both pages are `noindex, follow` with a canonical link to
  `https://remote-labs.eu/`, and they are deliberately NOT in `sitemap.xml`.
- **Lighthouse CI**: they are deliberately NOT in `lighthouserc.json` -
  Lighthouse's SEO category fails `noindex` pages by design. Spot-check
  them manually (they are static and lightweight).
- **Attribution/conversion**: traffic on both pages is tracked
  automatically in the existing Umami property (both pages load the same
  script and website-id as `index.html` - pageviews appear per path).
  The variant A CTA links directly to the Microsoft feedback form
  (`https://forms.cloud.microsoft/e/HcHkv5rYBA`); since only
  `landing-a.html` links to it, form submissions are unambiguous.
  Variant B has no conversion link.
- **Adding/changing pages**: every page must be listed in three places -
  `htmlFiles` and `filesToCopy` in `production_source/build.js`, and `PAGES`
  in `production_source/test.js`.

---

## Important Files

- **Main Page**: `production_source/index.html` - Edit this for content changes (never edit `deploy/` directly)
- **Styles**: `production_source/styles.css` - All styles, including the former inline toggle/workflow block
- **JavaScript**: `production_source/script.js` - Site behaviour
- **Service Worker**: `production_source/sw.js` - Offline caching (version synced from `VERSION`)
- **Images/Logos**: `production_source/assets/` - All images and videos
- **Error Pages**: `deploy/400.shtml`, `deploy/404.shtml`, etc. (at deploy root)

## Video Loading Behaviour

- The hero video autoplays on normal connections; on Save-Data / 2G it is skipped (the AVIF poster stays) and only loads when the user presses Play.
- The below-the-fold workflow video ships with `preload="none"` and starts loading/playing via IntersectionObserver as its section approaches the viewport.
- Clicking a workflow step still switches its video instantly as before.

## Domain & Hosting

- **Site domain**: remote-labs.eu (canonical; the server also answers on
  www.remote-labs.eu without redirecting — all self-references, the
  sitemap and robots.txt use the apex)
- **Platform domain**: remotelabs.tue.nl (the Remote Labs platform
  application itself; the "Go to Remote Labs" CTAs point here — do not
  "fix" them to the site domain)
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

1. **Bump the root `VERSION` file** (PATCH number) — the single source of truth for both the service-worker cache name and the asset query strings.
2. **Run the build**: `cd production_source && npm run build:full`. It syncs the new version into `sw.js`, `index.html`, `privacy.html` and regenerates `deploy/` — you never edit version strings by hand.
3. Commit source and `deploy/` together.

`npm test` (locally and in CI) fails if `VERSION`, the source files, or `deploy/` disagree — version drift cannot reach production.

#### Deployment Steps:

1. Make your changes in `production_source/`
2. Bump `VERSION` and run `npm run build:full`
3. Upload the contents of `deploy/` to the server
4. **Verify**: Open in incognito mode or clear cache before testing

### 🔧 Service Worker Behavior

The updated `sw.js` uses a **Network-First** strategy with runtime cache-as-you-go:
- **HTML navigations**: Always fetched from network first; falls back to cached copy only when offline
- **CSS/JS/images**: Try network first, cache the response, fall back to cache if offline
- **No static precache list**: Assets are cached on first fetch, so there is no manual-bump failure mode
- **Old caches**: Automatically cleaned up on activation
- **Immediate activation**: `skipWaiting()` and `clients.claim()` ensure no delays
- **Registration**: `script.js` registers the service worker on page load (http/https only)

This means:
- ✅ Users always get fresh HTML
- ✅ Users get fresh CSS/JS when online
- ✅ Offline support still works
- ✅ Old versions don't persist

### 📋 Caching Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Visitors see old content | Service worker cache not invalidated | Bump `CACHE_NAME` version |
| CSS/JS not updating | Browser cache | Add/bump `?v=2.1.1` query string |
| HTML not updating | Browser cache | `Cache-Control: no-cache` meta tag |
| Some users still see old version | CDN cache | Contact TU/e IT to clear cache |

### 🎯 Verification Checklist

After deploying:
- [ ] Open site in **incognito/private window** (bypasses cache)
- [ ] Check Chrome DevTools > Application > Service Workers (should show the cache name from `VERSION`, e.g. `remotelabs-v2.1.7`)
- [ ] Check DevTools > Network tab: CSS/JS URLs carry the current `?v=` from `VERSION`
- [ ] Hard refresh (Ctrl+F5) to ensure fresh load
- [ ] Test on mobile device
- [ ] Ask a colleague to verify (they won't have cached version)

### 💡 Pro Tip: Emergency Cache Busting

Do **not** paste inline `<script>` snippets into the page — the CSP and
`npm test` forbid inline scripts (XSS hardening). The service worker is
network-first by design, so a `VERSION` bump plus deployment updates
everyone automatically. For a single stuck browser: DevTools >
Application > Service Workers > Unregister, then hard refresh.

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
1. Bump the root `VERSION` file (e.g. `v2.1.7` → `v2.1.8`)
2. Run `cd production_source && npm run build:full` (syncs sw.js/HTML and rebuilds `deploy/`)
3. Commit source + `deploy/` together

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

# Full build (canonical): syncs VERSION, minifies, regenerates deploy/
npm run build:full

# Individual steps (build.js already chains these)
npm run build:css    # Minify CSS (npx cleancss — the binary is named cleancss)
npm run build:js     # Minify JavaScript
npm run build:html   # Copy HTML files

# Quality gates (also run in CI)
npm test                             # Source + version consistency tests
node ../scripts/check-links.js ../deploy   # Link/asset/anchor integrity
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
