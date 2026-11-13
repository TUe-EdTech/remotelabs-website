// Remote Labs - consent-gated analytics (GDPR / ePrivacy Art. 5(3)).
//
// The site sets NO cookies. The only third-party contact is the Umami
// analytics collection endpoint (cloud.umami.is, cookieless, EU region), and
// it is contacted ONLY after the visitor explicitly accepts in the banner
// below - never before. The tracker script itself is self-hosted
// (umami-tracker.js, served from this site so ad blockers cannot block it -
// https://docs.umami.is/docs/bypass-ad-blockers) and does not live in
// index.html; this file injects it (plus the preconnect hint) at runtime.
//
// Behaviour:
//   - Consent choice is stored in localStorage ('rl-consent', 12-month TTL).
//     Storing the choice itself is strictly necessary, so it is exempt from
//     consent under ePrivacy Art. 5(3).
//   - Do Not Track is honoured as an additional opt-out: with DNT enabled,
//     analytics never loads and no banner is shown.
//   - No choice yet -> banner is shown (built from DOM APIs, so the CSP
//     stays free of 'unsafe-inline'). Accept -> store + load Umami.
//     Decline -> store + no analytics.
//   - "Privacy settings" button in the footer clears the choice and shows
//     the banner again (withdrawal of consent, GDPR Art. 7(3)).
//   - If localStorage is unavailable (private mode), the banner reappears
//     on each visit and analytics stays off unless accepted this session.
(function () {
  'use strict';

  var CONSENT_KEY = 'rl-consent';
  var CONSENT_TTL = 31536000000; // 12 months, in ms
  // Self-hosted tracker: byte-exact copy of cloud.umami.is/script.js (see
  // umami-tracker.js). Served from this site and versioned with the same ?v=
  // as this script's own URL, so the service worker's cache-first ?v=
  // handling cache-busts it on every release.
  var UMAMI_TRACKER = 'umami-tracker.js';
  // Collection endpoint: Umami Cloud (EU region) - the only third-party host
  // contacted, and only after consent.
  var UMAMI_HOST_URL = 'https://cloud.umami.is';
  var UMAMI_WEBSITE_ID = '8d0377d8-c1de-4001-b844-27ec489392ce';
  // SRI hash of umami-tracker.js (sha384 of the file bytes). test.js asserts
  // the source and deploy/ copies match this value - when refreshing the
  // vendored tracker, update the file and this constant together.
  var UMAMI_INTEGRITY = 'sha384-Kl9WoD7/D7ZGlOvsI8CDV5klPo4Mc7WzV80E+05bdd6tZs+koxB0MmImAFo/8r7M';

  // Capture this script's own ?v= now: document.currentScript is only
  // available during the initial synchronous execution, but loadAnalytics()
  // can also run later from a banner click.
  var VERSION_PARAM = (function () {
    var m = document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/);
    return m ? '?v=' + m[1] : '';
  })();

  function dntEnabled() {
    return navigator.doNotTrack === '1' ||
      navigator.msDoNotTrack === '1' ||
      window.doNotTrack === '1';
  }

  // Returns 'accepted' | 'declined' | null (no valid stored choice).
  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || (data.value !== 'accepted' && data.value !== 'declined')) return null;
      if (typeof data.timestamp !== 'number' || Date.now() - data.timestamp > CONSENT_TTL) return null;
      return data.value;
    } catch (e) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ value: value, timestamp: Date.now() }));
    } catch (e) {
      // Storage unavailable: the choice lasts for this page view only.
    }
  }

  function clearConsent() {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (e) { /* ignore */ }
  }

  var analyticsLoaded = false;

  // Inject the preconnect hint and the SRI-pinned, self-hosted Umami tracker.
  // Allowed by the CSP: the tracker loads from 'self' (script-src), its data
  // POST goes to cloud.umami.is (connect-src), and Umami's own injected
  // inline script is covered by its hash in script-src.
  function loadAnalytics() {
    analyticsLoaded = true;
    var pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = UMAMI_HOST_URL;
    document.head.appendChild(pre);

    var s = document.createElement('script');
    s.defer = true;
    s.src = UMAMI_TRACKER + VERSION_PARAM;
    s.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
    s.setAttribute('data-host-url', UMAMI_HOST_URL);
    s.integrity = UMAMI_INTEGRITY;
    s.crossOrigin = 'anonymous';
    document.body.appendChild(s);
  }

  function buildBanner(onChoice) {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.setAttribute('aria-describedby', 'consent-desc');

    var content = document.createElement('div');
    content.className = 'consent-content';

    var text = document.createElement('div');
    text.className = 'consent-text';

    var title = document.createElement('h2');
    title.id = 'consent-title';
    title.textContent = 'Privacy-friendly analytics?';

    var desc = document.createElement('p');
    desc.id = 'consent-desc';
    desc.textContent = 'This site sets no cookies. With your consent we load ' +
      'cookieless analytics (Umami, hosted in the EU) to understand how the site ' +
      'is used. Without consent nothing is loaded and no data leaves your device.';

    var policyLink = document.createElement('a');
    policyLink.href = 'privacy.html';
    policyLink.className = 'consent-link';
    policyLink.textContent = 'Read our privacy policy';

    text.appendChild(title);
    text.appendChild(desc);
    text.appendChild(policyLink);

    var actions = document.createElement('div');
    actions.className = 'consent-actions';

    var accept = document.createElement('button');
    accept.type = 'button';
    accept.id = 'consent-accept';
    accept.className = 'consent-button primary';
    accept.textContent = 'Accept analytics';

    var decline = document.createElement('button');
    decline.type = 'button';
    decline.id = 'consent-decline';
    decline.className = 'consent-button secondary';
    decline.textContent = 'Decline';

    actions.appendChild(accept);
    actions.appendChild(decline);

    content.appendChild(text);
    content.appendChild(actions);
    banner.appendChild(content);

    accept.addEventListener('click', function () { onChoice('accepted'); });
    decline.addEventListener('click', function () { onChoice('declined'); });

    return banner;
  }

  var activeBanner = null;

  function hideBanner() {
    if (activeBanner && activeBanner.parentNode) {
      activeBanner.parentNode.removeChild(activeBanner);
    }
    activeBanner = null;
  }

  function showBanner() {
    if (activeBanner) return;
    activeBanner = buildBanner(function (choice) {
      storeConsent(choice);
      hideBanner();
      if (choice === 'accepted') {
        loadAnalytics();
      } else if (analyticsLoaded) {
        // Withdrawing consent mid-session: the already-loaded analytics
        // cannot be unloaded, so reload - the stored 'declined' choice then
        // keeps it from loading again.
        location.reload();
        return;
      }
      // Return focus to the page after the dialog closes.
      var main = document.getElementById('main-content');
      if (main) main.focus();
    });
    document.body.appendChild(activeBanner);
    // Move focus into the dialog so keyboard/screen-reader users land on it.
    var acceptBtn = document.getElementById('consent-accept');
    if (acceptBtn) acceptBtn.focus();
  }

  function init() {
    // Footer "Privacy settings" link: withdraw/change the stored choice.
    // Wired regardless of the stored state so it also works after accepting.
    var settingsBtn = document.getElementById('consent-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function () {
        clearConsent();
        showBanner();
      });
    }

    var consent = readConsent();
    if (consent === 'accepted' && !dntEnabled()) {
      loadAnalytics();
      return;
    }
    if (consent === 'declined' || dntEnabled()) {
      // Stored decline, or Do Not Track: no banner, no analytics.
      return;
    }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
