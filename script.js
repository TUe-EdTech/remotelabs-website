// Quick and Snappy Animations
window.addEventListener('load', function() {
    // Add fade-in-up animation to elements
    const animateElements = document.querySelectorAll('.feature-card, .benefit-item, .team-member, .publication-card');
    
    animateElements.forEach((element, index) => {
        // Stagger animations for a nice effect
        setTimeout(() => {
            element.classList.add('animate-fade-in-up');
        }, index * 100);
    });
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
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
    } else {
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    }
});

// Add hover effects to interactive elements
const addHoverEffects = function() {
    const buttons = document.querySelectorAll('button, .cta-button');
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
};

// Initialize hover effects when DOM is ready
document.addEventListener('DOMContentLoaded', addHoverEffects);