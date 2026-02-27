# Remote Labs Website

**A clean, professional one-page website for Remote Labs - 24/7 Access to Physical Lab Experiments at Eindhoven University of Technology.**

## 📋 Project Overview

This is a static website for Remote Labs at TU/e, providing information about 24/7 access to physical lab experiments. The site is designed to be fast, accessible, and easy to maintain.

## 🚀 Getting Started

### Prerequisites
- No special software required
- Basic knowledge of HTML, CSS, and JavaScript
- Text editor (VS Code, Sublime Text, etc.)

### Installation
1. Clone this repository or download the ZIP file
2. Extract files to your project directory
3. Open `index.html` in any modern browser

### Development Setup
```bash
# Install dependencies (for minification)
npm install
```

## 📁 Project Structure

```
remotelabs-website/
├── index.html              # Main landing page
├── index_backup.html       # Backup of main page
├── styles.css              # Full CSS stylesheet
├── styles.min.css          # Minified CSS (production)
├── script.js               # Full JavaScript
├── script.min.js          # Minified JavaScript (production)
├── assets/                 # Static assets (images, fonts)
├── error_pages/            # Custom error pages (400, 401, 403, 404, 500)
├── privacy.html            # Privacy policy page
├── cookie_consent.html     # Cookie consent template
├── dnt_script.html         # Do Not Track script
├── sw.js                   # Service worker for offline support
├── package.json            # Node.js package configuration
├── package-lock.json       # Dependency lock file
└── .gitattributes          # Git configuration
```

## 🛠️ Development Workflow

### Making Changes
1. **Edit files**: Modify HTML, CSS, or JavaScript as needed
2. **Test locally**: Open `index.html` in browser to verify changes
3. **Minify assets** (for production):
   ```bash
   npm run minify-css
   npm run minify-js
   ```

### Common Tasks
- **Update content**: Edit `index.html` directly
- **Change styling**: Modify `styles.css`
- **Add functionality**: Update `script.js`
- **Add images**: Place files in `assets/` folder

## 🎨 Customization Guide

### Text Content
- Edit text directly in `index.html`
- Main sections: Hero, Features, About, Contact
- Update meta tags for SEO in `<head>` section

### Styling
- **Colors**: Modify CSS variables in `styles.css`
- **Fonts**: Update Google Fonts links or add local fonts
- **Layout**: Adjust responsive breakpoints as needed

### Images
- Add images to `assets/` folder
- Update references in HTML/CSS
- Optimize images for web (use JPEG/PNG, compress)

### JavaScript
- Add new functionality to `script.js`
- Use ES6+ features (supported in modern browsers)
- Follow existing code patterns

## 🚀 Deployment

### Requirements
- Any static web hosting service
- No server-side processing needed
- HTTPS recommended for security

### Deployment Steps
1. **Minify assets** (if not already done):
   ```bash
   npm run build
   ```
2. **Upload all files** to your hosting provider
3. **Test in production** environment
4. **Set up analytics** (Umami tracking included)

### Recommended Hosting
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any shared hosting

## 📱 Browser Support

| Browser       | Support Level | Notes                     |
|--------------|---------------|---------------------------|
| Chrome       | ✅ Full        | Latest 2 versions         |
| Firefox      | ✅ Full        | Latest 2 versions         |
| Safari       | ✅ Full        | Latest 2 versions         |
| Edge         | ✅ Full        | Chromium-based            |
| IE11         | ⚠️ Limited     | Basic functionality only  |

## 🔧 Maintenance

### Regular Tasks
- Update content as needed
- Check for broken links
- Test across browsers
- Monitor performance
- Update dependencies

### Performance Optimization
- Minify CSS and JavaScript
- Optimize images
- Enable browser caching
- Use CDN for assets

## 📝 Documentation

### Key Files to Understand
- `index.html`: Main page structure
- `styles.css`: All styling rules
- `script.js`: All JavaScript functionality
- `sw.js`: Service worker for offline support

### Code Standards
- **HTML**: Semantic HTML5, proper indentation
- **CSS**: BEM methodology, mobile-first
- **JavaScript**: ES6+, modular approach
- **Naming**: lowercase-with-hyphens.js

## 🤝 Handover Checklist

When transferring this project:
1. [ ] Provide access to hosting
2. [ ] Share analytics credentials
3. [ ] Explain content update process
4. [ ] Demonstrate deployment procedure
5. [ ] Provide contact for questions

## 📄 License

MIT License - Free to use and modify for Remote Labs at TU/e

## 📬 Contact

For questions about this project, contact the development team or refer to the project documentation.

---

**Last updated**: 2024-02-27
