# Security Fixes - Handoff Document

**For:** Little brother in Mistral Vibe
**Date:** 2026-10-12
**Site:** remote-labs.eu
**Repo:** `remotelabs-website`

---

## TL;DR

Found 3 HIGH, 3 MEDIUM, and 4 LOW security issues. The production site is mostly fine, but the `experimental/` folder has weak security that needs fixing. Also need to add SRI to the analytics script.

**Do these in order. Each fix is independent - do one, test it, commit it.**

---

## Fix 1: Remove 'unsafe-inline' from Experimental CSP (HIGH)

**File:** `experimental/index.html`
**Line:** 15

**Problem:** The CSP allows inline scripts, which is an XSS hole.

**Current (BAD):**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; ...">
```

**Fix:** Remove `'unsafe-inline'` and move the inline scripts to external files.

**Steps:**
1. Open `experimental/index.html`
2. Find line 15 (the CSP meta tag)
3. Remove `'unsafe-inline'` from `script-src`:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://cloud.umami.is; ...">
   ```
4. Find the inline `<script>` at line 67-75 (the `getEmail` function)
5. Move it to a new file: `experimental/email-obfuscation.js`
6. Reference it externally: `<script src="email-obfuscation.js" defer></script>`
7. Do the same for the big inline script block starting around line 963
8. Test the page - make sure email links still work

**How to test:** Open `experimental/index.html` in a browser, open DevTools Console, check for CSP errors. Click the "Contact Us" button - it should open an email.

---

## Fix 2: Remove Inline Event Handlers (HIGH)

**File:** `experimental/index.html`
**Lines:** 103, 851, 854, 942

**Problem:** Inline `onclick` and `onload` handlers are XSS vectors and need `'unsafe-inline'` in CSP.

**Line 103 (BAD):**
```html
<link rel="stylesheet" href="styles.min.css?v=4" media="print" onload="this.media='all'">
```

**Fix for line 103:** Use the same pattern as production - see `production_source/script.js` lines 10-19. Add this to your external JS:
```js
(function swapAsyncStylesheet() {
    var link = document.getElementById('async-stylesheet');
    if (!link) return;
    function apply() { link.media = 'all'; }
    if (link.sheet) {
        apply();
    } else {
        link.addEventListener('load', apply);
    }
})();
```
And change the HTML to:
```html
<link rel="stylesheet" href="styles.min.css?v=4" media="print" id="async-stylesheet">
```

**Lines 851, 854, 942 (BAD):**
```html
<a href="#" onclick="window.location.href='mailto:'+getEmail('Remote Labs Inquiry');return false;">
```

**Fix:** Remove the `onclick` and use `href` directly with the email, OR use JavaScript event listeners.

Option A (simplest - just use real mailto links):
```html
<a href="mailto:k.m.a.aarts@tue.nl?subject=Remote%20Labs%20Inquiry" class="contact-button primary">
```

Option B (keep obfuscation): Add event listeners in your external JS:
```js
document.querySelectorAll('[data-email-subject]').forEach(function(el) {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mailto:' + getEmail(this.getAttribute('data-email-subject'));
    });
});
```
And in HTML:
```html
<a href="#" data-email-subject="Remote Labs Inquiry" class="contact-button primary">
```

---

## Fix 3: Add SRI to Umami Analytics Script (HIGH)

**File:** `production_source/index.html`
**Line:** 519

**Current (BAD):**
```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="8d0377d8-c1de-4001-b844-27ec489392ce"></script>
```

**Problem:** No integrity check. If Umami's CDN gets hacked, bad code runs on our site.

**Fix:** Add `integrity` and `crossorigin` attributes.

**Steps:**
1. Get the SRI hash for the Umami script:
   ```bash
   curl -s https://cloud.umami.is/script.js | openssl dgst -sha384 -binary | openssl base64 -A
   ```
2. Add the hash to the script tag:
   ```html
   <script defer src="https://cloud.umami.is/script.js"
           data-website-id="8d0377d8-c1de-4001-b844-27ec489392ce"
           integrity="sha384-YOUR_HASH_HERE"
           crossorigin="anonymous"></script>
   ```
3. **IMPORTANT:** Also update the CSP! The CSP currently whitelists an inline script hash for Umami. If you add SRI, you might be able to simplify the CSP, but keep the existing hash for now since Umami injects an inline script.
4. After editing `production_source/index.html`, you MUST:
   - Bump `VERSION` file (e.g., `v2.1.10` → `v2.1.11`)
   - Run `cd production_source && npm run build:full`
   - Commit both source and `deploy/`

**How to test:** Open the site, check DevTools Network tab - the script should load. Check Console for any SRI errors.

---

## Fix 4: Clean Up Orphaned Inline Scripts (MEDIUM)

**Files:** `deploy/cookie_consent.html`, `deploy/dnt_script.html`

**Problem:** These files have inline `<script>` blocks but aren't used anywhere. They're dead code that could confuse future developers.

**Fix:** Either delete them or move the JS to external files.

**Option A (recommended):** Delete them since they're not used:
```bash
rm deploy/cookie_consent.html deploy/dnt_script.html
```

**Option B:** If you want to keep the cookie consent functionality:
1. Move the JS from `cookie_consent.html` to a new file `cookie-consent.js`
2. Create a proper HTML page that includes it with external script reference
3. Make sure CSP allows it

---

## Fix 5: Add Missing Security Headers (LOW)

**File:** `deploy/.htaccess`

**Problem:** Missing modern security headers.

**Fix:** Add these inside the `<IfModule mod_headers.c>` block (after line 29):

```apache
# Cross-Origin-Resource-Policy (prevents Spectre attacks)
Header always set Cross-Origin-Resource-Policy "same-origin"

# Cross-Origin-Embedder-Policy (for future COEP support)
# Header always set Cross-Origin-Embedder-Policy "require-corp"
# (Commented out - enable only if you add CORP to all resources)
```

**Note:** After editing `.htaccess`, this file gets copied to `deploy/` during build. You need to:
1. Edit `production_source/.htaccess` (if it exists there) OR edit `deploy/.htaccess` directly
2. Actually, looking at the build script, `.htaccess` is copied FROM `production_source/` - so check if `production_source/.htaccess` exists
3. If not, the source of truth might be `deploy/.htaccess` directly - just edit that and commit

---

## Fix 6: Fix Manifest Theme Color (LOW)

**File:** `production_source/manifest.json` (and `deploy/manifest.json`)

**Line:** 8

**Current (BAD):**
```json
"theme_color": "#2563eb"
```

**Fix:** Change to black to match the site:
```json
"theme_color": "#000000"
```

Then rebuild: `cd production_source && npm run build:full`

---

## Fix 7: Scope GitHub Actions Permissions (LOW)

**File:** `.github/workflows/build-and-deploy.yml`

**Lines:** 9-10

**Current (OK but could be better):**
```yaml
permissions:
  contents: write
```

**Fix:** Move permissions to the specific job that needs it:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Only this job needs write access
```

And remove the top-level `permissions:` block, or set it to `contents: read` as default.

---

## Testing Checklist

After each fix, test:

- [ ] Open the site in incognito mode (Ctrl+Shift+N)
- [ ] Check DevTools Console for errors
- [ ] Check DevTools Network tab - all resources should load
- [ ] Check DevTools Application > Service Workers - should show current version
- [ ] Test on mobile (or DevTools device toolbar)
- [ ] Run `cd production_source && npm test` - should pass
- [ ] Run `node scripts/check-links.js deploy` - should pass

---

## Build & Deploy Commands

After making changes to `production_source/`:

```bash
# 1. Bump version
# Edit VERSION file: v2.1.10 -> v2.1.11

# 2. Build
cd production_source
npm run build:full

# 3. Test
npm test
node ../scripts/check-links.js ../deploy

# 4. Commit everything
cd ..
git add -A
git commit -m "Security: [describe fix]"
```

For changes to `experimental/`:

```bash
# Build experimental
node scripts/build-experimental.js

# Test experimental build
node scripts/check-links.js experimental_deploy
```

---

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Production HTML | `production_source/index.html` → `deploy/index.html` |
| Experimental HTML | `experimental/index.html` |
| Production JS | `production_source/script.js` → `deploy/script.min.js` |
| Service Worker | `production_source/sw.js` → `deploy/sw.js` |
| Security headers | `deploy/.htaccess` |
| Version | `VERSION` (root) |
| Build script | `production_source/build.js` |
| Tests | `production_source/test.js` |

---

## Questions?

If something breaks:
1. Check `TODO.md` for context
2. Check `README.md` for build instructions
3. Check `production_source/AGENTS.md` for detailed dev guide
4. Ask Karel: k.m.a.aarts@tue.nl

Good luck! 🚀
