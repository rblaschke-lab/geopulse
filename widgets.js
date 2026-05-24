// GEOPULSE WIDGETS MODULE — V2.41
// Wikipedia helper, Feedback widget, Live clock
// Extracted from main.js for modularization
(function() {
'use strict';

// ── WIKIPEDIA LINK HELPER (for popup enrichment) ──
window._wikiLink = function(name) {
    const slug = name.replace(/\s+/g, '_').replace(/[()]/g, '');
    return '<a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(slug) + '" target="_blank" rel="noopener" ' +
           'style="display:block;margin-top:6px;font-size:.6rem;color:#00d4ff;text-decoration:none;letter-spacing:1px;border-top:1px solid rgba(0,212,255,.15);padding-top:4px;">' +
           '\ud83d\udcda Learn more on Wikipedia \u2197</a>';
};

// ── FEEDBACK WIDGET ──
const fbToggle = document.getElementById('feedback-toggle');
const fbPanel = document.getElementById('feedback-panel');
const fbClose = document.getElementById('feedback-close');
const fbSubmit = document.getElementById('feedback-submit');
const fbBug = document.getElementById('feedback-bug');
const starRating = document.getElementById('star-rating');
const starLabel = document.getElementById('star-label');
let selectedRating = 0;
const STAR_LABELS = ['', '😕 POOR — Needs work', '😐 FAIR — Has potential', '👍 GOOD — Solid', '🔥 GREAT — Impressed', '🚀 EXCELLENT — Love it!'];

if (fbToggle && fbPanel) {
    fbToggle.addEventListener('click', () => fbPanel.classList.toggle('hidden'));
    fbClose?.addEventListener('click', () => fbPanel.classList.add('hidden'));

    // Star rating interaction
    if (starRating) {
        const stars = starRating.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach(s => {
                    s.classList.toggle('hover', parseInt(s.dataset.val) <= val);
                });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.classList.remove('hover'));
            });
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.val);
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.val) <= selectedRating);
                });
                if (starLabel) starLabel.textContent = STAR_LABELS[selectedRating] || '';
            });
        });
    }

    // Bug report link
    const cfg = window.GeopulseConfig?.FEEDBACK || {};
    if (fbBug && cfg.GITHUB_ISSUES_URL) {
        fbBug.href = cfg.GITHUB_ISSUES_URL + '?labels=bug&title=[Bug]%20&body=Describe%20the%20issue...';
    }

    // Submit feedback → Google Form
    fbSubmit?.addEventListener('click', () => {
        const rating = selectedRating;
        const fav = document.getElementById('feedback-fav')?.value || '';
        const wish = document.getElementById('feedback-wish')?.value || '';
        const comment = document.getElementById('feedback-comment')?.value || '';

        if (!rating) {
            starRating?.classList.add('shake');
            setTimeout(() => starRating?.classList.remove('shake'), 500);
            return;
        }

        // Build Google Form pre-filled URL
        const formUrl = cfg.GOOGLE_FORM_URL || '';
        const params = new URLSearchParams({
            usp: 'pp_url',
            [cfg.FIELD_RATING || 'entry.0']: rating + ' / 5 — ' + STAR_LABELS[rating],
            [cfg.FIELD_FAVOURITE || 'entry.1']: fav,
            [cfg.FIELD_COMMENT || 'entry.2']: comment,
            [cfg.FIELD_WISH || 'entry.3']: wish
        });

        window.open(formUrl + '?' + params.toString(), '_blank');

        // Reset form
        selectedRating = 0;
        starRating?.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        if (starLabel) starLabel.textContent = '';
        const favEl = document.getElementById('feedback-fav');
        if (favEl) favEl.selectedIndex = 0;
        const wishEl = document.getElementById('feedback-wish');
        if (wishEl) wishEl.value = '';
        const commentEl = document.getElementById('feedback-comment');
        if (commentEl) commentEl.value = '';

        // Show thank-you state
        fbSubmit.innerHTML = '<i class="fa-solid fa-check"></i> THANK YOU!';
        fbSubmit.style.borderColor = 'rgba(0,255,136,0.5)';
        fbSubmit.style.color = '#00ff88';
        setTimeout(() => {
            fbSubmit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SUBMIT FEEDBACK';
            fbSubmit.style.borderColor = '';
            fbSubmit.style.color = '';
            fbPanel.classList.add('hidden');
        }, 2000);
    });
}

// ── LIVE CLOCK (bottom-left quick-links) ──
const clockEl = document.getElementById('live-clock');
if (clockEl) {
    const tickClock = () => {
        const now = new Date();
        const d = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const t = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        clockEl.textContent = `${d} ${t}`;
    };
    tickClock();
    setInterval(tickClock, 1000);
}

})();
