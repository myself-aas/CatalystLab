/**
 * CatalystLab First-Party Telemetry & Analytics Tracker (telemetry.js)
 * High-performance, lightweight (<2.5KB), zero-cookie analytics with SHA-256 anonymous visitor hashing,
 * client-side event batching, session lifecycle tracking (session_start / session_end), and Core Web Vitals RUM.
 * Compatible as drop-in Plausible replacement (window.plausible & window.catalyst).
 */
(function (window, document) {
  'use strict';

  var location = window.location;
  var script = document.currentScript;
  var domain = (script && script.getAttribute('data-domain')) || location.hostname;
  var endpoint = (script && script.getAttribute('data-api')) || '/api/telemetry/event';
  var trackVitals = (script && script.getAttribute('data-vitals')) !== 'false';
  var batchInterval = parseInt((script && script.getAttribute('data-batch-interval')) || '1200', 10);
  var maxBatchSize = parseInt((script && script.getAttribute('data-batch-size')) || '15', 10);

  // In-memory client-side event batch queue
  var eventQueue = [];
  var batchTimer = null;
  var sessionStartTime = Date.now();
  var lastActivityTime = Date.now();
  var pageviewCount = 0;
  var isSessionStarted = false;
  var cachedVisitorId = null;

  // Lightweight standalone SHA-256 implementation (Zero-dependency fallback)
  function sha256Sync(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // ASCII check
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15],
          w2 = w[i - 2];
        var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var s0_ = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        var s1_ = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        var t1 =
          hash[7] +
          s1_ +
          ch +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
        var t2 = s0_ + maj;

        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  // Generate anonymous, cookieless, GDPR-compliant SHA-256 visitor fingerprint (Rotates daily)
  function getAnonymousVisitorId() {
    if (cachedVisitorId) return cachedVisitorId;
    var dailySalt = new Date().toISOString().slice(0, 10);
    var screenFp = (window.screen ? window.screen.width + 'x' + window.screen.height + 'x' + window.screen.colorDepth : '0x0') + '-' + (window.devicePixelRatio || 1);
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    var tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {}

    var rawEntropy = domain + '|' + dailySalt + '|' + screenFp + '|' + lang + '|' + tz;
    cachedVisitorId = sha256Sync(rawEntropy);
    return cachedVisitorId;
  }

  // Generate anonymous session token for correlating session_start and session_end
  var sessionToken = (function () {
    var raw = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return sha256Sync(raw).substring(0, 16);
  })();

  // Filter out automated bots / headless testing engines on client-side
  function isBotEnvironment() {
    if (navigator.webdriver) return true;
    var ua = (navigator.userAgent || '').toLowerCase();
    return /bot|crawler|spider|headless|puppeteer|selenium|phantom|lighthouse/i.test(ua);
  }

  // Flush client-side event batch to the backend
  function flushEvents() {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    if (eventQueue.length === 0) return;

    var eventsToSend = eventQueue.splice(0, eventQueue.length);
    var payload = JSON.stringify(eventsToSend.length === 1 ? eventsToSend[0] : { events: eventsToSend });

    if (window.navigator && typeof window.navigator.sendBeacon === 'function') {
      try {
        var blob = new Blob([payload], { type: 'application/json' });
        var sent = window.navigator.sendBeacon(endpoint, blob);
        if (sent) return;
      } catch (e) {}
    }

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    } catch (e) {}
  }

  // Schedule an event into the batch queue
  function enqueueEvent(eventName, options) {
    if (isBotEnvironment()) return;

    // Check localhost exclusion
    if (/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?1$/.test(location.hostname) || location.protocol === 'file:') {
      if (!script || !script.getAttribute('data-include-localhost')) return;
    }

    lastActivityTime = Date.now();
    var visitorId = getAnonymousVisitorId();

    var eventObj = {
      name: eventName || 'pageview',
      url: location.href,
      domain: domain,
      pathname: location.pathname,
      referrer: document.referrer || null,
      visitor_id: visitorId,
      session_id: sessionToken,
      timestamp: new Date().toISOString(),
      screen_width: window.innerWidth || null,
      screen_height: window.innerHeight || null,
      device_pixel_ratio: window.devicePixelRatio || 1,
      props: options && options.props ? options.props : undefined,
      vitals: options && options.vitals ? options.vitals : undefined
    };

    eventQueue.push(eventObj);

    if (eventQueue.length >= maxBatchSize) {
      flushEvents();
    } else if (!batchTimer) {
      batchTimer = setTimeout(flushEvents, batchInterval);
    }
  }

  // 1. Session Start Event
  function triggerSessionStart() {
    if (!isSessionStarted) {
      isSessionStarted = true;
      enqueueEvent('session_start', {
        props: {
          referrer: document.referrer || 'Direct',
          entry_path: location.pathname
        }
      });
    }
  }

  // 2. Pageview Event
  function triggerPageview() {
    pageviewCount++;
    triggerSessionStart();
    enqueueEvent('pageview', {
      props: {
        pageview_index: pageviewCount
      }
    });
  }

  // 3. Session End Event (Calculates total engagement and dwell duration in seconds)
  function triggerSessionEnd() {
    var sessionDurationSec = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
    var eventObj = {
      name: 'session_end',
      url: location.href,
      domain: domain,
      pathname: location.pathname,
      visitor_id: getAnonymousVisitorId(),
      session_id: sessionToken,
      timestamp: new Date().toISOString(),
      props: {
        duration_seconds: sessionDurationSec,
        total_pageviews: pageviewCount
      }
    };
    eventQueue.push(eventObj);
    flushEvents();
  }

  // Hook into SPA Navigation (pushState, replaceState, popstate)
  var his = window.history;
  if (his && his.pushState) {
    var originalPushState = his.pushState;
    his.pushState = function () {
      originalPushState.apply(this, arguments);
      triggerPageview();
    };
    window.addEventListener('popstate', triggerPageview);
  }

  // Hook into Page Unload / Visibility Change for session_end and immediate batch flush
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });

  window.addEventListener('pagehide', function () {
    triggerSessionEnd();
  });

  window.addEventListener('beforeunload', function () {
    triggerSessionEnd();
  });

  // 4. Core Web Vitals RUM Observer (LCP, CLS, TTFB)
  if (trackVitals && window.PerformanceObserver) {
    try {
      var lcpObserver = new PerformanceObserver(function (entryList) {
        var entries = entryList.getEntries();
        if (entries.length > 0) {
          var lastEntry = entries[entries.length - 1];
          enqueueEvent('vital_lcp', { vitals: { lcp: Math.round(lastEntry.startTime) } });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      var clsValue = 0;
      var clsObserver = new PerformanceObserver(function (entryList) {
        entryList.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      window.addEventListener('load', function () {
        setTimeout(function () {
          var nav = performance.getEntriesByType('navigation')[0];
          if (nav) {
            var ttfb = Math.round(nav.responseStart - nav.requestStart);
            var domLoad = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
            enqueueEvent('vital_timing', {
              vitals: {
                ttfb: ttfb > 0 ? ttfb : 0,
                dom_load: domLoad > 0 ? domLoad : 0,
                cls: Math.round(clsValue * 1000) / 1000
              }
            });
          }
        }, 100);
      });
    } catch (e) {}
  }

  // Public Global API for custom triggers
  window.catalyst = enqueueEvent;
  window.plausible = enqueueEvent; // Drop-in Plausible replacement

  // Trigger initial session_start and pageview
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    triggerPageview();
  } else {
    document.addEventListener('DOMContentLoaded', triggerPageview);
  }
})(window, document);
