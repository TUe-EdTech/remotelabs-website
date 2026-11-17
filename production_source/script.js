// Remote Labs - site interactions.
// Loaded with <script defer>, so the DOM is fully parsed by the time this runs.
//
// What this file does, in order:
//   1. Tag touch devices and read the reduced-motion preference (used below)
//   2. Back-to-top button + one rAF-throttled scroll handler (header hide/show)
//   3. Hero video controls (play/pause, mute) + data-saver gating
//   4. How it works: scroll-spy stepper drives a sticky viewfinder video panel
//   5. Loading placeholders for lazy media (image shimmer, video poster panel)
//   6. Smooth scrolling for in-page anchors
//   7. Service worker registration (after page load, http/https only)
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
  // 4. How it works: scroll-spy stepper + progress line + viewfinder panel
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

  // How-it-works stepper: the step nearest the middle of the viewport (or a
  // clicked/tapped step) becomes active - its recording loads into the
  // viewfinder panel and the mono caption names it. Video swaps are deferred
  // while the panel is off-screen so a fast scroll never downloads all clips.
  function setupStepper() {
    const section = document.querySelector('.how-it-works');
    const steps = Array.from(document.querySelectorAll('.workflow-step[data-video]'));
    const video = document.getElementById('workflow-video');
    const caption = document.getElementById('workflow-caption-text');
    const panel = document.querySelector('.how-it-works .video-panel');
    if (!section || !steps.length || !video) return;

    const srcEl = video.querySelector('source');
    const initialId = srcEl ? (srcEl.getAttribute('src').match(/videos\/([a-z0-9_-]+)\.mp4/) || [])[1] : null;
    let active = null;
    let currentId = initialId;
    let pendingId = null;

    function swapVideo(videoId) {
      if (!/^[a-zA-Z0-9_-]+$/.test(videoId || '')) return;
      video.pause();
      video.currentTime = 0;
      video.onerror = null;
      video.oncanplaythrough = null;
      video.src = 'assets/videos/' + videoId + '.mp4' + ASSET_VERSION;
      video.load();
      video.onerror = () => {};
      video.oncanplaythrough = () => {
        video.play().catch(() => {});
      };
      currentId = videoId;
    }

    function maybeSwap() {
      if (!pendingId || pendingId === currentId) return;
      if (panel) {
        const rect = panel.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      }
      swapVideo(pendingId);
      pendingId = null;
    }

    function activate(step) {
      if (step === active) return;
      active = step;
      steps.forEach((s) => {
        const on = s === step;
        s.classList.toggle('active-step', on);
        if (on) s.setAttribute('aria-current', 'step');
        else s.removeAttribute('aria-current');
      });
      section.classList.add('has-active');
      if (caption && step.dataset.label) caption.textContent = step.dataset.label;
      if (panel) {
        panel.classList.remove('pulse');
        void panel.offsetWidth;
        panel.classList.add('pulse');
      }
      pendingId = step.dataset.video;
      maybeSwap();
    }

    steps.forEach((step) => {
      step.addEventListener('click', () => activate(step));
      // The steps are focusable (tabindex="0" role="button"); make Enter
      // and Space activate them like a native button.
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          activate(step);
        }
      });
    });

    // Scroll-spy: whichever step crosses the viewport's middle band drives
    // the panel, so scrolling alone tells the workflow.
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) activate(entry.target);
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      steps.forEach((s) => spy.observe(s));
    }

    window.addEventListener('scroll', maybeSwap, { passive: true });
    activate(steps[0]);
  }

  // Scroll-driven reveal of the workflow steps and video. .anim-ready is
  // only added when IntersectionObserver exists, so without JS (or with
  // reduced motion handled by CSS) everything simply renders visible.
  function setupScrollReveal() {
    const section = document.querySelector('.how-it-works');
    if (!section || !('IntersectionObserver' in window)) return;
    section.classList.add('anim-ready');
    const items = section.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    items.forEach((el, i) => {
      el.style.transitionDelay = (i * 0.12) + 's';
      observer.observe(el);
    });
  }

  // Draws the stepper's progress line as it scrolls through the viewport
  // (--progress 0..1, consumed by .progress-line's scaleY in styles.css).
  function setupProgressLine() {
    const steps = document.querySelector('.workflow-steps');
    if (!steps) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = steps.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - rect.top) / rect.height));
      steps.style.setProperty('--progress', progress.toFixed(3));
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
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
    // or by the stepper).
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
    setupStepper();
    setupScrollReveal();
    setupProgressLine();
    setupHeroVideoDataSaver();
    setupHeroVideoControls();
    setupBackButton();
    setupSmoothScroll();
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
