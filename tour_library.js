// ══════════════════════════════════════════════════════════════
// GEOPULSE V3.1 — Tour Library (tour_library.js)
//
// A full-screen page that presents every guided tour as a card with a
// one-line teaser, the number of stations and the school subjects it fits.
// Opens from "THE TOURS" (desktop), "TOURS" (mobile bottom bar) and the
// welcome card; clicking a card closes the page and starts that tour.
//
// Categories, their order, colours and tour names come from the tour
// catalogue markup in index.html (the same source search.js and
// scripts/build-seo-pages.mjs read), so a new tour only needs a teaser here.
// ══════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Teasers: one sentence each, what the class will actually see ──
    // stops = number of stations (shown before the 450 KB tour prose loads;
    // replaced by the live count once it has).
    const TOURS = {
        coldwar:        { stops: 6,  en: 'From divided Berlin to today’s Ukraine: how the Iron Curtain rose, fell and left new front lines.', de: 'Vom geteilten Berlin bis zur Ukraine: wie der Eiserne Vorhang entstand, fiel – und neue Frontlinien hinterließ.' },
        trump:          { stops: 10, en: 'Greenland, Panama, tariffs, alliances: ten places that show how US foreign policy is shifting.', de: 'Grönland, Panama, Zölle, Bündnisse: zehn Orte, an denen sich der Kurswechsel der US-Außenpolitik zeigt.' },
        spycraft:       { stops: 8,  en: 'Langley, Lubyanka, Cold War Berlin: the real places where intelligence services work.', de: 'Langley, Lubjanka, Berlin im Kalten Krieg: die echten Orte der Geheimdienste.' },
        migration:      { stops: 7,  en: 'The Mediterranean, the Sahel, the Balkans: why people flee and which routes they risk.', de: 'Mittelmeer, Sahel, Balkan: warum Menschen fliehen und welche Routen sie riskieren.' },
        nuclear:        { stops: 5,  en: 'Chernobyl, Fukushima, Bikini Atoll: five places marked by nuclear accidents and tests.', de: 'Tschernobyl, Fukushima, Bikini-Atoll: fünf Orte, gezeichnet von Atomunfällen und Atomtests.' },
        ww2:            { stops: 9,  en: 'From the first shots in Gdańsk to Hiroshima: the course and consequences of the deadliest war in history.', de: 'Von den ersten Schüssen in Danzig bis Hiroshima: Verlauf und Folgen des tödlichsten Krieges der Geschichte.' },
        ww1:            { stops: 8,  en: 'Sarajevo, Verdun, Versailles: how one shot led to industrial war – and sowed the next one.', de: 'Sarajevo, Verdun, Versailles: wie ein Schuss zum industriellen Krieg führte – und den nächsten vorbereitete.' },
        romanempire:    { stops: 8,  en: 'Rome, the Limes, Pompeii, Constantinople: rise, everyday life and fall of an empire.', de: 'Rom, Limes, Pompeji, Konstantinopel: Aufstieg, Alltag und Untergang eines Weltreichs.' },
        lostwonders:    { stops: 10, en: 'Giza, Petra, Machu Picchu, Angkor Wat: ten monuments and the civilisations that built them.', de: 'Gizeh, Petra, Machu Picchu, Angkor Wat: zehn Monumente und die Kulturen, die sie erbauten.' },
        forbiddenzones: { stops: 10, en: 'Area 51, the Korean DMZ, North Sentinel Island: places nobody may enter – and why.', de: 'Area 51, die Grenze in Korea, North Sentinel Island: Orte, die niemand betreten darf – und warum.' },
        shipwrecks:     { stops: 10, en: 'Titanic, Bismarck, the Antikythera wreck: what sunken ships reveal about their time.', de: 'Titanic, Bismarck, das Wrack von Antikythera: was versunkene Schiffe über ihre Zeit verraten.' },
        structures:     { stops: 10, en: 'From the Pyramids to the Burj Khalifa: milestones of engineering and how they were built.', de: 'Von den Pyramiden bis zum Burj Khalifa: Meilensteine der Baukunst und wie sie entstanden.' },
        revolutions:    { stops: 8,  en: 'Paris 1789, Petrograd 1917, Berlin 1989, Tunis 2010: when people overturned the order.', de: 'Paris 1789, Petrograd 1917, Berlin 1989, Tunis 2010: wenn Menschen die Ordnung umstürzen.' },
        ringoffire:     { stops: 6,  en: 'Fuji, Krakatoa, the Andes: why most of the world’s volcanoes line the Pacific.', de: 'Fuji, Krakatau, Anden: warum die meisten Vulkane der Welt rund um den Pazifik liegen.' },
        quakes:         { stops: 8,  en: 'Tōhoku, Haiti, Vesuvius, Tambora: what happens when plates move – and what it means for people.', de: 'Tōhoku, Haiti, Vesuv, Tambora: was passiert, wenn Erdplatten sich bewegen – und was das für Menschen heißt.' },
        extremeearth:   { stops: 10, en: 'Hottest, coldest, deepest, driest: the record-breaking places on our planet.', de: 'Am heißesten, kältesten, tiefsten, trockensten: die Rekordorte unseres Planeten.' },
        climate:        { stops: 7,  en: 'Svalbard, the Great Barrier Reef, Tuvalu: where climate change is already visible today.', de: 'Spitzbergen, Great Barrier Reef, Tuvalu: wo der Klimawandel heute schon sichtbar ist.' },
        climatecrisis:  { stops: 8,  en: 'Shrinking glaciers, the vanished Aral Sea, melting Greenland: the evidence as seen from space.', de: 'Schwindende Gletscher, der verschwundene Aralsee, das tauende Grönland: die Belege, aus dem All gesehen.' },
        windsworld:     { stops: 10, en: 'Jet stream, trade winds, monsoon: the invisible air currents that shape weather and history.', de: 'Jetstream, Passat, Monsun: die unsichtbaren Luftströme, die Wetter und Geschichte prägen.' },
        greatmigrations:{ stops: 8,  en: 'Arctic tern, humpback whale, wildebeest: the longest journeys in the animal kingdom.', de: 'Küstenseeschwalbe, Buckelwal, Gnu: die längsten Reisen im Tierreich.' },
        extremeplaces:  { stops: 8,  en: 'Oymyakon, La Rinconada, Tristan da Cunha: how people live at the edge of the habitable.', de: 'Oimjakon, La Rinconada, Tristan da Cunha: wie Menschen an den Grenzen des Bewohnbaren leben.' },
        spacerace:      { stops: 10, en: 'From Baikonur and Cape Canaveral to Starbase: the history and present of spaceflight.', de: 'Von Baikonur und Cape Canaveral bis Starbase: Geschichte und Gegenwart der Raumfahrt.' },
        aurorahunters:  { stops: 8,  en: 'Tromsø, Iceland, Ushuaia: where and why the sky glows – with the physics behind it.', de: 'Tromsø, Island, Ushuaia: wo und warum der Himmel leuchtet – mit der Physik dahinter.' },
        cosmicimpacts:  { stops: 8,  en: 'Chicxulub, Tunguska, the Nördlinger Ries: asteroid impacts that shaped the Earth.', de: 'Chicxulub, Tunguska, Nördlinger Ries: Asteroideneinschläge, die die Erde formten.' },
        techcapitals:   { stops: 10, en: 'Silicon Valley, Shenzhen, Bangalore: where tomorrow’s technology is developed.', de: 'Silicon Valley, Shenzhen, Bangalore: wo die Technik von morgen entsteht.' },
        cables:         { stops: 5,  en: '95% of internet traffic runs through undersea cables: follow the data from Cornwall to Singapore.', de: '95 % des Internetverkehrs laufen durch Seekabel: der Weg der Daten von Cornwall bis Singapur.' },
        bri:            { stops: 6,  en: 'Xi’an, Pakistan, Piraeus, Djibouti: how China is building a worldwide network of trade routes.', de: 'Xi’an, Pakistan, Piräus, Dschibuti: wie China ein weltweites Netz von Handelswegen knüpft.' },
        chokepoints:    { stops: 8,  en: 'Hormuz, Suez, Malacca: the narrow straits world trade depends on.', de: 'Hormus, Suez, Malakka: schmale Meerengen, an denen der Welthandel hängt.' },
        battery:        { stops: 7,  en: 'Cobalt from Congo, lithium from the Andes, chips from Taiwan: the supply chain inside your phone.', de: 'Kobalt aus dem Kongo, Lithium aus den Anden, Chips aus Taiwan: die Lieferkette in deinem Handy.' },
        water:          { stops: 7,  en: 'Nile, Indus, Colorado, Aral Sea: where water runs short and becomes a source of conflict.', de: 'Nil, Indus, Colorado, Aralsee: wo Wasser knapp wird und Konflikte auslöst.' },
        womenworld:     { stops: 8,  en: 'Marie Curie, Rosa Parks, Malala, Wangari Maathai: women and the places where they made history.', de: 'Marie Curie, Rosa Parks, Malala, Wangari Maathai: Frauen und die Orte, an denen sie Geschichte schrieben.' },
        genocide:       { stops: 8,  sensitive: true, en: 'Auschwitz, Kigali, Srebrenica: memorial sites that stand for “Never again”.', de: 'Auschwitz, Kigali, Srebrenica: Gedenkorte, die für „Nie wieder“ stehen.' },
        pandemics:      { stops: 8,  en: 'From the Plague of Justinian to COVID-19: how diseases spread and changed societies.', de: 'Von der Justinianischen Pest bis COVID-19: wie Seuchen sich ausbreiteten und Gesellschaften veränderten.' },
        hondius:        { stops: 9,  en: 'Case study 2026: the route of an expedition ship with a hantavirus outbreak on board.', de: 'Fallstudie 2026: die Route eines Expeditionsschiffs mit Hantavirus-Ausbruch an Bord.' },
        worldreligions: { stops: 14, en: 'Varanasi, Bodh Gaya, Jerusalem, Mecca, Amritsar: sacred sites of the world religions.', de: 'Varanasi, Bodh Gaya, Jerusalem, Mekka, Amritsar: heilige Stätten der Weltreligionen.' },
        f1:             { stops: 9,  en: 'Monaco, Silverstone, Suzuka: the Formula 1 circuits and the countries behind them.', de: 'Monaco, Silverstone, Suzuka: die Rennstrecken der Formel 1 und die Länder dahinter.' },
        worldcup:       { stops: 8,  en: 'From Germany 2006 to Qatar 2022: the World Cup as a mirror of world politics.', de: 'Vom Sommermärchen 2006 bis Katar 2022: die WM als Spiegel der Weltpolitik.' },
        olympics:       { stops: 9,  en: 'Athens 1896, Berlin 1936, Munich 1972: the Olympic Games between sport and politics.', de: 'Athen 1896, Berlin 1936, München 1972: Olympische Spiele zwischen Sport und Politik.' },
        iconicarenas:   { stops: 11, en: 'From the Colosseum to Wimbledon and the Streif: sports venues with a history.', de: 'Vom Kolosseum über Wimbledon bis zur Streif: Sportstätten mit Geschichte.' },
        summits14:      { stops: 15, en: 'All fourteen 8,000-metre peaks from Everest to Shishapangma: the geography of the Himalaya and Karakoram.', de: 'Alle vierzehn Achttausender vom Everest bis zur Shishapangma: Geographie von Himalaya und Karakorum.' },
        musicworld:     { stops: 8,  en: 'Memphis, Liverpool, Kingston, the Bronx: where the music that changed the world came from.', de: 'Memphis, Liverpool, Kingston, Bronx: woher die Musik kam, die die Welt veränderte.' },
        filmlocations:  { stops: 8,  en: 'Tunisia for Star Wars, Dubrovnik for Game of Thrones: the real places behind famous films.', de: 'Tunesien für Star Wars, Dubrovnik für Game of Thrones: die echten Orte hinter berühmten Filmen.' }
    };

    // Good first tours for a lesson: well-known curriculum topics.
    const FEATURED = ['coldwar', 'romanempire', 'climatecrisis', 'ringoffire'];

    // School subjects per category (kept in step with CAT in build-seo-pages.mjs).
    const SUBJECTS = {
        geopolitics: { en: 'History · Politics · Social studies', de: 'Geschichte · Politik · Sozialkunde' },
        history:     { en: 'History', de: 'Geschichte' },
        earth:       { en: 'Geography · Earth science · Biology', de: 'Erdkunde · Geographie · Biologie' },
        space:       { en: 'Physics · Technology · Computer science', de: 'Physik · Technik · Informatik' },
        economy:     { en: 'Economics · Geography', de: 'Wirtschaft · Erdkunde' },
        society:     { en: 'Ethics · Social studies · History', de: 'Ethik · Sozialkunde · Geschichte' },
        religion:    { en: 'Religious education · Ethics', de: 'Religion · Ethik' },
        sports:      { en: 'Sport · Music · Art · Geography', de: 'Sport · Musik · Kunst · Erdkunde' }
    };

    const UI = {
        en: {
            kicker: 'Guided map tours',
            title: 'Explore the world, one stop at a time.',
            lede: 'Each tour flies across the globe station by station — from the Roman Empire to the climate crisis. Every stop explains one place in a few sentences, with a picture and a source. Made for lessons: on the projector, on tablets or at home.',
            v1: '5–15 minutes per tour', v2: 'Worksheet & QR code for every tour', v3: 'Free · no login · no cookies',
            how: 'How it works', h1: 'Pick a tour', h2: 'Click NEXT or use the arrow keys', h3: 'Follow up with the quiz or worksheet',
            featured: 'Good first tours for class', all: 'All', search: 'Search tours, places, topics…',
            none: 'No tour matches your search.', stops: (n) => `${n} stops`, mins: (n) => `approx. ${n} min`,
            sheet: 'Worksheet', sheetHref: (id) => `/tours/${id}/`, sensitive: 'Sensitive topic – best with guidance',
            start: 'Start tour', close: 'Close', teachers: 'For teachers: worksheets, QR codes, lesson links →', teachersHref: '/teachers/',
            count: (n) => `${n} tours`
        },
        de: {
            kicker: 'Geführte Kartentouren',
            title: 'Die Welt entdecken – Station für Station.',
            lede: 'Jede Tour fliegt Station für Station über den Globus – vom Römischen Reich bis zur Klimakrise. Jede Station erklärt einen Ort in wenigen Sätzen, mit Bild und Quelle. Gemacht für den Unterricht: am Beamer, auf Tablets oder zu Hause.',
            v1: '5–15 Minuten pro Tour', v2: 'Arbeitsblatt & QR-Code zu jeder Tour', v3: 'Kostenlos · ohne Login · ohne Cookies',
            how: 'So funktioniert’s', h1: 'Tour auswählen', h2: 'Mit WEITER oder den Pfeiltasten durch die Stationen', h3: 'Danach Quiz oder Arbeitsblatt',
            featured: 'Gut für den Einstieg im Unterricht', all: 'Alle', search: 'Touren, Orte, Themen suchen…',
            none: 'Keine Tour passt zu deiner Suche.', stops: (n) => `${n} Stationen`, mins: (n) => `ca. ${n} Min.`,
            sheet: 'Arbeitsblatt', sheetHref: (id) => `/de/touren/${id}/`, sensitive: 'Sensibles Thema – am besten begleitet',
            start: 'Tour starten', close: 'Schließen', teachers: 'Für Lehrkräfte: Arbeitsblätter, QR-Codes, Unterrichtslinks →', teachersHref: '/lehrkraefte/',
            count: (n) => `${n} Touren`
        }
    };

    const lang = () => ((window.getLanguage && window.getLanguage()) || document.documentElement.lang) === 'de' ? 'de' : 'en';
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // ── Read the catalogue from index.html ──
    function readCatalogue() {
        const dict = (window._i18n && window._i18n[lang()]) || {};
        const dictEn = (window._i18n && window._i18n.en) || {};
        const live = window._TOURS_REF || window._TOURS_DATA || {};
        const seen = new Set();
        const cats = [];
        document.querySelectorAll('#tours-hud .tour-category[data-cat]').forEach((catEl) => {
            const id = catEl.getAttribute('data-cat');
            const header = catEl.querySelector('.tour-cat-header');
            const labelEl = header && header.querySelector('[data-i18n]');
            const labelKey = labelEl && labelEl.getAttribute('data-i18n');
            const icon = header ? (header.textContent.trim().split(/\s+/)[0] || '') : '';
            const color = (catEl.style.getPropertyValue('--cat-color') || '#ffb000').trim();
            const tours = [];
            catEl.querySelectorAll('.tour-cat-body .tour-btn[data-tour]').forEach((btn) => {
                const tid = btn.getAttribute('data-tour');
                if (seen.has(tid)) return;
                seen.add(tid);
                const nameEl = btn.querySelector('[data-i18n]');
                const key = nameEl && nameEl.getAttribute('data-i18n');
                const name = (key && (dict[key] || dictEn[key])) || (nameEl ? nameEl.textContent : tid);
                const emoji = (btn.firstChild && btn.firstChild.nodeType === 3 ? btn.firstChild.textContent : '').trim();
                const info = TOURS[tid] || {};
                const liveSteps = live[tid] && Array.isArray(live[tid].steps) ? live[tid].steps.length : 0;
                tours.push({
                    id: tid, name, emoji, color, cat: id,
                    blurb: info[lang()] || info.en || '',
                    stops: liveSteps || info.stops || 0,
                    sensitive: !!info.sensitive,
                    isNew: btn.hasAttribute('data-new')
                });
            });
            if (tours.length) cats.push({ id, label: (labelKey && (dict[labelKey] || dictEn[labelKey])) || id, icon, color, tours });
        });
        return cats;
    }

    // ── Build the page once; re-render its contents on open / language change ──
    let root = null, lastFocus = null, activeCat = 'all', query = '';

    function build() {
        root = document.createElement('div');
        root.id = 'tour-library';
        root.className = 'tlib';
        root.setAttribute('role', 'dialog');
        root.setAttribute('aria-modal', 'true');
        root.setAttribute('aria-labelledby', 'tlib-title');
        root.hidden = true;
        document.body.appendChild(root);

        root.addEventListener('click', (e) => {
            const start = e.target.closest('[data-lib-tour]');
            if (start) { e.preventDefault(); startTour(start.getAttribute('data-lib-tour')); return; }
            const chip = e.target.closest('[data-lib-cat]');
            if (chip) { activeCat = chip.getAttribute('data-lib-cat'); applyFilter(); return; }
            if (e.target.closest('[data-lib-close]')) close();
        });
        root.addEventListener('input', (e) => {
            if (e.target.id === 'tlib-search') { query = e.target.value; applyFilter(); }
        });
        root.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (e.target.id === 'tlib-search' && e.target.value) { e.target.value = ''; query = ''; applyFilter(); return; }
                close();
            }
            if (e.key === 'Tab') trapFocus(e);
        });
    }

    function card(t, x, big) {
        const mins = Math.max(5, Math.round(t.stops * 1.2));
        return `
        <article class="tlib-card${big ? ' tlib-card-big' : ''}" style="--c:${esc(t.color)}" data-lib-card="${esc(t.id)}" data-lib-cat-of="${esc(t.cat)}">
            <button type="button" class="tlib-card-main" data-lib-tour="${esc(t.id)}" aria-label="${esc(x.start + ': ' + t.name)}">
                <span class="tlib-emoji" aria-hidden="true">${esc(t.emoji)}</span>
                <span class="tlib-card-title">${esc(t.name)}${t.isNew ? ' <span class="tlib-new">NEW</span>' : ''}</span>
                <span class="tlib-card-blurb">${esc(t.blurb)}</span>
                ${t.sensitive ? `<span class="tlib-sensitive"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ${esc(x.sensitive)}</span>` : ''}
                <span class="tlib-card-meta">${t.stops ? esc(x.stops(t.stops)) + ' · ' + esc(x.mins(mins)) : ''}</span>
                <span class="tlib-play" aria-hidden="true"><i class="fa-solid fa-play"></i></span>
            </button>
            <a class="tlib-sheet" href="${esc(x.sheetHref(t.id))}" target="_blank" rel="noopener"><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${esc(x.sheet)}</a>
        </article>`;
    }

    function render() {
        const L = lang();
        const x = UI[L];
        const cats = readCatalogue();
        const all = cats.flatMap((c) => c.tours);
        const byId = Object.fromEntries(all.map((t) => [t.id, t]));
        const featured = FEATURED.map((id) => byId[id]).filter(Boolean);
        if (activeCat !== 'all' && !cats.some((c) => c.id === activeCat)) activeCat = 'all';

        root.setAttribute('lang', L);
        root.innerHTML = `
        <div class="tlib-bar">
            <div class="tlib-bar-brand"><i class="fa-solid fa-route" aria-hidden="true"></i> ${esc(x.kicker)} <span class="tlib-bar-count">${esc(x.count(all.length))}</span></div>
            <button type="button" class="tlib-close" data-lib-close aria-label="${esc(x.close)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
        <div class="tlib-scroll">
            <header class="tlib-hero">
                <p class="tlib-kicker">${esc(x.kicker)}</p>
                <h2 id="tlib-title" class="tlib-title">${esc(x.title)}</h2>
                <p class="tlib-lede">${esc(x.lede)}</p>
                <ul class="tlib-values">
                    <li><i class="fa-regular fa-clock" aria-hidden="true"></i> ${esc(x.v1)}</li>
                    <li><i class="fa-regular fa-file-lines" aria-hidden="true"></i> ${esc(x.v2)}</li>
                    <li><i class="fa-solid fa-lock-open" aria-hidden="true"></i> ${esc(x.v3)}</li>
                </ul>
                <ol class="tlib-how" aria-label="${esc(x.how)}">
                    <li>${esc(x.h1)}</li><li>${esc(x.h2)}</li><li>${esc(x.h3)}</li>
                </ol>
                <a class="tlib-teachers" href="${esc(x.teachersHref)}" target="_blank" rel="noopener"><i class="fa-solid fa-chalkboard-user" aria-hidden="true"></i> ${esc(x.teachers)}</a>
            </header>

            <div class="tlib-tools">
                <div class="tlib-search-wrap">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input id="tlib-search" type="search" autocomplete="off" spellcheck="false" placeholder="${esc(x.search)}" aria-label="${esc(x.search)}" value="${esc(query)}">
                </div>
                <div class="tlib-chips" role="group">
                    <button type="button" class="tlib-chip" data-lib-cat="all">${esc(x.all)}</button>
                    ${cats.map((c) => `<button type="button" class="tlib-chip" data-lib-cat="${esc(c.id)}" style="--c:${esc(c.color)}"><span aria-hidden="true">${esc(c.icon)}</span> ${esc(c.label)}</button>`).join('')}
                </div>
            </div>

            <section class="tlib-featured" aria-labelledby="tlib-feat-h">
                <h3 id="tlib-feat-h" class="tlib-sec-title">${esc(x.featured)}</h3>
                <div class="tlib-grid tlib-grid-big">${featured.map((t) => card(t, x, true)).join('')}</div>
            </section>

            ${cats.map((c) => `
            <section class="tlib-cat" data-lib-section="${esc(c.id)}" style="--c:${esc(c.color)}" aria-labelledby="tlib-h-${esc(c.id)}">
                <div class="tlib-cat-head">
                    <h3 id="tlib-h-${esc(c.id)}" class="tlib-sec-title"><span aria-hidden="true">${esc(c.icon)}</span> ${esc(c.label)}</h3>
                    <p class="tlib-subjects">${esc((SUBJECTS[c.id] || {})[L] || '')}</p>
                </div>
                <div class="tlib-grid">${c.tours.map((t) => card(t, x, false)).join('')}</div>
            </section>`).join('')}

            <p class="tlib-empty" hidden>${esc(x.none)}</p>
        </div>`;

        // Search text per card: name, teaser, category, id (both languages for the name)
        const other = (window._i18n && window._i18n[L === 'de' ? 'en' : 'de']) || {};
        root.querySelectorAll('.tlib-cat [data-lib-card]').forEach((el) => {
            const t = byId[el.getAttribute('data-lib-card')];
            const btn = document.querySelector(`#tours-hud .tour-btn[data-tour="${t.id}"] [data-i18n]`);
            const alt = btn ? (other[btn.getAttribute('data-i18n')] || '') : '';
            const info = TOURS[t.id] || {};
            el.dataset.search = [t.name, alt, info.en, info.de, t.id].join(' ').toLowerCase();
        });
        applyFilter();
    }

    function applyFilter() {
        if (!root) return;
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const filtering = words.length > 0 || activeCat !== 'all';
        root.querySelectorAll('.tlib-chip').forEach((c) => {
            const on = c.getAttribute('data-lib-cat') === activeCat;
            c.classList.toggle('active', on);
            c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        const feat = root.querySelector('.tlib-featured');
        if (feat) feat.hidden = filtering;
        let hits = 0;
        root.querySelectorAll('.tlib-cat').forEach((sec) => {
            const catOk = activeCat === 'all' || sec.getAttribute('data-lib-section') === activeCat;
            let n = 0;
            sec.querySelectorAll('[data-lib-card]').forEach((el) => {
                const ok = catOk && words.every((w) => el.dataset.search.includes(w));
                el.hidden = !ok;
                if (ok) n++;
            });
            sec.hidden = n === 0;
            hits += n;
        });
        const empty = root.querySelector('.tlib-empty');
        if (empty) empty.hidden = hits > 0;
    }

    function trapFocus(e) {
        const f = [...root.querySelectorAll('button, a[href], input')].filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open(opts) {
        if (!root) build();
        lastFocus = document.activeElement;
        if (opts && opts.cat) activeCat = opts.cat;
        render();
        root.hidden = false;
        document.body.classList.add('tlib-open');
        requestAnimationFrame(() => root.classList.add('tlib-visible'));
        const scroller = root.querySelector('.tlib-scroll');
        if (scroller) scroller.scrollTop = 0;
        // Focus the close button, not the search: on tablets focusing an input pops the keyboard.
        root.querySelector('.tlib-close')?.focus({ preventScroll: true });
        if (window._geoSfx && window._geoSfx.tick) window._geoSfx.tick();
        // Warm up the tour prose so the first click starts instantly.
        if (typeof window.ensureTours === 'function') window.ensureTours();
    }

    function close() {
        if (!root || root.hidden) return;
        root.classList.remove('tlib-visible');
        document.body.classList.remove('tlib-open');
        setTimeout(() => { root.hidden = true; }, 200);
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
        document.dispatchEvent(new CustomEvent('tourlibrary:close'));
    }

    function startTour(id) {
        close();
        const go = () => {
            window._geopulseActiveTour = id; // read by permalink.js
            if (typeof window._geopulseStartTour === 'function') window._geopulseStartTour(id);
        };
        if (typeof window.ensureTours === 'function') window.ensureTours(id).then(go); else go();
    }

    // Re-render when the language switches while the page is open
    new MutationObserver(() => { if (root && !root.hidden) render(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    window.geopulseTourLibrary = { open, close, isOpen: () => !!root && !root.hidden };
})();
