// Back to top functionality
window.addEventListener('load', function(){
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    const icon = document.createElement('i');
    icon.className = 'fas fa-arrow-up';
    backToTop.appendChild(icon);
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.display = 'none';
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', function(){
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Add scroll effect to header and back-to-top button
window.addEventListener('scroll', function(){
    const header = document.querySelector('.main-header');
    const backToTop = document.querySelector('.back-to-top');
    if (window.scrollY > 50){
        header.classList.add('hidden');
        if (backToTop) backToTop.style.display = 'flex';
    } else {
        header.classList.remove('hidden');
        if (backToTop) backToTop.style.display = 'none';
    }
});

// Add keyboard navigation support
const focusableElements = document.querySelectorAll('a[href], button, [tabindex="0"]');
focusableElements.forEach(el =>{
    el.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            this.click();
        }
    });
});

// Add touch support for mobile devices
window.addEventListener('load', function(){
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice){
        document.body.classList.add('touch-device');
        const touchElements = document.querySelectorAll('button, a');
        touchElements.forEach(el =>{
            el.addEventListener('touchstart', function(){
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            });
            el.addEventListener('touchend', function(){
                this.style.transform = 'scale(1)';
            });
        });
    }
});
