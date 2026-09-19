// ══════════════════════════════════════════════════════════════
// GEOPULSE — Earthquake time-lapse (timelapse.js)
//
// Replays the last 7 days of M2.5+ earthquakes (USGS weekly feed,
// keyless) in about 15 seconds: a trailing 24-hour window slides across
// the week, newer quakes brighter. Play / pause / scrub; one button in
// the Real-Time menu starts it, the overlay's × removes everything again.
//
// Loads its data only when opened. Uses _GEOPULSE_MAP and getLanguage.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    var FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
    var HOUR = 3600000, WINDOW = 24 * HOUR, STEP = HOUR, TICK = 85;
    var SRC = 'quakes-week-src', LAYER = 'quakes-week-layer', GLOW = 'quakes-week-glow';

    var T = {
        en: { btn: '▶ 7-day time-lapse', loading: 'LOADING 7 DAYS OF EARTHQUAKES…', failed: 'USGS feed unreachable', quakes: 'quakes', of: 'of' },
        de: { btn: '▶ 7-Tage-Zeitraffer', loading: 'LADE 7 TAGE ERDBEBEN…', failed: 'USGS-Feed nicht erreichbar', quakes: 'Beben', of: 'von' }
    };
    var lang = function () { return (typeof window.getLanguage === 'function' && window.getLanguage() === 'de') ? 'de' : 'en'; };
    var t = function (k) { return T[lang()][k]; };

    var bar = null, timer = null, start = 0, end = 0, cursor = 0, data = null;

    function map() { return window._GEOPULSE_MAP; }

    function fmt(ms) {
        return new Date(ms).toLocaleString(lang() === 'de' ? 'de-DE' : 'en-GB',
            { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    function buildBar() {
        bar = document.createElement('div');
        bar.id = 'timelapse-bar';
        bar.innerHTML =
            '<button class="tl-play" aria-label="Play/Pause"><i class="fa-solid fa-play"></i></button>' +
            '<div class="tl-mid"><div class="tl-label"></div><input class="tl-range" type="range" min="0" max="1000" value="0" aria-label="Time"></div>' +
            '<button class="tl-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>';
        bar.querySelector('.tl-play').addEventListener('click', function () { timer ? pause() : play(); });
        bar.querySelector('.tl-close').addEventListener('click', stop);
        bar.querySelector('.tl-range').addEventListener('input', function () {
            pause();
            cursor = start + WINDOW + (end - start - WINDOW) * (this.value / 1000);
            apply();
        });
        document.body.appendChild(bar);
    }

    function label(text) { bar.querySelector('.tl-label').textContent = text; }

    function apply() {
        var m = map();
        if (!m || !m.getLayer(LAYER)) return;
        var from = cursor - WINDOW;
        var filter = ['all', ['<=', ['get', 'time'], cursor], ['>=', ['get', 'time'], from]];
        m.setFilter(LAYER, filter);
        m.setFilter(GLOW, filter);
        // Age 0 → bright, 24 h old → faint.
        var fade = ['interpolate', ['linear'], ['get', 'time'], from, 0.15, cursor, 0.95];
        m.setPaintProperty(LAYER, 'circle-opacity', fade);
        var n = data.features.filter(function (f) { var tm = f.properties.time; return tm <= cursor && tm >= from; }).length;
        label(fmt(cursor) + '  ·  ' + n + ' ' + t('quakes') + ' / 24 h');
        bar.querySelector('.tl-range').value = Math.round(1000 * (cursor - start - WINDOW) / Math.max(1, end - start - WINDOW));
    }

    function play() {
        if (cursor >= end) cursor = start + WINDOW;
        bar.querySelector('.tl-play i').className = 'fa-solid fa-pause';
        timer = setInterval(function () {
            cursor += STEP;
            if (cursor >= end) { cursor = end; apply(); pause(); return; }
            apply();
        }, TICK);
    }
    function pause() {
        clearInterval(timer); timer = null;
        if (bar) bar.querySelector('.tl-play i').className = 'fa-solid fa-play';
    }

    function addLayers() {
        var m = map();
        if (m.getSource(SRC)) return;
        m.addSource(SRC, { type: 'geojson', data: data });
        var radius = ['interpolate', ['linear'], ['get', 'mag'], 2.5, 3, 5, 8, 7, 16];
        m.addLayer({ id: GLOW, type: 'circle', source: SRC, paint: {
            'circle-radius': ['*', radius, 2.4], 'circle-color': '#ff6600', 'circle-opacity': 0.12, 'circle-blur': 1 } });
        m.addLayer({ id: LAYER, type: 'circle', source: SRC, paint: {
            'circle-radius': radius,
            'circle-color': ['interpolate', ['linear'], ['get', 'mag'], 2.5, '#ffb000', 5, '#ff6600', 7, '#ff0000'],
            'circle-stroke-color': '#fff', 'circle-stroke-width': 0.4, 'circle-opacity': 0.9 } });
    }

    function removeLayers() {
        var m = map();
        if (!m) return;
        [LAYER, GLOW].forEach(function (id) { if (m.getLayer(id)) m.removeLayer(id); });
        if (m.getSource(SRC)) m.removeSource(SRC);
    }

    function startLapse() {
        if (!map()) return;
        if (!bar) buildBar();
        bar.classList.add('open');
        label(t('loading'));
        fetch(FEED).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (json) {
            data = json;
            var times = json.features.map(function (f) { return f.properties.time; });
            start = Math.min.apply(null, times);
            end = Math.max.apply(null, times);
            cursor = start + WINDOW;
            addLayers();
            var m = map();
            if (m.getZoom() > 3) m.easeTo({ zoom: 1.6, duration: 900 });
            apply();
            play();
        }).catch(function () { label(t('failed')); });
    }

    function stop() {
        pause();
        removeLayers();
        if (bar) bar.classList.remove('open');
    }

    function init() {
        var eq = document.getElementById('toggle-earthquakes');
        var item = eq && eq.closest('.control-item');
        if (!item) return;
        var btn = document.createElement('button');
        btn.id = 'timelapse-btn';
        btn.className = 'timelapse-btn';
        var sync = function () { btn.textContent = t('btn'); };
        sync();
        var prev = window.setLanguage;
        if (typeof prev === 'function') window.setLanguage = function (l) { prev(l); sync(); };
        btn.addEventListener('click', function () { (bar && bar.classList.contains('open')) ? stop() : startLapse(); });
        item.querySelector('.layer-info').appendChild(btn);
    }

    window.geopulseTimelapse = { start: startLapse, stop: stop };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
