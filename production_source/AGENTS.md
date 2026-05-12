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
8. [Testing & Quality Assurance](#-testing--quality-assurance)
9. [Deployment](#-deployment)
10. [Maintenance](#-maintenance)
11. [Security](#-security)

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
│   ├── styles_new.css             # Alternative CSS
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
    ├── package.json              # Node.js package configuration
    ├── package-lock.json          # Dependency lock file
    └── node_modules/              # Node modules (dependencies)
```

### Color Scheme
- **Primary**: `#2563eb` (blue)
- **Black**: `#000`
- **White**: `#fff`
- **Gray 50**: `#f9fafb`
- **Gray 100**: `#f3f4f6`
- **Middle Section**: `#f8faff` (light blue-gray)
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
2. Minify CSS and JavaScript
3. Copy updated files to `deploy/` folder
4. Test `deploy/` version locally

### Deployment Steps
1. **Upload** all files from `deploy/` folder to server root
2. **Verify** file permissions (readable by web server)
3. **Test** live site on all devices
4. **Check** all links and functionality

### Server Configuration
- **HTTPS**: Required (HSTS header enforced)
- **MIME Types**: Ensure proper types for .mp4, .webmanifest, etc.
- **Caching**: Configure for static assets
- **Root Directory**: `/` or `/public_html/` depending on hosting

### Post-Deployment
- Verify all pages load correctly
- Test all interactive elements
- Check video playback
- Monitor for errors in console
- Test on mobile devices

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

**Last Updated**: 2024
**Maintainer**: Development Team
**Repository**: https://github.com/KarelAarts/remotelabs-website

---

*This document is for internal use only. The repository is private.*