// ══════════════════════════════════════════════════════════════
// GEOPULSE — Shareable Map State (permalink.js)
//
// Keeps the address bar in sync with what is on screen, so the URL
// itself is the share link — no button, no shortener, no account:
//   #map=4.2/51.30/10.45&layers=earthquakes,fires&lang=de&tour=coldwar
//
// Reads only documented globals main.js already exposes
// (_GEOPULSE_MAP, setLanguage/getLanguage, ensureTours) and drives
// layers through the same checkbox + change event the rest of the
// app uses. Nothing in main.js needed changing.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    var NON_LAYER = { all: 1, ticker: 1 };   // UI controls, not data layers
    var WRITE_DELAY = 450;    // settle time after the last movement
    var WRITE_MAX_WAIT = 1500; // ...but never stay silent longer than this
    var restoring = false;
    var writeTimer = null;
    var writeDue = 0;
    var map = null;

    // ── Helpers ───────────────────────────────────────────────────
    function layerBoxes() {
        return Array.prototype.filter.call(
            document.querySelectorAll('input[type="checkbox"][id^="toggle-"]'),
            function (cb) { return !NON_LAYER[cb.id.slice(7)]; }
        );
    }

    function parseHash() {
        var raw = (location.hash || '').replace(/^#/, '');
        if (!raw) return null;
        var out = {};
        raw.split('&').forEach(function (pair) {
            var i = pair.indexOf('=');
            if (i <= 0) return;
            // A hand-edited link with a stray '%' must not throw here — that
            // would kill URL syncing for the whole session.
            try { out[pair.slice(0, i)] = decodeURIComponent(pair.slice(i + 1)); } catch (e) {}
        });

        var state = {};
        if (out.map) {
            var p = out.map.split('/').map(parseFloat);
            if (p.length === 3 && p.every(function (n) { return isFinite(n); })) {
                state.zoom = p[0];
                state.center = [p[2], p[1]];   // hash is zoom/lat/lon
            }
        }
        if (out.layers !== undefined) state.layers = out.layers ? out.layers.split(',') : [];
        // Anyone can craft a share link, so only accept values the app knows.
        // setLanguage persists its argument to localStorage — an unchecked
        // lang would stick in the visitor's browser beyond this visit.
        if (out.lang === 'en' || out.lang === 'de') state.lang = out.lang;
        if (out.tour && /^[a-z0-9_-]{1,40}$/i.test(out.tour)) state.tour = out.tour;
        return Object.keys(state).length ? state : null;
    }

    function buildHash() {
        if (!map) return '';
        var c = map.getCenter();
        var parts = ['map=' + map.getZoom().toFixed(2) + '/' + c.lat.toFixed(4) + '/' + c.lng.toFixed(4)];

        var on = layerBoxes().filter(function (cb) { return cb.checked; })
                             .map(function (cb) { return cb.id.slice(7); });
        if (on.length) parts.push('layers=' + on.join(','));

        var lang = typeof window.getLanguage === 'function' ? window.getLanguage() : null;
        if (lang && lang !== 'en') parts.push('lang=' + lang);

        if (window._geopulseActiveTour) parts.push('tour=' + window._geopulseActiveTour);

        return '#' + parts.join('&');
    }

    // The welcome overlay drifts the globe continuously in the background.
    // A plain debounce would be reset on every frame and never fire, so the
    // write is also capped: whatever happens, the URL is refreshed within
    // WRITE_MAX_WAIT of the first pending change.
    function write() {
        if (restoring || !map) return;
        if (isWelcomeOpen()) return;  // nothing worth sharing yet

        var now = Date.now();
        if (!writeDue) writeDue = now + WRITE_MAX_WAIT;
        clearTimeout(writeTimer);
        writeTimer = setTimeout(flush, Math.max(0, Math.min(WRITE_DELAY, writeDue - now)));
    }

    function isWelcomeOpen() {
        var wo = document.getElementById('welcome-overlay');
        return !!wo && !wo.classList.contains('hidden') && wo.offsetParent !== null;
    }

    function flush() {
        writeDue = 0;
        var next = buildHash();
        if (next && next !== location.hash) {
            // replaceState, not pushState: panning the map should not fill up
            // the back button with every intermediate view.
            try { history.replaceState(null, '', location.pathname + location.search + next); }
            catch (e) { /* file:// and the like */ }
        }
    }

    // A linked tour must not run before the data layers exist (the end of the
    // init sequence would overwrite its status line) nor behind the ENTER
    // gateway and splash, where nobody sees the opening shot. The gateway
    // removes itself from the DOM on click; the splash then fades for ~1.2 s.
    function whenVisitorIsIn(cb) {
        var deadline = Date.now() + 120000;
        (function poll() {
            var ready = !!window._geopulseDataReady;
            var gatewayGone = !document.getElementById('enter-gateway');
            if (ready && gatewayGone) return setTimeout(cb, 1500);
            if (Date.now() > deadline) return;
            setTimeout(poll, 150);
        })();
    }

    // ── Restore ───────────────────────────────────────────────────
    function restore(state) {
        if (!state) return;
        restoring = true;

        if (state.lang && typeof window.setLanguage === 'function' &&
            typeof window.getLanguage === 'function' && window.getLanguage() !== state.lang) {
            try { window.setLanguage(state.lang); } catch (e) {}
        }

        if (state.center) {
            try { map.jumpTo({ center: state.center, zoom: state.zoom }); } catch (e) {}
        }

        if (state.layers) {
            var want = {};
            state.layers.forEach(function (id) { want[id] = 1; });
            layerBoxes().forEach(function (cb) {
                var should = !!want[cb.id.slice(7)];
                if (cb.checked !== should) {
                    cb.checked = should;
                    cb.dispatchEvent(new Event('change'));
                }
            });
            // Live layers (earthquakes, fires, fireballs …) are added after their
            // fetch resolves — usually after this restore. Their toggle handlers
            // skip a layer that doesn't exist yet, and the layer is then created
            // hidden. Re-fire once everything exists.
            if (!window._geopulseDataReady) {
                document.addEventListener('geopulse:data-ready', function () {
                    layerBoxes().forEach(function (cb) {
                        if (cb.checked && want[cb.id.slice(7)]) cb.dispatchEvent(new Event('change'));
                    });
                }, { once: true });
            }
        }

        if (state.tour && typeof window.ensureTours === 'function') {
            window.ensureTours(state.tour).then(function () {
                var tours = window._TOURS_REF || window._TOURS_DATA || {};
                if (!Object.prototype.hasOwnProperty.call(tours, state.tour)) return;
                window._geopulseActiveTour = state.tour;
                whenVisitorIsIn(function () {
                    if (typeof window._geopulseStartTour === 'function') window._geopulseStartTour(state.tour);
                });
            });
        }

        setTimeout(function () { restoring = false; }, 900);
    }

    // ── Wire up once the map exists ───────────────────────────────
    function start() {
        map = window._GEOPULSE_MAP;
        if (!map) return setTimeout(start, 120);

        var initial = parseHash();

        var bound = false;
        function bind() {
            if (bound) return;
            bound = true;
            if (initial) restore(initial);
            map.on('moveend', write);
            layerBoxes().forEach(function (cb) { cb.addEventListener('change', write); });
            document.addEventListener('geopulse:langchange', write);
        }

        // Waiting for 'load' alone is a trap: if a base tile server is slow or
        // blocked, that event may never arrive and sharing would quietly die
        // with it. Camera and checkboxes are usable long before the tiles are,
        // so take whichever comes first.
        if (map.loaded && map.loaded()) bind();
        else {
            map.once('load', bind);
            setTimeout(bind, 2500);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    // Deep link for a single tour — used by the generated tour landing pages.
    window.geopulseTourLink = function (tourId) {
        return location.origin + '/#tour=' + encodeURIComponent(tourId);
    };
})();
