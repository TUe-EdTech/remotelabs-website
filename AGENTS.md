# AI Agent Development Guide for RemoteLabs Website

This document provides guidelines for AI agents working on the RemoteLabs website project to ensure consistency, efficiency, and maintainability.

## Project Structure Overview

```
remotelabs-website/
├── assets/                  # Static assets (images, fonts, etc.)
├── error_pages/            # Custom error pages
├── node_modules/           # Node.js dependencies
├── .git/                   # Git repository
├── .gitattributes          # Git attributes
├── README.md               # Project documentation
├── cookie_consent.html     # Cookie consent template
├── dnt_script.html         # Do Not Track script
├── index.html              # Main landing page
├── index_backup.html       # Backup of main page
├── package.json            # Node.js package configuration
├── package-lock.json       # Dependency lock file
├── privacy.html            # Privacy policy page
├── script.js               # Main JavaScript file
├── script.min.js           # Minified JavaScript
├── styles.css              # Main stylesheet
├── styles.min.css          # Minified stylesheet
└── sw.js                   # Service worker
```

## Development Guidelines

### 1. File Naming Conventions
- Use lowercase with hyphens for file names (e.g., `new-feature.html`)
- JavaScript files should use `.js` extension
- CSS files should use `.css` extension
- Backup files should append `_backup` before extension

### 2. HTML Structure
- Maintain semantic HTML5 structure
- Use proper indentation (2 spaces)
- Include appropriate meta tags for SEO
- Follow accessibility best practices (ARIA labels, alt text)

### 3. CSS Guidelines
- Use the existing styles.css as reference
- Follow BEM (Block Element Modifier) methodology
- Organize styles by component/functionality
- Use CSS variables for colors and common values
- Mobile-first approach with responsive design

### 4. JavaScript Standards
- Use ES6+ features where supported
- Follow existing code patterns in script.js
- Implement proper error handling
- Use event delegation for dynamic elements
- Comment complex logic for maintainability

### 5. Performance Considerations
- Minify production assets (script.min.js, styles.min.css)
- Optimize images before adding to assets/
- Implement lazy loading where appropriate
- Cache static assets properly

## Extension Points

### Adding New Pages
1. Create new HTML file following existing structure
2. Add link to navigation in index.html if needed
3. Create corresponding CSS styles in styles.css
4. Add any required JavaScript to script.js
5. Test across browsers and devices

### Adding New Features
1. Identify the appropriate file(s) to modify
2. Follow existing code patterns
3. Add necessary HTML elements
4. Implement CSS styling
5. Add JavaScript functionality
6. Test thoroughly

### Modifying Existing Components
1. Review current implementation
2. Make minimal, focused changes
3. Ensure backward compatibility
4. Update any dependent code
5. Test all affected functionality

## Testing Requirements

- Test in Chrome, Firefox, Safari, and Edge
- Verify mobile responsiveness
- Check console for errors
- Validate HTML/CSS
- Test performance metrics
- Verify accessibility compliance

## Version Control

- Commit messages should be descriptive
- Reference related issues when applicable
- Keep commits focused on single features/fixes
- Update documentation as needed

## Deployment Process

1. Test all changes locally
2. Minify assets if modified
3. Commit changes with clear message
4. Push to appropriate branch
5. Create pull request for review
6. Merge after approval
7. Monitor production deployment

## AI Agent Specific Notes

- Always read existing code before making changes
- Follow the principle of minimal intervention
- Document any assumptions made
- Ask for clarification when requirements are unclear
- Maintain consistent code style with existing project
- Prioritize maintainability over clever optimizations

## Common Patterns

### Navigation Updates
When adding new navigation items:
1. Update the header section in index.html
2. Add corresponding CSS styles
3. Implement any required JavaScript handlers

### Form Handling
For new forms:
1. Add form HTML with proper validation attributes
2. Style form elements consistently
3. Implement client-side validation
4. Add form submission handler

### Component Reuse
When creating reusable components:
1. Define clear component boundaries
2. Use consistent naming conventions
3. Document component usage
4. Implement with reusability in mind

## Troubleshooting Guide

### Common Issues
- **CSS not applying**: Check specificity and load order
- **JavaScript errors**: Verify DOM ready state and element existence
- **Responsive issues**: Test with browser dev tools
- **Performance bottlenecks**: Use Chrome DevTools profiling

### Debugging Tips
- Use console.log() strategically
- Check browser console for errors
- Validate HTML structure
- Test with different screen sizes
- Verify cross-browser compatibility

## Future Enhancements

Potential areas for improvement:
- Component library implementation
- Build system automation
- Testing framework integration
- Performance monitoring
- Analytics integration

## Contact Information

For questions about this guide or project-specific concerns, refer to the project documentation or contact the development team.

Last updated: 2024-02-23