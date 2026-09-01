# Remote Labs Website Development Guide

**Comprehensive documentation for developers working on the Remote Labs website project.**

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
- Service worker for offline support

**Domain**: remotelabs.tue.nl

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
git clone https://github.com/KarelAarts/remotelabs-website.git
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
├── README.md                      # Handover guide (private)
├── deploy/                        # ✅ PRODUCTION FILES - Upload to server
│   ├── index.html                 # Main landing page
│   ├── privacy.html               # Privacy policy page
│   ├── manifest.json              # Web app manifest
│   ├── script.min.js              # Minified JavaScript (production)
│   ├── styles.min.css             # Minified CSS (production)
│   ├── sw.js                      # Service worker for offline support
│   ├── cookie_consent.html        # Cookie consent template
│   ├── dnt_script.html            # Do Not Track script
│   ├── assets/                    # Static assets
│   │   ├── Partner logos/          # Partner organization logos
│   │   ├── TUe-logo-descriptor-line-scarlet-S.png
│   │   └── videos/                # Video files
│   └── error_pages/               # Custom error pages
│       ├── 400.shtml              # Bad Request
│       ├── 401.shtml              # Unauthorized
│       ├── 403.shtml              # Forbidden
│       ├── 404.shtml              # Page Not Found
│       └── 500.shtml              # Internal Server Error
└── production_source/            # 🛠️ DEVELOPMENT FILES
    ├── index.html                 # Source HTML
    ├── styles.css                 # Source CSS
    ├── script.js                  # Source JavaScript
    ├── sw.js                      # Source Service Worker
    ├── package.json              # Node.js package configuration
    ├── package-lock.json          # Dependency lock file
    └── node_modules/              # Node modules (dependencies)
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
- **Methodology**: BEM (Block Element Modifier) preferred
- **Organization**: Group styles by component/functionality
- **Variables**: Use CSS variables for colors and common values
- **Responsive**: Mobile-first approach
- **Breakpoints**: 480px (mobile), 768px (tablet), 1024px (desktop)
- **Specificity**: Keep low, avoid `!important`

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
- Edit `production_source/styles.css`
- Minify and copy to `deploy/styles.min.css`
- Test responsiveness on mobile, tablet, desktop

### Updating JavaScript
- Edit `production_source/script.js`
- Minify and copy to `deploy/script.min.js`
- Test all interactive elements

### Adding New Page
1. Create HTML file in `production_source/`
2. Add corresponding styles to `production_source/styles.css`
3. Add functionality to `production_source/script.js` (if needed)
4. Minify and copy to `deploy/`
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
CACHE_NAME=v2
ASSET_VERSION=v2
```

#### 2. Automated Version Bump Script

Create `scripts/bump-version.js`:

```javascript
// scripts/bump-version.js
const fs = require('fs');
const path = require('path');

// Read current version
const versionFile = path.join(__dirname, '../VERSION');
const versionData = fs.readFileSync(versionFile, 'utf8');
const matches = versionData.match(/ASSET_VERSION=(v\d+)/);
const currentVersion = matches ? matches[1] : 'v1';
const newVersion = `v${parseInt(currentVersion.substring(1)) + 1}`;

// Update VERSION file
fs.writeFileSync(versionFile, `CACHE_NAME=${newVersion}\nASSET_VERSION=${newVersion}\n`);

// Update Service Worker
const swPath = path.join(__dirname, '../production_source/sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-\d+'/g, `const CACHE_NAME = 'remotelabs-${newVersion.substring(1)}'`);
fs.writeFileSync(swPath, swContent);

// Update HTML files
const htmlFiles = [
    '../production_source/index.html',
    '../production_source/privacy.html'
];

for (const htmlFile of htmlFiles) {
    let htmlContent = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');
    htmlContent = htmlContent.replace(/\?v=\d+/g, `?v=${newVersion.substring(1)}`);
    htmlContent = htmlContent.replace(/(\.min\.(css|js))("|')/g, `$1?v=${newVersion.substring(1)}$3`);
    fs.writeFileSync(path.join(__dirname, htmlFile), htmlContent);
}

console.log(`Version bumped to ${newVersion}`);
console.log('Updated:');
console.log(`  - VERSION file`);
console.log(`  - production_source/sw.js`);
console.log(`  - production_source/index.html`);
console.log(`  - production_source/privacy.html`);
console.log('\nNext steps:');
console.log('  1. Rebuild assets (npm run build)');
console.log('  2. Copy to deploy/ folder');
console.log('  3. Deploy to server');
```

Run with: `node scripts/bump-version.js`

#### 3. Full Build Script with Auto-Versioning

Update `production_source/build.js` to include version bumping:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build process...\n');

// Step 1: Bump version
console.log('Bumping version...');
try {
  const versionPath = path.join(__dirname, '../VERSION');
  let versionData = fs.readFileSync(versionPath, 'utf8');
  const matches = versionData.match(/ASSET_VERSION=(v\d+)/);
  const currentVersion = matches ? matches[1] : 'v1';
  const newVersion = `v${parseInt(currentVersion.substring(1)) + 1}`;
  
  // Update VERSION file
  fs.writeFileSync(versionPath, `CACHE_NAME=${newVersion}\nASSET_VERSION=${newVersion}\n`);
  
  // Update Service Worker
  const swPath = path.join(__dirname, 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = 'remotelabs-\d+'/g, `const CACHE_NAME = 'remotelabs-${newVersion.substring(1)}'`);
  fs.writeFileSync(swPath, swContent);
  
  // Update HTML files
  const htmlFiles = ['index.html', 'privacy.html'];
  for (const htmlFile of htmlFiles) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    htmlContent = htmlContent.replace(/\?v=\d+/g, `?v=${newVersion.substring(1)}`);
    htmlContent = htmlContent.replace(/(\.min\.(css|js))("|')/g, `$1?v=${newVersion.substring(1)}$3`);
    fs.writeFileSync(htmlFile, htmlContent);
  }
  
  console.log(`✓ Version bumped to ${newVersion}\n`);
} catch (error) {
  console.warn('Version bump skipped (no VERSION file found)');
}

// Step 2: Build CSS
console.log('Building CSS...');
try {
  execSync('clean-css -o ../deploy/styles.min.css styles.css', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✓ CSS minified successfully\n');
} catch (error) {
  console.error('✗ CSS build failed:', error.message);
}

// Step 3: Build JavaScript
console.log('Building JavaScript...');
try {
  execSync('uglifyjs script.js -o ../deploy/script.min.js -c -m', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✓ JavaScript minified successfully\n');
} catch (error) {
  console.error('✗ JavaScript build failed:', error.message);
}

// Step 4: Copy HTML files
console.log('Copying HTML files...');
try {
  const filesToCopy = ['index.html', 'privacy.html', 'sw.js'];
  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, '../deploy', file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${file}`);
    } else {
      console.warn(`⚠ Source file ${file} not found, skipping`);
    }
  });
  console.log('\n');
} catch (error) {
  console.error('✗ HTML copy failed:', error.message);
  process.exit(1);
}

console.log('Build completed successfully! ✓');
console.log('\nGenerated files:');
console.log('  - deploy/styles.min.css');
console.log('  - deploy/script.min.js');
console.log('  - deploy/index.html');
console.log('  - deploy/privacy.html');
console.log('  - deploy/sw.js');
console.log('\n⚠️  REMEMBER: Deploy to server for changes to take effect!');
```

### Manual Version Update Steps

If not using automation, **ALWAYS** do this before deployment:

1. **Update Service Worker version** in `production_source/sw.js`:
   ```javascript
   const CACHE_NAME = 'remotelabs-v3';  // ⬅️ Increment version number
   ```

2. **Update asset query strings** in HTML files:
   ```html
   <!-- Change v=2 to v=3 -->
   <link rel="stylesheet" href="styles.min.css?v=3">
   <script src="script.min.js?v=3" defer></script>
   ```

3. **Update both files**: `index.html` and `privacy.html` in both `deploy/` and `production_source/`

4. **Verify**: Test in incognito mode before deploying

### Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | Initial | Original service worker |
| v2 | 2024 | Network-first strategy, cache-control meta tags |

---

## 🧪 Testing & Quality Assurance

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
- [ ] Videos play correctly
- [ ] Forms submit (if any)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] **Incognito mode test** (verifies no caching issues)

### Cache-Specific Testing
- [ ] Chrome DevTools > Application > Service Workers shows current version
- [ ] Chrome DevTools > Network tab shows CSS/JS with `?v=2` in URL
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
All pages include security meta tags:
- **Content-Security-Policy**: Restricts resource loading to prevent XSS
- **X-Frame-Options**: SAMEORIGIN (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: max-age=63072000; includeSubDomains; preload
- **Permissions-Policy**: Restricts browser features (geolocation, microphone, camera, payment)
- **Expect-CT**: Certificate Transparency enforcement
- **Referrer-Policy**: strict-origin-when-cross-origin

### Security Best Practices
- ✅ No cookies collected
- ✅ No eval() or dynamic code evaluation
- ✅ DOM manipulation instead of document.write()
- ✅ Font Awesome uses Subresource Integrity (SRI)
- ✅ HTTPS enforced via HSTS
- ✅ Clickjacking protection via X-Frame-Options
- ✅ XSS protection via CSP and X-XSS-Protection

### Security Considerations
- All external resources loaded via HTTPS
- Service worker only registers on HTTP/HTTPS (not file://)
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

### For New Developers
- **Repository**: https://github.com/KarelAarts/remotelabs-website
- **Hosting**: TU/e web servers
- **Domain**: remotelabs.tue.nl
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
curl -I https://remotelabs.tue.nl/sw.js  # Check service worker header
curl -I https://remotelabs.tue.nl/      # Check HTML cache headers

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

**Last Updated**: 2024
**Maintainer**: Development Team
**Repository**: https://github.com/KarelAarts/remotelabs-website

---

*This document is for internal use only. The repository is private.*
