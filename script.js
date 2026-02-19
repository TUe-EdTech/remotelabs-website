// Quick and Snappy Animations (fallback method)
// Note: This will be replaced by Intersection Observer in modern browsers
// via the progressive enhancement setup above
window.addEventListener('load', function() {
    // Only run this fallback if Intersection Observer is not available
    if (!('IntersectionObserver' in window)) {
        const animateElements = document.querySelectorAll('.feature-card, .benefit-item, .team-member, .publication-card');
        
        animateElements.forEach((element, index) => {
            // Stagger animations for a nice effect
            setTimeout(() => {
                element.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }
});

// Smooth scrolling for anchor links with snappy feel
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add subtle scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const backToTop = document.querySelector('.back-to-top');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        if (backToTop) backToTop.style.display = 'flex';
    } else {
        header.classList.remove('scrolled');
        if (backToTop) backToTop.style.display = 'none';
    }
});

// Back to top functionality
window.addEventListener('load', function() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// Add hover effects to interactive elements
const addHoverEffects = function() {
    const buttons = document.querySelectorAll('button, .cta-button, .hero-cta-button, .feature-card, .team-member');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add keyboard navigation support
    const focusableElements = document.querySelectorAll('a[href], button, [tabindex="0"]');
    focusableElements.forEach(el => {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
};

// Initialize hover effects when DOM is ready
document.addEventListener('DOMContentLoaded', addHoverEffects);

// Progressive enhancement: Feature detection
function detectFeatures() {
    const features = {
        cssGrid: 'CSS' in window && 'supports' in CSS && CSS.supports('display', 'grid'),
        cssVariables: window.CSS && CSS.supports('--foo', 'bar'),
        intersectionObserver: 'IntersectionObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        fetch: 'fetch' in window,
        passiveEvents: testPassiveEventSupport(),
        es6Modules: 'noModule' in HTMLScriptElement.prototype
    };
    
    // Add feature support classes to HTML element
    Object.keys(features).forEach(feature => {
        if (features[feature]) {
            document.documentElement.classList.add(`supports-${feature}`);
        } else {
            document.documentElement.classList.add(`no-${feature}`);
        }
    });
    
    console.log('Feature detection:', features);
    
    // Apply progressive enhancements based on feature support
    applyProgressiveEnhancements(features);
}

// Test for passive event support
function testPassiveEventSupport() {
    let supportsPassive = false;
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener("testPassive", null, opts);
        window.removeEventListener("testPassive", null, opts);
    } catch (e) {}
    return supportsPassive;
}

// Apply progressive enhancements based on detected features
function applyProgressiveEnhancements(features) {
    // CSS Grid enhancement
    if (features.cssGrid) {
        document.documentElement.classList.add('enhanced-grid');
    }
    
    // Intersection Observer enhancement
    if (features.intersectionObserver) {
        setupIntersectionObserver();
    } else {
        setupScrollFallback();
    }
    
    // Service Worker enhancement
    if (features.serviceWorker) {
        setupServiceWorker();
    }
    
    // Fetch API enhancement
    if (features.fetch) {
        // Could enhance form submissions, etc.
    }
}

// Setup Intersection Observer for modern browsers
function setupIntersectionObserver() {
    const animateElements = document.querySelectorAll('.feature-card, .benefit-item, .team-member, .publication-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Fallback for browsers without Intersection Observer
function setupScrollFallback() {
    window.addEventListener('scroll', function() {
        const animateElements = document.querySelectorAll('.feature-card, .benefit-item, .team-member, .publication-card');
        
        animateElements.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('animate-fade-in-up')) {
                element.classList.add('animate-fade-in-up');
            }
        });
    });
    
    // Trigger check on load
    window.dispatchEvent(new Event('scroll'));
}

// Setup Service Worker with progressive enhancement
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(
                function(registration) {
                    console.log('ServiceWorker registration successful with scope:', registration.scope);
                },
                function(err) {
                    console.log('ServiceWorker registration failed:', err);
                }
            );
        });
    }
}

// Run feature detection when DOM is ready
document.addEventListener('DOMContentLoaded', detectFeatures);

// Enhanced touch support for mobile devices
window.addEventListener('load', function() {
    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Add touch-specific classes
        document.body.classList.add('touch-device');
        
        // Add touch feedback with better mobile UX
        const touchElements = document.querySelectorAll('button, a, .feature-card, .team-member, .cta-button, .hero-cta-button');
        touchElements.forEach(el => {
            el.addEventListener('touchstart', function(e) {
                // Prevent double-tap zoom on touch
                if (this.tagName === 'A' || this.tagName === 'BUTTON') {
                    e.preventDefault();
                }
                this.style.transform = 'scale(0.97)';
                this.style.transition = 'transform 0.15s ease';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            });
            
            el.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
            
            // Add long-press detection for context menus
            let pressTimer;
            el.addEventListener('touchstart', function() {
                pressTimer = setTimeout(() => {
                    // Could show context menu here
                    console.log('Long press detected');
                }, 500);
            });
            
            el.addEventListener('touchend', function() {
                clearTimeout(pressTimer);
            });
        });
        
        // Add swipe detection for navigation
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - could navigate forward
                console.log('Swipe left');
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - could navigate back
                console.log('Swipe right');
            }
        }
        
        // Add mobile-specific header optimizations
        const header = document.querySelector('header');
        if (header) {
            header.style.transition = 'all 0.2s ease';
            
            // Add mobile menu toggle if needed
            const mobileMenuToggle = document.createElement('button');
            mobileMenuToggle.className = 'mobile-menu-toggle';
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuToggle.setAttribute('aria-label', 'Toggle menu');
            mobileMenuToggle.style.display = 'none'; // Show only on mobile via CSS
            header.appendChild(mobileMenuToggle);
            
            // Add mobile performance optimizations
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                // Preload images that are likely to be in viewport soon
                if (isElementInViewport(img)) {
                    img.loading = 'eager';
                }
            });
            
            // Add scroll performance optimization
            let lastScroll = 0;
            window.addEventListener('scroll', function() {
                const now = Date.now();
                if (now - lastScroll < 100) return; // Throttle scroll events
                lastScroll = now;
                
                // Lazy load images as they come into view
                images.forEach(img => {
                    if (!img.src && isElementInViewport(img)) {
                        img.src = img.dataset.src || img.getAttribute('src');
                    }
                });
            });
        }
        
        // Helper function to check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        }
        
        // Add mobile-specific performance monitoring
        if (window.performance && window.performance.memory) {
            console.log('Mobile memory usage:', window.performance.memory.usedJSHeapSize / 1048576, 'MB');
        }
        
        // Reduce motion for better performance on low-end devices
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            document.body.classList.add('reduce-motion');
            console.log('Reduced motion enabled for better performance');
        }
        
        // Add mobile-specific UX enhancements
        addMobileUXEnhancements();
    }
});

// Mobile-specific UX enhancements
function addMobileUXEnhancements() {
    // Add tap targets for better touch accuracy
    const touchTargets = document.querySelectorAll('a, button, [role="button"]');
    touchTargets.forEach(target => {
        if (!target.classList.contains('touch-target-enhanced')) {
            target.style.minHeight = '44px';
            target.style.minWidth = '44px';
            target.classList.add('touch-target-enhanced');
        }
    });
    
    // Add scroll indicators for long pages
    window.addEventListener('scroll', function() {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
        
        // Show scroll indicator if page is scrollable
        if (document.body.scrollHeight > window.innerHeight && 
            !document.querySelector('.scroll-indicator')) {
            document.body.appendChild(scrollIndicator);
            
            // Hide scroll indicator after a few seconds
            setTimeout(() => {
                scrollIndicator.style.opacity = '0';
                setTimeout(() => scrollIndicator.remove(), 500);
            }, 3000);
        }
    });
    
    // Add pull-to-refresh simulation (visual feedback only)
    let startY = 0;
    let pullDistance = 0;
    const pullThreshold = 50;
    
    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (window.scrollY === 0 && startY > 0) {
            pullDistance = e.touches[0].clientY - startY;
            if (pullDistance > 0) {
                e.preventDefault();
                if (pullDistance > pullThreshold) {
                    // Could trigger refresh here
                    console.log('Pull to refresh triggered');
                }
            }
        }
    });
    
    document.addEventListener('touchend', function() {
        startY = 0;
        pullDistance = 0;
    });
    
    // Add mobile-specific scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add mobile keyboard accessibility improvements
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Scroll input into better view on mobile
            setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }, true);
}