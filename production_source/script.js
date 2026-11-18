// Remote Labs - site interactions.
// Loaded with <script defer>, so the DOM is fully parsed by the time this runs.
//
// What this file does, in order:
//   1. Tag touch devices and read the reduced-motion preference (used below)
//   2. Back-to-top button + one rAF-throttled scroll handler
//   3. Hero video controls (play/pause, mute) + data-saver gating
//   4. Loading placeholders for lazy media (image shimmer)
//   5. Smooth scrolling for in-page anchors
//   6. Service worker registration (after page load, http/https only)
//   7. Block right-click save on the experiment setup photos
(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  // OS-level "reduce motion" preference (WCAG 2.3.3). CSS handles
  // animations/transitions (see styles.css); videos are handled at the
  // call sites below.
  function prefersReducedMotion() {
    return !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // -----------------------------------------------------------------------
  // 1. Touch-device tag (run immediately, see bottom)
  // -----------------------------------------------------------------------

  // Tag touch devices so CSS can provide tap feedback without per-element
  // JS listeners (see the .touch-device rules in styles.css).
  function tagTouchDevice() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      document.body.classList.add('touch-device');
    }
  }

  tagTouchDevice();

  // -----------------------------------------------------------------------
  // 2. Back-to-top button
  // -----------------------------------------------------------------------

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top fab fab--bottom-right';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-up"/></svg><span>Top</span>';
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.body.appendChild(backToTop);

  // Single, rAF-throttled scroll handler: back-to-top visibility.
  let ticking = false;

  function onScroll() {
    if (window.pageYOffset > 50) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

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
  // 4. Loading placeholders for lazy media
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

  }

  // -----------------------------------------------------------------------
  // 5. Back button (privacy page): history.back() when possible, otherwise
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
  // 6. Smooth scrolling for in-page anchor links
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

  // -----------------------------------------------------------------------
  // 7. Experiment setup photos: no right-click save, no drag
  // -----------------------------------------------------------------------

  // Deter casual copying of the setup photos: no context menu, no drag.
  // Not real DRM - devtools/view-source still work.
  function protectSetupImages() {
    document.querySelectorAll('.experiment-image').forEach((img) => {
      img.draggable = false;
      img.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  function init() {
    protectSetupImages();
    setupHeroVideoDataSaver();
    setupHeroVideoControls();
    setupBackButton();
    setupSmoothScroll();
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
