# Remote Labs Error Pages

This directory contains custom error pages for the Remote Labs website, designed to match the main website's style and branding.

## Available Error Pages

| Error Code | Page Name | Description |
|------------|-----------|-------------|
| 400 | `400.shtml` | Bad Request - Invalid syntax or malformed request |
| 401 | `401.shtml` | Unauthorized - Authentication required |
| 403 | `403.shtml` | Forbidden - Insufficient permissions |
| 404 | `404.shtml` | Not Found - Page doesn't exist |
| 500 | `500.shtml` | Internal Server Error - Server-side issue |

## Features

Each error page includes:

- **Consistent Branding**: Matches the main website's header, footer, and color scheme
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Accessibility**: Skip links, ARIA live regions, and keyboard navigation
- **Clear Messaging**: Specific error descriptions with helpful guidance
- **Action Buttons**: Primary call-to-action to return homepage
- **Contextual Links**: Relevant actions for each error type
- **Animations**: Smooth fade-in effects for better user experience
- **Performance**: Inline critical CSS and deferred JavaScript loading

## Implementation

### Web Server Configuration

#### Apache (.htaccess)
```apache
ErrorDocument 400 /error_pages/400.shtml
ErrorDocument 401 /error_pages/401.shtml
ErrorDocument 403 /error_pages/403.shtml
ErrorDocument 404 /error_pages/404.shtml
ErrorDocument 500 /error_pages/500.shtml
```

#### Nginx (nginx.conf)
```nginx
error_page 400 /error_pages/400.shtml;
error_page 401 /error_pages/401.shtml;
error_page 403 /error_pages/403.shtml;
error_page 404 /error_pages/404.shtml;
error_page 500 /error_pages/500.shtml;
```

#### IIS (web.config)
```xml
<system.web>
    <customErrors mode="On">
        <error statusCode="400" redirect="/error_pages/400.shtml" />
        <error statusCode="401" redirect="/error_pages/401.shtml" />
        <error statusCode="403" redirect="/error_pages/403.shtml" />
        <error statusCode="404" redirect="/error_pages/404.shtml" />
        <error statusCode="500" redirect="/error_pages/500.shtml" />
    </customErrors>
</system.web>
```

## Customization

You can easily customize these error pages:

1. **Colors**: Modify CSS variables in the `:root` section
2. **Text**: Edit error titles, descriptions, and action links
3. **Illustrations**: Replace `/assets/error-illustration.svg` with your own images
4. **Layout**: Adjust the CSS grid and responsive breakpoints
5. **Actions**: Change the contextual links for each error type

## Testing

Open `test_error_pages.html` in your browser to preview all error pages and see implementation instructions.

## File Structure

```
error_pages/
├── 400.shtml          # Bad Request
├── 401.shtml          # Unauthorized
├── 403.shtml          # Forbidden
├── 404.shtml          # Not Found
├── 500.shtml          # Internal Server Error
├── test_error_pages.html # Test and preview page
└── README.md          # This documentation
```

## Browser Support

✅ Chrome, Firefox, Safari, Edge   
✅ Mobile browsers   
⚠️ IE11 (basic functionality)

## License

These error pages are part of the Remote Labs website and are licensed under the MIT License.