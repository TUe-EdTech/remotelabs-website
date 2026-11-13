// Remote Labs - site interactions.
// Loaded with <script defer>, so the DOM is fully parsed by the time this runs.
//
// What this file does, in order:
//   1. Activate the async-loaded main stylesheet (media="print" -> "all")
//   2. Tag touch devices and read the reduced-motion preference (used below)
//   3. Back-to-top button + one rAF-throttled scroll handler (header hide/show)
//   4. Hero video controls (play/pause, mute) + data-saver gating
//   5. Workflow section: lazy-playing video, per-step video switching, toggle switch
//   6. Loading placeholders for lazy media (image shimmer, video poster panel)
//   7. Smooth scrolling for in-page anchors
//   8. Service worker registration (after page load, http/https only)
(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  // Asset version query (?v=...) taken from this script's own URL
  // (script.min.js?v=...), so dynamically loaded media - the workflow
  // video switching below - gets the same cache-busting version as the
  // HTML-referenced assets. Empty string when unavailable.
  const ASSET_VERSION = (() => {
    const el = document.currentScript;
    if (el && el.src) {
      const m = el.src.match(/[?&]v=([^&]+)/);
      if (m) return '?v=' + m[1];
    }
    return '';
  })();

  // OS-level "reduce motion" preference (WCAG 2.3.3). CSS handles
  // animations/transitions (see styles.css); videos are handled at the
  // call sites below.
  function prefersReducedMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // -----------------------------------------------------------------------
  // 1. Async stylesheet + touch-device tag (run immediately, see bottom)
  // -----------------------------------------------------------------------

  // Apply the main stylesheet once it has loaded. The <link> is declared
  // with media="print" in the HTML to avoid blocking first paint; swapping
  // to "all" here replaces the previous inline onload handler so the CSP
  // can drop 'unsafe-inline' from script-src.
  function swapAsyncStylesheet() {
    const link = document.getElementById('async-stylesheet');
    if (!link) return;
    const apply = () => { link.media = 'all'; };
    if (link.sheet) {
      apply();
    } else {
      link.addEventListener('load', apply);
    }
  }

  // Tag touch devices so CSS can provide tap feedback without per-element
  // JS listeners (see the .touch-device rules in styles.css).
  function tagTouchDevice() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch-device');
    }
  }

  swapAsyncStylesheet();
  tagTouchDevice();

  // -----------------------------------------------------------------------
  // 2. Back-to-top button + scroll-aware header
  // -----------------------------------------------------------------------

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top fab fab--bottom-right';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg><span>Top</span>';
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);

  // Single, rAF-throttled scroll handler: consolidates header hide/show
  // (direction-aware) and back-to-top visibility.
  const mainHeader = document.querySelector('.main-header');
  let lastScrollY = window.pageYOffset;
  let isScrollingDown = false;
  let ticking = false;

  function onScroll() {
    const currentY = window.pageYOffset;

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

  function setupScrollHandler() {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
    onScroll();
  }

  setupScrollHandler();

  // -----------------------------------------------------------------------
  // 3. Hero video: controls + data-saver / reduced-motion gating
  // -----------------------------------------------------------------------

  function setupHeroVideoControls() {
    const video = document.getElementById('hero-video-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    if (!video || !playPauseBtn || !muteBtn) return;

    // The play/pause control mirrors the element's real state via
    // 'play'/'pause' events, never a one-time check: with
    // preload="metadata" + autoplay the video is still paused at
    // DOMContentLoaded, so a one-time check stamps "Play" and then
    // misses the moment autoplay starts a beat later.
    function syncPlayPause() {
      if (video.paused) {
        playPauseBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-play"/></svg>';
        playPauseBtn.setAttribute('aria-label', 'Play');
      } else {
        playPauseBtn.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-pause"/></svg>';
        playPauseBtn.setAttribute('aria-label', 'Pause');
      }
    }

    playPauseBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', syncPlayPause);
    video.addEventListener('pause', syncPlayPause);
    syncPlayPause();

    muteBtn.addEventListener('click', () => {
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

  // The hero loop is ~9 MB. On Save-Data or 2G connections skip the
  // download entirely: the 18 KB AVIF poster stays visible and the
  // video only loads if the user presses Play. Users who prefer
  // reduced motion get the same still-poster treatment.
  function setupHeroVideoDataSaver() {
    const video = document.getElementById('hero-video-player');
    if (!video) return;

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const effectiveType = conn ? (conn.effectiveType || '') : '';
    const constrained = prefersReducedMotion() ||
      !!(conn && (conn.saveData || effectiveType === '2g' || effectiveType === 'slow-2g'));
    if (!constrained) return;

    video.removeAttribute('autoplay');
    video.preload = 'none';
    video.pause();
  }

  // -----------------------------------------------------------------------
  // 4. Workflow section: lazy video, step switching, toggle switch
  // -----------------------------------------------------------------------

  // #workflow-video ships with preload="none" and no autoplay, so
  // nothing downloads until the section approaches the viewport; then
  // it loads and plays exactly as it did with eager autoplay.
  function setupWorkflowVideoLazyPlay() {
    const video = document.getElementById('workflow-video');
    if (!video) return;

    if (!('IntersectionObserver' in window)) {
      // No observer support: restore the old eager behaviour.
      video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          video.play().catch(() => {});
        }
      });
    }, { rootMargin: '600px 0px' });
    observer.observe(video);
  }

  // Clicking a student workflow step swaps the workflow video to that
  // step's recording (data-video="<name>" -> assets/videos/<name>.mp4).
  function setupVideoSwitching() {
    const steps = document.querySelectorAll('.workflow-step[data-video]');
    const video = document.getElementById('workflow-video');
    if (!steps.length || !video) return;

    steps.forEach((step) => {
      step.addEventListener('click', () => {
        const videoId = step.getAttribute('data-video');
        if (!/^[a-zA-Z0-9_-]+$/.test(videoId || '')) return;
        const videoPath = 'assets/videos/' + videoId + '.mp4' + ASSET_VERSION;

        video.pause();
        video.currentTime = 0;
        video.onerror = null;
        video.oncanplaythrough = null;

        video.src = videoPath;
        video.load();

        video.onerror = () => {};
        video.oncanplaythrough = () => {
          video.play().catch(() => {});
        };

        steps.forEach((s) => s.classList.remove('active-step'));
        step.classList.add('active-step');
      });

      // The steps are focusable (tabindex="0" role="button"); make Enter
      // and Space activate them like a native button.
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          step.click();
        }
      });
    });

    steps[0].classList.add('active-step');
  }

  // Students / Educators / Organizations toggle: shows the matching
  // workflow section and updates the heading text.
  function setupToggleSwitch() {
    const toggleStudents = document.getElementById('toggle-students');
    const toggleTeachers = document.getElementById('toggle-teachers');
    const toggleOrganizations = document.getElementById('toggle-organizations');
    if (!toggleStudents || !toggleTeachers || !toggleOrganizations) return;

    const studentsSection = document.getElementById('students');
    const teachersSection = document.getElementById('teachers');
    const organizationsSection = document.getElementById('organizations');

    function updateWorkflowSection() {
      const workflowTitle = document.getElementById('workflowTitle');
      const workflowIntro = document.getElementById('workflowIntro');

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

    // Click anywhere on the toggle bar for a broader hit area, but let
    // clicks on the <label> elements drive the radios natively.
    const toggleSwitch = document.querySelector('.toggle-switch');
    if (toggleSwitch) {
      toggleSwitch.addEventListener('click', (e) => {
        if (e.target.closest('label')) return;
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

    toggleStudents.addEventListener('change', updateWorkflowSection);
    toggleTeachers.addEventListener('change', updateWorkflowSection);
    toggleOrganizations.addEventListener('change', updateWorkflowSection);
  }

  // -----------------------------------------------------------------------
  // 5. Loading placeholders for lazy media
  // -----------------------------------------------------------------------

  // Fade lazy images in over a shimmer placeholder (styles.css section 13).
  // The shimmer class goes on the holding element (the image itself is
  // transparent while it loads, so a background on the image would be
  // hidden together with it). Without JS no classes are added and images
  // render normally.
  function setupMediaPlaceholders() {
    document.querySelectorAll('main img, footer img').forEach((img) => {
      const holder = img.closest('a') || img.parentElement;

      const settle = (state) => {
        img.classList.remove('media-loading');
        img.classList.add(state === 'error' ? 'media-error' : 'media-loaded');
        if (holder) holder.classList.remove('placeholder-loading');
      };

      if (img.complete) {
        // Already cached (or already broken): settle immediately.
        settle(img.naturalWidth > 0 ? 'load' : 'error');
        return;
      }
      img.classList.add('media-loading');
      if (holder) holder.classList.add('placeholder-loading');
      img.addEventListener('load', () => settle('load'), { once: true });
      img.addEventListener('error', () => settle('error'), { once: true });
    });

    // Workflow video: keep the poster-style placeholder panel up until the
    // video actually starts playing (lazy-played by setupWorkflowVideoLazyPlay
    // or by step switching).
    const video = document.getElementById('workflow-video');
    if (video) {
      const wrapper = video.closest('.video-wrapper');
      if (wrapper) {
        video.addEventListener('playing', () => {
          wrapper.classList.add('video-playing');
        }, { once: true });
      }
    }
  }

  // -----------------------------------------------------------------------
  // 6. Back button (privacy page): history.back() when possible, otherwise
  //    the plain href="/" fallback of the link.
  // -----------------------------------------------------------------------

  function setupBackButton() {
    const btn = document.getElementById('back-button');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
      // else: let the href="/" navigation happen
    });
  }

  // -----------------------------------------------------------------------
  // 7. Smooth scrolling for in-page anchor links
  // -----------------------------------------------------------------------

  function setupSmoothScroll() {
    if (!('scrollBehavior' in document.documentElement.style)) return;
    let cooldown = false;
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        if (cooldown) return;
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        cooldown = true;
        try {
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });
        } catch (err) {
          target.scrollIntoView(true);
        }
        setTimeout(() => { cooldown = false; }, 250);
      });
    });
  }

  // -----------------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------------

  function init() {
    setupVideoSwitching();
    setupHeroVideoDataSaver();
    setupHeroVideoControls();
    setupBackButton();
    setupSmoothScroll();
    setupToggleSwitch();
    setupWorkflowVideoLazyPlay();
    setupMediaPlaceholders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -----------------------------------------------------------------------
  // Service worker registration
  // -----------------------------------------------------------------------

  // Only register over http/https (not file://) and after the page has
  // loaded so it never competes with first paint.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('SW reg failed:', err);
      });
    });
  }
})();
