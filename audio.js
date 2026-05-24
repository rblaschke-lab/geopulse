// ══════════════════════════════════════════════════════════════
// GEOPULSE V2.4 — Procedural Sound Effects Engine (audio.js)
// Extracted from main.js for modularization
// Web Audio API-based — tick, whoosh, chime
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    window._geoSfx = null;
    try {
        const sfxCtx = window._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        window._geoSfx = {
            // UI click tick
            tick: () => {
                try {
                    const o = sfxCtx.createOscillator();
                    const g = sfxCtx.createGain();
                    o.type = 'sine'; o.frequency.value = 1200;
                    g.gain.setValueAtTime(0.04, sfxCtx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, sfxCtx.currentTime + 0.08);
                    o.connect(g); g.connect(sfxCtx.destination);
                    o.start(); o.stop(sfxCtx.currentTime + 0.08);
                } catch(e) {}
            },
            // Map flyTo whoosh
            whoosh: () => {
                try {
                    const bufSize = sfxCtx.sampleRate * 0.6;
                    const buf = sfxCtx.createBuffer(1, bufSize, sfxCtx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < bufSize; i++) {
                        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
                    }
                    const src = sfxCtx.createBufferSource();
                    src.buffer = buf;
                    const lp = sfxCtx.createBiquadFilter();
                    lp.type = 'lowpass'; lp.frequency.value = 400;
                    lp.frequency.linearRampToValueAtTime(150, sfxCtx.currentTime + 0.5);
                    const g = sfxCtx.createGain();
                    g.gain.setValueAtTime(0.06, sfxCtx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, sfxCtx.currentTime + 0.6);
                    src.connect(lp); lp.connect(g); g.connect(sfxCtx.destination);
                    src.start();
                } catch(e) {}
            },
            // Tour start chime
            chime: () => {
                try {
                    const now = sfxCtx.currentTime;
                    [440, 554, 659].forEach((f, i) => {
                        const o = sfxCtx.createOscillator();
                        const g = sfxCtx.createGain();
                        o.type = 'sine'; o.frequency.value = f;
                        g.gain.setValueAtTime(0, now + i * 0.12);
                        g.gain.linearRampToValueAtTime(0.03, now + i * 0.12 + 0.05);
                        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
                        o.connect(g); g.connect(sfxCtx.destination);
                        o.start(now + i * 0.12);
                        o.stop(now + i * 0.12 + 0.4);
                    });
                } catch(e) {}
            }
        };
        console.log('[AUDIO] SFX engine initialized');
    } catch(e) { console.warn('[AUDIO] Audio context not available'); }

})();
