// ══════════════════════════════════════════════════════════════
// GEOPULSE V2.4 — Enhanced Narration Engine (narration.js)
// Extracted from main.js for modularization
// Documentary-quality TTS with neural voice selection
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── State ──
    let _voiceCache = {};
    let _narrationQueue = [];
    let _narrationActive = false;

    // ── Scored Voice Ranking ──
    // Each known voice gets a quality score; highest wins.
    // Neural/Online/Natural voices are dramatically better than legacy ones.
    const VOICE_SCORES_EN = {
        // Microsoft Windows 11 Neural voices (best quality on Windows)
        'microsoft jenny online': 98, 'microsoft aria online': 97,
        'microsoft guy online': 96, 'microsoft ryan online': 95,
        'microsoft sara online': 94, 'microsoft michelle online': 93,
        'microsoft eric online': 92, 'microsoft christopher online': 91,
        // Without "online" suffix (still neural on Win11)
        'microsoft jenny': 88, 'microsoft aria': 87, 'microsoft guy': 86,
        'microsoft ryan': 85, 'microsoft sara': 84, 'microsoft michelle': 83,
        // Google Chrome voices (cloud-streamed, decent quality)
        'google us english': 75, 'google uk english female': 74,
        'google uk english male': 73,
        // Apple macOS (Sequoia has improved voices)
        'samantha': 72, 'alex': 70, 'karen': 69, 'daniel': 68,
        'ava': 71, 'tom': 67, 'fiona': 66,
        // Android
        'google espeak': 20
    };
    const VOICE_SCORES_DE = {
        'microsoft katja online': 98, 'microsoft conrad online': 97,
        'microsoft stefan online': 96,
        'microsoft katja': 88, 'microsoft conrad': 87, 'microsoft stefan': 86,
        'google deutsch': 75,
        'anna': 72, 'petra': 70, 'markus': 69, 'yannick': 68,
        'google espeak': 20
    };

    function scoreVoice(voice, lang) {
        const scores = (lang === 'de') ? VOICE_SCORES_DE : VOICE_SCORES_EN;
        const nameLower = voice.name.toLowerCase();

        // Check exact known voices (longest keys first for specificity)
        const sortedEntries = Object.entries(scores).sort((a, b) => b[0].length - a[0].length);
        for (const [key, score] of sortedEntries) {
            if (nameLower.includes(key)) return score;
        }

        // Heuristic: detect neural/natural quality indicators in voice name
        const hasNeural = /online|natural|neural|enhanced|premium/i.test(nameLower);
        if (hasNeural) return 70;

        // Prefer non-local voices (cloud-streamed tend to be higher quality)
        if (!voice.localService) return 50;

        // Legacy local voices (David, Zira, etc.) — lowest priority
        return 20;
    }

    function getBestVoice(lang) {
        if (_voiceCache[lang]) return _voiceCache[lang];
        const voices = window.speechSynthesis?.getVoices() || [];
        const langPrefix = (lang === 'de') ? 'de' : 'en';
        const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
        if (langVoices.length === 0) return null;

        // Score and sort — highest score wins
        langVoices.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));

        const best = langVoices[0];
        _voiceCache[lang] = best;
        console.log(`[NARRATION] Best voice: "${best.name}" (${best.lang}, score: ${scoreVoice(best, lang)}, local: ${best.localService})`);
        // Log top 3 candidates for debugging
        langVoices.slice(0, 3).forEach((v, i) => {
            console.log(`  #${i+1}: "${v.name}" score=${scoreVoice(v, lang)} local=${v.localService}`);
        });
        return best;
    }

    // Preload voices (Chrome loads them async — need multiple probes)
    if (window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = () => { _voiceCache = {}; };
        speechSynthesis.getVoices();
        // Chrome sometimes doesn't fire onvoiceschanged — force re-probe after 2s
        setTimeout(() => { _voiceCache = {}; speechSynthesis.getVoices(); }, 2000);
    }

    // ── Sentence Splitter ──
    // Splits text at sentence boundaries while preserving abbreviations
    function splitSentences(text) {
        // Handle common abbreviations that use periods
        const safeText = text
            .replace(/\bDr\./g, 'Dr\u2024')
            .replace(/\bMr\./g, 'Mr\u2024')
            .replace(/\bMrs\./g, 'Mrs\u2024')
            .replace(/\bvs\./g, 'vs\u2024')
            .replace(/\bSt\./g, 'St\u2024')
            .replace(/\betc\./g, 'etc\u2024')
            .replace(/\bi\.e\./g, 'i\u2024e\u2024')
            .replace(/\be\.g\./g, 'e\u2024g\u2024')
            .replace(/\bU\.S\./g, 'U\u2024S\u2024')
            .replace(/\bv\.\s*Chr\./g, 'v\u2024 Chr\u2024')
            .replace(/\bn\.\s*Chr\./g, 'n\u2024 Chr\u2024')
            .replace(/(\d)\./g, '$1\u2024');  // Protect decimal numbers

        // Split on sentence-ending punctuation followed by space + uppercase
        const raw = safeText.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ\u201e\u201c"])/);

        // Restore protected periods
        return raw.map(s => s.replace(/\u2024/g, '.').trim()).filter(s => s.length > 0);
    }

    // ── Dynamic Rate Calculator ──
    // Neural voices sound best at 0.85-0.88 range; slow down for data
    function getSentenceRate(sentence) {
        const baseRate = 0.87;
        const numCount = (sentence.match(/\d[\d,.]+/g) || []).length;
        const hasPercent = /%/.test(sentence);
        const hasCurrency = /\$|€|£|billion|million|trillion|milliarden|millionen/i.test(sentence);
        const isShort = sentence.length < 60;

        let rate = baseRate;
        // Slow down for data-heavy sentences (numbers need time)
        if (numCount >= 3) rate -= 0.05;
        else if (numCount >= 1) rate -= 0.03;
        if (hasPercent || hasCurrency) rate -= 0.02;
        // Slightly faster for short transitional sentences
        if (isShort && numCount === 0) rate += 0.02;

        return Math.max(0.78, Math.min(0.92, rate));
    }

    // ── Breathing Pause Calculator ──
    // Longer pauses = more natural, documentary-like rhythm
    function getBreathingPause(sentence) {
        const base = 450;
        const isLong = sentence.length > 150;
        const endsQuestion = sentence.endsWith('?');
        const endsDramatic = /—[^—]*$/.test(sentence) || sentence.endsWith('...');

        if (isLong) return base + 150;
        if (endsDramatic) return base + 100;
        if (endsQuestion) return base + 60;
        return base;
    }

    // ── Main Narration Function ──
    // Speaks text sentence-by-sentence with natural pacing
    function speakText(text) {
        if (!window.speechSynthesis) return;

        // Cancel any active narration
        speechSynthesis.cancel();
        _narrationQueue = [];
        _narrationActive = false;

        const lang = (window.getLanguage ? window.getLanguage() : 'en') === 'de' ? 'de' : 'en';
        const voice = getBestVoice(lang);
        const langTag = (lang === 'de') ? 'de-DE' : 'en-US';

        // Clean text for speech — remove emoji and special chars that break TTS
        const cleanText = text
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .replace(/[\u{1F4CD}\u{1F3E2}\u{1F4CA}\u{1F512}\u{1F4D0}\u2622\uFE0F\u{1F331}\u{1F6AB}\u{1F480}\u{1F4DC}\u{1F527}\u{1F4B0}\u{1F3F4}\u200D\u2620\uFE0F\u{1F4A3}\u26A1\u{1F30B}\u{1F3DB}\uFE0F\u2694\u{1F6A2}\u{1F3D7}\uFE0F\u{1F3C6}]/gu, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Split into sentences
        const sentences = splitSentences(cleanText);
        if (sentences.length === 0) return;

        // Queue all sentences
        _narrationQueue = sentences.map((sentence, idx) => ({
            text: sentence,
            rate: getSentenceRate(sentence),
            pause: (idx < sentences.length - 1) ? getBreathingPause(sentence) : 0,
            isFirst: idx === 0,
            isLast: idx === sentences.length - 1
        }));

        _narrationActive = true;
        _speakNextSentence(voice, langTag);
    }

    // ── Sequential Sentence Speaker ──
    function _speakNextSentence(voice, langTag) {
        if (!_narrationActive || _narrationQueue.length === 0) {
            _narrationActive = false;
            return;
        }

        const item = _narrationQueue.shift();
        const utter = new SpeechSynthesisUtterance(item.text);
        utter.lang = langTag;
        utter.rate = item.rate;
        utter.pitch = 1.0;   // Natural pitch — avoid hollow sound from low pitch
        utter.volume = 1.0;
        if (voice) utter.voice = voice;

        utter.onend = () => {
            if (!_narrationActive) return;
            if (_narrationQueue.length > 0) {
                // Breathing pause before next sentence
                setTimeout(() => _speakNextSentence(voice, langTag), item.pause);
            } else {
                _narrationActive = false;
            }
        };

        utter.onerror = (e) => {
            console.warn('[NARRATION] Utterance error:', e.error);
            _narrationActive = false;
            _narrationQueue = [];
        };

        speechSynthesis.speak(utter);
    }

    // ── Stop narration (called by cancel / tour close / step change) ──
    function stopNarration() {
        _narrationActive = false;
        _narrationQueue = [];
        if (window.speechSynthesis) speechSynthesis.cancel();
    }

    // ── Public API ──
    window._narration = {
        speak: speakText,
        stop: stopNarration,
        isActive: () => _narrationActive,
        getBestVoice: getBestVoice
    };

    // Backwards-compatible global functions (used by tour engine in main.js)
    window.speakText = speakText;
    window.stopNarration = stopNarration;

    console.log('[NARRATION] Module initialized');

})();
