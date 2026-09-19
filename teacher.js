// ══════════════════════════════════════════════════════════════
// GEOPULSE — Classroom share (teacher.js)
//
// Adds a "CLASS" button to the tour briefing. It opens a card with a
// QR code and a short link for the running tour — put it on the
// projector, students scan it and land in the same tour on their own
// device — plus a link to the printable worksheet.
//
// The QR encoder (vendor/qrcode.js, MIT, Kazuhiko Arase) is loaded on
// first use only. Reads window._geopulseActiveTour set by main.js.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    var T = {
        en: { btn: 'CLASS', title: 'SHARE WITH YOUR CLASS', scan: 'Students scan this code and land in the same tour — no app, no login.',
              copy: 'Copy link', copied: 'Copied', sheet: 'Printable worksheet', hub: 'All tours for teachers', none: 'Start a tour first.' },
        de: { btn: 'KLASSE', title: 'MIT DER KLASSE TEILEN', scan: 'Schüler scannen den Code und landen in derselben Tour — ohne App, ohne Login.',
              copy: 'Link kopieren', copied: 'Kopiert', sheet: 'Arbeitsblatt zum Ausdrucken', hub: 'Alle Touren für Lehrkräfte', none: 'Starte zuerst eine Tour.' }
    };
    var lang = function () { return (typeof window.getLanguage === 'function' && window.getLanguage() === 'de') ? 'de' : 'en'; };
    var t = function (k) { return T[lang()][k]; };

    var card = null;
    var qrLoading = null;

    function loadQr() {
        if (window.qrcode) return Promise.resolve();
        if (qrLoading) return qrLoading;
        qrLoading = new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = './vendor/qrcode.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        return qrLoading;
    }

    function tourUrl(id) {
        return location.origin + '/#tour=' + encodeURIComponent(id) + (lang() === 'de' ? '&lang=de' : '');
    }
    function sheetUrl(id) {
        return lang() === 'de' ? '/de/touren/' + id + '/#arbeitsblatt' : '/tours/' + id + '/#worksheet';
    }

    function build() {
        card = document.createElement('div');
        card.className = 'class-card';
        card.setAttribute('role', 'dialog');
        card.innerHTML = '<div class="class-box">' +
            '<div class="class-head"><span class="class-title"></span>' +
            '<button class="class-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>' +
            '<div class="class-qr"></div>' +
            '<p class="class-scan"></p>' +
            '<div class="class-link"><input readonly class="class-url"><button class="class-copy"></button></div>' +
            '<div class="class-foot"><a class="class-sheet" target="_blank" rel="noopener"></a><a class="class-hub" target="_blank" rel="noopener"></a></div></div>';
        card.querySelector('.class-close').addEventListener('click', close);
        card.addEventListener('click', function (e) { if (e.target === card) close(); });
        card.querySelector('.class-copy').addEventListener('click', function () {
            var btn = this, input = card.querySelector('.class-url');
            var done = function () { btn.textContent = t('copied'); setTimeout(function () { btn.textContent = t('copy'); }, 1600); };
            if (navigator.clipboard) navigator.clipboard.writeText(input.value).then(done, function () { input.select(); });
            else { input.select(); }
        });
        document.body.appendChild(card);
    }

    function open() {
        var id = window._geopulseActiveTour;
        if (!card) build();
        card.querySelector('.class-title').textContent = t('title');
        card.querySelector('.class-scan').textContent = id ? t('scan') : t('none');
        card.querySelector('.class-link').style.display = id ? '' : 'none';
        card.querySelector('.class-copy').textContent = t('copy');
        var sheet = card.querySelector('.class-sheet');
        sheet.style.display = id ? '' : 'none';
        sheet.textContent = '🖨 ' + t('sheet');
        var hub = card.querySelector('.class-hub');
        hub.textContent = t('hub') + ' →';
        hub.setAttribute('href', lang() === 'de' ? '/lehrkraefte/' : '/teachers/');
        var qrBox = card.querySelector('.class-qr');
        qrBox.innerHTML = '';
        card.classList.add('open');
        if (!id) return;

        var url = tourUrl(id);
        card.querySelector('.class-url').value = url;
        sheet.setAttribute('href', sheetUrl(id));
        loadQr().then(function () {
            var q = window.qrcode(0, 'M');
            q.addData(url);
            q.make();
            qrBox.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        }).catch(function () { qrBox.textContent = url; });
    }

    function close() { if (card) card.classList.remove('open'); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    function init() {
        var header = document.querySelector('#tour-briefing .tour-briefing-header');
        var closeBtn = document.getElementById('tour-close');
        if (!header || !closeBtn) return;
        var btn = document.createElement('button');
        btn.id = 'tour-class';
        btn.className = 'btn-class-briefing';
        btn.title = 'QR code & link for your class';
        btn.innerHTML = '<i class="fa-solid fa-chalkboard-user"></i> <span></span>';
        var label = btn.querySelector('span');
        var sync = function () { label.textContent = t('btn'); };
        sync();
        document.addEventListener('geopulse:langchange', sync);
        document.addEventListener('setLang', function () { setTimeout(sync, 0); });
        var prev = window.setLanguage;
        if (typeof prev === 'function') window.setLanguage = function (l) { prev(l); sync(); };
        btn.addEventListener('click', open);
        header.insertBefore(btn, closeBtn);
    }

    window.geopulseClass = { open: open, close: close };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
