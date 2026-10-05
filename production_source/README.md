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
│   ├── styles.min.css             # Minified styles
│   ├── script.min.js              # Minified JavaScript
│   ├── assets/                    # Images, videos, logos
│   └── error_pages/               # Custom error pages (400, 401, 403, 404, 500)
└── production_source/            # Development files (keep for future edits)
    ├── index.html                 # Source HTML
    ├── styles.css                 # Source CSS
    ├── script.js                  # Source JavaScript
    └── assets/                    # Source assets
```

## Making Changes

1. **Edit files** in the `production_source/` folder
2. **Test locally** by opening the file in your browser
3. **Minify** before deploying:
   ```bash
   # Minify CSS
   npx clean-css -o deploy/styles.min.css production_source/styles.css
   
   # Minify JavaScript  
   npx uglifyjs production_source/script.js -o deploy/script.min.js -c -m
   ```
4. **Copy** updated files to `deploy/` folder
5. **Test** the deploy version before uploading to server

## Important Files

- **Main Page**: `deploy/index.html` - Edit this for content changes
- **Styles**: `deploy/styles.min.css` - Main stylesheet
- **Images/Logos**: `deploy/assets/` - All images and videos
- **Error Pages**: `deploy/error_pages/` - Custom error pages

## Domain & Hosting

- **Domain**: remote-labs.eu
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

## Maintenance Tasks

### Regular:
- Content updates (text, images)
- Check links are working
- Test on mobile devices

### As Needed:
- Update partner logos in `assets/Partner logos/`
- Update video content in `assets/videos/`
- Review and update privacy policy

## Emergency Contacts

- **Primary**: Karel Aarts (k.m.a.aarts@tue.nl)
- **Technical Support**: TU/e IT Department

## Notes

- This is a static site - no database, no server-side code
- All files are HTML, CSS, and JavaScript
- No cookies are collected (as stated on the site)
- Service worker provides basic offline support

---

**Last Updated**: 2024
**Maintained by**: Eindhoven University of Technology