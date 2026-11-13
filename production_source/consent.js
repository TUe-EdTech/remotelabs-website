// Remote Labs - consent-gated analytics (GDPR / ePrivacy Art. 5(3)).
//
// The site sets NO cookies. The only third-party script is Umami analytics
// (cloud.umami.is, cookieless), and it is loaded ONLY after the visitor
// explicitly accepts in the banner below - never before. The Umami <script>
// tag therefore no longer lives in index.html; this file injects it (plus
// the preconnect hints) at runtime, so nothing contacts cloud.umami.is
// without consent.
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
  var UMAMI_SRC = 'https://cloud.umami.is/script.js';
  var UMAMI_WEBSITE_ID = '8d0377d8-c1de-4001-b844-27ec489392ce';
  // SRI hash of the Umami script - keep in sync with index.html comments.
  var UMAMI_INTEGRITY = 'sha384-Kl9WoD7/D7ZGlOvsI8CDV5klPo4Mc7WzV80E+05bdd6tZs+koxB0MmImAFo/8r7M';

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

  // Inject the preconnect hints and the SRI-pinned Umami script. Allowed by
  // the CSP: script-src contains https://cloud.umami.is, and Umami's own
  // injected inline script is covered by its hash in script-src.
  function loadAnalytics() {
    analyticsLoaded = true;
    var pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://cloud.umami.is';
    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://gateway.umami.is';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);

    var s = document.createElement('script');
    s.defer = true;
    s.src = UMAMI_SRC;
    s.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
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
