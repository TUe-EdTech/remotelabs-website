// Remote Labs - site interactions
// Loaded with <script defer>, so the DOM is fully parsed by the time this runs.
(function () {
    'use strict';

    // Apply the main stylesheet once it has loaded. The <link> is declared
    // with media="print" in the HTML to avoid blocking first paint; swapping
    // to "all" here replaces the previous inline onload handler so the CSP
    // can drop 'unsafe-inline' from script-src.
    (function swapAsyncStylesheet() {
        var link = document.getElementById('async-stylesheet');
        if (!link) return;
        function apply() { link.media = 'all'; }
        if (link.sheet) {
            apply();
        } else {
            link.addEventListener('load', apply);
        }
    })();

    // Tag touch devices so CSS can provide tap feedback without per-element
    // JS listeners (see the .touch-device rules in styles.css).
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    }

    // --- Back-to-top button ---
    var backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg>';
    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(backToTop);

    // --- Single, rAF-throttled scroll handler ---
    // Consolidates header hide/show (direction-aware) and back-to-top visibility.
    var mainHeader = document.querySelector('.main-header');
    var lastScrollY = window.pageYOffset;
    var isScrollingDown = false;
    var ticking = false;

    function onScroll() {
        var currentY = window.pageYOffset;

        if (mainHeader) {
            if (currentY > lastScrollY && currentY > 100) {
                if (!isScrollingDown) {
                    mainHeader.classList.add('hidden');
                    isScrollingDown = true;
                }
            } else if (currentY < lastScrollY) {
                if (isScrollingDown) {
                    mainHeader.classList.remove('hidden');
                    isScrollingDown = false;
                }
            }
        }

        if (currentY > 50) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        lastScrollY = currentY;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    // --- Hero video controls ---
    function setupHeroVideoControls() {
        var video = document.getElementById('hero-video-player');
        var playPauseBtn = document.getElementById('play-pause-btn');
        var muteBtn = document.getElementById('mute-btn');

        if (!video || !playPauseBtn || !muteBtn) return;

        playPauseBtn.addEventListener('click', function () {
            if (video.paused) {
                video.play();
                playPauseBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-pause"/></svg>';
                playPauseBtn.setAttribute('aria-label', 'Pause');
            } else {
                video.pause();
                playPauseBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-play"/></svg>';
                playPauseBtn.setAttribute('aria-label', 'Play');
            }
        });

        muteBtn.addEventListener('click', function () {
            video.muted = !video.muted;
            if (video.muted) {
                muteBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-volume-mute"/></svg>';
                muteBtn.setAttribute('aria-label', 'Unmute');
            } else {
                muteBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-volume-up"/></svg>';
                muteBtn.setAttribute('aria-label', 'Mute');
            }
        });

        video.muted = true;
    }

    // --- Workflow video switching ---
    function setupVideoSwitching() {
        var steps = document.querySelectorAll('.workflow-step[data-video]');
        var video = document.getElementById('workflow-video');
        if (!steps.length || !video) return;

        steps.forEach(function (step) {
            step.addEventListener('click', function () {
                var videoId = this.getAttribute('data-video');
                var videoPath = 'assets/videos/' + videoId + '.mp4';

                video.pause();
                video.currentTime = 0;
                video.onerror = null;
                video.oncanplaythrough = null;

                video.src = videoPath;
                video.load();

                video.onerror = function () {
                    console.error('Failed to load video:', videoId);
                };
                video.oncanplaythrough = function () {
                    video.play().catch(function () {});
                };

                steps.forEach(function (s) { s.classList.remove('active-step'); });
                this.classList.add('active-step');
            });
        });

        steps[0].classList.add('active-step');
    }

    // --- Smooth scrolling for in-page anchor links ---
    function setupSmoothScroll() {
        if (!('scrollBehavior' in document.documentElement.style)) return;
        var cooldown = false;
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                if (cooldown) return;
                var targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                var target = document.querySelector(targetId);
                if (!target) return;
                e.preventDefault();
                cooldown = true;
                try {
                    target.scrollIntoView({ behavior: 'smooth' });
                } catch (err) {
                    target.scrollIntoView(true);
                }
                setTimeout(function () { cooldown = false; }, 1000);
            });
        });
    }

    // --- Workflow toggle switch (Students / Educators / Organizations) ---
    function setupToggleSwitch() {
        var toggleStudents = document.getElementById('toggle-students');
        var toggleTeachers = document.getElementById('toggle-teachers');
        var toggleOrganizations = document.getElementById('toggle-organizations');
        if (!toggleStudents || !toggleTeachers || !toggleOrganizations) return;

        var studentsSection = document.getElementById('students');
        var teachersSection = document.getElementById('teachers');
        var organizationsSection = document.getElementById('organizations');

        function updateWorkflowSection() {
            var workflowTitle = document.getElementById('workflowTitle');
            var workflowIntro = document.getElementById('workflowIntro');

            studentsSection.classList.remove('active');
            teachersSection.classList.remove('active');
            organizationsSection.classList.remove('active');

            if (toggleStudents.checked) {
                studentsSection.classList.add('active');
                if (workflowTitle) workflowTitle.textContent = 'Student Workflow';
                if (workflowIntro) workflowIntro.textContent = 'Simple 3-step process to conduct experiments remotely at your own pace';
            } else if (toggleTeachers.checked) {
                teachersSection.classList.add('active');
                if (workflowTitle) workflowTitle.textContent = 'Educator Benefits';
                if (workflowIntro) workflowIntro.textContent = 'Enhance your teaching and student engagement with powerful tools';
            } else if (toggleOrganizations.checked) {
                organizationsSection.classList.add('active');
                if (workflowTitle) workflowTitle.textContent = 'Organizational Gains';
                if (workflowIntro) workflowIntro.textContent = 'Transform your laboratory operations and expand your research capabilities';
            }
        }

        // Click anywhere on the toggle bar for broader hit area, but let
        // clicks on the <label> elements drive the radios natively.
        var toggleSwitch = document.querySelector('.toggle-switch');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('click', function (e) {
                if (e.target.closest('label')) return;
                var rect = toggleSwitch.getBoundingClientRect();
                var clickX = e.clientX - rect.left;
                var thirdWidth = rect.width / 3;
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

        toggleStudents.addEventListener('change', updateWorkflowSection);
        toggleTeachers.addEventListener('change', updateWorkflowSection);
        toggleOrganizations.addEventListener('change', updateWorkflowSection);
    }

    function init() {
        setupVideoSwitching();

        // Auto-load and play the first workflow video on page load.
        var video = document.getElementById('workflow-video');
        var firstStep = document.querySelector('.workflow-step[data-video="book-experiment"]');
        if (video && firstStep) {
            video.src = 'assets/videos/book-experiment.mp4';
            video.load();
            video.oncanplaythrough = function () {
                video.play().catch(function () {});
            };
        }

        setupHeroVideoControls();
        setupSmoothScroll();
        setupToggleSwitch();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
