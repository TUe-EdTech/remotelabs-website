# Remote Labs Website

A clean, professional one-page website for Remote Labs - 24/7 Access to Physical Lab Experiments at Eindhoven University of Technology.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with optimized layouts for all devices
- **Modern UI**: Clean, professional interface with smooth animations
- **Performance Optimized**: Fast loading times and efficient resource usage
- **Accessible**: Full accessibility support with ARIA labels and semantic HTML
- **Interactive Elements**: Scroll-based navigation, toggle switches, and smooth scrolling
- **Offline Support**: Service worker for basic offline functionality

## 📁 Project Structure

```
remotelabs-website/
├── index.html              # Main landing page
├── styles.css              # Full CSS stylesheet
├── styles.min.css          # Minified CSS (production)
├── styles_new.css          # New CSS stylesheet
├── script.js               # Full JavaScript
├── script.min.js          # Minified JavaScript (production)
├── assets/                 # Static assets (images, videos, logos)
├── error_pages/            # Custom error pages (400, 401, 403, 404, 500)
├── privacy.html            # Privacy policy page
├── cookie_consent.html     # Cookie consent template
├── dnt_script.html         # Do Not Track script
├── sw.js                   # Service worker for offline support
├── manifest.json           # Web app manifest
├── package.json            # Node.js package configuration
├── package-lock.json       # Dependency lock file
├── .gitattributes          # Git configuration
├── README.md               # Project documentation
└── AGENTS.md               # Development guide
```

## 🛠️ Requirements

- Basic knowledge of HTML, CSS, and JavaScript
- Text editor (VS Code recommended)
- Node.js (for minification tools)
- Git (for version control)

## 📥 Installation

```bash
# Clone the repository
git clone https://github.com/KarelAarts/remotelabs-website.git
cd remotelabs-website

# Install dependencies
npm install
```

## 🚀 Development

### Running the Project
Simply open `index.html` in your browser to view the website.

### Building for Production

```bash
# Minify CSS
npx clean-css -o styles.min.css styles.css

# Minify JavaScript
npx uglifyjs script.js -o script.min.js -c -m
```

## 🎨 Key Features

### 1. Scroll-Based Navigation
- Header hides on scroll down, appears on scroll up
- Smooth scrolling for anchor links
- Mobile-optimized navigation

### 2. Interactive Toggle Switch
- Modern toggle functionality for workflow selection
- Smooth animations and transitions
- Accessible keyboard navigation

### 3. Responsive Design
- Mobile-first approach
- Optimized for all screen sizes (320px to 1200px+)
- Touch-friendly interface

### 4. Performance Optimizations
- Minified CSS and JavaScript
- Lazy loading for images
- Efficient resource loading
- Service worker for offline support

## 📱 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)

## 🔧 Development Guidelines

### HTML Standards
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Maintain accessibility best practices
- Follow existing indentation (2 spaces)

### CSS Architecture
- Use BEM methodology
- Mobile-first approach
- Use CSS variables for colors and common values
- Keep specificity low

### JavaScript Practices
- Use ES6+ features
- Keep functions small and focused
- Implement proper error handling
- Use event delegation for dynamic elements
- Optimize scroll events with throttling/debouncing

## 🧪 Testing

### Testing Checklist
- Chrome, Firefox, Safari, Edge
- Mobile responsiveness (320px to 1200px)
- Console error-free
- HTML/CSS validation
- Accessibility audit
- Performance metrics (Lighthouse)
- Cross-browser compatibility

### Performance Targets
- Lighthouse Score: 90+ (Performance, Accessibility, SEO)
- Load Time: < 2 seconds (3G connection)
- Page Size: < 1MB (including images)
- Requests: < 20 HTTP requests

## 🚀 Deployment

### Options

#### GitHub Pages
```bash
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

## 📬 Contact

For questions about this project:
- Check the README.md first
- Review the AGENTS.md development guide
- Consult the git history for context
- Contact the development team

## 📝 License

MIT License

## 🔗 Links

- **Live Site**: https://remotelabs.tue.nl
- **Repository**: https://github.com/KarelAarts/remotelabs-website
- **Issues**: https://github.com/KarelAarts/remotelabs-website/issues

---

**Maintained by**: Eindhoven University of Technology
**Last updated**: 2024
**Version**: 1.0.0