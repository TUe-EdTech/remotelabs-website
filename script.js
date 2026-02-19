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

// COMPREHENSIVE SMOOTH SCROLLING - Fixed Implementation
function setupSmoothScrolling() {
    console.log('Initializing smooth scrolling...');
    
    // Force enable CSS smooth scrolling
    try {
        document.documentElement.style.scrollBehavior = 'smooth';
        console.log('CSS smooth scrolling enabled');
    } catch (e) {
        console.warn('Could not set CSS smooth scrolling:', e);
    }
    
    // Check support
    const supportsSmoothScrolling = 'scrollBehavior' in document.documentElement.style;
    console.log('Browser supports scrollBehavior:', supportsSmoothScrolling);
    
    // Universal smooth scroll function
    function smoothScrollTo(target, duration = 800) {
        const targetPosition = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let start = null;
        
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            
            // Ease in out quad
            const easedProgress = progress < 0.5 
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            window.scrollTo(0, startPosition + distance * easedProgress);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }
        
        window.requestAnimationFrame(step);
    }
    
    // Handle all anchor links
    function setupAnchorLinks() {
        const links = document.querySelectorAll('a[href^="#"]');
        console.log('Found anchor links:', links.length);
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                try {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        history.pushState(null, null, targetId);
                        
                        // Try native smooth scroll first
                        try {
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        } catch (scrollError) {
                            console.warn('Native smooth scroll failed, using polyfill:', scrollError);
                            smoothScrollTo(targetElement);
                        }
                        
                        // Update navigation
                        if (typeof updateActiveIndicator === 'function') {
                            updateActiveIndicator();
                        }
                    }
                } catch (error) {
                    console.error('Error in anchor click handler:', error);
                }
            });
        });
    }
    
    // Handle back-to-top button
    function setupBackToTop() {
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } catch (error) {
                    console.warn('Native scroll failed, using polyfill');
                    smoothScrollTo(0, 600);
                }
            });
        }
    }
    
    // Initialize everything
    setupAnchorLinks();
    setupBackToTop();
    
    console.log('Smooth scrolling initialized successfully');
}

// Initialize smooth scrolling when DOM is ready
document.addEventListener('DOMContentLoaded', setupSmoothScrolling);

// Test smooth scrolling initialization
setTimeout(() => {
    const htmlStyle = window.getComputedStyle(document.documentElement);
    const scrollBehavior = htmlStyle.getPropertyValue('scroll-behavior');
    console.log('Current scroll-behavior:', scrollBehavior);
    
    if (scrollBehavior === 'smooth') {
        console.log('✅ Smooth scrolling is properly enabled via CSS');
    } else {
        console.log('⚠️ CSS smooth scrolling not detected, using JavaScript polyfill');
    }
}, 1000);

// Section navigation indicators
function setupSectionNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navIndicators = document.querySelectorAll('.section-nav-indicator');
    
    // Update active indicator on scroll
    function updateActiveIndicator() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Update active state
        navIndicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.getAttribute('data-target') === currentSection) {
                indicator.classList.add('active');
            }
        });
    }
    
    // Click handler for navigation
    navIndicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Update active state immediately
                navIndicators.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll to section
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update on scroll
    window.addEventListener('scroll', updateActiveIndicator);
    
    // Initial update
    updateActiveIndicator();
}

// Initialize section navigation when DOM is ready
document.addEventListener('DOMContentLoaded', setupSectionNavigation);

// Enhanced micro-interactions and feedback system
function setupMicroInteractions() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.cta-button, .hero-cta-button, .ripple');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            
            // Get click position
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Style ripple
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Add to button
            button.appendChild(ripple);
            
            // Remove after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Feedback message system
    window.showFeedback = function(message, type = 'success') {
        let feedback = document.getElementById('feedback-message');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'feedback-message';
            feedback.className = 'feedback-message';
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.className = 'feedback-message ' + (
            type === 'success' ? 'feedback-success' : 'feedback-error'
        );
        
        // Show feedback
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);
        
        // Hide after timeout
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                feedback.remove();
            }, 300);
        }, 3000);
    };
    
    // Add tooltips to elements with data-tooltip attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        // Skip if already has tooltip class
        if (element.classList.contains('tooltip')) return;
        
        element.classList.add('tooltip');
    });
    
    // Add loading states to forms and buttons
    window.setLoading = function(element, isLoading) {
        if (isLoading) {
            element.classList.add('is-loading');
            element.setAttribute('disabled', 'true');
        } else {
            element.classList.remove('is-loading');
            element.removeAttribute('disabled');
        }
    };
    
    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';
    progressBar.style.background = 'var(--highlight-color)';
    progressBar.style.width = '0%';
    progressBar.style.zIndex = '1000';
    progressBar.style.transformOrigin = 'left';
    progressBar.style.transition = 'width 0.2s ease, transform 0.2s ease';
    document.body.appendChild(progressBar);
    
    // Update scroll progress
    function updateScrollProgress() {
        const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (window.scrollY / scrollTotal) * 100;
        progressBar.style.width = `${scrollProgress}%`;
        
        // Add pulse effect when reaching bottom
        if (scrollProgress > 95) {
            progressBar.style.transform = 'scaleX(1.1)';
            setTimeout(() => {
                progressBar.style.transform = 'scaleX(1)';
            }, 200);
        }
    }
    
    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();
    
    // Add hover feedback to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transition = 'transform 0.2s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// Initialize micro-interactions when DOM is ready
document.addEventListener('DOMContentLoaded', setupMicroInteractions);

// Progressive disclosure patterns
function setupProgressiveDisclosure() {
    // Accordion functionality
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        header.addEventListener('click', () => {
            // Close other open items
            accordionItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
            
            // Feedback
            if (item.classList.contains('active')) {
                showFeedback('Section expanded', 'success');
            }
        });
    });
    
    // Expandable cards functionality
    const expandableCards = document.querySelectorAll('.expandable-card');
    expandableCards.forEach(card => {
        const header = card.querySelector('.card-header');
        
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
            
            // Feedback
            if (card.classList.contains('expanded')) {
                showFeedback('Card expanded', 'success');
            }
        });
    });
    
    // Tab interface functionality
    const tabInterfaces = document.querySelectorAll('.tab-interface');
    tabInterfaces.forEach(interfaceEl => {
        const buttons = interfaceEl.querySelectorAll('.tab-button');
        const contents = interfaceEl.querySelectorAll('.tab-content');
        
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                buttons.forEach(btn => btn.classList.remove('active'));
                contents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                contents[index].classList.add('active');
                
                // Feedback
                showFeedback(`Switched to ${button.textContent}`, 'success');
            });
        });
        
        // Activate first tab by default
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
            contents[0].classList.add('active');
        }
    });
    
    // Modal functionality
    window.showModal = function(title, content) {
        let modal = document.getElementById('global-modal');
        
        if (!modal) {
            // Create modal structure
            modal = document.createElement('div');
            modal.id = 'global-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" aria-label="Close modal">×</button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            modal.querySelector('.modal-title').textContent = title;
            modal.querySelector('.modal-body').innerHTML = content;
        }
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Close button
        const closeButton = modal.querySelector('.modal-close');
        closeButton.addEventListener('click', () => {
            closeModal();
        });
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on Escape key
        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Cleanup function
        function closeModal() {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    // Tooltip enhancement
    const tooltipElements = document.querySelectorAll('.tooltip-progressive');
    tooltipElements.forEach(element => {
        const content = element.getAttribute('data-tooltip-content') || 'More information';
        
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.textContent = content;
        element.appendChild(tooltipContent);
    });
    
    // Add progressive disclosure to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        // Add click handler for progressive disclosure
        card.addEventListener('click', () => {
            // Could expand to show more details
            showFeedback('Feature card clicked', 'success');
        });
    });
}

// Initialize progressive disclosure when DOM is ready
document.addEventListener('DOMContentLoaded', setupProgressiveDisclosure);

// Advanced accessibility features
function setupAccessibility() {
    // Text resizing functionality
    function setupTextResizing() {
        const controls = document.createElement('div');
        controls.className = 'text-resize-controls';
        controls.innerHTML = `
            <button class="text-resize-button" data-size="small">A-</button>
            <button class="text-resize-button active" data-size="medium">A</button>
            <button class="text-resize-button" data-size="large">A+</button>
        `;
        document.body.appendChild(controls);
        
        const buttons = controls.querySelectorAll('.text-resize-button');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const size = this.getAttribute('data-size');
                let fontSize;
                
                switch(size) {
                    case 'small':
                        fontSize = '14px';
                        break;
                    case 'medium':
                        fontSize = '16px';
                        break;
                    case 'large':
                        fontSize = '18px';
                        break;
                }
                
                document.documentElement.style.setProperty('--base-font-size', fontSize);
                showFeedback(`Text size changed to ${size}`, 'success');
            });
        });
    }
    
    // Keyboard navigation enhancements
    function setupKeyboardNavigation() {
        // Add keyboard focus styles
        document.addEventListener('keydown', function(e) {
            // Skip to content on Ctrl+M
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.setAttribute('tabindex', '-1');
                    mainContent.focus();
                    showFeedback('Focused on main content', 'success');
                }
            }
            
            // Skip to navigation on Ctrl+N
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                const header = document.querySelector('header');
                if (header) {
                    const nav = header.querySelector('nav') || header;
                    nav.setAttribute('tabindex', '-1');
                    nav.focus();
                    showFeedback('Focused on navigation', 'success');
                }
            }
        });
        
        // Enhance focus visibility
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('a, button, [tabindex="0"]')) {
                e.target.classList.add('keyboard-focus');
            }
        });
        
        document.addEventListener('focusout', function(e) {
            if (e.target.matches('a, button, [tabindex="0"]')) {
                e.target.classList.remove('keyboard-focus');
            }
        });
    }
    
    // ARIA live region announcements
    window.announce = function(message, priority = 'polite') {
        const liveRegion = document.getElementById('aria-live');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Change aria-live based on priority
            if (priority === 'assertive') {
                liveRegion.setAttribute('aria-live', 'assertive');
            } else {
                liveRegion.setAttribute('aria-live', 'polite');
            }
        }
    };
    
    // Accessible modal dialogs
    function setupAccessibleModals() {
        // This is already handled in progressive disclosure
    }
    
    // Color contrast checker
    function checkColorContrast() {
        // Check contrast for all text elements
        const textElements = document.querySelectorAll('h1, h2, h3, h4, p, a, span, li');
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Simple contrast check (would need proper implementation)
            if (color && bgColor) {
                // In a real implementation, use proper contrast ratio calculation
                // This is a simplified version
            }
        });
    }
    
    // Initialize all accessibility features
    setupTextResizing();
    setupKeyboardNavigation();
    checkColorContrast();
    
    // Announce page loaded
    setTimeout(() => {
        announce('Remote Labs website loaded successfully. Use Ctrl+M to jump to main content, Ctrl+N to jump to navigation.');
    }, 1000);
}

// Initialize accessibility features when DOM is ready
document.addEventListener('DOMContentLoaded', setupAccessibility);

// User engagement enhancements
function setupUserEngagement() {
    // Time on page tracking
    let pageLoadTime = new Date();
    let lastInteraction = pageLoadTime;
    
    // Track user interactions
    function trackInteraction() {
        lastInteraction = new Date();
        
        // Calculate time since last interaction
        const idleTime = (lastInteraction - pageLoadTime) / 1000;
        
        // If user has been active for more than 30 seconds, show engagement prompt
        if (idleTime > 30000) {
            showEngagementPrompt();
        }
    }
    
    // Add event listeners for interactions
    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    
    // Engagement prompt
    function showEngagementPrompt() {
        // Only show once per session
        if (sessionStorage.getItem('engagementPromptShown')) return;
        sessionStorage.setItem('engagementPromptShown', 'true');
        
        const prompt = document.createElement('div');
        prompt.className = 'engagement-prompt';
        prompt.innerHTML = `
            <div class="engagement-content">
                <h3>Enjoying Remote Labs?</h3>
                <p>We'd love to hear your thoughts! Your feedback helps us improve.</p>
                <div class="engagement-actions">
                    <button class="engagement-button feedback-button">Give Feedback</button>
                    <button class="engagement-button dismiss-button">Not Now</button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .engagement-prompt {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                max-width: 350px;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .engagement-content {
                padding: 1.5rem;
            }
            
            .engagement-content h3 {
                margin: 0 0 0.5rem 0;
                color: var(--black);
                font-size: 1.2rem;
            }
            
            .engagement-content p {
                margin: 0 0 1rem 0;
                color: var(--gray-700);
                font-size: 0.9rem;
            }
            
            .engagement-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .engagement-button {
                flex: 1;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                font-family: var(--font-heading);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .feedback-button {
                background: var(--highlight-color);
                color: white;
            }
            
            .feedback-button:hover {
                background: #1d4ed8;
                transform: translateY(-1px);
            }
            
            .dismiss-button {
                background: var(--gray-100);
                color: var(--gray-800);
            }
            
            .dismiss-button:hover {
                background: var(--gray-200);
                transform: translateY(-1px);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(prompt);
        
        // Add event listeners
        const feedbackButton = prompt.querySelector('.feedback-button');
        const dismissButton = prompt.querySelector('.dismiss-button');
        
        feedbackButton.addEventListener('click', function() {
            showModal('Share Your Feedback', `
                <form id="feedback-form">
                    <div class="form-group">
                        <label for="feedback-name" class="form-label">Your Name</label>
                        <input type="text" id="feedback-name" class="form-input" placeholder="Your name">
                    </div>
                    <div class="form-group">
                        <label for="feedback-email" class="form-label">Email (optional)</label>
                        <input type="email" id="feedback-email" class="form-input" placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="feedback-message" class="form-label">Your Feedback</label>
                        <textarea id="feedback-message" class="form-textarea" rows="4" placeholder="What do you think about Remote Labs?"></textarea>
                    </div>
                    <button type="submit" class="cta-button" style="width: 100%; margin-top: 1rem;">Submit Feedback</button>
                </form>
            `);
            
            // Handle form submission
            document.getElementById('feedback-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('feedback-name').value;
                const email = document.getElementById('feedback-email').value;
                const message = document.getElementById('feedback-message').value;
                
                // In a real implementation, send to server
                console.log('Feedback submitted:', { name, email, message });
                showFeedback('Thank you for your feedback!', 'success');
                
                // Close modal
                document.querySelector('.modal-overlay').click();
            });
            
            prompt.remove();
        });
        
        dismissButton.addEventListener('click', function() {
            prompt.remove();
            style.remove();
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (prompt.parentNode) {
                prompt.remove();
                style.remove();
            }
        }, 10000);
    }
    
    // Scroll progress with achievements
    function setupScrollAchievements() {
        const achievements = [
            { threshold: 0.25, message: 'Quarter way there! Keep exploring!' },
            { threshold: 0.5, message: 'Halfway! You're doing great!' },
            { threshold: 0.75, message: 'Almost there! Just a bit more!' },
            { threshold: 0.9, message: 'You've explored most of the page! 🎉' }
        ];
        
        let achieved = [];
        
        window.addEventListener('scroll', function() {
            const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollProgress = window.scrollY / scrollTotal;
            
            achievements.forEach((achievement, index) => {
                if (scrollProgress > achievement.threshold && !achieved.includes(index)) {
                    achieved.push(index);
                    showFeedback(achievement.message, 'success');
                }
            });
        });
    }
    
    // Idle detection
    function setupIdleDetection() {
        let idleTimeout;
        
        function resetIdleTimeout() {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(function() {
                // User has been idle for 2 minutes
                console.log('User is idle');
                // Could show a prompt or take other action
            }, 120000); // 2 minutes
        }
        
        document.addEventListener('mousemove', resetIdleTimeout);
        document.addEventListener('keypress', resetIdleTimeout);
        document.addEventListener('scroll', resetIdleTimeout);
        
        resetIdleTimeout();
    }
    
    // Initialize engagement features
    setupScrollAchievements();
    setupIdleDetection();
    
    // Track time on page
    setTimeout(function() {
        const timeSpent = (new Date() - pageLoadTime) / 1000;
        if (timeSpent > 60) { // More than 1 minute
            console.log(`User spent ${Math.round(timeSpent)} seconds on the page`);
            // Could trigger additional engagement
        }
    }, 60000);
}

// Initialize user engagement features when DOM is ready
document.addEventListener('DOMContentLoaded', setupUserEngagement);

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