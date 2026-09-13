// ══════════════════════════════════════════════════════════════
// GEOPULSE — Tour Bundle Loader (tours_loader.js)
// Keeps ~450 KB of tour prose off the critical rendering path.
//
// The tour CATALOGUE is static markup in index.html, so the list,
// the filter and search.js all keep working without this data.
// Only starting a tour needs the prose — so it is fetched when the
// browser is idle, and forced to the front of the queue if someone
// clicks a tour before that finishes.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // main.js runs `const TOURS = window._TOURS_DATA || {}` during its
    // DOMContentLoaded handler and exposes that same object as _TOURS_REF.
    // Creating the object here — before any deferred script executes — means
    // the bundles can merge into the very object main.js is already holding.
    window._TOURS_DATA = window._TOURS_DATA || {};

    var VERSION = (window.GeopulseConfig && window.GeopulseConfig.VERSION) || '';
    var BUNDLE = ['tours_data.js', 'tours_new.js', 'tours_wind.js', 'tours_de.js'];
    var pending = null;

    function inject(file) {
        return new Promise(function (resolve) {
            var s = document.createElement('script');
            s.src = './' + file + (VERSION ? '?v=' + VERSION : '');
            s.async = false; // keep execution order across the bundle
            s.onload = resolve;
            s.onerror = function () {
                console.warn('[TOURS_LOADER] failed to load ' + file);
                resolve();
            };
            document.head.appendChild(s);
        });
    }

    // tours_new.js and tours_wind.js merge themselves on a timer rather than on
    // load, so "the script finished" is not the same as "the tour is available".
    function waitFor(tourId, timeoutMs) {
        var deadline = Date.now() + (timeoutMs || 2500);
        return new Promise(function (resolve) {
            (function poll() {
                var ref = window._TOURS_REF || window._TOURS_DATA;
                if (!tourId || (ref && ref[tourId]) || Date.now() > deadline) return resolve();
                setTimeout(poll, 60);
            })();
        });
    }

    function ensureTours(tourId) {
        if (!pending) {
            pending = BUNDLE.reduce(function (chain, file) {
                return chain.then(function () { return inject(file); });
            }, Promise.resolve()).then(function () {
                if (typeof window._refreshTourSites === 'function') window._refreshTourSites();
            });
        }
        return pending.then(function () { return waitFor(tourId); });
    }

    window.ensureTours = ensureTours;

    // ── Click guard ───────────────────────────────────────────────
    // Catch tour clicks before main.js's own handlers see them. If the prose
    // is not in yet, swallow the click, load, then replay it untouched.
    var replaying = false;
    document.addEventListener('click', function (ev) {
        var btn = ev.target && ev.target.closest && ev.target.closest('[data-tour]');
        if (!btn || replaying) return;

        var id = btn.getAttribute('data-tour');
        window._geopulseActiveTour = id; // read by permalink.js

        var ref = window._TOURS_REF || window._TOURS_DATA;
        if (ref && ref[id]) return; // already loaded — let it through

        ev.preventDefault();
        ev.stopPropagation();
        btn.classList.add('tour-loading');

        ensureTours(id).then(function () {
            btn.classList.remove('tour-loading');
            replaying = true;
            btn.click();
            replaying = false;
        });
    }, true); // capture phase

    document.addEventListener('click', function (ev) {
        if (ev.target && ev.target.closest && ev.target.closest('#tour-close')) {
            window._geopulseActiveTour = null;
        }
    }, true);

    // ── Idle preload ──────────────────────────────────────────────
    // Off the critical path, but still in well before anyone reads the
    // welcome card and picks a tour.
    function preload() {
        if (window.requestIdleCallback) requestIdleCallback(function () { ensureTours(); }, { timeout: 4000 });
        else setTimeout(function () { ensureTours(); }, 1200);
    }
    if (document.readyState === 'complete') preload();
    else window.addEventListener('load', preload, { once: true });
})();
