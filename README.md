# Remote Labs Website 🚀

A clean, professional, and highly compatible one-page website for Remote Labs - 24/7 Access to Physical Lab Experiments.

![Remote Labs Screenshot](https://via.placeholder.com/800x450/2563eb/ffffff?text=Remote+Labs+Website)

[**View Live Demo**](#) | [**Report Issue**](#) | [**Contribute**](#)

## ✨ Features & Capabilities

### Core Features
- **📱 Responsive Design**: Works flawlessly on desktops, tablets, and mobile devices
- **🎨 Modern UI**: Clean, professional layout with smooth animations
- **🔗 Easy Navigation**: Fixed header with direct link to Remote Labs platform
- **📝 Comprehensive Sections**: Hero, Functionalities, Team, and Footer
- **🎓 TU/e Branding**: Color scheme aligned with Eindhoven University of Technology
- **🚀 Smooth Scrolling**: Enhanced navigation with smooth scroll behavior on all anchor links

### Advanced UX Enhancements
- **🎯 Sticky Navigation**: Header shrinks on scroll for better space utilization
- **↑ Back-to-Top Button**: Floating button appears after scrolling down
- **✨ Enhanced Interactions**: Improved hover states and micro-interactions
- **👆 Touch Feedback**: Visual responses to touch interactions on mobile
- **⌨️ Keyboard Navigation**: Full keyboard support for accessibility
- **🎯 Section Navigation**: Visual indicators showing current section with quick navigation
- **📊 Scroll Progress**: Visual progress bar showing page scroll position

### Performance & Optimization
- **🚀 Lazy Loading**: Images and iframes load only when visible
- **⚡ Critical CSS**: Inlined above-the-fold styles for faster rendering
- **📦 Minified Assets**: Optimized CSS and JavaScript files
- **💾 Caching Strategies**: Service Worker and cache manifest for offline support
- **📊 Performance Monitoring**: Built-in page load time tracking
- **🎯 Direct Smooth Scrolling**: Inline script ensures smooth scrolling works immediately

### Accessibility & Inclusivity
- **🔠 ARIA Labels**: Screen reader support for all interactive elements
- **🎯 Focus Management**: Proper focus states and tab order
- **👁️ High Contrast**: Optimized color contrast for readability
- **🔄 Reduced Motion**: Support for prefers-reduced-motion
- **🖱️ Keyboard Navigation**: Full keyboard-only usage support

### Mobile & Touch Optimization
- **📱 Mobile-First Design**: Optimized for small screens first
- **👆 Touch Interactions**: Enhanced touch feedback and gestures
- **📏 Responsive Typography**: Optimized font sizes for mobile
- **🎯 Tap Targets**: Minimum 44x44px touch areas
- **📲 Swipe Detection**: Navigation gesture support

### Cross-Browser Compatibility
- **🌐 Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **🔄 Legacy Support**: IE11 with graceful degradation
- **📱 Mobile Browsers**: iOS Safari, Android Chrome, Samsung Internet
- **🔧 Progressive Enhancement**: Features adapt to browser capabilities
- **🛠️ Polyfills**: Automatic loading for older browsers

### Development & Deployment
- **📦 Easy Installation**: Just open index.html in any browser
- **🔧 Customizable**: Simple content and style modifications
- **📝 Well Documented**: Comprehensive documentation included
- **🧪 Tested**: Cross-browser testing framework provided
- **🚀 Deployment Ready**: Optimized for any hosting platform

## 📖 Table of Contents

- [Features & Capabilities](#-features--capabilities)
- [Getting Started](#-getting-started)
- [Customization](#-customization)
- [Browser Support](#-browser-support)
- [Performance Optimization](#-performance-optimization)
- [Accessibility](#-accessibility)
- [Mobile Optimization](#-mobile-optimization)
- [Testing & QA](#-testing--qa)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#license)

## 🚀 Getting Started

### 📋 Prerequisites
- **Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+, or any modern browser
- **Text Editor**: VS Code, Sublime Text, or any code editor (for modifications)
- **Optional**: Node.js (for advanced development and testing)

### 📥 Installation

#### Quick Start (No Installation Needed)
1. **Download** the repository ZIP file
2. **Extract** the files to any folder
3. **Open** `index.html` in your web browser
4. **Done!** 🎉 The website loads automatically

#### For Developers
```bash
# Clone the repository
git clone https://github.com/your-repo/remotelabs-website.git
cd remotelabs-website

# Install dependencies (if needed for development)
npm install

# Start development server
npm start

# Or simply open index.html
open index.html
```

### 🌐 Deployment Options

#### Simple Hosting
1. Upload all files to any web hosting service
2. Access via the provided URL
3. No server-side requirements

#### GitHub Pages
```bash
# Push to GitHub repository
git push origin main

# Enable GitHub Pages in repository settings
# Select 'main' branch and '/ (root)' folder
```

#### Netlify/Vercel
1. Connect your GitHub repository
2. Automatic deployment on push
3. Instant global CDN distribution

#### University Server
1. Upload files to TU/e web server
2. Configure appropriate permissions
3. Set up HTTPS if available

### 🛠️ Development Setup

#### Recommended Tools
- **Code Editor**: VS Code with Live Server extension
- **Browser Tools**: Chrome DevTools, Firefox Developer Tools
- **Testing**: BrowserStack, LambdaTest accounts
- **Performance**: Lighthouse, WebPageTest

#### File Structure
```
remotelabs-website/
├── index.html          # Main HTML with all optimizations
├── styles.css          # Full CSS (development)
├── styles.min.css      # Minified CSS (production)
├── script.js          # Full JavaScript (development)
├── script.min.js      # Minified JavaScript (production)
├── sw.js              # Service Worker for offline support
├── cache.manifest     # Cache manifest for PWA
├── README.md          # Comprehensive documentation
├── browser-testing.html # Cross-browser testing framework
└── assets/            # (Create this folder for images)
    ├── logo.png        # Remote Labs logo (120x40px)
    ├── team1.jpg       # Team member 1 (300x300px)
    ├── team2.jpg       # Team member 2 (300x300px)
    └── team3.jpg       # Team member 3 (300x300px)
```

### 🔧 Configuration

#### Customization Points
- **Content**: Edit text in `index.html`
- **Colors**: Modify CSS variables in `styles.css`
- **Layout**: Adjust grid templates in CSS
- **Behavior**: Modify JavaScript in `script.js`
- **Performance**: Tweak lazy loading thresholds

#### Environment Variables
Create a `.env` file for development:
```env
# Development server settings
PORT=3000
DEBUG=true

# Analytics (if implemented)
GA_TRACKING_ID=your-tracking-id
```

### Customization

#### Replace Placeholder Content
1. **Logo**: Replace `logo.png` with your Remote Labs logo
2. **Video**: Update the YouTube embed URL in `index.html` (line 27)
3. **Team Photos**: Replace `team1.jpg`, `team2.jpg`, `team3.jpg` with actual team member photos
4. **Testimonials**: Update the testimonial text and authors in the Benefits section

#### Update Content
- Edit text content directly in `index.html`
- Modify colors in `styles.css` by changing the CSS variables at the top
- Adjust layout and spacing in `styles.css`

#### Branding Colors
The website uses TU/e's branding colors:
- Primary: `#0069b4` (TU/e blue)
- Secondary: `#00a8e8` (Light blue)
- Accent: `#ffd200` (Yellow)

### File Structure

```
remotelabs-website/
├── index.html          # Main HTML structure with enhanced UX features
├── styles.css          # CSS styling with responsive enhancements
├── script.js          # JavaScript functionality with UX improvements
├── README.md          # This documentation
└── assets/            # (Create this folder for images)
    ├── logo.png        # Remote Labs logo (lazy loaded)
    ├── team1.jpg       # Team member 1 photo (lazy loaded)
    ├── team2.jpg       # Team member 2 photo (lazy loaded)
    └── team3.jpg       # Team member 3 photo (lazy loaded)
```

### UX Enhancements Implemented

#### Navigation Improvements
- **Sticky Header**: Header shrinks on scroll for better space utilization
- **Back-to-Top Button**: Floating button appears after scrolling down
- **Smooth Scrolling**: Enhanced anchor link navigation

#### Visual Enhancements
- **Alternating Section Backgrounds**: Improved visual separation between sections
- **Hero CTA Button**: Added prominent call-to-action in hero section
- **Enhanced Hover States**: Improved feedback on all interactive elements

#### Accessibility Features
- **ARIA Labels**: Added to all interactive elements for screen readers
- **Keyboard Navigation**: Full support for keyboard-only users
- **Focus Management**: Proper focus states and tab order
- **Color Contrast**: Optimized for better readability

#### Performance Optimizations
- **Lazy Loading**: All images and iframes load only when visible
- **Efficient CSS**: Optimized selectors and reduced complexity
- **JavaScript Optimization**: Event delegation and reduced DOM manipulations

#### Mobile Enhancements
- **Touch Feedback**: Visual feedback on touch interactions
- **Responsive Elements**: All new features adapt to screen size
- **Mobile-Specific Optimizations**: Button sizes and spacing adjusted for touch

## 🎨 Customization

### 📝 Content Customization

#### Replace Placeholder Content
1. **Logo**: Replace `assets/logo.png` with your Remote Labs logo (120x40px recommended)
2. **Video**: Update the Vimeo embed URL in `index.html` (line ~45)
3. **Team Photos**: Replace `assets/team1.jpg`, `team2.jpg`, `team3.jpg` (300x300px recommended)
4. **Testimonials**: Update text and authors in the Benefits section

#### Update Content
- **Text Content**: Edit directly in `index.html`
- **Colors**: Modify CSS variables at the top of `styles.css`
- **Layout**: Adjust grid templates and spacing in `styles.css`
- **Behavior**: Modify JavaScript in `script.js`

### 🎨 Design Customization

#### Branding Colors
The website uses TU/e's branding colors (modify in `styles.css`):
```css
:root {
    --highlight-color: #2563eb;  /* TU/e blue */
    --black: #000000;
    --white: #ffffff;
    /* Add or modify other colors as needed */
}
```

#### Typography
```css
/* Modify in styles.css */
body {
    font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif;
}
h1, h2, h3, h4 {
    font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif;
}
```

### 🔧 Advanced Customization

#### JavaScript Enhancements
```javascript
// Add custom behavior in script.js
document.addEventListener('DOMContentLoaded', function() {
    // Your custom JavaScript here
    console.log('Custom behavior loaded');
});
```

#### CSS Animations
```css
/* Add custom animations in styles.css */
@keyframes customAnimation {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.custom-element {
    animation: customAnimation 0.5s ease-out;
}
```

### 📱 Mobile-Specific Customization

#### Responsive Breakpoints
```css
/* Modify in styles.css */
@media (max-width: 768px) {
    /* Tablet styles */
}

@media (max-width: 480px) {
    /* Mobile styles */
}
```

#### Touch Targets
```css
/* Ensure minimum touch target sizes */
button, a {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
}
```

### 🎯 UX Best Practices

1. **Maintain Contrast**: Ensure WCAG AA contrast ratios (4.5:1 for text)
2. **Preserve Navigation**: Keep core navigation patterns intact
3. **Accessibility First**: Maintain ARIA attributes and keyboard navigation
4. **Performance Mindset**: Optimize images, use lazy loading, minify assets
5. **Mobile Testing**: Test on multiple devices and screen sizes
6. **Progressive Enhancement**: Ensure core content works without JavaScript
7. **Browser Compatibility**: Test changes across supported browsers

### 🔄 Common Customization Examples

#### Change Hero Section
```html
<!-- In index.html -->
<section class="hero">
    <div class="container">
        <h2 class="hero-title">Your Custom Title</h2>
        <p class="hero-subtitle">Your custom subtitle here</p>
        <a href="#your-section" class="hero-cta-button">Custom CTA</a>
    </div>
</section>
```

#### Add New Section
```html
<!-- Add before </main> in index.html -->
<section class="new-section">
    <div class="container">
        <h3 class="section-title">New Section Title</h3>
        <div class="content-grid">
            <!-- Your content here -->
        </div>
    </div>
</section>
```

#### Modify Navigation
```html
<!-- In header section -->
<header>
    <div class="container">
        <div class="logo">
            <img src="logo.png" alt="Remote Labs Logo" class="logo-img">
            <h1 class="logo-text">Remote Labs</h1>
        </div>
        <!-- Add additional navigation items -->
        <nav class="main-nav">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
        </nav>
        <a href="https://remotelabs.tue.nl" class="cta-button">Go to Remote Labs</a>
    </div>
</header>
```

### Browser Support

The Remote Labs website is officially supported on the following browsers:

#### Modern Browsers (Full Support) 🎯
- **Chrome**: 80+ (Windows, macOS, Linux, Android)
- **Firefox**: 75+ (Windows, macOS, Linux, Android)
- **Safari**: 13+ (macOS, iOS)
- **Edge**: 80+ (Windows, macOS, Android)
- **Opera**: 67+ (Windows, macOS, Linux, Android)
- **Samsung Internet**: 10+ (Android)

#### Legacy Browsers (Partial Support) ⚠️
- **Internet Explorer 11**: Basic functionality only (no CSS Grid, CSS Variables, Service Workers)
- **Edge**: 12-79 (partial functionality, some features may not work)
- **Safari**: 10-12 (partial functionality, some CSS features may not work)
- **Chrome**: 60-79 (most features work, some performance limitations)
- **Firefox**: 50-74 (most features work, some CSS differences)

#### Unsupported Browsers ❌
- Internet Explorer 10 and below
- Safari 9 and below
- Android Browser (AOSP)
- Opera Mini
- UC Browser

### Progressive Enhancement Strategy

The website uses a progressive enhancement approach to ensure all users can access core content while providing enhanced experiences for modern browsers:

#### Core Experience (All Browsers)
```
✅ Basic HTML content and structure
✅ Semantic markup for accessibility
✅ Responsive layout with flexbox fallback
✅ Basic CSS styling
✅ Progressive JavaScript enhancement
```

#### Enhanced Experience (Modern Browsers)
```
✅ CSS Grid layouts
✅ CSS Variables for theming
✅ Smooth animations and transitions
✅ Lazy loading for images
✅ Intersection Observer for scroll effects
✅ Service Worker for offline support
✅ Advanced touch interactions
```

### Browser-Specific Features & Fixes

#### Internet Explorer 11
- **CSS Grid**: Not supported → Flexbox fallback implemented
- **CSS Variables**: Not supported → CSS vars ponyfill loaded
- **ES6 Modules**: Not supported → Nomodule fallback provided
- **Intersection Observer**: Not supported → Scroll event fallback
- **Service Worker**: Not supported → Graceful degradation

#### Safari
- **Smooth Scrolling**: Partial support → JavaScript fallback
- **Position Sticky**: Some issues → Specific CSS fixes
- **CSS Grid**: Different auto-placement → Adjusted layouts
- **Touch Events**: Full support → Enhanced touch handling

#### Firefox
- **Flexbox**: Minor rendering differences → Specific fixes
- **CSS Grid Gap**: Partial support → Margin fallback
- **Scroll Behavior**: Some quirks → Adjusted JavaScript

#### Mobile Browsers
- **Viewport Units**: Different behavior → Specific media queries
- **Touch Events**: Full support → Enhanced with passive listeners
- **Virtual Keyboard**: Handled → Input focus adjustments

### Cross-Browser Testing

#### Manual Testing Checklist
1. **Basic Functionality**: Verify all links and buttons work
2. **Responsive Design**: Test on multiple screen sizes (320px to 1920px)
3. **Touch Interactions**: Test on mobile devices or emulators
4. **Performance**: Check load times and smoothness
5. **Accessibility**: Test keyboard navigation and screen readers
6. **Offline**: Test Service Worker caching (if supported)
7. **Print Styles**: Test print preview and PDF generation

#### Automated Testing Tools
- **BrowserStack**: Cross-browser testing platform
- **LambdaTest**: Cross-browser testing platform
- **Lighthouse**: Performance & accessibility auditing
- **WebPageTest**: Performance testing across locations
- **axe DevTools**: Accessibility testing

#### Testing Command
```bash
# Run Lighthouse audit
lighthouse https://remotelabs.tue.nl --output=html --chrome-flags="--headless"

# Run accessibility audit
pa11y https://remotelabs.tue.nl
```

### Feature Detection & Polyfills

The website uses comprehensive feature detection to provide appropriate experiences:

```javascript
// Feature detection example
const features = {
    cssGrid: 'CSS' in window && 'supports' in CSS && CSS.supports('display', 'grid'),
    cssVariables: window.CSS && CSS.supports('--foo', 'bar'),
    intersectionObserver: 'IntersectionObserver' in window,
    serviceWorker: 'serviceWorker' in navigator,
    fetch: 'fetch' in window,
    passiveEvents: testPassiveEventSupport(),
    es6Modules: 'noModule' in HTMLScriptElement.prototype
};
```

#### Loaded Polyfills
- **Polyfill.io**: Comprehensive ES6+ polyfills
- **CSS Vars Ponyfill**: CSS Variables support for IE11
- **Intersection Observer Polyfill**: For older browsers
- **Passive Event Listeners**: For smooth scrolling performance

### Browser Support Matrix

| Browser | Version | Support Level | Notes |
|---------|---------|---------------|-------|
| Chrome | 80+ | ✅ Full | All features supported |
| Firefox | 75+ | ✅ Full | All features supported |
| Safari | 13+ | ✅ Full | All features supported |
| Edge | 80+ | ✅ Full | All features supported |
| Opera | 67+ | ✅ Full | All features supported |
| Samsung Internet | 10+ | ✅ Full | All features supported |
| Chrome | 60-79 | ⚠️ Partial | Most features work |
| Firefox | 50-74 | ⚠️ Partial | Most features work |
| Safari | 10-12 | ⚠️ Partial | Some CSS differences |
| Edge | 12-79 | ⚠️ Partial | Limited modern features |
| IE11 | 11 | ⚠️ Limited | Basic functionality only |
| IE10 | 10 | ❌ None | Not supported |

### Development & Testing Recommendations

#### For Developers
1. **Test in multiple browsers** during development
2. **Use feature detection** rather than browser detection
3. **Provide fallbacks** for critical functionality
4. **Test on real devices** when possible
5. **Use automated testing** tools regularly

#### For Content Editors
1. **Test content changes** in major browsers
2. **Check mobile responsiveness** after updates
3. **Verify accessibility** of new content
4. **Test performance** impact of large images/media

#### For QA Teams
1. **Create test cases** for each browser tier
2. **Automate regression testing** where possible
3. **Test on various network conditions** (3G, slow connections)
4. **Verify print styles** and PDF generation
5. **Test accessibility** with screen readers

### Troubleshooting Browser Issues

#### Common Issues & Solutions

**Issue**: CSS Grid not working in IE11
**Solution**: Website automatically falls back to flexbox layout

**Issue**: Animations not smooth in Safari
**Solution**: Reduced motion is automatically applied

**Issue**: JavaScript errors in older browsers
**Solution**: Polyfills are loaded automatically

**Issue**: Layout shifts on mobile
**Solution**: Explicit image dimensions prevent CLS

**Issue**: Touch interactions not working
**Solution**: Comprehensive touch event handling included

### Continuous Improvement

The browser support strategy will be regularly reviewed and updated based on:
- Browser usage statistics
- New browser releases
- Web standards evolution
- User feedback and analytics

## ❓ Troubleshooting

### 🐞 Common Issues & Solutions

#### Website Not Loading
- **Issue**: Blank page or loading errors
- **Solution**: Check browser console for errors
- **Check**: Verify all files are uploaded correctly
- **Check**: Ensure proper file permissions (644 for files, 755 for directories)

#### Styling Issues
- **Issue**: Layout looks broken
- **Solution**: Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- **Check**: Verify CSS files are loading
- **Check**: Test in multiple browsers

#### JavaScript Errors
- **Issue**: Console shows JavaScript errors
- **Solution**: Check for syntax errors in `script.js`
- **Check**: Verify polyfills are loading for older browsers
- **Check**: Test with JavaScript disabled (core content should still work)

#### Mobile Responsiveness Issues
- **Issue**: Layout doesn't adapt to mobile screens
- **Solution**: Check viewport meta tag is present
- **Check**: Test media queries in browser dev tools
- **Check**: Verify touch targets are adequate size

#### Performance Problems
- **Issue**: Slow page load times
- **Solution**: Run Lighthouse audit to identify bottlenecks
- **Check**: Optimize images (use TinyPNG or similar)
- **Check**: Minify CSS and JavaScript
- **Check**: Enable browser caching

#### Browser-Specific Issues
- **Issue**: Works in Chrome but not Firefox/Safari
- **Solution**: Check browser-specific CSS fixes
- **Check**: Test feature detection is working
- **Check**: Verify polyfills are loading

### 🔧 Debugging Tools

**Browser Developer Tools**
- Chrome: F12 or Ctrl+Shift+I
- Firefox: F12 or Ctrl+Shift+I
- Safari: Cmd+Opt+I (enable in Preferences > Advanced)
- Edge: F12 or Ctrl+Shift+I

**Useful Console Commands**
```javascript
// Check feature support
console.log('CSS Grid support:', CSS.supports('display', 'grid'));
console.log('Intersection Observer support:', 'IntersectionObserver' in window);

// Performance monitoring
console.log('Page load time:', performance.timing.loadEventEnd - performance.timing.navigationStart);

// Memory usage (Chrome)
console.log('Memory usage:', performance.memory.usedJSHeapSize / 1048576, 'MB');
```

**Network Throttling**
- Chrome DevTools: Network > Throttling > Add custom profile
- Firefox: Network > Throttling
- Test on: Slow 3G, Fast 3G, Regular 2G

### 📚 Common Error Messages

**Console Errors**
- `Uncaught TypeError: Cannot read property 'addEventListener' of null`
  - **Fix**: Check element exists before adding event listener
  - **Example**: `if (element) { element.addEventListener(...); }`

- `Failed to load resource: net::ERR_FILE_NOT_FOUND`
  - **Fix**: Verify file paths are correct
  - **Check**: Case sensitivity in filenames

- `Uncaught SyntaxError: Unexpected token '{'`
  - **Fix**: Older browser doesn't support ES6
  - **Solution**: Add Babel transpiler or use ES5 syntax

**CSS Issues**
- `Invalid property value`
  - **Fix**: Browser doesn't support CSS property
  - **Solution**: Add vendor prefixes or use fallback

- `Unknown pseudo-element or pseudo-class`
  - **Fix**: Browser doesn't support pseudo-class
  - **Solution**: Use different selector or polyfill

## 🤝 Contributing

### 📝 How to Contribute

We welcome contributions to the Remote Labs website! Here's how you can help:

#### Reporting Issues
1. Check existing issues to avoid duplicates
2. Provide detailed reproduction steps
3. Include browser, OS, and device information
4. Add screenshots or screen recordings if helpful
5. Use the issue template

#### Suggesting Features
1. Describe the feature and its benefits
2. Explain the use case
3. Provide examples or mockups if possible
4. Consider backward compatibility

#### Code Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly across browsers
5. Update documentation if needed
6. Submit a pull request

### 🔧 Development Setup

**Prerequisites**
- Node.js 14+ (for development tools)
- Git
- Code editor (VS Code recommended)

**Installation**
```bash
# Clone the repository
git clone https://github.com/your-repo/remotelabs-website.git
cd remotelabs-website

# Install dependencies
npm install

# Start development server
npm start

# Or use Live Server extension in VS Code
```

### 📋 Code Guidelines

**HTML**
- Use semantic HTML5 elements
- Maintain proper indentation (2 spaces)
- Include appropriate ARIA attributes
- Use lowercase for tags and attributes

**CSS**
- Use CSS variables for colors and spacing
- Follow BEM-like naming convention
- Organize by component/function
- Include comments for complex styles
- Use rem units for spacing, em for typography

**JavaScript**
- Use ES6+ features with fallbacks
- Follow progressive enhancement principles
- Add JSDoc comments for functions
- Use event delegation where appropriate
- Handle errors gracefully

**Accessibility**
- All interactive elements must be keyboard accessible
- Provide text alternatives for images
- Ensure sufficient color contrast
- Use semantic HTML
- Test with screen readers

### 🧪 Testing Requirements

**Before Submitting**
1. Test in Chrome, Firefox, Safari, Edge
2. Test on mobile devices
3. Verify accessibility (axe DevTools)
4. Check performance (Lighthouse)
5. Test with JavaScript disabled
6. Validate HTML and CSS

**Test Coverage**
- Chrome latest
- Firefox latest
- Safari latest
- Edge latest
- Mobile Chrome (Android)
- Mobile Safari (iOS)
- IE11 (basic functionality)

### 📊 Pull Request Process

1. Ensure your code follows the guidelines
2. Update documentation if needed
3. Include tests if applicable
4. Reference related issues
5. Provide clear description of changes
6. Include screenshots if UI changes
7. Be responsive to feedback

## License

### 📄 Open Source License

This project is open-source and free to use for Remote Labs at Eindhoven University of Technology.

**You are free to:**
- Use the website for Remote Labs purposes
- Modify the code for your needs
- Distribute the website within TU/e

**You must:**
- Maintain the attribution to Remote Labs
- Not remove or alter the license notice
- Not use for commercial purposes without permission

**You may not:**
- Redistribute modified versions without permission
- Use the TU/e branding without authorization
- Claim ownership of the original code

### 🎓 Academic Use

This website may be used for educational purposes at TU/e including:
- Teaching web development best practices
- Demonstrating accessibility techniques
- Showcasing performance optimization
- Example of progressive enhancement

### 🔗 Attribution

When using this website or its code, please include:
```
Remote Labs Website
Copyright (c) Eindhoven University of Technology
Used with permission from Remote Labs, TU/e
```

### 📜 Full License Text

[MIT License](https://opensource.org/licenses/MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

*Built with ❤️ for education and innovation at Eindhoven University of Technology*
*Enhanced with 🚀 modern UX best practices and comprehensive browser support*
*🌐 Accessible, performant, and future-ready web development*

### Deployment

To deploy this website:

1. **Simple Hosting**: Upload all files to any web hosting service
2. **GitHub Pages**: Push to a GitHub repository and enable GitHub Pages
3. **Netlify/Vercel**: Connect your repository for automatic deployment
4. **University Server**: Upload to TU/e's web server if available

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Opera 67+

## Development Notes

## 🧪 Testing & QA

### 🔍 Testing the Website

#### Manual Testing Checklist

**Basic Functionality**
- [ ] All links and buttons work correctly
- [ ] Navigation menu functions properly
- [ ] Form submissions (if any) work as expected
- [ ] Error pages display correctly

**Responsive Design**
- [ ] Test on desktop (1920px)
- [ ] Test on laptop (1366px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Test on small mobile (320px)

**Browser Compatibility**
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Edge latest
- [ ] Opera latest
- [ ] IE11 (basic functionality)

**Performance Testing**
- [ ] Load time under 2 seconds on 3G
- [ ] No layout shifts (CLS < 0.1)
- [ ] Interactive in under 5 seconds
- [ ] Total blocking time < 300ms

**Accessibility Testing**
- [ ] Keyboard navigation works
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Color contrast meets WCAG AA
- [ ] ARIA attributes are correct
- [ ] Focus management is logical

**Mobile Testing**
- [ ] Touch interactions work smoothly
- [ ] Viewport scaling is correct
- [ ] Virtual keyboard handling
- [ ] Orientation changes work
- [ ] Touch targets are adequate (44x44px minimum)

#### Automated Testing

**Lighthouse Audit**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://remotelabs.tue.nl --output=html --chrome-flags="--headless"
```

**Accessibility Testing**
```bash
# Install pa11y
npm install -g pa11y

# Run accessibility test
pa11y https://remotelabs.tue.nl
```

**Performance Testing**
```bash
# WebPageTest CLI
npm install -g webpagetest

# Run performance test
webpagetest test https://remotelabs.tue.nl --key YOUR_API_KEY
```

#### Cross-Browser Testing

Use the provided `browser-testing.html` framework:
1. Open `browser-testing.html` in each target browser
2. Follow the testing instructions
3. Record results in the testing matrix
4. Address any identified issues

### 🐞 Bug Reporting

When reporting bugs, please include:
- Browser name and version
- Operating system
- Device information (if mobile)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### 📊 Performance Budget

**Target Metrics**
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.8s
- **Total Blocking Time**: < 300ms

**Optimization Goals**
- Page weight: < 500KB (initial load)
- Requests: < 20 (initial load)
- Images: All optimized, lazy loaded
- Fonts: WOFF2 format, display=swap
- JavaScript: Deferred, minified

## 🌐 Deployment

### 📦 Deployment Checklist

**Pre-Deployment**
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test in all target browsers
- [ ] Verify mobile responsiveness
- [ ] Check accessibility compliance
- [ ] Test performance on slow networks
- [ ] Review content for accuracy
- [ ] Backup current version

**Deployment Steps**
- [ ] Update version number in cache manifest
- [ ] Update Service Worker version
- [ ] Clear old cache files
- [ ] Upload new files to server
- [ ] Test deployed version
- [ ] Monitor for errors

**Post-Deployment**
- [ ] Verify analytics are working
- [ ] Check error logs
- [ ] Test critical user journeys
- [ ] Announce updates to users
- [ ] Monitor performance metrics

### 🚀 Deployment Methods

#### GitHub Pages (Recommended for Simple Sites)
```bash
# Push to GitHub
git add .
git commit -m "Update website"
git push origin main

# Enable GitHub Pages in repository settings:
# 1. Go to Settings > Pages
# 2. Select 'main' branch
# 3. Choose '/ (root)' folder
# 4. Save
```

#### Netlify (Recommended for Automatic Deployments)
1. Sign up for Netlify account
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm run build` (if using build process)
   - Publish directory: `/` (root)
4. Deploy

#### Vercel (Alternative to Netlify)
1. Sign up for Vercel account
2. Import GitHub repository
3. Configure project settings
4. Deploy (automatic on git push)

#### University Server (TU/e)
```bash
# Connect to server
ssh username@server.tue.nl

# Upload files
scp -r local_folder/ username@server.tue.nl:/web/remotelabs/

# Set permissions
chmod -R 755 /web/remotelabs/
```

#### Custom Hosting
1. Upload all files to your web server
2. Configure proper MIME types:
   - `.html`: text/html
   - `.css`: text/css
   - `.js`: application/javascript
   - `.png`: image/png
   - `.jpg`: image/jpeg
3. Set up HTTPS (recommended)
4. Configure caching headers
5. Set up redirects if needed

### 🔧 Server Configuration

**Recommended .htaccess (Apache)**
```apache
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
    AddOutputFilterByType DEFLATE application/x-font
    AddOutputFilterByType DEFLATE application/x-font-opentype
    AddOutputFilterByType DEFLATE application/x-font-otf
    AddOutputFilterByType DEFLATE application/x-font-truetype
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access 1 year"
    ExpiresByType image/jpeg "access 1 year"
    ExpiresByType image/gif "access 1 year"
    ExpiresByType image/png "access 1 year"
    ExpiresByType text/css "access 1 month"
    ExpiresByType application/pdf "access 1 month"
    ExpiresByType application/javascript "access 1 month"
    ExpiresByType application/x-javascript "access 1 month"
    ExpiresByType application/x-shockwave-flash "access 1 month"
    ExpiresByType image/x-icon "access 1 year"
    ExpiresDefault "access 2 days"
</IfModule>

<IfModule mod_headers.c>
    Header set Connection keep-alive
    <FilesMatch "\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf)$">
        Header set Cache-Control "public"
    </FilesMatch>
    <FilesMatch "\.(html|htm|php)$">
        Header set Cache-Control "private, must-revalidate"
    </FilesMatch>
</IfModule>
```

**Recommended nginx Configuration**
```nginx
server {
    listen 80;
    server_name remotelabs.tue.nl;
    root /var/www/remotelabs;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 📊 Post-Deployment Monitoring

#### Analytics Setup
```html
<!-- Add to index.html head section -->
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>

<!-- Or use Plausible for privacy-friendly analytics -->
<script defer data-domain="remotelabs.tue.nl" src="https://plausible.io/js/script.js"></script>
```

#### Error Monitoring
```javascript
// Add to script.js
window.addEventListener('error', function(e) {
    // Log errors to your error monitoring service
    console.error('Error:', e.message, e.filename, e.lineno, e.colno);
    
    // Example: Send to error tracking service
    // trackError(e.message, e.filename, e.lineno, e.colno);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled rejection:', e.reason);
    
    // Example: Send to error tracking service
    // trackError('Unhandled rejection: ' + e.reason);
});
```

#### Performance Monitoring
```javascript
// Add to script.js
if ('performance' in window) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    // Send to analytics/monitoring service
    console.log('Page loaded in', pageLoadTime, 'ms');
    
    // Track resource loading
    if (window.performance.getEntries) {
        const resources = window.performance.getEntriesByType("resource");
        console.log('Resources loaded:', resources.length);
    }
}
```

### Disabling Features (if needed)

To disable specific enhancements, you can:
- Remove the back-to-top button by deleting the JavaScript code block
- Disable lazy loading by removing `loading="lazy"` attributes
- Remove alternating backgrounds by deleting the CSS `nth-child` selectors

### Future Enhancement Ideas

Consider adding:
- Dark mode toggle
- Language selector
- Contact form with validation
- Analytics integration
- User feedback widget

## License

This project is open-source and free to use for Remote Labs at TU/e.

## Contact

For questions or support, please contact the Remote Labs team at TU/e.

---

*Built with ❤️ for education and innovation at Eindhoven University of Technology*
*Enhanced with 🚀 modern UX best practices*