// Remote Labs - site interactions.
// Loaded with <script defer>, so the DOM is fully parsed by the time this runs.
//
// What this file does, in order:
//   1. Tag touch devices and read the reduced-motion preference (used below)
//   2. Back-to-top button + one rAF-throttled scroll handler
//   3. Hero video controls (play/pause, mute) + data-saver gating
//   4. How it works: "chapter runway" scroll-driven sticky stage + crossfading
//      per-step videos
//   5. Loading placeholders for lazy media (image shimmer)
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
  // 4. How it works: "chapter runway" scrollytelling + crossfading step videos
  // -----------------------------------------------------------------------

  // Two stacked video players crossfade on swap: the incoming clip fades in
  // over the outgoing one (0.6s opacity, see .workflow-video in styles.css).
  // Returns a swap(videoId) function; with a single player it hard-swaps.
  function makeCrossfader(videoA, videoB) {
    let front = videoA;
    let back = videoB;
    return function swap(videoId) {
      if (!/^[a-zA-Z0-9_-]+$/.test(videoId || '')) return;
      if (back === front) {
        front.pause();
        front.currentTime = 0;
        front.oncanplaythrough = () => { front.play().catch(() => {}); };
        front.src = 'assets/videos/' + videoId + '.mp4' + ASSET_VERSION;
        front.load();
        return;
      }
      const incoming = back;
      const outgoing = front;
      incoming.onerror = () => {};
      incoming.oncanplaythrough = () => {
        incoming.play().catch(() => {});
        incoming.classList.remove('is-hidden');
        outgoing.classList.add('is-hidden');
        window.setTimeout(() => outgoing.pause(), 700);
        front = incoming;
        back = outgoing;
      };
      incoming.src = 'assets/videos/' + videoId + '.mp4' + ASSET_VERSION;
      incoming.load();
    };
  }

  // runway-math:start - pure scroll math for the runway, unit-tested in test.js
  function rawToAnimP(raw, slack) {
    return Math.min(1, Math.max(0, (raw - slack) / (1 - slack * 2)));
  }
  function chapterCenterRaw(k, n, slack) {
    return slack + ((k + 0.5) / n) * (1 - slack * 2);
  }
  // runway-math:end

  // How it works: the .proto-track is tall; a sticky stage reacts to scroll
  // progress --p (and chapter --ch) set here. A chapter change crossfades the
  // clip in the video panel (only while the stage is on screen). .proto-ready
  // gates the animated states, so without JS the chapters render statically.
  function setupPrototypes() {
    document.querySelectorAll('.proto').forEach((section) => {
      const track = section.querySelector('.proto-track');
      if (!track) return;
      section.classList.add('proto-ready');
      const steps = Array.from(section.querySelectorAll('.runway-step'));
      if (!steps.length) return;
      const players = section.querySelectorAll('.proto-video .workflow-video');
      const swapFn = players.length === 2 ? makeCrossfader(players[0], players[1]) : null;
      // Start the first clip once the stage approaches the viewport.
      if (players.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              players[0].play().catch(() => {});
              io.disconnect();
            }
          });
        }, { rootMargin: '600px 0px' });
        io.observe(track);
      }
      let lastVid = steps[0].dataset.video || null;
      // Inertia: scroll sets a target progress; a rAF loop eases the applied
      // progress toward it, so the numeral/rail glide instead of tracking
      // the wheel 1:1. Reduced-motion users get the raw value directly.
      const ease = prefersReducedMotion() ? 1 : 0.14;
      let target = 0;
      let current = -1;
      let rafId = 0;
      const apply = (p) => {
        section.style.setProperty('--p', p.toFixed(4));
        const ch = Math.min(steps.length - 1, Math.floor(p * steps.length));
        section.style.setProperty('--ch', ch);
        steps.forEach((s, i) => {
          s.classList.toggle('on', i === ch);
          s.classList.toggle('done', i < ch);
        });
        if (swapFn) {
          const rect = track.getBoundingClientRect();
          const inView = rect.bottom > 0 && rect.top < window.innerHeight;
          const vid = steps[ch].dataset.video;
          if (inView && vid && vid !== lastVid) {
            lastVid = vid;
            swapFn(vid);
          }
        }
      };
      const tick = () => {
        rafId = 0;
        if (current < 0) current = target;
        const diff = target - current;
        if (Math.abs(diff) < 0.0005) {
          current = target;
        } else {
          current += diff * ease;
          rafId = window.requestAnimationFrame(tick);
        }
        apply(current);
      };
      const SLACK = 0.12; // dead zone at both track ends (see onScroll)
      const onScroll = () => {
        const rect = track.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        // Slack: the first/last SLACK of the track is a dead zone, so the
        // runway does not start advancing the moment it pins (chapter 1
        // holds on arrival) and chapter 3 is reached before the track ends.
        const raw = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        target = rawToAnimP(raw, SLACK);
        if (!rafId) rafId = window.requestAnimationFrame(tick);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onScroll();

      // Chapters are directly reachable: click / Enter on a step scrolls the
      // page to that chapter's detent position (keyboard can Tab to hidden
      // steps too - opacity does not remove them from the tab order).
      steps.forEach((s, i) => {
        const go = () => {
          const rect = track.getBoundingClientRect();
          const total = rect.height - window.innerHeight;
          if (total <= 0) return;
          const y = rect.top + window.scrollY + chapterCenterRaw(i, steps.length, SLACK) * total;
          window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        };
        s.addEventListener('click', go);
        s.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            go();
          }
        });
      });

      // Detent: whenever scrolling pauses while the stage is pinned (any
      // pointer type), ease the page to the nearest chapter center, so you
      // can never stop between two numbers. Only skipped within the end
      // slack zones (arriving/exiting) - the nearest chapter is always within
      // the diff threshold, so no flick is fought.
      let snapTimer = 0;
      const detent = () => {
        const rect = track.getBoundingClientRect();
        if (!(rect.top <= 0 && rect.bottom >= window.innerHeight)) return;
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        const raw = Math.min(1, Math.max(0, -rect.top / total));
        if (raw < 0.05 || raw > 0.95) return;
        const n = steps.length;
        const animP = rawToAnimP(raw, SLACK);
        const k = Math.max(0, Math.min(n - 1, Math.round(animP * n - 0.5)));
        const targetRaw = chapterCenterRaw(k, n, SLACK);
        const targetY = rect.top + window.scrollY + targetRaw * total;
        const diff = targetY - window.scrollY;
        if (Math.abs(diff) > 2 && Math.abs(diff) < total * 0.15) {
          window.scrollTo({ top: targetY, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }
      };
      window.addEventListener('scroll', () => {
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(detent, 100);
      }, { passive: true });

      // Stepped scrolling inside the runway: while the stage is pinned, wheel/
      // touch/key input never scrolls freely - each gesture (an input burst
      // within GESTURE_MS) fires at most ONE chapter step (scrollTo that
      // chapter's center), so one hard scroll = one chapter. At the track
      // edges the gesture is swallowed unless it is fresh (no input for
      // GATE_MS), so leaving the runway always takes a second deliberate
      // scroll. Programmatic scrolls (anchors, detent, chapter clicks) are not
      // wheel/touch/key events and pass freely; ctrl+wheel zoom passes through.
      const GATE_MS = 400;
      const GESTURE_MS = 250;
      const STEP_PX = 40;
      let lastInput = 0;
      let accum = 0;
      let fired = false;
      let lastTouchY = null;
      const stepScroll = (dy, e) => {
        const now = Date.now();
        const fresh = now - lastInput > GATE_MS;
        if (now - lastInput > GESTURE_MS) { accum = 0; fired = false; }
        lastInput = now;
        const rect = track.getBoundingClientRect();
        if (rect.top > 0 || rect.bottom < window.innerHeight) return; // not pinned
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        const minY = rect.top + window.scrollY;
        const maxY = minY + total;
        if (window.scrollY + dy > maxY + 1 || window.scrollY + dy < minY - 1) {
          if (!fresh) e.preventDefault(); // edge: swallow momentum, fresh gesture exits
          return;
        }
        e.preventDefault(); // interior: the step below drives the scroll
        if (fired) return;
        accum += dy;
        if (Math.abs(accum) < STEP_PX) return;
        fired = true;
        const n = steps.length;
        const raw = Math.min(1, Math.max(0, -rect.top / total));
        const k = Math.max(0, Math.min(n - 1, Math.round(rawToAnimP(raw, SLACK) * n - 0.5)));
        const target = Math.max(0, Math.min(n - 1, k + (accum > 0 ? 1 : -1)));
        const y = minY + chapterCenterRaw(target, n, SLACK) * total;
        window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      };
      window.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return; // browser zoom
        stepScroll(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY, e);
      }, { passive: false });
      window.addEventListener('touchstart', (e) => {
        lastTouchY = e.touches[0].clientY;
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (lastTouchY === null) return;
        const y = e.touches[0].clientY;
        stepScroll(lastTouchY - y, e);
        lastTouchY = y;
      }, { passive: false });
      window.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home'].includes(e.key)) return;
        if (e.target && e.target.closest && e.target.closest('button, a, [role="button"], input, textarea, select')) return;
        stepScroll(['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key) ? 60 : -60, e);
      });
    });
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
    setupPrototypes();
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
