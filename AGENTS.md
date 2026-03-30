# Remote Labs Website Development Guide

**Comprehensive documentation for developers working on the Remote Labs website project.**

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Getting Started](#-getting-started)
3. [Project Structure](#-project-structure)
4. [Development Guidelines](#-development-guidelines)
5. [Code Standards](#-code-standards)
6. [Common Tasks](#-common-tasks)
7. [Testing & Quality Assurance](#-testing--quality-assurance)
8. [Deployment](#-deployment)
9. [Maintenance](#-maintenance)
10. [Troubleshooting](#-troubleshooting)

## 🎯 Project Overview

This guide provides comprehensive documentation for the Remote Labs website at Eindhoven University of Technology. The website has been optimized for performance, accessibility, and user experience with modern features including scroll-based navigation hiding, interactive toggle switches, and responsive design.

**Key Features**:
- Scroll-based header hiding (desktop & mobile)
- Modern toggle switch for workflow selection
- Optimized mobile experience
- Performance-focused design
- Accessible components

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

# Start development
# Simply open index.html in your browser
```

## 📁 Project Structure

```
remotelabs-website/
├── index.html              # Main landing page (optimized)
├── index_backup.html       # Backup of main page
├── styles.css              # Full CSS stylesheet
├── styles.min.css          # Minified CSS (production)
├── script.js               # Full JavaScript
├── script.min.js          # Minified JavaScript (production)
├── assets/                 # Static assets (images, fonts, TU/e logo)
│   └── TUe-logo-descriptor-line-scarlet-S.png  # University logo
├── error_pages/            # Custom error pages (400, 401, 403, 404, 500)
├── privacy.html            # Privacy policy page
├── cookie_consent.html     # Cookie consent template
├── dnt_script.html         # Do Not Track script
├── sw.js                   # Service worker for offline support
├── package.json            # Node.js package configuration
├── package-lock.json       # Dependency lock file
├── .gitattributes          # Git configuration
├── README.md               # Project documentation
└── agents.md               # Development guide (this file)
```

**Recent Additions**:
- TU/e logo integration in footer
- "How It Works" section with toggle functionality
- Mobile navigation bar
- Scroll-based header hiding

## 🛠️ Development Guidelines

### File Naming Conventions
- **HTML/CSS/JS**: `lowercase-with-hyphens.ext`
- **Backup files**: `original_backup.ext`
- **Images**: `descriptive-name.jpg/png`
- **Folders**: `lowercase_with_underscores/`

### HTML Standards
- **Semantic HTML5**: Use `<header>`, `<main>`, `<footer>`, etc.
- **Accessibility**: Include ARIA labels, alt text, proper heading hierarchy
- **Meta Tags**: Maintain SEO and social media meta tags
- **Indentation**: 2 spaces (consistent with existing code)

### CSS Architecture
- **Methodology**: BEM (Block Element Modifier)
- **Organization**: Group styles by component/functionality
- **Variables**: Use CSS variables for colors and common values
- **Responsive**: Mobile-first approach with appropriate breakpoints
- **Specificity**: Keep specificity low, avoid `!important`

### JavaScript Practices
- **ES6+ Features**: Use modern JavaScript (arrow functions, template literals, etc.)
- **Modularity**: Keep functions small and focused
- **Error Handling**: Implement proper try/catch blocks
- **DOM Ready**: Ensure DOM is loaded before manipulation
- **Comments**: Document complex logic and non-obvious code
- **Event Delegation**: Use for dynamic elements
- **Scroll Events**: Optimize with throttling/debouncing

### Performance Best Practices
- **Minification**: Always minify for production
- **Image Optimization**: Compress images before adding
- **Lazy Loading**: Implement for non-critical resources
- **Caching**: Leverage browser caching headers
- **CDN**: Use CDN for external libraries

## 📜 Code Standards

### HTML Example
```html
<!-- Good: Semantic, accessible, properly indented -->
<section class="feature-card" aria-labelledby="feature-title">
  <h2 id="feature-title" class="feature-card__title">Feature Title</h2>
  <p class="feature-card__description">Description text goes here.</p>
  <button class="feature-card__cta" aria-label="Learn more about feature">Learn More</button>
</section>
```

### CSS Example
```css
/* Good: BEM methodology, mobile-first, commented */
.feature-card {
  /* Block styles */
  background: var(--white);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-card__title {
  /* Element styles */
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--black);
}

.feature-card--highlighted {
  /* Modifier styles */
  border: 2px solid var(--primary-color);
}

@media (min-width: 768px) {
  .feature-card {
    padding: 2rem;
  }
}
```

### JavaScript Example
```javascript
// Good: Modular, well-commented, error handling
/**
 * Initialize feature cards with animation
 * @param {string} containerSelector - CSS selector for container
 */
function initFeatureCards(containerSelector) {
  try {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const cards = container.querySelectorAll('.feature-card');
    
    cards.forEach((card, index) => {
      // Add animation with delay
      card.style.animationDelay = `${index * 100}ms`;
      card.classList.add('animate-fade-in');
    });
  } catch (error) {
    console.error('Error initializing feature cards:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFeatureCards('.features-section');
});
```

## 🎯 Common Tasks

### Adding a New Page
1. **Create HTML file**: Follow existing structure
2. **Add to navigation**: Update `index.html` header
3. **Create styles**: Add to `styles.css` (grouped by component)
4. **Add functionality**: Update `script.js` if needed
5. **Test**: Verify across browsers and devices

### Updating Content
1. **Text changes**: Edit directly in `index.html`
2. **Image updates**: Replace files in `assets/` and update references
3. **Style adjustments**: Modify `styles.css`
4. **Functionality**: Update `script.js`

### Adding Interactive Components
1. **HTML Structure**: Create semantic markup
2. **CSS Styling**: Add responsive styles with proper states
3. **JavaScript**: Implement functionality with event listeners
4. **Animation**: Add smooth transitions (use cubic-bezier for consistency)
5. **Test**: Verify across devices and browsers

### Adding New Features
1. **Plan**: Document requirements and approach
2. **Implement**: Follow existing patterns
3. **Test**: Verify functionality and performance
4. **Document**: Update README if significant changes

### Modifying Existing Components
1. **Review**: Understand current implementation
2. **Change**: Make minimal, focused updates
3. **Test**: Ensure no regressions
4. **Document**: Note changes if they affect usage

### Adding Toggle Functionality
```javascript
// Example: Basic toggle implementation
const toggle = document.getElementById('toggle-id');
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');

toggle.addEventListener('change', function() {
    if (this.checked) {
        section1.classList.remove('active');
        section2.classList.add('active');
    } else {
        section2.classList.remove('active');
        section1.classList.add('active');
    }
});
```

## 🧪 Testing & Quality Assurance

### Testing Checklist
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile responsiveness (320px to 1200px)
- [ ] Console error-free
- [ ] HTML/CSS validation
- [ ] Accessibility audit
- [ ] Performance metrics (Lighthouse)
- [ ] Cross-browser compatibility
- [ ] Scroll functionality testing
- [ ] Toggle switch interaction
- [ ] Mobile navigation behavior

### Validation Tools
- **HTML**: https://validator.w3.org/
- **CSS**: https://jigsaw.w3.org/css-validator/
- **Accessibility**: https://wave.webaim.org/
- **Performance**: Chrome DevTools Lighthouse
- **Animation Performance**: Chrome DevTools Animation Inspector

### Performance Targets
- **Lighthouse Score**: 90+ (Performance, Accessibility, SEO)
- **Load Time**: < 2 seconds (3G connection)
- **Page Size**: < 1MB (including images)
- **Requests**: < 20 HTTP requests
- **Animation Performance**: 60 FPS on all devices

## 🚀 Deployment

### Preparation
1. **Minify assets**:
   ```bash
   npm run minify-css
   npm run minify-js
   ```
2. **Test production build** locally
3. **Update version** in package.json if significant changes

### Deployment Options

#### GitHub Pages
```bash
# Push to gh-pages branch
git subtree push --prefix remotelabs-website origin gh-pages
```

#### Netlify/Vercel
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `/`
4. Deploy

#### Traditional Hosting
1. Upload all files via FTP/SFTP
2. Configure domain pointing
3. Set up HTTPS
4. Test live site

### Post-Deployment
- Verify all links work
- Check analytics setup
- Monitor performance
- Set up error monitoring

## 🔧 Maintenance

### Regular Tasks
- **Content Updates**: Monthly review
- **Dependency Updates**: Quarterly
- **Browser Testing**: Before major releases
- **Performance Audit**: Quarterly
- **Backup**: Before major changes
- **Animation Testing**: Verify smooth transitions
- **Mobile Testing**: Check touch interactions

### Version Control
- **Commit Messages**: Descriptive and concise
- **Branching**: Feature branches for new development
- **Tags**: Version tags for releases
- **Issues**: Track bugs and features
- **Pull Requests**: Required for major changes

### Documentation Updates
- Update README.md for significant changes
- Keep AGENTS.md current
- Document major architectural decisions
- Maintain change log
- Update component documentation

## 🐛 Troubleshooting

### Common Issues & Solutions

#### CSS Not Applying
- **Cause**: Specificity conflict or load order
- **Solution**: Check browser dev tools, adjust specificity

#### JavaScript Errors
- **Cause**: DOM not ready or element not found
- **Solution**: Use DOMContentLoaded, add null checks

#### Responsive Issues
- **Cause**: Missing breakpoints or incorrect units
- **Solution**: Test with device emulation, adjust media queries

#### Performance Problems
- **Cause**: Large images or render-blocking resources
- **Solution**: Optimize images, defer non-critical JS

#### Animation Lag
- **Cause**: Complex animations or too many transforms
- **Solution**: Use `will-change`, simplify animations, use GPU acceleration

#### Scroll Events Firing Too Often
- **Cause**: Unoptimized scroll event listeners
- **Solution**: Implement throttling or debouncing

#### Toggle Not Working
- **Cause**: Missing event listeners or incorrect selectors
- **Solution**: Check console errors, verify element existence

### Debugging Workflow
1. **Reproduce**: Identify exact steps to reproduce
2. **Isolate**: Narrow down the problematic code
3. **Research**: Check documentation and similar issues
4. **Fix**: Implement minimal solution
5. **Test**: Verify fix works across devices
6. **Document**: Note the solution for future reference

## 📚 Additional Resources

### Learning Materials
- **HTML/CSS**: MDN Web Docs
- **JavaScript**: JavaScript.info
- **Accessibility**: WebAIM
- **Performance**: Google Web Fundamentals
- **Animations**: CSS Tricks Animation Guide
- **Scroll Effects**: ScrollMagic Documentation

### Tools
- **Code Editor**: VS Code with ESLint, Prettier
- **Browser Testing**: BrowserStack
- **Performance**: WebPageTest
- **Design**: Figma/Adobe XD
- **Animation Debugging**: Chrome DevTools Animation Inspector
- **Scroll Performance**: Chrome DevTools Performance Tab

## 🤝 Handover Information

### For New Developers
1. **Repository Access**: GitHub credentials
2. **Hosting Access**: Deployment credentials
3. **Analytics**: Umami dashboard access
4. **Domain**: DNS management access
5. **Documentation**: This guide and README
6. **Design Assets**: TU/e logo files and brand guidelines

### Transition Checklist
- [ ] Provide all access credentials
- [ ] Walk through deployment process
- [ ] Explain content update procedure
- [ ] Demonstrate common tasks
- [ ] Answer questions
- [ ] Provide contact for follow-up
- [ ] Review animation and scroll functionality
- [ ] Test mobile navigation behavior

## 📬 Support

For questions about this project:
1. Check the README.md first
2. Review this development guide
3. Consult the git history for context
4. Contact the development team

---

**Last updated**: 2024-07-15

**Maintainer**: Development Team

**License**: MIT License

**Recent Updates**:
- Added scroll-based navigation hiding
- Implemented modern toggle switch
- Optimized mobile experience
- Integrated TU/e logo
- Enhanced visual design