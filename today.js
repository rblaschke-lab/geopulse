// ══════════════════════════════════════════════════════════════
// GEOPULSE — Today on Earth (today.js)
//
// A one-screen daily briefing built from data the map already has:
// strongest earthquake of the last 24 h, newest fireball, the solar
// storm index, plus a "tour of the day" that rotates by date. Shareable
// as geopulseworld.com/#today — the link opens this card.
//
// Reads only documented globals (_GEOPULSE_MAP, getLanguage, ensureTours,
// _geopulseStartTour) and the 'geopulse:data-ready' event from main.js.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    var T = {
        en: {
            title: 'TODAY ON EARTH', quake: 'Strongest earthquake · 24 h', quakes: 'earthquakes M2.5+ in 24 h',
            fireball: 'Newest fireball', fireballEnergy: 'kT explosion energy', kp: 'Solar storm index (Kp)',
            kpQuiet: 'quiet', kpActive: 'active', kpStorm: 'storm — aurora likely',
            fires: 'Wildfires', firesText: 'Satellite hotspots from the last 24 h',
            tour: 'Tour of the day', startTour: 'Start tour', show: 'Show', share: 'Share today',
            copied: 'Link copied', loading: 'Collecting today’s data…', none: 'No data right now',
            teachers: 'Using this in class? Worksheets & QR codes →'
        },
        de: {
            title: 'HEUTE AUF DER WELT', quake: 'Stärkstes Erdbeben · 24 h', quakes: 'Erdbeben ab M2,5 in 24 h',
            fireball: 'Neuester Feuerball', fireballEnergy: 'kT Explosionsenergie', kp: 'Sonnensturm-Index (Kp)',
            kpQuiet: 'ruhig', kpActive: 'aktiv', kpStorm: 'Sturm — Polarlicht wahrscheinlich',
            fires: 'Waldbrände', firesText: 'Satelliten-Hotspots der letzten 24 h',
            tour: 'Tour des Tages', startTour: 'Tour starten', show: 'Zeigen', share: 'Heute teilen',
            copied: 'Link kopiert', loading: 'Sammle die Daten von heute…', none: 'Gerade keine Daten',
            teachers: 'Im Unterricht nutzen? Arbeitsblätter & QR-Codes →'
        }
    };
    var lang = function () {
        var l = typeof window.getLanguage === 'function' ? window.getLanguage() : 'en';
        return l === 'de' ? 'de' : 'en';
    };
    var t = function (k) { return T[lang()][k]; };
    var esc = function (s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; };

    var panel = null;

    // ── Data from the map's own sources ─────────────────────────────
    function sourceData(id) {
        var map = window._GEOPULSE_MAP;
        var src = map && map.getSource(id);
        if (!src) return null;
        var d = src._data || (src.serialize && src.serialize().data);
        return d && d.features ? d : null;
    }

    function strongestQuake() {
        var d = sourceData('earthquakes-src');
        if (!d || !d.features.length) return null;
        var best = null;
        d.features.forEach(function (f) {
            var m = f.properties && f.properties.mag;
            if (typeof m === 'number' && (!best || m > best.properties.mag)) best = f;
        });
        return best ? { count: d.features.length, mag: best.properties.mag, place: best.properties.place, time: best.properties.time, coords: best.geometry.coordinates } : null;
    }

    function newestFireball() {
        var d = sourceData('fireballs-src');
        if (!d || !d.features.length) return null;
        var f = d.features.slice().sort(function (a, b) { return String(b.properties.date).localeCompare(String(a.properties.date)); })[0];
        return { date: f.properties.date, energy: f.properties.energy, coords: f.geometry.coordinates };
    }

    function fetchKp() {
        return fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
            .then(function (r) { return r.json(); })
            .then(function (rows) {
                var last = rows && rows[rows.length - 1];
                var kp = last && (typeof last === 'object' && !Array.isArray(last) ? parseFloat(last.Kp) : parseFloat(last[1]));
                return isFinite(kp) ? kp : null;
            })
            .catch(function () { return null; });
    }

    function tourOfTheDay() {
        var seen = {}, list = [];
        document.querySelectorAll('.tour-btn[data-tour]').forEach(function (b) {
            var id = b.getAttribute('data-tour');
            if (!id || id === 'welcome' || seen[id]) return;
            seen[id] = 1;
            list.push({ id: id, name: b.textContent.replace(/\s+/g, ' ').trim() });
        });
        if (!list.length) return null;
        list.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
        var day = Math.floor(Date.now() / 86400000);
        return list[day % list.length];
    }

    // ── Actions ─────────────────────────────────────────────────────
    function showLayer(id) {
        var cb = document.getElementById('toggle-' + id);
        if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    function flyTo(coords, zoom) {
        var map = window._GEOPULSE_MAP;
        if (map && coords) map.flyTo({ center: [coords[0], coords[1]], zoom: zoom || 4.5, speed: 0.8 });
    }
    function startTour(id) {
        close();
        var go = function () { if (typeof window._geopulseStartTour === 'function') window._geopulseStartTour(id); };
        if (typeof window.ensureTours === 'function') window.ensureTours(id).then(go); else go();
    }
    function share(btn, summary) {
        var url = location.origin + '/#today' + (lang() === 'de' ? '&lang=de' : '');
        var text = t('title') + ' — ' + summary;
        if (navigator.share) {
            navigator.share({ title: 'GEOPULSE — ' + t('title'), text: text, url: url }).catch(function () {});
            return;
        }
        var done = function () { btn.textContent = t('copied'); setTimeout(function () { btn.textContent = t('share'); }, 1800); };
        if (navigator.clipboard) navigator.clipboard.writeText(text + ' ' + url).then(done, done);
    }

    // ── Rendering ───────────────────────────────────────────────────
    function row(icon, label, value, actionLabel, action) {
        var el = document.createElement('div');
        el.className = 'today-row';
        el.innerHTML = '<div class="today-icon">' + icon + '</div>' +
            '<div class="today-body"><div class="today-label">' + esc(label) + '</div><div class="today-value">' + value + '</div></div>';
        if (actionLabel) {
            var b = document.createElement('button');
            b.className = 'today-action';
            b.textContent = actionLabel;
            b.addEventListener('click', action);
            el.appendChild(b);
        }
        return el;
    }

    function render(kp) {
        var body = panel.querySelector('.today-list');
        body.innerHTML = '';
        var de = lang() === 'de';
        var summary = [];

        var q = strongestQuake();
        if (q) {
            summary.push('M' + q.mag.toFixed(1) + ' ' + (q.place || ''));
            body.appendChild(row('🌍', t('quake'),
                '<strong>M' + esc(q.mag.toFixed(1)) + '</strong> · ' + esc(q.place || '') +
                '<div class="today-sub">' + esc(q.count) + ' ' + esc(t('quakes')) + '</div>',
                t('show'), function () { showLayer('earthquakes'); flyTo(q.coords, 5); }));
        }

        body.appendChild(row('🔥', t('fires'), esc(t('firesText')), t('show'), function () { showLayer('fires'); }));

        var fb = newestFireball();
        if (fb) {
            var d = new Date(String(fb.date).replace(' ', 'T') + 'Z');
            var when = isNaN(d) ? fb.date : d.toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
            body.appendChild(row('☄️', t('fireball'),
                esc(when) + ' · ' + esc(fb.energy) + ' ' + esc(t('fireballEnergy')),
                t('show'), function () { showLayer('fireballs'); flyTo(fb.coords, 3.5); }));
        }

        if (kp != null) {
            var state = kp >= 5 ? t('kpStorm') : kp >= 4 ? t('kpActive') : t('kpQuiet');
            summary.push('Kp ' + kp.toFixed(1));
            body.appendChild(row('☀️', t('kp'), '<strong>' + esc(kp.toFixed(1)) + '</strong> · ' + esc(state),
                kp >= 4 ? t('show') : null, function () { showLayer('aurora'); }));
        }

        var tour = tourOfTheDay();
        if (tour) {
            summary.push(t('tour') + ': ' + tour.name);
            var tr = row('🧭', t('tour'), '<strong>' + esc(tour.name) + '</strong>', t('startTour'), function () { startTour(tour.id); });
            tr.classList.add('today-tour');
            body.appendChild(tr);
        }

        if (!body.children.length) body.innerHTML = '<div class="today-empty">' + esc(t('none')) + '</div>';

        var shareBtn = panel.querySelector('.today-share');
        shareBtn.textContent = t('share');
        shareBtn.onclick = function () { share(shareBtn, summary.join(' · ')); };

        var teach = panel.querySelector('.today-teachers');
        teach.textContent = t('teachers');
        teach.setAttribute('href', de ? '/lehrkraefte/' : '/teachers/');
    }

    function build() {
        panel = document.createElement('div');
        panel.id = 'today-panel';
        panel.className = 'today-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'false');
        panel.innerHTML =
            '<div class="today-head"><div><div class="today-title"></div><div class="today-date"></div></div>' +
            '<button class="today-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<div class="today-list"></div>' +
            '<div class="today-foot"><button class="today-share"></button><a class="today-teachers" href="/teachers/"></a></div>';
        panel.querySelector('.today-close').addEventListener('click', close);
        document.body.appendChild(panel);
    }

    function open() {
        if (!panel) build();
        var de = lang() === 'de';
        panel.querySelector('.today-title').textContent = t('title');
        panel.querySelector('.today-date').textContent = new Date().toLocaleDateString(de ? 'de-DE' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        panel.querySelector('.today-list').innerHTML = '<div class="today-empty">' + esc(t('loading')) + '</div>';
        panel.classList.add('open');
        fetchKp().then(render);
    }

    function close() { if (panel) panel.classList.remove('open'); }

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // Same readiness rule as linked tours: data layers exist and the visitor
    // is past the ENTER gateway.
    function whenReady(cb) {
        var deadline = Date.now() + 120000;
        (function poll() {
            if (window._geopulseDataReady && !document.getElementById('enter-gateway')) return setTimeout(cb, 1200);
            if (Date.now() < deadline) setTimeout(poll, 150);
        })();
    }

    function init() {
        var link = document.getElementById('today-link');
        if (link) link.addEventListener('click', function (e) {
            e.preventDefault();
            if (panel && panel.classList.contains('open')) close(); else open();
        });
        if (/(^#|&)today(&|$)/.test(location.hash)) whenReady(open);
    }

    window.geopulseToday = { open: open, close: close };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
