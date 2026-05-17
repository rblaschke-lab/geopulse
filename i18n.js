// GEOPULSE i18n MODULE — V2.3
// Bilingual translation system (EN / DE)
// Extracted from main.js for modularization
(function() {
'use strict';

// ── Translation Dictionary ──
const i18n = {
    en: {
        mode_explore: 'EXPLORE', mode_analyze: 'ANALYZE',
        status_active: 'GLOBAL COMMAND ACTIVE', system_override: 'SYSTEM OVERRIDE',
        news_band: 'GLOBAL NEWS BAND', cat_scenarios: 'GLOBAL SCENARIOS',
        reset_layers: 'RESET LAYERS', command_manual: 'COMMAND MANUAL',
        cat_realtime: 'REAL-TIME TRACKING', cat_geopolitics: 'GEOPOLITICS',
        cat_environment: 'ENVIRONMENT & SPACE',

        layer_iss: 'ISS Tracker', desc_iss: 'International Space Station — orbits Earth every 90 minutes at 28,000 km/h.',
        layer_webcams: 'Live Webcams', desc_webcams: '9 curated alpine & city webcams with real-time snapshots from foto-webcam.eu.',
        layer_earthquakes: 'Earthquakes', desc_earthquakes: 'Live seismic events from USGS. Circle size = magnitude. Updated every 5 min.',
        layer_fires: 'NASA Wildfires', desc_fires: 'Active fire detection by NASA FIRMS satellites. Near real-time hotspots.',
        layer_terminator: 'Day/Night Line', desc_terminator: 'Solar terminator — the real-time boundary between day and night on Earth.',
        layer_regimes: 'Regime Types', desc_regimes: 'Government systems by country — democracy, autocracy, or hybrid regime.',
        layer_blocs: 'Alliances & Blocs', desc_blocs: 'NATO, BRICS, EU, ASEAN — major geopolitical alliance networks.',
        layer_conflicts: 'Active Conflicts', desc_conflicts: 'Currently active war zones and armed conflicts worldwide.',
        layer_borders: 'Country Borders', desc_borders: 'National boundaries with country name labels. Data: Natural Earth.',
        layer_cables: 'Undersea Cables', desc_cables: 'Submarine fiber optic cables — 95% of global internet traffic travels here.',
        layer_pipelines: 'Energy Pipelines', desc_pipelines: 'Major oil & gas pipelines — the arteries of global energy supply.',
        layer_nuclear: 'Nuclear Plants', desc_nuclear: 'Operational nuclear power stations and their energy output worldwide.',
        layer_sst: 'Ocean Temperature', desc_sst: 'Sea surface temperature from NOAA. Red = warmer, blue = cooler than average.',
        layer_temperature: 'Surface Temperature', desc_temperature: 'Land surface temperature data showing global heat distribution.',
        layer_population: 'Population Density', desc_population: 'Global population heatmap — bright areas = high population concentration.',
        layer_volcanoes: 'Volcanoes', desc_volcanoes: 'Historically active volcanoes from Smithsonian Global Volcanism Program.',
        layer_radiation: 'Radiation Sites', desc_radiation: 'Notable nuclear accident sites — Chernobyl, Fukushima, and others.',
        layer_starlink: 'Starlink Net', desc_starlink: 'SpaceX Starlink satellite constellation — 5,000+ internet satellites in orbit.',
        upcoming_launches: 'Upcoming Launches', solar_index: 'SOLAR STORM INDEX',
        solar_connecting: 'CONNECTING TO NOAA SWPC...', data_sources_label: 'DATA SOURCES:',
        nav_scope: 'SCOPE', nav_layers: 'LAYERS', nav_info: 'INFO',
        info_title: 'ABOUT THIS MAP', info_subtitle: 'DATA_SOURCES & METHODOLOGY',
        info_how_title: '📖 How to Read This Map',
        info_how_desc: 'Toggle data layers from the LAYERS panel to overlay real-time feeds and reference data onto the satellite map. Click any marker for detailed briefings. Use the mode switcher (EXPLORE / ANALYZE) to adjust the visual focus.',
        info_sources_title: '📡 Live Data Sources',
        info_src_usgs: 'Seismic events updated every 5 minutes. earthquake.usgs.gov',
        info_src_firms: 'Active wildfire hotspots via VIIRS/MODIS satellites. firms.modaps.eosdis.nasa.gov',
        info_src_iss: 'ISS orbital position in real time. wheretheiss.at',
        info_src_noaa: 'Sea surface temperature & solar weather data. noaa.gov',
        info_src_freedom: 'Regime types, alliances, and geopolitical blocs. Static reference data.',
        info_src_infra: 'Submarine cables and nuclear power plant databases.',
        info_explore_title: '🔬 Explore Further',
        info_about_title: 'ℹ️ About GEOPULSE',
        info_about_desc: 'GEOPULSE is an open-source global intelligence dashboard built with MapLibre GL JS and vanilla JavaScript. No API keys, no accounts — just real-time data from public sources. By RB Design 2026.',
        info_full_about: 'Full About Page ↗', info_manual_link: 'Command Manual ↗',
        orientation_hint: 'BEST EXPERIENCED IN LANDSCAPE', launch_connecting: 'CONNECTING TO LAUNCH LIBRARY...',
        // Tour & category labels
        guided_tours: 'GUIDED TOURS',
        cat_geopolitics_tours: 'GEOPOLITICS', cat_history_tours: 'HISTORY',
        cat_science_tours: 'SCIENCE & NATURE', cat_sports_tours: 'SPORTS & CULTURE',
        cat_society_tours: 'SOCIETY & RIGHTS',
        tour_coldwar: 'Cold War → Reunification', tour_bri: 'Belt & Road Initiative',
        tour_trump: 'Trump World Tour', tour_chokepoints: 'Chokepoints', tour_water: 'Water Wars',
        tour_migration: 'Migration Routes',
        tour_ww1: 'World War I (1914–1918)', tour_ww2: 'World War II (1939–1945)',
        tour_ringoffire: 'Ring of Fire', tour_nuclear: 'Nuclear Legacy', tour_cables: 'Digital Silk Road',
        tour_battery: 'Battery Race', tour_climate: 'Climate Frontlines',
        tour_quakes: 'Earthquakes & Eruptions', tour_olympics: 'Olympic Games History',
        tour_f1: 'Formula 1 World Tour', tour_worldcup: 'FIFA World Cup',
        tour_romanempire: 'Roman Empire (753 BC–476 AD)',
        tour_womenwworld: 'Women Who Changed the World',
        tour_structures: 'Greatest Structures',
        tour_genocide: 'Genocide Sites — Never Again',
        tour_musicworld: 'Music That Changed the World',
        tour_filmlocations: 'Filming Locations',
        tour_extremeplaces: 'Extreme Places to Live',
        tour_revolutions: 'Revolutions',
        tour_pandemics: 'Pandemics',
        tour_hondius: 'MV Hondius — Hantavirus 2026',
        tour_aurorahunters: 'Aurora Hunters',
        tour_cosmicimpacts: 'Cosmic Impacts',
        tour_climatecrisis: 'Climate Crisis',
        tour_greatmigrations: 'Great Migrations',
        tour_spycraft: 'Espionage World',
        layer_aurora: 'Aurora Forecast',
        desc_aurora: 'Real-time aurora borealis/australis probability from NOAA OVATION model.',
        layer_fireballs: 'Fireballs',
        desc_fireballs: 'NASA-confirmed meteor impacts — circle size = energy release (kT).',
        // Tour hint
        tour_hint: 'Read more on Wikipedia',
        // Welcome overlay
        welcome_subtitle: 'EXPLORE HISTORY. UNDERSTAND THE WORLD.',
        welcome_feat_tours: 'Now 40 guided tours! Fly to real locations with satellite imagery',
        welcome_feat_1: 'World Wars, Roman Empire, Forbidden Zones & Lost Wonders',
        welcome_feat_2: 'Live earthquakes, volcanoes, wildfires & satellite orbits',
        welcome_feat_3: 'Built for students — Geography, History, Science & Politics',
        welcome_start_tour: 'START DEMO TOUR', welcome_explore: 'EXPLORE FREELY',
        welcome_dont_show: "Don't show again",
        welcome_footer: 'No login · No ads · 100% free & open source · For students, educators & the curious',
        // Interest selector
        welcome_interest_label: 'WHAT INTERESTS YOU?',
        interest_geopolitics: 'Geopolitics & Conflicts', interest_history: 'History & Civilizations',
        interest_science: 'Science & Nature', interest_sports: 'Sports & Culture',
        interest_all: 'Show Me Everything',
        // Feedback widget
        fb_title: 'FEEDBACK', fb_rate: 'How do you rate GEOPULSE?',
        fb_enjoy: 'What do you enjoy most?', fb_wish: 'Feature wish (optional)',
        fb_comment: 'Anything else? (optional)', fb_submit: 'SUBMIT FEEDBACK',
        fb_bug: 'Report a Bug (GitHub)', fb_footer: 'Feedback goes to a Google Form — no login required.',
        // Quiz
        quiz_title: 'QUIZ-SECTION', quiz_hud_sub: 'MAP QUIZ',
        quiz_tab: 'QUIZ', quiz_desc: 'Test your world knowledge! 50 bilingual questions with map integration.',
        quiz_category: 'CATEGORY', quiz_difficulty: 'DIFFICULTY', quiz_start: 'START QUIZ',
        // Showcase labels
        showcase_ringoffire: '🌋 RING OF FIRE', showcase_aurora: '🌌 AURORA FORECAST',
        showcase_wonders: '🏛️ LOST WONDERS', showcase_cables: '🌐 DIGITAL SILK ROAD',
        // Sidebar
        sidebar_expand: '▼ MAIN MENU', welcome_manual: 'OPEN MANUAL'
    },
    de: {
        mode_explore: 'ERKUNDEN', mode_analyze: 'ANALYSIEREN',
        status_active: 'GLOBALES KOMMANDO AKTIV', system_override: 'SYSTEM OVERRIDE',
        news_band: 'GLOBALER NACHRICHTEN-TICKER', cat_scenarios: 'GLOBALE SZENARIEN',
        reset_layers: 'EBENEN ZURÜCKSETZEN', command_manual: 'KOMMANDO-HANDBUCH',
        cat_realtime: 'ECHTZEIT-TRACKING', cat_geopolitics: 'GEOPOLITIK',
        cat_environment: 'UMWELT & WELTRAUM',

        layer_iss: 'ISS Tracker', desc_iss: 'Internationale Raumstation — umkreist die Erde alle 90 Minuten mit 28.000 km/h.',
        layer_webcams: 'Live-Webcams', desc_webcams: '9 kuratierte Alpen- & Stadt-Webcams mit Echtzeit-Schnappschüssen von foto-webcam.eu.',
        layer_earthquakes: 'Erdbeben', desc_earthquakes: 'Live-Seismik von USGS. Kreisgröße = Magnitude. Aktualisierung alle 5 Min.',
        layer_fires: 'NASA Waldbrände', desc_fires: 'Aktive Branderkennung durch NASA FIRMS Satelliten. Nahezu Echtzeit.',
        layer_terminator: 'Tag/Nacht-Linie', desc_terminator: 'Solarterminator — die Echtzeit-Grenze zwischen Tag und Nacht auf der Erde.',
        layer_regimes: 'Regimetypen', desc_regimes: 'Regierungssysteme nach Land — Demokratie, Autokratie oder Hybridregime.',
        layer_blocs: 'Allianzen & Blöcke', desc_blocs: 'NATO, BRICS, EU, ASEAN — große geopolitische Bündnisnetzwerke.',
        layer_conflicts: 'Aktive Konflikte', desc_conflicts: 'Derzeit aktive Kriegsgebiete und bewaffnete Konflikte weltweit.',
        layer_borders: 'Ländergrenzen', desc_borders: 'Nationale Grenzen mit Ländernamen. Daten: Natural Earth.',
        layer_cables: 'Unterseekabel', desc_cables: 'Unterwasser-Glasfaserkabel — 95% des globalen Internetverkehrs fließen hier.',
        layer_pipelines: 'Energie-Pipelines', desc_pipelines: 'Wichtige Öl- und Gas-Pipelines — die Arterien der globalen Energieversorgung.',
        layer_nuclear: 'Kernkraftwerke', desc_nuclear: 'Betriebsbereite Kernkraftwerke und ihre Energieleistung weltweit.',
        layer_sst: 'Ozeantemperatur', desc_sst: 'Meeresoberflächentemperatur von NOAA. Rot = wärmer, blau = kühler als Durchschnitt.',
        layer_temperature: 'Oberflächentemperatur', desc_temperature: 'Landoberflächentemperaturdaten zur globalen Wärmeverteilung.',
        layer_population: 'Bevölkerungsdichte', desc_population: 'Globale Bevölkerungsheatmap — helle Bereiche = hohe Bevölkerungskonzentration.',
        layer_volcanoes: 'Vulkane', desc_volcanoes: 'Historisch aktive Vulkane vom Smithsonian Global Volcanism Program.',
        layer_radiation: 'Strahlungsorte', desc_radiation: 'Bemerkenswerte Nuklearunfälle — Tschernobyl, Fukushima und andere.',
        layer_starlink: 'Starlink Netz', desc_starlink: 'SpaceX Starlink Satellitenkonstellation — 5.000+ Internet-Satelliten im Orbit.',
        upcoming_launches: 'Bevorstehende Starts', solar_index: 'SONNENSTURM-INDEX',
        solar_connecting: 'VERBINDUNG ZU NOAA SWPC...', data_sources_label: 'DATENQUELLEN:',
        nav_scope: 'KARTE', nav_layers: 'EBENEN', nav_info: 'INFO',
        info_title: 'ÜBER DIESE KARTE', info_subtitle: 'DATENQUELLEN & METHODIK',
        info_how_title: '📖 Karte lesen',
        info_how_desc: 'Schalten Sie Datenebenen im EBENEN-Panel ein, um Echtzeit-Feeds und Referenzdaten auf die Satellitenkarte zu legen. Klicken Sie auf Marker für detaillierte Briefings. Nutzen Sie den Modus-Schalter (ERKUNDEN / ANALYSIEREN).',
        info_sources_title: '📡 Live-Datenquellen',
        info_src_usgs: 'Seismische Ereignisse alle 5 Minuten aktualisiert. earthquake.usgs.gov',
        info_src_firms: 'Aktive Waldbrand-Hotspots via VIIRS/MODIS Satelliten. firms.modaps.eosdis.nasa.gov',
        info_src_iss: 'ISS Orbitalposition in Echtzeit. wheretheiss.at',
        info_src_noaa: 'Meeresoberflächentemperatur & Sonnenwetterdaten. noaa.gov',
        info_src_freedom: 'Regimetypen, Allianzen und geopolitische Blöcke. Statische Referenzdaten.',
        info_src_infra: 'Unterseekabel- und Kernkraftwerk-Datenbanken.',
        info_explore_title: '🔬 Weiter erkunden',
        info_about_title: 'ℹ️ Über GEOPULSE',
        info_about_desc: 'GEOPULSE ist ein Open-Source Global Intelligence Dashboard, gebaut mit MapLibre GL JS und Vanilla JavaScript. Keine API-Schlüssel, keine Konten — nur Echtzeitdaten aus öffentlichen Quellen. Von RB Design 2026.',
        info_full_about: 'Vollständige About-Seite ↗', info_manual_link: 'Kommando-Handbuch ↗',
        orientation_hint: 'AM BESTEN IM QUERFORMAT', launch_connecting: 'VERBINDUNG ZUR LAUNCH LIBRARY...',
        // Tour & category labels
        guided_tours: 'GEFÜHRTE TOUREN',
        cat_geopolitics_tours: 'GEOPOLITIK', cat_history_tours: 'GESCHICHTE',
        cat_science_tours: 'WISSENSCHAFT & NATUR', cat_sports_tours: 'SPORT & KULTUR',
        cat_society_tours: 'GESELLSCHAFT & RECHTE',
        tour_coldwar: 'Kalter Krieg → Wiedervereinigung', tour_bri: 'Neue Seidenstraße',
        tour_trump: 'Trump Welttour', tour_chokepoints: 'Nadelöhre der Welt', tour_water: 'Wasserkriege',
        tour_migration: 'Fluchtrouten der Welt',
        tour_ww1: 'Erster Weltkrieg (1914–1918)', tour_ww2: 'Zweiter Weltkrieg (1939–1945)',
        tour_ringoffire: 'Pazifischer Feuerring', tour_nuclear: 'Nukleares Erbe', tour_cables: 'Digitale Seidenstraße',
        tour_battery: 'Batterie-Wettlauf', tour_climate: 'Klima-Frontlinien',
        tour_quakes: 'Erdbeben & Vulkanausbrüche', tour_olympics: 'Olympische Spiele',
        tour_f1: 'Formel 1 Welttour', tour_worldcup: 'FIFA Weltmeisterschaft',
        tour_romanempire: 'Römisches Reich (753 v. Chr.–476 n. Chr.)',
        tour_womenwworld: 'Frauen, die die Welt veränderten',
        tour_structures: 'Größte Bauwerke',
        tour_genocide: 'Genozid-Gedenkorte — Nie wieder',
        tour_musicworld: 'Musik, die die Welt veränderte',
        tour_filmlocations: 'Drehorte',
        tour_extremeplaces: 'Extreme Lebensorte',
        tour_revolutions: 'Revolutionen',
        tour_pandemics: 'Pandemien',
        tour_hondius: 'MV Hondius — Hantavirus 2026',
        tour_aurorahunters: 'Polarlichtjäger',
        tour_cosmicimpacts: 'Kosmische Einschläge',
        tour_climatecrisis: 'Klimakrise',
        tour_greatmigrations: 'Große Wanderungen',
        tour_spycraft: 'Spionage-Welt',
        layer_aurora: 'Polarlicht-Vorhersage',
        desc_aurora: 'Echtzeit-Polarlicht-Wahrscheinlichkeit vom NOAA OVATION-Modell.',
        layer_fireballs: 'Feuerbälle',
        desc_fireballs: 'NASA-bestätigte Meteoreinschläge — Kreisgröße = Energiefreisetzung (kT).',
        // Tour hint
        tour_hint: 'Mehr auf Wikipedia lesen',
        // Welcome overlay
        welcome_subtitle: 'GESCHICHTE ERLEBEN. DIE WELT VERSTEHEN.',
        welcome_feat_tours: 'Jetzt 40 geführte Touren! Fliege zu echten Orten mit Satellitenbildern',
        welcome_feat_1: 'Weltkriege, Römisches Reich, Verbotene Zonen & Weltwunder',
        welcome_feat_2: 'Echtzeit-Erdbeben, Vulkane, Waldbrände & Satelliten',
        welcome_feat_3: 'Für Schüler — Erdkunde, Geschichte, Naturwissenschaft & Politik',
        welcome_start_tour: 'DEMO-TOUR STARTEN', welcome_explore: 'FREI ERKUNDEN',
        welcome_dont_show: 'Nicht mehr anzeigen',
        welcome_footer: 'Kein Login · Keine Werbung · 100% kostenlos & Open Source · Für Schüler, Studenten, Lehrer & Interessierte',
        welcome_interest_label: 'WAS INTERESSIERT DICH?',
        interest_geopolitics: 'Geopolitik & Konflikte', interest_history: 'Geschichte & Zivilisationen',
        interest_science: 'Wissenschaft & Natur', interest_sports: 'Sport & Kultur',
        interest_all: 'Zeig mir alles',
        // Feedback widget
        fb_title: 'FEEDBACK', fb_rate: 'Wie bewerten Sie GEOPULSE?',
        fb_enjoy: 'Was gefällt Ihnen am besten?', fb_wish: 'Feature-Wunsch (optional)',
        fb_comment: 'Noch etwas? (optional)', fb_submit: 'FEEDBACK SENDEN',
        fb_bug: 'Fehler melden (GitHub)', fb_footer: 'Feedback geht an ein Google-Formular — kein Login nötig.',
        // Quiz
        quiz_title: 'QUIZ-BEREICH', quiz_hud_sub: 'KARTEN-QUIZ',
        quiz_tab: 'QUIZ', quiz_desc: 'Teste dein Weltwissen! 50 zweisprachige Fragen mit Kartenintegration.',
        quiz_category: 'KATEGORIE', quiz_difficulty: 'SCHWIERIGKEIT', quiz_start: 'QUIZ STARTEN',
        // Showcase labels
        showcase_ringoffire: '🌋 FEUERRING', showcase_aurora: '🌌 POLARLICHT-VORHERSAGE',
        showcase_wonders: '🏛️ VERLORENE WUNDER', showcase_cables: '🌐 DIGITALE SEIDENSTRASSE',
        // Sidebar
        sidebar_expand: '▼ HAUPTMENÜ', welcome_manual: 'HANDBUCH ÖFFNEN'
    }
};

// ── Language System ──
let currentLang = localStorage.getItem('geopulseLang') || 'en';

const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('geopulseLang', lang);
    document.getElementById('app-root')?.setAttribute('lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    const dict = i18n[lang] || i18n.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) el.textContent = dict[key];
    });
    // Update welcome lang toggle label (show opposite language)
    const lbl = document.getElementById('welcome-lang-label');
    if (lbl) lbl.textContent = (lang === 'de') ? 'EN' : 'DE';
};

// Wire language toggle buttons
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

// Listen for custom language change events (from welcome overlay inline handler)
document.addEventListener('setLang', (e) => {
    if (e.detail) setLanguage(e.detail);
});

// Apply saved language on load
setLanguage(currentLang);

// ── Public API ──
window._i18n = i18n;
window.setLanguage = setLanguage;
window.getLanguage = () => currentLang;
window.t = (key) => (i18n[currentLang] || i18n.en)[key] || key;

})();
