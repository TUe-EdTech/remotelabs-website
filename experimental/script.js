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

// Toggle functionality for How It Works section and scroll-based header hiding

// Hero Video Controls Function
function setupHeroVideoControls() {
    const video = document.getElementById('hero-video-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    
    if (!video || !playPauseBtn || !muteBtn) {
        console.error('Hero video controls setup failed - elements not found');
        return;
    }
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            const pauseIcon = document.createElement('i');
            pauseIcon.className = 'fas fa-pause';
            playPauseBtn.innerHTML = '';
            playPauseBtn.appendChild(pauseIcon);
            playPauseBtn.setAttribute('aria-label', 'Pause');
        } else {
            video.pause();
            const playIcon = document.createElement('i');
            playIcon.className = 'fas fa-play';
            playPauseBtn.innerHTML = '';
            playPauseBtn.appendChild(playIcon);
            playPauseBtn.setAttribute('aria-label', 'Play');
        }
    });
    
    // Mute/Unmute functionality
    muteBtn.addEventListener('click', function() {
        video.muted = !video.muted;
        if (video.muted) {
            const muteIcon = document.createElement('i');
            muteIcon.className = 'fas fa-volume-mute';
            muteBtn.innerHTML = '';
            muteBtn.appendChild(muteIcon);
            muteBtn.setAttribute('aria-label', 'Unmute');
        } else {
            const volumeIcon = document.createElement('i');
            volumeIcon.className = 'fas fa-volume-up';
            muteBtn.innerHTML = '';
            muteBtn.appendChild(volumeIcon);
            muteBtn.setAttribute('aria-label', 'Mute');
        }
    });
    
    // Initialize: Start muted for autoplay compatibility, but allow unmuting
    video.muted = true;
}

// Simple video switching - just change the source and reload
function setupVideoSwitching() {
    const steps = document.querySelectorAll('.workflow-step[data-video]');
    const video = document.getElementById('workflow-video');
    
    if (!steps.length || !video) {
        console.error('Video setup failed - elements not found');
        return;
    }
    
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video');
            if (!/^[a-zA-Z0-9_-]+$/.test(videoId || '')) {
                console.error('Invalid video id:', videoId);
                return;
            }
            const videoPath = 'assets/videos/' + videoId + '.mp4';
            

            // Pause and reset current video
            video.pause();
            video.currentTime = 0;
            
            // Clear event listeners to prevent conflicts
            video.onerror = null;
            video.oncanplay = null;
            
            // Change source and reload
            video.src = videoPath;
            video.load();
            
            // Set up fresh event handlers
            video.onerror = function() {
                console.error('Failed to load video:', videoId);
            };
            
            video.oncanplaythrough = function() {
                // Try to autoplay
                video.play().catch(e => {
                });
            };
            
            // Update active step
            steps.forEach(s => s.classList.remove('active-step'));
            this.classList.add('active-step');
        });
    });
    
    // First step active by default
    steps[0].classList.add('active-step');
}

// Initialize video switching when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up video switching first
    setupVideoSwitching();
    
    // Auto-load and play the first video (book-experiment) on page load
    const video = document.getElementById('workflow-video');
    const firstStep = document.querySelector('.workflow-step[data-video="book-experiment"]');
    if (video && firstStep) {
        const firstVideoPath = 'assets/videos/book-experiment.mp4';
        video.src = firstVideoPath;
        video.load();
        video.oncanplaythrough = function() {
            video.play().catch(e => {
                // Autoplay blocked, user interaction required
            });
        };
    }
    
    // Set up hero video controls
    setupHeroVideoControls();
    // Smooth scrolling
    'scrollBehavior' in document.documentElement.style && (document.documentElement.style.scrollBehavior = 'smooth');
    let t = !1;
    document.querySelectorAll('a[href^="#"]').forEach(e => {
        e.addEventListener('click', function(e) {
            if (t) return;
            t = !0, e.preventDefault();
            const n = this.getAttribute('href'), o = document.querySelector(n);
            if (o) try {
                o.scrollIntoView({ behavior: 'smooth' }), setTimeout(() => { t = !1 }, 1e3)
            } catch (e) {
                o.scrollIntoView(!0), t = !1
            } else t = !1
        })
    });

    

    // Scroll hide/show functionality
    const mainHeader = document.querySelector('.main-header');
    
    if (mainHeader) {
        let lastScrollPosition = window.pageYOffset;
        let isScrollingDown = false;
        
        window.addEventListener('scroll', function() {
            const currentScrollPosition = window.pageYOffset;
            
            if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 100) {
                // Scrolling down - hide elements
                if (!isScrollingDown) {
                    mainHeader.classList.add('hidden');
                    isScrollingDown = true;
                }
            } else {
                // Scrolling up - show elements
                if (isScrollingDown) {
                    mainHeader.classList.remove('hidden');
                    isScrollingDown = false;
                }
            }
            
            lastScrollPosition = currentScrollPosition;
        });
    }
    
    // Toggle switch functionality
    const toggleStudents = document.getElementById('toggle-students');
    const toggleTeachers = document.getElementById('toggle-teachers');
    const toggleOrganizations = document.getElementById('toggle-organizations');
    
    const studentsSection = document.getElementById('students');
    const teachersSection = document.getElementById('teachers');
    const organizationsSection = document.getElementById('organizations');
    
    function updateWorkflowSection() {
        const workflowTitle = document.getElementById('workflowTitle');
        const workflowIntro = document.getElementById('workflowIntro');
        
        if (toggleStudents.checked) {
            studentsSection.classList.add('active');
            teachersSection.classList.remove('active');
            organizationsSection.classList.remove('active');
            if (workflowTitle) workflowTitle.textContent = 'Student Workflow';
            if (workflowIntro) workflowIntro.textContent = 'Simple 3-step process to conduct experiments remotely at your own pace';
        } else if (toggleTeachers.checked) {
            studentsSection.classList.remove('active');
            teachersSection.classList.add('active');
            organizationsSection.classList.remove('active');
            if (workflowTitle) workflowTitle.textContent = 'Educator Benefits';
            if (workflowIntro) workflowIntro.textContent = 'Enhance your teaching and student engagement with powerful tools';
        } else if (toggleOrganizations.checked) {
            studentsSection.classList.remove('active');
            teachersSection.classList.remove('active');
            organizationsSection.classList.add('active');
            if (workflowTitle) workflowTitle.textContent = 'Organizational Gains';
            if (workflowIntro) workflowIntro.textContent = 'Transform your laboratory operations and expand your research capabilities';
        }
    }
    
    // Also add click handler to the toggle container for better click coverage
    const toggleSwitch = document.querySelector('.toggle-switch');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function(e) {
            // Determine which third was clicked
            const rect = toggleSwitch.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const thirdWidth = rect.width / 3;
            
            if (clickX < thirdWidth) {
                toggleStudents.checked = true;
            } else if (clickX < thirdWidth * 2) {
                toggleTeachers.checked = true;
            } else {
                toggleOrganizations.checked = true;
            }
            updateWorkflowSection();
        });
    }
    
    if (toggleStudents && toggleTeachers && toggleOrganizations) {
        toggleStudents.addEventListener('change', updateWorkflowSection);
        toggleTeachers.addEventListener('change', updateWorkflowSection);
        toggleOrganizations.addEventListener('change', updateWorkflowSection);
    }
    

});
