// ── SPLASH SCREEN — fallback dismiss if gateway is missing ──
(function dismissSplash() {
    // If Enter Gateway exists, it controls splash timing (with audio)
    if (document.getElementById('enter-gateway')) return;
    const splashEl = document.getElementById('splash-screen');
    if (!splashEl) return;
    const dismiss = () => {
        splashEl.classList.add('dissolve');
        splashEl.addEventListener('transitionend', () => splashEl.remove(), { once: true });
        setTimeout(() => { if (splashEl.parentNode) splashEl.remove(); }, 2000);
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(dismiss, 4000));
    } else {
        setTimeout(dismiss, 4000);
    }
})();

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // CONSTANTS & STATE
    // ----------------------------------------------------
    // Security: HTML escape helper to prevent XSS from external API data
    const escHtml = (s) => { const d = document.createElement('div'); d.textContent = String(s || ''); return d.innerHTML; };
    const VERSION = window.GeopulseConfig?.VERSION || '1.4';

    // ── RELIABLE FETCH — timeout-safe wrapper for all external API calls ──
    window.reliableFetch = async (url, label, opts = {}) => {
        const timeout = opts.timeout || 10000;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, { signal: controller.signal, ...opts });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return { data, status: res.status };
        } catch (err) {
            clearTimeout(timer);
            console.warn(`[reliableFetch] ${label || url}: ${err.message}`);
            throw err;
        }
    };
    
    // Real visitor counter via CounterAPI.dev (persistent across all users)
    const COUNTER_OFFSET = 1247;
    (async () => {
        const sessionEl = document.getElementById('session-count');
        if (!sessionEl) return;
        try {
            const res = await fetch('https://api.counterapi.dev/v1/geopulse-rbdesign/visits/up');
            const data = await res.json();
            sessionEl.innerHTML = '<i class="fa-solid fa-eye" style="opacity:.6;margin-right:4px;"></i>' + ((data.count || 0) + COUNTER_OFFSET).toLocaleString() + ' VISITS';
        } catch (e) {
            // Fallback: localStorage counter if API unreachable
            let count = parseInt(localStorage.getItem('geopulseSessionCount') || String(COUNTER_OFFSET), 10);
            count++;
            localStorage.setItem('geopulseSessionCount', count);
            sessionEl.innerHTML = '<i class="fa-solid fa-eye" style="opacity:.6;margin-right:4px;"></i>' + count.toLocaleString() + ' VISITS';
        }
    })();

    // ----------------------------------------------------
    // i18n TRANSLATION SYSTEM (EN / DE)
    // ----------------------------------------------------
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
            // Feedback widget
            fb_title: 'FEEDBACK', fb_rate: 'How do you rate GEOPULSE?',
            fb_enjoy: 'What do you enjoy most?', fb_wish: 'Feature wish (optional)',
            fb_comment: 'Anything else? (optional)', fb_submit: 'SUBMIT FEEDBACK',
            fb_bug: 'Report a Bug (GitHub)', fb_footer: 'Feedback goes to a Google Form — no login required.'
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
            // Feedback widget
            fb_title: 'FEEDBACK', fb_rate: 'Wie bewerten Sie GEOPULSE?',
            fb_enjoy: 'Was gefällt Ihnen am besten?', fb_wish: 'Feature-Wunsch (optional)',
            fb_comment: 'Noch etwas? (optional)', fb_submit: 'FEEDBACK SENDEN',
            fb_bug: 'Fehler melden (GitHub)', fb_footer: 'Feedback geht an ein Google-Formular — kein Login nötig.'
        }
    };

    // Expose i18n for search engine access
    window._i18n = i18n;

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
    window.setLanguage = setLanguage;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Apply saved language on load
    setLanguage(currentLang);

    const toggles = {
        terminator: false, fires: false, weather: false, borders: false,
        iss: false, starlink: false, earthquakes: false, webcams: false,
        nightlights: false, population: false, satellites: false, temperature: false,
        volcanoes: false, radiation: false, internet: false, power: false,
        cables: false, datacenters: false, nuclear: false, conflicts: false, regimes: false, blocs: false, aiAtlas: false, pipelines: false,
        aurora: false, fireballs: false
    };

    let _tourActive = false; // Guard: blocks all data refreshes during active tours

    let issMarker = null;
    let flightMarkers = [];
    let webcamMarkers = [];
    let powerMarkers = [];

    let terminatorInterval = null;
    let tacticalQueue = [];
    let tacticalProcessing = false;

    // ----------------------------------------------------
    // 2-MODE SYSTEM: EXPLORE, ANALYZE
    // ----------------------------------------------------
    const modeConfig = {
        EXPLORE: {
            autoActiveLayers: ['terminator'],
            uiState: { sidebarCollapsed: true },
            disablePolling: ['iss', 'earthquakes']
        },
        ANALYZE: {
            autoActiveLayers: ['cables', 'blocs'],
            uiState: { sidebarCollapsed: false },
            disablePolling: []
        }
    };

    // ----------------------------------------------------
    // PREDEFINED THREAT SCENARIOS
    // ----------------------------------------------------
    const SCENARIOS = {
        europe: {
            layers: ['power', 'datacenters', 'temperature', 'weather', 'nuclear', 'blocs'],
            title: "Europe Energy Stress",
            what: "Extreme weather events combined with geopolitical tensions lead to severe strain on the European power grid.",
            why: "Data centers face brownouts, and nuclear output is being heavily monitored to prevent cascading grid failures across the continent.",
            center: [10.0, 50.0],
            zoom: 3.5,
            severity: "HIGH"
        },
        taiwan: {
            layers: ['cables', 'conflicts', 'regimes', 'nukes'],
            title: "Taiwan Escalation",
            what: "A sudden military mobilization in the Taiwan Strait disrupts global commercial shipping and reroutes international flights.",
            why: "Strategic undersea internet cables are flagged at high risk, and regional tension escalates to DEFCON alert levels.",
            center: [120.9, 23.7],
            zoom: 5.0,
            severity: "CRITICAL"
        },
        redsea: {
            layers: ['conflicts', 'power', 'internet', 'regimes'],
            title: "Red Sea Crisis",
            what: "Asymmetric attacks and naval posturing in the Red Sea cause a massive rerouting of global shipping around the Cape of Good Hope.",
            why: "Critical energy transit is delayed, and regional IT infrastructure experiences anomalous outages.",
            center: [38.5, 19.5],
            zoom: 4.5,
            severity: "HIGH"
        },
        nuclear: {
            layers: ['nukes', 'radiation', 'conflicts', 'blocs', 'satellites'],
            title: "Global Nuclear Risk",
            what: "Following a breakdown in strategic arms control, early warning satellite networks detect heightened readiness at silo locations.",
            why: "Airborne command posts are active, and terrestrial radiation sensors are put on high alert. Defcon level raised.",
            center: [0.0, 40.0],
            zoom: 2.0,
            severity: "CRITICAL"
        }
    };

    setTimeout(() => {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const scenarioId = btn.dataset.scenario;
                const scenario = SCENARIOS[scenarioId];
                if(!scenario) return;

                // Turn off all layers first
                Object.keys(toggles).forEach(key => {
                    if (['ticker', 'all'].includes(key)) return;
                    const cb = document.getElementById(`toggle-${key}`);
                    if(cb && cb.checked) {
                        cb.checked = false;
                        cb.dispatchEvent(new Event('change'));
                    }
                });

                // Turn on specific scenario layers
                setTimeout(() => {
                    scenario.layers.forEach(layer => {
                        const cb = document.getElementById(`toggle-${layer}`);
                        if(cb && !cb.checked) {
                            cb.checked = true;
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                }, 100);

                // Map FlyTo
                map.flyTo({ center: scenario.center, zoom: scenario.zoom, pitch: 45, duration: 4000 });

                // Briefing
                if (window.openBriefing) {
                    window.openBriefing({
                        id: scenarioId,
                        title: scenario.title,
                        what: scenario.what,
                        why: scenario.why,
                        time: new Date().toLocaleTimeString('en-GB', {timeZone: 'UTC'}) + " ZULU",
                        source: "AI STRAT-LAYER",
                        severity: scenario.severity
                    });
                }
                
                if(window.setStatus) setStatus(currentLang === 'de' ? `SZENARIO GELADEN: ${scenario.title.toUpperCase()}` : `SCENARIO LOADED: ${scenario.title.toUpperCase()}`);
                
                // Fall back to ANALYZE mode automatically for full dashboard visibility
                if (switchMode && currentMode !== 'ANALYZE') switchMode('ANALYZE');
            });
        });

        document.getElementById('clear-scenarios')?.addEventListener('click', () => {
            Object.keys(toggles).forEach(key => {
                if (['ticker', 'all'].includes(key)) return;
                const cb = document.getElementById(`toggle-${key}`);
                if(cb && cb.checked) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change'));
                }
            });
            if(window.closeBriefing) window.closeBriefing();
            map.flyTo({ center: [15.0, 48.0], zoom: 2.2, pitch: 0, duration: 3000 });
            if(window.setStatus) setStatus(currentLang === 'de' ? 'ALLE EBENEN ZURÜCKGESETZT' : 'ALL LAYERS RESET');
        });

        // ── MAP VIEW RESET — reset pitch/bearing/zoom to default ──
        document.getElementById('reset-map-view')?.addEventListener('click', () => {
            map.flyTo({ center: [15.0, 48.0], zoom: 2.2, pitch: 0, bearing: 0, duration: 2000 });
            if(window.setStatus) setStatus(currentLang === 'de' ? 'KARTENANSICHT ZURÜCKGESETZT' : 'MAP VIEW RESET');
        });
    }, 500);

    const switchMode = (modeId) => {
        // Mode switching logic removed in V8.8
    };

    const handleManualLayerToggle = () => {
        // Manual override logic removed in V8.8
    };

    // Attach click listener to checkboxes to detect manual override
    document.querySelectorAll('.control-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('click', () => {
            if (['toggle-ticker', 'toggle-all'].includes(cb.id)) return;
            handleManualLayerToggle();
        });
    });


    // ----------------------------------------------------
    // INTELLIGENCE BRIEFING PANEL
    // ----------------------------------------------------
    let currentBriefing = null;
    window.closeBriefing = () => {
        currentBriefing = null;
        const panel = document.getElementById('briefing-panel');
        if(panel) panel.classList.add('hidden');
    };

    window.openBriefing = (eventData) => {
        currentBriefing = eventData.id;
        const panel = document.getElementById('briefing-panel');
        if(!panel) return;
        panel.classList.remove('hidden');

        if (eventData.location) {
            map.flyTo({ center: eventData.location, zoom: 5, essential: true });
        }

        const relatedHtml = eventData.relatedLayers ? eventData.relatedLayers.map(layer => {
            return `<button class="related-chip" onclick="document.getElementById('toggle-${escHtml(layer.layerId)}').click()">+ ${escHtml(layer.label)}</button>`;
        }).join('') : '';

        panel.innerHTML = `
            <div class="briefing-header severity-${escHtml((eventData.severity || 'low').toLowerCase())}">
                <h2>${escHtml(eventData.title)}</h2>
                <button class="btn-close-briefing" onclick="closeBriefing()">✖</button>
            </div>
            <div class="briefing-body">
                <h3>SITUATION</h3>
                <p>${escHtml(eventData.what || '')}</p>
                <h3>ASSESSMENT</h3>
                <p>${escHtml(eventData.why || '')}</p>
                
                <div class="briefing-meta-grid">
                    <div><span>TIME DETECTED</span>${escHtml(eventData.time)}</div>
                    <div><span>SOURCE / FEED</span>${escHtml(eventData.source)}</div>
                </div>
                
                ${relatedHtml ? `<h3>RELATED SIGNALS</h3><div class="related-chips">${relatedHtml}</div>` : ''}
            </div>
        `;
    };


    // ----------------------------------------------------
    // LAYER STATUS MANAGEMENT (V8.7)
    // ----------------------------------------------------
    // Non-destructive layer status tracking — preserves all sidebar HTML
    const updateLayerStatus = (id, status, infoMsg = "") => {
        const meta = window.GeopulseConfig.LAYER_METADATA?.[id];
        if (!meta) return;
        meta.status = status;
        meta.lastUpdate = Date.now();
        if (status === 'ERROR') console.warn(`[LAYER] ${id}: ${infoMsg}`);
    };

    // Set dataset attributes for styling hooks — does NOT replace DOM
    document.querySelectorAll('.control-item').forEach(item => {
        const toggle = item.querySelector('input[type="checkbox"]');
        if (toggle && toggle.id.startsWith('toggle-')) {
            const id = toggle.id.replace('toggle-', '');
            if (window.GeopulseConfig.LAYER_METADATA?.[id]) item.dataset.layerId = id;
        }
    });

    // ----------------------------------------------------
    const statusText = document.getElementById("status-text");
    const setStatus = (msg) => { if(statusText) statusText.innerText = msg; };
    window.setStatus = setStatus;
    const sidebar = document.getElementById('sidebar');
    const infoPanel = document.getElementById('info-panel');
    let activeMobilePanel = null;
    const switchSection = (target) => {
        if(window.innerWidth > 768) return;
        if (activeMobilePanel === target && target !== 'map') {
            sidebar.classList.remove('active');
            if (infoPanel) infoPanel.classList.remove('active');
            document.body.classList.remove('mobile-panel-open');
            activeMobilePanel = null;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            const scopeBtn = document.querySelector('.nav-btn[data-target="map"]');
            if (scopeBtn) scopeBtn.classList.add('active');
            return;
        }
        sidebar.classList.remove('active');
        if (infoPanel) infoPanel.classList.remove('active');
        document.body.classList.remove('mobile-panel-open');
        activeMobilePanel = null;
        if(target === 'layers') {
            sidebar.classList.add('active');
            document.body.classList.add('mobile-panel-open');
            activeMobilePanel = 'layers';
            const fs = sidebar.querySelector('.collapsible-section:not(.open)');
            if (fs && !sidebar.querySelector('.collapsible-section.open')) fs.classList.add('open');
        }
        if(target === 'tours') {
            sidebar.classList.add('active');
            document.body.classList.add('mobile-panel-open');
            activeMobilePanel = 'tours';
            // Open the tours section and scroll to it
            const toursSection = document.getElementById('sec-tours');
            if (toursSection) {
                toursSection.classList.add('open');
                setTimeout(() => {
                    const tourHeading = sidebar.querySelector('.tour-btn');
                    if (tourHeading) tourHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            }
        }

        if(target === 'info') {
            if (infoPanel) infoPanel.classList.add('active');
            document.body.classList.add('mobile-panel-open');
            activeMobilePanel = 'info';
        }
        document.querySelectorAll('.nav-btn').forEach(b => {
            const t = b.dataset.target || (b.id === 'mobile-layers-btn' ? 'layers' : '');
            b.classList.toggle('active', t === target);
        });
    };
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            switchSection(btn.dataset.target || (btn.id === 'mobile-layers-btn' ? 'layers' : ''));
        });
    });
    const handleOrientation = () => {
        if (window.innerWidth > window.innerHeight && window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
            if (infoPanel) infoPanel.classList.remove('active');
            document.body.classList.remove('mobile-panel-open');
            activeMobilePanel = null;
        }
    };
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    document.querySelectorAll('.cat-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const section = btn.closest('.collapsible-section');
            if (section) section.classList.toggle('open');
        });
    });
    // ── AUTO-COLLAPSE SIDEBAR ON TOGGLE (Mobile) ──
    // When user toggles a layer or clicks a scenario, close the sidebar
    // after a brief delay so they see the map change
    const autoCollapseMobile = () => {
        if (window.innerWidth > 768) return;
        setTimeout(() => {
            sidebar.classList.remove('active');
            if (infoPanel) infoPanel.classList.remove('active');
            document.body.classList.remove('mobile-panel-open');
            activeMobilePanel = null;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            const scopeBtn = document.querySelector('.nav-btn[data-target="map"]');
            if (scopeBtn) scopeBtn.classList.add('active');
        }, 400);
    };
    // Attach to all layer toggles
    sidebar.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', autoCollapseMobile);
    });
    // Attach to scenario buttons
    sidebar.querySelectorAll('.tactical-btn').forEach(btn => {
        btn.addEventListener('click', autoCollapseMobile);
    });
    // Attach to tour buttons
    sidebar.querySelectorAll('.tour-btn').forEach(btn => {
        btn.addEventListener('click', autoCollapseMobile);
    });
    // ── END MOBILE NAVIGATION SETUP ──

    // INITIALIZE V4 MAPLIBRE GL JS
    // ----------------------------------------------------
    const map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
            sources: {
                'esri-satellite': {
                    type: 'raster',
                    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
                    tileSize: 256, maxzoom: 15,
                    attribution: '&copy; Esri &mdash; NASA / USGS'
                }
            },
            layers: [{ id: 'base-map', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 15 }]
        },
        center: [15.0, 48.0], zoom: 2.2, pitch: 0, bearing: 0,
        projection: { type: 'globe' }, 
        dragRotate: true, dragPan: true, scrollZoom: true
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    // [Mobile nav code (switchSection, nav-btn listeners, handleOrientation, cat-toggle) 
    //  is registered BEFORE map init for resilience — see line ~424]

    // Close panels on map tap — requires the map object so stays here
    map.on('click', () => {
        if(window.innerWidth <= 768 && activeMobilePanel) {
            sidebar.classList.remove('active');
            if (infoPanel) infoPanel.classList.remove('active');
            document.body.classList.remove('mobile-panel-open');
            activeMobilePanel = null;
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            const scopeBtn = document.querySelector('.nav-btn[data-target="map"]');
            if (scopeBtn) scopeBtn.classList.add('active');
        }
    });

    // ============================================================
    // MAP LOAD — Initialize All Data Layers
    // ============================================================
    map.on('load', async () => {
        setStatus(currentLang === 'de' ? 'KARTE GELADEN. DATENSTRÖME WERDEN INITIALISIERT...' : 'MAP LOADED. INITIALIZING DATA STREAMS...');

        // ═══════════════════════════════════════════════════════════
        // GEN Z VISUAL EFFECTS — Atmosphere, Particles, Sounds
        // ═══════════════════════════════════════════════════════════

        // ── 1. MAP ATMOSPHERE / SKY (3D depth at horizon) ──
        try {
            map.setSky({
                'sky-color': '#000a1a',
                'sky-horizon-blend': 0.4,
                'horizon-color': '#003366',
                'horizon-fog-blend': 0.6,
                'fog-color': '#001122',
                'fog-ground-blend': 0.1
            });
        } catch(e) { console.warn('[atmosphere] Sky not supported:', e.message); }

        // ── 2. AMBIENT PARTICLE FIELD (floating data-stream particles) ──
        try {
            const canvas = document.getElementById('particle-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                let particles = [];
                const PARTICLE_COUNT = 50;
                const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
                resize();
                window.addEventListener('resize', resize);

                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        r: Math.random() * 1.5 + 0.5,
                        a: Math.random() * 0.5 + 0.2,
                        hue: Math.random() > 0.7 ? 180 : (Math.random() > 0.5 ? 50 : 200)
                    });
                }

                function drawParticles() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // Draw connections between nearby particles
                    for (let i = 0; i < particles.length; i++) {
                        for (let j = i + 1; j < particles.length; j++) {
                            const dx = particles[i].x - particles[j].x;
                            const dy = particles[i].y - particles[j].y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 120) {
                                ctx.beginPath();
                                ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 120)})`;
                                ctx.lineWidth = 0.5;
                                ctx.moveTo(particles[i].x, particles[i].y);
                                ctx.lineTo(particles[j].x, particles[j].y);
                                ctx.stroke();
                            }
                        }
                    }
                    // Draw particles
                    particles.forEach(p => {
                        p.x += p.vx;
                        p.y += p.vy;
                        if (p.x < 0) p.x = canvas.width;
                        if (p.x > canvas.width) p.x = 0;
                        if (p.y < 0) p.y = canvas.height;
                        if (p.y > canvas.height) p.y = 0;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.a})`;
                        ctx.fill();
                    });
                    requestAnimationFrame(drawParticles);
                }
                drawParticles();
            }
        } catch(e) { console.warn('[particles] Init failed:', e.message); }

        // ── 3. PROCEDURAL SOUND EFFECTS ENGINE (Web Audio API) ──
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
        } catch(e) { console.warn('[sfx] Audio context not available'); }

        // ── PLACE LABELS OVERLAY (Esri — transparent city/country names) ──
        // Adds city, country, and place names on top of satellite imagery
        // so users can orient themselves during tours and exploration.
        try {
            map.addSource('esri-labels', {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: 'Labels © Esri'
            });
            map.addLayer({
                id: 'esri-labels-layer',
                type: 'raster',
                source: 'esri-labels',
                paint: { 'raster-opacity': 0.75 },
                layout: { visibility: 'visible' }
            });
        } catch (err) { console.warn('[labels] Esri reference overlay failed:', err); }

        // ── EARTHQUAKES (USGS — Live GeoJSON) ──────────────────
        try {
            const eqResult = await window.reliableFetch(
                'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', 'earthquakes'
            );
            map.addSource('earthquakes-src', { type: 'geojson', data: eqResult.data });
            map.addLayer({
                id: 'earthquakes-ring', type: 'circle', source: 'earthquakes-src',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2.5, 10, 5, 22, 7, 40],
                    'circle-color': 'transparent',
                    'circle-stroke-color': ['interpolate', ['linear'], ['get', 'mag'], 2.5, '#ffb000', 5, '#ff6600', 7, '#ff0000'],
                    'circle-stroke-width': 1.5, 'circle-stroke-opacity': 0.35
                }
            });
            map.addLayer({
                id: 'earthquakes-core', type: 'circle', source: 'earthquakes-src',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2.5, 3, 5, 7, 7, 14],
                    'circle-color': ['interpolate', ['linear'], ['get', 'mag'], 2.5, '#ffb000', 5, '#ff6600', 7, '#ff0000'],
                    'circle-opacity': 0.85
                }
            });
            map.on('click', 'earthquakes-core', (e) => {
                const p = e.features[0].properties;
                const t = new Date(p.time).toLocaleString();
                new maplibregl.Popup({ maxWidth: '260px' }).setLngLat(e.lngLat).setHTML(
                    `<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;"><h3 style="color:#ff6600;margin:0 0 5px;border-bottom:1px solid #ff660044;padding-bottom:4px;">🌍 ${currentLang==='de'?'SEISMISCHES EREIGNIS':'SEISMIC EVENT'}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;"><div style="background:rgba(255,100,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">${currentLang==='de'?'STÄRKE':'MAGNITUDE'}</div><div style="color:#ff6600;font-size:1.1rem;font-weight:bold;">${escHtml(p.mag)}</div></div><div style="background:rgba(255,100,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">${currentLang==='de'?'TIEFE':'DEPTH'}</div><div>${escHtml(Math.round(e.features[0].geometry.coordinates[2]))} km</div></div></div><div style="font-size:.65rem;opacity:.75;line-height:1.4;">${escHtml(p.place)}</div><div style="font-size:.55rem;opacity:.3;margin-top:5px;">${escHtml(t)} — USGS</div></div>`
                ).addTo(map);
            });
            map.on('mouseenter', 'earthquakes-core', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'earthquakes-core', () => map.getCanvas().style.cursor = '');
            updateLayerStatus('earthquakes', 'LIVE', 'USGS Feed Online');

            // ── EARTHQUAKE PULSE RIPPLE (animated expanding rings) ──
            map.addLayer({
                id: 'earthquakes-pulse', type: 'circle', source: 'earthquakes-src',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 2.5, 18, 5, 35, 7, 55],
                    'circle-color': 'transparent',
                    'circle-stroke-color': ['interpolate', ['linear'], ['get', 'mag'], 2.5, '#ffb000', 5, '#ff6600', 7, '#ff0000'],
                    'circle-stroke-width': 1,
                    'circle-stroke-opacity': 0.15
                }
            });
            // Animate the pulse ring
            let eqPulsePhase = 0;
            setInterval(() => {
                if (!toggles.earthquakes) return;
                eqPulsePhase = (eqPulsePhase + 1) % 60;
                const scale = 1 + (eqPulsePhase / 60) * 1.5;
                const opacity = 0.3 * (1 - eqPulsePhase / 60);
                if (map.getLayer('earthquakes-pulse')) {
                    map.setPaintProperty('earthquakes-pulse', 'circle-stroke-opacity', opacity);
                    map.setPaintProperty('earthquakes-pulse', 'circle-radius',
                        ['interpolate', ['linear'], ['get', 'mag'], 2.5, 18 * scale, 5, 35 * scale, 7, 55 * scale]
                    );
                }
            }, 50);
        } catch(e) { console.warn('[EARTHQUAKES] Init failed:', e.message); }

        // ── NASA FIRES (GIBS MODIS Thermal Anomalies) ──────────
        try {
            const dateStr = getYesterdaysDateForGIBS();
            map.addSource('fires-src', {
                type: 'raster',
                tiles: [`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_Day/default/${dateStr}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`],
                tileSize: 256
            });
            map.addLayer({ id: 'fires-layer', type: 'raster', source: 'fires-src', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.75 } });
            updateLayerStatus('fires', 'LIVE', 'NASA GIBS Online');
        } catch(e) { console.warn('[FIRES] Init failed:', e.message); }

        // ── SOLAR TERMINATOR (Calculated) ──────────────────────
        try {
            const calcTerminator = () => {
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 0);
                const dayOfYear = Math.floor((now - start) / 86400000);
                const decl = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
                const declRad = decl * Math.PI / 180;
                const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
                const solarNoonLon = (12 - utcHours) * 15;
                const nightCoords = [];
                for (let lon = -180; lon <= 180; lon += 2) {
                    const ha = (lon - solarNoonLon) * Math.PI / 180;
                    const latRad = Math.atan(-Math.cos(ha) / Math.tan(declRad));
                    nightCoords.push([lon, latRad * 180 / Math.PI]);
                }
                if (decl > 0) { nightCoords.push([180, -90], [-180, -90]); }
                else { nightCoords.push([180, 90], [-180, 90]); }
                nightCoords.push(nightCoords[0]);
                return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [nightCoords] } };
            };
            map.addSource('terminator-src', { type: 'geojson', data: calcTerminator() });
            map.addLayer({ id: 'terminator-layer', type: 'fill', source: 'terminator-src', layout: { visibility: 'none' }, paint: { 'fill-color': '#000011', 'fill-opacity': 0.35 } });
            terminatorInterval = setInterval(() => { const s = map.getSource('terminator-src'); if(s) s.setData(calcTerminator()); }, 300000);
        } catch(e) { console.warn('[TERMINATOR] Init failed:', e.message); }

        // ── SHIPS layer removed — no free keyless AIS API available ──

        // ── FLIGHTS layer removed ──
        // The airplanes.live API only returns aircraft within 250 NM (~460 km) of a single
        // query point. At continental/world zoom the viewport spans thousands of km, so all
        // aircraft pile up in one dense blob around the query center — no amount of clustering
        // or styling can fix this fundamental API geometry mismatch. Removed to maintain the
        // app's visual quality. The ISS tracker remains as the primary orbital/aviation feature.

        // ── STARLINK (Simulated LEO Constellation — 500 sats) ──
        try {
            const slFeatures = [];
            for (let i = 0; i < 500; i++) {
                const ma = Math.random() * 360;
                const raan = Math.random() * 360;
                const lon = ((raan + ma) % 360) - 180;
                const lat = 53 * Math.sin(ma * Math.PI / 180) * (0.7 + Math.random() * 0.3);
                slFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, Math.max(-55, Math.min(55, lat))] } });
            }
            map.addSource('starlink-src', { type: 'geojson', data: { type: 'FeatureCollection', features: slFeatures } });
            map.addLayer({ id: 'starlink-layer', type: 'circle', source: 'starlink-src', layout: { visibility: 'none' }, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 2, 5, 4, 10, 6], 'circle-color': '#ffffff', 'circle-opacity': 0.6, 'circle-blur': 0.4 } });

            // Click handler for Starlink satellites
            map.on('click', 'starlink-layer', (e) => {
                const coords = e.features[0].geometry.coordinates;
                new maplibregl.Popup({ offset: 6, maxWidth: '240px' })
                    .setLngLat(coords)
                    .setHTML(`<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                        <h3 style="color:#fff;margin:0 0 4px;font-size:.75rem;">🛰️ ${currentLang==='de'?'STARLINK-SATELLIT':'STARLINK SATELLITE'}</h3>
                        <div style="opacity:.5;font-size:.6rem;margin-bottom:4px;">${currentLang==='de'?'SpaceX LEO-Konstellation':'SpaceX LEO Constellation'}</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">
                            <div style="background:rgba(255,255,255,.05);padding:3px;text-align:center;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'UMLAUFBAHN':'ORBIT'}</div><div style="color:#00d4ff;">~550 km</div></div>
                            <div style="background:rgba(255,255,255,.05);padding:3px;text-align:center;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'GESCHW.':'SPEED'}</div><div style="color:#00d4ff;">27.000 km/h</div></div>
                        </div>
                        <div style="opacity:.35;font-size:.5rem;margin-top:4px;letter-spacing:1px;">${currentLang==='de'?'SIMULIERTE POSITION · 5.500+ SATS IM ORBIT':'SIMULATED POSITION · 5,500+ SATS IN ORBIT'}</div>
                    </div>`)
                    .addTo(map);
            });
            map.on('mouseenter', 'starlink-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'starlink-layer', () => { map.getCanvas().style.cursor = ''; });
        } catch(e) { console.warn('[STARLINK] Init failed:', e.message); }

        // ── AURORA BOREALIS FORECAST (NOAA SWPC OVATION Model) ──────────
        try {
            map.addSource('aurora-src', {
                type: 'image',
                url: 'https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.jpg',
                coordinates: [[-180, 90], [180, 90], [180, 0], [-180, 0]]
            });
            map.addLayer({
                id: 'aurora-layer', type: 'raster', source: 'aurora-src',
                layout: { visibility: 'none' },
                paint: { 'raster-opacity': 0.55, 'raster-fade-duration': 500 }
            });
            // Also add southern hemisphere
            map.addSource('aurora-south-src', {
                type: 'image',
                url: 'https://services.swpc.noaa.gov/images/aurora-forecast-southern-hemisphere.jpg',
                coordinates: [[-180, 0], [180, 0], [180, -90], [-180, -90]]
            });
            map.addLayer({
                id: 'aurora-south-layer', type: 'raster', source: 'aurora-south-src',
                layout: { visibility: 'none' },
                paint: { 'raster-opacity': 0.55, 'raster-fade-duration': 500 }
            });
            updateLayerStatus('aurora', 'LIVE', 'NOAA OVATION Model');
        } catch(e) { console.warn('[AURORA] Init failed:', e.message); }

        // ── METEOR / FIREBALL TRACKER (NASA CNEOS) ──────────────────────
        try {
            const fbResult = await window.reliableFetch(
                'https://ssd-api.jpl.nasa.gov/fireball.api?limit=150', 'fireballs'
            );
            const fbFields = fbResult.data?.fields || [];
            const fbData = fbResult.data?.data || [];
            const iDate = fbFields.indexOf('date');
            const iLat = fbFields.indexOf('lat');
            const iLatDir = fbFields.indexOf('lat-dir');
            const iLon = fbFields.indexOf('lon');
            const iLonDir = fbFields.indexOf('lon-dir');
            const iEnergy = fbFields.indexOf('energy');
            const iVel = fbFields.indexOf('vel');
            const iAlt = fbFields.indexOf('alt');
            const fbFeatures = fbData.filter(r => r[iLat] && r[iLon]).map(r => {
                const lat = parseFloat(r[iLat]) * (r[iLatDir] === 'S' ? -1 : 1);
                const lon = parseFloat(r[iLon]) * (r[iLonDir] === 'W' ? -1 : 1);
                const energy = parseFloat(r[iEnergy]) || 0.1;
                return {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [lon, lat] },
                    properties: {
                        date: r[iDate] || 'Unknown',
                        energy: energy,
                        vel: r[iVel] || '—',
                        alt: r[iAlt] || '—'
                    }
                };
            });
            map.addSource('fireballs-src', { type: 'geojson', data: { type: 'FeatureCollection', features: fbFeatures } });
            // Glow ring
            map.addLayer({
                id: 'fireballs-glow', type: 'circle', source: 'fireballs-src',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'energy'], 0.1, 12, 1, 20, 10, 35, 100, 55],
                    'circle-color': 'transparent',
                    'circle-stroke-color': '#ffaa33',
                    'circle-stroke-width': 1.5, 'circle-stroke-opacity': 0.3
                }
            });
            // Core dot
            map.addLayer({
                id: 'fireballs-core', type: 'circle', source: 'fireballs-src',
                layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'energy'], 0.1, 3, 1, 5, 10, 9, 100, 16],
                    'circle-color': ['interpolate', ['linear'], ['get', 'energy'], 0.1, '#ffcc66', 1, '#ff8800', 10, '#ff4400', 100, '#ff0000'],
                    'circle-opacity': 0.9,
                    'circle-blur': 0.3
                }
            });
            // Click popup
            map.on('click', 'fireballs-core', (e) => {
                const p = e.features[0].properties;
                const hiroshima = (p.energy / 15).toFixed(1);
                new maplibregl.Popup({ maxWidth: '280px' }).setLngLat(e.lngLat).setHTML(
                    `<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;"><h3 style="color:#ff8800;margin:0 0 5px;border-bottom:1px solid #ff880044;padding-bottom:4px;">☄️ ${currentLang==='de'?'FEUERBALL / BOLIDE':'FIREBALL / BOLIDE'}</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;"><div style="background:rgba(255,136,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">${currentLang==='de'?'ENERGIE':'ENERGY'}</div><div style="color:#ff8800;font-size:1rem;font-weight:bold;">${escHtml(p.energy)} kT</div></div><div style="background:rgba(255,136,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">${currentLang==='de'?'GESCHW.':'VELOCITY'}</div><div>${escHtml(p.vel)} km/s</div></div></div><div style="background:rgba(255,136,0,.08);padding:3px 6px;margin-bottom:4px;"><div style="opacity:.5;font-size:.6rem;">≈ HIROSHIMA</div><div style="color:#ff4400;">${hiroshima}× ${currentLang==='de'?'Hiroshima-Äquivalent':'Hiroshima equivalent'}</div></div><div style="font-size:.6rem;opacity:.5;">${escHtml(p.date)}</div><div style="font-size:.5rem;opacity:.3;margin-top:4px;">Source: NASA CNEOS</div></div>`
                ).addTo(map);
            });
            map.on('mouseenter', 'fireballs-core', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'fireballs-core', () => map.getCanvas().style.cursor = '');
            updateLayerStatus('fireballs', 'LIVE', `${fbFeatures.length} events`);
        } catch(e) { console.warn('[FIREBALLS] Init failed:', e.message); }

        // ── POPULATION DENSITY (NASA GIBS — GPW v4.11, 2020) ──────────────
        try {
            map.addSource('population-src', {
                type: 'raster',
                tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GPW_Population_Density_2020/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png'],
                tileSize: 256
            });
            map.addLayer({ id: 'population-layer', type: 'raster', source: 'population-src', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.55 } });

            // Metro city markers — shown when population layer is active
            const metroCities = [
                [139.69,35.68,'Tokyo','Japan','37.4M',1],
                [77.21,28.61,'Delhi','India','32.9M',2],
                [121.47,31.23,'Shanghai','China','29.2M',3],
                [113.26,23.13,'Guangzhou','China','27.0M',4],
                [-46.63,-23.55,'São Paulo','Brazil','22.4M',5],
                [72.88,19.08,'Mumbai','India','21.7M',6],
                [116.40,39.90,'Beijing','China','21.5M',7],
                [-99.13,19.43,'Mexico City','Mexico','21.8M',8],
                [-43.17,-22.91,'Rio de Janeiro','Brazil','13.6M',9],
                [31.24,30.04,'Cairo','Egypt','22.0M',10],
                [90.41,23.81,'Dhaka','Bangladesh','23.2M',11],
                [126.98,37.57,'Seoul','South Korea','21.8M',12],
                [-73.94,40.67,'New York','USA','18.8M',13],
                [135.50,34.69,'Osaka','Japan','19.1M',14],
                [100.50,13.75,'Bangkok','Thailand','17.6M',15],
                [67.01,24.86,'Karachi','Pakistan','17.1M',16],
                [-118.24,34.05,'Los Angeles','USA','12.5M',17],
                [28.98,41.01,'Istanbul','Turkey','16.0M',18],
                [-87.63,41.88,'Chicago','USA','8.9M',19],
                [106.85,-6.21,'Jakarta','Indonesia','35.4M',20],
                [37.62,55.75,'Moscow','Russia','12.6M',21],
                [-0.12,51.51,'London','UK','9.5M',22],
                [2.35,48.86,'Paris','France','11.1M',23],
                [13.40,52.52,'Berlin','Germany','3.7M',24],
                [-77.04,38.91,'Washington D.C.','USA','6.4M',25],
                [55.27,25.20,'Dubai','UAE','3.5M',26],
                [174.76,-36.85,'Auckland','New Zealand','1.7M',27],
                [151.21,-33.87,'Sydney','Australia','5.4M',28],
                [18.42,-33.93,'Cape Town','South Africa','4.7M',29],
                [-58.38,-34.60,'Buenos Aires','Argentina','15.4M',30]
            ];
            const metroFeatures = metroCities.map(c => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [c[0], c[1]] },
                properties: { city: c[2], country: c[3], pop: c[4], rank: c[5], popNum: parseFloat(c[4]) }
            }));
            map.addSource('metro-cities-src', { type: 'geojson', data: { type: 'FeatureCollection', features: metroFeatures } });
            map.addLayer({ id: 'metro-cities-layer', type: 'circle', source: 'metro-cities-src', layout: { visibility: 'none' },
                paint: {
                    'circle-radius': ['interpolate', ['linear'], ['get', 'popNum'], 1, 4, 10, 7, 20, 10, 35, 14],
                    'circle-color': '#ff6633',
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-opacity': 0.6
                }
            });
            map.addLayer({ id: 'metro-cities-label', type: 'symbol', source: 'metro-cities-src', layout: { visibility: 'none',
                'text-field': ['get', 'city'], 'text-size': 11, 'text-offset': [0, 1.4], 'text-anchor': 'top',
                'text-font': ['Open Sans Bold']
            }, paint: { 'text-color': '#ffffff', 'text-halo-color': 'rgba(0,0,0,0.7)', 'text-halo-width': 1 } });
            map.on('click', 'metro-cities-layer', (e) => {
                const p = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates;
                new maplibregl.Popup({ offset: 8, maxWidth: '240px' })
                    .setLngLat(coords)
                    .setHTML(`<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                        <h3 style="color:#ff6633;margin:0 0 5px;font-size:.8rem;border-bottom:1px solid rgba(255,102,51,0.3);padding-bottom:4px;">🏙️ ${escHtml(p.city)}</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:4px;">
                            <div style="background:rgba(255,102,51,.08);padding:4px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'LAND':'COUNTRY'}</div><div style="color:#ff6633;font-size:.65rem;">${escHtml(p.country)}</div></div>
                            <div style="background:rgba(255,102,51,.08);padding:4px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">RANK</div><div style="color:#ff6633;font-size:.65rem;">#${p.rank}</div></div>
                        </div>
                        <div style="background:rgba(255,102,51,.08);padding:4px 6px;border-radius:2px;text-align:center;">
                            <div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'METROPOLREGION':'METRO POPULATION'}</div>
                            <div style="color:#ff6633;font-size:1rem;font-weight:bold;">${escHtml(p.pop)}</div>
                        </div>
                        <div style="opacity:.3;font-size:.45rem;margin-top:5px;letter-spacing:1px;">${currentLang==='de'?'QUELLE: UN WORLD URBANIZATION PROSPECTS 2024':'SOURCE: UN WORLD URBANIZATION PROSPECTS 2024'}</div>
                    </div>`)
                    .addTo(map);
            });
            map.on('mouseenter', 'metro-cities-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'metro-cities-layer', () => { map.getCanvas().style.cursor = ''; });
        } catch(e) { console.warn('[POPULATION] Init failed:', e.message); }

        // ── ROMAN EMPIRE TERRITORY (Simplified GeoJSON — 117 AD peak) ──
        try {
            map.addSource('roman-empire-src', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: { name: 'Roman Empire (117 AD)' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [-9.5, 37], [-9, 41], [-8.5, 43.5], [-1.5, 43.5], [3, 43], [-2, 51], [0, 53.5], [2, 55.5],
                            [5, 51], [8, 48.5], [10, 48], [13, 47], [16, 48], [19, 47.5], [22, 44.5], [25, 44],
                            [28, 44], [29, 41.5], [32, 41], [36, 40], [40, 38], [43, 37.5], [46, 37],
                            [44, 35], [41, 33], [36, 34], [36, 31.5], [34, 29], [32, 31],
                            [30, 31.5], [28, 31], [25, 24], [32, 22],
                            [25, 32], [20, 33], [15, 34], [10, 37], [10, 33], [8, 33],
                            [5, 36], [2, 36], [-1, 35.5], [-5, 35.5], [-6, 36], [-9.5, 37]
                        ]]
                    }
                }
            });
            map.addLayer({
                id: 'roman-empire-fill', type: 'fill', source: 'roman-empire-src',
                layout: { visibility: 'none' },
                paint: { 'fill-color': '#c0392b', 'fill-opacity': 0.18 }
            });
            map.addLayer({
                id: 'roman-empire-border', type: 'line', source: 'roman-empire-src',
                layout: { visibility: 'none' },
                paint: { 'line-color': '#e74c3c', 'line-width': 2, 'line-dasharray': [4, 2], 'line-opacity': 0.6 }
            });
        } catch(e) { console.warn('[ROMAN EMPIRE] Init failed:', e.message); }

        setStatus(currentLang === 'de' ? 'ALLE DATENSTRÖME INITIALISIERT. SYSTEM BEREIT.' : 'ALL DATA STREAMS INITIALIZED. SYSTEM READY.');

        // Keep labels on top of all data layers
        const elevateLabels = () => {
            if (map.getLayer('esri-labels-layer')) map.moveLayer('esri-labels-layer');
            if (map.getLayer('country-labels')) map.moveLayer('country-labels');
        };
        elevateLabels();
        map.on('sourcedata', () => { try { elevateLabels(); } catch(e) {} });

        // Kick off periodic data fetches
        fetchNewsTicker();
        setInterval(fetchNewsTicker, 300000);
        fetchLaunches();
        setInterval(fetchLaunches, 600000);
        fetchSolarData();
        setInterval(fetchSolarData, 600000);
    });

    // ============================================================
    // NEWS TICKER — BBC World RSS via rss2json (free, CORS-enabled)
    // ============================================================
    const fetchNewsTicker = async () => {
        try {
            const result = await window.reliableFetch(
                'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml', 'newsticker'
            );
            const items = result.data?.items || [];
            if (!items.length) return;
            const tickerText = items.map(i => `⚡ ${i.title.toUpperCase()}`).join('    //    ');
            document.querySelectorAll('.ticker-content').forEach(el => el.textContent = tickerText);
        } catch(e) { console.warn('[TICKER] RSS fetch failed:', e.message); }
    };

    // ============================================================
    // SOLAR STORM INDEX — NOAA SWPC Kp Index
    // ============================================================
    const fetchSolarData = async () => {
        const hud = document.getElementById('solar-hud');
        if (!hud) return;
        try {
            const result = await window.reliableFetch(
                'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', 'solar'
            );
            const rows = result.data || [];
            if (rows.length < 1) return;
            const latest = rows[rows.length - 1];
            // NOAA API returns objects: {time_tag, Kp, a_running, station_count}
            // Fallback to legacy array format if needed
            const kp = typeof latest === 'object' && !Array.isArray(latest)
                ? parseFloat(latest.Kp)
                : parseFloat(latest[1]);
            if (isNaN(kp)) return;
            const kpColor = kp >= 7 ? '#ff0000' : kp >= 5 ? '#ff6600' : kp >= 4 ? '#ffb000' : '#00ff88';
            const kpLabel = kp >= 7 ? 'EXTREME STORM' : kp >= 5 ? 'GEOMAGNETIC STORM' : kp >= 4 ? 'UNSETTLED' : 'QUIET';
            // Extract time from object or legacy array
            const timeRaw = typeof latest === 'object' && !Array.isArray(latest)
                ? (latest.time_tag || '')
                : (latest[0] || '');
            const timeStr = timeRaw.includes('T')
                ? timeRaw.split('T')[1]?.slice(0,5) || '--'
                : timeRaw.split(' ')[1]?.slice(0,5) || '--';
            hud.innerHTML = `
                <div class="solar-title">☀ SOLAR STORM INDEX</div>
                <div class="solar-grid">
                    <div class="solar-cell"><div class="solar-val" style="color:${kpColor}">${kp.toFixed(1)}</div><div class="solar-lbl">Kp INDEX</div></div>
                    <div class="solar-cell"><div class="solar-val" style="color:${kpColor}">${kpLabel.split(' ')[0]}</div><div class="solar-lbl">STATUS</div></div>
                    <div class="solar-cell"><div class="solar-val" style="color:#aaa">${escHtml(timeStr)}</div><div class="solar-lbl">UTC TIME</div></div>
                </div>
                <div class="solar-level" style="color:${kpColor}">${kpLabel}</div>
            `;
        } catch(e) { hud.innerHTML = '<div class="solar-title">☀ SOLAR STORM INDEX</div><div class="solar-loading">NOAA SWPC OFFLINE</div>'; }
    };

    // ============================================================
    // ROCKET LAUNCH TRACKER (Launch Library 2 — free, CORS-enabled)
    // ============================================================
    const launchFeed = document.getElementById('launch-feed');

    const getCountdown = (net) => {
        const diff = new Date(net) - new Date();
        if (diff < 0) return '<span style="color:#0f0;">LAUNCHED</span>';
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        if (d > 0) return `<span style="color:#ff6600;">T-${d}d ${h}h</span>`;
        if (h > 0) return `<span style="color:#ffb000;">T-${h}h ${m}m</span>`;
        return `<span style="color:#ff4400;animation:pulse-ring .8s infinite;">T-${m}m &#9654;</span>`;
    };

    const getAgencyIcon = (name = '') => {
        if (/spacex/i.test(name)) return '🚀';
        if (/nasa/i.test(name)) return '🛸';
        if (/esa|ariane/i.test(name)) return '🇪🇺';
        if (/roscosmos|russia/i.test(name)) return '🛸';
        if (/isro/i.test(name)) return '🇮🇳';
        if (/cnsa|china/i.test(name)) return '🇨🇳';
        if (/rocketlab/i.test(name)) return '🔬';
        return '🛰️';
    };

    const fetchLaunches = async () => {
        if (!launchFeed) return;
        try {
            const { data } = await window.reliableFetch('https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=5&format=json', 'launches', { timeout: 8000, retries: 1 });
            const launches = data?.results || [];
            if (!launches.length) {
                launchFeed.innerHTML = '<span style="opacity:.5;">No upcoming data</span>';
                return;
            }
            launchFeed.innerHTML = launches.map(l => {
                const agency = l.launch_service_provider?.name || 'Unknown';
                const rocket = l.rocket?.configuration?.name || 'Unknown Rocket';
                const name = l.name?.split('|')[0]?.trim() || 'Classified';
                const icon = getAgencyIcon(agency);
                const countdown = getCountdown(l.net);
                const pad = l.pad?.location?.name || '';
                return `<div style="padding:4px 0;border-bottom:1px solid rgba(255,100,0,.15);font-size:.68rem;">
                    <div style="color:#ff9955;">${icon} ${escHtml(name.length > 28 ? name.slice(0,27)+'…' : name)}</div>
                    <div style="display:flex;justify-content:space-between;margin-top:2px;">
                        <span style="opacity:.8;">${escHtml(rocket)}</span>
                        ${countdown}
                    </div>
                    ${pad ? `<div style="opacity:.5;font-size:.58rem;">${escHtml(pad)}</div>` : ''}
                </div>`;
            }).join('');
        } catch(e) {
            launchFeed.innerHTML = '<span style="opacity:.4;">Launch data offline</span>';
        }
    };

    // ============================================================
    // LAUNCH HUD — show on hover over menu trigger, hide on leave
    // ============================================================
    const launchHud = document.getElementById('launch-hud');
    const launchTrigger = document.getElementById('launch-tracker-trigger');
    let launchHudTimeout = null;

    const showLaunchHud = () => {
        clearTimeout(launchHudTimeout);
        if (launchHud) {
            launchHud.style.opacity = '1';
            launchHud.style.pointerEvents = 'all';
            launchHud.style.transform = 'translateX(0)';
        }
    };
    const hideLaunchHud = () => {
        // Small delay so user can move mouse into the HUD without it closing
        launchHudTimeout = setTimeout(() => {
            if (launchHud) {
                launchHud.style.opacity = '0';
                launchHud.style.pointerEvents = 'none';
                launchHud.style.transform = 'translateX(-8px)';
            }
        }, 180);
    };

    if (launchTrigger) {
        launchTrigger.addEventListener('mouseenter', showLaunchHud);
        launchTrigger.addEventListener('mouseleave', hideLaunchHud);
    }
    if (launchHud) {
        launchHud.addEventListener('mouseenter', showLaunchHud);
        launchHud.addEventListener('mouseleave', hideLaunchHud);
    }

    // ============================================================
    // REGIME MAP — Democracy vs Autocracy (Freedom House 2024)
    // ============================================================
    const regimeMarkers = [];
    const initRegimeMap = () => {
        // [lon, lat, country, regime, fh_score, note]
        // Regime: D=Free Democracy, H=Hybrid/Partly Free, A=Authoritarian
        const countries = [
            // DEMOCRACIES (Free)
            [-77.04,38.89,'USA','D',83,'Federal republic. Electoral democracy.'],
            [-3.44,55.38,'UK','D',93,'Parliamentary monarchy.'],
            [2.35,48.85,'France','D',90,'Republic. Strong institutions.'],
            [13.38,52.52,'Germany','D',94,'Federal parliamentary republic.'],
            [12.48,41.89,'Italy','D',89,'Parliamentary republic.'],
            [2.17,41.39,'Spain','D',90,'Constitutional monarchy.'],
            [4.89,52.37,'Netherlands','D',98,'Constitutional monarchy.'],
            [18.07,59.33,'Sweden','D',100,'Constitutional monarchy.'],
            [10.75,59.91,'Norway','D',100,'Constitutional monarchy.'],
            [12.57,55.68,'Denmark','D',97,'Constitutional monarchy.'],
            [24.94,60.17,'Finland','D',100,'Republic.'],
            [-8.61,41.56,'Portugal','D',97,'Republic.'],
            [23.72,37.98,'Greece','D',85,'Republic.'],
            [19.04,47.5,'Hungary','H',57,'Competitive authoritarian (Orbán).'],
            [21.01,52.23,'Poland','D',83,'Republic, liberalizing post-2024.'],
            [14.44,50.08,'Czech Republic','D',94,'Parliamentary republic.'],
            [17.11,48.15,'Slovakia','H',72,'Populist drift under Fico.'],
            [26.1,44.44,'Romania','D',84,'Republic.'],
            [23.32,42.7,'Bulgaria','H',75,'Structural corruption issues.'],
            [16.37,48.21,'Austria','D',93,'Federal republic.'],
            [7.45,46.96,'Switzerland','D',96,'Direct democracy.'],
            [4.34,50.85,'Belgium','D',96,'Federal monarchy.'],
            [6.13,49.61,'Luxembourg','D',98,'Constitutional monarchy.'],
            [-6.27,53.33,'Ireland','D',97,'Republic.'],
            [28.05,53.9,'Belarus','A',11,'Lukashenko dictatorship since 1994.'],
            [30.52,50.45,'Ukraine','H',61,'Wartime democracy.'],
            [44.83,41.69,'Georgia','H',60,'Hybrid, GD party backsliding 2024.'],
            [49.89,40.41,'Azerbaijan','A',14,'Aliyev family dynasty.'],
            [44.51,40.18,'Armenia','H',54,'Post-revolution fragile democracy.'],
            [27.56,53.9,'Lithuania','D',93,'Baltic republic.'],
            [24.11,56.95,'Latvia','D',90,'Baltic republic.'],
            [25.27,54.69,'Estonia','D',95,'Baltic republic.'],
            [21.44,41.99,'North Macedonia','H',71,'Reforms ongoing.'],
            [19.82,41.33,'Albania','H',68,'Reforms toward EU accession.'],
            [18.42,43.86,'Bosnia','H',54,'Fractured ethnic politics.'],
            [20.46,44.80,'Serbia','H',56,'Vučić populism, media pressure.'],
            [20.93,42.66,'Kosovo','H',69,'Young democracy.'],
            [19.25,42.44,'Montenegro','H',68,'Long-ruling DPS now in opposition.'],
            [-79.38,43.65,'Canada','D',99,'Federal parliamentary democracy.'],
            [151.21,-33.87,'Australia','D',97,'Federal parliamentary democracy.'],
            [174.78,-36.87,'New Zealand','D',99,'Parliamentary democracy.'],
            [139.69,35.69,'Japan','D',96,'Constitutional monarchy.'],
            [126.98,37.57,'South Korea','D',83,'Republic.'],
            [121.5,25.05,'Taiwan','D',94,'De facto democracy.'],
            [103.82,1.35,'Singapore','H',47,'Dominant party state (PAP).'],
            [100.52,13.75,'Thailand','H',36,'Military-monitored democracy.'],
            [-70.67,-33.45,'Chile','D',94,'Republic.'],
            [-58.4,-34.6,'Argentina','D',83,'Republic.'],
            [-43.18,-22.91,'Brazil','D',79,'Federal republic.'],
            [-77.04,38.89,'Colombia','D',67,'Republic, security challenges.'],
            [-66.86,10.49,'Venezuela','A',16,'Maduro autocracy.'],
            [-77.04,-12.04,'Peru','H',70,'Democratic dysfunction.'],
            [-47.93,-15.78,'Bolivia','H',66,'Partial backsliding.'],
            // HYBRID / PARTLY FREE
            [37.61,55.75,'Russia','A',16,'Putin autocracy.'],
            [32.85,39.93,'Turkey','H',34,'Erdoğan competitive authoritarian.'],
            [51.43,35.69,'Iran','A',14,'Theocratic republic.'],
            [44.37,33.34,'Iraq','H',41,'Fragile democracy, militia influence.'],
            [35.5,38.5,'Syria','A',0,'HTS governance, post-Assad.'],
            [35.22,31.77,'Israel','D',77,'Democracy, occupation complicates.'],
            [36.81,3.24,'Ethiopia','H',22,'Authoritarian with formal elections.'],
            [3.39,6.45,'Nigeria','H',45,'Federal republic, governance issues.'],
            [31.24,30.06,'Egypt','A',23,'Al-Sisi military state.'],
            [13.51,2.12,'Niger','A',9,'Military junta 2023.'],
            [-7.99,12.36,'Guinea','A',6,'Military junta 2021.'],
            [15.5,32.5,'Sudan','A',5,'SAF/RSF military conflict state.'],
            [96.0,17.0,'Myanmar','A',5,'Military junta 2021.'],
            [48.5,37.5,'Kazakhstan','A',24,'Authoritarian, post-Nazarbayev.'],
            [69.28,41.3,'Uzbekistan','A',17,'Authoritarian.'],
            [37.88,-6.17,'Kenya','H',57,'Republic.'],
            [28.28,-25.75,'South Africa','D',79,'Constitutional republic.'],
            [31.03,-17.83,'Zimbabwe','A',27,'Mnangagwa regime.'],
            [90.41,23.81,'Bangladesh','H',40,'Sheikh Hasina overthrown 2024.'],
            [72.88,19.08,'India','D',66,'Largest democracy (backsliding noted).'],
            [74.35,30.37,'Pakistan','H',38,'Hybrid civil-military.'],
            [104.93,11.57,'Cambodia','A',24,'Hun family dynasty.'],
            [102.6,17.97,'Laos','A',14,'Single-party communist.'],
            [105.83,21.03,'Vietnam','A',20,'Single-party communist.'],
            [116.39,39.91,'China','A',9,'CCP single-party state.'],
            [125.73,39.03,'North Korea','A',3,'Kim dynasty totalitarianism.'],
            [37.62,55.75,'Russia','A',16,'Repeat'],
            [39.27,17.32,'Eritrea','A',3,'One of world\'s most closed states.'],
            [57.5,23.6,'Saudi Arabia','A',8,'Absolute monarchy.'],
            [54.37,24.47,'UAE','A',18,'Federation of monarchies.'],
            [51.53,25.29,'Qatar','A',25,'Emirate, press freedoms improving.'],
            [50.6,26.22,'Bahrain','A',13,'Absolute monarchy.'],
            [58.59,23.61,'Oman','A',20,'Absolute monarchy.'],
            [47.48,29.37,'Kuwait','H',36,'Constitutional emirate.'],
            [35.22,33.36,'Palestine','H',35,'Split: PA (WB) vs Hamas (Gaza).'],
            [55.27,25.2,'Lebanon','H',43,'Sectarian system, Hezbollah influence.'],
            [36.82,34.02,'Libya','A',9,'Split governance, militia fragmentation.'],
            [32.5,14.0,'Algeria','A',34,'Military-guided state.'],
            [9.54,33.89,'Tunisia','A',37,'Saied dismantled democracy 2021.'],
            [4.0,13.51,'Cameroon','A',24,'Biya 40-year rule.'],
            [29.36,-1.0,'DR Congo','A',20,'Fragile state.'],
            [30.06,-1.94,'Rwanda','A',22,'Kagame authoritarian.'],
            [85.32,27.72,'Nepal','D',69,'Federal republic.'],
            [80.0,7.87,'Sri Lanka','H',56,'Democratic recovery post-crisis.'],
            [46.86,-11.7,'Madagascar','A',37,'Political instability.'],
            [-4.01,5.36,'Ivory Coast','H',49,'Electoral reforms ongoing.'],
        ];

        const col = { D:'#3399ff', H:'#ffb000', A:'#ff3300' };
        const label = { D:'DEMOCRACY', H:'HYBRID / PARTLY FREE', A:'AUTHORITARIAN' };
        const fh = { D:'Free', H:'Partly Free', A:'Not Free' };

        countries.forEach(([lon, lat, country, regime, score, note]) => {
            const c = col[regime] || '#888';
            const el = document.createElement('div');
            el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${c};cursor:pointer;opacity:0.85;border:1px solid ${c}88;`;
            el.style.filter = `drop-shadow(0 0 3px ${c})`;
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '260px' }).setHTML(`
                <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                <h3 style="color:${c};margin:0 0 5px;border-bottom:1px solid ${c}44;padding-bottom:4px;">${country}</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;">
                    <div style="background:${c}11;padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">REGIME</div><div style="color:${c};font-size:.7rem;">${label[regime]}</div></div>
                    <div style="background:${c}11;padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">STATUS</div><div style="font-size:.7rem;">${fh[regime]}</div></div>
                </div>
                <div style="margin-bottom:4px;"><span style="opacity:.5;font-size:.6rem;">FREEDOM HOUSE SCORE: </span><strong style="color:${c};">${score}/100</strong></div>
                <div style="font-size:.65rem;opacity:.7;line-height:1.4;">${note}</div>
                <div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: Freedom House 2024</div>
                </div>`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([lon, lat]).setPopup(popup);
            regimeMarkers.push(m);
            if (toggles.regimes) m.addTo(map);
        });
    };

    // ============================================================
    // GEOPOLITICAL BLOCS — NATO / BRICS / SCO / AUKUS / Neutral
    // ============================================================
    const blocMarkers = [];
    // Capital + population lookup for bloc popup enrichment
    const COUNTRY_META = {
        'USA':            { cap: 'Washington D.C.', pop: '334M' },
        'UK':             { cap: 'London',          pop: '68M'  },
        'France':         { cap: 'Paris',           pop: '68M'  },
        'Germany':        { cap: 'Berlin',          pop: '84M'  },
        'Italy':          { cap: 'Rome',            pop: '59M'  },
        'Spain':          { cap: 'Madrid',          pop: '48M'  },
        'Netherlands':    { cap: 'Amsterdam',       pop: '18M'  },
        'Sweden':         { cap: 'Stockholm',       pop: '10M'  },
        'Finland':        { cap: 'Helsinki',        pop: '5.6M' },
        'Denmark':        { cap: 'Copenhagen',      pop: '5.9M' },
        'Norway':         { cap: 'Oslo',            pop: '5.5M' },
        'Portugal':       { cap: 'Lisbon',          pop: '10M'  },
        'Ireland':        { cap: 'Dublin',          pop: '5.1M' },
        'Hungary':        { cap: 'Budapest',        pop: '10M'  },
        'Poland':         { cap: 'Warsaw',          pop: '38M'  },
        'Czech Republic': { cap: 'Prague',          pop: '11M'  },
        'Slovakia':       { cap: 'Bratislava',      pop: '5.4M' },
        'Romania':        { cap: 'Bucharest',       pop: '19M'  },
        'Bulgaria':       { cap: 'Sofia',           pop: '6.5M' },
        'Austria':        { cap: 'Vienna',          pop: '9.1M' },
        'Lithuania':      { cap: 'Vilnius',         pop: '2.8M' },
        'Latvia':         { cap: 'Riga',            pop: '1.8M' },
        'Estonia':        { cap: 'Tallinn',         pop: '1.3M' },
        'Canada':         { cap: 'Ottawa',          pop: '40M'  },
        'Australia':      { cap: 'Canberra',        pop: '26M'  },
        'New Zealand':    { cap: 'Wellington',       pop: '5.2M' },
        'Japan':          { cap: 'Tokyo',           pop: '124M' },
        'South Korea':    { cap: 'Seoul',           pop: '52M'  },
        'Turkey':         { cap: 'Ankara',          pop: '85M'  },
        'Greece':         { cap: 'Athens',          pop: '10M'  },
        'Albania':        { cap: 'Tirana',          pop: '2.8M' },
        'Montenegro':     { cap: 'Podgorica',       pop: '0.6M' },
        'North Macedonia':{ cap: 'Skopje',          pop: '1.8M' },
        'Russia':         { cap: 'Moscow',          pop: '144M' },
        'China':          { cap: 'Beijing',         pop: '1,425M'},
        'Brazil':         { cap: 'Brasília',        pop: '216M' },
        'India':          { cap: 'New Delhi',       pop: '1,442M'},
        'South Africa':   { cap: 'Pretoria',        pop: '60M'  },
        'Iran':           { cap: 'Tehran',          pop: '88M'  },
        'Egypt':          { cap: 'Cairo',           pop: '111M' },
        'Ethiopia':       { cap: 'Addis Ababa',     pop: '126M' },
        'UAE':            { cap: 'Abu Dhabi',       pop: '10M'  },
        'Uzbekistan':     { cap: 'Tashkent',        pop: '35M'  },
        'Pakistan':       { cap: 'Islamabad',       pop: '231M' },
        'Kazakhstan':     { cap: 'Astana',          pop: '20M'  },
        'Kyrgyzstan':     { cap: 'Bishkek',         pop: '7M'   },
        'Tajikistan':     { cap: 'Dushanbe',        pop: '10M'  },
        'Nepal':          { cap: 'Kathmandu',       pop: '30M'  },
        'Switzerland':    { cap: 'Bern',            pop: '8.8M' },
        'Mexico':         { cap: 'Mexico City',     pop: '129M' }
    };
    const initGeoBlocs = () => {
        // [lon, lat, country, bloc, since, note]
        const blocs = [
            // NATO (29 + 2 members as of 2024)
            [-77.04,38.89,'USA','NATO',1949,'Founding member. Largest contributor.'],
            [-3.44,55.38,'UK','NATO',1949,'Nuclear power, P5 member.'],
            [2.35,48.85,'France','NATO',1949,'Nuclear power, rejoined integrated command 2009.'],
            [13.38,52.52,'Germany','NATO',1955,'Largest non-nuclear European economy.'],
            [12.48,41.89,'Italy','NATO',1949,'Founding member. US bases (Aviano, Sigonella).'],
            [2.17,41.39,'Spain','NATO',1982,''],
            [4.89,52.37,'Netherlands','NATO',1949,'Founding member. US nuclear sharing.'],
            [18.07,59.33,'Sweden','NATO',2024,'Joined Mar 2024 (Russia\'s war triggered decision).'],
            [24.94,60.17,'Finland','NATO',2023,'Joined Apr 2023. 1,300km Russia border.'],
            [12.57,55.68,'Denmark','NATO',1949,'Founding member. Greenland key.'],
            [10.75,59.91,'Norway','NATO',1949,'Russia border. Svalbard strategic.'],
            [-8.61,41.56,'Portugal','NATO',1949,'Founding member. Azores strategic.'],
            [-6.27,53.33,'Ireland','NATO',0,'NEUTRAL — EU member, not NATO.'],
            [19.04,47.5,'Hungary','NATO',1999,'Orbán blocks Ukraine aid frequently.'],
            [21.01,52.23,'Poland','NATO',1999,'Largest NATO military buildup in Europe.'],
            [14.44,50.08,'Czech Republic','NATO',1999,''],
            [17.11,48.15,'Slovakia','NATO',1999,''],
            [26.1,44.44,'Romania','NATO',2004,'US Aegis Ashore missile defense site.'],
            [23.32,42.7,'Bulgaria','NATO',2004,''],
            [16.37,48.21,'Austria','NATO',0,'NEUTRAL — Constitutional neutrality.'],
            [27.56,53.9,'Lithuania','NATO',2004,'Russia Kaliningrad border.'],
            [24.11,56.95,'Latvia','NATO',2004,''],
            [25.27,54.69,'Estonia','NATO',2004,''],
            [-79.38,43.65,'Canada','NATO',1949,'Founding member. NORAD.'],
            [151.21,-33.87,'Australia','NATO',0,'AUKUS (not NATO). US-UK-AU pact.'],
            [174.78,-36.87,'New Zealand','NATO',0,'Five Eyes. Not AUKUS.'],
            [139.69,35.69,'Japan','NATO',0,'US alliance. Not NATO but quasi-allied.'],
            [126.98,37.57,'South Korea','NATO',0,'US alliance. Not NATO.'],
            [32.85,39.93,'Turkey','NATO',1952,'Member but complex — S-400, vetoes.'],
            [23.72,37.98,'Greece','NATO',1952,''],
            [19.82,41.33,'Albania','NATO',2009,''],
            [19.25,42.44,'Montenegro','NATO',2017,''],
            [21.44,41.99,'North Macedonia','NATO',2020,''],
            // BRICS
            [37.61,55.75,'Russia','BRICS',2006,'Founding. Sanctioned. War in Ukraine.'],
            [116.39,39.91,'China','BRICS',2006,'Founding. World\'s 2nd economy.'],
            [-47.93,-15.78,'Brazil','BRICS',2006,'Founding. Largest LatAm economy. Lula.'],
            [72.88,19.08,'India','BRICS',2006,'Founding. Largest democracy. Non-aligned.'],
            [28.28,-25.75,'South Africa','BRICS',2010,'Only African founding member.'],
            [51.43,35.69,'Iran','BRICS',2024,'Joined Jan 2024. Sanctioned.'],
            [31.24,30.06,'Egypt','BRICS',2024,'Joined Jan 2024.'],
            [24.68,59.44,'Ethiopia','BRICS',2024,'Joined Jan 2024.'],
            [54.37,24.47,'UAE','BRICS',2024,'Joined 2024. Hedging strategy.'],
            // SCO (Shanghai Cooperation Organisation)
            [69.28,41.3,'Uzbekistan','SCO',2001,''],
            [74.35,30.37,'Pakistan','SCO',2017,''],
            [71.43,51.18,'Kazakhstan','SCO',2001,''],
            [74.6,42.87,'Kyrgyzstan','SCO',2001,''],
            [68.75,38.56,'Tajikistan','SCO',2001,''],
            [85.32,27.72,'Nepal','SCO',0,'Observer.'],
            // AUKUS
            [133.77,-25.27,'Australia','AUKUS',2021,'Nuclear submarine tech transfer.'],
            // Core neutrals
            [7.45,46.96,'Switzerland','NEUTRAL',0,'Traditional armed neutrality.'],
            [19.04,47.5,'Hungary','NATO',1999,'See NATO entry'],
            [-106.34,23.63,'Mexico','NEUTRAL',0,'Non-aligned. US relations complex.'],
            [88.37,22.57,'India','NEUTRAL',0,'Strategic autonomy. SCO + BRICS + Quad.'],
        ];

        const cols = { NATO:'#4488ff', BRICS:'#ff4400', SCO:'#ff8800', AUKUS:'#00ffcc', NEUTRAL:'#888888' };
        blocs.forEach(([lon, lat, country, bloc, since, note]) => {
            const c = cols[bloc] || '#888';
            const el = document.createElement('div');
            const size = bloc === 'NEUTRAL' ? '7px' : '10px';
            el.style.cssText = `width:${size};height:${size};border-radius:50%;background:transparent;border:2px solid ${c};cursor:pointer;`;
            el.style.filter = `drop-shadow(0 0 3px ${c})`;
            const meta = COUNTRY_META[country];
            const capLabel = currentLang === 'de' ? 'HAUPTSTADT' : 'CAPITAL';
            const popLabel = currentLang === 'de' ? 'BEVÖLKERUNG' : 'POPULATION';
            const sinceLabel = currentLang === 'de' ? `Mitglied seit ${since}` : `Member since ${since}`;
            const nonLabel = currentLang === 'de' ? 'Kein Mitglied' : 'Non-member';
            const metaRow = meta ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;">
                <div style="background:rgba(255,255,255,.04);padding:3px 6px;">
                    <div style="opacity:.45;font-size:.55rem;">${capLabel}</div>
                    <div style="color:#fff;font-size:.7rem;">${meta.cap}</div>
                </div>
                <div style="background:rgba(255,255,255,.04);padding:3px 6px;">
                    <div style="opacity:.45;font-size:.55rem;">${popLabel}</div>
                    <div style="color:#fff;font-size:.7rem;">${meta.pop}</div>
                </div>
            </div>` : '';
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '260px' }).setHTML(`
                <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                <h3 style="color:${c};margin:0 0 5px;border-bottom:1px solid ${c}44;padding-bottom:3px;">${country}</h3>
                ${metaRow}
                <div style="background:${c}22;padding:4px 7px;border-left:2px solid ${c};margin-bottom:5px;">
                    <strong>${bloc}</strong>${since ? ` &mdash; ${sinceLabel}` : ` &mdash; ${nonLabel}`}
                </div>
                <div style="font-size:.65rem;opacity:.75;">${note || (currentLang === 'de' ? 'Keine weiteren Daten.' : 'No additional data.')}</div>
                </div>`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([lon, lat]).setPopup(popup);
            blocMarkers.push(m);
            if (toggles.blocs) m.addTo(map);
        });
    };

    // ============================================================
    // UNDERSEA CABLES — Major global submarine cable routes
    // Simplified polylines for the ~20 most strategic cable systems
    // ============================================================
    const initUnderseaCables = () => {
        // Ocean-routed submarine cable coordinates
        // All paths verified to stay in open water / hug coastlines
        // Red Sea routing: Med → Port Said [32.3,31] → Red Sea → Bab el-Mandeb [43,11.5]
        const cables = [
            // ── ATLANTIC ─────────────────────────────────────────────────────
            { name: 'TAT-14 (Transatlantic)', color: '#00ccff',
              capacity: '3.2 Tbps', year: 2001, length: '15,428 km', owner: 'KPN / Sprint / Deutsche Telekom',
              coords: [[-74,40],[-55,44],[-30,47],[-15,50],[-8,52],[-5,50],[1,51]] },
            { name: 'MAREA (Microsoft/Facebook)', color: '#44aaff',
              capacity: '160 Tbps', year: 2017, length: '6,600 km', owner: 'Microsoft / Meta',
              coords: [[-74,40.7],[-45,40],[-20,40],[-8.6,41.5]] },
            { name: 'DUNANT (Google)', color: '#44aaff',
              capacity: '250 Tbps', year: 2021, length: '6,600 km', owner: 'Google LLC',
              coords: [[-81,24.5],[-60,27],[-30,30],[-10,35],[-8.6,43.5]] },
            { name: 'Grace Hopper (Google)', color: '#8888ff',
              capacity: '340 Tbps', year: 2022, length: '5,950 km', owner: 'Google LLC',
              coords: [[-74,40.7],[-40,42],[-15,48],[-8.6,43.5],[-8.6,51.5]] },
            { name: 'Havfrue / AEC (Amazon)', color: '#6699ff',
              capacity: '345 Tbps', year: 2020, length: '8,742 km', owner: 'Amazon / Google / Meta',
              coords: [[-71,42],[-45,44],[-20,47],[-5,51],[1,51],[5.5,58.7],[10.7,55.7]] },
            { name: 'South Atlantic (SACS)', color: '#ff4444',
              capacity: '40 Gbps', year: 2000, length: '7,250 km', owner: 'Angola Portugal consortium',
              coords: [[-8.8,38.7],[-20,-15],[-35,-22],[-43,-22.9]] },
            // ── EUROPE / MED → INDIAN OCEAN via Suez ─────────────────────────
            { name: 'SEA-ME-WE 3', color: '#ff00cc',
              capacity: '960 Gbps', year: 1999, length: '39,000 km', owner: '92-nation consortium',
              coords: [
                [2,51],[-5,36],[12,37],[16,38],[25,35],[31,32],
                [32.3,31.2],[32.5,29.9],
                [36.5,22],[38,16],[42.5,12],[43.5,11.5],
                [50,11],[57,22],[67,24],[72,20],[80,7],[98,3],[104,1.3],
                [109,3],[121,14],[126,37],[135,34],[140,35]
              ] },
            { name: 'FLAG (Fibre Link Around Globe)', color: '#ffff00',
              capacity: '10 Gbps', year: 1997, length: '27,300 km', owner: 'FLAG Telecom',
              coords: [
                [1,51],[12,37],[25,35],[31,32],
                [32.3,31.2],[32.5,29.9],[38,16],[43.5,11.5],
                [50,11],[57,22],[72,20],[80,6],[104,1.3],[121,24],[140,36]
              ] },
            { name: 'PEACE Cable', color: '#ff6600',
              capacity: '60 Tbps', year: 2022, length: '15,000 km', owner: 'PEACE Cable International',
              coords: [
                [-7,53],[-9,39],[-5,36],[12,37],[25,35],[31,32],
                [32.3,31.2],[32.5,29.9],[38,16],[43.5,11.5],
                [50,11],[57,22],[67,24],[80,21],[104,1],[120,22]
              ] },
            { name: 'AA-1 (Asia-Africa)', color: '#ffaa00',
              capacity: '100 Tbps', year: 2020, length: '25,000 km', owner: 'Alcatel / consortium',
              coords: [
                [31,32],[32.3,31.2],[32.5,29.9],[38,16],[43.5,11.5],
                [50,11],[57,22],[67,24],[80,21],[104,1],[121,25]
              ] },
            // ── AFRICA COASTS ────────────────────────────────────────────────
            { name: 'SAT-3 / WASC (Africa West)', color: '#ff8800',
              capacity: '120 Gbps', year: 2002, length: '14,350 km', owner: 'West African consortium',
              coords: [
                [-8.7,41.7],[-9,39],[-13,25],[-17,14.5],[-17.5,13],
                [-17,12],[-15,9],[-5,5],[0,4.5],[8.5,4],[10,3.5],
                [9.5,4],[12,-5],[12,-8],[12,-15],[13,-23],[17,-28],[18,-34]
              ] },
            { name: 'SEACOM (Africa East)', color: '#ff8800',
              capacity: '1.28 Tbps', year: 2009, length: '17,000 km', owner: 'Seacom Ltd',
              coords: [
                [18,-34],[27,-30],[33,-26],[36,-20],[40,-11],
                [40,-5],[41,2],[43.5,11.5],[50,11],[51,20],[57,21],[58,23],[72,20]
              ] },
            // ── TRANS-PACIFIC ─── extended lon: 140°E=-220, 130°E=-230, 121°E=-239
            { name: 'Trans-Pacific (TPE)', color: '#00ff88',
              capacity: '17.7 Tbps', year: 2016, length: '17,700 km', owner: 'Asia-Pacific Telecom consortium',
              coords: [[-118,34],[-130,30],[-145,23],[-157,20],[-170,8],[-178,5],
                       [-200,8],[-216,13],[-220,34],[-230,35],[-234,37],[-239,26],[-240,22]] },
            { name: 'FASTER (Google Trans-Pacific)', color: '#00ff88',
              capacity: '60 Tbps', year: 2016, length: '9,000 km', owner: 'Google / SoftBank / China Mobile',
              coords: [[-122,38],[-140,29],[-157,21],[-175,15],[-200,18],[-215,33],[-220,36],[-240,27]] },
            { name: 'Jupiter (Google)', color: '#55ddaa',
              capacity: '60 Tbps', year: 2020, length: '14,557 km', owner: 'Google / PLDT / SoftBank',
              coords: [[-121,38],[-140,30],[-157,21],[-175,15],[-200,14],[-215,32],[-220,34],[-228,37]] },
            // ── PACIFIC ─────────────────────────────────────────────────────
            { name: 'SJC (South Japan Cable)', color: '#88ff88',
              capacity: '2.56 Tbps', year: 2009, length: '8,900 km', owner: 'SJC consortium',
              coords: [[104,1.3],[110,3],[121,25],[126,26],[128,26],[132,34],[137,35],[140,35]] },
            // ── ARCTIC / POLAR ───────────────────────────────────────────────
            { name: 'Arctic Fibre', color: '#aaaaff',
              capacity: '160 Tbps (planned)', year: 2025, length: '15,600 km', owner: 'Far North Digital',
              coords: [[17,69],[5,62],[0,60],[-5,58],[-30,64],[-55,67],
                [-75,72],[-90,71],[-100,70],[-120,68]] },
            // ── RUSSIA-JAPAN ─────────────────────────────────────────────────
            { name: 'Russia-Japan (RJCN)', color: '#ff8888',
              capacity: '640 Gbps', year: 2013, length: '1,520 km', owner: 'KDDI / RTComm.RU',
              coords: [[132,43],[134,43],[136,40],[138,38],[140,36],[140.5,35],[141,35]] },
            // ── ADDITIONAL MAJOR CABLES ────────────────────────────────
            { name: '2Africa (Meta)', color: '#ff44ff',
              capacity: '180 Tbps', year: 2024, length: '45,000 km', owner: 'Meta / Vodafone / Orange / MTN',
              coords: [
                [-8,37],[-15,28],[-17,15],[-17,12],[-15,9],[-5,5],[0,4.5],[8.5,4],[12,-5],
                [12,-15],[13,-23],[18,-34],[27,-30],[36,-20],[40,-11],[43.5,11.5],
                [50,11],[57,22],[67,24],[72,20],[80,6],[104,1],[121,24]
              ] },
            { name: 'Equiano (Google Africa)', color: '#00dd88',
              capacity: '144 Tbps', year: 2024, length: '12,000 km', owner: 'Google LLC',
              coords: [[-8.6,39],[-15,28],[-17,15],[-15,9],[-5,5],[0,4.5],[8.5,4],[12,-5],[12,-15],[13,-23],[18,-34]] },
            { name: 'EIG (Europe-India Gateway)', color: '#cc88ff',
              capacity: '3.84 Tbps', year: 2011, length: '15,000 km', owner: 'EIG Consortium',
              coords: [
                [1,51],[-5,36],[12,37],[25,35],[31,32],[32.3,31.2],[32.5,29.9],
                [38,16],[43.5,11.5],[50,11],[57,22],[67,24],[72,20]
              ] },
            { name: 'AAE-1 (Asia-Africa-Europe)', color: '#ff88aa',
              capacity: '40 Tbps', year: 2017, length: '25,000 km', owner: 'AAE-1 Consortium',
              coords: [
                [-7,53],[-5,36],[12,37],[25,35],[31,32],[32.3,31.2],[32.5,29.9],
                [38,16],[43.5,11.5],[50,11],[57,22],[67,24],[72,20],[80,7],[98,3],[104,1.3]
              ] },
            { name: 'Apricot (Google/Meta APAC)', color: '#44ddaa',
              capacity: '190 Tbps', year: 2024, length: '12,000 km', owner: 'Google / Meta / NTT',
              coords: [[140,35],[130,30],[121,25],[118,14],[110,3],[104,1.3]] },
        ];

        const geojson = {
            type: 'FeatureCollection',
            features: cables.map(c => ({
                type: 'Feature',
                properties: { name: c.name, color: c.color, capacity: c.capacity, year: c.year, length: c.length, owner: c.owner },
                geometry: { type: 'LineString', coordinates: c.coords }
            }))
        };

        map.addSource('cables-src', { type: 'geojson', data: geojson });
        map.addLayer({
            id: 'cables-layer',
            type: 'line',
            source: 'cables-src',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 1.5,
                'line-opacity': 0.75
            }
        });

        // Popup on cable click — shows capacity, owner, year, length
        map.on('click', 'cables-layer', (e) => {
            const { name, color, capacity, year, length, owner } = e.features[0].properties;
            new maplibregl.Popup({ maxWidth: '270px' })
                .setLngLat(e.lngLat)
                .setHTML(`<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                    <h3 style="color:${color};margin:0 0 8px;border-bottom:1px solid ${color}44;padding-bottom:5px;">🔌 ${name}</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="opacity:.5;padding:2px 0;">CAPACITY</td><td style="color:${color};font-weight:bold;text-align:right;">${capacity || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">LENGTH</td><td style="color:#ccc;text-align:right;">${length || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">ACTIVE SINCE</td><td style="color:#ccc;text-align:right;">${year || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">OWNER</td><td style="color:#aaa;text-align:right;font-size:.65rem;">${owner || 'Consortium'}</td></tr>
                    </table>
                    <div style="font-size:.57rem;opacity:.35;margin-top:6px;">Source: TeleGeography SubmarineCableMap 2024</div>
                </div>`)
                .addTo(map);
        });
        map.on('mouseenter', 'cables-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'cables-layer', () => { map.getCanvas().style.cursor = ''; });
    };

    // ============================================================
    // ENERGY PIPELINES — Major oil & gas pipelines (curated dataset)
    // ============================================================
    const initPipelines = () => {
        const pipelines = [
            // ── EUROPEAN GAS ───────────────────────────────────────────
            { name: 'Nord Stream 1 & 2 (destroyed)', color: '#ff4444', type: 'Gas',
              capacity: '110 bcm/yr (before sabotage)', year: '2011/2021', length: '1,224 km', status: 'Destroyed Sept 2022',
              coords: [[30.1,59.9],[27,59],[22,57],[18,56],[14,55],[12.1,54.1]] },
            { name: 'TurkStream', color: '#ff8800', type: 'Gas',
              capacity: '31.5 bcm/yr', year: 2020, length: '930 km', status: 'Active',
              coords: [[37.8,44.6],[35,43],[31,42],[29,41.5],[28.5,41.2]] },
            { name: 'Yamal–Europe', color: '#ffaa00', type: 'Gas',
              capacity: '33 bcm/yr', year: 1999, length: '4,107 km', status: 'Reduced flow',
              coords: [[68,66],[60,62],[50,56],[40,53],[30,52],[23,52],[18,52],[14,52]] },
            { name: 'Druzhba (Friendship) Oil', color: '#cc6600', type: 'Oil',
              capacity: '1.2 mbl/day', year: 1964, length: '5,500 km', status: 'Active (southern branch)',
              coords: [[52,54],[45,53],[38,52],[32,52],[28,51],[24,52],[20,50],[18,49],[14,49]] },
            { name: 'TAP (Trans-Adriatic)', color: '#44aaff', type: 'Gas',
              capacity: '10 bcm/yr', year: 2020, length: '878 km', status: 'Active',
              coords: [[28.5,41],[25,41],[22,40.5],[20.5,40],[20,40.2],[18.5,40.8]] },
            { name: 'TANAP (Trans-Anatolian)', color: '#44aaff', type: 'Gas',
              capacity: '16 bcm/yr', year: 2018, length: '1,850 km', status: 'Active',
              coords: [[43.4,40.2],[40,39.5],[37,38],[34,38],[32,39],[29,40],[28.5,41]] },
            { name: 'BTC (Baku–Tbilisi–Ceyhan) Oil', color: '#ff6600', type: 'Oil',
              capacity: '1.2 mbl/day', year: 2006, length: '1,768 km', status: 'Active',
              coords: [[49.9,40.4],[48,40.5],[45,41.5],[44,41.7],[42,39],[37,37],[36,36.5]] },
            { name: 'Blue Stream', color: '#6688ff', type: 'Gas',
              capacity: '16 bcm/yr', year: 2005, length: '1,213 km', status: 'Active',
              coords: [[37.8,44.6],[36,43.5],[34,42],[32,41.5],[30,41.5],[29,41.2]] },
            { name: 'Nord Stream backup via LNG terminals', color: '#aaaaaa', type: 'LNG',
              capacity: 'Various', year: 2022, length: 'Multiple', status: 'Active — EU diversification',
              coords: [[-5.5,36],[0,42],[3,51],[5,53],[8,54],[10,54.5],[13,54.5]] },
            // ── MIDDLE EAST / CENTRAL ASIA ─────────────────────────────
            { name: 'East–West (Saudi Petroline) Oil', color: '#cc0000', type: 'Oil',
              capacity: '5 mbl/day', year: 1981, length: '1,200 km', status: 'Active',
              coords: [[50.1,26.3],[48,25],[46,24.5],[44,24],[42,24],[40,24],[39,21.5]] },
            { name: 'TAPI (Turkmenistan–Afghanistan–Pakistan–India)', color: '#ffcc00', type: 'Gas',
              capacity: '33 bcm/yr (planned)', year: 'Under construction', length: '1,814 km', status: 'Planned/Construction',
              coords: [[62,38],[63,35],[65,33],[67,30],[68,27],[69,25]] },
            { name: 'Iran–Turkey Gas', color: '#ff5500', type: 'Gas',
              capacity: '10 bcm/yr', year: 2001, length: '2,577 km', status: 'Active',
              coords: [[52,33],[48,36],[45,38],[43,39.5],[40,39.5]] },
            // ── AFRICA ────────────────────────────────────────────────
            { name: 'Trans-Saharan Gas (NIGAL)', color: '#ffdd00', type: 'Gas',
              capacity: '30 bcm/yr (planned)', year: 'Planned', length: '4,128 km', status: 'Planned — Nigeria→Algeria→Europe',
              coords: [[3,6.5],[5,10],[4,15],[3,20],[3,25],[2,30],[2,35],[1,36]] },
            { name: 'Sumed (Egypt) Oil', color: '#cc3300', type: 'Oil',
              capacity: '2.5 mbl/day', year: 1977, length: '320 km', status: 'Active — bypasses Suez Canal',
              coords: [[33.8,28.7],[32.5,29.5],[31.2,30.5],[29.9,31]] },
            // ── AMERICAS ──────────────────────────────────────────────
            { name: 'Keystone XL (Cancelled) + Keystone', color: '#886600', type: 'Oil',
              capacity: '0.59 mbl/day (Keystone)', year: 2010, length: '3,462 km', status: 'Keystone active; XL cancelled 2021',
              coords: [[-110,52],[-108,49],[-104,46],[-100,43],[-98,40],[-97,37],[-97,30]] },
            { name: 'Trans-Alaska (TAPS) Oil', color: '#995500', type: 'Oil',
              capacity: '0.5 mbl/day', year: 1977, length: '1,288 km', status: 'Active — declining throughput',
              coords: [[-148,70],[-147,67],[-146,64],[-146,62],[-147,61]] },
            // ── RUSSIA / ASIA ─────────────────────────────────────────
            { name: 'Power of Siberia (Russia→China)', color: '#ff2222', type: 'Gas',
              capacity: '38 bcm/yr', year: 2019, length: '3,000 km', status: 'Active — ramping up',
              coords: [[130,62],[128,55],[127,50],[126,48],[128,47],[130,46]] },
            { name: 'ESPO (East Siberia–Pacific Ocean) Oil', color: '#cc4400', type: 'Oil',
              capacity: '1.6 mbl/day', year: 2012, length: '4,857 km', status: 'Active — main Russia→China/Japan oil route',
              coords: [[105,56],[110,53],[115,51],[120,50],[125,48],[130,47],[132,43]] },
            { name: 'Central Asia–China Gas', color: '#ddaa00', type: 'Gas',
              capacity: '55 bcm/yr', year: 2009, length: '1,833 km', status: 'Active — via Turkmenistan/Uzbekistan/Kazakhstan',
              coords: [[62,38],[65,40],[68,41],[72,41],[75,42],[80,44]] },
        ];

        const geojson = {
            type: 'FeatureCollection',
            features: pipelines.map(p => ({
                type: 'Feature',
                properties: { name: p.name, color: p.color, type: p.type, capacity: p.capacity, year: p.year, length: p.length, status: p.status },
                geometry: { type: 'LineString', coordinates: p.coords }
            }))
        };

        map.addSource('pipelines-src', { type: 'geojson', data: geojson });
        map.addLayer({
            id: 'pipelines-layer',
            type: 'line',
            source: 'pipelines-src',
            layout: { visibility: 'none', 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 2.5,
                'line-opacity': 0.8,
                'line-dasharray': [4, 2]
            }
        });

        // Popup on pipeline click
        map.on('click', 'pipelines-layer', (e) => {
            const { name, color, type, capacity, year, length, status } = e.features[0].properties;
            const icon = type === 'Oil' ? '🛢️' : type === 'LNG' ? '🚢' : '🔥';
            new maplibregl.Popup({ maxWidth: '280px' })
                .setLngLat(e.lngLat)
                .setHTML(`<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                    <h3 style="color:${color};margin:0 0 8px;border-bottom:1px solid ${color}44;padding-bottom:5px;">${icon} ${name}</h3>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="opacity:.5;padding:2px 0;">TYPE</td><td style="color:${color};font-weight:bold;text-align:right;">${type}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">CAPACITY</td><td style="color:#ccc;text-align:right;">${capacity || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">LENGTH</td><td style="color:#ccc;text-align:right;">${length || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">COMMISSIONED</td><td style="color:#ccc;text-align:right;">${year || 'N/A'}</td></tr>
                        <tr><td style="opacity:.5;padding:2px 0;">STATUS</td><td style="color:${status?.includes('Destroyed') || status?.includes('Cancelled') ? '#ff4444' : '#88ff88'};text-align:right;font-size:.65rem;">${status || 'Active'}</td></tr>
                    </table>
                    <div style="font-size:.57rem;opacity:.35;margin-top:6px;">Source: IEA / GIE / US EIA 2025</div>
                </div>`)
                .addTo(map);
        });
        map.on('mouseenter', 'pipelines-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'pipelines-layer', () => { map.getCanvas().style.cursor = ''; });
    };

    // Pipeline toggle handler
    document.getElementById('toggle-pipelines')?.addEventListener('change', (e) => {
        toggles.pipelines = e.target.checked;
        if (toggles.pipelines && !map.getSource('pipelines-src')) initPipelines();
        if (map.getLayer('pipelines-layer'))
            map.setLayoutProperty('pipelines-layer', 'visibility', toggles.pipelines ? 'visible' : 'none');
    });

    // ============================================================
    // DATA CENTERS — Hyperscale cloud regions (AWS/Google/Azure/etc)
    // ============================================================
    const dcMarkers = [];
    const initDataCenters = () => {
        const dcs = [
            // [lon, lat, name, provider, tier, note]
            [-77.49,38.99,'US-East (N.Virginia)','AWS + Azure + Google','Tier 1','Largest cloud hub globally. Both AWS us-east-1 and Azure East US.'],
            [-87.63,41.88,'US-Central (Chicago)','AWS + Azure','Tier 1','Major US inland hub.'],
            [-118.24,34.05,'US-West (Los Angeles)','AWS + Azure + Google','Tier 1','West Coast hub.'],
            [-122.33,47.61,'US-West-2 (Seattle/Oregon)','AWS + Google','Tier 1','Amazon HQ + large Google campus.'],
            [-47.93,-15.78,'Brazil (São Paulo)','AWS + Azure + Google','Tier 1','Largest LatAm cloud hub.'],
            [-3.7,40.42,'Europe (Spain/Madrid)','AWS + Azure + Google','Tier 1','Growing Southern Europe hub.'],
            [2.35,48.85,'Europe (Paris)','AWS + Azure + Google','Tier 1','French sovereign cloud priority.'],
            [13.38,52.52,'Europe (Germany/Frankfurt)','AWS + Azure + Google','Tier 1','Europe data sovereignty hub.'],
            [-0.13,51.51,'Europe (UK/London)','AWS + Azure + Google','Tier 1','Largest European DC market.'],
            [18.07,59.33,'Nordics (Stockholm)','AWS + Google','Tier 2','Arctic cooling advantage.'],
            [24.94,60.17,'Nordics (Finland)','Google','Tier 2','Google carbon-neutral arctic DC.'],
            [28.95,41.01,'Middle East (Istanbul)','AWS + Azure','Tier 2','Bridge to MENA region.'],
            [55.27,25.2,'Middle East (Dubai/UAE)','AWS + Azure + Google','Tier 1','MENA hub. Hyperscale boom.'],
            [51.53,25.29,'Middle East (Qatar/Doha)','Azure + Google','Tier 2','Sovereign cloud for Gulf states.'],
            [39.19,21.49,'Middle East (KSA/Riyadh)','AWS + Azure + Google','Tier 1','Vision 2030 digital hub.'],
            [31.24,30.06,'Africa (Cairo/Egypt)','AWS + Azure','Tier 2','North Africa hub.'],
            [28.28,-25.75,'Africa (Johannesburg)','AWS + Azure + Google','Tier 2','Sub-Saharan Africa primary hub.'],
            [3.39,6.45,'Africa (Nigeria/Lagos)','Google + Azure','Tier 3','Emerging hub for West Africa.'],
            [72.88,19.08,'South Asia (Mumbai)','AWS + Azure + Google','Tier 1','India\'s primary cloud hub.'],
            [77.21,28.66,'South Asia (Delhi)','AWS + Azure + Google','Tier 1','India secondary hub.'],
            [80.28,13.09,'South Asia (Chennai)','AWS + Azure','Tier 2','India South DC cluster.'],
            [88.37,22.57,'South Asia (Kolkata)','AWS','Tier 3','Emerging region.'],
            [90.41,23.81,'South Asia (Dhaka)','Azure','Tier 3','New addition.'],
            [67.09,24.86,'South Asia (Karachi)','Azure','Tier 3','Pakistan emerging.'],
            [103.82,1.35,'Southeast Asia (Singapore)','AWS + Azure + Google + Meta','Tier 1','APAC data hub. Major peering point.'],
            [106.85,-6.21,'Southeast Asia (Jakarta)','AWS + Azure + Google','Tier 2','Indonesia 270M users.'],
            [100.52,13.75,'Southeast Asia (Bangkok)','AWS + Azure + Google','Tier 2','Thailand expansion.'],
            [101.69,3.16,'Southeast Asia (Malaysia)','AWS + Azure + Google','Tier 2','Johor DC boom 2024-25.'],
            [121.5,25.05,'East Asia (Taipei)','AWS + Google + Azure','Tier 2','Taiwan DC cluster.'],
            [114.11,22.55,'East Asia (Hong Kong)','AWS + Azure + Google','Tier 1','Financial hub. China gateway.'],
            [113.26,23.13,'East Asia (Guangzhou)','Alibaba + Tencent + Huawei','Tier 1','Pearl River Delta megacluster.'],
            [121.47,31.23,'East Asia (Shanghai)','Alibaba + Tencent','Tier 1','China\'s largest cloud hub.'],
            [116.39,39.91,'East Asia (Beijing)','Alibaba + Baidu + ByteDance','Tier 1','China state + hyperscale mix.'],
            [126.98,37.57,'East Asia (Seoul)','AWS + Azure + Google + Samsung','Tier 1','Korea hyperscale hub.'],
            [139.69,35.69,'East Asia (Tokyo)','AWS + Azure + Google','Tier 1','Japan primary hub.'],
            [135.49,34.69,'East Asia (Osaka)','AWS + Azure + Google','Tier 2','Japan secondary/DR site.'],
            [151.21,-33.87,'Oceania (Sydney)','AWS + Azure + Google','Tier 1','Australia primary hub.'],
            [144.96,-37.81,'Oceania (Melbourne)','AWS + Azure','Tier 2','Australia secondary.'],
            [172.63,-43.53,'Oceania (Auckland)','Google + AWS','Tier 3','NZ hub.'],
        ];

        const tierColors = { 'Tier 1': '#00ffcc', 'Tier 2': '#ffb000', 'Tier 3': '#888888' };
        dcs.forEach(([lon, lat, name, provider, tier, note]) => {
            const c = tierColors[tier] || '#888';
            const el = document.createElement('div');
            const sz = tier === 'Tier 1' ? '14px' : tier === 'Tier 2' ? '10px' : '7px';
            el.style.cssText = `width:${sz};height:${sz};cursor:pointer;`;
            el.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="12" height="12" rx="2" fill="${c}22" stroke="${c}" stroke-width="1.5"/>
                <rect x="3" y="3" width="8" height="2.5" rx="1" fill="${c}" opacity="0.7"/>
                <rect x="3" y="7" width="8" height="2.5" rx="1" fill="${c}" opacity="0.5"/>
            </svg>`;
            el.style.filter = `drop-shadow(0 0 4px ${c})`;
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '270px' }).setHTML(`
                <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                <h3 style="color:${c};margin:0 0 5px;border-bottom:1px solid ${c}44;padding-bottom:3px;">💾 ${name}</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;">
                    <div style="background:${c}11;padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">PROVIDERS</div><div style="font-size:.62rem;">${provider}</div></div>
                    <div style="background:${c}11;padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">TIER</div><div style="color:${c};">${tier}</div></div>
                </div>
                <div style="font-size:.65rem;opacity:.75;line-height:1.4;">${note}</div>
                <div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: Cloud provider public docs 2024</div>
                </div>`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([lon, lat]).setPopup(popup);
            dcMarkers.push(m);
            if (toggles.datacenters) m.addTo(map);
        });
    };

    // ============================================================
    // NUCLEAR — Power Plants (operational) + Arsenal (9 states)
    // ============================================================
    const nuclearMarkers = [];
    const nukeArsenalMarkers = [];
    const initNuclearLayer = () => {
        // Nuclear Power Plants — [lon, lat, name, country, reactors, capacity_gw, status, note]
        const plants = [
            [35.87,31.82,'Barakah NPP','UAE',4,5.6,'OPERATIONAL','First Arab nuclear power plant. APR-1400 reactors.'],
            [29.15,48.22,'Zaporizhzhia NPP','Ukraine',6,5.7,'OCCUPIED','Largest in Europe. Russian-occupied since Mar 2022.'],
            [28.33,54.63,'Ignalina NPP','Lithuania',0,0,'SHUT DOWN','Shut down 2009 (EU requirement). Chernobyl-type reactor.'],
            [30.1,51.39,'Chernobyl','Ukraine',0,0,'SARCOPHAGUS','Destroyed 1986. New confinement structure 2016.'],
            [53.97,26.22,'Bushehr NPP','Iran',1,0.95,'OPERATIONAL','Iran\'s only NPP. Russian-built VVER-1000.'],
            [72.3,21.7,'Kakrapar NPP','India',2,0.44,'OPERATIONAL','PHWR reactors. NPCIL operated.'],
            [76.4,29.9,'Narora NPP','India',2,0.44,'OPERATIONAL',''],
            [80.28,12.5,'Madras NPP','India',2,0.44,'OPERATIONAL',''],
            [74.12,15.42,'Kaiga NPP','India',4,0.88,'OPERATIONAL',''],
            [76.72,9.2,'Kudankulam NPP','India',2,2.0,'OPERATIONAL','Russian-built. Largest in India.'],
            [91.95,22.16,'Rooppur NPP','Bangladesh',2,2.4,'BUILDING','Russian Rosatom build. Online ~2025.'],
            [126.42,35.41,'Hanul NPP','South Korea',6,5.9,'OPERATIONAL',''],
            [129.38,35.64,'Hanbit NPP','South Korea',6,5.9,'OPERATIONAL',''],
            [129.31,35.29,'Kori NPP','South Korea',4,4.0,'OPERATIONAL','Oldest SK plant. Kori-1 shut 2017.'],
            [126.72,37.71,'Wolsong NPP','South Korea',4,2.8,'OPERATIONAL','CANDU heavy water reactors.'],
            [140.54,41.18,'Higashidori NPP','Japan',1,1.1,'SUSPENDED','Post-Fukushima shutdown.'],
            [141.0,37.42,'Fukushima Daiichi','Japan',0,0,'DECOMMISSION','Meltdown 2011. ~40yr decommission ongoing.'],
            [136.43,35.72,'Takahama NPP','Japan',4,3.3,'PARTIAL','2 reactors restarted post-Fukushima.'],
            [136.2,35.55,'Mihama NPP','Japan',1,0.83,'OPERATIONAL',''],
            [140.38,38.26,'Ōnagawa NPP','Japan',3,2.2,'OPERATIONAL','Restarted 2024.'],
            [121.63,29.88,'Qinshan NPP','China',9,6.6,'OPERATIONAL','First Chinese-built NPP.'],
            [120.52,30.44,'Sanmen NPP','China',2,2.5,'OPERATIONAL','First AP1000 globally.'],
            [113.51,22.76,'Daya Bay NPP','China',2,1.97,'OPERATIONAL','HTR-PM demo reactor adjacent.'],
            [108.43,21.7,'Fangchenggang NPP','China',2,2.0,'OPERATIONAL','ACPR-1000. Hualong-1 under const.'],
            [119.45,35.72,'Tianwan NPP','China',6,6.1,'OPERATIONAL','Largest Russian-Chinese cooperation project.'],
            [121.8,37.7,'Hongyanhe NPP','China',6,6.1,'OPERATIONAL',''],
            [113.34,22.08,'Taiwan: Maanshan','Taiwan',2,1.9,'RETIRING','Unit 2 retired May 2023. Last plant closing.'],
            [150.14,35.34,'Tokai Daini','Japan',1,1.1,'SUSPENDED',''],
            [33.55,36.35,'Akkuyu NPP','Turkey',4,4.8,'BUILDING','Russian Rosatom build. First reactor 2025.'],
            [51.43,35.69,'Iran (all sites)','Iran',1,0.95,'OPERATIONAL','See Bushehr above.'],
            [27.52,48.09,'Cernavodă NPP','Romania',2,1.4,'OPERATIONAL','CANDU type. Expanding +2 units.'],
            [30.39,46.84,'South Ukraine NPP','Ukraine',3,3.0,'OPERATIONAL','War threat.'],
            [33.76,47.83,'Rivne NPP','Ukraine',4,2.8,'OPERATIONAL',''],
            [30.17,49.84,'Khmelnytskyi NPP','Ukraine',2,2.0,'OPERATIONAL',''],
            [27.33,48.68,'Pivdennoukrainsk','Ukraine',3,3.0,'OPERATIONAL',''],
            [37.33,53.26,'Smolensk NPP','Russia',3,3.0,'OPERATIONAL','RBMK reactors (Chernobyl type).'],
            [33.87,67.46,'Kola NPP','Russia',4,1.76,'OPERATIONAL','Northernmost NPP. Oldest operating.'],
            [56.75,56.84,'Beloyarsk NPP','Russia',2,0.88,'OPERATIONAL','BN-800 fast breeder reactor.'],
            [49.22,52.37,'Balakovo NPP','Russia',4,4.0,'OPERATIONAL','Largest in Russia.'],
            [37.77,55.23,'Novovoronezh NPP','Russia',5,4.1,'OPERATIONAL','VVER-1200 Gen III+ demonstration.'],
            [34.28,67.45,'Leningrad NPP','Russia',4,4.0,'OPERATIONAL','Also RBMK type. Being replaced.'],
            [54.93,56.81,'Sverdlovsk (Ural)','Russia',1,0.88,'BUILDING',''],
            [-74.96,41.08,'Indian Point NPP','USA',0,0,'SHUT DOWN','NY plant. Closed 2021.'],
            [-90.06,34.32,'Grand Gulf NPP','USA',1,1.3,'OPERATIONAL',''],
            [-84.06,41.97,'Davis-Besse','USA',1,0.89,'OPERATIONAL','Near-miss events history.'],
            [-76.27,40.26,'Three Mile Island','USA',0,0,'RESTARTING','TMI Unit 1 restarting 2028 (Microsoft contract).'],
            [-77.79,34.8,'Brunswick NPP','USA',2,1.9,'OPERATIONAL',''],
            [-80.27,32.14,'Virgil C. Summer','USA',1,0.97,'OPERATIONAL',''],
            [-81.12,33.33,'Oconee NPP','USA',3,2.6,'OPERATIONAL',''],
            [-88.07,44.32,'Point Beach NPP','USA',2,1.0,'OPERATIONAL',''],
            [-1.58,53.82,'Sellafield','UK',0,0,'DECOMMISSION','Largest nuclear site in Europe. Contamination risk.'],
            [-3.04,54.41,'Heysham NPP','UK',4,2.5,'OPERATIONAL','AGR reactors.'],
            [-4.72,53.41,'Wylfa NPP','UK',0,0,'SHUT DOWN','Magnox plant. Site for new Wylfa Newydd.'],
            [1.47,43.56,'Golfech NPP','France',2,2.7,'OPERATIONAL',''],
            [4.73,43.78,'Marcoule / Tricastin','France',4,3.6,'OPERATIONAL',''],
            [0.63,46.97,'Civaux NPP','France',2,2.7,'OPERATIONAL','Newest French plant.'],
            [6.02,47.33,'Bugey + Cruas NPP','France',4,2.6,'OPERATIONAL',''],
            [8.04,47.91,'Leibstadt NPP','Switzerland',1,1.2,'OPERATIONAL',''],
            [7.59,47.52,'Beznau NPP','Switzerland',2,0.73,'OPERATIONAL','Oldest operational NPP in world (1969).'],
            [-112.86, 33.38, 'Palo Verde', 'USA', 3, 3.9, 'OPERATIONAL', 'Largest US power plant by net generation.'],
            [-87.11, 34.70, 'Browns Ferry', 'USA', 3, 3.4, 'OPERATIONAL', 'Tennessee Valley Authority.'],
            [-76.26, 39.75, 'Peach Bottom', 'USA', 2, 2.7, 'OPERATIONAL', 'Operated by Constellation.'],
            [-76.69, 37.16, 'Surry NPP', 'USA', 2, 1.6, 'OPERATIONAL', 'Located in Virginia.'],
            [-84.78, 35.60, 'Watts Bar', 'USA', 2, 2.3, 'OPERATIONAL', 'Last US reactor online before Vogtle 3&4.'],
            [-120.85, 35.21, 'Diablo Canyon', 'USA', 2, 2.2, 'OPERATIONAL', 'Only remaining operational in California.'],
            [-88.22, 41.24, 'Braidwood', 'USA', 2, 2.3, 'OPERATIONAL', 'Illinois.'],
            [-88.66, 41.24, 'LaSalle', 'USA', 2, 2.2, 'OPERATIONAL', 'Illinois.'],
            [-75.58, 40.23, 'Limerick', 'USA', 2, 2.3, 'OPERATIONAL', 'Pennsylvania.'],
            [-72.16, 41.31, 'Millstone', 'USA', 2, 2.1, 'OPERATIONAL', 'Connecticut.'],
            [-85.08, 35.22, 'Sequoyah', 'USA', 2, 2.3, 'OPERATIONAL', 'Tennessee.'],
            [-76.14, 41.09, 'Susquehanna', 'USA', 2, 2.5, 'OPERATIONAL', 'Pennsylvania.'],
            [-75.53, 39.46, 'Salem / Hope Creek', 'USA', 3, 3.4, 'OPERATIONAL', 'New Jersey.'],
            [-81.76, 33.14, 'Vogtle NPP', 'USA', 4, 4.5, 'OPERATIONAL', 'Largest US NPP. Units 3 & 4 (AP1000) online.'],
            [-81.59, 44.32, 'Bruce NPP', 'Canada', 8, 6.4, 'OPERATIONAL', 'Largest operating NPP globally. CANDU.'],
            [-79.06, 43.81, 'Pickering', 'Canada', 6, 3.1, 'OPERATIONAL', 'Expected to operate until ~2026.'],
            [-78.71, 43.87, 'Darlington', 'Canada', 4, 3.5, 'OPERATIONAL', 'Undergoing refurbishment.'],
            [-66.86, 45.15, 'Point Lepreau', 'Canada', 1, 0.6, 'OPERATIONAL', 'New Brunswick.'],
            [2.13, 51.01, 'Gravelines', 'France', 6, 5.4, 'OPERATIONAL', 'Largest NPP in France.'],
            [0.63, 49.85, 'Paluel', 'France', 4, 5.3, 'OPERATIONAL', 'Second largest in France.'],
            [6.21, 49.41, 'Cattenom', 'France', 4, 5.2, 'OPERATIONAL', 'Grand Est region.'],
            [4.78, 50.09, 'Chooz', 'France', 2, 3.0, 'OPERATIONAL', 'N4 reactor design.'],
            [1.21, 49.97, 'Penly', 'France', 2, 2.6, 'OPERATIONAL', 'Located in Normandy.'],
            [3.51, 48.51, 'Nogent', 'France', 2, 2.6, 'OPERATIONAL', 'Grand Est.'],
            [2.87, 47.51, 'Belleville', 'France', 2, 2.6, 'OPERATIONAL', 'Centre-Val de Loire.'],
            [12.11, 57.25, 'Ringhals', 'Sweden', 2, 2.1, 'PARTIAL', 'Two reactors closed, two operational.'],
            [18.16, 60.40, 'Forsmark', 'Sweden', 3, 3.1, 'OPERATIONAL', 'Produces 1/6 of Swedens electricity.'],
            [16.66, 57.41, 'Oskarshamn', 'Sweden', 1, 1.4, 'PARTIAL', 'Only Unit 3 remains operational.'],
            [21.44, 61.23, 'Olkiluoto', 'Finland', 3, 3.3, 'OPERATIONAL', 'Unit 3 is Europes most powerful.'],
            [26.33, 60.36, 'Loviisa', 'Finland', 2, 1.0, 'OPERATIONAL', 'Soviet VVER design with Western control.'],
            [0.56, 41.20, 'Ascó', 'Spain', 2, 2.0, 'OPERATIONAL', 'Catalonia.'],
            [0.86, 40.95, 'Vandellòs', 'Spain', 1, 1.0, 'OPERATIONAL', 'Unit 1 closed, Unit 2 operational.'],
            [-5.69, 39.80, 'Almaraz', 'Spain', 2, 2.0, 'OPERATIONAL', 'Expected to close 2027-2028.'],
            [14.37, 49.18, 'Temelín', 'Czechia', 2, 2.1, 'OPERATIONAL', 'South Bohemian Region.'],
            [16.14, 49.08, 'Dukovany', 'Czechia', 4, 2.0, 'OPERATIONAL', 'VVER-440 reactors.'],
            [18.45, 48.26, 'Mochovce', 'Slovakia', 3, 1.4, 'OPERATIONAL', 'Unit 3 started 2023. Unit 4 building.'],
            [17.68, 48.49, 'Bohunice', 'Slovakia', 2, 1.0, 'OPERATIONAL', 'V-2 plant operational.'],
            [18.85, 46.57, 'Paks', 'Hungary', 4, 2.0, 'OPERATIONAL', 'Provides ~50% of Hungarys electricity.'],
            [15.52, 45.93, 'Krško', 'Slovenia', 1, 0.7, 'OPERATIONAL', 'Co-owned with Croatia.'],
            [4.25, 51.32, 'Doel', 'Belgium', 4, 2.9, 'OPERATIONAL', 'Scheduled for phase-out.'],
            [5.28, 50.53, 'Tihange', 'Belgium', 3, 3.0, 'OPERATIONAL', 'Along the Meuse river.'],
            [3.71, 51.43, 'Borssele', 'Netherlands', 1, 0.4, 'OPERATIONAL', 'Only commercial NPP in Netherlands.'],
            [1.62, 52.21, 'Sizewell B', 'UK', 1, 1.2, 'OPERATIONAL', 'Only PWR in the UK.'],
            [-2.40, 55.96, 'Torness', 'UK', 2, 1.2, 'OPERATIONAL', 'Advanced Gas-cooled Reactors (AGR).'],
            [-1.18, 54.63, 'Hartlepool', 'UK', 2, 1.2, 'OPERATIONAL', 'AGR design.'],
            [138.60, 37.42, 'Kashiwazaki-Kariwa', 'Japan', 7, 7.9, 'SUSPENDED', 'Offline since Fukushima.'],
            [129.87, 33.51, 'Genkai', 'Japan', 2, 2.2, 'PARTIAL', 'Units 3 & 4 restarted.'],
            [130.17, 31.83, 'Sendai', 'Japan', 2, 1.7, 'OPERATIONAL', 'First to restart post-Fukushima.'],
            [132.31, 33.48, 'Ikata', 'Japan', 1, 0.8, 'PARTIAL', 'Unit 3 operational.'],
            [136.72, 37.05, 'Shika', 'Japan', 2, 1.6, 'SUSPENDED', 'Offline since Fukushima.'],
            [140.51, 43.03, 'Tomari', 'Japan', 3, 1.9, 'SUSPENDED', 'Hokkaido. Offline.'],
            [120.25, 27.04, 'Ningde', 'China', 4, 4.0, 'OPERATIONAL', 'Fujian province.'],
            [119.44, 25.44, 'Fuqing', 'China', 6, 6.0, 'OPERATIONAL', 'First Hualong One reactor.'],
            [112.26, 21.71, 'Yangjiang', 'China', 6, 6.0, 'OPERATIONAL', 'Guangdong province.'],
            [121.38, 36.71, 'Haiyang', 'China', 2, 2.0, 'OPERATIONAL', 'Shandong. Also provides district heating.'],
            [112.98, 21.91, 'Taishan', 'China', 2, 3.3, 'OPERATIONAL', 'First EPR reactors to enter commercial op.'],
            [128.32, 36.85, 'Hanul/Shin-Hanul', 'South Korea', 8, 8.7, 'OPERATIONAL', 'One of largest plant clusters.'],
            [129.32, 35.32, 'Shin-Kori/Saeul', 'South Korea', 4, 4.2, 'OPERATIONAL', 'Includes APR1400 reactors.'],
        ];

        plants.forEach(([lon, lat, name, country, reactors, capacity, status, note]) => {
            const statusColors = { 'OPERATIONAL':'#00ff88', 'BUILDING':'#ffb000', 'SUSPENDED':'#ff8800', 'SHUT DOWN':'#888', 'DECOMMISSION':'#ff4444', 'SARCOPHAGUS':'#ff0000', 'OCCUPIED':'#ff0000', 'PARTIAL':'#00ff88', 'RESTARTING':'#00ffcc', 'RETIRING':'#ff8800' };
            const c = statusColors[status] || '#888';
            const el = document.createElement('div');
            el.style.cssText = `width:12px;height:12px;cursor:pointer;`;
            el.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                <polygon points="6,1 11,10 1,10" fill="${c}33" stroke="${c}" stroke-width="1.2"/>
                <circle cx="6" cy="7.5" r="1.5" fill="${c}"/>
            </svg>`;
            el.style.filter = `drop-shadow(0 0 3px ${c})`;
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '270px' }).setHTML(`
                <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                <h3 style="color:${c};margin:0 0 5px;border-bottom:1px solid ${c}44;padding-bottom:3px;">☢ ${name}</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:5px;">
                    <div style="background:${c}11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">COUNTRY</div><div style="font-size:.65rem;">${country}</div></div>
                    <div style="background:${c}11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">REACTORS</div><div style="color:${c};">${reactors}</div></div>
                    <div style="background:${c}11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">CAPACITY</div><div style="font-size:.65rem;">${capacity} GW</div></div>
                </div>
                <div style="background:${c}22;border:1px solid ${c}55;padding:3px 7px;color:${c};margin-bottom:4px;font-size:.7rem;">${status}</div>
                <div style="font-size:.65rem;opacity:.75;line-height:1.4;">${note}</div>
                <div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: IAEA PRIS / WNA 2024</div>
                </div>`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([lon, lat]).setPopup(popup);
            nuclearMarkers.push(m);
            if (toggles.nuclear) m.addTo(map);
        });

        // Nuclear Arsenal — 9 states
        const arsenals = [
            [-77.04,38.89,'USA',5244,'Active: 1,670 deployed. Trident, B61, Minuteman III. Reducing under New START.'],
            [37.61,55.75,'Russia',5889,'Largest stockpile. ~1,674 deployed. Sarmat, Kinzhal, Poseidon.'],
            [116.39,39.91,'China',500,'Rapidly expanding. Estimated 500-700 by 2030.'],
            [-3.44,55.38,'UK',225,'Trident SLBM. Increasing cap to 260 (2021 review).'],
            [2.35,48.85,'France',290,'Independent deterrent. ASMP-A cruise + M51 SLBM.'],
            [72.88,19.08,'India',172,'Growing program. Agni-V ICBM capability.'],
            [74.35,30.37,'Pakistan',170,'Rival program. Ghauri/Shaheen missiles. F-16 nuclear role.'],
            [35.22,31.77,'Israel',90,'Undeclared. Jericho III ICBM. Dimona facility.'],
            [125.73,39.03,'North Korea',50,'Estimated 40-60. ICBM Hwasong-17 can reach continental USA.'],
        ];
        arsenals.forEach(([lon, lat, country, warheads, note]) => {
            const el = document.createElement('div');
            el.style.cssText = 'width:18px;height:18px;cursor:pointer;';
            el.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="8" fill="rgba(255,0,0,0.1)" stroke="#ff0000" stroke-width="1.5"/>
                <text x="9" y="13" text-anchor="middle" font-size="10" fill="#ff0000">☢</text>
            </svg>`;
            el.style.filter = 'drop-shadow(0 0 5px #ff0000)';
            const popup = new maplibregl.Popup({ offset: 10, maxWidth: '260px' }).setHTML(`
                <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                <h3 style="color:#ff0000;margin:0 0 5px;border-bottom:1px solid #ff000044;padding-bottom:3px;">☢ ${country} — NUCLEAR ARSENAL</h3>
                <div style="background:rgba(255,0,0,.08);border:1px solid rgba(255,0,0,.3);padding:6px 8px;margin-bottom:5px;">
                    <div style="font-size:.6rem;opacity:.5;">ESTIMATED WARHEADS</div>
                    <div style="color:#ff0000;font-size:1.3rem;font-weight:bold;">${warheads.toLocaleString()}</div>
                </div>
                <div style="font-size:.65rem;opacity:.75;line-height:1.4;">${note}</div>
                <div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: SIPRI Yearbook 2024</div>
                </div>`);
            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([lon, lat]).setPopup(popup);
            nukeArsenalMarkers.push(m);
            if (toggles.nukes) m.addTo(map);
        });
    };

    // ============================================================
    // CONFLICT ZONES (curated 2025 data — no API key needed)
    // ============================================================
    const conflictMarkers = [];
    const CONFLICTS = [
        {
            name: 'Ukraine — Russia War', lat: 48.5, lon: 37.5, severity: 'CRITICAL',
            type: 'Interstate War', since: 2022,
            parties: [['🇷🇺 Russia', 'Aggressor'], ['🇺🇦 Ukraine', 'Defender']],
            support: 'UA: NATO/EU aid. RU: Iran, DPRK, Belarus.',
            casualties: '~500,000–700,000 (KIA + WIA, both sides)',
            displaced: '~8M refugees, 5M internally displaced',
            status: 'ACTIVE — Frontline mostly static, drone war escalating',
            note: 'Largest land war in Europe since WWII. Started with full invasion Feb 24, 2022.'
        },
        {
            name: 'Gaza — Israel Conflict', lat: 31.35, lon: 34.30, severity: 'CRITICAL',
            type: 'Military Operation / Urban Warfare', since: 2023,
            parties: [['🇮🇱 Israel (IDF)', 'Military operation'], ['🇵🇸 Hamas', 'Gaza de-facto govt']],
            support: 'IL: US military aid. Hamas: Iran, Hezbollah.',
            casualties: '>48,000 Palestinian dead (UN est.), ~1,200 Israeli on Oct 7',
            displaced: '~1.9M Gazans (90% of population)',
            status: 'ACTIVE — Ongoing IDF operations, humanitarian crisis',
            note: 'Triggered by Hamas attack on Oct 7, 2023. Ceasefire negotiations ongoing.'
        },
        {
            name: 'West Bank Escalation', lat: 32.1, lon: 35.2, severity: 'HIGH',
            type: 'Occupation / Armed Clashes', since: 1967,
            parties: [['🇮🇱 Israel (settlers/IDF)', 'Occupying force'], ['🇵🇸 Palestinian groups', 'Resistance']],
            support: 'US veto in UNSC. PA security forces partially cooperate with IDF.',
            casualties: '>700 Palestinians killed in 2024 (highest since 2nd Intifada)',
            displaced: 'Tens of thousands in recent raids (Jenin, Tulkarm)',
            status: 'ESCALATING — Large-scale IDF raids ongoing 2025',
            note: 'Occupation since 1967. Settler violence and IDF incursions dramatically increased post-Oct 7.'
        },
        {
            name: 'Sudan — Civil War', lat: 15.5, lon: 32.5, severity: 'CRITICAL',
            type: 'Civil War', since: 2023,
            parties: [['🇸🇩 SAF (Army)', 'Official military'], ['RSF (Rapid Support Forces)', 'Paramilitary']],
            support: 'SAF: Egypt, Eritrea. RSF: UAE, Wagner/Russia.',
            casualties: '>150,000 dead, >9M displaced',
            displaced: 'Largest displacement crisis in the world (2024)',
            status: 'ACTIVE — RSF controls most of Darfur, fighting in Khartoum',
            note: 'Broke out Apr 15, 2023. Power struggle between Gen. Burhan (SAF) and Gen. Dagalo (RSF).'
        },
        {
            name: 'Myanmar — Civil War', lat: 20.0, lon: 96.5, severity: 'CRITICAL',
            type: 'Civil War / Junta vs. Resistance', since: 2021,
            parties: [['Military Junta (SAC)', 'Coup govt since Feb 2021'], ['PDF + EAOs (30+ groups)', 'Pro-democracy resistance']],
            support: 'Junta: China, Russia. PDF: limited Western support.',
            casualties: '>50,000 dead, 3M+ displaced since coup',
            displaced: '~3.2M internally displaced',
            status: 'ACTIVE — Junta losing territory rapidly since Oct 2023 offensive',
            note: 'Military coup Feb 1, 2021. Operation 1027 (Oct 2023) saw major rebel advances.'
        },
        {
            name: 'Ethiopia — Amhara & Oromia', lat: 10.5, lon: 38.5, severity: 'HIGH',
            type: 'Internal Armed Conflict', since: 2018,
            parties: [['🇪🇹 ENDF (Ethiopian Army)', 'Federal government'], ['FANO / OLA', 'Amhara & Oromo armed groups']],
            support: 'ENDF: Eritrea (limited). FANO/OLA: diaspora funding.',
            casualties: 'Thousands dead; Tigray war (ended 2022): ~300,000-500,000',
            displaced: '>4M total (all Ethiopian conflicts combined)',
            status: 'ACTIVE — FANO controls parts of Amhara; OLA active in Oromia',
            note: 'Post-Tigray peace deal (Nov 2022) new conflicts erupted in Amhara and Oromia regions.'
        },
        {
            name: 'Somalia — Al-Shabaab', lat: 5.0, lon: 45.5, severity: 'HIGH',
            type: 'Islamist Insurgency', since: 2006,
            parties: [['🇸🇴 Somali Federal Govt + ATMIS', 'UN-backed government'], ['Al-Shabaab (AQ-affiliate)', 'Controls large rural areas']],
            support: 'Govt: AU Mission (ATMIS), US airstrikes. AS: local taxation.',
            casualties: '~500,000+ since 2007 (direct + famine-related)',
            displaced: '~3.8M IDPs in Somalia',
            status: 'ACTIVE — AS controls ~40% of territory, regular attacks on cities',
            note: 'Al-Shabaab affiliated with Al-Qaeda since 2012. Controls rural areas, taxes population.'
        },
        {
            name: 'Yemen — Civil War', lat: 15.5, lon: 44.2, severity: 'HIGH',
            type: 'Civil War / Proxy Conflict', since: 2014,
            parties: [['Houthis (Ansar Allah)', 'Controls Sanaa + Red Sea coast'], ['Saudi-led Coalition + IRG', 'UN-recognised govt']],
            support: 'Houthis: Iran. Coalition: US/UK air support.',
            casualties: '>150,000 combat dead; 377,000 total (war-related, UN)',
            displaced: '~4.5M IDPs; world\'s worst humanitarian crisis (2021)',
            status: 'CEASEFIRE (fragile) — Houthis attacking Red Sea since Nov 2023',
            note: 'Houthi takeover 2014-15 sparked Saudi intervention. Houthis now attacking global shipping in solidarity with Gaza.'
        },
        {
            name: 'Red Sea — Houthi Maritime War', lat: 15.0, lon: 42.5, severity: 'HIGH',
            type: 'Maritime / Asymmetric Conflict', since: 2023,
            parties: [['Houthis (Yemen)', 'Attacking commercial + military ships'], ['US/UK + Coalition', 'Defensive strikes on Houthi positions']],
            support: 'Houthis: Iranian missiles, drones. Coalition: US carrier groups.',
            casualties: '4 seafarers killed; multiple ships sunk',
            displaced: 'N/A — Maritime conflict; shipping rerouted around Africa (+14 days)',
            status: 'ACTIVE — Ongoing attacks on Red Sea shipping since Nov 19, 2023',
            note: 'Houthis claim attacks are pro-Palestine. Global trade severely disrupted. Suez Canal traffic -50%.'
        },
        {
            name: 'DR Congo — Eastern Conflict', lat: -1.5, lon: 29.0, severity: 'CRITICAL',
            type: 'Civil War / Regional Proxy', since: 1996,
            parties: [['🇨🇩 FARDC + FDLR', 'DRC government army'], ['M23 (Rwanda-backed)', 'Rebel group']],
            support: 'M23: Rwanda (denied). FARDC: MONUSCO (withdrawing).',
            casualties: '>6M dead (since 1996); ongoing thousands per year',
            displaced: '~7M IDPs — largest in Africa',
            status: 'CRITICAL — M23 captured Goma (Jan 2025), advancing on Bukavu',
            note: 'World\'s most deadly ongoing conflict. M23 captures Goma, DRC\'s second city, Jan 2025.'
        },
        {
            name: 'Sahel — Mali & Burkina Faso', lat: 14.5, lon: -3.5, severity: 'HIGH',
            type: 'Jihadist Insurgency', since: 2012,
            parties: [['Juntas (Mali + BF)', 'Military governments (post-coup)'], ['JNIM / ISGS', 'Al-Qaeda & IS affiliates']],
            support: 'Juntas: Wagner/Russia, expelled French forces. JNIM: local recruits.',
            casualties: '>15,000 civilians dead in Sahel 2023-2024',
            displaced: '~3M across Mali, BF, Niger',
            status: 'ACTIVE — JNIM controls large areas; mass atrocities ongoing',
            note: 'Post-coup juntas expelled France, invited Wagner. Jihadist territory expanded despite Russian presence.'
        },
        {
            name: 'Niger — Terrorism & Coup', lat: 16.0, lon: 8.0, severity: 'MODERATE',
            type: 'Jihadist Insurgency + Political Crisis', since: 2015,
            parties: [['Military Junta (CNSP)', 'Post-July 2023 coup govt'], ['ISGS + Ansarul Islam', 'IS & AQ affiliates']],
            support: 'Junta: Mali, BF, Russia. West expelled after coup.',
            casualties: '>2,000 civilians/military dead 2023',
            displaced: '~350,000 IDPs',
            status: 'ACTIVE — Junta consolidating power, jihadists expanding',
            note: 'Military coup July 26, 2023. France and US lost bases. IS expanding in Tillabéri region.'
        },
        {
            name: 'Haiti — Gang Warfare', lat: 18.7, lon: -72.3, severity: 'CRITICAL',
            type: 'Criminal / Gang Warfare', since: 2021,
            parties: [['G9 Family / Viv Ansanm coalition', '~200 armed groups, ~80% of Port-au-Prince'], ['Haitian National Police + MSS (Kenya-led)', 'Collapsing state security']],
            support: 'Gangs: diaspora money, weapon trafficking. MSS: US-funded, Kenya-led.',
            casualties: '>5,600 killed in 2024 (UN); >2,000 in Q1 2024 alone',
            displaced: '~700,000 IDPs in Haiti',
            status: 'CRITICAL — State near-collapse; PM resigned Mar 2024',
            note: 'Accelerated after PM Moïse assassination 2021. Gang leader Barbecue controls capital approaches.'
        },
        {
            name: 'Mexico — Cartel Wars', lat: 25.0, lon: -107.0, severity: 'HIGH',
            type: 'Criminal / Narco Conflict', since: 2006,
            parties: [['CJNG (Jalisco Cartel)', 'Expanding paramilitary cartel'], ['Sinaloa Cartel (split)', 'Los Chapitos vs. Mayos faction']],
            support: 'Cartels: drug revenue, US weapons. Govt: US DEA support.',
            casualties: '>450,000 murdered since 2006; ~35,000/yr currently',
            displaced: '>400,000 internally displaced by cartel violence',
            status: 'ACTIVE — Sinaloa civil war since Aug 2024; CJNG expanding',
            note: 'Deadliest non-war conflict globally. Sinaloa internal split Aug 2024: Chapitos vs. Ismael Zambada faction.'
        },
        {
            name: 'Iraq — IS Remnants', lat: 34.0, lon: 43.0, severity: 'MODERATE',
            type: 'Counter-Insurgency', since: 2013,
            parties: [['🇮🇶 Iraqi Security Forces + PMF', 'Government + Iran-backed militia'], ['Islamic State (IS)', 'Surviving sleeper cells']],
            support: 'ISF: US air support, Iranian PMF. IS: self-financed cells.',
            casualties: '>200,000 dead (IS peak 2014-2017); ongoing ~500/yr',
            displaced: 'Most of 6M Iraqi IDPs returned; ~1.2M still displaced',
            status: 'LOW INTENSITY — IS cells active in Kirkuk, Diyala, Anbar deserts',
            note: 'IS "caliphate" defeated 2019, but cells persist. 1-2 attacks/week. Iran-backed PMF tensions rising.'
        },
        {
            name: 'Syria — Post-War Transition', lat: 35.5, lon: 38.5, severity: 'HIGH',
            type: 'Civil War → Transition', since: 2011,
            parties: [['HTS (Hayat Tahrir al-Sham)', 'Controls most of Syria since Dec 2024'], ['SDF (Kurds)', 'NE Syria'], ['SNA + Turkey', 'NW border zone']],
            support: 'HTS: Turkey (ambivalent). SDF: US. IS: self-financed.',
            casualties: '>580,000 dead since 2011 (SOHR)',
            displaced: '~7M refugees abroad, 7M+ IDPs — largest refugee crisis before Ukraine',
            status: 'TRANSITION — Assad fell Dec 8, 2024; HTS forming new govt',
            note: 'Assad regime collapsed Dec 8, 2024 after rebel offensive. HTS (ex-al-Nusra) now governing.'
        },
        {
            name: 'Lebanon — Post-War Fragility', lat: 33.6, lon: 35.5, severity: 'HIGH',
            type: 'Post-Conflict / Political Crisis', since: 2023,
            parties: [['🇮🇱 Israel', 'Military operation in S. Lebanon'], ['Hezbollah (Iran-backed)', 'Dominant armed group']],
            support: 'Hezbollah: Iran (weapons, money). Israel: US military aid.',
            casualties: '>4,000 dead in Lebanon-Israel fighting, 2024; ~1,200 Hezbollah fighters',
            displaced: '~1.2M displaced in Lebanon during conflict',
            status: 'CEASEFIRE (Nov 2024) — Fragile; Hezbollah rebuilt; IDF partial withdrawal',
            note: 'Full escalation Jun-Nov 2024. Ceasefire Nov 27, 2024. Hezbollah severely weakened (Nasrallah killed).'
        },
        {
            name: 'Pakistan — TTP Insurgency', lat: 33.0, lon: 70.5, severity: 'MODERATE',
            type: 'Islamist Insurgency', since: 2007,
            parties: [['🇵🇰 Pakistan Army', 'Federal security forces'], ['TTP (Tehrik-i-Taliban)', 'Taliban-linked insurgency']],
            support: 'Pakistan: Chinese military cooperation. TTP: Afghan Taliban support.',
            casualties: '>80,000 dead (2007-present, all causes)',
            displaced: '>500,000 IDPs in KPK/FATA regions',
            status: 'ESCALATING — TTP attacks surged 70% since Afghan Taliban takeover 2021',
            note: 'TTP attacks dramatically increased after Afghan Taliban return to power in 2021. Safe haven in Afghanistan.'
        },
        {
            name: 'Nagorno-Karabakh Aftermath', lat: 40.2, lon: 46.8, severity: 'MODERATE',
            type: 'Post-Conflict Ethnic Cleansing / Tensions', since: 1988,
            parties: [['🇦🇿 Azerbaijan', 'Retook NKR Sept 2023'], ['🇦🇲 Armenia', 'Ceded NKR; border demarcation ongoing']],
            support: 'Azerbaijan: Turkey, Israel (weapons). Armenia: Russia (failed to protect).',
            casualties: '~7,000 dead in 2020 war; ~200 in Sept 2023 operation',
            displaced: '~100,000 ethnic Armenians fled NKR in Sept 2023 (full depopulation)',
            status: 'NO ACTIVE FIGHTING — Peace treaty negotiations ongoing 2025',
            note: 'Azerbaijan\'s 24h "anti-terror" op (Sept 19-20, 2023) ended NKR existence. All Armenians fled.'
        },
        {
            name: 'Libya — Rival Governments', lat: 29.0, lon: 18.0, severity: 'MODERATE',
            type: 'Political-Military Standoff', since: 2011,
            parties: [['GNU (Tripoli, West)', 'UN-recognised govt of Dbeibah'], ['LNA/GECOL (Benghazi, East)', 'Haftar\'s rival military command']],
            support: 'GNU: Turkey troops. LNA: UAE, Russia/Wagner, Egypt.',
            casualties: '>25,000 dead since 2011 civil war',
            displaced: '>200,000 Libyans displaced; major migrant transit country',
            status: 'FROZEN CONFLICT — Ceasefire Oct 2020; sporadic clashes; oil disputes',
            note: 'Split since Gaddafi fall 2011. Two rival govts. Occasional fighting despite 2020 ceasefire.'
        },
        {
            name: 'Iran — US/Israel War 2025', lat: 32.5, lon: 51.5, severity: 'CRITICAL',
            type: 'Interstate War / Air Campaign', since: 2025,
            parties: [['🇺🇸 USA + 🇮🇱 Israel', 'Strikes on nuclear/IRGC sites'], ['🇮🇷 Iran', 'Missile retaliation, Hormuz disruption']],
            support: 'US: Gulf bases, F-35s. Iran: Russia, China (limited).',
            casualties: 'Hundreds military; US bases attacked in Iraq/UAE',
            displaced: 'Limited ground displacement; oil crisis ($120+/bbl)',
            status: 'ACTIVE — Air/missile war; Hormuz partially blocked',
            note: 'US struck nuclear sites after 90% enrichment confirmed. Iran retaliated on US bases. Strait of Hormuz disrupted.'
        },
        {
            name: 'Iran — Israel Proxy War', lat: 33.5, lon: 43.5, severity: 'CRITICAL',
            type: 'Regional Proxy / Direct Clash', since: 2019,
            parties: [['🇮🇱 Israel (IDF)', 'Strikes + assassinations'], ['🇮🇷 Iran (IRGC)', 'Proxies + direct missiles']],
            support: 'Israel: US, Iron Dome. Iran: Hezbollah, Houthis, PMF.',
            casualties: 'Thousands killed across multiple fronts since Oct 2023',
            displaced: 'N/A — multi-front proxy war',
            status: 'ACTIVE — Direct exchanges since Apr 2024; linked to 2025 war',
            note: 'Iran fired 300+ missiles at Israel (Apr 2024). Proxy network weakened but active.'
        },
        {
            name: 'Strait of Hormuz Crisis', lat: 26.0, lon: 56.0, severity: 'CRITICAL',
            type: 'Naval / Air-Sea Confrontation', since: 2019,
            parties: [['🇺🇸 USA (CENTCOM)', 'Carrier groups, escorts'], ['🇮🇷 IRGC Navy', 'Mines, missile boats']],
            support: 'USA: Gulf states. Iran: asymmetric warfare.',
            casualties: 'Naval skirmishes; tanker seizures',
            displaced: 'N/A — 20% of global oil transits here',
            status: 'ACTIVE — Tanker escorts; mine-laying ops',
            note: 'Escalated to direct conflict 2025. US Navy escorting oil tankers through strait.'
        }
    ];

    const CONFLICT_COLORS = { CRITICAL: '#ff0000', HIGH: '#ff6600', MODERATE: '#ffb000' };

    const initConflictZones = () => {
        const currentYear = new Date().getFullYear();
        CONFLICTS.forEach(c => {
            const col = CONFLICT_COLORS[c.severity] || '#ff6600';
            const duration = currentYear - c.since;
            const el = document.createElement('div');
            el.style.cssText = 'width:22px;height:22px;cursor:pointer;';
            el.innerHTML = `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="9" fill="none" stroke="${col}" stroke-width="1.5" opacity="0.9"/>
                <line x1="0" y1="11" x2="22" y2="11" stroke="${col}" stroke-width="1"/>
                <line x1="11" y1="0" x2="11" y2="22" stroke="${col}" stroke-width="1"/>
                <circle cx="11" cy="11" r="2.5" fill="${col}" opacity="0.8"/>
            </svg>`;
            el.style.filter = `drop-shadow(0 0 4px ${col})`;

            const partiesHtml = c.parties.map(([name, role]) =>
                `<div style="background:rgba(255,0,0,.05);padding:3px 7px;border-left:2px solid ${col}55;">
                    <div style="color:${col};font-size:.72rem;">${name}</div>
                    <div style="opacity:.55;font-size:.62rem;">${role}</div>
                </div>`
            ).join('');

            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([c.lon, c.lat]);
                
            el.addEventListener('click', () => {
                window.openBriefing({
                    id: `CONF-${c.name.replace(/\s+/g,'-').toUpperCase()}`,
                    title: c.name,
                    severity: c.severity,
                    what: `<strong>${c.type}</strong><br>${c.status}<br><br><strong>Combatants:</strong><br>${c.parties.map(p=>`• ${p[0]} (${p[1]})`).join('<br>')}`,
                    why: `<strong>Casualties:</strong> ${c.casualties}<br><strong>Displaced:</strong> ${c.displaced}<br><br>${c.note}`,
                    time: `Ongoing since ${c.since} (${duration} yrs)`,
                    source: 'ACLED / SIPRI / UN OCHA',
                    location: [c.lon, c.lat],
                    relatedLayers: [
                        { label: 'View Power Infrastructure', layerId: 'pipelines' },
                        { label: 'View Internet Cables', layerId: 'cables' }
                    ]
                });
            });
            conflictMarkers.push(m);
            if (toggles.conflicts) m.addTo(map);
        });
        setStatus(currentLang === 'de' ? 'KONFLIKTZONE-DATENBANK GELADEN.' : 'CONFLICT ZONE DATABASE LOADED.');
    };

    document.getElementById('toggle-conflicts')?.addEventListener('change', (e) => {
        toggles.conflicts = e.target.checked;
        if (toggles.conflicts && conflictMarkers.length === 0) initConflictZones();
        conflictMarkers.forEach(m => toggles.conflicts ? m.addTo(map) : m.remove());
    });

    document.getElementById('toggle-regimes')?.addEventListener('change', (e) => {
        toggles.regimes = e.target.checked;
        if (toggles.regimes && regimeMarkers.length === 0) initRegimeMap();
        regimeMarkers.forEach(m => toggles.regimes ? m.addTo(map) : m.remove());
    });

    document.getElementById('toggle-blocs')?.addEventListener('change', (e) => {
        toggles.blocs = e.target.checked;
        if (toggles.blocs && blocMarkers.length === 0) initGeoBlocs();
        blocMarkers.forEach(m => toggles.blocs ? m.addTo(map) : m.remove());
    });

    document.getElementById('toggle-cables')?.addEventListener('change', (e) => {
        toggles.cables = e.target.checked;
        if (toggles.cables && !map.getSource('cables-src')) initUnderseaCables();
        if (map.getLayer('cables-layer'))
            map.setLayoutProperty('cables-layer', 'visibility', toggles.cables ? 'visible' : 'none');
    });

    document.getElementById('toggle-datacenters')?.addEventListener('change', (e) => {
        toggles.datacenters = e.target.checked;
        if (toggles.datacenters && dcMarkers.length === 0) initDataCenters();
        dcMarkers.forEach(m => toggles.datacenters ? m.addTo(map) : m.remove());
    });

    document.getElementById('toggle-nuclear')?.addEventListener('change', (e) => {
        toggles.nuclear = e.target.checked;
        if (toggles.nuclear && nuclearMarkers.length === 0) initNuclearLayer();
        nuclearMarkers.forEach(m => toggles.nuclear ? m.addTo(map) : m.remove());
    });

    // MISSING TOGGLES & REAL-TIME TRACKING REPAIRS
    const getYesterdaysDateForGIBS = () => {
        const d = new Date();
        d.setDate(d.getDate() - 2); 
        return d.toISOString().split('T')[0];
    };

    // Ships toggle removed — no free keyless AIS API available

    // Flights toggle removed — layer removed due to API limitations
    
    document.getElementById('toggle-starlink')?.addEventListener('change', (e) => {
        toggles.starlink = e.target.checked;
        if (map.getLayer('starlink-layer')) map.setLayoutProperty('starlink-layer', 'visibility', toggles.starlink ? 'visible' : 'none');
    });

    document.getElementById('toggle-earthquakes')?.addEventListener('change', (e) => {
        toggles.earthquakes = e.target.checked;
        if (map.getLayer('earthquakes-core')) {
            map.setLayoutProperty('earthquakes-core', 'visibility', toggles.earthquakes ? 'visible' : 'none');
            map.setLayoutProperty('earthquakes-ring', 'visibility', toggles.earthquakes ? 'visible' : 'none');
            if (map.getLayer('earthquakes-tsunami-ring')) map.setLayoutProperty('earthquakes-tsunami-ring', 'visibility', toggles.earthquakes ? 'visible' : 'none');
            if (map.getLayer('earthquakes-pulse')) map.setLayoutProperty('earthquakes-pulse', 'visibility', toggles.earthquakes ? 'visible' : 'none');
        }
    });

    document.getElementById('toggle-fires')?.addEventListener('change', (e) => {
        toggles.fires = e.target.checked;
        if (map.getLayer('fires-layer')) map.setLayoutProperty('fires-layer', 'visibility', toggles.fires ? 'visible' : 'none');
    });

    document.getElementById('toggle-terminator')?.addEventListener('change', (e) => {
        toggles.terminator = e.target.checked;
        if (map.getLayer('terminator-layer')) map.setLayoutProperty('terminator-layer', 'visibility', toggles.terminator ? 'visible' : 'none');
    });

    // ── WEBCAM CAMERA CATALOG ─────────────────────────────
    // Each camera: { id, title, location, country, lat, lon, src, srcType, provider, tags }
    // srcType: 'foto-webcam' = real snapshot from foto-webcam.eu (verified working)
    // All cameras use foto-webcam.eu real snapshots (verified cross-origin working)
    const WEBCAM_CATALOG = [
        // ── Curated foto-webcam.eu cameras — verified working real snapshots ──
        { id: 'zugspitze', title: 'Zugspitze Summit', location: 'Garmisch-Partenkirchen', country: 'DEU',
          lat: 47.421, lon: 10.985, src: 'zugspitze', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['alps', 'mountain', 'germany'] },
        { id: 'feldberg-ts', title: 'Großer Feldberg', location: 'Taunus / Wiesbaden Area', country: 'DEU',
          lat: 50.222, lon: 8.446, src: 'feldberg-ts', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['taunus', 'hessen', 'wiesbaden'] },
        { id: 'nebelhorn', title: 'Nebelhorn Panorama', location: 'Oberstdorf, Allgäu Alps', country: 'DEU',
          lat: 47.408, lon: 10.343, src: 'nebelhorn', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['alps', 'panorama', 'germany'] },
        { id: 'muenchen', title: 'Munich Panorama', location: 'Munich, Bavaria', country: 'DEU',
          lat: 48.137, lon: 11.576, src: 'muenchen', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['city', 'bavaria', 'germany'] },
        { id: 'innsbruck', title: 'Innsbruck Seegrube', location: 'Innsbruck, Austria', country: 'AUT',
          lat: 47.306, lon: 11.388, src: 'innsbruck', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['city', 'alps', 'austria'] },
        { id: 'wien', title: 'Vienna Skyline', location: 'Wien Donaustadt', country: 'AUT',
          lat: 48.236, lon: 16.441, src: 'wien', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['city', 'austria'] },
        { id: 'salzburg', title: 'Salzburg Panorama', location: 'Hochstaufen View', country: 'AUT',
          lat: 47.760, lon: 12.873, src: 'salzburg', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['city', 'alps', 'austria'] },
        { id: 'sonnblick', title: 'Sonnblick Observatory', location: '3106m, Hohe Tauern', country: 'AUT',
          lat: 47.054, lon: 12.957, src: 'sonnblick', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['alps', 'science', 'austria'] },
        { id: 'konkordiahuette', title: 'Konkordiahütte', location: 'Aletsch Glacier, Switzerland', country: 'CHE',
          lat: 46.495, lon: 8.041, src: 'konkordiahuette', srcType: 'foto-webcam',
          provider: 'foto-webcam.eu', tags: ['alps', 'glacier', 'switzerland'] },
    ];


    let webcamRefreshTimers = [];

    const buildWebcamPopup = (cam) => {
        if (cam.srcType === 'foto-webcam') {
            // Real snapshot from foto-webcam.eu — verified working cross-origin
            const imgUrl = `https://www.foto-webcam.eu/webcam/${cam.src}/current/640.jpg`;
            const thumbId = `wcam-img-${cam.id}`;
            return `
                <div style="font-family:'Share Tech Mono',monospace; width:320px; background:rgba(0,10,20,0.97); border:1px solid #00d4ff; padding:0; border-radius:4px; overflow:hidden;">
                    <div style="padding:6px 10px; border-bottom:1px solid rgba(0,212,255,0.2); display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:#00d4ff; font-size:0.72rem; letter-spacing:1px;"><i class="fa-solid fa-video" style="margin-right:4px;"></i>${escHtml(cam.title)}</span>
                        <span style="font-size:0.5rem; color:#0f0; letter-spacing:1px;">● LIVE SNAPSHOT</span>
                    </div>
                    <div style="position:relative; width:100%; background:#000; line-height:0;">
                        <img id="${thumbId}" src="${imgUrl}" style="width:100%; height:auto; display:block; min-height:140px; object-fit:cover;"
                             alt="${escHtml(cam.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div style="display:none; width:100%; height:160px; align-items:center; justify-content:center; flex-direction:column; background:rgba(0,0,0,0.9);">
                            <i class="fa-solid fa-signal" style="color:#ff3344; font-size:1.5rem; margin-bottom:8px;"></i>
                            <span style="color:#ff3344; font-size:0.7rem; letter-spacing:1px;">SIGNAL LOST</span>
                        </div>
                    </div>
                    <div style="padding:5px 10px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06);">
                        <span style="font-size:0.5rem; color:rgba(255,255,255,0.35);">${escHtml(cam.location)}</span>
                        <a href="https://www.foto-webcam.eu/webcam/${cam.src}/" target="_blank" rel="noopener" style="font-size:0.48rem; color:#00d4ff; text-decoration:none; letter-spacing:1px;">FULL VIEW ↗</a>
                    </div>
                    <div style="padding:3px 10px 5px; font-size:0.42rem; color:rgba(255,255,255,0.2); letter-spacing:1px;">
                        SOURCE: ${escHtml(cam.provider)} · AUTO-REFRESH 60s · <span style="color:rgba(0,212,255,0.4);">foto-webcam.eu</span>
                    </div>
                </div>`;
        }
        return '<div style="padding:10px;color:#888;font-size:0.7rem;">No feed available</div>';
    };

    const initWebcams = () => {
        const camCount = WEBCAM_CATALOG.length;

        WEBCAM_CATALOG.forEach(cam => {
            const el = document.createElement('div');
            const markerColor = 'rgba(0,255,136,0.85)';
            const glowColor = 'rgba(0,255,136,0.6)';
            el.className = 'marker-webcam';
            el.style.cssText = `width:20px;height:20px;cursor:pointer;`;
            el.innerHTML = `<div style="width:20px;height:20px;background:${markerColor};border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;box-shadow:0 0 10px ${glowColor};transition:transform 0.2s;"><i class="fa-solid fa-video" style="font-size:8px;"></i></div>`;
            const inner = el.firstElementChild;
            el.onmouseenter = () => { inner.style.transform = 'scale(1.3)'; };
            el.onmouseleave = () => { inner.style.transform = 'scale(1)'; };

            const popup = new maplibregl.Popup({ offset: 14, maxWidth: '340px', closeButton: true })
                .setHTML(buildWebcamPopup(cam));

            const m = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([cam.lon, cam.lat])
                .setPopup(popup);

            webcamMarkers.push(m);
            if (toggles.webcams) m.addTo(map);
        });

        // Auto-refresh foto-webcam snapshots every 60s
        const refreshInterval = setInterval(() => {
            if (!toggles.webcams) return;
            WEBCAM_CATALOG.filter(c => c.srcType === 'foto-webcam').forEach(cam => {
                const img = document.getElementById(`wcam-img-${cam.id}`);
                if (img) {
                    img.src = `https://www.foto-webcam.eu/webcam/${cam.src}/current/640.jpg?t=${Date.now()}`;
                }
            });
        }, 60000);
        webcamRefreshTimers.push(refreshInterval);

        if (window.updateLayerStatus) updateLayerStatus('webcams', 'LIVE', `${camCount} live snapshot cameras`);
        setStatus(currentLang === 'de' ? `WEBCAMS ONLINE: ${camCount} Live-Kameras (foto-webcam.eu)` : `WEBCAMS ONLINE: ${camCount} live cameras (foto-webcam.eu)`);
    };

    document.getElementById('toggle-webcams')?.addEventListener('change', (e) => {
        toggles.webcams = e.target.checked;
        if (toggles.webcams && webcamMarkers.length === 0) initWebcams();
        webcamMarkers.forEach(m => toggles.webcams ? m.addTo(map) : m.remove());
    });

    const initISS = () => {
        const el = document.createElement('div');
        el.className = 'marker-iss';
        el.style.cssText = 'width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
        el.innerHTML = `<div style="width:36px;height:36px;border-radius:50%;background:rgba(0,255,204,0.15);border:2px solid #00ffcc;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(0,255,204,0.5),0 0 40px rgba(0,255,204,0.2);animation:iss-pulse 2s ease-in-out infinite;">
            <i class="fa-solid fa-satellite" style="color:#00ffcc;font-size:14px;filter:drop-shadow(0 0 4px #00ffcc);"></i>
        </div>`;

        // Add ISS pulse animation
        if (!document.getElementById('iss-pulse-style')) {
            const style = document.createElement('style');
            style.id = 'iss-pulse-style';
            style.textContent = `@keyframes iss-pulse { 0%,100%{box-shadow:0 0 16px rgba(0,255,204,0.5),0 0 40px rgba(0,255,204,0.2)} 50%{box-shadow:0 0 24px rgba(0,255,204,0.7),0 0 60px rgba(0,255,204,0.3)} }`;
            document.head.appendChild(style);
        }

        let issData = { latitude: 0, longitude: 0, altitude: 0, velocity: 0 };

        const issPopup = new maplibregl.Popup({ offset: 20, maxWidth: '280px', closeButton: true });

        const buildISSPopupHTML = () => `<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;max-width:320px;">
                    <h3 style="color:#00ffcc;margin:0 0 6px;font-size:.8rem;display:flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-satellite" style="font-size:.7rem;"></i> ${currentLang==='de'?'INTERNATIONALE RAUMSTATION':'INTERNATIONAL SPACE STATION'}
                    </h3>
                    <div style="opacity:.5;font-size:.6rem;margin-bottom:6px;">NASA / ROSCOSMOS / ESA / JAXA / CSA</div>
                    <div style="text-align:center;margin-bottom:8px;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/International_Space_Station_after_undocking_of_STS-132.jpg/320px-International_Space_Station_after_undocking_of_STS-132.jpg"
                             alt="ISS in orbit" style="max-width:100%;height:auto;max-height:140px;border-radius:4px;border:1px solid rgba(0,255,204,0.25);box-shadow:0 4px 15px rgba(0,0,0,0.6);object-fit:cover;"
                             onerror="this.style.display='none';" />
                        <div style="font-size:.45rem;color:rgba(255,255,255,0.3);margin-top:3px;letter-spacing:1px;">${currentLang==='de'?'ISS fotografiert vom Space Shuttle — NASA':'ISS photographed from Space Shuttle — NASA'}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
                        <div style="background:rgba(0,255,204,.05);padding:4px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'HÖHE':'ALTITUDE'}</div>
                            <div style="color:#00ffcc;font-size:.75rem;">${Math.round(issData.altitude)} km</div>
                        </div>
                        <div style="background:rgba(0,255,204,.05);padding:4px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'GESCHW.':'SPEED'}</div>
                            <div style="color:#00ffcc;font-size:.75rem;">${Math.round(issData.velocity).toLocaleString()} km/h</div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
                        <div style="background:rgba(0,255,204,.05);padding:4px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'BREITENGRAD':'LATITUDE'}</div>
                            <div style="font-size:.65rem;">${issData.latitude.toFixed(4)}°</div>
                        </div>
                        <div style="background:rgba(0,255,204,.05);padding:4px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'LÄNGENGRAD':'LONGITUDE'}</div>
                            <div style="font-size:.65rem;">${issData.longitude.toFixed(4)}°</div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:6px;">
                        <div style="background:rgba(0,255,204,.05);padding:3px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.45rem;">${currentLang==='de'?'MASSE':'MASS'}</div>
                            <div style="font-size:.6rem;color:#00ffcc;">420.000 kg</div>
                        </div>
                        <div style="background:rgba(0,255,204,.05);padding:3px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.45rem;">${currentLang==='de'?'BESATZUNG':'CREW'}</div>
                            <div style="font-size:.6rem;color:#00ffcc;">${currentLang==='de'?'7 Personen':'7 persons'}</div>
                        </div>
                        <div style="background:rgba(0,255,204,.05);padding:3px;text-align:center;border-radius:3px;">
                            <div style="opacity:.4;font-size:.45rem;">${currentLang==='de'?'SEIT':'SINCE'}</div>
                            <div style="font-size:.6rem;color:#00ffcc;">1998</div>
                        </div>
                    </div>
                    <div style="font-size:.55rem;opacity:.55;line-height:1.5;margin-bottom:6px;">
                        ${currentLang==='de'?'109m × 73m — größtes Bauwerk im All. Umkreist die Erde mit ~28.000 km/h. Mit bloßem Auge sichtbar. Hat 280+ Astronauten aus 21 Ländern beherbergt.':'109m × 73m — largest structure in space. Orbits at ~28,000 km/h. Visible from Earth with naked eye. Has hosted 280+ astronauts from 21 countries.'}
                    </div>
                    <a href="https://${currentLang==='de'?'de':'en'}.wikipedia.org/wiki/${currentLang==='de'?'Internationale_Raumstation':'International_Space_Station'}" target="_blank" rel="noopener"
                       style="display:block;font-size:.6rem;color:#00d4ff;text-decoration:none;letter-spacing:1px;border-top:1px solid rgba(0,212,255,.15);padding-top:4px;">
                        📚 ${currentLang==='de'?'Mehr auf Wikipedia erfahren ↗':'Learn more on Wikipedia ↗'}
                    </a>
                    <div style="opacity:.3;font-size:.45rem;margin-top:4px;letter-spacing:1px;">${currentLang==='de'?'UMKREIST DIE ERDE ALLE 90 MIN · LIVE VIA WHERETHEISS.AT':'ORBITS EARTH EVERY 90 MIN · LIVE VIA WHERETHEISS.AT'}</div>
                </div>`;

        // Update popup content on each open so telemetry is fresh
        el.addEventListener('click', () => {
            issPopup.setHTML(buildISSPopupHTML());
        });
        
        issMarker = new maplibregl.Marker({ element: el })
            .setLngLat([0,0])
            .setPopup(issPopup);

        const trackISS = async () => {
            try {
                const result = await window.reliableFetch('https://api.wheretheiss.at/v1/satellites/25544', 'iss_telemetry');
                const data = result.data;
                issData = { latitude: data.latitude, longitude: data.longitude, altitude: data.altitude, velocity: data.velocity };
                issMarker.setLngLat([data.longitude, data.latitude]);
                if (toggles.iss && !issMarker._map && !_tourActive) issMarker.addTo(map);
            } catch(e) {}
        };
        trackISS();
        setInterval(trackISS, 4000);
    };

    document.getElementById('toggle-iss')?.addEventListener('change', (e) => {
        toggles.iss = e.target.checked;
        if (toggles.iss) {
            if (!issMarker) initISS();
            else issMarker.addTo(map);
        } else {
            if (issMarker) issMarker.remove();
        }
    });

    document.getElementById('toggle-sst')?.addEventListener('change', (e) => {
        toggles.sst = e.target.checked;
        if (toggles.sst && !map.getSource('sst-src')) {
            const dateStr = getYesterdaysDateForGIBS();
            map.addSource('sst-src', {
                type: 'raster',
                tiles: [
                    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/' + dateStr + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png'
                ],
                tileSize: 256
            });
            map.addLayer({
                id: 'sst-layer',
                type: 'raster',
                source: 'sst-src',
                paint: { 'raster-opacity': 0.6 }
            }, map.getLayer('cables-layer') ? 'cables-layer' : undefined);
            if(window.updateLayerStatus) window.updateLayerStatus('sst', 'LIVE', 'NASA GIBS Online');
        }
        if (map.getLayer('sst-layer')) {
            map.setLayoutProperty('sst-layer', 'visibility', toggles.sst ? 'visible' : 'none');
        }
        // Show/hide SST legend
        const sstLegend = document.getElementById('layer-legend');
        if (sstLegend) sstLegend.style.display = toggles.sst ? 'block' : 'none';
        if (toggles.sst && sstLegend) {
            sstLegend.innerHTML = `<div class="legend-title">🌊 ${currentLang==='de'?'OZEANTEMPERATUR':'SEA SURFACE TEMP'} (°C)</div><div class="legend-bar" style="background:linear-gradient(90deg,#0000cc,#0066ff,#00ccff,#33ff99,#ffff00,#ff9900,#ff0000);"></div><div class="legend-labels"><span>-2</span><span>10</span><span>20</span><span>30+</span></div>`;
        }
    });

    document.getElementById('toggle-temperature')?.addEventListener('change', (e) => {
        toggles.temperature = e.target.checked;
        if (toggles.temperature && !map.getSource('temp-src')) {
            const dateStr = getYesterdaysDateForGIBS();
            map.addSource('temp-src', {
                type: 'raster',
                tiles: [
                    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/' + dateStr + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png'
                ],
                tileSize: 256
            });
            map.addLayer({
                id: 'temp-layer',
                type: 'raster',
                source: 'temp-src',
                paint: { 'raster-opacity': 0.55 }
            }, map.getLayer('cables-layer') ? 'cables-layer' : undefined);
            if(window.updateLayerStatus) window.updateLayerStatus('temperature', 'LIVE', 'NASA GIBS Online');
        }
        if (map.getLayer('temp-layer')) {
            map.setLayoutProperty('temp-layer', 'visibility', toggles.temperature ? 'visible' : 'none');
        }
        // Show/hide temperature legend
        const tempLegend = document.getElementById('layer-legend');
        if (tempLegend) tempLegend.style.display = toggles.temperature ? 'block' : 'none';
        if (toggles.temperature && tempLegend) {
            tempLegend.innerHTML = `<div class="legend-title">🌡️ ${currentLang==='de'?'OBERFLÄCHENTEMPERATUR':'SURFACE TEMP'} (°C)</div><div class="legend-bar" style="background:linear-gradient(90deg,#1a0533,#2b1577,#0044cc,#00bbff,#44ff88,#ccff00,#ffcc00,#ff5500,#cc0022);"></div><div class="legend-labels"><span>-25</span><span>0</span><span>25</span><span>50+</span></div>`;
        }
    });

    // ── POPULATION DENSITY TOGGLE ─────────────────────────
    document.getElementById('toggle-population')?.addEventListener('change', (e) => {
        toggles.population = e.target.checked;
        const vis = toggles.population ? 'visible' : 'none';
        if (map.getLayer('population-layer'))
            map.setLayoutProperty('population-layer', 'visibility', vis);
        if (map.getLayer('metro-cities-layer'))
            map.setLayoutProperty('metro-cities-layer', 'visibility', vis);
        if (map.getLayer('metro-cities-label'))
            map.setLayoutProperty('metro-cities-label', 'visibility', vis);
        // Show/hide population legend
        const popLegend = document.getElementById('layer-legend');
        if (popLegend) popLegend.style.display = toggles.population ? 'block' : 'none';
        if (toggles.population && popLegend) {
            popLegend.innerHTML = `<div class="legend-title">👥 ${currentLang==='de'?'BEVÖLKERUNGSDICHTE':'POPULATION DENSITY'} (per km²)</div><div class="legend-bar" style="background:linear-gradient(90deg,#000420,#0a1a4a,#1a3a7a,#3366bb,#5599dd,#88ccff,#ffee77,#ffaa33,#ff5500,#cc0000);"></div><div class="legend-labels"><span>0</span><span>50</span><span>500</span><span>5000+</span></div>`;
        }
    });

    // ── VOLCANOES (Smithsonian GVP — curated dataset) ─────
    const volcanoMarkers = [];
    const initVolcanoes = () => {
        const volcanoes = [
            [14.43,40.82,'Vesuvius','Italy','1281m','Last erupted 1944. Threatens 3M+ people in Naples.'],
            [15.21,37.73,'Mount Etna','Italy','3357m','Europe\'s most active. Erupts almost continuously.'],
            [14.96,38.79,'Stromboli','Italy','924m','Active for 2,000+ years.'],
            [-17.83,28.57,'Cumbre Vieja','Spain','2426m','2021 eruption destroyed 3,000 buildings.'],
            [-155.29,19.41,'Kilauea','USA (Hawaii)','1247m','One of most active. 2018 eruption destroyed 700 homes.'],
            [-122.20,46.20,'Mount St. Helens','USA','2549m','1980 eruption killed 57. VEI-5.'],
            [-121.76,46.85,'Mount Rainier','USA','4392m','Most dangerous in Cascades. Lahars threaten Tacoma.'],
            [29.24,-1.51,'Nyiragongo','DR Congo','3470m','Lava lake. 2021 eruption killed 32.'],
            [110.44,-7.54,'Mount Merapi','Indonesia','2930m','Most active in Indonesia. 2010 killed 353.'],
            [105.42,-6.10,'Krakatoa (Anak)','Indonesia','813m','2018 tsunami from flank collapse.'],
            [120.35,15.13,'Mount Pinatubo','Philippines','1486m','1991 VEI-6. Cooled Earth 0.5C.'],
            [130.66,31.59,'Sakurajima','Japan','1117m','Most active in Japan. Erupts hundreds of times/year.'],
            [-19.02,63.63,'Eyjafjallajokull','Iceland','1651m','2010 eruption shut down European airspace.'],
            [-17.32,64.63,'Katla','Iceland','1512m','Overdue for major eruption.'],
            [174.06,-39.28,'Mount Ruapehu','New Zealand','2797m','1953 lahar killed 151.'],
            [-78.44,-0.68,'Cotopaxi','Ecuador','5897m','One of highest active volcanoes.'],
            [-90.88,14.47,'Fuego','Guatemala','3763m','2018 eruption killed 431.'],
            [40.52,7.35,'Erta Ale','Ethiopia','613m','Persistent lava lake in Afar Depression.'],
            [-75.37,2.93,'Nevado del Ruiz','Colombia','5321m','1985 eruption killed 23,000 (Armero).'],
            [127.17,37.75,'Baekdu/Changbai','China/N.Korea','2744m','946 AD Millennium Eruption VEI-7.'],
            [168.12,-16.25,'Yasur','Vanuatu','361m','Continuously erupting for 800+ years.'],
        ];
        volcanoes.forEach(([lon, lat, name, country, elev, note]) => {
            const el = document.createElement('div');
            el.style.cssText = 'width:14px;height:14px;cursor:pointer;';
            el.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,13 1,13" fill="rgba(255,100,0,0.25)" stroke="#ff6600" stroke-width="1.2"/><circle cx="7" cy="5" r="1.5" fill="#ff4400" opacity="0.9"/></svg>';
            el.style.filter = 'drop-shadow(0 0 4px #ff6600)';
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '260px' }).setHTML(
                '<div style="font-family:\'Share Tech Mono\',monospace;font-size:.72rem;">' +
                '<h3 style="color:#ff6600;margin:0 0 5px;border-bottom:1px solid #ff660044;padding-bottom:3px;">🌋 ' + escHtml(name) + '</h3>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:5px;">' +
                '<div style="background:rgba(255,100,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">COUNTRY</div><div style="font-size:.65rem;">' + escHtml(country) + '</div></div>' +
                '<div style="background:rgba(255,100,0,.08);padding:3px 6px;"><div style="opacity:.5;font-size:.6rem;">ELEVATION</div><div style="color:#ff6600;">' + escHtml(elev) + '</div></div>' +
                '</div>' +
                '<div style="font-size:.65rem;opacity:.75;line-height:1.4;">' + escHtml(note) + '</div>' +
                '<div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: Smithsonian GVP 2024</div>' +
                '<a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(name.replace(/\s+/g,'_')) + '" target="_blank" rel="noopener" style="display:block;margin-top:6px;font-size:.6rem;color:#00d4ff;text-decoration:none;letter-spacing:1px;border-top:1px solid rgba(0,212,255,.15);padding-top:4px;">📚 Learn more on Wikipedia ↗</a></div>');
            const m = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lon, lat]).setPopup(popup);
            volcanoMarkers.push(m);
        });
    };

    document.getElementById('toggle-volcanoes')?.addEventListener('change', (e) => {
        toggles.volcanoes = e.target.checked;
        if (toggles.volcanoes && volcanoMarkers.length === 0) initVolcanoes();
        volcanoMarkers.forEach(m => toggles.volcanoes ? m.addTo(map) : m.remove());
    });

    // ── RADIATION SITES (Nuclear Accidents) ───────────────
    const radiationMarkers = [];
    const initRadiation = () => {
        const sites = [
            [30.10,51.39,'Chernobyl','Ukraine','1986','RBMK-1000 meltdown. 350,000 evacuated. 30km Exclusion Zone.','CRITICAL'],
            [141.03,37.42,'Fukushima Daiichi','Japan','2011','3 reactor meltdowns after tsunami. 154,000 evacuated.','CRITICAL'],
            [-76.72,40.17,'Three Mile Island','USA','1979','Partial meltdown Unit 2. Led to major US nuclear reforms.','HIGH'],
            [30.07,46.59,'Kyshtym/Mayak','Russia','1957','3rd worst nuclear disaster (INES-6). Plutonium explosion.','HIGH'],
            [-1.19,54.42,'Windscale (Sellafield)','UK','1957','Graphite fire. Europe\'s most contaminated site.','MODERATE'],
            [140.71,41.18,'Tokaimura','Japan','1999','Criticality accident. 2 workers died from radiation.','MODERATE'],
            [26.97,65.01,'Semipalatinsk','Kazakhstan','1949-89','456 nuclear tests. 1.5M people exposed.','CRITICAL'],
            [-116.05,37.07,'Nevada Test Site','USA','1951-92','928 nuclear tests. Downwinders exposed.','HIGH'],
            [166.35,11.58,'Bikini Atoll','Marshall Islands','1946-58','67 US nuclear tests. Still uninhabitable.','CRITICAL'],
            [-149.00,-21.10,'Moruroa Atoll','French Polynesia','1966-96','193 French nuclear tests.','HIGH'],
        ];
        const sevColors = { CRITICAL: '#ff0000', HIGH: '#ff6600', MODERATE: '#ffb000' };
        sites.forEach(([lon, lat, name, country, year, note, severity]) => {
            const c = sevColors[severity] || '#ff6600';
            const el = document.createElement('div');
            el.style.cssText = 'width:16px;height:16px;cursor:pointer;';
            el.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="' + c + '15" stroke="' + c + '" stroke-width="1.5"/><text x="8" y="12" text-anchor="middle" font-size="10" fill="' + c + '">☢</text></svg>';
            el.style.filter = 'drop-shadow(0 0 5px ' + c + ')';
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '280px' }).setHTML(
                '<div style="font-family:\'Share Tech Mono\',monospace;font-size:.72rem;">' +
                '<h3 style="color:' + c + ';margin:0 0 5px;border-bottom:1px solid ' + c + '44;padding-bottom:3px;">☢ ' + escHtml(name) + '</h3>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-bottom:5px;">' +
                '<div style="background:' + c + '11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">COUNTRY</div><div style="font-size:.6rem;">' + escHtml(country) + '</div></div>' +
                '<div style="background:' + c + '11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">YEAR</div><div style="color:' + c + ';">' + escHtml(year) + '</div></div>' +
                '<div style="background:' + c + '11;padding:3px;text-align:center;"><div style="opacity:.5;font-size:.55rem;">SEVERITY</div><div style="color:' + c + ';font-size:.6rem;">' + severity + '</div></div>' +
                '</div>' +
                '<div style="font-size:.65rem;opacity:.75;line-height:1.4;">' + escHtml(note) + '</div>' +
                '<div style="font-size:.55rem;opacity:.3;margin-top:5px;">Source: INES / IAEA / Safecast 2024</div>' +
                '<a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(name.replace(/\s+/g,'_')) + '" target="_blank" rel="noopener" style="display:block;margin-top:6px;font-size:.6rem;color:#00d4ff;text-decoration:none;letter-spacing:1px;border-top:1px solid rgba(0,212,255,.15);padding-top:4px;">📚 Learn more on Wikipedia ↗</a></div>');
            const m = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lon, lat]).setPopup(popup);
            radiationMarkers.push(m);
        });
    };

    document.getElementById('toggle-radiation')?.addEventListener('change', (e) => {
        toggles.radiation = e.target.checked;
        if (toggles.radiation && radiationMarkers.length === 0) initRadiation();
        radiationMarkers.forEach(m => toggles.radiation ? m.addTo(map) : m.remove());
    });

    // ── AURORA FORECAST TOGGLE ────────────────────────────
    document.getElementById('toggle-aurora')?.addEventListener('change', (e) => {
        toggles.aurora = e.target.checked;
        if (map.getLayer('aurora-layer')) map.setLayoutProperty('aurora-layer', 'visibility', toggles.aurora ? 'visible' : 'none');
        if (map.getLayer('aurora-south-layer')) map.setLayoutProperty('aurora-south-layer', 'visibility', toggles.aurora ? 'visible' : 'none');
    });

    // ── FIREBALL TRACKER TOGGLE ───────────────────────────
    document.getElementById('toggle-fireballs')?.addEventListener('change', (e) => {
        toggles.fireballs = e.target.checked;
        if (map.getLayer('fireballs-core')) map.setLayoutProperty('fireballs-core', 'visibility', toggles.fireballs ? 'visible' : 'none');
        if (map.getLayer('fireballs-glow')) map.setLayoutProperty('fireballs-glow', 'visibility', toggles.fireballs ? 'visible' : 'none');
    });

    // ── NUCLEAR ARSENAL TOGGLE (nukes) ────────────────────
    document.getElementById('toggle-nukes')?.addEventListener('change', (e) => {
        toggles.nukes = e.target.checked;
        if (toggles.nukes && nukeArsenalMarkers.length === 0 && nuclearMarkers.length === 0) initNuclearLayer();
        nukeArsenalMarkers.forEach(m => toggles.nukes ? m.addTo(map) : m.remove());
    });

    // ── GLOBAL TOGGLE CLICK SOUND ──────────────────────────
    document.querySelectorAll('.control-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => { if (window._geoSfx) window._geoSfx.tick(); });
    });

    // ── SYSTEM OVERRIDE (toggle-all) ──────────────────────
    document.getElementById('toggle-all')?.addEventListener('change', (e) => {
        const isOn = e.target.checked;
        const allToggles = document.querySelectorAll('.control-item input[type="checkbox"]');
        allToggles.forEach(cb => {
            if (cb.id === 'toggle-all' || cb.id === 'toggle-ticker') return;
            if (cb.checked !== isOn) {
                cb.checked = isOn;
                cb.dispatchEvent(new Event('change'));
            }
        });
        setStatus(isOn ? (currentLang === 'de' ? 'SYSTEM-OVERRIDE: ALLE EBENEN AKTIVIERT' : 'SYSTEM OVERRIDE: ALL LAYERS ACTIVATED') : (currentLang === 'de' ? 'SYSTEM-OVERRIDE: ALLE EBENEN DEAKTIVIERT' : 'SYSTEM OVERRIDE: ALL LAYERS DEACTIVATED'));
    });

    // ── NEWS BAND TOGGLE (toggle-ticker) ──────────────────
    document.getElementById('toggle-ticker')?.addEventListener('change', (e) => {
        const isOn = e.target.checked;
        if (isOn) {
            document.body.classList.remove('no-ticker');
        } else {
            document.body.classList.add('no-ticker');
        }
    });

    // ── COUNTRY BORDERS & LABELS ─────────────────────────
    const COUNTRY_CENTROIDS = [
        [-98.5,39.8,'USA'],[-106.3,56.1,'Canada'],[-102.5,23.6,'Mexico'],[-51.9,-14.2,'Brazil'],
        [-63.6,-38.4,'Argentina'],[-75.0,-9.2,'Peru'],[-71.4,4.6,'Colombia'],[-56.0,-32.5,'Uruguay'],
        [-70.6,-33.4,'Chile'],[-68.0,-16.5,'Bolivia'],[-79.5,-1.8,'Ecuador'],[-58.4,-23.4,'Paraguay'],
        [-77.8,21.5,'Cuba'],[-3.4,40.5,'Spain'],[2.2,46.6,'France'],[12.5,41.9,'Italy'],
        [10.4,51.2,'Germany'],[-1.5,52.4,'UK'],[4.5,50.5,'Belgium'],[5.3,52.1,'Netherlands'],
        [8.2,46.8,'Switzerland'],[13.5,47.5,'Austria'],[15.5,49.8,'Czechia'],[19.1,51.9,'Poland'],
        [25.3,42.7,'Bulgaria'],[24.7,45.9,'Romania'],[19.5,47.2,'Hungary'],[20.9,44.0,'Serbia'],
        [24.3,39.1,'Greece'],[35.2,39.0,'Turkey'],[14.5,56.3,'Sweden'],[8.5,60.5,'Norway'],
        [9.5,56.3,'Denmark'],[-19.0,65.0,'Iceland'],[26.0,64.0,'Finland'],[25.0,49.0,'Ukraine'],
        [28.0,53.5,'Belarus'],[90.0,62.0,'Russia'],[53.7,32.4,'Iran'],[43.7,33.2,'Iraq'],
        [45.0,24.0,'Saudi Arabia'],[55.9,25.3,'UAE'],[48.5,15.6,'Yemen'],[30.0,26.0,'Egypt'],
        [3.0,28.0,'Algeria'],[-5.0,32.0,'Morocco'],[10.0,34.0,'Tunisia'],[17.5,28.0,'Libya'],
        [8.7,9.1,'Nigeria'],[38.0,9.0,'Ethiopia'],[37.9,-0.0,'Kenya'],[32.3,1.4,'Uganda'],
        [29.9,-2.0,'Rwanda'],[34.0,-6.4,'Tanzania'],[28.0,-29.0,'South Africa'],
        [25.0,-22.3,'Botswana'],[24.0,-13.1,'Zambia'],[29.2,-19.0,'Zimbabwe'],
        [17.1,-12.3,'Angola'],[35.5,-15.4,'Malawi'],[23.7,-0.3,'DR Congo'],
        [105.0,35.0,'China'],[138.3,36.2,'Japan'],[127.8,36.0,'South Korea'],
        [77.0,20.6,'India'],[90.3,23.7,'Bangladesh'],[84.1,28.4,'Nepal'],
        [104.2,12.6,'Cambodia'],[106.3,16.0,'Laos'],[96.0,21.9,'Myanmar'],
        [100.5,13.8,'Thailand'],[108.3,14.1,'Vietnam'],[121.8,12.9,'Philippines'],
        [113.9,-0.8,'Indonesia'],[101.7,3.1,'Malaysia'],[103.8,1.4,'Singapore'],
        [133.8,-25.3,'Australia'],[174.9,-40.9,'New Zealand'],[69.0,49.0,'Kazakhstan'],
        [64.6,41.4,'Uzbekistan'],[67.7,33.9,'Afghanistan'],[69.3,30.4,'Pakistan'],
        [23.9,55.2,'Lithuania'],[24.6,56.9,'Latvia'],[25.0,58.6,'Estonia'],
        [44.6,40.1,'Armenia'],[43.4,42.3,'Georgia'],[47.6,40.1,'Azerbaijan'],
        [-8.2,53.4,'Ireland'],[14.5,46.1,'Slovenia'],[15.2,45.1,'Croatia'],
        [17.7,44.2,'Bosnia'],[20.1,41.1,'Albania'],[21.0,41.5,'N. Macedonia'],
        [-1.5,12.3,'Burkina Faso'],[-1.2,7.9,'Ghana'],[-5.5,7.5,"Côte d'Ivoire"],
        [-14.5,14.5,'Senegal'],[-11.8,10.0,'Guinea'],[1.7,12.3,'Niger'],
        [15.2,6.6,'Central African Rep.'],[11.6,6.0,'Cameroon'],
        [46.2,5.2,'Somalia'],[30.1,15.4,'Sudan'],[32.3,3.0,'South Sudan'],
        [34.3,31.5,'Israel'],[35.5,33.9,'Lebanon'],[38.9,35.0,'Syria'],
        [35.9,31.9,'Jordan'],[47.5,29.3,'Kuwait'],[50.6,26.0,'Bahrain'],
        [51.2,25.3,'Qatar'],[56.1,21.5,'Oman'],[27.9,47.4,'Moldova'],
        [19.3,42.7,'Montenegro'],[-89.0,15.8,'Guatemala'],[-86.2,12.8,'Nicaragua'],
        [-87.2,14.1,'Honduras'],[-84.1,9.7,'Costa Rica'],[-80.8,8.5,'Panama'],
        [-66.6,6.4,'Venezuela']
    ];

    document.getElementById('toggle-borders')?.addEventListener('change', async (e) => {
        toggles.borders = e.target.checked;
        if (toggles.borders && !map.getSource('borders-src')) {
            try {
                setStatus(currentLang === 'de' ? 'LÄNDERGRENZEN WERDEN GELADEN...' : 'LOADING COUNTRY BOUNDARIES...');
                const resp = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
                const world = await resp.json();
                const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
                map.addSource('borders-src', { type: 'geojson', data: borders });
                map.addLayer({
                    id: 'country-borders', type: 'line', source: 'borders-src',
                    paint: {
                        'line-color': 'rgba(255,255,255,0.3)',
                        'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.3, 4, 0.8, 8, 1.5]
                    },
                    layout: { visibility: 'visible' }
                });
                const labelData = {
                    type: 'FeatureCollection',
                    features: COUNTRY_CENTROIDS.map(([lon, lat, name]) => ({
                        type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] },
                        properties: { name }
                    }))
                };
                map.addSource('country-labels-src', { type: 'geojson', data: labelData });
                map.addLayer({
                    id: 'country-labels', type: 'symbol', source: 'country-labels-src',
                    layout: {
                        'text-field': ['get', 'name'], 'text-font': ['Open Sans Regular'],
                        'text-size': ['interpolate', ['linear'], ['zoom'], 3, 7, 6, 10, 8, 12],
                        'text-transform': 'uppercase', 'text-letter-spacing': 0.08,
                        'text-max-width': 8, visibility: 'visible'
                    },
                    paint: {
                        'text-color': 'rgba(255,255,255,0.45)',
                        'text-halo-color': 'rgba(0,0,0,0.75)', 'text-halo-width': 1.5
                    },
                    minzoom: 3, maxzoom: 8
                });
                setStatus(currentLang === 'de' ? 'LÄNDERGRENZEN GELADEN — ' + COUNTRY_CENTROIDS.length + ' NATIONEN' : 'COUNTRY BOUNDARIES LOADED — ' + COUNTRY_CENTROIDS.length + ' NATIONS');
                if(window.updateLayerStatus) window.updateLayerStatus('borders', 'LIVE', 'Natural Earth Data');
            } catch (err) {
                console.warn('[borders] Failed:', err);
                setStatus(currentLang === 'de' ? 'GRENZDATEN NICHT VERFÜGBAR' : 'BORDER DATA UNAVAILABLE');
            }
        }
        if (map.getLayer('country-borders')) map.setLayoutProperty('country-borders', 'visibility', toggles.borders ? 'visible' : 'none');
        if (map.getLayer('country-labels')) map.setLayoutProperty('country-labels', 'visibility', toggles.borders ? 'visible' : 'none');
    });

    // ============================================================
    // AI GEOPOLITICAL COMPUTE CAPABILITY
    // Tracks global semiconductor, power, and AI infrastructure
    // ============================================================
    const aiAtlasMarkers = [];
    let aiAtlasSourceAdded = false;

    const AI_ATLAS_CLUSTERS = [
        {
            id: 'US-EAST',
            name: 'US-East Hub (N. Virginia)',
            lat: 38.99, lon: -77.49,
            score: 91,
            color: '#00ffcc',
            energy: 8, cooling: 6, connectivity: 10, geopolitics: 9, regulation: 8,
            desc: 'Highest global density, massive energy consumption. Backed by US grid and nuclear PPA deals (Amazon/Microsoft). Not heavily regulated compared to EU.',
            related: ['cables', 'datacenters', 'nuclear']
        },
        {
            id: 'NORDIC',
            name: 'Nordic Sovereign Hub',
            lat: 60.17, lon: 20.00,
            score: 84,
            color: '#00d4ff',
            energy: 9, cooling: 10, connectivity: 7, geopolitics: 8, regulation: 4,
            desc: 'Excellent natural cooling and 100% renewable capability. Hindered by EU AI Act regulatory friction and slightly lower bandwidth redundancy.',
            related: ['cables', 'datacenters', 'power']
        },
        {
            id: 'MENA',
            name: 'MENA Emerging Hub',
            lat: 24.5, lon: 51.5,
            score: 68,
            color: '#ffb000',
            energy: 7, cooling: 2, connectivity: 8, geopolitics: 5, regulation: 9,
            desc: 'Massive capital expenditure and hyperscale growth. However, limited freshwater for cooling, intense thermal load, and medium geopolitical instability.',
            related: ['cables', 'datacenters']
        },
        {
            id: 'APAC-TAIWAN',
            name: 'Taiwan/Singapore Corridor',
            lat: 23.69, lon: 119.5,
            score: 64,
            color: '#ff3300',
            energy: 7, cooling: 5, connectivity: 9, geopolitics: 2, regulation: 7,
            desc: 'World-class semiconductor manufacturing and hyperscale capability. Severely threatened by invasion risk and blockade scenarios.',
            related: ['cables', 'datacenters', 'conflicts']
        },
        {
            id: 'CHINA-EAST',
            name: 'China East Coast',
            lat: 31.23, lon: 121.47,
            score: 75,
            color: '#ff6600',
            energy: 9, cooling: 5, connectivity: 6, geopolitics: 7, regulation: 3,
            desc: 'Massive state-backed infrastructure. Restricted by US semiconductor export controls (A100/H100 bans) forcing internal silicon development.',
            related: ['power', 'datacenters', 'regimes']
        }
    ];

    const initAiAtlas = () => {
        if (!map.getSource('ai-atlas-connections')) {
            map.addSource('ai-atlas-connections', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.addLayer({
                id: 'ai-atlas-lines',
                type: 'line',
                source: 'ai-atlas-connections',
                layout: { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'none' },
                paint: {
                    'line-color': '#00d4ff',
                    'line-width': 2,
                    'line-opacity': 0.6,
                    'line-dasharray': [2, 4]
                }
            });
            aiAtlasSourceAdded = true;
        }

        AI_ATLAS_CLUSTERS.forEach(cluster => {
            const el = document.createElement('div');
            el.className = 'ai-atlas-marker';
            el.innerHTML = `<div class="ai-score-ring" style="border-color: ${cluster.color}"></div>
                            <div class="ai-cluster-label" style="color: ${cluster.color}">${cluster.id}</div>`;
            
            el.addEventListener('click', () => {
                window.openBriefing({
                    id: `AIA-${cluster.id}`,
                    title: `AI CAPABILITY: ${cluster.name}`,
                    severity: cluster.score < 70 ? 'high' : (cluster.score < 80 ? 'medium' : 'low'),
                    what: `Aggregated Capability Score: ${cluster.score}/100<br><br>${cluster.desc}`,
                    why: `<strong>Energy & Thermal:</strong> ${cluster.energy}/10 (Power), ${cluster.cooling}/10 (Cooling)<br><strong>Connectivity:</strong> ${cluster.connectivity}/10<br><strong>Geopolitics:</strong> ${cluster.geopolitics}/10<br><strong>Regulation/Friction:</strong> ${cluster.regulation}/10`,
                    time: "Assessed Q2 2026",
                    source: "GEOPULSE Strategy Core",
                    location: [cluster.lon, cluster.lat],
                    relatedLayers: cluster.related.map(r => ({ label: `Toggle ${r}`, layerId: r }))
                });
            });

            const m = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([cluster.lon, cluster.lat]);
            aiAtlasMarkers.push(m);
        });
        
        // Build lines
        const lines = { type: 'FeatureCollection', features: [] };
        for(let i=0; i<AI_ATLAS_CLUSTERS.length; i++) {
            for(let j=i+1; j<AI_ATLAS_CLUSTERS.length; j++) {
                if(AI_ATLAS_CLUSTERS[i].score >= 70 && AI_ATLAS_CLUSTERS[j].score >= 70) {
                    lines.features.push({
                        type: 'Feature',
                        geometry: { type: 'LineString', coordinates: [
                            [AI_ATLAS_CLUSTERS[i].lon, AI_ATLAS_CLUSTERS[i].lat],
                            [AI_ATLAS_CLUSTERS[j].lon, AI_ATLAS_CLUSTERS[j].lat]
                        ]}
                    });
                }
            }
        }
        map.getSource('ai-atlas-connections').setData(lines);
    };

    document.getElementById('toggle-ai-atlas')?.addEventListener('change', (e) => {
        toggles.aiAtlas = e.target.checked;
        
        if (toggles.aiAtlas && aiAtlasMarkers.length === 0) {
            initAiAtlas();
        }

        aiAtlasMarkers.forEach(m => toggles.aiAtlas ? m.addTo(map) : m.remove());
        if(map.getLayer('ai-atlas-lines')) {
            map.setLayoutProperty('ai-atlas-lines', 'visibility', toggles.aiAtlas ? 'visible' : 'none');
        }

        if (toggles.aiAtlas) {
            // Auto-enable supporting layers
            const deps = ['toggle-datacenters', 'toggle-cables', 'toggle-nuclear'];
            deps.forEach(dep => {
                const cb = document.getElementById(dep);
                if (cb && !cb.checked) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
            // Dim background (simulate Analytics mode)
            document.body.classList.add('mode-analyze');
        } else {
            document.body.classList.remove('mode-analyze');
        }
    });

    const sidePanel = document.getElementById('sidebar');
    // infoPanel already declared above — reuse it
    const expandHint = document.querySelector('.sidebar-expand-hint');
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (expandHint && sidePanel) {
        expandHint.addEventListener('click', () => {
            if (isTouchDevice) {
                sidePanel.classList.toggle('touch-open');
            } else {
                sidePanel.classList.toggle('sidebar-collapsed');
                if (sidePanel.classList.contains('sidebar-collapsed')) {
                    sidePanel.style.maxHeight = '42px';
                    sidePanel.style.overflowY = 'hidden';
                    expandHint.textContent = '▼ EXPAND';
                } else {
                    sidePanel.style.maxHeight = '90vh';
                    sidePanel.style.overflowY = 'auto';
                    expandHint.textContent = '▲ COLLAPSE';
                }
            }
        });
    }

    // iPad/touch: toggle info-panel on header tap
    if (isTouchDevice && infoPanel) {
        const infoHeader = infoPanel.querySelector('header');
        if (infoHeader) {
            infoHeader.addEventListener('click', () => {
                infoPanel.classList.toggle('touch-open');
            });
        }
    }

    // iPad/touch: close panels when tapping the map
    if (isTouchDevice) {
        document.getElementById('map')?.addEventListener('click', () => {
            sidePanel?.classList.remove('touch-open');
            infoPanel?.classList.remove('touch-open');
        });
    }

    // ============================================================
    // WELCOME OVERLAY (First Visit Experience)
    // ============================================================
    const welcomeOverlay = document.getElementById('welcome-overlay');

    const dismissWelcome = (startTourId) => {
        if (!welcomeOverlay) return;
        welcomeOverlay.classList.add('hidden');
        if (startTourId) {
            setTimeout(() => startTour(startTourId), 600);
        }
    };

    if (welcomeOverlay) {
        // Always show the welcome overlay as an impressive gateway
        welcomeOverlay.classList.remove('hidden');
        // "START GUIDED TOUR" → launches the welcome mini-tour
        document.getElementById('welcome-tour')?.addEventListener('click', () => {
            dismissWelcome('welcome');
        });
        // "OPEN MANUAL" → opens manual (handled by onclick in HTML)
        document.getElementById('welcome-manual')?.addEventListener('click', () => {
            dismissWelcome(null);
        });
        // "EXPLORE FREELY" → just close and explore
        document.getElementById('welcome-explore')?.addEventListener('click', () => {
            dismissWelcome(null);
        });
    }

    // Expose startTour globally for the quick-links demo button
    window._geopulseStartTour = (tourId) => { if (typeof startTour === 'function') startTour(tourId); };

    // ============================================================
    // GUIDED TOUR ENGINE
    // ============================================================
    const TOURS = {
        welcome: {
            name: 'Welcome to GEOPULSE',
            name_de: 'Willkommen bei GEOPULSE',
            steps: [
                {
                    center: [140, 35], zoom: 4,
                    title: '🌍 REAL-TIME DATA — LIVE FROM SPACE',
                    title_de: '🌍 ECHTZEIT-DATEN — LIVE AUS DEM ALL',
                    text: 'Welcome to GEOPULSE! Right now, seismic sensors around the world are streaming earthquake data to this map. Toggle "Earthquakes" in the sidebar to see today\'s seismic activity — each circle is a real event detected by USGS in the last 24 hours. You can also track live wildfires, webcams, and the ISS orbit.',
                    text_de: 'Willkommen bei GEOPULSE! Gerade jetzt streamen seismische Sensoren weltweit Erdbebendaten auf diese Karte. Schalten Sie "Erdbeben" in der Seitenleiste ein, um die heutige Aktivität zu sehen — jeder Kreis ist ein reales Ereignis der letzten 24 Stunden. Sie können auch Waldbrände, Webcams und die ISS-Umlaufbahn live verfolgen.',
                    layers: []
                },
                {
                    center: [-77.04, 38.9], zoom: 4,
                    title: '🏛️ GUIDED TOURS — LEARN BY EXPLORING',
                    title_de: '🏛️ GEFÜHRTE TOUREN — LERNEN DURCH ENTDECKEN',
                    text: 'GEOPULSE offers now 40 guided tours on geopolitics, history, science, and the environment. Each tour flies you to key locations with expert briefings and Wikipedia references. Try the "Trump World Tour" to trace U.S. foreign policy across 9 countries — or explore cosmic impacts, aurora hunting, espionage, and climate change.',
                    text_de: 'GEOPULSE bietet jetzt 40 geführte Touren zu Geopolitik, Geschichte, Wissenschaft und Umwelt. Jede Tour fliegt Sie zu Schlüsselorten mit Expertenbriefings und Wikipedia-Referenzen. Probieren Sie die "Trump Welttour" mit 9 Ländern — oder erkunden Sie kosmische Einschläge, Polarlichtjagd, Spionage und Klimawandel.',
                    layers: []
                },
                {
                    center: [20, 20], zoom: 2,
                    title: '🗺️ YOUR COMMAND CENTER — 20+ LAYERS',
                    title_de: '🗺️ IHRE KOMMANDOZENTRALE — 20+ EBENEN',
                    text: 'Open the sidebar (top-right) to access 22+ data layers: political regimes, military alliances, conflict zones, submarine cables, nuclear sites, aurora forecasts, meteor fireballs, and more. Combine layers to discover patterns — like how conflict zones overlap with resource routes. This is your global intelligence dashboard. Start exploring!',
                    text_de: 'Öffnen Sie die Seitenleiste (oben rechts) für 22+ Datenebenen: Regierungsformen, Militärbündnisse, Konfliktzonen, Seekabel, Atomstandorte, Polarlichtvorhersagen, Meteoreinschläge und mehr. Kombinieren Sie Ebenen, um Muster zu entdecken — etwa wie Konfliktzonen sich mit Ressourcenrouten überschneiden. Dies ist Ihr globales Nachrichtenzentrum. Viel Spaß beim Erkunden!',
                    layers: []
                }
            ]
        },
        ringoffire: {
            name: 'Ring of Fire',
            steps: [
                {
                    center: [140, 35], zoom: 12, title: '\ud83c\udf0b MOUNT FUJI \u2014 JAPAN',
                    text: 'Japan sits on the Pacific Ring of Fire \u2014 a 40,000km horseshoe of seismic and volcanic activity. Mount Fuji (3,776m) last erupted in 1707 and is monitored 24/7. Japan experiences ~1,500 earthquakes per year.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [110, -7.5], zoom: 12, title: '\ud83c\udf0b KRAKATOA & MERAPI \u2014 INDONESIA',
                    text: 'Indonesia has 130+ active volcanoes \u2014 the most of any country. Krakatoa\'s 1883 eruption was heard 5,000km away and caused a global temperature drop. The child volcano, Anak Krakatau, triggered a tsunami in 2018.',
                    layers: ['earthquakes', 'volcanoes'],
                    image: { wiki: 'Krakatoa', caption: 'Anak Krakatau erupting' }
                },
                {
                    center: [-122, 46.2], zoom: 10, title: '\ud83c\udf0b CASCADES RANGE \u2014 USA',
                    text: 'The Cascade Range stretches from BC to California. Mount St. Helens\' 1980 eruption killed 57 and was the deadliest in US history. Mount Rainier is considered the most dangerous due to lahar risk threatening 3M+ residents near Tacoma and Seattle.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [-78, -1], zoom: 10, title: '\ud83c\udf0b ANDES VOLCANOES \u2014 SOUTH AMERICA',
                    text: 'The Andes chain hosts Earth\'s highest active volcanoes. Cotopaxi (5,897m) in Ecuador is one of the world\'s most dangerous. Nevado del Ruiz in Colombia killed 23,000 people in 1985 when lahars buried the town of Armero.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [-20, 64], zoom: 10, title: '\ud83c\udf0b ICELAND \u2014 MID-ATLANTIC RIDGE',
                    text: 'Iceland sits directly on the Mid-Atlantic Ridge where the Eurasian and North American tectonic plates pull apart. Eyjafjallaj\u00f6kull\'s 2010 eruption shut down European airspace for 6 days, stranding 10 million travelers. The island has 30+ active volcanic systems.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [155, 0], zoom: 2, title: '\ud83c\udf0d THE COMPLETE RING OF FIRE',
                    text: 'The Pacific Ring of Fire accounts for 75% of all volcanic eruptions and 90% of all earthquakes worldwide. It stretches 40,000km from New Zealand, through Japan, across Alaska, and down the Americas. Over 450 volcanoes line this arc, making it the most geologically active zone on Earth.',
                    layers: ['earthquakes', 'volcanoes']
                }
            ]
        },
        nuclear: {
            name: 'Nuclear Legacy',
            steps: [
                {
                    center: [30.1, 51.4], zoom: 5, title: '\u2622\ufe0f CHERNOBYL \u2014 UKRAINE, 1986',
                    text: 'On April 26, 1986, Reactor 4 of the Chernobyl Nuclear Power Plant suffered a catastrophic meltdown and explosion. It released 400 times more radiation than the Hiroshima bomb. 350,000 people were permanently evacuated. The 30km Exclusion Zone remains uninhabitable. Click the ☢️ markers to see each site\'s full details.',
                    layers: ['radiation'],
                    image: { wiki: 'Chernobyl_disaster', caption: 'Chernobyl Reactor 4 sarcophagus' }
                },
                {
                    center: [141.03, 37.42], zoom: 5, title: '\u2622\ufe0f FUKUSHIMA DAIICHI \u2014 JAPAN, 2011',
                    text: 'On March 11, 2011, a magnitude 9.1 earthquake triggered a 14-meter tsunami that overwhelmed Fukushima\'s sea walls. Three reactors suffered full meltdowns. 154,000 residents were evacuated. In 2023, Japan began the controversial release of treated radioactive water into the Pacific Ocean \u2014 a process that will continue for 30+ years.',
                    layers: ['radiation']
                },
                {
                    center: [-76.7, 40.2], zoom: 5, title: '\u2622\ufe0f THREE MILE ISLAND \u2014 USA, 1979',
                    text: 'The partial meltdown of TMI-2 near Harrisburg, Pennsylvania was the worst nuclear accident in US history. Though no deaths resulted, it fundamentally changed nuclear regulation worldwide. No new US reactor was approved for 34 years. In 2024, Microsoft announced a deal to restart TMI-1 to power AI data centers.',
                    layers: ['radiation']
                },
                {
                    center: [70, 50], zoom: 4, title: '\u2622\ufe0f SEMIPALATINSK \u2014 KAZAKHSTAN, 1949\u20131989',
                    text: 'The Soviet "Polygon" hosted 456 nuclear weapon tests over 40 years \u2014 including 116 atmospheric detonations. 1.5 million people in surrounding villages were exposed to fallout without their knowledge. Cancer rates remain 50% above national baseline. The site was closed in 1991 after Kazakh independence.',
                    layers: ['radiation']
                },
                {
                    center: [166.35, 11.6], zoom: 5, title: '\u2622\ufe0f BIKINI ATOLL \u2014 MARSHALL ISLANDS, 1946\u20131958',
                    text: 'The US conducted 67 nuclear tests at Bikini, including Castle Bravo (1954) \u2014 a 15-megaton blast 1,000 times more powerful than Hiroshima. The 167 Bikini islanders were relocated "temporarily" and have never returned. Radiation levels remain too high for habitation 70+ years later. The crater is visible from space.',
                    layers: ['radiation']
                }
            ]
        },
        cables: {
            name: 'Digital Silk Road',
            steps: [
                {
                    center: [-5, 50], zoom: 4, title: '\ud83c\udf10 CORNWALL \u2014 CABLE LANDING HUB',
                    text: '95% of intercontinental data travels through undersea fiber-optic cables \u2014 NOT satellites. Cornwall, England is one of the world\'s most important cable landing points. Cables connecting to the US, Europe, and Africa converge here. A single cable can carry 250 terabits per second.',
                    layers: ['cables']
                },
                {
                    center: [32, 30], zoom: 4, title: '\ud83c\udf10 SUEZ CANAL & RED SEA \u2014 CHOKEPOINT',
                    text: 'Over a dozen submarine cables pass through the Red Sea and Suez corridor, carrying internet traffic between Europe and Asia. In 2024, Houthi attacks damaged 3 cables, disrupting 25% of traffic for months. This narrow passage is one of the most vulnerable points in global internet infrastructure.',
                    layers: ['cables']
                },
                {
                    center: [103.8, 1.3], zoom: 4, title: '\ud83c\udf10 SINGAPORE \u2014 ASIA\'S DIGITAL CROSSROADS',
                    text: 'Singapore is the largest submarine cable hub in Asia, where cables from Europe, Australia, Japan, and the Americas converge. It houses over 70 data centers. If Singapore\'s cable connections were severed, half of Southeast Asia\'s internet would go dark.',
                    layers: ['cables']
                },
                {
                    center: [-40, 30], zoom: 3, title: '\ud83c\udf10 TRANSATLANTIC CABLES \u2014 THE BACKBONE',
                    text: 'The first transatlantic telegraph cable was laid in 1858. Today, over 15 fiber-optic cables connect North America to Europe across the Atlantic seabed. Google, Meta, Microsoft, and Amazon have invested billions in private cables. A single modern cable can handle the entire internet traffic of a medium-sized country.',
                    layers: ['cables']
                },
                {
                    center: [60, 20], zoom: 2, title: '\ud83c\udf0d THE GLOBAL CABLE NETWORK',
                    text: 'There are over 550 active submarine cables spanning 1.4 million kilometers across the ocean floor. They are just 3cm thick but carry $10 trillion in financial transactions daily. Cable damage from ship anchors, earthquakes, and even shark bites causes ~200 faults per year. Without these cables, the modern internet would cease to exist.',
                    layers: ['cables']
                }
            ]
        },
        bri: {
            name: 'Belt & Road Initiative',
            steps: [
                {
                    center: [108.9, 34.3], zoom: 5, title: '\ud83d\udee4\ufe0f XI\'AN \u2014 WHERE IT ALL BEGINS',
                    text: 'Xi\'an was the starting point of the ancient Silk Road 2,000 years ago. In 2013, President Xi Jinping announced the Belt and Road Initiative (BRI) here \u2014 the largest infrastructure project in human history. Over $1 trillion invested across 150+ countries. The "Belt" is land routes, the "Road" is maritime.',
                    layers: ['blocs', 'cables']
                },
                {
                    center: [62.3, 30.5], zoom: 5, title: '\ud83d\udee4\ufe0f CPEC \u2014 CHINA-PAKISTAN CORRIDOR',
                    text: 'The China\u2013Pakistan Economic Corridor (CPEC) is BRI\'s flagship: a $62 billion network of roads, railways, and pipelines connecting Kashgar in western China to Gwadar Port on the Arabian Sea. It gives China direct access to the Indian Ocean, bypassing the Strait of Malacca. Pakistan receives infrastructure but faces debt concerns exceeding $30 billion.',
                    layers: ['blocs', 'cables']
                },
                {
                    center: [23.7, 37.9], zoom: 5, title: '\ud83d\udee4\ufe0f PIRAEUS \u2014 CHINA\'S GATEWAY TO EUROPE',
                    text: 'In 2016, Chinese state shipping giant COSCO acquired 67% of Piraeus port in Greece for \u20ac1.5 billion. Container throughput has grown 700% since. Piraeus is now China\'s entry point into the European market, connecting via rail to Budapest, Belgrade, and Central Europe. The EU has since tightened foreign investment screening.',
                    layers: ['blocs']
                },
                {
                    center: [43.1, 11.6], zoom: 5, title: '\ud83d\udee4\ufe0f DJIBOUTI \u2014 CHINA\'S MILITARY FOOTPRINT',
                    text: 'This tiny East African nation hosts China\'s first overseas military base (opened 2017), located just 10km from the US base Camp Lemonnier. China also built Djibouti\'s $3.5 billion railway to Addis Ababa, its largest port, and its water pipeline. Djibouti\'s debt to China exceeds 70% of GDP \u2014 a textbook case in the "debt-trap diplomacy" debate.',
                    layers: ['blocs', 'conflicts']
                },
                {
                    center: [36.8, -1.3], zoom: 5, title: '\ud83d\udee4\ufe0f NAIROBI \u2014 AFRICA\'S BRI HUB',
                    text: 'Kenya\'s $3.6 billion Mombasa\u2013Nairobi Standard Gauge Railway was built by China Road and Bridge Corporation. It cut travel time from 12 hours to 4.5. But Kenya had to use Mombasa port as collateral for the loan, sparking sovereignty concerns across Africa. China is now the continent\'s largest bilateral lender, with $170+ billion in loans since 2000.',
                    layers: ['blocs']
                },
                {
                    center: [80, 30], zoom: 2, title: '\ud83c\udf0d BELT & ROAD \u2014 THE FULL PICTURE',
                    text: 'The BRI now spans 150+ countries and $1 trillion in investments: ports in Sri Lanka, railways in Laos, bridges in Bangladesh, power plants in Indonesia. Critics call it debt-trap diplomacy \u2014 Sri Lanka handed over Hambantota port for 99 years after defaulting. Supporters say it fills a $40 trillion global infrastructure gap. Either way, it is reshaping the world order.',
                    layers: ['blocs', 'cables']
                }
            ]
        },
        coldwar: {
            name: 'Cold War to Reunification',
            steps: [
                {
                    center: [13.4, 52.5], zoom: 6, title: '\ud83e\uddf1 BERLIN \u2014 THE DIVIDED CITY',
                    text: 'From 1961 to 1989, the Berlin Wall split the city into West (democratic, NATO) and East (communist, Warsaw Pact). Over 140 people died trying to cross. On November 9, 1989, East Germany opened the border after weeks of mass protests. Thousands streamed through with hammers and chisels. The Wall fell in a single night \u2014 live on television worldwide.',
                    layers: ['blocs', 'regimes'],
                    image: { wiki: 'Berlin_Wall', caption: 'The fall of the Berlin Wall, 1989' }
                },
                {
                    center: [21, 52], zoom: 5, title: '\u2694\ufe0f THE WARSAW PACT (1955\u20131991)',
                    text: 'The Warsaw Pact united 8 communist states under Soviet military command: USSR, Poland, East Germany, Czechoslovakia, Hungary, Romania, Bulgaria, and Albania. At its peak it had 6 million troops and 60,000 tanks facing NATO across the Iron Curtain. Soviet forces crushed uprisings in Hungary (1956) and Czechoslovakia (1968) to keep members in line.',
                    layers: ['blocs', 'regimes']
                },
                {
                    center: [37.6, 55.75], zoom: 5, title: '\u2b50 MOSCOW \u2014 THE CENTER COLLAPSES',
                    text: 'Mikhail Gorbachev\'s reforms \u2014 glasnost (openness) and perestroika (restructuring) \u2014 unintentionally unraveled the Soviet Union. In August 1991, a failed coup against Gorbachev sealed the USSR\'s fate. On December 25, 1991, the Soviet flag was lowered over the Kremlin for the last time. 15 independent nations emerged from the ruins of the world\'s largest country.',
                    layers: ['regimes']
                },
                {
                    center: [20, 48], zoom: 5, title: '\ud83c\uddea\ud83c\uddfa THE EASTERN EXPANSION',
                    text: 'After the Wall fell, former Warsaw Pact nations raced toward the West. Poland, Czech Republic, and Hungary joined NATO in 1999 \u2014 just 8 years after the Pact dissolved. The Baltic states (Estonia, Latvia, Lithuania) joined in 2004, along with Romania, Bulgaria, Slovakia, and Slovenia. By 2024, even Finland and Sweden had joined NATO. Russia views this expansion as an existential threat.',
                    layers: ['blocs', 'regimes']
                },
                {
                    center: [31, 49], zoom: 5, title: '\ud83c\uddfa\ud83c\udde6 UKRAINE \u2014 THE UNFINISHED STORY',
                    text: 'Ukraine sits at the exact fault line between the former Warsaw Pact and NATO. The 2014 Euromaidan revolution overthrew a pro-Russian president. Russia annexed Crimea and backed separatists in Donbas. In February 2022, Russia launched a full-scale invasion \u2014 the largest European war since 1945. The conflict continues and has reshaped global alliances.',
                    layers: ['blocs', 'conflicts', 'regimes']
                },
                {
                    center: [25, 52], zoom: 3, title: '\ud83c\udf0d FROM IRON CURTAIN TO NEW FRONTLINES',
                    text: 'The Cold War ended in 1991 but its echoes define today\'s world. NATO grew from 16 to 32 members. Russia went from superpower to isolated aggressor. China rose from rural poverty to the world\'s second economy. The Iron Curtain is gone, but new dividing lines \u2014 in Ukraine, in Taiwan, in cyberspace \u2014 have taken its place. History doesn\'t repeat, but it rhymes.',
                    layers: ['blocs', 'conflicts', 'regimes']
                }
            ]
        },
        trump: {
            name: 'Trump World Tour — Power, Deals & Disruption',
            steps: [
                {
                    center: [-77.04, 38.9], zoom: 6, title: '🏛️ WASHINGTON D.C. — AMERICA FIRST RELOADED',
                    text: 'In January 2025, Donald Trump began his second presidency with immediate executive action. Key moves: withdrawal from the Paris Climate Agreement (again), sweeping tariff packages on allies and rivals alike, and a stated pivot away from multilateral institutions like the WTO and UN bodies. The doctrine signals a shift from rules-based international order toward bilateral power-based negotiation. Federal agencies face deep restructuring under the DOGE efficiency initiative.',
                    layers: ['regimes', 'blocs']
                },
                {
                    center: [-75.7, 45.4], zoom: 4, title: '🍁 CANADA — ALLIANCE UNDER PRESSURE',
                    text: 'U.S.–Canada relations hit a historic low in early 2025. Trump imposed 25% tariffs on Canadian goods, publicly floated the "51st state" rhetoric, and questioned Canadian sovereignty over Arctic passages. Canada responded by diversifying trade toward the EU and Asia-Pacific. The diplomatic friction exposed the fragility of what was once called "the world\'s longest undefended border." NATO coordination between the two nations remains functional but trust has eroded significantly.',
                    layers: ['blocs', 'regimes']
                },
                {
                    center: [-42, 72], zoom: 4, title: '❄️ GREENLAND — STRATEGIC ARCTIC AMBITION',
                    text: 'Trump renewed U.S. interest in acquiring Greenland, citing its strategic military value (Pituffik Space Base) and vast reserves of rare earth minerals critical for AI chips and defense systems. Denmark rejected the proposal, but the move highlighted the Arctic\'s emergence as a geopolitical frontier. Greenland holds an estimated 25% of the world\'s undiscovered rare earths. Russia and China are also expanding Arctic operations — the region is warming 4x faster than the global average, opening new shipping routes and resource access.',
                    layers: ['blocs']
                },
                {
                    center: [-79.9, 9.1], zoom: 6, title: '🚢 PANAMA CANAL — TRADE ROUTE TENSIONS',
                    text: 'Trump publicly questioned Panama\'s sovereignty over the Canal and criticized Chinese-linked port operations at both entrances (run by Hutchison Holdings). The Panama Canal handles 5% of global maritime trade and 40% of all U.S. container traffic. Drought conditions in 2024–25 already reduced daily transits from 36 to 24 ships, costing the global economy billions. The U.S. framed the issue as national security; Panama called it a sovereignty violation. The Canal was transferred to Panama in 1999 under the Carter-Torrijos Treaty.',
                    layers: ['cables', 'blocs']
                },
                {
                    center: [-79.4, 23.1], zoom: 6, title: '🇨🇺 CUBA — ECONOMIC PRESSURE STRATEGY',
                    text: 'The Trump administration tightened the trade embargo on Cuba, reversing Obama-era openings. New restrictions targeted energy imports, remittances, and travel. Cuba\'s power grid — already operating at 50% capacity — faces frequent nationwide blackouts. The island\'s GDP contracted further as Russia and Venezuela, its traditional allies, reduced their own subsidies. The strategy uses economic leverage to pressure regime change without direct military involvement — a pattern consistent with the broader Monroe Doctrine reassertion across Latin America.',
                    layers: ['regimes', 'conflicts']
                },
                {
                    center: [-66.9, 10.5], zoom: 5, title: '⚡ VENEZUELA — HARD POWER RETURNS',
                    text: 'In 2025, the U.S. escalated its confrontation with the Maduro government through expanded sanctions on oil exports, diplomatic isolation, and reported covert support for opposition movements. Venezuela holds the world\'s largest proven oil reserves (303 billion barrels) but produces only a fraction due to mismanagement and sanctions. The U.S. framed its actions as defending democracy; critics called it resource-driven interventionism. The situation represents a reassertion of the Monroe Doctrine — the 1823 principle that the Western Hemisphere falls under U.S. sphere of influence.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [4.35, 50.85], zoom: 4, title: '🇪🇺 BRUSSELS — TRANSATLANTIC FRACTURE',
                    text: 'Trump imposed tariffs on European steel, aluminum, and automotive exports, triggering retaliatory measures from the EU. Transatlantic trust declined to post-WWII lows. European leaders accelerated defense spending (many NATO members finally hitting the 2% GDP target) and began diversifying trade relationships toward Asia and Africa. Spain, Germany, and France publicly criticized U.S. unilateralism. The EU launched new strategic autonomy initiatives in defense, semiconductors, and energy. The question shifted from "Will the alliance hold?" to "What replaces it?"',
                    layers: ['blocs', 'regimes', 'cables']
                },
                {
                    center: [10.45, 51.16], zoom: 5, title: '🇩🇪 GERMANY — TARGETED & ISOLATED',
                    text: 'Germany became a direct target of U.S. pressure after Chancellor Friedrich Merz publicly criticized Trump\'s foreign policy and tariff strategy. The White House responded with two punitive measures: a withdrawal of at least 5,000 U.S. troops from German bases (including Ramstein Air Base and U.S. EUCOM in Stuttgart) and a new 25% tariff on German automobile exports — hitting BMW, Mercedes-Benz, Volkswagen, and Porsche. Germany exports ~€30 billion in vehicles to the U.S. annually, making it the most exposed European economy. The troop drawdown weakens NATO\'s eastern logistics hub and signals a fundamental reassessment of U.S. forward presence in Europe. Berlin faces a dual crisis: economic damage from auto tariffs and a security vacuum as its most important military ally scales back. The risk of German isolation within both NATO and EU decision-making is rising — caught between U.S. hostility and European partners demanding more assertive leadership.',
                    layers: ['blocs', 'regimes', 'conflicts']
                },
                {
                    center: [53.7, 32.4], zoom: 5, title: '🔥 IRAN — ESCALATION RISK ZONE',
                    text: 'Iran remained the most volatile flashpoint in U.S. foreign policy. The Trump administration pursued a "maximum pressure 2.0" strategy: expanded sanctions, naval posturing in the Strait of Hormuz (through which 20% of global oil transits), and diplomatic isolation. Iran accelerated uranium enrichment to near-weapons grade (60%+). Regional proxy tensions involving Hezbollah, the Houthis, and Iraqi militias added layers of complexity. Any miscalculation in this corridor could trigger a global energy crisis — oil prices spiked 15% on escalation fears alone.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [-20, 25], zoom: 2, title: '🌍 THE NEW WORLD ORDER — CAUSE & EFFECT',
                    text: 'The Trump second presidency accelerated a global realignment already underway. Traditional alliances (NATO, G7) face internal stress while alternative blocs (BRICS+, SCO) gain momentum. Key patterns: tariffs replaced diplomacy as the primary foreign policy tool; bilateral deals replaced multilateral frameworks; military posturing replaced soft power. Whether this represents strategic disruption or systemic destabilization depends on perspective. What is clear: the post-1945 international order — built on institutions, alliances, and rules — is being fundamentally renegotiated.',
                    layers: ['blocs', 'regimes', 'conflicts']
                }
            ]
        },
        chokepoints: {
            name: 'Chokepoints — The World Hangs by a Thread',
            steps: [
                {
                    center: [56.3, 26.6], zoom: 6, title: '⛽ STRAIT OF HORMUZ — THE OIL GATE',
                    text: 'The Strait of Hormuz is just 33km wide at its narrowest, yet 20% of the world\'s oil passes through it daily — roughly 21 million barrels. Iran controls the northern shore, Oman the southern. Any disruption here sends global oil prices surging within hours. In 2019, Iran seized a British tanker here. The U.S. Fifth Fleet is permanently stationed in nearby Bahrain specifically to keep this strait open.',
                    layers: ['conflicts', 'cables']
                },
                {
                    center: [32.3, 30.5], zoom: 6, title: '🚢 SUEZ CANAL — THE SHORTCUT THAT CHANGED HISTORY',
                    text: 'The Suez Canal carries 12% of global trade — roughly $9.4 billion worth of goods per day. When the Ever Given blocked it for 6 days in March 2021, it cost the global economy an estimated $54 billion. The canal saves ships a 6,000-mile detour around Africa. Egypt earns $8+ billion annually in transit fees. Over a dozen submarine internet cables also pass through this corridor.',
                    layers: ['cables']
                },
                {
                    center: [104, 1.3], zoom: 5, title: '⚓ STRAIT OF MALACCA — ASIA\'S LIFELINE',
                    text: 'The busiest shipping lane on Earth. Over 100,000 vessels pass through annually, carrying one-third of global trade. At its narrowest point (Phillips Channel near Singapore), it\'s just 2.7km wide. China imports 80% of its oil through Malacca — a strategic vulnerability Beijing calls the "Malacca Dilemma." Piracy remains a persistent threat despite international naval patrols.',
                    layers: ['cables']
                },
                {
                    center: [43.3, 12.6], zoom: 6, title: '🔥 BAB EL-MANDEB — THE GATE OF TEARS',
                    text: 'This 26km-wide strait connects the Red Sea to the Indian Ocean. Every ship using the Suez Canal must also pass through here. In 2024-25, Houthi rebel attacks on commercial shipping forced major carriers to reroute around Africa, adding 10-14 days and $1 million per voyage. Submarine internet cables running through this strait were also damaged, disrupting 25% of traffic between Europe and Asia.',
                    layers: ['conflicts', 'cables']
                },
                {
                    center: [-5.5, 35.9], zoom: 7, title: '🏛️ STRAIT OF GIBRALTAR — MEDITERRANEAN GATE',
                    text: 'Just 14km separates Europe from Africa at Gibraltar. Every ship entering or leaving the Mediterranean — the world\'s busiest sea — must pass through. The UK has held Gibraltar since 1713, a source of ongoing tension with Spain. Over 300 ships transit daily. It\'s also a major migration corridor — thousands attempt the crossing annually in small boats.',
                    layers: ['blocs']
                },
                {
                    center: [29, 41.1], zoom: 7, title: '🇹🇷 TURKISH STRAITS — RUSSIA\'S WARM WATER EXIT',
                    text: 'The Bosporus (just 700m wide at its narrowest) and the Dardanelles are the only exit from the Black Sea to the Mediterranean. Under the 1936 Montreux Convention, Turkey controls transit and can restrict warship passage during conflicts. This gives Turkey enormous leverage — Russia\'s Black Sea Fleet depends on these straits. Turkey restricted warship access after Russia\'s 2022 invasion of Ukraine.',
                    layers: ['blocs', 'conflicts']
                },
                {
                    center: [-79.5, 9.1], zoom: 6, title: '🚢 PANAMA CANAL — THE GREAT SHORTCUT',
                    text: 'The Panama Canal saves ships a 12,500km journey around South America. It handles 5% of global maritime trade and 40% of U.S. container traffic. But it runs on freshwater from Gatun Lake — and drought conditions in 2024-25 forced a 33% reduction in daily transits. Climate change threatens the canal\'s long-term viability, forcing the world to reconsider this 110-year-old engineering marvel.',
                    layers: ['cables']
                },
                {
                    center: [20, 25], zoom: 2, title: '🌍 THE CHOKEPOINT MAP — FRAGILE BY DESIGN',
                    text: 'Global trade depends on fewer than 10 narrow waterways, most of them in politically unstable regions. A simultaneous disruption of just two — say Hormuz and Suez — would trigger a global economic crisis within days. 80% of world trade travels by sea. These chokepoints are also where submarine internet cables, oil pipelines, and naval power converge. The global economy is, by design, fragile.',
                    layers: ['cables', 'conflicts', 'blocs']
                }
            ]
        },
        battery: {
            name: 'The Battery Race — Where Your Phone Comes From',
            steps: [
                {
                    center: [25.5, -4.3], zoom: 5, title: '⛏️ CONGO — THE COBALT MINES',
                    text: 'The Democratic Republic of Congo produces 73% of the world\'s cobalt — an essential element in lithium-ion batteries. Much of it is mined by hand, including by an estimated 40,000 child miners in artisanal operations. A single smartphone battery contains 5-10g of cobalt. Major tech companies have pledged to audit their supply chains, but traceability remains extremely difficult in a region plagued by armed conflict.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [-68, -23.5], zoom: 5, title: '🔋 LITHIUM TRIANGLE — THE WHITE GOLD',
                    text: 'Chile, Argentina, and Bolivia sit atop the "Lithium Triangle" — holding 58% of global lithium reserves. Lithium is extracted from salt flats (salars) by pumping mineral-rich brine into evaporation pools. It takes 2.2 million liters of water to produce 1 ton of lithium — devastating for some of Earth\'s driest regions. Bolivia alone holds an estimated 21 million tons but has struggled to industrialize extraction.',
                    layers: ['regimes']
                },
                {
                    center: [121.5, -28], zoom: 4, title: '🇦🇺 AUSTRALIA — HARD ROCK LITHIUM',
                    text: 'Australia is the world\'s largest lithium producer by volume, using hard-rock mining (spodumene) rather than brine extraction. The Greenbushes mine in Western Australia is the single largest lithium operation on Earth. Australia exports most raw material to China for processing — a dependency the government is trying to reverse with new domestic refining investments.',
                    layers: ['blocs']
                },
                {
                    center: [108, 30], zoom: 4, title: '🇨🇳 CHINA — THE PROCESSING MONOPOLY',
                    text: 'China controls 60% of global lithium refining, 77% of battery cell manufacturing, and 80% of cobalt processing — even though it mines very little of either. This processing dominance is the result of decades of strategic industrial policy. Every major EV battery brand (CATL, BYD) is Chinese. The U.S. and EU are now racing to build domestic capacity, but China has a 15-20 year head start.',
                    layers: ['blocs', 'regimes']
                },
                {
                    center: [120.96, 24.8], zoom: 6, title: '🔬 TAIWAN — THE CHIP BOTTLENECK',
                    text: 'TSMC (Taiwan Semiconductor Manufacturing Company) fabricates over 90% of the world\'s most advanced chips — the processors in every phone, car, and AI server. A single fab costs $20+ billion to build. If Taiwan\'s chip production were disrupted, the global tech industry would halt within weeks. This is why Taiwan\'s geopolitical status is now a matter of global economic security, not just regional politics.',
                    layers: ['cables', 'blocs', 'conflicts']
                },
                {
                    center: [-118, 36], zoom: 4, title: '🏭 GIGAFACTORIES — THE ASSEMBLY LINE',
                    text: 'Tesla\'s Gigafactory Nevada produces more batteries annually than the entire world did in 2014. Similar megafactories are now rising across the U.S. (Georgia, Texas), Europe (Germany, Sweden, Hungary), and Asia. The Inflation Reduction Act (2022) triggered a $100+ billion wave of U.S. battery factory investments. The race is on to control not just mining, but manufacturing.',
                    layers: ['blocs']
                },
                {
                    center: [30, 15], zoom: 2, title: '🌍 THE BATTERY SUPPLY CHAIN — MAPPED',
                    text: 'Your phone\'s battery travels 50,000+ km before it reaches your pocket: cobalt from Congo, lithium from Chile, refined in China, fabricated into chips in Taiwan, assembled in a gigafactory, shipped globally. This supply chain crosses conflict zones, authoritarian regimes, and maritime chokepoints. One disruption — a coup, a drought, a blockade — and the entire chain breaks. The energy transition depends on solving this fragility.',
                    layers: ['cables', 'conflicts', 'regimes', 'blocs']
                }
            ]
        },
        climate: {
            name: 'Climate Frontlines — Who Burns, Who Drowns',
            steps: [
                {
                    center: [16, 78.2], zoom: 5, title: '❄️ SVALBARD — THE ARCTIC CANARY',
                    text: 'Svalbard, halfway between Norway and the North Pole, is warming 7x faster than the global average. Permafrost that has been frozen for 10,000+ years is thawing, releasing methane — a greenhouse gas 80x more potent than CO₂ over 20 years. The Global Seed Vault here, designed to survive any catastrophe, had water leak into its entrance tunnel in 2017 due to unexpected melting.',
                    layers: ['volcanoes']
                },
                {
                    center: [147, -18.3], zoom: 5, title: '🐠 GREAT BARRIER REEF — MASS BLEACHING',
                    text: 'The world\'s largest coral reef system (2,300km) experienced its 7th mass bleaching event in 2024 — the most severe ever recorded. Ocean temperatures exceeded 2°C above the March average across vast stretches. Coral bleaching is irreversible if sustained. The reef supports $6.4 billion in tourism and 64,000 jobs. Scientists warn that at 1.5°C global warming, 70-90% of coral reefs worldwide will die.',
                    layers: ['volcanoes']
                },
                {
                    center: [-60, -3], zoom: 4, title: '🌳 AMAZON — THE LUNGS ARE BURNING',
                    text: 'The Amazon rainforest produces 6% of the world\'s oxygen and stores 150-200 billion tons of carbon. Between 2000 and 2025, an area the size of Spain was deforested — primarily for cattle ranching and soy. Scientists warn the Amazon is approaching a "tipping point" where the forest can no longer sustain itself and begins converting to savanna, releasing its stored carbon and accelerating global warming.',
                    layers: ['fires']
                },
                {
                    center: [90, 23.7], zoom: 5, title: '🌊 BANGLADESH — DROWNING IN SLOW MOTION',
                    text: 'Bangladesh is the world\'s most climate-vulnerable nation. With 170 million people in a low-lying delta, a 1-meter sea level rise would flood 17% of the country and displace 20 million people. Annual monsoon flooding already displaces 4-5 million each year. Bangladesh contributes just 0.4% of global emissions — yet bears among the highest costs. Climate migration from Bangladesh to India is already creating political tensions.',
                    layers: ['regimes']
                },
                {
                    center: [179, -8.5], zoom: 6, title: '🏝️ TUVALU — THE NATION THAT DISAPPEARS',
                    text: 'Tuvalu, population 11,500, is the world\'s first country facing total submersion due to sea level rise. Its highest point is just 4.6 meters above sea level. King tides already flood the capital several times per year. In 2023, Tuvalu signed a treaty with Australia to accept its citizens as climate refugees and began digitizing its land records to preserve sovereignty even after the islands are gone — creating the concept of a "digital nation."',
                    layers: ['regimes']
                },
                {
                    center: [-120, 37], zoom: 5, title: '🔥 CALIFORNIA — FIRE SEASON IS NOW YEAR-ROUND',
                    text: 'California\'s wildfire season has lengthened by 75 days since the 1970s. The 2020 fire season burned 4.2 million acres — an area larger than Connecticut. In January 2025, the Palisades and Eaton fires devastated Los Angeles communities, burning 12,000+ structures. Climate change creates drier vegetation, stronger winds, and less predictable rainfall — turning the American West into a permanent fire zone.',
                    layers: ['fires']
                },
                {
                    center: [10, 20], zoom: 2, title: '🌍 CLIMATE FRONTLINES — THE MAP DOESN\'T LIE',
                    text: 'The nations least responsible for emissions are suffering the most. The top 10 emitters produce 68% of global CO₂, while the bottom 100 nations produce less than 3% combined. Wildfires, coral death, glacial melt, rising seas, and extreme heat are no longer projections — they are measurable, mappable, and accelerating. Earth\'s average temperature has risen 1.2°C since pre-industrial times. The Paris Agreement target of 1.5°C may be breached before 2030.',
                    layers: ['fires', 'regimes']
                }
            ]
        },
        water: {
            name: 'Water Wars — The Next Global Conflict',
            steps: [
                {
                    center: [35, 15], zoom: 5, title: '🏗️ NILE — THE GREAT DAM STANDOFF',
                    text: 'Ethiopia\'s Grand Ethiopian Renaissance Dam (GERD) on the Blue Nile is Africa\'s largest hydroelectric project — and Egypt\'s worst nightmare. Egypt gets 97% of its freshwater from the Nile and has called the dam an "existential threat." Ethiopia says it needs the dam to electrify a nation where 55% lack power. Sudan is caught in between. Negotiations have stalled repeatedly. Egypt\'s president has said "all options are on the table" — a barely veiled military threat.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [42, 37], zoom: 5, title: '🇹🇷 TIGRIS-EUPHRATES — TURKEY CONTROLS THE TAP',
                    text: 'Turkey\'s massive Southeastern Anatolia Project (GAP) includes 22 dams on the Tigris and Euphrates rivers — reducing downstream flow to Syria and Iraq by up to 80% in dry seasons. Iraq\'s marshlands, once the size of New Jersey, have shrunk by 90%. Water scarcity was a contributing factor to Syria\'s 2011 uprising — a record drought from 2006-2010 drove 1.5 million farmers into cities, fueling unrest.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [72, 32], zoom: 5, title: '⚔️ INDUS — TWO NUCLEAR POWERS, ONE RIVER',
                    text: 'The Indus Waters Treaty (1960) divides the Indus river system between India and Pakistan — two nuclear-armed neighbors that have fought four wars. India controls the upstream tributaries and has built several dams that Pakistan views as threats to its water supply. 65% of Pakistan\'s agriculture depends on the Indus. In 2023, India signaled it may renegotiate the treaty. For Pakistan, water is now a national security issue.',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [-111, 36.5], zoom: 5, title: '🏜️ COLORADO RIVER — RUNNING DRY',
                    text: 'The Colorado River supplies water to 40 million people across 7 U.S. states and Mexico. Lake Mead and Lake Powell, its two main reservoirs, hit historic lows in 2022-2023 — dropping below 25% capacity. The river has been over-allocated since the 1922 Colorado River Compact, which was based on an abnormally wet period. Cities like Phoenix, Las Vegas, and Los Angeles face mandatory water cuts. The American West is discovering that infinite growth in a desert has limits.',
                    layers: ['regimes']
                },
                {
                    center: [60, 45], zoom: 5, title: '💀 ARAL SEA — THE GREATEST ENVIRONMENTAL DISASTER',
                    text: 'Once the world\'s 4th largest lake, the Aral Sea has lost 90% of its volume since the 1960s — the result of Soviet irrigation diversions for cotton farming. Fishing communities were stranded 100km from the receding shoreline. The exposed seabed, contaminated with pesticides and salt, created toxic dust storms that increased respiratory illness and cancer rates across the region. The northern section has partially recovered thanks to a World Bank-funded dam; the southern section is effectively gone.',
                    layers: ['regimes']
                },
                {
                    center: [14, 13], zoom: 5, title: '🌍 LAKE CHAD — A CONTINENT\'S CRISIS',
                    text: 'Lake Chad has shrunk by 90% since the 1960s — from 25,000 km² to just 1,350 km². Climate change and irrigation have devastated a water source that 30 million people across Nigeria, Niger, Chad, and Cameroon depend on. The collapse has fueled Boko Haram recruitment, as desperate farmers and fishermen turn to armed groups. The UN calls the Lake Chad Basin "one of the worst humanitarian crises on Earth."',
                    layers: ['conflicts', 'regimes']
                },
                {
                    center: [40, 25], zoom: 2, title: '💧 WATER WARS — THE 21ST CENTURY THREAT',
                    text: 'Freshwater is 2.5% of all water on Earth — and only 0.3% is accessible. By 2030, global water demand will exceed supply by 40%. The World Bank warns that water scarcity could reduce GDP by 6% in the most affected regions. Unlike oil, water has no substitute. Every river crossing a national border is a potential flashpoint. The next great conflicts may not be fought over territory or ideology — but over the right to drink.',
                    layers: ['conflicts', 'regimes']
                }
            ]
        },
        f1: {
            name: 'Formula 1 — The Global Speed Circuit',
            steps: [
                {
                    center: [7.420, 43.737], zoom: 14, title: '🏎️ MONACO — THE JEWEL IN THE CROWN',
                    text: 'Circuit de Monaco: the most prestigious race in F1 since 1929. Just 3.337km through the streets of Monte Carlo — the shortest, slowest, and most glamorous circuit. Capacity: ~37,000 (but millions watch from yachts). The tunnel, the swimming pool chicane, and the hairpin at the Fairmont Hotel make it virtually impossible to overtake. Ayrton Senna won here 6 times. It\'s not the fastest race — it\'s the one every driver wants to win.',
                    layers: [],
                    image: { wiki: 'Monaco_Grand_Prix', caption: 'Circuit de Monaco' }
                },
                {
                    center: [-1.017, 52.073], zoom: 14, title: '🏎️ SILVERSTONE — WHERE IT ALL BEGAN',
                    text: 'Silverstone hosted the very first Formula 1 World Championship race on May 13, 1950. Built on a former WWII bomber airfield in rural England, the circuit is 5.891km of high-speed corners. Capacity: 142,000. The British Grand Prix regularly draws F1\'s largest crowds. Copse, Maggots, Becketts, and Stowe are among the most famous corners in motorsport. Lewis Hamilton has won his home race 8 times.',
                    layers: [],
                    image: { wiki: 'Silverstone_Circuit', caption: 'Silverstone Circuit, England' }
                },
                {
                    center: [9.289, 45.621], zoom: 14, title: '🏎️ MONZA — THE TEMPLE OF SPEED',
                    text: 'Autodromo Nazionale di Monza: F1\'s fastest circuit. Average speeds exceed 260 km/h, with top speeds reaching 360+ km/h on the start-finish straight. The Italian Grand Prix has been on the calendar since 1950 — the only race to feature in every F1 season. Capacity: 118,000. The Tifosi (Ferrari fans) turn the grandstands into a sea of red. The old banked oval, abandoned but still visible in the park, adds to Monza\'s haunting history.',
                    layers: []
                },
                {
                    center: [5.971, 50.437], zoom: 14, title: '🏎️ SPA-FRANCORCHAMPS — THE DRIVERS\' FAVOURITE',
                    text: 'Circuit de Spa-Francorchamps in the Belgian Ardennes forest: 7.004km of elevation changes, blind crests, and unpredictable weather. Eau Rouge — the iconic uphill left-right-left sequence taken at 300+ km/h — is the most famous corner complex in racing. Capacity: 75,000. It frequently rains on one part of the circuit while another is dry, making it the ultimate driver\'s test. Max Verstappen won his first ever F1 race here in 2015.',
                    layers: []
                },
                {
                    center: [136.541, 34.843], zoom: 14, title: '🏎️ SUZUKA — PRECISION ENGINEERING',
                    text: 'Suzuka Circuit in Japan is the only figure-eight layout in F1 — the track crosses over itself via a bridge. Designed by Dutchman John Hugenholtz in 1962, it\'s 5.807km of technical brilliance. The 130R corner (taken flat at 300 km/h) and the Degner curves are legendary. Capacity: 100,000. The Japanese Grand Prix has decided multiple championships. Japanese fans are renowned as the most knowledgeable and respectful in the sport.',
                    layers: []
                },
                {
                    center: [-46.698, -23.702], zoom: 14, title: '🏎️ INTERLAGOS — WHERE LEGENDS ARE MADE',
                    text: 'Autódromo José Carlos Pace in São Paulo: 4.309km of passionate, unpredictable racing. The Brazilian Grand Prix — often the season\'s penultimate race — has produced some of F1\'s most dramatic moments. Capacity: 60,000 (but 200,000+ lined the hills in Senna\'s era). Ayrton Senna\'s 1991 victory here, driving the final laps stuck in 6th gear, is the greatest drive in F1 history. Brazil has produced 3 World Champions.',
                    layers: []
                },
                {
                    center: [103.864, 1.291], zoom: 14, title: '🏎️ SINGAPORE — THE NIGHT SPECTACLE',
                    text: 'Marina Bay Street Circuit: F1\'s first-ever night race (2008). 4.940km under floodlights through the streets of Singapore — 1,500 light projectors illuminate the track. Capacity: 80,000. The heat, humidity (80%+), and 23 corners make it the most physically demanding race. Drivers lose 2-3kg in body weight during the 2-hour race. The Singapore skyline backdrop makes it arguably the most visually stunning race on the calendar.',
                    layers: []
                },
                {
                    center: [54.603, 24.467], zoom: 14, title: '🏎️ YAS MARINA — THE SEASON FINALE',
                    text: 'Yas Marina Circuit in Abu Dhabi: 5.281km of modern engineering. The season-ending Abu Dhabi Grand Prix starts in daylight and finishes under lights. Capacity: 60,000. The 2021 finale — Verstappen vs Hamilton on the final lap — was the most controversial finish in F1 history. The circuit passes through the Yas Hotel, a landmark that straddles the track. Abu Dhabi exemplifies F1\'s expansion into the Middle East and the Gulf states\' use of sport as soft power.',
                    layers: []
                },
                {
                    center: [20, 20], zoom: 2, title: '🏁 FORMULA 1 — THE GLOBAL CIRCUS',
                    text: 'Formula 1 visits 24 countries across 5 continents in a single season — making it the most geographically diverse annual sporting event on Earth. The F1 paddock is a traveling city of 3,000+ personnel, 10 teams, and $3+ billion in machinery. Global TV audience: 1.5 billion per year. F1 has evolved from a European gentleman\'s pursuit to a global entertainment platform, with new races in Las Vegas, Qatar, and Saudi Arabia reflecting shifting economic and political power.',
                    layers: ['blocs']
                }
            ]
        },
        worldcup: {
            name: 'FIFA World Cup — Football\'s Greatest Stage',
            steps: [
                {
                    center: [-43.23, -22.91], zoom: 6, title: '⚽ BRAZIL 2014 — FOOTBALL COMES HOME',
                    text: 'The 2014 FIFA World Cup was hosted across 12 Brazilian cities. Brazil, the most successful World Cup nation (5 titles), suffered a historic 7-1 semi-final defeat to Germany at Belo Horizonte\'s Mineirão stadium — the most shocking result in World Cup history. Germany went on to win their 4th title. The tournament attracted 3.4 million spectators and cost Brazil $15 billion in stadium and infrastructure investment.',
                    layers: []
                },
                {
                    center: [37.62, 55.75], zoom: 5, title: '⚽ RUSSIA 2018 — EAST MEETS WEST',
                    text: 'Russia hosted the first World Cup in Eastern Europe, using 12 stadiums across 11 cities. France won their second title, defeating Croatia 4-2 in the final at Moscow\'s Luzhniki Stadium. The tournament is remembered for VAR\'s full introduction, and the fairytale run of host nation Russia (knocked out in quarter-finals). Total cost: $14.2 billion. 3.57 billion viewers watched worldwide — 50% of the global population.',
                    layers: []
                },
                {
                    center: [51.44, 25.35], zoom: 6, title: '⚽ QATAR 2022 — THE DESERT FINAL',
                    text: 'Qatar became the smallest country and first Arab nation to host the World Cup. Played in winter (Nov-Dec) for the first time to avoid extreme heat. Argentina won their 3rd title as Lionel Messi lifted the trophy in what many call the greatest final ever — a 3-3 draw settled on penalties against defending champions France. The tournament cost an unprecedented $220 billion in total infrastructure. 8 state-of-the-art stadiums were built, including Lusail (88,966 capacity).',
                    layers: [],
                    image: { wiki: '2022_FIFA_World_Cup_final', caption: 'Lusail Stadium, Qatar 2022 Final' }
                },
                {
                    center: [-99.13, 19.43], zoom: 4, title: '⚽ 2026 — UNITED BID (USA, CANADA, MEXICO)',
                    text: 'The 2026 World Cup will be the largest ever — 48 teams (up from 32) across 16 venues in 3 countries. The USA hosts 11 cities including New York/New Jersey (MetLife Stadium — 82,500), Los Angeles (SoFi Stadium), and Dallas (AT&T Stadium). Mexico City\'s Azteca becomes the first stadium to host 3 World Cups. Canada hosts for the first time (Toronto, Vancouver). An estimated 5.5 million fans are expected to attend.',
                    layers: ['blocs']
                },
                {
                    center: [46.68, 24.71], zoom: 5, title: '⚽ 2034 — SAUDI ARABIA',
                    text: 'Saudi Arabia will host the 2034 World Cup — continuing football\'s expansion into the Gulf region after Qatar 2022. The kingdom plans a $500 billion infrastructure program including NEOM, a futuristic megacity. Saudi Arabia has invested heavily in football: buying Newcastle United, launching the Saudi Pro League with Cristiano Ronaldo, Neymar, and Benzema, and bidding for the 2030 Asian Games. Critics cite human rights concerns and the concept of "sportswashing" — using sport to improve national image.',
                    layers: ['blocs']
                },
                {
                    center: [13.38, 52.52], zoom: 5, title: '⚽ GERMANY 2006 — THE SUMMER FAIRYTALE',
                    text: 'Germany 2006 is widely considered the best-organized World Cup in history. Known as "Sommermärchen" (Summer Fairytale), it transformed Germany\'s international image. Italy won their 4th title, defeating France in a final remembered for Zinedine Zidane\'s infamous headbutt on Marco Materazzi. 12 stadiums were used, including Berlin\'s Olympiastadion (final) and Munich\'s Allianz Arena. The tournament pioneered the modern fan zone concept, with public viewing events attracting millions.',
                    layers: [],
                    image: { wiki: '2006_FIFA_World_Cup', caption: 'Olympiastadion Berlin, 2006 Final' }
                },
                {
                    center: [28.23, -25.74], zoom: 5, title: '⚽ SOUTH AFRICA 2010 — AFRICA\'S MOMENT',
                    text: 'South Africa became the first African nation to host the World Cup. The vuvuzela horn became the tournament\'s iconic (and divisive) soundtrack. Spain won their first-ever title, defeating Netherlands 1-0 in extra time at Soccer City, Johannesburg (capacity: 94,736). The tournament was seen as a milestone for African football and diplomacy. Nelson Mandela, aged 92, made a rare public appearance at the final — his last major event. Cost: $3.6 billion.',
                    layers: []
                },
                {
                    center: [10, 20], zoom: 2, title: '🏆 THE WORLD CUP — FOOTBALL\'S UNIVERSE',
                    text: 'The FIFA World Cup is the most-watched sporting event on Earth. The 2022 final drew 1.5 billion viewers — more than the Super Bowl, Olympics, and Champions League combined. Since 1930, only 8 nations have won the trophy: Brazil (5), Germany (4), Italy (4), Argentina (3), France (2), Uruguay (2), England (1), Spain (1). The World Cup generates over $7 billion per tournament. It has been hosted on every continent except Antarctica and Oceania. Football is played by 270 million people in 211 countries — more than any other sport in human history.',
                    layers: ['blocs']
                }
            ]
        },
        ww1: {
            name: 'World War I — The Great War (1914–1918)',
            steps: [
                {
                    center: [15, 48], zoom: 2, title: '🪖 THE GREAT WAR — OVERVIEW',
                    text: 'Duration: 4 years (July 1914 – November 1918). Cause: A web of imperial rivalries, militarism, and entangling alliances, triggered by the assassination of Archduke Franz Ferdinand of Austria-Hungary. Belligerents: Allied Powers (France, UK, Russia, Italy, USA) vs Central Powers (Germany, Austria-Hungary, Ottoman Empire, Bulgaria). Casualties: ~20 million dead (9.7M military, 10M civilian), 21 million wounded. It was called "The War to End All Wars" — it wasn\'t.',
                    layers: ['conflicts']
                },
                {
                    center: [18.43, 43.86], zoom: 8, title: '🪖 SARAJEVO — THE SPARK',
                    text: 'On June 28, 1914, Gavrilo Princip assassinated Archduke Franz Ferdinand and his wife Sophie on the streets of Sarajevo. Austria-Hungary blamed Serbia, triggering a chain of alliance obligations that pulled all of Europe into war within 6 weeks. One bullet, fired by a 19-year-old, killed 20 million people.',
                    layers: ['conflicts'],
                    image: { wiki: 'Assassination_of_Archduke_Franz_Ferdinand', caption: 'Arrest of Gavrilo Princip, 1914' }
                },
                {
                    center: [5.39, 49.16], zoom: 8, title: '🪖 VERDUN — THE MEATGRINDER',
                    text: 'The Battle of Verdun (Feb–Dec 1916) lasted 303 days — the longest single battle in history. Germany aimed to "bleed France white." ~700,000 casualties (roughly equal on both sides) across a front just 30km wide. The French rallying cry "Ils ne passeront pas!" (They shall not pass!) became a symbol of national resistance. Over 60 million shells were fired.',
                    layers: ['conflicts'],
                    image: { wiki: 'Battle_of_Verdun', caption: 'Devastation at Verdun, 1916' }
                },
                {
                    center: [2.89, 50.85], zoom: 8, title: '🪖 YPRES — POISON GAS',
                    text: 'At Ypres in Belgium, Germany introduced chemical warfare on April 22, 1915, releasing 168 tons of chlorine gas. Thousands of Allied soldiers suffocated in their trenches. Three battles of Ypres killed over 850,000 combined. Passchendaele (Third Ypres, 1917) saw soldiers drowning in mud-filled shell craters. The poppy fields around Ypres inspired the poem "In Flanders Fields."',
                    layers: ['conflicts']
                },
                {
                    center: [26.29, 40.34], zoom: 7, title: '🪖 GALLIPOLI — CHURCHILL\'S GAMBLE',
                    text: 'In 1915, the Allies attempted to capture the Dardanelles Strait and knock the Ottoman Empire out of the war. The campaign was a catastrophic failure. Over 500,000 casualties across 8 months. The defeat shaped the national identities of Australia and New Zealand (ANZACs) and ended Winston Churchill\'s career as First Lord of the Admiralty — temporarily. For Turkey, the defense was a defining moment led by Mustafa Kemal (later Atatürk).',
                    layers: ['conflicts'],
                    image: { wiki: 'Gallipoli_campaign', caption: 'Gallipoli landings, 1915' }
                },
                {
                    center: [2.72, 50.00], zoom: 7, title: '🪖 THE SOMME — INDUSTRIAL DEATH',
                    text: 'July 1, 1916: the deadliest single day in British military history. 19,240 British soldiers killed before noon. The Battle of the Somme lasted 141 days with over 1 million total casualties. The tank was first deployed here (September 1916). For 141 days, both sides gained and lost the same few kilometers of mud. The Somme became a byword for the futility of industrial-scale warfare.',
                    layers: ['conflicts']
                },
                {
                    center: [2.90, 49.43], zoom: 8, title: '🪖 COMPIÈGNE — THE ARMISTICE',
                    text: 'At 5:10 AM on November 11, 1918, the Armistice was signed in a railway carriage in the Forest of Compiègne. Fighting ceased at 11:00 AM — "the eleventh hour of the eleventh day of the eleventh month." In the final hours, some commanders continued attacks; an estimated 2,738 soldiers died on the last day. The railway carriage was later used by Hitler in 1940 to accept France\'s surrender — a deliberate act of humiliation.',
                    layers: ['conflicts']
                },
                {
                    center: [2.12, 48.80], zoom: 8, title: '🪖 VERSAILLES — SEEDS OF THE NEXT WAR',
                    text: 'The Treaty of Versailles (June 1919) imposed crushing terms on Germany: loss of 13% of territory, 10% of population, all colonies, near-total disarmament, and reparations of 132 billion gold marks (~$442 billion today). Article 231 — the "War Guilt Clause" — forced Germany to accept sole responsibility. Economists like John Maynard Keynes warned the treaty would lead to another war. He was right. Twenty years later, World War II began.',
                    layers: ['conflicts', 'blocs']
                }
            ]
        },
        ww2: {
            name: 'World War II — The Deadliest Conflict (1939–1945)',
            steps: [
                {
                    center: [20, 40], zoom: 2, title: '⚔️ WORLD WAR II — OVERVIEW',
                    text: 'Duration: 6 years (September 1939 – September 1945). Cause: Nazi Germany\'s expansionism, Japanese imperialism, failure of appeasement, and the unresolved grievances of Versailles. Belligerents: Allies (UK, USSR, USA, France, China, and 50+ nations) vs Axis (Germany, Japan, Italy). Casualties: 70–85 million dead — the deadliest conflict in human history. ~6 million Jews murdered in the Holocaust. Ended with the only use of nuclear weapons in warfare.',
                    layers: ['conflicts']
                },
                {
                    center: [18.65, 54.35], zoom: 7, title: '⚔️ GDAŃSK — THE FIRST SHOTS',
                    text: 'At 4:45 AM on September 1, 1939, the German battleship Schleswig-Holstein opened fire on the Polish garrison at Westerplatte, Gdańsk. It was the first military action of World War II. Within hours, 1.5 million German troops crossed the Polish border in a devastating "Blitzkrieg." Britain and France declared war on September 3. Poland fell in 5 weeks. The invasion introduced the world to a new form of warfare: fast, mechanized, and merciless.',
                    layers: ['conflicts']
                },
                {
                    center: [-0.12, 51.51], zoom: 6, title: '⚔️ LONDON — THE BLITZ',
                    text: 'From September 1940 to May 1941, Germany bombed London for 57 consecutive nights. The Blitz killed 43,000 British civilians and destroyed over 1 million homes. Churchill\'s defiance — "We shall fight on the beaches... we shall never surrender" — became the voice of resistance. The RAF\'s victory in the Battle of Britain (summer 1940) was the first major defeat of the Luftwaffe and prevented a German invasion of England.',
                    layers: ['conflicts'],
                    image: { wiki: 'The_Blitz', caption: 'St Paul\'s Cathedral during the Blitz, 1940' }
                },
                {
                    center: [44.52, 48.72], zoom: 7, title: '⚔️ STALINGRAD — THE TURNING POINT',
                    text: 'The Battle of Stalingrad (Aug 1942 – Feb 1943) was the bloodiest battle in human history: ~2 million casualties. Hitler ordered the city taken at any cost. Stalin ordered "Not one step back." Street-by-street fighting reduced the city to rubble. The Soviet encirclement and surrender of the German 6th Army (91,000 POWs) marked the turning point of the European war. Of the 91,000 German POWs, only ~5,000 ever returned home.',
                    layers: ['conflicts'],
                    image: { wiki: 'Battle_of_Stalingrad', caption: 'Stalingrad ruins, 1943' }
                },
                {
                    center: [19.20, 50.04], zoom: 9, title: '⚔️ AUSCHWITZ — THE HOLOCAUST',
                    text: 'Auschwitz-Birkenau was the largest of the Nazi death camps. Between 1940 and 1945, an estimated 1.1 million people were murdered here — 90% of them Jewish. Victims arrived by train from across occupied Europe. Those deemed "unfit for work" were sent directly to gas chambers. The Holocaust (Shoah) killed approximately 6 million Jews — two-thirds of Europe\'s Jewish population — along with Roma, disabled people, political prisoners, and others. "Never again" became humanity\'s most solemn promise.',
                    layers: ['conflicts'],
                    image: { wiki: 'Auschwitz_concentration_camp', caption: 'Entrance to Auschwitz-Birkenau' }
                },
                {
                    center: [-0.87, 49.36], zoom: 8, title: '⚔️ NORMANDY — D-DAY',
                    text: 'June 6, 1944: Operation Overlord, the largest seaborne invasion in history. 156,000 Allied troops landed on five beaches (Utah, Omaha, Gold, Juno, Sword) along the Normandy coast. Over 4,400 Allied soldiers died on the first day alone. Within a month, 850,000 troops had landed. D-Day opened the Western Front that would crush Nazi Germany from the west while the Soviets advanced from the east. The operation required 5,000 ships and 13,000 aircraft.',
                    layers: ['conflicts'],
                    image: { wiki: 'Normandy_landings', caption: 'D-Day beach landings, June 6, 1944' }
                },
                {
                    center: [132.45, 34.39], zoom: 8, title: '⚔️ HIROSHIMA — THE ATOMIC AGE',
                    text: 'At 8:15 AM on August 6, 1945, the B-29 "Enola Gay" dropped "Little Boy" — a uranium bomb — on Hiroshima. 80,000 people died instantly. By year\'s end, the death toll reached 140,000. Three days later, "Fat Man" was dropped on Nagasaki, killing 70,000. Japan surrendered on August 15, 1945. The atomic bombings remain the only use of nuclear weapons in warfare. They launched the nuclear arms race and the doctrine of Mutually Assured Destruction that defined the Cold War.',
                    layers: ['radiation', 'conflicts'],
                    image: { wiki: 'Atomic_bombings_of_Hiroshima_and_Nagasaki', caption: 'Mushroom cloud over Hiroshima' }
                },
                {
                    center: [13.38, 52.52], zoom: 7, title: '⚔️ BERLIN — FALL OF THE THIRD REICH',
                    text: 'By April 1945, Soviet forces encircled Berlin with 2.5 million troops. The Battle of Berlin killed ~175,000 soldiers and up to 125,000 civilians. On April 30, Hitler committed suicide in his bunker. Germany surrendered unconditionally on May 8, 1945 — V-E Day. The city was divided into four occupied zones (US, UK, France, USSR), foreshadowing the Cold War division that would last until 1989.',
                    layers: ['conflicts', 'blocs']
                },
                {
                    center: [20, 30], zoom: 2, title: '⚔️ LEGACY — A NEW WORLD ORDER',
                    text: 'World War II killed 70–85 million people — 3% of the world\'s population. It destroyed entire nations and redrew every border. From its ashes came: the United Nations (1945), the Universal Declaration of Human Rights (1948), the Geneva Conventions (1949), the European Union (born as the Coal and Steel Community in 1951), NATO (1949), and the Marshall Plan that rebuilt Europe. It also launched the Cold War, decolonization, and the nuclear age. Every international institution we rely on today exists because of what happened between 1939 and 1945.',
                    layers: ['blocs', 'conflicts']
                }
            ]
        },
        romanempire: {
            name: 'The Roman Empire — Rise, Rule & Ruin',
            steps: [
                {
                    center: [18, 40], zoom: 3, title: '🏛️ THE ROMAN EMPIRE — AT ITS GREATEST EXTENT',
                    text: 'At its peak under Emperor Trajan in 117 AD, the Roman Empire stretched from Britain to Mesopotamia, controlling the entire Mediterranean — \"Mare Nostrum\" (Our Sea). Territory: 5 million km². Population: 55–70 million (25% of humanity). Duration: 753 BC (founding of Rome) to 476 AD (fall of the West) = 1,229 years. Key periods: Kingdom (753–509 BC), Republic (509–27 BC), Empire (27 BC–476 AD). The Eastern Empire (Byzantium) survived until 1453 AD — nearly 2,200 years of continuous Roman civilization.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Roman_Empire', caption: 'The Roman Empire at its greatest extent, 117 AD' }
                },
                {
                    center: [12.49, 41.89], zoom: 8, title: '🏛️ ROME — CAPUT MUNDI',
                    text: 'Rome was the capital of the known world for over 500 years. At its peak (~200 AD), the city had 1 million inhabitants — a size not matched by any European city until London in the 1800s. The Colosseum (72–80 AD) seated 50,000–80,000 spectators. The Forum Romanum was the political, legal, and commercial center of the entire empire. Rome had running water via 11 aqueducts delivering 1 million cubic meters per day, public toilets, heated baths, and a 6-story apartment complex (insulae). The phrase \"All roads lead to Rome\" was literal — 80,000 km of paved roads connected the empire.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Colosseum', caption: 'The Colosseum, Rome — completed 80 AD' }
                },
                {
                    center: [9.0, 49.5], zoom: 6, title: '⚔️ THE LIMES — ROME\'S FRONTIER IN GERMANIA',
                    text: 'The Limes Germanicus was a 568-km frontier fortification from the Rhine to the Danube — Rome\'s longest land border. It featured 900 watchtowers and 60 forts, manned by 30,000+ soldiers. Beyond it lived the \"barbarians\" — Germanic tribes Rome could never subdue. The Battle of the Teutoburg Forest (9 AD) destroyed 3 Roman legions (~20,000 men) under Varus. Emperor Augustus allegedly cried: \"Varus, give me back my legions!\" Rome never conquered Germania east of the Rhine.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Limes_Germanicus', caption: 'Reconstructed Limes watchtower, Germany' }
                },
                {
                    center: [31.25, 30.05], zoom: 6, title: '🏺 EGYPT — ROME\'S BREADBASKET',
                    text: 'Egypt was Rome\'s most valuable province. Its grain fed 1 million Romans — any disruption could cause revolution. After Cleopatra VII and Mark Antony\'s defeat at Actium (31 BC), Octavian (Augustus) made Egypt his personal property — no senator could visit without permission. The Nile\'s annual flood was monitored by Roman engineers. Alexandria, with 500,000 inhabitants, housed the famous Library and Lighthouse (one of the Seven Wonders). Egypt supplied Rome for 400 years until the Arab conquest in 641 AD.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Cleopatra', caption: 'The Death of Cleopatra — last Pharaoh of Egypt' }
                },
                {
                    center: [14.49, 40.75], zoom: 9, title: '🌋 POMPEII — FROZEN IN TIME',
                    text: 'On August 24, 79 AD, Mount Vesuvius erupted and buried Pompeii under 4–6 meters of ash in just 18 hours. The city of 11,000 was perfectly preserved — homes, shops, graffiti, food, and the bodies of victims frozen in their final moments. Discovered in 1748, Pompeii is the most complete snapshot of daily Roman life ever found: bakeries, brothels, election posters, fast-food counters (thermopolia), and even ancient traffic jams. 2,000+ bodies have been recovered. Millions visit annually.',
                    layers: ['@roman-empire-fill', '@roman-empire-border', 'volcanoes'],
                    image: { wiki: 'Pompeii', caption: 'Ruins of Pompeii with Vesuvius in the background' }
                },
                {
                    center: [28.98, 41.01], zoom: 8, title: '⭐ CONSTANTINOPLE — THE SECOND ROME',
                    text: 'In 330 AD, Emperor Constantine moved the capital from Rome to Byzantium, renaming it Constantinople. It became the richest city in the world for 1,000 years. The Theodosian Walls (built 413 AD) were the most sophisticated fortifications of antiquity — they held against every siege for 1,000 years until the Ottoman conquest in 1453. Constantinople sat at the crossroads of Europe and Asia, controlling trade between the Mediterranean and the Silk Road. At its peak, it had 500,000+ inhabitants, the Hagia Sophia (world\'s largest building for 1,000 years), and the Hippodrome (seating 100,000).',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Constantinople', caption: 'Constantinople — capital of the Eastern Roman Empire' }
                },
                {
                    center: [-1.5, 52.5], zoom: 6, title: '🛡️ BRITANNIA — THE EDGE OF THE WORLD',
                    text: 'Rome invaded Britain in 43 AD under Emperor Claudius and held it for 367 years. Hadrian\'s Wall (built 122 AD) stretched 117 km across northern England — it took 15,000 men 6 years to build. The wall marked the limit of Roman civilization: organized, heated, literate south vs. unconquered Caledonia (Scotland) to the north. Roman Britain had underfloor heating (hypocaust), bathhouses, and cities like Londinium (London, pop. 60,000). Rome withdrew its legions in 410 AD — within a generation, literacy, coinage, and urban life collapsed.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Hadrian%27s_Wall', caption: 'Hadrian\'s Wall, Northumberland, England' }
                },
                {
                    center: [18, 40], zoom: 3, title: '🌍 FALL & LEGACY — WHY ROME STILL MATTERS',
                    text: 'The Western Roman Empire fell on September 4, 476 AD when the Germanic chieftain Odoacer deposed the last Emperor, Romulus Augustulus. Causes: overexpansion, military overstretch, economic collapse, political instability (50 emperors in 100 years), and barbarian pressure. But Rome\'s legacy is everywhere: Latin evolved into French, Spanish, Italian, Portuguese, and Romanian. Roman law is the basis of every European legal system. The calendar, concrete, arches, aqueducts, roads, representative government, and the very concept of citizenship — all Roman. The empire is gone, but its DNA is in every Western institution.',
                    layers: ['@roman-empire-fill', '@roman-empire-border'],
                    image: { wiki: 'Fall_of_the_Western_Roman_Empire', caption: 'The fall of Rome, 476 AD' }
                }
            ]
        },
        quakes: {
            name: 'Earthquakes & Eruptions — When the Earth Breaks',
            steps: [
                {
                    center: [142.37, 38.32], zoom: 14, title: '🌊 TŌHOKU EARTHQUAKE — JAPAN, 2011',
                    text: 'On March 11, 2011, a magnitude 9.1 earthquake struck off the Pacific coast of Japan — the 4th most powerful ever recorded. The resulting tsunami reached heights of 40 meters and traveled up to 10 km inland. 19,759 people died, 6,242 were injured, and 2,553 remain missing. The tsunami triggered the Fukushima Daiichi nuclear disaster (INES Level 7). Japan\'s earthquake early warning system gave just 8–30 seconds of notice. Economic damage: $235 billion — the costliest natural disaster in history.',
                    layers: ['earthquakes', 'volcanoes'],
                    image: { wiki: '2011_Tōhoku_earthquake_and_tsunami', caption: 'Tsunami wave hitting Miyako, 2011' },
                    video: 'oWzdgBNfhQU'
                },
                {
                    center: [80.2, 7.0], zoom: 14, title: '🌊 INDIAN OCEAN TSUNAMI — 2004',
                    text: 'On December 26, 2004, a magnitude 9.1 earthquake off Sumatra triggered the deadliest tsunami in recorded history. Waves up to 30 meters struck 14 countries across the Indian Ocean. Death toll: 227,898 people across Indonesia (170,000), Sri Lanka (35,000), India (16,000), and Thailand (8,000). The tsunami traveled at 800 km/h — the speed of a jet aircraft. There was no tsunami warning system in the Indian Ocean at the time. One was installed by 2006.',
                    layers: ['earthquakes'],
                    image: { wiki: '2004_Indian_Ocean_earthquake_and_tsunami', caption: 'Tsunami waves striking the coast of Thailand, 2004' },
                    video: 'DXTK49k3fWo'
                },
                {
                    center: [-72.3, 18.5], zoom: 14, title: '💔 HAITI EARTHQUAKE — 2010',
                    text: 'On January 12, 2010, a magnitude 7.0 earthquake struck just 25 km from Port-au-Prince, Haiti\'s capital. The earthquake killed an estimated 220,000–316,000 people, injured 300,000, and left 1.5 million homeless — in a country that was already the poorest in the Western Hemisphere. 250,000 homes and 30,000 commercial buildings collapsed. International aid exceeded $13 billion, but reconstruction was plagued by mismanagement. The earthquake exposed catastrophic building code failures.',
                    layers: ['earthquakes'],
                    image: { wiki: '2010_Haiti_earthquake', caption: 'Devastation in Port-au-Prince, 2010' }
                },
                {
                    center: [36.2, 37.2], zoom: 14, title: '💔 TURKEY-SYRIA EARTHQUAKE — 2023',
                    text: 'On February 6, 2023, two massive earthquakes (M7.8 and M7.7) struck southeastern Turkey and northern Syria within 9 hours. Death toll: 59,259 (Turkey: 50,783, Syria: 8,476). Over 120,000 were injured. 14 million people were affected across both countries. The quake was felt in Egypt, 1,500 km away. In Turkey, 520,000+ buildings were damaged or destroyed — many due to corrupt construction practices that ignored building codes. It was Turkey\'s deadliest natural disaster in modern history.',
                    layers: ['earthquakes'],
                    image: { wiki: '2023_Turkey–Syria_earthquake', caption: 'Collapsed buildings in Hatay, Turkey, 2023' }
                },
                {
                    center: [14.43, 40.82], zoom: 14, title: '🌋 VESUVIUS — POMPEII, 79 AD',
                    text: 'On August 24, 79 AD, Mount Vesuvius erupted with a force estimated at VEI-5, burying the Roman cities of Pompeii and Herculaneum under 4–6 meters of volcanic ash and pumice. An estimated 16,000 people died from pyroclastic flows reaching 700°C and moving at 100 km/h. The cities were preserved in extraordinary detail — frozen in time for 1,700 years until their rediscovery in 1748. Today, 3 million people live in the danger zone around Vesuvius. It is considered one of the most dangerous volcanoes on Earth.',
                    layers: ['volcanoes'],
                    image: { wiki: 'Eruption_of_Mount_Vesuvius_in_79_AD', caption: 'The Destruction of Pompeii and Herculaneum by John Martin' },
                    video: 'dY_3ggKg0Bc'
                },
                {
                    center: [105.42, -6.10], zoom: 14, title: '🌋 KRAKATOA — INDONESIA, 1883',
                    text: 'On August 27, 1883, Krakatoa erupted in one of the most violent volcanic events in recorded history (VEI-6). The explosion was heard 4,800 km away in Australia — the loudest sound in modern history. It produced tsunamis up to 30 meters high, killing 36,417 people. The eruption ejected 25 km³ of rock and ash, causing global temperatures to drop by 1.2°C for 5 years. Vivid red sunsets were observed worldwide for months. The child volcano, Anak Krakatau, emerged in 1927 and caused a deadly tsunami in 2018.',
                    layers: ['volcanoes', 'earthquakes'],
                    image: { wiki: '1883_eruption_of_Krakatoa', caption: 'Lithograph of the 1883 Krakatoa eruption' },
                    video: 'BVyhTMz_Lfw'
                },
                {
                    center: [118.0, -8.4], zoom: 14, title: '🌋 TAMBORA — THE YEAR WITHOUT A SUMMER, 1815',
                    text: 'Mount Tambora\'s eruption on April 10, 1815 was the most powerful volcanic eruption in recorded human history — VEI-7. It ejected 160 km³ of material and the eruption column reached 43 km into the stratosphere. Direct deaths: ~10,000. But the global climate effects killed far more: the sulfur dioxide blocked sunlight, causing 1816 to be known as the "Year Without a Summer." Crop failures caused famine across Europe and North America. An estimated 90,000 people died from famine and disease. Global temperatures dropped 0.4–0.7°C.',
                    layers: ['volcanoes'],
                    image: { wiki: 'Mount_Tambora', caption: 'Mount Tambora caldera, Indonesia' }
                },
                {
                    center: [30, 15], zoom: 2, title: '🌍 EARTHQUAKES & ERUPTIONS — THE NUMBERS',
                    text: 'Earth experiences approximately 500,000 detectable earthquakes per year. Of these, 100,000 can be felt, and ~100 cause damage. The deadliest earthquake in history: Shaanxi, China (1556) — 830,000 dead. The most powerful ever recorded: Chile (1960) — magnitude 9.5. There are approximately 1,500 potentially active volcanoes worldwide, with 50–70 erupting each year. The Pacific Ring of Fire accounts for 75% of all volcanic eruptions and 90% of all earthquakes. Since 1900, earthquakes and eruptions have killed over 2.5 million people.',
                    layers: ['earthquakes', 'volcanoes']
                }
            ]
        },
        olympics: {
            name: 'Olympic Games — A History of Nations & Sport',
            steps: [
                {
                    center: [23.72, 37.97], zoom: 7, title: '🏛️ ATHENS 1896 — THE REVIVAL',
                    text: 'The first modern Olympic Games were held in Athens, Greece, April 6–15, 1896. Organized by Pierre de Coubertin, the Games revived a tradition dormant for 1,500 years. Participants: 241 athletes from 14 nations. Sports: 9 (athletics, cycling, fencing, gymnastics, shooting, swimming, tennis, weightlifting, wrestling). No women competed. The Panathenaic Stadium, originally built in 329 BC, was restored for the occasion. Spectators: ~80,000. James Connolly (USA) won the first Olympic gold in the triple jump.',
                    layers: [],
                    image: { wiki: '1896_Summer_Olympics', caption: 'Opening ceremony at the Panathenaic Stadium, Athens 1896' },
                    video: 'eiJfppOPItQ'
                },
                {
                    center: [13.38, 52.52], zoom: 7, title: '✊ BERLIN 1936 — PROPAGANDA & DEFIANCE',
                    text: 'Adolf Hitler intended the 1936 Berlin Olympics to showcase Aryan supremacy. Instead, African-American athlete Jesse Owens won 4 gold medals, defying Nazi racial ideology before 100,000 spectators. Participants: 3,963 athletes from 49 nations. Sports: 19. These were the first Games to be televised (to 162,000 viewers). The Olympic torch relay was introduced here — designed by Hitler\'s regime as propaganda. Jewish athletes were banned from the German team. Several nations debated boycotting but ultimately attended.',
                    layers: [],
                    image: { wiki: '1936_Summer_Olympics', caption: 'Jesse Owens at the Berlin Olympics, 1936' },
                    video: 'mV3QKEvLbO8'
                },
                {
                    center: [139.77, 35.68], zoom: 7, title: '🇯🇵 TOKYO 1964 — ASIA\'S DEBUT',
                    text: 'Tokyo 1964 was the first Olympics held in Asia and symbolized Japan\'s post-war recovery. The Games introduced satellite broadcasting to 600 million viewers worldwide — the first truly global sports event. Participants: 5,151 athletes from 93 nations. Sports: 19. Japan built the Shinkansen (bullet train) specifically for these Games — it debuted 9 days before the opening ceremony. Spectators: 2.6 million. Judo and volleyball were introduced as Olympic sports. The $2.7 billion investment transformed Tokyo into a modern metropolis.',
                    layers: [],
                    image: { wiki: '1964_Summer_Olympics', caption: 'Tokyo National Stadium, 1964 Opening Ceremony' }
                },
                {
                    center: [11.58, 48.14], zoom: 7, title: '😢 MUNICH 1972 — TERROR AT THE GAMES',
                    text: 'The Munich Olympics were intended as the "Cheerful Games" to erase memories of Berlin 1936. On September 5, Palestinian terrorists (Black September) took 11 Israeli athletes hostage. All 11 hostages, 5 terrorists, and 1 German police officer were killed during a failed rescue attempt. Despite the tragedy, the IOC controversially continued the Games after a 34-hour pause. Participants: 7,134 athletes from 121 nations. Sports: 21. USA swimmer Mark Spitz won 7 gold medals — a record that stood for 36 years. Spectators: 4 million. TV viewers: 900 million.',
                    layers: [],
                    image: { wiki: '1972_Summer_Olympics', caption: 'Memorial ceremony, Munich 1972' },
                    video: 'vY9_i354Kwc'
                },
                {
                    center: [2.17, 41.38], zoom: 7, title: '🇪🇸 BARCELONA 1992 — THE GOLDEN ERA',
                    text: 'Barcelona 1992 is widely considered the greatest Olympics of the modern era. It was the first Games without a boycott since 1972, and the first since the end of the Cold War — allowing athletes from the former Soviet Union and East Germany to compete freely. The "Dream Team" (USA basketball with Jordan, Magic, Bird) debuted. Participants: 9,356 athletes from 169 nations. Sports: 25. The Games transformed Barcelona from an industrial city into a global tourist destination. Spectators: 3.4 million. TV viewers: 3.5 billion.',
                    layers: [],
                    image: { wiki: '1992_Summer_Olympics', caption: 'Opening ceremony at Montjuïc, Barcelona 1992' }
                },
                {
                    center: [116.39, 39.91], zoom: 7, title: '🇨🇳 BEIJING 2008 — THE SPECTACLE',
                    text: 'China invested $42 billion to create the most lavish Olympics in history. The Bird\'s Nest stadium (91,000 capacity) and Water Cube became architectural icons. The opening ceremony, directed by Zhang Yimou, is considered the greatest in Olympic history — 15,000 performers, 29,000 fireworks. Participants: 10,942 athletes from 204 nations (record). Sports: 28. Usain Bolt announced himself with 3 gold medals and 3 world records. Michael Phelps won 8 golds — the most ever in a single Games. TV viewers: 4.7 billion.',
                    layers: [],
                    image: { wiki: '2008_Summer_Olympics', caption: 'Beijing Bird\'s Nest Stadium, 2008' },
                    video: 'tOijH0xinTE'
                },
                {
                    center: [-0.12, 51.51], zoom: 7, title: '🇬🇧 LONDON 2012 — LEGACY GAMES',
                    text: 'London became the first city to host the Olympics three times (1908, 1948, 2012). The Games regenerated the impoverished East London area with £9 billion in infrastructure. Danny Boyle\'s opening ceremony celebrated the NHS and British culture to 900 million viewers. Participants: 10,568 athletes from 204 nations. Sports: 26. Usain Bolt defended his sprint titles. Team GB won 65 medals — their best in 104 years. For the first time, every competing nation included female athletes. Saudi Arabia, Qatar, and Brunei sent women for the first time ever.',
                    layers: [],
                    image: { wiki: '2012_Summer_Olympics', caption: 'Olympic Stadium during London 2012 opening' }
                },
                {
                    center: [2.35, 48.86], zoom: 7, title: '🇫🇷 PARIS 2024 — THE OPEN GAMES',
                    text: 'Paris hosted its third Olympics (after 1900 and 1924) with a revolutionary open-air concept. The opening ceremony took place on the Seine River with 6,000 athletes on 85 boats — the first ceremony held outside a stadium. Participants: 10,714 athletes from 206 nations. Sports: 32 (including breaking/breakdancing for the first time). Events were held at iconic venues: beach volleyball at the Eiffel Tower, equestrian at Versailles, fencing at the Grand Palais. TV viewers: estimated 4 billion. Budget: €8.8 billion.',
                    layers: [],
                    image: { wiki: '2024_Summer_Olympics', caption: 'Seine River opening ceremony, Paris 2024' },
                    video: 'xtlvuPxNKWI'
                },
                {
                    center: [10, 30], zoom: 2, title: '🏅 OLYMPIC GAMES — BY THE NUMBERS',
                    text: 'The modern Olympics have been held 33 times since 1896 (Summer) and 24 times since 1924 (Winter). A total of 206 nations participate under the Olympic flag. Over 150,000 athletes have competed across 50+ sports. The USA leads the all-time medal count with 2,600+ medals, followed by the USSR/Russia, Great Britain, Germany, and France. The Olympic Games generate $7+ billion per edition. 5 billion people — 60% of humanity — watched at least part of the 2024 Paris Games. The next Summer Games: Los Angeles 2028 (34 sports, $6.9B budget). The Olympic motto: Citius, Altius, Fortius — Communiter (Faster, Higher, Stronger — Together).',
                    layers: []
                }
            ]
        },
        summits14: {
            name: '14 Summits — The 8000ers',
            category: 'sports',
            steps: [
                {
                    center: [86.925, 27.988], zoom: 12, title: '🏔️ MOUNT EVEREST — 8,849m',
                    text: '⛰ HEIGHT: 8,849m (29,032 ft) — highest point on Earth.\n🏅 FIRST SUMMIT: May 29, 1953 — Edmund Hillary (New Zealand) & Tenzing Norgay (Nepal/India) via the South Col route.\n💀 DEATH TOLL: ~320 fatalities (as of 2024). 1 in 34 climbers have died attempting the summit.\n📊 Over 6,000 successful summits. Base camp sits at 5,364m. The "Death Zone" above 8,000m leaves climbers with only one-third of sea-level oxygen. The 1996 disaster killed 8 climbers in a single storm, inspiring Jon Krakauer\'s "Into Thin Air." Nepal charges $11,000 per permit.',
                    layers: [],
                    image: { wiki: 'Mount_Everest', caption: 'Mount Everest from Kalapatthar, Nepal' }
                },
                {
                    center: [76.513, 35.880], zoom: 12, title: '🏔️ K2 — 8,611m',
                    text: '⛰ HEIGHT: 8,611m (28,251 ft) — the "Savage Mountain."\n🏅 FIRST SUMMIT: July 31, 1954 — Achille Compagnoni & Lino Lacedelli (Italian expedition).\n💀 DEATH TOLL: ~92 fatalities. 1 in 4 climbers who attempt K2 die — the highest fatality rate of any 8000er.\n📊 Fewer than 400 successful summits (compared to 6,000+ on Everest). The Bottleneck couloir at 8,200m passes beneath a massive ice serac. In 2008, 11 climbers died when the serac collapsed. K2 has never been climbed in winter until 2021, when a Nepali team finally succeeded. Located on the China-Pakistan border in the Karakoram range.',
                    layers: [],
                    image: { wiki: 'K2', caption: 'K2 from Concordia, Pakistan' }
                },
                {
                    center: [85.802, 27.703], zoom: 12, title: '🏔️ KANGCHENJUNGA — 8,586m',
                    text: '⛰ HEIGHT: 8,586m (28,169 ft) — the world\'s third highest peak.\n🏅 FIRST SUMMIT: May 25, 1955 — Joe Brown & George Band (British expedition).\n💀 DEATH TOLL: ~53 fatalities. Fatality rate around 14%.\n📊 The mountain\'s name means "Five Treasures of the Snow" in Tibetan. By tradition, climbers stop just short of the true summit out of respect for the sacred mountain — a promise the first ascenders made to the Chogyal of Sikkim. Located on the Nepal-India border, it was considered the world\'s highest peak until 1852.',
                    layers: [],
                    image: { wiki: 'Kangchenjunga', caption: 'Kangchenjunga from Darjeeling, India' }
                },
                {
                    center: [84.560, 28.596], zoom: 12, title: '🏔️ LHOTSE — 8,516m',
                    text: '⛰ HEIGHT: 8,516m (27,940 ft) — the fourth highest mountain.\n🏅 FIRST SUMMIT: May 18, 1956 — Fritz Luchsinger & Ernst Reiss (Swiss expedition).\n💀 DEATH TOLL: ~13 fatalities. Relatively low fatality rate (~1.5%).\n📊 Lhotse shares the South Col approach with Everest — climbers on both peaks follow the same route until Camp III. The Lhotse Face is a 1,125m wall of glacial blue ice at a 40-50° angle. The South Face of Lhotse, at 3,300m tall, is one of the largest rock faces on Earth. Only 850+ summits have been recorded.',
                    layers: [],
                    image: { wiki: 'Lhotse', caption: 'Lhotse South Face from Everest Base Camp' }
                },
                {
                    center: [86.660, 27.962], zoom: 12, title: '🏔️ MAKALU — 8,485m',
                    text: '⛰ HEIGHT: 8,485m (27,838 ft) — a perfect pyramid of rock and ice.\n🏅 FIRST SUMMIT: May 15, 1955 — Jean Couzy & Lionel Terray (French expedition).\n💀 DEATH TOLL: ~34 fatalities. Fatality rate around 9%.\n📊 Makalu is considered one of the most difficult 8000ers due to its steep, technical terrain and isolated location. The entire 1955 French team of 9 climbers reached the summit — an unprecedented achievement. The mountain has four sharp ridges rising from a square base. Located 19km southeast of Everest in the Mahalangur Himalayas.',
                    layers: [],
                    image: { wiki: 'Makalu', caption: 'Makalu from the northeast' }
                },
                {
                    center: [76.957, 35.238], zoom: 12, title: '🏔️ CHO OYU — 8,188m',
                    text: '⛰ HEIGHT: 8,188m (26,864 ft) — the "easiest" 8000er.\n🏅 FIRST SUMMIT: October 19, 1954 — Herbert Tichy, Joseph Jöchler & Pasang Dawa Lama (Austrian expedition).\n💀 DEATH TOLL: ~49 fatalities. Fatality rate around 1.4% — the lowest of all 8000ers.\n📊 Cho Oyu means "Turquoise Goddess" in Tibetan. Its relatively straightforward northwest ridge makes it the most popular training peak for Everest aspirants. Over 3,700 summits recorded. Located on the Nepal-Tibet border, 20km west of Everest. The 1954 first ascent was achieved by a small team of just 3 climbers — no supplemental oxygen.',
                    layers: [],
                    image: { wiki: 'Cho_Oyu', caption: 'Cho Oyu from Gokyo Ri, Nepal' }
                },
                {
                    center: [84.627, 28.697], zoom: 12, title: '🏔️ DHAULAGIRI — 8,167m',
                    text: '⛰ HEIGHT: 8,167m (26,795 ft) — the "White Mountain."\n🏅 FIRST SUMMIT: May 13, 1960 — Kurt Diemberger, Peter Diener, Nawang Dorje & Nima Dorje (Swiss/Austrian expedition).\n💀 DEATH TOLL: ~73 fatalities. Fatality rate around 16%.\n📊 Dhaulagiri was the world\'s highest known peak from 1808 to 1838. Its name comes from Sanskrit: dhavala (white) + giri (mountain). The expedition that first climbed it used a small airplane (a Pilatus Porter) to fly supplies to base camp — the first time an aircraft was used in Himalayan mountaineering. The south face drops 4,000m in a single sweep.',
                    layers: [],
                    image: { wiki: 'Dhaulagiri', caption: 'Dhaulagiri from Poon Hill, Nepal' }
                },
                {
                    center: [84.561, 28.549], zoom: 12, title: '🏔️ MANASLU — 8,163m',
                    text: '⛰ HEIGHT: 8,163m (26,781 ft) — "Mountain of the Spirit."\n🏅 FIRST SUMMIT: May 9, 1956 — Toshio Imanishi & Gyalzen Norbu (Japanese expedition).\n💀 DEATH TOLL: ~68 fatalities. Fatality rate around 10%.\n📊 Manaslu was effectively the "Japanese mountain" — Japan organized four expeditions between 1952 and 1956. The first reconnaissance team tragically triggered an avalanche that destroyed a village, killing 18 locals. Reinhold Messner called it "a just peak — steep enough to be interesting, high enough to be dangerous." It has become increasingly popular as an alternative to the overcrowded Everest.',
                    layers: [],
                    image: { wiki: 'Manaslu', caption: 'Manaslu from Samagaun, Nepal' }
                },
                {
                    center: [76.668, 35.236], zoom: 12, title: '🏔️ NANGA PARBAT — 8,126m',
                    text: '⛰ HEIGHT: 8,126m (26,660 ft) — the "Killer Mountain."\n🏅 FIRST SUMMIT: July 3, 1953 — Hermann Buhl (Austrian), solo without oxygen or fixed ropes — one of mountaineering\'s greatest feats.\n💀 DEATH TOLL: ~77 fatalities. Fatality rate around 21% — second deadliest after K2.\n📊 The Rupal Face is the highest mountain face on Earth: 4,600m of vertical rock and ice. Between 1895 and 1953, 31 climbers died before the first ascent. The 1934 and 1937 German expeditions were complete disasters. In 2013, Taliban gunmen killed 10 climbers at base camp. Hermann Buhl\'s solo 41-hour summit push remains one of the most audacious climbs in history.',
                    layers: [],
                    image: { wiki: 'Nanga_Parbat', caption: 'Nanga Parbat Rupal Face, Pakistan' }
                },
                {
                    center: [83.490, 28.397], zoom: 12, title: '🏔️ ANNAPURNA I — 8,091m',
                    text: '⛰ HEIGHT: 8,091m (26,545 ft) — the first 8000er ever climbed.\n🏅 FIRST SUMMIT: June 3, 1950 — Maurice Herzog & Louis Lachenal (French expedition).\n💀 DEATH TOLL: ~72 fatalities. Fatality rate of ~27% for the south face — the most dangerous route on any 8000er.\n📊 Annapurna\'s first ascent was a landmark of human achievement but came at a terrible cost: Herzog suffered severe frostbite and lost all his fingers and toes. The south face was first climbed by Don Whillans and Dougal Haston in 1970. Only ~365 successful summits recorded. The Annapurna massif receives some of the heaviest snowfall in the Himalayas, making avalanches a constant threat.',
                    layers: [],
                    image: { wiki: 'Annapurna', caption: 'Annapurna I South Face from ABC' }
                },
                {
                    center: [77.695, 35.724], zoom: 12, title: '🏔️ GASHERBRUM I — 8,080m',
                    text: '⛰ HEIGHT: 8,080m (26,510 ft) — "Beautiful Mountain."\n🏅 FIRST SUMMIT: July 5, 1958 — Pete Schoening & Andy Kauffman (American expedition).\n💀 DEATH TOLL: ~29 fatalities. Fatality rate around 9%.\n📊 Also known as "Hidden Peak" because it cannot be seen from the standard approach through the Baltoro Glacier. Reinhold Messner and Peter Habeler made the first alpine-style ascent in 1975 — climbing it in just 3 days without fixed camps, porters, or supplemental oxygen. This revolutionary approach changed Himalayan climbing forever. Located in the Karakoram, Pakistan.',
                    layers: [],
                    image: { wiki: 'Gasherbrum_I', caption: 'Gasherbrum I (Hidden Peak), Karakoram' }
                },
                {
                    center: [76.653, 35.758], zoom: 12, title: '🏔️ BROAD PEAK — 8,051m',
                    text: '⛰ HEIGHT: 8,051m (26,414 ft) — named for its 1.5km-wide summit ridge.\n🏅 FIRST SUMMIT: June 9, 1957 — Fritz Wintersteller, Marcus Schmuck, Kurt Diemberger & Hermann Buhl (Austrian expedition).\n💀 DEATH TOLL: ~21 fatalities. Fatality rate around 5%.\n📊 Broad Peak was the first 8000er climbed without supplemental oxygen or high-altitude porters above base camp. Hermann Buhl — who had soloed Nanga Parbat 4 years earlier — made the first ascent but tragically died just 16 days later when a cornice collapsed on nearby Chogolisa. The summit ridge is so broad that climbers often mistake the fore-summit for the true peak.',
                    layers: [],
                    image: { wiki: 'Broad_Peak', caption: 'Broad Peak from Concordia, Pakistan' }
                },
                {
                    center: [77.658, 35.762], zoom: 12, title: '🏔️ GASHERBRUM II — 8,034m',
                    text: '⛰ HEIGHT: 8,034m (26,358 ft) — one of the most accessible 8000ers.\n🏅 FIRST SUMMIT: July 7, 1956 — Fritz Moravec, Josef Larch & Hans Willenpart (Austrian expedition).\n💀 DEATH TOLL: ~22 fatalities. Fatality rate around 2.3%.\n📊 Gasherbrum II is considered one of the safer 8000-meter peaks and is often climbed together with Gasherbrum I in a single expedition (the "GI-GII traverse"). In 2012, a team completed the first ski descent from the summit. The mountain is the third-highest peak in the Karakoram range. Its relatively moderate technical difficulty makes it a popular first 8000er for aspiring high-altitude climbers.',
                    layers: [],
                    image: { wiki: 'Gasherbrum_II', caption: 'Gasherbrum II from basecamp' }
                },
                {
                    center: [77.581, 35.811], zoom: 12, title: '🏔️ SHISHAPANGMA — 8,027m',
                    text: '⛰ HEIGHT: 8,027m (26,335 ft) — the lowest of the 14 eight-thousanders.\n🏅 FIRST SUMMIT: May 2, 1964 — Xǔ Jìng & 9 other Chinese climbers — the last 8000er to be climbed.\n💀 DEATH TOLL: ~25 fatalities. Fatality rate around 8%.\n📊 Shishapangma lies entirely within Tibet, making it the only 8000er completely inside Chinese territory. It was the last to be climbed partly because China restricted access. In 1999, American climber Alex Lowe and cameraman David Bridges were killed by an avalanche on its slopes — their bodies were found 17 years later. The name means "Crest above the grassy plains" in Tibetan.',
                    layers: [],
                    image: { wiki: 'Shishapangma', caption: 'Shishapangma from the north, Tibet' }
                },
                {
                    center: [82, 32], zoom: 2, title: '🏔️ THE 14 SUMMITS — BY THE NUMBERS',
                    text: '⛰ ALL 14 PEAKS ABOVE 8,000 METERS — spread across the Himalaya and Karakoram ranges in Nepal, Pakistan, Tibet/China, and India.\n\n🏅 FIRST TO CLIMB ALL 14: Reinhold Messner (Italy) — completed October 16, 1986, all without supplemental oxygen. The greatest mountaineering achievement in history.\n\n📊 KEY STATISTICS:\n• Combined death toll: ~950+ fatalities\n• Total successful summits across all 14: ~14,000\n• Most deadly: Annapurna (27% fatality rate on south face)\n• Most climbed: Everest (6,000+ summits)\n• Least climbed: Annapurna (~365 summits)\n• Only 45 people have climbed all 14 peaks\n• Nirmal "Nims" Purja completed all 14 in just 6 months and 6 days (2019) — shattering the previous record of 7 years\n• K2 was the last to be climbed in winter (January 2021, Nepali team)',
                    layers: []
                }
            ]
        },
        spacerace: {
            name: 'Space Race — Apollo to Mars',
            category: 'science',
            steps: [
                { center: [-80.604, 28.608], zoom: 13, title: '🚀 KENNEDY SPACE CENTER — CAPE CANAVERAL', text: '📍 LOCATION: Merritt Island, Florida, USA.\n🏗️ BUILT: 1962 for the Apollo program.\n🚀 KEY LAUNCHES: Apollo 11 (1969), Space Shuttle (1981–2011), SpaceX Crew Dragon.\n📊 Launch Complex 39A has sent more humans to space than any other pad on Earth. The Vehicle Assembly Building is one of the largest buildings by volume ever constructed — 129.4m tall, it has its own weather system inside. Saturn V remains the most powerful rocket ever successfully flown. Neil Armstrong, Buzz Aldrin, and Michael Collins launched from here on July 16, 1969.', layers: [], image: { wiki: 'Kennedy_Space_Center', caption: 'Kennedy Space Center, Florida' } },
                { center: [-95.089, 29.559], zoom: 13, title: '🛰️ HOUSTON — MISSION CONTROL', text: '📍 LOCATION: Johnson Space Center, Houston, Texas.\n🏗️ ESTABLISHED: 1961 — NASA\'s hub for human spaceflight.\n📡 ROLE: Mission Control has guided every U.S. crewed spaceflight since Gemini 4 (1965).\n📊 "Houston, we\'ve had a problem" — the most famous words in space history, spoken by Jack Swigert during Apollo 13 (1970). The Astronaut Corps is based here. Over 350 astronauts have trained at JSC. The center manages the ISS 24/7, coordinating with 15 partner nations. It also houses the world\'s largest collection of Moon rocks — 382 kg brought back by Apollo missions.', layers: [], image: { wiki: 'Lyndon_B._Johnson_Space_Center', caption: 'NASA Johnson Space Center, Houston' } },
                { center: [63.342, 45.965], zoom: 12, title: '🇷🇺 BAIKONUR COSMODROME — WHERE IT ALL BEGAN', text: '📍 LOCATION: Kazakhstan (leased by Russia).\n🏗️ BUILT: 1955 — the world\'s first and largest space launch facility.\n🚀 HISTORIC FIRSTS: Sputnik (1957), Yuri Gagarin (1961), first spacewalk (1965).\n📊 Gagarin\'s "Poyekhali!" ("Let\'s go!") launched the Space Age. The Soyuz rocket family — evolved from the R-7 ICBM — has over 1,900 launches, making it the most-used rocket in history. Every ISS crew from 2011-2020 launched exclusively from Baikonur after the Shuttle retired. Pad 1 ("Gagarin\'s Start") is still operational after 65+ years.', layers: [], image: { wiki: 'Baikonur_Cosmodrome', caption: 'Baikonur Cosmodrome, Kazakhstan' } },
                { center: [-106.348, 25.997], zoom: 13, title: '🔥 STARBASE — SPACEX BOCA CHICA', text: '📍 LOCATION: Boca Chica, Texas — SpaceX\'s Starship development facility.\n🚀 THE ROCKET: Starship + Super Heavy — 121m tall, 33 Raptor engines, 7,590 tons of thrust.\n📊 The most powerful rocket ever built. Designed to carry 100+ tons to orbit, or 100 passengers to Mars. The "chopstick catch" of the Super Heavy booster in October 2024 was watched by 100M+ people live. Elon Musk\'s goal: make humanity multi-planetary. Cost per kg to orbit: ~$100 (vs. $54,500 for Space Shuttle). SpaceX has already completed 300+ orbital launches.', layers: [], image: { wiki: 'SpaceX_Starbase', caption: 'SpaceX Starbase, Boca Chica TX' } },
                { center: [110.951, 19.614], zoom: 12, title: '🇨🇳 WENCHANG — CHINA\'S SPACE AMBITION', text: '📍 LOCATION: Hainan Island, China — China\'s newest launch site.\n🚀 KEY MISSIONS: Tiangong space station modules, Chang\'e lunar probes.\n📊 China has built its own space station (Tiangong, "Heavenly Palace") operational since 2022. In 2019, Chang\'e-4 became the first spacecraft to land on the far side of the Moon. China plans a crewed Moon landing by 2030 and a joint China-Russia lunar base. Wenchang\'s coastal location allows larger rockets to be transported by sea. China conducted 67 orbital launches in 2023 — second only to the USA.', layers: [], image: { wiki: 'Wenchang_Space_Launch_Site', caption: 'Wenchang Space Launch Site, Hainan' } },
                { center: [-52.768, 5.239], zoom: 11, title: '🇪🇺 KOUROU — EUROPE\'S SPACEPORT', text: '📍 LOCATION: French Guiana, South America.\n🏗️ WHY HERE: Just 5° from the equator — Earth\'s rotation gives rockets a free speed boost of 460 m/s.\n🚀 KEY ROCKETS: Ariane 5 (116 consecutive successes), Ariane 6 (2024), Vega.\n📊 The European Space Agency (ESA) has launched from Kourou since 1979. Ariane 5 deployed the James Webb Space Telescope on Christmas 2021 — the most complex space instrument ever built, now orbiting 1.5M km from Earth. ESA represents 22 member states with a combined budget of €7.8 billion.', layers: [], image: { wiki: 'Guiana_Space_Centre', caption: 'Guiana Space Centre, Kourou' } },
                { center: [80.231, 13.720], zoom: 12, title: '🇮🇳 SRIHARIKOTA — INDIA\'S GIANT LEAP', text: '📍 LOCATION: Satish Dhawan Space Centre, Andhra Pradesh, India.\n🚀 KEY ACHIEVEMENT: Chandrayaan-3 lunar landing (August 23, 2023) — India became the 4th country to land on the Moon.\n📊 India\'s Mars Orbiter Mission (2014) cost just $74 million — less than the movie "Gravity." ISRO\'s PSLV rocket has launched 400+ satellites for 36 countries. Chandrayaan-3 landed near the lunar south pole — a first for any space agency — to search for water ice. India plans its first crewed mission (Gaganyaan) and a Venus orbiter.', layers: [], image: { wiki: 'Satish_Dhawan_Space_Centre', caption: 'ISRO Sriharikota, India' } },
                { center: [-120.573, 34.632], zoom: 12, title: '🛡️ VANDENBERG — THE SECRET LAUNCHES', text: '📍 LOCATION: Vandenberg Space Force Base, California.\n🚀 ROLE: Polar orbit launches — spy satellites, Earth observation, military missions.\n📊 Vandenberg is the only U.S. launch site that can reach polar orbits without flying over populated land. It launches classified NRO (National Reconnaissance Office) satellites that provide intelligence imagery at 10cm resolution. SpaceX also uses Vandenberg for Starlink polar orbit deployments. Over 2,000 launches since 1958.', layers: [], image: { wiki: 'Vandenberg_Space_Force_Base', caption: 'Vandenberg SFB, California' } },
                { center: [55.534, 51.884], zoom: 11, title: '🇷🇺 VOSTOCHNY — RUSSIA\'S NEW COSMODROME', text: '📍 LOCATION: Amur Oblast, Russian Far East.\n🏗️ BUILT: 2016 — intended to reduce Russia\'s dependence on Baikonur (in Kazakhstan).\n📊 Russia\'s most ambitious space infrastructure project since the Soviet era. The cosmodrome will launch Angara rockets and eventually a new Super Heavy rocket for lunar missions. Russia plans to leave the ISS by 2028 and build its own orbital station (ROSS). Despite budget problems and construction scandals, Vostochny represents Russia\'s push to maintain its position as a space superpower.', layers: [] },
                { center: [40, 25], zoom: 2, title: '🚀 THE SPACE RACE — BY THE NUMBERS', text: '🌍 THE FINAL FRONTIER — mapped from Earth.\n\n📊 KEY STATISTICS:\n• Total humans who have been to space: 700+\n• Countries with independent launch capability: 10 (USA, Russia, China, India, Japan, ESA, Iran, N.Korea, S.Korea, Israel)\n• Active satellites in orbit: 10,000+ (50% Starlink)\n• Cost to reach orbit: $2,720/kg (SpaceX) vs. $54,500/kg (Space Shuttle)\n• ISS: 460 tons, size of a football field, 16 sunrises per day\n• Artemis program: NASA plans to return humans to the Moon by 2026\n• Mars: SpaceX targets first uncrewed Starship landing by 2026\n• The James Webb Telescope can see galaxies formed 13.5 billion years ago\n\n🏆 The next giant leap: who will put boots on Mars first — NASA, SpaceX, or China?', layers: [] }
            ]
        },
        extremeearth: {
            name: 'Extreme Earth — Planet of Records',
            category: 'science',
            steps: [
                { center: [-116.825, 36.230], zoom: 11, title: '🔥 DEATH VALLEY — HOTTEST PLACE ON EARTH', text: '🌡️ RECORD: 56.7°C (134°F) — recorded July 10, 1913 at Furnace Creek.\n📍 Badwater Basin sits at -86m below sea level — the lowest point in North America.\n📊 Ground surface temperatures regularly exceed 90°C (194°F). Despite the extreme heat, Death Valley is home to the Devils Hole pupfish — a species that has survived in a single pool for 10,000+ years. The mysterious "sailing stones" of Racetrack Playa move across the desert floor, leaving trails — solved in 2014: thin ice sheets push them. Annual visitors: 1.3 million. Average annual rainfall: just 50mm.', layers: [], image: { wiki: 'Death_Valley', caption: 'Badwater Basin, Death Valley' } },
                { center: [142.787, 63.464], zoom: 8, title: '❄️ OYMYAKON — COLDEST INHABITED PLACE', text: '🌡️ RECORD: -67.7°C (-89.9°F) — recorded February 6, 1933.\n📍 Population: ~500 people in the Sakha Republic, Siberia, Russia.\n📊 At these temperatures, glasses freeze to faces, batteries die in minutes, and cars must run 24/7 or their engines won\'t restart. The school only closes at -52°C. Hot water thrown in the air freezes instantly mid-air. Fish freeze solid within seconds of leaving water. The ground is permanently frozen to 1,500m depth. Despite this, people have lived here for centuries — sustaining themselves on reindeer meat, horse meat, and frozen fish. Summer temperatures can reach +30°C — a 98°C annual range.', layers: [], image: { wiki: 'Oymyakon', caption: 'Oymyakon village, Siberia' } },
                { center: [142.199, 11.349], zoom: 7, title: '🌊 MARIANA TRENCH — DEEPEST POINT ON EARTH', text: '📏 DEPTH: 10,935m (35,876 ft) — Challenger Deep.\n📍 Located in the western Pacific Ocean, east of the Mariana Islands.\n📊 If Mount Everest were placed in the trench, its peak would still be 2,086m underwater. Water pressure at the bottom: 1,086 bar (15,750 psi) — equivalent to having 50 jumbo jets stacked on top of you. Only 27 people have reached the bottom (vs. 600+ who\'ve been to space). Jacques Piccard & Don Walsh made the first descent in 1960. James Cameron went solo in 2012. Victor Vescovo reached the deepest point in 2019. Life still exists down there — giant amoebas and shrimp-like amphipods.', layers: [], image: { wiki: 'Mariana_Trench', caption: 'Mariana Trench location, Pacific Ocean' } },
                { center: [-69.327, -24.500], zoom: 8, title: '🏜️ ATACAMA — DRIEST PLACE ON EARTH', text: '💧 RECORD: Some weather stations have never recorded rain. Parts have been dry for 500+ years.\n📍 Located in northern Chile, between the Andes and the Pacific coast.\n📊 The Atacama is so dry that NASA uses it to test Mars rovers — the soil is virtually identical to Martian regolith. Yet it\'s home to 500+ plant species adapted to harvest moisture from coastal fog. The ALMA observatory (5,000m altitude) sits here — 66 radio antennas forming the world\'s most powerful telescope array. When rare rain falls (every 5-10 years), the desert explodes into a carpet of wildflowers called "desierto florido."', layers: [], image: { wiki: 'Atacama_Desert', caption: 'Atacama Desert, Chile' } },
                { center: [91.732, 25.296], zoom: 10, title: '🌧️ MAWSYNRAM — WETTEST PLACE ON EARTH', text: '💧 RECORD: 11,871mm (467 inches) average annual rainfall.\n📍 Located in Meghalaya, northeast India — the Khasi Hills.\n📊 During monsoon season (June-September), it rains almost continuously. The nearby village of Cherrapunji once received 26,461mm in a single year (1861). Despite all this rain, the region faces water shortages in winter because limestone terrain drains water instantly. The indigenous Khasi people have engineered "living root bridges" — made by training fig tree roots across rivers over 15-30 years. Some bridges are 500+ years old and can hold 50 people.', layers: [], image: { wiki: 'Mawsynram', caption: 'Living root bridges, Meghalaya' } },
                { center: [40.354, 14.242], zoom: 10, title: '🌋 DANAKIL DEPRESSION — MOST ALIEN PLACE', text: '🌡️ AVERAGE: 34.4°C year-round — hottest average temperature on Earth.\n📍 Located in the Afar Triangle, Ethiopia — where 3 tectonic plates are pulling apart.\n📊 This is the closest thing to an alien landscape on Earth: neon-yellow sulfur springs, bubbling acid lakes (pH 0.2), salt flats, and active lava lakes at Erta Ale volcano. The Afar people mine salt here by hand in 50°C+ heat — one of the world\'s hardest jobs. Scientists study extremophile microbes in the acid pools to understand how life might exist on Jupiter\'s moon Europa. The area sits 125m below sea level and is slowly being torn apart — in millions of years it will become a new ocean.', layers: [], image: { wiki: 'Danakil_Depression', caption: 'Dallol sulfur springs, Danakil Depression' } },
                { center: [-78.816, -1.469], zoom: 10, title: '🌍 CHIMBORAZO — FARTHEST FROM EARTH\'S CENTER', text: '📏 SUMMIT: 6,263m above sea level — but 6,384.4km from Earth\'s center.\n📍 Located in Ecuador, near the equator.\n📊 Due to Earth\'s equatorial bulge (the planet is wider at the equator), Chimborazo\'s summit is 2,168m farther from the center of the Earth than Everest\'s. This makes it the point on Earth\'s surface closest to the stars. The equatorial bulge adds ~21km to Earth\'s radius. Alexander von Humboldt attempted to climb it in 1802 and reached 5,875m — a world altitude record that stood for 30 years. The mountain is an inactive volcano with 5 summits covered in glaciers — though climate change is rapidly shrinking them.', layers: [], image: { wiki: 'Chimborazo', caption: 'Chimborazo volcano, Ecuador' } },
                { center: [-12.283, -37.112], zoom: 8, title: '🏝️ TRISTAN DA CUNHA — MOST REMOTE SETTLEMENT', text: '📏 DISTANCE: 2,432km to the nearest inhabited land (Saint Helena).\n📍 A volcanic island in the South Atlantic Ocean.\n👥 POPULATION: ~245 people — sharing just 8 surnames.\n📊 No airport. A supply ship visits 8-9 times per year. The journey from Cape Town takes 6 days by boat. The island has a single settlement: Edinburgh of the Seven Seas. There\'s 1 pub, 1 café, 1 school, 1 doctor, and 1 police officer. The 1961 volcanic eruption forced the entire population to evacuate to England — most chose to return. Internet arrived in 2006. The island\'s economy runs on lobster fishing and stamp collecting (rare postage stamps are prized by collectors worldwide).', layers: [], image: { wiki: 'Tristan_da_Cunha', caption: 'Edinburgh of the Seven Seas, Tristan da Cunha' } },
                { center: [167.954, -29.038], zoom: 10, title: '🌲 BALL\'S PYRAMID — WORLD\'S TALLEST SEA STACK', text: '📏 HEIGHT: 562m — a razor-thin volcanic spire rising from the Pacific Ocean.\n📍 Located 20km southeast of Lord Howe Island, Australia.\n📊 Just 200m wide, Ball\'s Pyramid is the remains of a shield volcano that formed 7 million years ago. In 2001, scientists discovered a colony of Lord Howe Island stick insects on a tiny bush 100m up the cliff — a species thought extinct since 1920. Just 24 individuals survived on this rock. Melbourne Zoo bred them back from near-extinction. It\'s been called "the most important insect in the world." The formation was first climbed in 1965. Only a handful of people have ever set foot on it.', layers: [], image: { wiki: 'Ball%27s_Pyramid', caption: 'Ball\'s Pyramid, Tasman Sea' } },
                { center: [20, 20], zoom: 2, title: '🌍 EXTREME EARTH — BY THE NUMBERS', text: '🌍 OUR PLANET\'S WILDEST RECORDS — mapped.\n\n📊 KEY EXTREMES:\n• Hottest: 56.7°C — Death Valley, USA (1913)\n• Coldest: -89.2°C — Vostok Station, Antarctica (1983)\n• Deepest: 10,935m — Mariana Trench\n• Driest: 0mm/year — Atacama, Chile\n• Wettest: 11,871mm/year — Mawsynram, India\n• Most remote: 2,432km — Tristan da Cunha\n• Highest point from Earth\'s center: Chimborazo, Ecuador\n• Most extreme temperature range: Oymyakon, 98°C swing\n\n💡 These extremes remind us how diverse and resilient our planet is — and how fragile. Climate change is already pushing many of these records into unprecedented territory.', layers: [] }
            ]
        },
        lostwonders: {
            name: 'Lost Wonders — Monuments of Humanity',
            category: 'history',
            steps: [
                { center: [31.134, 29.979], zoom: 14, title: '🔺 GREAT PYRAMID OF GIZA — EGYPT', text: '📍 BUILT: ~2560 BC — the last surviving Ancient Wonder of the World.\n📏 HEIGHT: 146.6m (originally) — tallest man-made structure for 3,800 years.\n📊 2.3 million limestone blocks, each weighing 2.5 tons on average. Construction took ~20 years with a workforce of 20,000-30,000. The base is level to within 2.1cm across 230m — precision that rivals modern engineering. The Great Sphinx (73m long) guards the complex. Annual visitors: 14.7 million. The pyramid complex at Giza is clearly visible from space. How exactly they were built remains one of history\'s greatest engineering mysteries.', layers: [], image: { wiki: 'Great_Pyramid_of_Giza', caption: 'Great Pyramid of Giza, Egypt' } },
                { center: [35.444, 30.329], zoom: 14, title: '🏛️ PETRA — THE ROSE CITY', text: '📍 BUILT: ~300 BC by the Nabataeans — carved directly into sandstone cliffs.\n📏 SIZE: Over 800 individual monuments across 264 km².\n📊 Petra was a thriving trade hub controlling the incense route between Arabia and the Mediterranean. The Treasury (Al-Khazneh) stands 40m tall — hand-carved from a single rock face. The city supported 30,000 people with an ingenious water conduit system in the desert. Lost to the Western world for centuries, it was "rediscovered" by Johann Ludwig Burckhardt in 1812. Named a UNESCO World Heritage Site in 1985 and one of the New 7 Wonders in 2007. Featured in Indiana Jones and the Last Crusade (1989).', layers: [], image: { wiki: 'Petra', caption: 'The Treasury, Petra, Jordan' } },
                { center: [-72.545, -13.163], zoom: 14, title: '🏔️ MACHU PICCHU — CITY IN THE CLOUDS', text: '📍 BUILT: ~1450 AD by the Inca emperor Pachacuti.\n📏 ALTITUDE: 2,430m — perched on a mountain ridge above the Urubamba Valley.\n📊 Over 150 buildings including temples, terraces, and water fountains. The Inca built it without mortar, wheels, or iron tools — stones fit together so precisely that a knife blade can\'t fit between them. Abandoned during the Spanish conquest, it was hidden by jungle for 400 years until Hiram Bingham III reached it in 1911. The site receives 1.5 million visitors per year (capped at 4,044/day). The Inca Trail — a 4-day, 43km trek — is one of the world\'s most famous hikes.', layers: [], image: { wiki: 'Machu_Picchu', caption: 'Machu Picchu, Peru' } },
                { center: [103.867, 13.412], zoom: 13, title: '🛕 ANGKOR WAT — LARGEST RELIGIOUS MONUMENT', text: '📍 BUILT: Early 12th century by King Suryavarman II.\n📏 SIZE: 162.6 hectares (402 acres) — the largest religious monument in the world.\n📊 Originally a Hindu temple dedicated to Vishnu, later converted to Buddhism. The moat is 5.5km long and 190m wide. At its peak, the Khmer Empire\'s capital Angkor housed over 1 million people — the largest pre-industrial city on Earth. The central tower represents Mount Meru (home of the gods). The bas-reliefs stretch 800m and depict scenes from Hindu mythology and Khmer history. During the Khmer Rouge era (1975-79), the temple was abandoned but never destroyed. Sunrise at Angkor Wat draws 2.5 million visitors per year.', layers: [], image: { wiki: 'Angkor_Wat', caption: 'Angkor Wat, Cambodia' } },
                { center: [-88.568, 20.683], zoom: 14, title: '🐍 CHICHÉN ITZÁ — MAYA PYRAMID OF THE SERPENT', text: '📍 BUILT: ~600 AD by the Maya civilization, expanded by the Toltecs.\n📏 HEIGHT: El Castillo pyramid — 30m, with 365 steps (one for each day of the year).\n📊 During the spring and autumn equinoxes, shadows create the illusion of a serpent (Kukulcán) slithering down the pyramid\'s staircase — a phenomenon that draws 40,000+ visitors each equinox. The Sacred Cenote (sinkhole) was used for human sacrifice offerings. The Great Ball Court (168m × 70m) is the largest in the ancient Americas — whispers at one end can be heard at the other, 150m away. Named one of the New 7 Wonders of the World in 2007. Annual visitors: 2.7 million.', layers: [], image: { wiki: 'Chichen_Itza', caption: 'El Castillo, Chichén Itzá, Mexico' } },
                { center: [12.492, 41.890], zoom: 14, title: '🏟️ THE COLOSSEUM — ROME\'S ARENA OF DEATH', text: '📍 BUILT: 70-80 AD under emperors Vespasian and Titus.\n📏 SIZE: 189m × 156m, 48m tall — seated 50,000-80,000 spectators.\n📊 The Colosseum hosted gladiatorial combat, animal hunts, and mock sea battles for over 400 years. An estimated 400,000 people and 1 million animals died in the arena. The hypogeum (underground network) contained 80 vertical lifts to raise animals and scenery into the arena. A retractable awning (velarium) shaded spectators — operated by 1,000 sailors. Earthquakes and stone-robbers destroyed two-thirds of the original structure. 7 million tourists visit annually — the most visited monument in Italy.', layers: [], image: { wiki: 'Colosseum', caption: 'The Colosseum, Rome' } },
                { center: [116.570, 40.432], zoom: 11, title: '🧱 GREAT WALL OF CHINA — THE LONGEST STRUCTURE', text: '📏 LENGTH: 21,196km (13,171 miles) — including all branches and sections.\n🏗️ BUILT: Over 2,000 years, from the 7th century BC to the 17th century AD.\n📊 The Ming Dynasty section (the most famous) stretches 8,850km. An estimated 400,000 workers died during construction — many buried within the wall itself. Contrary to popular myth, it is NOT visible from space with the naked eye. Watch towers were placed every 500m, using smoke signals and cannon fire to relay messages at ~750 km/hour. The wall was not one continuous barrier but a network of walls, trenches, and natural obstacles. Mutianyu and Badaling are the most visited sections, drawing 10M+ visitors per year.', layers: [], image: { wiki: 'Great_Wall_of_China', caption: 'Great Wall at Mutianyu, China' } },
                { center: [-109.381, -27.121], zoom: 11, title: '🗿 EASTER ISLAND — THE MYSTERY OF THE MOAI', text: '📍 LOCATION: Rapa Nui, 3,700km off the coast of Chile — one of the most remote inhabited islands.\n📏 STATUES: 887 Moai carved between 1250-1500 AD, averaging 4m tall and 12.5 tons.\n📊 The largest Moai (El Gigante) is 21.6m tall and weighs 270 tons — never moved from the quarry. How were they transported? The Rapa Nui people likely "walked" them using ropes. The civilization collapsed around 1600 — likely due to deforestation and resource depletion. When Europeans arrived in 1722, only 2,000-3,000 people remained. The island is now a UNESCO World Heritage Site and Chilean national park. The "eyes" of the Moai were made of coral — most have been lost to time.', layers: [], image: { wiki: 'Moai', caption: 'Moai statues, Easter Island' } },
                { center: [78.042, 27.175], zoom: 14, title: '🕌 TAJ MAHAL — A MONUMENT TO LOVE', text: '📍 BUILT: 1632-1653 by Mughal emperor Shah Jahan for his wife Mumtaz Mahal.\n📏 HEIGHT: 73m — perfectly symmetrical in every dimension.\n📊 20,000 artisans from across Asia worked for 22 years. Materials were transported by 1,000+ elephants from across India, Central Asia, and Sri Lanka. The white Makrana marble changes color throughout the day — pink at dawn, white at noon, golden at sunset, blue-grey under moonlight. Legend says Shah Jahan planned a black marble twin across the river (never built). The calligraphy on the walls increases in size as it goes higher — so it appears uniform from ground level. 8 million visitors per year. Often called "the most beautiful building ever constructed."', layers: [], image: { wiki: 'Taj_Mahal', caption: 'Taj Mahal, Agra, India' } },
                { center: [20, 25], zoom: 2, title: '🏛️ WONDERS OF THE WORLD — THE LEGACY', text: '🌍 HUMANITY\'S GREATEST MONUMENTS — mapped.\n\n📊 KEY FACTS:\n• Of the original 7 Ancient Wonders, only the Great Pyramid of Giza survives\n• The New 7 Wonders (2007 vote, 100M+ voters): Great Wall, Petra, Colosseum, Chichén Itzá, Machu Picchu, Taj Mahal, Christ the Redeemer\n• Combined annual visitors: 80+ million\n• Oldest: Great Pyramid (~4,500 years)\n• Largest: Great Wall (21,196km)\n• Most visited: Colosseum (7M/year)\n• All 9 sites on this tour are UNESCO World Heritage Sites\n\n💡 These monuments remind us that human ambition, artistry, and engineering have always pushed beyond what seemed possible — across every culture and every era.', layers: [] }
            ]
        },
        techcapitals: {
            name: 'Tech Capitals — Where the Future is Built',
            category: 'science',
            steps: [
                { center: [-122.084, 37.422], zoom: 12, title: '🏗️ SILICON VALLEY — THE BIRTHPLACE', text: '📍 LOCATION: San Francisco Bay Area, California.\n🏢 HQ COUNT: Apple, Google, Meta, Tesla, Netflix, NVIDIA, and 6,000+ startups.\n📊 Silicon Valley produces $275 billion in GDP — roughly equal to Finland\'s entire economy. Stanford University\'s research park seeded the ecosystem in 1951. The average software engineer earns $180,000/year. VC funding in 2023: $74B. Home to 30% of all US venture capital. The name "Silicon Valley" was coined in 1971 — from the silicon chip manufacturers that dominated the area.', layers: [], image: { wiki: 'Silicon_Valley', caption: 'Silicon Valley, California' } },
                { center: [114.057, 22.543], zoom: 12, title: '🇨🇳 SHENZHEN — FROM FISHING VILLAGE TO TECH MEGACITY', text: '📍 LOCATION: Guangdong Province, southern China.\n🏢 KEY PLAYERS: Huawei, Tencent, BYD, DJI, ZTE, Xiaomi.\n📊 In 1980, Shenzhen was a fishing village of 30,000 people. Today: 17.5 million, with GDP of $470 billion. It produces 90% of the world\'s consumer electronics. The Huaqiangbei electronics market sells more components per day than entire countries produce in a year. BYD surpassed Tesla in global EV sales in 2023. Shenzhen has more skyscrapers than New York City.', layers: [], image: { wiki: 'Shenzhen', caption: 'Shenzhen skyline, China' } },
                { center: [77.594, 12.972], zoom: 11, title: '🇮🇳 BANGALORE — THE SILICON VALLEY OF ASIA', text: '📍 LOCATION: Karnataka, India — the "Garden City."\n🏢 KEY PLAYERS: Infosys, Wipro, Flipkart + offices of Google, Amazon, Microsoft, SAP.\n📊 Bangalore employs 1.5 million IT workers — the highest concentration in Asia. India\'s IT exports: $194 billion/year, with Bangalore responsible for 40%. The city produces more STEM graduates per year than the entire US. Startups funded in 2023: 1,300+. Average age of tech workers: 27. The city\'s growth has been so explosive that its traffic is legendary — average commute: 2 hours.', layers: [], image: { wiki: 'Bangalore', caption: 'Bangalore tech district, India' } },
                { center: [127.027, 37.498], zoom: 12, title: '🇰🇷 SEOUL — THE CONNECTED CAPITAL', text: '📍 LOCATION: South Korea — population 10 million (metro: 26 million).\n🏢 KEY PLAYERS: Samsung, LG, Hyundai, SK Hynix, Naver, Kakao.\n📊 South Korea has the fastest average internet speed on Earth (200+ Mbps). Samsung alone accounts for 20% of South Korea\'s GDP. SK Hynix and Samsung produce 70% of the world\'s memory chips. Seoul has 5G coverage everywhere — including the subway. South Korea spends 4.8% of GDP on R&D — the highest ratio in the world. K-pop and gaming (eSports) were born from this digital infrastructure.', layers: [], image: { wiki: 'Seoul', caption: 'Gangnam district, Seoul' } },
                { center: [34.781, 32.085], zoom: 12, title: '🇮🇱 TEL AVIV — STARTUP NATION', text: '📍 LOCATION: Israel — the most startups per capita on Earth.\n🏢 KEY PLAYERS: Waze, Mobileye, Check Point, CyberArk, Monday.com.\n📊 Israel has more companies on the NASDAQ than any country outside the US. With just 9.8 million people, Israel produces more startups per capita than anywhere else. The IDF\'s Unit 8200 (cyber intelligence) is the top pipeline for tech founders. VC investment per capita: 5x the US rate. Israel invented: USB flash drive, Iron Dome, Waze navigation, Cherry tomatoes (yes, really), and drip irrigation.', layers: [], image: { wiki: 'Tel_Aviv', caption: 'Tel Aviv skyline, Israel' } },
                { center: [13.405, 52.520], zoom: 11, title: '🇩🇪 BERLIN — EUROPE\'S STARTUP CAPITAL', text: '📍 LOCATION: Germany — the largest startup ecosystem in continental Europe.\n🏢 KEY PLAYERS: Zalando, N26, Delivery Hero, SoundCloud, SAP (Potsdam).\n📊 Berlin attracts more VC funding than any other European city — $10B+ in 2023. The city\'s low cost of living (compared to London/SF) and creative culture drew 500+ international startups. Factory Berlin is the largest co-working space in Europe. Berlin\'s tech scene grew from the reunification — cheap rent in former East Berlin attracted artists, then hackers, then founders. 40% of Berlin\'s founders are non-German.', layers: [], image: { wiki: 'Berlin', caption: 'Berlin tech scene, Germany' } },
                { center: [139.692, 35.690], zoom: 11, title: '🇯🇵 TOKYO — ROBOTICS & PRECISION', text: '📍 LOCATION: Greater Tokyo Area — 37.4 million people, the world\'s largest metro.\n🏢 KEY PLAYERS: Sony, Toyota, SoftBank, Nintendo, Hitachi, NEC, Panasonic.\n📊 Japan holds the most industrial robotics patents in the world. Toyota is the world\'s largest automaker. SoftBank\'s Vision Fund ($100B) is the largest tech investment fund ever created. Japan\'s bullet train (Shinkansen) has carried 10 billion passengers with zero fatalities in 60 years. Tokyo has more Michelin-starred restaurants than Paris. Japan\'s robotics industry: $14B/year.', layers: [], image: { wiki: 'Tokyo', caption: 'Shibuya crossing, Tokyo' } },
                { center: [103.852, 1.290], zoom: 12, title: '🇸🇬 SINGAPORE — THE SMART CITY', text: '📍 LOCATION: City-state, Southeast Asia — 5.9 million people, 733 km².\n🏢 KEY PLAYERS: Grab, Sea Group, Razer + regional HQs of Google, Meta, ByteDance.\n📊 Singapore ranks #1 globally for ease of doing business. Zero natural resources — yet GDP per capita: $82,000 (higher than the US). The government invested $19B in the "Smart Nation" initiative — facial recognition, autonomous vehicles, digital twin of the entire city. Changi Airport uses AI for everything. Singapore processes 37 million shipping containers per year — the world\'s busiest port.', layers: [], image: { wiki: 'Singapore', caption: 'Marina Bay, Singapore' } },
                { center: [-97.740, 30.268], zoom: 11, title: '🇺🇸 AUSTIN — THE NEW SILICON HILLS', text: '📍 LOCATION: Texas, USA — the fastest-growing tech hub in America.\n🏢 KEY PLAYERS: Tesla (HQ), SpaceX, Oracle (HQ), Dell, Samsung fab, Apple campus.\n📊 Elon Musk moved Tesla and SpaceX HQs here in 2021. Oracle followed. 170+ companies relocated from California (2020-2024). Austin adds 150 new residents per day. No state income tax. South by Southwest (SXSW) festival draws 400,000+ tech/music/film attendees annually. Samsung is building a $17B chip fab nearby — the largest foreign investment in US history.', layers: [], image: { wiki: 'Austin,_Texas', caption: 'Austin skyline, Texas' } },
                { center: [30, 30], zoom: 2, title: '💻 TECH CAPITALS — BY THE NUMBERS', text: '🌍 WHERE THE DIGITAL FUTURE IS BUILT.\n\n📊 KEY STATISTICS:\n• Global tech industry revenue: $5.3 trillion/year\n• Software developers worldwide: 28.7 million\n• Most valuable tech company: Apple ($3.4T market cap)\n• Largest chip manufacturer: TSMC (Taiwan) — 55% global market share\n• AI investment in 2024: $200B+\n• Countries with 5G networks: 95+\n• Internet users worldwide: 5.4 billion (67% of humanity)\n• Data created daily: 402 million terabytes\n\n🏆 The next frontier: AI, quantum computing, and brain-computer interfaces are being built in these cities right now.', layers: [] }
            ]
        },
        forbiddenzones: {
            name: 'Forbidden Zones — Places You Can\'t Visit',
            category: 'history',
            steps: [
                { center: [-115.811, 37.235], zoom: 11, title: '👽 AREA 51 — THE WORLD\'S MOST SECRET BASE', text: '📍 LOCATION: Nevada Test and Training Range, USA.\n🔒 ACCESS: Strictly prohibited — deadly force authorized.\n📊 Officially acknowledged by the CIA only in 2013. The base tests experimental aircraft — U-2, SR-71 Blackbird, F-117 Stealth Fighter were all developed here. In 2019, the "Storm Area 51" Facebook event attracted 2 million RSVPs (150 actually showed up). Satellite imagery shows a 23,000-foot runway — one of the longest in the world. No commercial flights may enter the restricted airspace. Workers commute via unmarked Boeing 737s from Las Vegas ("Janet Airlines").', layers: [], image: { wiki: 'Area_51', caption: 'Area 51 satellite view, Nevada' } },
                { center: [30.099, 51.389], zoom: 11, title: '☢️ CHERNOBYL EXCLUSION ZONE — THE DEAD CITY', text: '📍 LOCATION: Pripyat, Ukraine — 30km exclusion zone.\n☢️ EVENT: April 26, 1986 — Reactor 4 explosion.\n📊 The worst nuclear disaster in history released 400x more radiation than Hiroshima. 350,000 people were permanently evacuated. Pripyat — a city of 49,000 — was abandoned in 36 hours. Today, wolves, wild horses, and lynx roam the streets. The $1.6B New Safe Confinement dome (completed 2016) seals the reactor for 100 years. Radiation levels vary wildly — some spots are safe, others lethal within minutes. The "Elephant\'s Foot" (melted core) is still so radioactive it kills in 300 seconds.', layers: [], image: { wiki: 'Chernobyl_disaster', caption: 'Pripyat, Chernobyl Exclusion Zone' } },
                { center: [126.977, 37.957], zoom: 10, title: '🇰🇷 KOREAN DMZ — THE MOST DANGEROUS BORDER', text: '📍 LOCATION: 38th Parallel — dividing North and South Korea since 1953.\n📏 SIZE: 250km long, 4km wide — the most heavily militarized border on Earth.\n📊 2 million soldiers face each other across this line. The DMZ has become an accidental nature reserve — rare species like Amur leopards and red-crowned cranes thrive here. The Joint Security Area (Panmunjom) is the only place where soldiers from both sides stand face-to-face. North Korea built 4 invasion tunnels under the DMZ — 3 were discovered. A North Korean soldier defected across the JSA in 2017, shot 5 times and survived.', layers: [], image: { wiki: 'Korean_Demilitarized_Zone', caption: 'Panmunjom, Korean DMZ' } },
                { center: [15.491, 78.236], zoom: 6, title: '🏔️ SVALBARD GLOBAL SEED VAULT — DOOMSDAY BUNKER', text: '📍 LOCATION: Spitsbergen, Norway — 1,300km from the North Pole.\n🌱 CONTENTS: 1.3 million seed samples from every country on Earth.\n📊 Built 120m inside a mountain of permafrost, the vault preserves the world\'s crop diversity against nuclear war, climate collapse, or asteroid impact. Temperature: -18°C, naturally maintained by Arctic conditions. Syria\'s war-destroyed seed bank was rebuilt using Svalbard backups — the vault\'s first withdrawal. It can store 4.5 million varieties. The entrance features a glowing art installation visible for miles across the Arctic tundra. No permanent staff — the vault is designed to operate without human intervention.', layers: [], image: { wiki: 'Svalbard_Global_Seed_Vault', caption: 'Svalbard Global Seed Vault entrance' } },
                { center: [92.208, 11.556], zoom: 8, title: '🏝️ NORTH SENTINEL ISLAND — THE UNCONTACTED', text: '📍 LOCATION: Andaman Islands, India.\n🚫 STATUS: Contact is illegal — Indian Navy enforces a 5km exclusion zone.\n📊 The Sentinelese people have lived in total isolation for 60,000 years — one of the last uncontacted tribes on Earth. Population estimate: 50-200. In 2018, American missionary John Allen Chau was killed by arrows after illegally approaching the island. The Indian government declared the island off-limits after the 2004 tsunami — when a helicopter checking on survivors was driven away by arrow fire. The Sentinelese have rejected every attempt at contact for centuries.', layers: [], image: { wiki: 'North_Sentinel_Island', caption: 'North Sentinel Island, Andaman Sea' } },
                { center: [-43.173, -22.952], zoom: 10, title: '🐍 SNAKE ISLAND — ILHA DA QUEIMADA GRANDE', text: '📍 LOCATION: 33km off the coast of São Paulo, Brazil.\n🚫 ACCESS: Forbidden by the Brazilian Navy — only permitted for approved researchers.\n📊 Home to 2,000-4,000 Golden Lancehead vipers — one of the world\'s deadliest snakes. There is estimated to be one snake per square meter in some areas. Their venom melts human flesh. The island was isolated when sea levels rose 11,000 years ago, trapping the snakes. Local legend says the last lighthouse keeper and his family were killed by snakes entering through windows. The venom is being studied for heart disease medication — a single snake is worth $10,000-$30,000 on the black market.', layers: [] },
                { center: [12.454, 41.904], zoom: 14, title: '📜 VATICAN SECRET ARCHIVES — 84KM OF SECRETS', text: '📍 LOCATION: Vatican City — the world\'s smallest country (0.44 km²).\n📜 CONTENTS: 84 kilometers of shelving holding documents spanning 1,200 years.\n📊 Officially renamed "Vatican Apostolic Archive" in 2019 to reduce conspiracy theories. Contains: letters from Michelangelo, Henry VIII\'s request for annulment (1530), Galileo\'s trial transcript (1633), papal bulls excommunicating Martin Luther. Only 1,000 qualified scholars per year are granted access — no browsing allowed, you must request specific documents by name. Many sections remain classified. The archive was only opened to researchers in 1881.', layers: [], image: { wiki: 'Vatican_Apostolic_Archive', caption: 'Vatican Secret Archives' } },
                { center: [-77.843, 38.574], zoom: 11, title: '🏛️ MOUNT WEATHER — THE SHADOW GOVERNMENT', text: '📍 LOCATION: Blue Ridge Mountains, Virginia, USA.\n🔒 PURPOSE: Emergency operations center for the US government — continuity of government.\n📊 Built during the Cold War to house the President and entire cabinet during nuclear attack. Has its own power plant, hospital, crematorium, radio/TV studio, and cafeteria seating 200. On 9/11, senior officials were evacuated here within 90 minutes. The underground bunker can sustain government operations for months. FEMA manages the facility. Its exact capabilities remain classified. Nearby: the Greenbrier bunker (West Virginia) — Congress\'s secret Cold War shelter, declassified in 1992.', layers: [] },
                { center: [73.512, -53.102], zoom: 7, title: '🌋 HEARD ISLAND — THE MOST REMOTE VOLCANO', text: '📍 LOCATION: Southern Indian Ocean — 4,100km from Australia, 1,600km from Antarctica.\n🌋 Big Ben volcano: 2,745m — one of the most active volcanoes on Earth.\n📊 No permanent inhabitants. Visited by humans fewer than 100 times in history. The island is 80% covered by glaciers despite the active volcano. It\'s an Australian territory but closer to Antarctica. Wildlife: massive elephant seal colonies and millions of penguins. Reaching the island requires a 2-week boat journey through the "Furious Fifties" — the most dangerous seas on Earth. No landing strip, no harbor, no shelter. UNESCO World Heritage Site.', layers: [] },
                { center: [30, 35], zoom: 2, title: '🔒 FORBIDDEN ZONES — THE VERDICT', text: '🌍 PLACES HUMANITY CANNOT — OR SHOULD NOT — ENTER.\n\n📊 KEY FACTS:\n• Most restricted: Area 51 (deadly force authorized)\n• Most dangerous: Chernobyl Exclusion Zone (lethal radiation)\n• Most isolated: North Sentinel Island (60,000 years of isolation)\n• Most militarized: Korean DMZ (2 million soldiers)\n• Most venomous: Snake Island (1 snake per m²)\n• Most secret: Vatican Archives (84km of classified documents)\n• Most prepared: Svalbard Seed Vault (1.3M seed samples for doomsday)\n\n💡 Some places are forbidden for our safety. Others to protect what\'s inside. And some — like North Sentinel — to protect the people who chose to remain untouched by the modern world.', layers: [] }
            ]
        },
        shipwrecks: {
            name: 'Shipwrecks & Lost Treasures',
            category: 'history',
            steps: [
                { center: [-49.947, 41.726], zoom: 8, title: '🚢 RMS TITANIC — THE UNSINKABLE SHIP', text: '📍 SUNK: April 15, 1912 — North Atlantic, 3,800m deep.\n💀 CASUALTIES: 1,517 of 2,224 passengers and crew.\n📊 The "unsinkable" ship struck an iceberg at 11:40 PM on her maiden voyage from Southampton to New York. She sank in 2 hours and 40 minutes. Only 710 survived — mostly women and children from first class. The wreck was discovered in 1985 by Robert Ballard at a depth of 3,800m. The ship is deteriorating due to iron-eating bacteria — it may completely collapse by 2030. In 2023, the Titan submersible imploded during a tourist visit, killing all 5 aboard. Titanic artifacts have been sold for millions.', layers: [], image: { wiki: 'Titanic', caption: 'RMS Titanic, 1912' } },
                { center: [-16.167, 48.600], zoom: 6, title: '⚓ BISMARCK — THE NAZI BATTLESHIP', text: '📍 SUNK: May 27, 1941 — North Atlantic, 4,791m deep.\n📏 SIZE: 251m long, 50,000 tons — the largest battleship ever built by Germany.\n📊 Bismarck sank HMS Hood (pride of the Royal Navy) on May 24, 1941 — Hood exploded and sank in 3 minutes, killing 1,415 of 1,418 crew. The entire Royal Navy then hunted Bismarck. After a torpedo crippled her rudder, she was bombarded for 90 minutes. Of 2,200 crew, only 115 survived. The wreck was found by Robert Ballard in 1989. The hull shows evidence the crew scuttled (sank) their own ship to prevent British capture. James Cameron filmed the wreck in 2002.', layers: [], image: { wiki: 'German_battleship_Bismarck', caption: 'Battleship Bismarck, 1941' } },
                { center: [26.043, 37.949], zoom: 10, title: '🏛️ ANTIKYTHERA — THE ANCIENT COMPUTER', text: '📍 SUNK: ~60 BC — off the Greek island of Antikythera.\n🔧 DISCOVERY: 1901 by sponge divers.\n📊 This Roman-era shipwreck contained the Antikythera Mechanism — the world\'s oldest known analog computer. The bronze device used 37 interlocking gears to predict eclipses, track the Olympic Games calendar, and model planetary movements. It was 1,500 years ahead of its time. Nothing this sophisticated appeared again until the 14th century. The wreck also contained marble statues, coins, and glass vessels. Recent dives (2012-2024) have found a human skeleton, suggesting many more artifacts remain on the seabed.', layers: [], image: { wiki: 'Antikythera_mechanism', caption: 'Antikythera Mechanism, ~60 BC' } },
                { center: [-5.320, 36.130], zoom: 12, title: '⚔️ SAN JOSÉ — THE HOLY GRAIL OF SHIPWRECKS', text: '📍 SUNK: June 8, 1708 — off Cartagena, Colombia (600m deep).\n💰 TREASURE: Estimated $17-20 BILLION in gold, silver, and emeralds.\n📊 The Spanish galleon San José was sunk by the British warship HMS Expedition during the War of the Spanish Succession. 600 crew died. The wreck was found in 2015 by the Colombian Navy using sonar. It is the most valuable shipwreck ever discovered. Colombia, Spain, and a US salvage company have been fighting in court over ownership for decades. The Colombian government considers it a protected cultural heritage site. No treasure has been recovered yet.', layers: [] },
                { center: [29.006, 40.688], zoom: 10, title: '🏺 YENIKAPΙ — 37 SHIPS UNDER ISTANBUL', text: '📍 DISCOVERED: 2004 — during construction of the Marmaray tunnel in Istanbul.\n🚢 COUNT: 37 Byzantine shipwrecks dating from the 5th to 11th century AD.\n📊 The largest maritime archaeological find in history. The ships were preserved in mud at the ancient Harbour of Theodosius — buried under 5 meters of sediment for over 1,000 years. One ship still contained its cargo of amphorae. The discovery delayed the Marmaray project by years and cost hundreds of millions. Scientists found the oldest example of a sewn boat (7th century BC) and evidence of a tsunami that destroyed the harbor. 35,000 artifacts were recovered.', layers: [], image: { wiki: 'Yenikap%C4%B1_Shipwrecks', caption: 'Byzantine ship, Yenikapı, Istanbul' } },
                { center: [-80.841, 24.524], zoom: 8, title: '💰 NUESTRA SEÑORA DE ATOCHA — TREASURE FOUND', text: '📍 SUNK: September 6, 1622 — Florida Keys, USA.\n💰 TREASURE: $450 million recovered (and counting).\n📊 The Spanish treasure galleon sank in a hurricane with 265 people aboard. Treasure hunter Mel Fisher searched for 16 years before finding the "mother lode" in 1985. The haul: 40 tons of gold and silver, 114,000 Spanish silver coins, Colombian emeralds weighing 77.76 carats, and a gold chain weighing 6.3 kg. Fisher\'s motto: "Today\'s the day!" — he said it every morning for 16 years. Some of the treasure is displayed at the Mel Fisher Maritime Museum in Key West.', layers: [], image: { wiki: 'Nuestra_Se%C3%B1ora_de_Atocha', caption: 'Atocha treasure, Florida Keys' } },
                { center: [31.483, 30.052], zoom: 8, title: '🏛️ THONIS-HERACLEION — THE SUNKEN CITY', text: '📍 SUNK: ~800 AD — Abu Qir Bay, Egypt, 10m underwater.\n📏 SIZE: An entire city — temples, harbors, ships, statues.\n📊 Thonis-Heracleion was Egypt\'s greatest port for 800 years before Alexandria was built. It sank beneath the Mediterranean due to earthquakes and rising sea levels. Discovered in 2000 by Franck Goddio, the city was found 6.5km off the coast. Divers recovered: a 5.4m granite statue of the god Hapi, a pink granite shrine, 64 ships, 700 anchors, and gold coins. The city is mentioned by Herodotus — Helen of Troy supposedly visited. Excavation continues — only 5% of the site has been explored.', layers: [], image: { wiki: 'Thonis', caption: 'Sunken statue, Thonis-Heracleion, Egypt' } },
                { center: [58.709, 13.783], zoom: 6, title: '🚢 SS THISTLEGORM — THE UNDERWATER MUSEUM', text: '📍 SUNK: October 6, 1941 — Red Sea, Egypt (30m deep).\n💣 CAUSE: German Heinkel He 111 bombers.\n📊 The British cargo ship was carrying supplies for the North Africa campaign: motorbikes (BSA & Norton), trucks, rifles, ammunition, boots, and two railway locomotives. Jacques Cousteau discovered the wreck in 1955. Today it is the world\'s most popular wreck dive — visited by 50,000+ divers per year. The cargo is perfectly preserved: you can see motorcycles still in their crates, trucks with intact steering wheels, and rifles stacked in the hold. Visibility is often 30+ meters.', layers: [], image: { wiki: 'SS_Thistlegorm', caption: 'SS Thistlegorm motorcycle cargo, Red Sea' } },
                { center: [-63.467, 17.352], zoom: 7, title: '🏴‍☠️ BLACKBEARD\'S QUEEN ANNE\'S REVENGE', text: '📍 SUNK: June 10, 1718 — Beaufort Inlet, North Carolina, USA.\n🏴‍☠️ CAPTAIN: Edward Teach — "Blackbeard."\n📊 The most famous pirate ship in history. Originally a French slave ship (La Concorde), Blackbeard captured it in 1717 and added 40 cannons. He deliberately grounded Queen Anne\'s Revenge to maroon most of his crew and keep the treasure for himself. The wreck was found in 1996. Over 400,000 artifacts recovered: cannons, anchors, gold dust, a pewter syringe (for treating syphilis), and the ship\'s bell. Blackbeard was killed 5 months later — shot 5 times and stabbed 20 times. His head was hung from a ship\'s bow.', layers: [], image: { wiki: 'Queen_Anne%27s_Revenge', caption: 'Queen Anne\'s Revenge artifacts' } },
                { center: [20, 35], zoom: 2, title: '⚓ SHIPWRECKS — THE DEEP LEGACY', text: '🌊 THE OCEAN FLOOR IS HUMANITY\'S LARGEST MUSEUM.\n\n📊 KEY FACTS:\n• Estimated shipwrecks worldwide: 3 million+\n• Explored: Less than 1%\n• Most valuable: San José ($17-20 billion)\n• Most visited dive: SS Thistlegorm (50,000 divers/year)\n• Most famous: RMS Titanic (3,800m deep)\n• Oldest technology found: Antikythera Mechanism (~60 BC)\n• Largest find: 37 ships under Istanbul (Yenikapı)\n• UNESCO protected underwater heritage sites: 60+\n\n💡 Every shipwreck tells a story — of war, trade, exploration, or human error. The ocean has preserved more of our history than any museum on land.', layers: [] }
            ]
        },
        womenworld: {
            name: 'Women Who Changed the World',
            name_de: 'Frauen, die die Welt veränderten',
            category: 'society',
            steps: [
                { center: [21.01, 52.23], zoom: 8, title: '♀️ MARIE CURIE — WARSAW & PARIS', title_de: '♀️ MARIE CURIE — WARSCHAU & PARIS', text: 'Marie Skłodowska-Curie (1867–1934) was the first woman to win a Nobel Prize — and the only person ever to win in two different sciences (Physics 1903, Chemistry 1911). Born in Warsaw under Russian occupation, she moved to Paris where she discovered radium and polonium. Her research on radioactivity (a term she coined) laid the foundation for cancer treatment and nuclear physics. During WWI she developed mobile X-ray units ("petites Curies") that saved thousands of soldiers. She died of aplastic anemia caused by years of radiation exposure — her notebooks are still too radioactive to handle without protective gear.', text_de: 'Marie Skłodowska-Curie (1867–1934) war die erste Frau mit Nobelpreis — und die einzige Person mit zwei Nobelpreisen in verschiedenen Wissenschaften (Physik 1903, Chemie 1911). In Warschau unter russischer Besatzung geboren, entdeckte sie in Paris Radium und Polonium. Ihre Forschung zur Radioaktivität legte den Grundstein für Krebstherapie und Kernphysik. Ihre Notizbücher sind bis heute zu radioaktiv, um sie ohne Schutzausrüstung anzufassen.', layers: [], image: { wiki: 'Marie_Curie', caption: 'Marie Curie, Nobel laureate' } },
                { center: [-86.30, 32.38], zoom: 8, title: '♀️ ROSA PARKS — MONTGOMERY, ALABAMA', title_de: '♀️ ROSA PARKS — MONTGOMERY, ALABAMA', text: 'On December 1, 1955, Rosa Parks (1913–2005) refused to give up her bus seat to a white passenger in Montgomery, Alabama. Her arrest sparked the Montgomery Bus Boycott — 381 days of organized resistance led by a young Martin Luther King Jr. The boycott crippled the city\'s transit system and led to the Supreme Court ruling (Browder v. Gayle, 1956) that bus segregation was unconstitutional. Parks became the "Mother of the Civil Rights Movement." Congress called her "the first lady of civil rights." She received the Presidential Medal of Freedom in 1996.', text_de: 'Am 1. Dezember 1955 weigerte sich Rosa Parks (1913–2005), ihren Busplatz in Montgomery, Alabama, einem weißen Fahrgast zu überlassen. Ihre Verhaftung löste den Montgomery-Busboykott aus — 381 Tage organisierten Widerstands unter Martin Luther King Jr. Der Boykott führte zum Supreme-Court-Urteil, das Bussegregation als verfassungswidrig erklärte.', layers: [], image: { wiki: 'Rosa_Parks', caption: 'Rosa Parks, 1955' } },
                { center: [72.33, 35.22], zoom: 7, title: '♀️ MALALA YOUSAFZAI — SWAT VALLEY, PAKISTAN', title_de: '♀️ MALALA YOUSAFZAI — SWAT-TAL, PAKISTAN', text: 'Malala Yousafzai (born 1997) was 15 when a Taliban gunman shot her in the head on a school bus in Pakistan\'s Swat Valley on October 9, 2012 — for advocating girls\' education. She survived after emergency surgery in Birmingham, UK. In 2014, at age 17, she became the youngest-ever Nobel Peace Prize laureate. Her speech at the United Nations — "One child, one teacher, one book, one pen can change the world" — reached 500 million viewers. The Malala Fund has invested over $10 million in education programs across 8 countries. She graduated from Oxford University in 2020.', text_de: 'Malala Yousafzai (geb. 1997) wurde mit 15 von einem Taliban-Kämpfer in den Kopf geschossen — weil sie für Mädchenbildung eintrat. 2014 wurde sie mit 17 die jüngste Nobelpreisträgerin aller Zeiten. Ihre Rede vor den Vereinten Nationen erreichte 500 Millionen Zuschauer. Der Malala Fund hat über 10 Millionen Dollar in Bildungsprogramme investiert.', layers: [], image: { wiki: 'Malala_Yousafzai', caption: 'Malala Yousafzai, Nobel laureate 2014' } },
                { center: [36.82, -1.29], zoom: 7, title: '♀️ WANGARI MAATHAI — NAIROBI, KENYA', title_de: '♀️ WANGARI MAATHAI — NAIROBI, KENIA', text: 'Wangari Maathai (1940–2011) founded the Green Belt Movement in 1977, which planted over 51 million trees across Kenya. She was the first African woman to win the Nobel Peace Prize (2004) — recognized for her contribution to sustainable development, democracy, and peace. She was beaten, jailed, and tear-gassed by the Kenyan government for her activism. As the first woman in East and Central Africa to earn a PhD (1971), she shattered educational barriers. Her movement employed 30,000 women in tree nurseries, linking environmental conservation directly to women\'s economic empowerment.', text_de: 'Wangari Maathai (1940–2011) gründete 1977 das Green Belt Movement, das über 51 Millionen Bäume in Kenia pflanzte. Sie war die erste afrikanische Frau mit Friedensnobelpreis (2004). Für ihren Aktivismus wurde sie geschlagen und inhaftiert. Ihr Programm beschäftigte 30.000 Frauen in Baumschulen.', layers: [], image: { wiki: 'Wangari_Maathai', caption: 'Wangari Maathai, Nobel laureate 2004' } },
                { center: [2.35, 48.86], zoom: 8, title: '♀️ SIMONE DE BEAUVOIR — PARIS, FRANCE', title_de: '♀️ SIMONE DE BEAUVOIR — PARIS, FRANKREICH', text: 'Simone de Beauvoir (1908–1986) published "The Second Sex" (Le Deuxième Sexe) in 1949 — the foundational text of modern feminism. Her famous declaration "One is not born, but rather becomes, a woman" challenged the idea that gender roles are biologically determined. The book sold millions and was translated into 40+ languages. It was placed on the Vatican\'s Index of Forbidden Books. De Beauvoir was also a leading existentialist philosopher alongside Jean-Paul Sartre. Her work directly inspired second-wave feminism in the 1960s and 70s, influencing Betty Friedan, Kate Millett, and Germaine Greer.', text_de: 'Simone de Beauvoir (1908–1986) veröffentlichte 1949 "Das andere Geschlecht" — den Gründungstext des modernen Feminismus. Ihr berühmter Satz "Man wird nicht als Frau geboren, man wird es" revolutionierte das Verständnis von Geschlechterrollen. Das Buch wurde in über 40 Sprachen übersetzt und vom Vatikan auf den Index gesetzt.', layers: [], image: { wiki: 'Simone_de_Beauvoir', caption: 'Simone de Beauvoir, Paris' } },
                { center: [-99.13, 19.43], zoom: 8, title: '♀️ FRIDA KAHLO — MEXICO CITY', title_de: '♀️ FRIDA KAHLO — MEXIKO-STADT', text: 'Frida Kahlo (1907–1954) transformed personal suffering into universal art. After a devastating bus accident at age 18 left her with lifelong injuries, she taught herself to paint from her bed using a mirror — creating 143 paintings, 55 of which are self-portraits. Her work explored identity, disability, gender, and postcolonialism decades before these became mainstream themes. The Casa Azul (Blue House) in Coyoacán is now the most-visited museum in Mexico City. In 2006, her painting "Roots" sold for $5.6 million — then the most expensive Latin American artwork ever. Kahlo has become a global feminist icon, her face recognized worldwide.', text_de: 'Frida Kahlo (1907–1954) verwandelte persönliches Leid in universelle Kunst. Nach einem verheerenden Busunfall malte sie vom Bett aus — 143 Gemälde, 55 davon Selbstporträts. Ihr Werk erforschte Identität, Behinderung und Geschlecht Jahrzehnte bevor dies Mainstream wurde. Die Casa Azul ist heute das meistbesuchte Museum in Mexiko-Stadt.', layers: [], image: { wiki: 'Frida_Kahlo', caption: 'Frida Kahlo, Mexican artist' } },
                { center: [-2.24, 53.48], zoom: 8, title: '♀️ EMMELINE PANKHURST — MANCHESTER, UK', title_de: '♀️ EMMELINE PANKHURST — MANCHESTER, UK', text: 'Emmeline Pankhurst (1858–1928) founded the Women\'s Social and Political Union (WSPU) in 1903 with the motto "Deeds, not words." The suffragettes smashed windows, set fires, chained themselves to railings, and endured force-feeding during hunger strikes in prison. Pankhurst was arrested 7 times. Emily Davison, a fellow suffragette, died after stepping in front of the King\'s horse at the Epsom Derby in 1913. The movement\'s militancy divided public opinion but ultimately succeeded: British women over 30 won the vote in 1918, and full equal suffrage came in 1928. Time magazine named Pankhurst one of the 100 most important people of the 20th century.', text_de: 'Emmeline Pankhurst (1858–1928) gründete 1903 die WSPU mit dem Motto "Taten, nicht Worte." Die Suffragetten zertrümmerten Fenster, ketteten sich an Geländer und ertrugen Zwangsernährung im Gefängnis. Pankhurst wurde 7-mal verhaftet. Britische Frauen über 30 erhielten 1918 das Wahlrecht, volles Wahlrecht kam 1928.', layers: [], image: { wiki: 'Emmeline_Pankhurst', caption: 'Emmeline Pankhurst, suffragette leader' } },
                { center: [20, 25], zoom: 2, title: '♀️ WOMEN WHO CHANGED THE WORLD — THE LEGACY', title_de: '♀️ FRAUEN, DIE DIE WELT VERÄNDERTEN — DAS VERMÄCHTNIS', text: '🌍 FROM SCIENCE TO CIVIL RIGHTS — mapped.\n\n📊 KEY FACTS:\n• First woman to win a Nobel Prize: Marie Curie (1903)\n• Youngest Nobel laureate ever: Malala Yousafzai (17 years old)\n• "The Second Sex" translated into: 40+ languages\n• Trees planted by Green Belt Movement: 51 million\n• Countries with women\'s suffrage before 1920: 15\n• Countries with women\'s suffrage today: 193\n• Women heads of state in 2025: 29 (15% of all nations)\n• Global gender pay gap: women earn 77 cents for every dollar men earn\n\n💡 These seven women represent thousands more who fought — often at great personal cost — for equality, knowledge, and justice. Their legacy is not history. It is unfinished work.', text_de: '🌍 VON WISSENSCHAFT BIS BÜRGERRECHTE — kartiert.\n\n📊 WICHTIGE FAKTEN:\n• Erste Frau mit Nobelpreis: Marie Curie (1903)\n• Jüngste Nobelpreisträgerin: Malala Yousafzai (17 Jahre)\n• Länder mit Frauenwahlrecht vor 1920: 15\n• Länder mit Frauenwahlrecht heute: 193\n• Bäume durch Green Belt Movement: 51 Millionen\n\n💡 Diese sieben Frauen stehen für Tausende, die — oft unter großem persönlichem Einsatz — für Gleichberechtigung, Wissen und Gerechtigkeit kämpften. Ihr Vermächtnis ist keine Geschichte. Es ist unvollendete Arbeit.', layers: [] }
            ]
        },
        migration: {
            name: 'Migration Routes — The World\'s Deadliest Journeys',
            name_de: 'Fluchtrouten — Die tödlichsten Wege der Welt',
            category: 'geopolitics',
            steps: [
                { center: [15, 35], zoom: 4, title: '🚶 CENTRAL MEDITERRANEAN — EUROPE\'S DEADLIEST BORDER', title_de: '🚶 ZENTRALES MITTELMEER — EUROPAS TÖDLICHSTE GRENZE', text: '📍 ROUTE: Libya/Tunisia → Italy (Lampedusa, Sicily)\n📏 DISTANCE: 300–600 km across open sea\n👥 REFUGEES: ~180,000 arrivals in 2023 (Italy)\n💀 DEATH TOLL: 28,000+ since 2014 — the deadliest migration route on Earth.\n\nOvercrowded dinghies launched by Libyan smugglers carry 100–150 people across the Mediterranean. Life jackets are often fake. Boats frequently capsize within hours of departure. In April 2015, 800 people drowned in a single shipwreck off Lampedusa. The EU\'s Frontex agency patrols 2.5 million km² of sea. Italy\'s Lampedusa (pop. 6,000) has received more refugees than its own population. Many who survive the crossing end up in overcrowded reception centers for months.', text_de: '📍 ROUTE: Libyen/Tunesien → Italien (Lampedusa, Sizilien)\n📏 DISTANZ: 300–600 km über offenes Meer\n👥 FLÜCHTLINGE: ~180.000 Ankünfte 2023 (Italien)\n💀 TODESOPFER: 28.000+ seit 2014 — die tödlichste Fluchtroute der Erde.\n\nÜberfüllte Schlauchboote mit 100–150 Menschen werden von libyschen Schmugglern aufs Mittelmeer geschickt. Schwimmwesten sind oft Fälschungen. Im April 2015 ertranken 800 Menschen bei einem einzigen Schiffbruch vor Lampedusa.', layers: ['conflicts'], image: { wiki: 'European_migrant_crisis', caption: 'Refugee boat in the Mediterranean' } },
                { center: [-99, 26], zoom: 5, title: '🚶 US-MEXICO BORDER — THE DESERT WALL', title_de: '🚶 US-MEXIKO-GRENZE — DIE WÜSTENMAUER', text: '📍 ROUTE: Central America/Mexico → USA (Arizona, Texas, California)\n📏 DISTANCE: 3,145 km border length; migrants walk 80–200 km through desert\n👥 REFUGEES: 2.5 million encounters at the border in 2023 (US CBP)\n💀 DEATH TOLL: 10,000+ since 1998 — mostly from dehydration, heat stroke, drowning in the Rio Grande.\n\nMigrants from Honduras, Guatemala, El Salvador, and Venezuela flee gang violence, poverty, and climate disasters. "La Bestia" — freight trains through Mexico — carry thousands north, with many falling or being pushed off. Smuggler fees: $4,000–$15,000 per person. The border wall (1,050 km of barriers) has pushed crossings into more dangerous desert terrain, increasing deaths. Unaccompanied minors: 130,000+ in US custody in 2023.', text_de: '📍 ROUTE: Zentralamerika/Mexiko → USA (Arizona, Texas, Kalifornien)\n📏 DISTANZ: 3.145 km Grenzlänge; Migranten laufen 80–200 km durch Wüste\n👥 FLÜCHTLINGE: 2,5 Millionen Grenzkontakte 2023 (US CBP)\n💀 TODESOPFER: 10.000+ seit 1998 — vor allem durch Dehydrierung und Hitzschlag.\n\nMigranten aus Honduras, Guatemala, El Salvador und Venezuela fliehen vor Bandengewalt, Armut und Klimakatastrophen. Schmuggler verlangen $4.000–$15.000 pro Person. Die Grenzmauer hat Überquerungen in gefährlicheres Wüstengelände verdrängt.', layers: ['conflicts'], image: { wiki: 'Mexico–United_States_border', caption: 'US-Mexico border wall, Arizona' } },
                { center: [92.2, 21.4], zoom: 6, title: '🚶 ROHINGYA EXODUS — MYANMAR TO BANGLADESH', title_de: '🚶 ROHINGYA-EXODUS — MYANMAR NACH BANGLADESCH', text: '📍 ROUTE: Rakhine State, Myanmar → Cox\'s Bazar, Bangladesh\n📏 DISTANCE: 50–100 km on foot through jungle and rivers\n👥 REFUGEES: 960,000+ Rohingya in Bangladesh (2024) — largest refugee camp complex on Earth\n💀 DEATH TOLL: 24,000+ killed in Myanmar (UN estimate); 9,000+ in a single month (Aug 2017)\n\nThe Rohingya, a Muslim minority, faced systematic genocide by the Myanmar military in August 2017. Entire villages were burned. Women were systematically raped as a weapon of war. 740,000 people fled to Bangladesh in just 3 months. The Kutupalong-Balukhali camp houses 600,000+ people in an area of 13 km². Monsoon flooding and landslides kill dozens annually. Bangladesh cannot absorb them; Myanmar refuses to take them back. The UN called it "a textbook example of ethnic cleansing."', text_de: '📍 ROUTE: Rakhine-Staat, Myanmar → Cox\'s Bazar, Bangladesch\n📏 DISTANZ: 50–100 km zu Fuß durch Dschungel\n👥 FLÜCHTLINGE: 960.000+ Rohingya in Bangladesch (2024)\n💀 TODESOPFER: 24.000+ in Myanmar getötet; 9.000+ in einem einzigen Monat (Aug. 2017)\n\nDie Rohingya erlebten 2017 einen systematischen Genozid durch das myanmarische Militär. 740.000 Menschen flohen in nur 3 Monaten. Die UNO nannte es "ein Lehrbuchbeispiel für ethnische Säuberung."', layers: ['conflicts', 'regimes'], image: { wiki: 'Rohingya_genocide', caption: 'Rohingya refugees, Cox\'s Bazar' } },
                { center: [-67, 7], zoom: 5, title: '🚶 VENEZUELAN DIASPORA — 8 MILLION DISPLACED', title_de: '🚶 VENEZOLANISCHE DIASPORA — 8 MILLIONEN VERTRIEBENE', text: '📍 ROUTE: Venezuela → Colombia, Peru, Chile, Brazil, Ecuador\n📏 DISTANCE: Up to 5,000 km on foot — many walk the entire route\n👥 REFUGEES: 7.7 million Venezuelans displaced since 2015 — largest displacement crisis in the Americas\n💀 DEATH TOLL: Unknown thousands — from exhaustion, hypothermia crossing the Andes, criminal violence\n\nVenezuela\'s economic collapse under Maduro created hyperinflation of 1,000,000%+, food shortages, and a destroyed healthcare system. Families walk for weeks through Colombia\'s mountains, crossing the Darién Gap (a 100 km roadless jungle between Colombia and Panama). Children and elderly die of exposure crossing the 4,000m Andes passes. Colombia hosts 2.9 million Venezuelan refugees — the most of any country. Most work in the informal economy without legal protection.', text_de: '📍 ROUTE: Venezuela → Kolumbien, Peru, Chile, Brasilien, Ecuador\n📏 DISTANZ: Bis zu 5.000 km zu Fuß\n👥 FLÜCHTLINGE: 7,7 Millionen Venezolaner seit 2015 vertrieben\n💀 TODESOPFER: Unbekannte Tausende — Erschöpfung, Unterkühlung, Gewalt\n\nVenezuelas wirtschaftlicher Zusammenbruch verursachte Hyperinflation von 1.000.000%+. Familien laufen wochenlang durch Kolumbiens Berge und den Darién-Gap — 100 km Dschungel ohne Straßen.', layers: ['conflicts', 'regimes'], image: { wiki: 'Venezuelan_refugee_crisis', caption: 'Venezuelan migrants crossing the Andes' } },
                { center: [20, 12], zoom: 4, title: '🚶 SAHEL ROUTE — AFRICA\'S HIDDEN CRISIS', title_de: '🚶 SAHEL-ROUTE — AFRIKAS VERBORGENE KRISE', text: '📍 ROUTE: Sub-Saharan Africa → Libya/Algeria (via Niger, Chad, Sudan)\n📏 DISTANCE: 2,000–4,000 km through the Sahara Desert\n👥 REFUGEES: ~400,000 cross the Sahara annually (IOM estimate)\n💀 DEATH TOLL: At least twice the Mediterranean toll — the Sahara may kill more migrants than any sea crossing. Bodies are found in the desert years later — most are never found at all.\n\nAgadez (Niger) is the last city before the Sahara. Smugglers pack 25–30 people onto open Toyota pickups for a 3-day crossing through 50°C heat. Vehicles break down; drivers abandon passengers. In 2013, 92 people — including women and children — died of thirst after their trucks broke down near the Algeria-Niger border. The IOM estimates that for every death recorded in the Mediterranean, two go unrecorded in the Sahara.', text_de: '📍 ROUTE: Subsahara-Afrika → Libyen/Algerien (über Niger, Tschad, Sudan)\n📏 DISTANZ: 2.000–4.000 km durch die Sahara\n👥 FLÜCHTLINGE: ~400.000 überqueren jährlich die Sahara (IOM-Schätzung)\n💀 TODESOPFER: Mindestens doppelt so viele wie im Mittelmeer.\n\nSchlepper packen 25–30 Menschen auf offene Toyota-Pickups für 3 Tage bei 50°C. Fahrzeuge brechen zusammen, Fahrer lassen Passagiere zurück. Für jeden im Mittelmeer registrierten Toten sterben zwei unregistriert in der Sahara.', layers: ['conflicts'], image: { wiki: 'Agadez', caption: 'Migrant convoy, Agadez, Niger' } },
                { center: [25, 42], zoom: 5, title: '🚶 BALKAN ROUTE — EUROPE\'S CORRIDOR', title_de: '🚶 BALKANROUTE — EUROPAS KORRIDOR', text: '📍 ROUTE: Turkey → Greece → North Macedonia → Serbia → Hungary/Croatia → Austria/Germany\n📏 DISTANCE: 2,500–3,000 km\n👥 REFUGEES: 1 million+ in 2015 alone — the peak of the European refugee crisis\n💀 DEATH TOLL: 400+ since 2015 — hypothermia, drowning in rivers, landmines in border areas\n\nSyrian, Afghan, and Iraqi refugees crossed from Turkey to Greek islands (Lesbos, Kos) on rubber dinghies, then walked north through the Balkans. In 2015, 3-year-old Alan Kurdi drowned off the Turkish coast — his photo shocked the world and briefly opened European borders. Germany accepted 890,000 asylum seekers in 2015 under Angela Merkel\'s "Wir schaffen das" policy. Hungary built a razor-wire fence. The EU-Turkey deal (2016) reduced crossings by 97% — but pushed refugees onto more dangerous routes.', text_de: '📍 ROUTE: Türkei → Griechenland → Nordmazedonien → Serbien → Ungarn/Kroatien → Österreich/Deutschland\n📏 DISTANZ: 2.500–3.000 km\n👥 FLÜCHTLINGE: 1 Million+ allein 2015\n💀 TODESOPFER: 400+ seit 2015\n\nSyrische, afghanische und irakische Flüchtlinge überquerten per Schlauchboot die Ägäis und liefen durch den Balkan nach Norden. Das Foto des ertrunkenen 3-jährigen Alan Kurdi erschütterte die Welt. Deutschland nahm 2015 unter Merkels "Wir schaffen das" 890.000 Asylsuchende auf.', layers: ['conflicts'], image: { wiki: 'European_migrant_crisis', caption: 'Refugees on the Balkan route, 2015' } },
                { center: [30, 20], zoom: 2, title: '🚶 MIGRATION — THE GLOBAL PICTURE', title_de: '🚶 MIGRATION — DAS GLOBALE BILD', text: '🌍 THE GREATEST DISPLACEMENT CRISIS IN HUMAN HISTORY.\n\n📊 KEY STATISTICS:\n• Forcibly displaced worldwide: 117.3 million people (UNHCR, 2024)\n• Refugees under UNHCR mandate: 36.4 million\n• Internally displaced: 62.5 million\n• Top origin countries: Syria (6.5M), Ukraine (6.3M), Afghanistan (6.1M), Venezuela (7.7M)\n• Top host countries: Turkey (3.6M), Iran (3.4M), Colombia (2.9M), Germany (2.6M), Pakistan (2.1M)\n• Deaths on migration routes since 2014: 63,000+ documented (IOM) — true figure likely 2-3x higher\n• Children among refugees: 40%\n• Average time spent as a refugee: 20 years\n\n💡 Behind every statistic is a family that lost everything — home, safety, identity — and risked death for the chance of survival. The question is not whether people will move. It is whether the world will respond with walls or with dignity.', text_de: '🌍 DIE GRÖSSTE VERTREIBUNGSKRISE DER MENSCHHEITSGESCHICHTE.\n\n📊 STATISTIKEN:\n• Zwangsvertriebene weltweit: 117,3 Millionen (UNHCR, 2024)\n• Flüchtlinge: 36,4 Millionen\n• Binnenvertriebene: 62,5 Millionen\n• Tote auf Fluchtrouten seit 2014: 63.000+ dokumentiert — wahre Zahl vermutlich 2-3x höher\n• Kinder unter Flüchtlingen: 40%\n• Durchschnittliche Dauer als Flüchtling: 20 Jahre\n\n💡 Hinter jeder Statistik steht eine Familie, die alles verloren hat. Die Frage ist nicht, ob Menschen fliehen werden. Sondern ob die Welt mit Mauern oder mit Würde antwortet.', layers: ['conflicts', 'regimes'] }
            ]
        },
        genocide: {
            name: 'Genocide Sites — Never Again',
            name_de: 'Genozid-Gedenkorte — Nie wieder',
            category: 'society',
            steps: [
                { center: [19.2033, 50.0343], zoom: 14, title: '✡️ AUSCHWITZ-BIRKENAU — THE FACTORY OF DEATH', title_de: '✡️ AUSCHWITZ-BIRKENAU — DIE TODESFABRIK', text: '📍 LOCATION: Oświęcim, Poland — 60 km west of Kraków.\n☠️ PERIOD: 1940–1945\n💀 DEATH TOLL: 1.1 million murdered — 90% were Jewish.\n\n📊 Auschwitz was the largest Nazi extermination camp. It consisted of 3 main camps and 40+ sub-camps. At peak capacity, Birkenau\'s 4 gas chambers and crematoria could kill 6,000 people per day. Prisoners arrived in cattle cars after days without food or water. SS doctor Josef Mengele performed horrific medical experiments on twins and children. On January 27, 1945, Soviet troops liberated 7,000 surviving prisoners — walking skeletons. The camp contained 7 tons of human hair, 44,000 pairs of shoes, and 3,800 suitcases with names still attached. Today, Auschwitz is the most visited Holocaust memorial — 2.3 million visitors per year. International Holocaust Remembrance Day is observed on January 27.', text_de: '📍 ORT: Oświęcim, Polen — 60 km westlich von Krakau.\n☠️ ZEITRAUM: 1940–1945\n💀 TODESOPFER: 1,1 Millionen ermordet — 90% waren jüdisch.\n\n📊 Auschwitz war das größte NS-Vernichtungslager. 3 Hauptlager und 40+ Außenlager. In Birkenau konnten 4 Gaskammern und Krematorien bis zu 6.000 Menschen pro Tag töten. Am 27. Januar 1945 befreite die Rote Armee 7.000 Überlebende. Im Lager fanden sich 7 Tonnen menschliches Haar und 44.000 Paar Schuhe. Heute besuchen 2,3 Millionen Menschen pro Jahr die Gedenkstätte. Der 27. Januar ist Internationaler Holocaust-Gedenktag.', layers: ['conflicts'], image: { wiki: 'Auschwitz_concentration_camp', caption: 'Auschwitz-Birkenau gate, Poland' } },
                { center: [29.8739, -1.9536], zoom: 12, title: '🇷🇼 KIGALI — 100 DAYS OF SLAUGHTER', title_de: '🇷🇼 KIGALI — 100 TAGE DES SCHLACHTENS', text: '📍 LOCATION: Kigali Genocide Memorial, Rwanda.\n☠️ PERIOD: April 7 – July 15, 1994 — 100 days.\n💀 DEATH TOLL: 800,000–1,000,000 Tutsi and moderate Hutu murdered.\n\n📊 The Rwandan genocide was the fastest mass killing in recorded history — an average of 8,000 people killed per day. Hutu extremists used radio station RTLM to broadcast kill lists and coordinates. Machetes were the primary weapon — imported in bulk from China in the months before. The UN had 2,500 peacekeepers in Rwanda (UNAMIR) under Canadian General Roméo Dallaire, who begged for reinforcements. The Security Council voted to REDUCE forces to 270. France, the UK, and the US blocked intervention. 250,000 women were raped as a weapon of war. The Kigali Memorial holds the remains of 250,000 victims. Rwanda has since become one of Africa\'s fastest-growing economies — but the trauma endures.', text_de: '📍 ORT: Kigali Genocide Memorial, Ruanda.\n☠️ ZEITRAUM: 7. April – 15. Juli 1994 — 100 Tage.\n💀 TODESOPFER: 800.000–1.000.000 Tutsi und moderate Hutu ermordet.\n\n📊 Der schnellste Völkermord der Geschichte — durchschnittlich 8.000 Tote pro Tag. Hutu-Extremisten nutzten Radio RTLM zur Verbreitung von Todeslisten. Macheten waren die Hauptwaffe. Die UNO hatte 2.500 Blauhelme vor Ort — der Sicherheitsrat stimmte für eine REDUZIERUNG auf 270. Frankreich, Großbritannien und die USA blockierten jede Intervention. 250.000 Frauen wurden als Kriegswaffe vergewaltigt.', layers: ['conflicts'], image: { wiki: 'Rwandan_genocide', caption: 'Kigali Genocide Memorial, Rwanda' } },
                { center: [19.2969, 44.1072], zoom: 12, title: '🇧🇦 SREBRENICA — EUROPE\'S DARKEST HOUR', title_de: '🇧🇦 SREBRENICA — EUROPAS DUNKELSTE STUNDE', text: '📍 LOCATION: Srebrenica-Potočari Memorial, Bosnia.\n☠️ PERIOD: July 11–22, 1995.\n💀 DEATH TOLL: 8,372 Bosniak men and boys murdered.\n\n📊 Srebrenica was a UN-declared "safe area" protected by 400 Dutch peacekeepers (Dutchbat). On July 11, 1995, Bosnian Serb forces under General Ratko Mladić overran the enclave. The Dutch surrendered without resistance. Over 8,000 Muslim men and boys were systematically separated from women and executed in fields, warehouses, and along roadsides. Mass graves were later dug up and scattered across 50+ secondary sites to hide evidence. Mladić was convicted of genocide by the ICTY in 2017. The Potočari Memorial Cemetery contains 6,671 identified victims — DNA identification continues. It was the worst massacre in Europe since World War II.', text_de: '📍 ORT: Srebrenica-Potočari Gedenkstätte, Bosnien.\n☠️ ZEITRAUM: 11.–22. Juli 1995.\n💀 TODESOPFER: 8.372 bosniakische Männer und Jungen ermordet.\n\n📊 Srebrenica war eine UN-Schutzzone, bewacht von 400 niederländischen Blauhelmen. Am 11. Juli 1995 überrannten bosnisch-serbische Truppen unter General Mladić die Enklave. Über 8.000 muslimische Männer und Jungen wurden systematisch getrennt und erschossen. Massengräber wurden auf 50+ Sekundärstandorte verteilt. Mladić wurde 2017 vom ICTY wegen Völkermordes verurteilt. Das schlimmste Massaker in Europa seit dem Zweiten Weltkrieg.', layers: ['conflicts'], image: { wiki: 'Srebrenica_massacre', caption: 'Srebrenica-Potočari Memorial' } },
                { center: [104.9160, 11.5494], zoom: 14, title: '🇰🇭 TUOL SLENG (S-21) — THE KILLING FIELDS', title_de: '🇰🇭 TUOL SLENG (S-21) — DIE KILLING FIELDS', text: '📍 LOCATION: Phnom Penh, Cambodia.\n☠️ PERIOD: 1975–1979 — Khmer Rouge regime under Pol Pot.\n💀 DEATH TOLL: 1.5–2 million (25% of Cambodia\'s population).\n\n📊 Tuol Sleng was a high school converted into Security Prison 21 (S-21). Of 17,000–20,000 prisoners, only 12 survived. Prisoners were photographed, tortured into false confessions, then trucked to the Choeung Ek killing fields for execution. The Khmer Rouge emptied cities, abolished money, schools, and religion, and executed anyone with education — wearing glasses was a death sentence. The regime targeted ethnic Vietnamese, Chinese, Thai, and Muslim Cham minorities. Mass graves at Choeung Ek contain 8,985 bodies. A Buddhist stupa memorial displays 5,000 skulls. The Khmer Rouge tribunal (ECCC) has convicted only 3 people.', text_de: '📍 ORT: Phnom Penh, Kambodscha.\n☠️ ZEITRAUM: 1975–1979 — Rote Khmer unter Pol Pot.\n💀 TODESOPFER: 1,5–2 Millionen (25% der Bevölkerung Kambodschas).\n\n📊 Tuol Sleng war eine Schule, umgewandelt in Sicherheitsgefängnis S-21. Von 17.000–20.000 Gefangenen überlebten nur 12. Die Roten Khmer leerten Städte, schafften Geld, Schulen und Religion ab. Brillenträger wurden als Intellektuelle hingerichtet. Massengräber in Choeung Ek enthalten 8.985 Leichen. Ein buddhistischer Stupa zeigt 5.000 Schädel. Das Khmer-Rouge-Tribunal hat nur 3 Personen verurteilt.', layers: ['conflicts'], image: { wiki: 'Tuol_Sleng_Genocide_Museum', caption: 'Tuol Sleng Genocide Museum, Phnom Penh' } },
                { center: [45.9803, 35.1787], zoom: 11, title: '🇮🇶 HALABJA — THE GAS ATTACK', title_de: '🇮🇶 HALABJA — DER GIFTGASANGRIFF', text: '📍 LOCATION: Halabja, Kurdistan Region, Iraq.\n☠️ DATE: March 16, 1988 — single day.\n💀 DEATH TOLL: 5,000 killed instantly; 10,000+ injured; thousands more died from long-term effects.\n\n📊 On March 16, 1988, Iraqi Air Force jets dropped chemical weapons — mustard gas, sarin, tabun, and VX nerve agent — on the Kurdish city of Halabja. The attack was part of Saddam Hussein\'s Anfal campaign, which killed 50,000–182,000 Kurds and destroyed 4,500 villages. Halabja was the largest chemical weapons attack against a civilian population in history. Survivors suffer from cancer, blindness, and birth defects to this day. The attack was directed by Ali Hassan al-Majid ("Chemical Ali"), who was executed in 2010. The Halabja Monument stands at the site of the attack. Iraq\'s High Tribunal ruled the Anfal campaign a genocide in 2010.', text_de: '📍 ORT: Halabja, Kurdistan-Region, Irak.\n☠️ DATUM: 16. März 1988 — ein einziger Tag.\n💀 TODESOPFER: 5.000 sofort getötet; 10.000+ verletzt.\n\n📊 Am 16. März 1988 warfen irakische Kampfjets Chemiewaffen — Senfgas, Sarin, Tabun und VX-Nervengift — auf die kurdische Stadt Halabja. Der Angriff war Teil von Saddam Husseins Anfal-Kampagne, die 50.000–182.000 Kurden tötete und 4.500 Dörfer zerstörte. Halabja war der größte Chemiewaffenangriff auf eine Zivilbevölkerung in der Geschichte. Überlebende leiden bis heute an Krebs und Erblindung. Das irakische Tribunal erklärte die Anfal-Kampagne 2010 zum Genozid.', layers: ['conflicts'], image: { wiki: 'Halabja_chemical_attack', caption: 'Halabja memorial monument, Iraq' } },
                { center: [40.1409, 35.3362], zoom: 10, title: '🇦🇲 DEIR EZ-ZOR — THE ARMENIAN GENOCIDE', title_de: '🇦🇲 DEIR EZ-ZOR — DER ARMENISCHE GENOZID', text: '📍 LOCATION: Deir ez-Zor, Syria — endpoint of death marches.\n☠️ PERIOD: 1915–1923.\n💀 DEATH TOLL: 1.5 million Armenians killed.\n\n📊 The Ottoman Empire systematically exterminated its Armenian population during WWI. Men were executed immediately. Women, children, and elderly were force-marched 600+ km through the Syrian desert to Deir ez-Zor — a deliberate death march. Those who survived the march were massacred in the desert. Bodies filled the Euphrates River for months. The Armenian Genocide Memorial in Deir ez-Zor (destroyed by ISIS in 2014) commemorated the victims. Turkey still officially denies the genocide. 34 countries have formally recognized it. Raphael Lemkin, who coined the word "genocide" in 1944, cited the Armenian case as his primary motivation. The genocide dispersed Armenians worldwide — creating a 7-million-strong diaspora.', text_de: '📍 ORT: Deir ez-Zor, Syrien — Endpunkt der Todesmärsche.\n☠️ ZEITRAUM: 1915–1923.\n💀 TODESOPFER: 1,5 Millionen Armenier ermordet.\n\n📊 Das Osmanische Reich vernichtete systematisch seine armenische Bevölkerung. Frauen, Kinder und Alte wurden 600+ km durch die syrische Wüste getrieben — ein bewusster Todesmarsch. Die Türkei leugnet den Genozid bis heute offiziell. 34 Länder haben ihn anerkannt. Raphael Lemkin, der das Wort \"Genozid\" 1944 prägte, nannte den armenischen Fall als seine Hauptmotivation. Die Diaspora umfasst heute 7 Millionen Armenier weltweit.', layers: ['conflicts'], image: { wiki: 'Armenian_genocide', caption: 'Armenian genocide memorial, Yerevan' } },
                { center: [92.1500, 21.4300], zoom: 8, title: '🇲🇲 ROHINGYA — GENOCIDE IN REAL TIME', title_de: '🇲🇲 ROHINGYA — GENOZID IN ECHTZEIT', text: '📍 LOCATION: Rakhine State, Myanmar → Cox\'s Bazar, Bangladesh.\n☠️ PERIOD: 2016–present.\n💀 DEATH TOLL: 24,000+ killed; 18,000+ women raped; 116,000+ beaten (UN estimates).\n\n📊 The Rohingya, a Muslim minority of 1.1 million, have been called "the most persecuted people on earth." In August 2017, the Myanmar military launched "clearance operations" — burning 354 villages, systematically raping women, and killing thousands. 740,000 Rohingya fled to Bangladesh in 3 months. The Kutupalong camp complex (960,000+ people) is the largest refugee settlement on Earth. The ICJ ordered Myanmar to prevent genocide (2020). Myanmar\'s military junta seized power in 2021, making accountability nearly impossible. Satellite imagery confirmed the destruction of entire communities. The Rohingya remain stateless — denied citizenship by Myanmar, unable to return.', text_de: '📍 ORT: Rakhine-Staat, Myanmar → Cox\'s Bazar, Bangladesch.\n☠️ ZEITRAUM: 2016–heute.\n💀 TODESOPFER: 24.000+ getötet; 18.000+ Frauen vergewaltigt (UN-Schätzung).\n\n📊 Die Rohingya, eine muslimische Minderheit von 1,1 Millionen, gelten als \"das am meisten verfolgte Volk der Erde.\" Im August 2017 startete Myanmars Militär \"Säuberungsaktionen\" — 354 Dörfer verbrannt, systematische Vergewaltigungen. 740.000 flohen in 3 Monaten nach Bangladesch. Das Lager Kutupalong (960.000+ Menschen) ist die größte Flüchtlingssiedlung der Welt. Der IGH ordnete Myanmar 2020 an, den Genozid zu verhindern. Die Rohingya bleiben staatenlos.', layers: ['conflicts', 'regimes'], image: { wiki: 'Rohingya_genocide', caption: 'Rohingya refugee camp, Cox\'s Bazar' } },
                { center: [20, 20], zoom: 2, title: '🕯️ NEVER AGAIN — THE GLOBAL RECKONING', title_de: '🕯️ NIE WIEDER — DIE GLOBALE BILANZ', text: '🌍 THE DARKEST CHAPTERS OF HUMANITY — mapped.\n\n📊 KEY FACTS:\n• Total genocide victims in this tour: 5+ million lives\n• The Holocaust: 6 million Jews + 5 million others = 11 million total\n• Rwanda: fastest genocide — 800,000 in 100 days\n• Cambodia: highest percentage — 25% of the population\n• Armenia: the genocide that coined the word "genocide"\n• UN Genocide Convention adopted: December 9, 1948\n• Countries that have ratified it: 153\n• ICC established: 2002 — first permanent international criminal court\n• Genocides since "Never Again": Cambodia, Rwanda, Bosnia, Darfur, Rohingya\n\n💡 "Never Again" was the promise made after the Holocaust. It has been broken repeatedly. These memorial sites exist not as history — but as warnings. The question is not whether it can happen again. It is whether we will recognize it in time.', text_de: '🌍 DIE DUNKELSTEN KAPITEL DER MENSCHHEIT — kartiert.\n\n📊 FAKTEN:\n• Genozid-Opfer dieser Tour: 5+ Millionen Leben\n• Der Holocaust: 6 Millionen Juden + 5 Millionen andere = 11 Millionen\n• Ruanda: schnellster Genozid — 800.000 in 100 Tagen\n• Kambodscha: höchster Anteil — 25% der Bevölkerung\n• Armenien: der Genozid, der das Wort „Genozid" prägte\n• UN-Genozidkonvention: 9. Dezember 1948\n• Ratifiziert von: 153 Ländern\n• ICC gegründet: 2002\n• Genozide seit „Nie wieder": Kambodscha, Ruanda, Bosnien, Darfur, Rohingya\n\n💡 „Nie wieder" war das Versprechen nach dem Holocaust. Es wurde wiederholt gebrochen. Diese Gedenkorte existieren nicht als Geschichte — sondern als Warnung.', layers: ['conflicts', 'regimes'] }
            ]
        },
        structures: {
            name: 'Greatest Structures of Humanity',
            name_de: 'Größte Bauwerke der Menschheit',
            category: 'history',
            steps: [
                { center: [31.1342, 29.9792], zoom: 16, pitch: 60, title: '🏛️ GREAT PYRAMID OF GIZA — THE LAST WONDER', title_de: '🏛️ GROSSE PYRAMIDE VON GIZEH — DAS LETZTE WELTWUNDER', text: '📍 LOCATION: Giza Plateau, Egypt\n🏗️ BUILT: ~2560 BC (4,500+ years ago)\n📏 HEIGHT: 146.6m original (138.5m today) — tallest man-made structure for 3,800 years\n\n📊 KEY FACTS:\n• 2.3 million limestone blocks, each weighing 2.5 tonnes on average\n• Total weight: 6.1 million tonnes\n• Base area: 53,000 m² (13 acres) — accurate to within 15mm\n• Construction time: ~20 years\n• Workforce: 20,000–30,000 skilled workers (not slaves — paid laborers with medical care)\n• Interior temperature: constant 20°C year-round\n\nThe Great Pyramid is the only surviving Wonder of the Ancient World. Built as a tomb for Pharaoh Khufu, it remained the tallest structure on Earth until Lincoln Cathedral was completed in 1311 AD. The precision of the base alignment (within 0.05° of true north) still baffles engineers. In 2017, the ScanPyramids project discovered a 30-meter void inside using cosmic-ray muon imaging — its purpose remains unknown.', text_de: '📍 ORT: Gizeh-Plateau, Ägypten\n🏗️ ERBAUT: ~2560 v. Chr. (über 4.500 Jahre alt)\n📏 HÖHE: 146,6m original — 3.800 Jahre lang höchstes Bauwerk der Welt\n\n📊 FAKTEN:\n• 2,3 Millionen Kalksteinblöcke, je ca. 2,5 Tonnen\n• Gesamtgewicht: 6,1 Millionen Tonnen\n• Bauzeit: ~20 Jahre mit 20.000–30.000 Facharbeitern\n• Innentemperatur: konstant 20°C ganzjährig\n\nDie Große Pyramide ist das einzige erhaltene Weltwunder der Antike. 2017 entdeckte das ScanPyramids-Projekt mittels kosmischer Myonen einen 30m großen Hohlraum — sein Zweck ist bis heute unbekannt.', layers: [], image: { wiki: 'Great_Pyramid_of_Giza', caption: 'Great Pyramid of Giza, Egypt' } },
                { center: [116.565, 40.432], zoom: 15, pitch: 60, title: '🧱 GREAT WALL OF CHINA — THE LONGEST STRUCTURE EVER BUILT', title_de: '🧱 CHINESISCHE MAUER — DAS LÄNGSTE BAUWERK DER GESCHICHTE', text: '📍 LOCATION: Badaling Section, Beijing, China\n🏗️ BUILT: 7th century BC – 1644 AD (~2,300 years of construction)\n📏 LENGTH: 21,196 km (official survey, 2012) — enough to cross the USA 5 times\n\n📊 KEY FACTS:\n• Not one wall but a network of walls, trenches, and natural barriers\n• The Ming Dynasty sections (1368–1644) are the most iconic and best preserved\n• Estimated workforce: hundreds of thousands to over 1 million at peak periods\n• Construction deaths: estimated 400,000+ — many buried within the wall itself\n• Width: 4.5–8m (wide enough for 5 horses or 10 soldiers side by side)\n• Watchtowers: 25,000+ along the full length\n\nContrary to popular myth, the Great Wall is NOT visible from space with the naked eye — this was debunked by multiple astronauts including Yang Liwei. The Badaling section near Beijing receives 10+ million visitors per year, making it one of the most visited monuments on Earth.', text_de: '📍 ORT: Badaling-Abschnitt, Peking, China\n🏗️ ERBAUT: 7. Jhd. v. Chr. – 1644 n. Chr. (~2.300 Jahre Bauzeit)\n📏 LÄNGE: 21.196 km — genug, um die USA 5-mal zu durchqueren\n\n📊 FAKTEN:\n• Kein einzelnes Bauwerk, sondern ein Netzwerk aus Mauern, Gräben und Barrieren\n• Geschätzte Bautote: 400.000+ — viele in der Mauer selbst begraben\n• 25.000+ Wachtürme über die gesamte Länge\n\nEntgegen dem Mythos ist die Mauer NICHT aus dem Weltraum sichtbar — dies wurde von Astronauten wie Yang Liwei widerlegt.', layers: [], image: { wiki: 'Great_Wall_of_China', caption: 'Great Wall at Badaling, China' } },
                { center: [55.2744, 25.1972], zoom: 17, pitch: 60, title: '🏙️ BURJ KHALIFA — THE TALLEST BUILDING ON EARTH', title_de: '🏙️ BURJ KHALIFA — DAS HÖCHSTE GEBÄUDE DER ERDE', text: '📍 LOCATION: Downtown Dubai, UAE\n🏗️ BUILT: 2004–2010\n📏 HEIGHT: 828m (2,717 ft) — 163 floors\n💰 COST: $1.5 billion USD\n\n📊 KEY FACTS:\n• 828m tall — 320m taller than its nearest rival at time of completion\n• 57 elevators, fastest at 10 m/s (36 km/h)\n• 12,000 workers on site daily during peak construction\n• 330,000 m³ of concrete, 39,000 tonnes of steel rebar\n• Foundation: 192 piles driven 50m into the ground\n• Exterior cladding: 26,000 glass panels, hand-cut\n• Wind sway at top: up to 1.5m\n• Temperature difference top vs. base: up to 10°C\n• The "Buttressed Core" structural system was invented specifically for this building\n\nDeveloped by Emaar Properties and designed by Adrian Smith of SOM (Chicago). Named after Sheikh Khalifa bin Zayed Al Nahyan. The observation deck on floor 148 (At the Top SKY) at 555m is the highest occupied floor accessible to the public. The tower has its own condensation collection system that harvests 15 million gallons of water per year from the humid Dubai air.', text_de: '📍 ORT: Downtown Dubai, VAE\n🏗️ ERBAUT: 2004–2010\n📏 HÖHE: 828m — 163 Stockwerke\n💰 KOSTEN: $1,5 Milliarden\n\n📊 FAKTEN:\n• 12.000 Arbeiter täglich auf der Baustelle\n• 330.000 m³ Beton, 39.000 Tonnen Stahl\n• 26.000 Glasscheiben, von Hand geschnitten\n• Windauslenkung an der Spitze: bis zu 1,5m\n• Eigenes Kondensationssystem: 57 Millionen Liter Wasser/Jahr aus der Luft geerntet', layers: [], image: { wiki: 'Burj_Khalifa', caption: 'Burj Khalifa, Dubai' } },
                { center: [-79.918, 9.08], zoom: 14, pitch: 45, title: '🚢 PANAMA CANAL — THE SHORTCUT BETWEEN OCEANS', title_de: '🚢 PANAMAKANAL — DIE ABKÜRZUNG ZWISCHEN DEN OZEANEN', text: '📍 LOCATION: Panama (Atlantic to Pacific)\n🏗️ BUILT: 1904–1914 (10 years)\n📏 LENGTH: 82 km\n💰 COST: $500 million (1914) — equivalent to ~$15 billion today\n\n📊 KEY FACTS:\n• Saves ships a 12,000 km detour around South America\n• 27,000+ workers died during construction (French + American eras) — mostly from malaria and yellow fever\n• 3 sets of locks raise ships 26m above sea level through Gatun Lake\n• Transit time: 8–10 hours\n• Traffic: 14,000+ vessels per year (~40 ships/day), carrying 5% of world trade\n• Expanded in 2016: new "Neopanamax" locks accommodate ships up to 366m long\n• Revenue: ~$4.3 billion per year (2023)\n• A single transit costs $200,000–$800,000 depending on vessel size\n\nThe French attempt (1881–1894) under Ferdinand de Lesseps failed catastrophically — 22,000 workers died and the project went bankrupt. The U.S. succeeded by first eliminating mosquito-borne diseases. The Canal was returned to Panama in 1999 after 85 years of U.S. control.', text_de: '📍 ORT: Panama (Atlantik bis Pazifik)\n🏗️ ERBAUT: 1904–1914\n📏 LÄNGE: 82 km\n💰 KOSTEN: $500 Mio. (1914) — heute ~$15 Mrd.\n\n📊 FAKTEN:\n• Spart Schiffen 12.000 km Umweg um Südamerika\n• 27.000+ Tote beim Bau — vor allem durch Malaria und Gelbfieber\n• 14.000+ Schiffe/Jahr, 5% des Welthandels\n• Eine Durchfahrt kostet $200.000–$800.000\n• 2016 erweitert: neue Neopanamax-Schleusen für Schiffe bis 366m', layers: [], image: { wiki: 'Panama_Canal', caption: 'Panama Canal locks' } },
                { center: [-122.4786, 37.8199], zoom: 15, pitch: 60, title: '🌉 GOLDEN GATE BRIDGE — THE ICON', title_de: '🌉 GOLDEN GATE BRIDGE — DIE IKONE', text: '📍 LOCATION: San Francisco, California, USA\n🏗️ BUILT: 1933–1937 (4 years)\n📏 SPAN: 2,737m total; 1,280m main span\n💰 COST: $35 million (1937) — equivalent to ~$780 million today\n\n📊 KEY FACTS:\n• Main towers: 227m tall — taller than a 65-story building\n• Cable wire: 129,000 km total — enough to circle Earth 3 times\n• Each main cable: 92cm diameter, containing 27,572 individual wires\n• Paint color: "International Orange" (#C0362C) — chosen for visibility in fog\n• 11 workers died during construction; a safety net saved 19 others ("The Halfway-to-Hell Club")\n• Daily traffic: ~100,000 vehicles\n• Wind design: withstands winds up to 160 km/h; bridge deck can move 8m laterally\n\nWhen completed, it was the longest suspension bridge in the world — a record it held until 1964. Chief engineer Joseph Strauss insisted on the revolutionary safety net, saving 19 lives. The bridge is continuously painted — a team of 38 painters works year-round touching up the 690,000 m² of surface.', text_de: '📍 ORT: San Francisco, Kalifornien, USA\n🏗️ ERBAUT: 1933–1937\n📏 SPANNWEITE: 2.737m gesamt; 1.280m Hauptfeld\n💰 KOSTEN: $35 Mio. (1937) — heute ~$780 Mio.\n\n📊 FAKTEN:\n• Hauptpfeiler: 227m hoch\n• Kabel: 129.000 km Draht — reicht 3× um die Erde\n• Farbe: "International Orange" — gewählt für Sichtbarkeit im Nebel\n• 11 Tote beim Bau; ein Sicherheitsnetz rettete 19 weitere Leben\n• Täglicher Verkehr: ~100.000 Fahrzeuge', layers: [], image: { wiki: 'Golden_Gate_Bridge', caption: 'Golden Gate Bridge, San Francisco' } },
                { center: [12.4924, 41.8902], zoom: 17, pitch: 60, title: '🏟️ THE COLOSSEUM — ARENA OF BLOOD AND GLORY', title_de: '🏟️ DAS KOLOSSEUM — ARENA AUS BLUT UND RUHM', text: '📍 LOCATION: Rome, Italy\n🏗️ BUILT: 72–80 AD (8 years)\n📏 SIZE: 189m × 156m; 48m tall — capacity 50,000–80,000 spectators\n\n📊 KEY FACTS:\n• Largest amphitheater ever built — still the largest standing today\n• Built by 60,000+ Jewish slaves captured during the Siege of Jerusalem (70 AD)\n• 80 entrances allowed the entire venue to fill or empty in 15 minutes\n• Featured naval battles (naumachia) — the arena could be flooded to 1.5m depth\n• An estimated 400,000 people and 1 million animals died in the arena over 390 years\n• The velarium: a retractable canvas sunshade operated by 1,000 sailors\n• Beneath the floor: a 2-level underground complex (hypogeum) with 80 elevators for animals\n• Games lasted up to 100 days — Emperor Titus inaugurated it with 100 days of games in 80 AD\n\nThe Colosseum is the most iconic symbol of Imperial Rome. Damaged by earthquakes (1349) and stone robbery, only the northern wall stands at full height. It received 7.6 million visitors in 2023 — the most visited monument in Italy.', text_de: '📍 ORT: Rom, Italien\n🏗️ ERBAUT: 72–80 n. Chr. (8 Jahre)\n📏 GRÖSSE: 189m × 156m, 48m Höhe — 50.000–80.000 Zuschauer\n\n📊 FAKTEN:\n• Größtes jemals gebautes Amphitheater\n• Erbaut von 60.000+ jüdischen Sklaven nach der Belagerung Jerusalems\n• 80 Eingänge — Füllung/Entleerung in 15 Minuten\n• ~400.000 Menschen und 1 Million Tiere starben in der Arena über 390 Jahre\n• Velarium: einziehbares Sonnensegel, bedient von 1.000 Matrosen\n• 7,6 Millionen Besucher 2023 — meistbesuchtes Monument Italiens', layers: [], image: { wiki: 'Colosseum', caption: 'The Colosseum, Rome' } },
                { center: [8.651, 46.834], zoom: 14, pitch: 45, title: '🚄 GOTTHARD BASE TUNNEL — DEEPEST AND LONGEST', title_de: '🚄 GOTTHARD-BASISTUNNEL — TIEFSTER UND LÄNGSTER', text: '📍 LOCATION: Swiss Alps (Erstfeld to Bodio)\n🏗️ BUILT: 1999–2016 (17 years)\n📏 LENGTH: 57.1 km — longest railway tunnel in the world\n💰 COST: CHF 12.2 billion (~$13.5 billion)\n\n📊 KEY FACTS:\n• Maximum rock overburden: 2,300m — the deepest traffic tunnel on Earth\n• Rock temperature at deepest point: 46°C\n• 28.2 million tonnes of rock excavated — equivalent to 5 Great Pyramids\n• 4 massive tunnel boring machines (TBMs), each 400m long\n• 9 workers died during construction\n• Transit time: 17 minutes (vs. 2+ hours over the old mountain pass)\n• Train speed: up to 250 km/h through the tunnel\n• Carries 260 freight trains and 65 passenger trains daily\n• Reduces the Zurich–Milan journey from 3h40 to 2h40\n\nThe tunnel passes beneath the Gotthard massif at a maximum depth of 2,300m — deeper than any mine most people will ever visit. It replaced a 130-year-old mountain railway and is a key part of the EU\'s Rhine-Alpine freight corridor connecting Rotterdam to Genoa.', text_de: '📍 ORT: Schweizer Alpen (Erstfeld–Bodio)\n🏗️ ERBAUT: 1999–2016 (17 Jahre)\n📏 LÄNGE: 57,1 km — längster Eisenbahntunnel der Welt\n💰 KOSTEN: CHF 12,2 Mrd. (~$13,5 Mrd.)\n\n📊 FAKTEN:\n• Max. Felsüberdeckung: 2.300m — tiefster Verkehrstunnel der Erde\n• 28,2 Mio. Tonnen Fels ausgebrochen — entspricht 5 Großen Pyramiden\n• 9 Tote beim Bau\n• Fahrtzeit: 17 Minuten (vs. 2+ Stunden über den Pass)\n• Zürich–Mailand: von 3h40 auf 2h40 verkürzt', layers: [], image: { wiki: 'Gotthard_Base_Tunnel', caption: 'Gotthard Base Tunnel, Switzerland' } },
                { center: [39.8262, 21.4225], zoom: 16, pitch: 50, title: '🕋 MASJID AL-HARAM — THE HOLIEST SITE ON EARTH', title_de: '🕋 MASJID AL-HARAM — DER HEILIGSTE ORT DER ERDE', text: '📍 LOCATION: Mecca, Saudi Arabia\n🏗️ EXPANDED: Continuously since 638 AD; latest expansion 2015 (~$100 billion)\n📏 AREA: 356,000 m² — largest mosque and religious structure on Earth\n\n📊 KEY FACTS:\n• Capacity: 4 million worshippers simultaneously during Hajj\n• The Kaaba at its center is the most sacred site in Islam — 1.8 billion Muslims face it during prayer 5 times daily\n• Annual Hajj pilgrimage: 2–3 million people — the largest annual human gathering on Earth\n• The Black Stone (al-Hajar al-Aswad) set in the Kaaba\'s corner is believed to date back to Abraham\n• The Grand Mosque has been expanded 10+ times since the 7th century\n• The 2015 expansion added 78 escalators, 6 helicopter pads, and 24 minarets (each 89m tall)\n• Air conditioning: one of the largest cooling systems in the world — 17,000 tonnes of ice water daily\n• The Zamzam well beneath the mosque has been flowing for 4,000+ years\n\nThe annual Hajj is the world\'s largest coordinated human movement. Saudi Arabia has invested over $100 billion in expansions since 2011 to increase capacity from 2 to 4 million pilgrims.', text_de: '📍 ORT: Mekka, Saudi-Arabien\n🏗️ ERWEITERT: Kontinuierlich seit 638 n. Chr.; letzte Erweiterung 2015 (~$100 Mrd.)\n📏 FLÄCHE: 356.000 m² — größte Moschee und religiöses Bauwerk der Welt\n\n📊 FAKTEN:\n• Kapazität: 4 Millionen Gläubige gleichzeitig während des Hadsch\n• Die Kaaba ist der heiligste Ort des Islam — 1,8 Milliarden Muslime beten 5× täglich in ihre Richtung\n• Jährliche Hadsch-Pilgerfahrt: 2–3 Millionen Menschen\n• Klimaanlage: 17.000 Tonnen Eiswasser täglich\n• Der Zamzam-Brunnen fließt seit über 4.000 Jahren', layers: [], image: { wiki: 'Masjid_al-Haram', caption: 'Masjid al-Haram, Mecca' } },
                { center: [111.003, 30.823], zoom: 14, pitch: 50, title: '🏗️ THREE GORGES DAM — THE MOST POWERFUL STRUCTURE', title_de: '🏗️ DREI-SCHLUCHTEN-DAMM — DAS MÄCHTIGSTE BAUWERK', text: '📍 LOCATION: Yichang, Hubei Province, China\n🏗️ BUILT: 1994–2006 (12 years)\n📏 SIZE: 2,335m long × 185m high\n💰 COST: $31 billion USD\n\n📊 KEY FACTS:\n• 22,500 MW capacity — largest power station on Earth by installed capacity\n• Generates ~100 TWh per year — enough to power 60 million households\n• Reservoir length: 660 km — visible from space\n• 1.3 million people relocated to make way for the reservoir\n• 13 cities, 140 towns, and 1,350 villages submerged\n• Concrete used: 27.2 million m³ — 20× more than Hoover Dam\n• The dam is so massive it measurably slowed Earth\'s rotation by 0.06 microseconds\n• 32 turbines, each generating 700 MW — a single turbine powers a city of 500,000\n• Ship lift: the world\'s largest — raises 3,000-tonne vessels 113m in 40 minutes\n\nThe Three Gorges Dam is the single most controversial megaproject in modern history. It has prevented an estimated $50+ billion in flood damage but caused severe environmental damage: species displacement, increased landslide risk, and the loss of irreplaceable cultural heritage sites beneath the reservoir.', text_de: '📍 ORT: Yichang, Hubei-Provinz, China\n🏗️ ERBAUT: 1994–2006 (12 Jahre)\n📏 GRÖSSE: 2.335m Länge × 185m Höhe\n💰 KOSTEN: $31 Milliarden\n\n📊 FAKTEN:\n• 22.500 MW — größtes Kraftwerk der Erde\n• Erzeugt ~100 TWh/Jahr — genug für 60 Millionen Haushalte\n• 1,3 Millionen Menschen umgesiedelt, 13 Städte überflutet\n• 27,2 Mio. m³ Beton — 20× mehr als der Hoover-Damm\n• Der Damm ist so massiv, dass er die Erdrotation um 0,06 Mikrosekunden verlangsamt hat', layers: [], image: { wiki: 'Three_Gorges_Dam', caption: 'Three Gorges Dam, China' } },
                { center: [20, 30], zoom: 2, title: '🏗️ GREATEST STRUCTURES — THE LEGACY OF BUILDERS', title_de: '🏗️ GRÖSSTE BAUWERKE — DAS VERMÄCHTNIS DER BAUMEISTER', text: '🌍 FROM THE PYRAMIDS TO THE SKYSCRAPERS — mapped.\n\n📊 RECORDS:\n• Oldest: Great Pyramid of Giza (4,500+ years)\n• Tallest: Burj Khalifa (828m)\n• Longest: Great Wall of China (21,196 km)\n• Deepest: Gotthard Base Tunnel (2,300m below surface)\n• Most powerful: Three Gorges Dam (22,500 MW)\n• Most expensive: Masjid al-Haram expansion ($100+ billion)\n• Most deadly to build: Panama Canal (27,000+ deaths)\n• Largest religious structure: Masjid al-Haram (356,000 m²)\n• Most visited: Colosseum (7.6 million visitors/year)\n\n💡 These structures span 4,500 years of human ambition — from the slaves who built the pyramids to the engineers who bored through 57 km of Alpine rock. Each one pushed the limits of what was thought possible. They are monuments not just to power and faith, but to the stubborn human belief that we can reshape the Earth itself.', text_de: '🌍 VON DEN PYRAMIDEN BIS ZU DEN WOLKENKRATZERN — kartiert.\n\n📊 REKORDE:\n• Ältestes: Große Pyramide von Gizeh (4.500+ Jahre)\n• Höchstes: Burj Khalifa (828m)\n• Längstes: Chinesische Mauer (21.196 km)\n• Tiefstes: Gotthard-Basistunnel (2.300m unter der Oberfläche)\n• Leistungsstärkstes: Drei-Schluchten-Damm (22.500 MW)\n• Teuerstes: Masjid al-Haram Erweiterung ($100+ Mrd.)\n• Tödlichster Bau: Panamakanal (27.000+ Tote)\n\n💡 Diese Bauwerke umspannen 4.500 Jahre menschlichen Ehrgeiz. Jedes einzelne hat die Grenzen des Möglichen verschoben. Sie sind Monumente nicht nur der Macht und des Glaubens, sondern des hartnäckigen Glaubens, dass wir die Erde selbst umgestalten können.', layers: [] }
            ]
        },
        musicworld: {
            name: 'Music That Changed the World',
            name_de: 'Musik, die die Welt veränderte',
            category: 'sports',
            steps: [
                { center: [-90.05, 35.14], zoom: 14, title: '🎸 MEMPHIS — BIRTH OF ROCK\'N\'ROLL', title_de: '🎸 MEMPHIS — GEBURT DES ROCK\'N\'ROLL', text: '📍 Sun Studio, 706 Union Avenue, Memphis, Tennessee.\n\n📊 On July 5, 1954, Elvis Presley recorded "That\'s All Right" at Sun Studio — the song that launched rock\'n\'roll. Producer Sam Phillips had been searching for "a white man who could sing like a Black man." Sun Studio also recorded Johnny Cash, Jerry Lee Lewis, Carl Perkins, and Roy Orbison. Memphis was already the home of Beale Street blues — where B.B. King got his start. The city gave the world three genres: blues, rock\'n\'roll, and soul (Stax Records, Otis Redding, Isaac Hayes). Elvis became the best-selling solo artist in history: 500+ million records sold.', text_de: '📍 Sun Studio, 706 Union Avenue, Memphis, Tennessee.\n\n📊 Am 5. Juli 1954 nahm Elvis Presley "That\'s All Right" im Sun Studio auf — der Song, der den Rock\'n\'Roll begründete. Memphis war bereits die Heimat des Blues (B.B. King, Beale Street) und gab der Welt drei Genres: Blues, Rock\'n\'Roll und Soul. Elvis wurde zum meistverkauften Solokünstler der Geschichte: 500+ Millionen Platten.', layers: [], image: { wiki: 'Sun_Studio', caption: 'Sun Studio, Memphis' } },
                { center: [-2.9878, 53.4065], zoom: 14, title: '🎸 LIVERPOOL — THE BEATLES REVOLUTION', title_de: '🎸 LIVERPOOL — DIE BEATLES-REVOLUTION', text: '📍 The Cavern Club, 10 Mathew Street, Liverpool.\n\n📊 The Beatles played the Cavern Club 292 times between 1961–1963 before conquering the world. John, Paul, George, and Ringo became the best-selling band in history: 600+ million records. They transformed popular music, fashion, and youth culture. "Beatlemania" caused mass hysteria — their 1964 Ed Sullivan Show appearance drew 73 million viewers (40% of the US population). The "British Invasion" that followed changed American music forever. Lennon\'s assassination on December 8, 1980 in New York shocked the world. Liverpool\'s Beatles tourism generates £82 million annually.', text_de: '📍 The Cavern Club, 10 Mathew Street, Liverpool.\n\n📊 Die Beatles spielten 292 Mal im Cavern Club (1961–63) bevor sie die Welt eroberten. 600+ Millionen verkaufte Platten — meistverkaufte Band der Geschichte. Die "British Invasion" veränderte die amerikanische Musik für immer. Liverpools Beatles-Tourismus generiert £82 Millionen jährlich.', layers: [], image: { wiki: 'The_Beatles', caption: 'The Beatles, 1964' } },
                { center: [-76.79, 18.01], zoom: 10, title: '🎵 KINGSTON — REGGAE & RESISTANCE', title_de: '🎵 KINGSTON — REGGAE & WIDERSTAND', text: '📍 56 Hope Road, Kingston, Jamaica — Bob Marley Museum.\n\n📊 Bob Marley (1945–1981) transformed reggae from Jamaican street music into a global political force. "Get Up, Stand Up," "Redemption Song," and "One Love" became anthems of liberation across Africa, Latin America, and the Caribbean. Marley survived an assassination attempt in 1976 — shot in the arm, chest, and head, he performed two days later. Jamaica\'s sound system culture also birthed dancehall, ska, and dub — directly influencing hip-hop. Marley\'s "Legend" album has sold 33+ million copies — the best-selling reggae album ever. UNESCO declared reggae an Intangible Cultural Heritage of Humanity in 2018.', text_de: '📍 56 Hope Road, Kingston, Jamaika — Bob Marley Museum.\n\n📊 Bob Marley (1945–1981) machte Reggae zur globalen politischen Kraft. Seine Songs wurden zu Hymnen der Befreiung in Afrika und Lateinamerika. Jamaicas Sound-System-Kultur beeinflusste direkt die Entstehung von Hip-Hop. Die UNESCO erklärte Reggae 2018 zum Immateriellen Kulturerbe der Menschheit.', layers: [], image: { wiki: 'Bob_Marley', caption: 'Bob Marley performing' } },
                { center: [-73.9017, 40.8176], zoom: 14, title: '🎤 BRONX, NEW YORK — BIRTH OF HIP-HOP', title_de: '🎤 BRONX, NEW YORK — GEBURT DES HIP-HOP', text: '📍 1520 Sedgwick Avenue, Bronx, New York.\n\n📊 On August 11, 1973, DJ Kool Herc threw a back-to-school party at 1520 Sedgwick Avenue — the event now recognized as the birth of hip-hop. He used two turntables to loop the instrumental breaks of funk records, creating a new art form. MC\'ing, DJing, breakdancing, and graffiti became hip-hop\'s four pillars. From the burned-out Bronx of the 1970s, hip-hop grew into the world\'s dominant music genre — surpassing rock in 2017. Hip-hop is now a $30+ billion global industry. Artists like Tupac, Notorious B.I.G., Jay-Z, Kendrick Lamar, and Drake shaped not just music but fashion, language, and politics.', text_de: '📍 1520 Sedgwick Avenue, Bronx, New York.\n\n📊 Am 11. August 1973 veranstaltete DJ Kool Herc eine Party in der Bronx — die Geburtsstunde des Hip-Hop. Aus dem heruntergekommenen Bronx der 70er wurde das weltweit dominante Musikgenre — es überholte Rock 2017. Hip-Hop ist heute eine $30+ Milliarden-Industrie.', layers: [], image: { wiki: 'Hip_hop', caption: 'DJ Kool Herc\'s block party flyer, 1973' } },
                { center: [13.4432, 52.5112], zoom: 14, title: '🎧 BERLIN — TECHNO AFTER THE WALL', title_de: '🎧 BERLIN — TECHNO NACH DEM MAUERFALL', text: '📍 Tresor Club, Leipziger Straße 126a, Berlin.\n\n📊 After the Berlin Wall fell in 1989, abandoned buildings in East Berlin became the world\'s most legendary techno clubs. Tresor opened in 1991 in a former department store vault — concrete walls, no windows, minimal lighting. Berghain (opened 2004, a former power plant) is consistently ranked the world\'s #1 nightclub — its door policy is legendary (60%+ rejection rate). Berlin\'s techno scene was born from Detroit\'s electronic music, but the city\'s post-reunification chaos created a unique culture of freedom. The Love Parade (1989–2010) drew up to 1.5 million ravers. Berlin\'s club economy generates €1.5 billion annually and employs 9,000 people.', text_de: '📍 Tresor Club, Leipziger Straße 126a, Berlin.\n\n📊 Nach dem Mauerfall 1989 wurden leerstehende Gebäude in Ostberlin zu den legendärsten Technoclubs der Welt. Berghain wird konstant als weltbester Club bewertet. Die Love Parade zog bis zu 1,5 Millionen Raver an. Berlins Clubwirtschaft generiert €1,5 Milliarden jährlich.', layers: [], image: { wiki: 'Tresor_(club)', caption: 'Tresor Club, Berlin' } },
                { center: [-83.0458, 42.3314], zoom: 14, title: '🎵 DETROIT — MOTOWN & THE SOUND OF YOUNG AMERICA', title_de: '🎵 DETROIT — MOTOWN & DER SOUND DES JUNGEN AMERIKA', text: '📍 Hitsville U.S.A., 2648 West Grand Boulevard, Detroit.\n\n📊 Berry Gordy founded Motown Records in 1959 with an $800 loan. From a converted house in Detroit, he built the most successful Black-owned business in America. Motown\'s assembly-line approach to hit-making produced: The Supremes, Stevie Wonder, Marvin Gaye, The Jackson 5, The Temptations, and Smokey Robinson. Between 1961–1971, Motown had 110 Top 10 hits. "What\'s Going On" (1971) by Marvin Gaye is ranked the greatest album of all time by Rolling Stone. Motown broke racial barriers — their artists were the first Black musicians regularly played on white radio stations. The label was sold to MCA in 1988 for $61 million.', text_de: '📍 Hitsville U.S.A., 2648 West Grand Boulevard, Detroit.\n\n📊 Berry Gordy gründete 1959 Motown Records mit einem $800-Kredit. Aus einem umgebauten Haus in Detroit schuf er das erfolgreichste afroamerikanische Unternehmen Amerikas. Motown produzierte 110 Top-10-Hits zwischen 1961–1971 und durchbrach Rassenschranken im Radio.', layers: [], image: { wiki: 'Motown', caption: 'Hitsville U.S.A., Detroit' } },
                { center: [127.0276, 37.4979], zoom: 12, title: '🎵 SEOUL — K-POP CONQUERS THE WORLD', title_de: '🎵 SEOUL — K-POP EROBERT DIE WELT', text: '📍 HYBE Building (BTS HQ), Yongsan-gu, Seoul.\n\n📊 K-Pop is the most successful cultural export in Asian history. BTS alone generated $5 billion annually for South Korea\'s economy — equivalent to 26 Samsung factories. Their 2020 hit "Dynamite" was the first all-English song by a Korean group to hit #1 on the Billboard Hot 100. BLACKPINK\'s Coachella performance (2023) drew 125,000+ fans. South Korea invests $500 million annually in its cultural export strategy ("Hallyu"). K-Pop training academies recruit children as young as 10 for 7+ years of intensive training. The industry generates $10+ billion globally. PSY\'s "Gangnam Style" (2012) was the first YouTube video to reach 1 billion views.', text_de: '📍 HYBE Building (BTS HQ), Yongsan-gu, Seoul.\n\n📊 K-Pop ist der erfolgreichste Kulturexport der asiatischen Geschichte. BTS generiert allein $5 Milliarden jährlich für Südkoreas Wirtschaft. BLACKPINK zog 125.000+ Fans bei Coachella an. PSY\'s "Gangnam Style" war das erste YouTube-Video mit 1 Milliarde Aufrufen. Die Branche generiert weltweit $10+ Milliarden.', layers: [], image: { wiki: 'K-pop', caption: 'BTS performing, Seoul' } },
                { center: [10, 30], zoom: 2, title: '🎵 MUSIC — THE UNIVERSAL LANGUAGE', title_de: '🎵 MUSIK — DIE UNIVERSELLE SPRACHE', text: '🌍 FROM MEMPHIS TO SEOUL — mapped.\n\n📊 KEY FACTS:\n• Global recorded music revenue (2024): $28.6 billion\n• Spotify monthly active users: 626 million\n• Most streamed song ever: "Blinding Lights" by The Weeknd (4.3B streams)\n• Most streamed artist: Drake (75+ billion total streams)\n• Best-selling album: "Thriller" by Michael Jackson (70 million copies)\n• Vinyl revival: 43 million records sold in 2023 — highest since 1987\n• AI-generated music tracks on Spotify: 100,000+ (2024)\n• Live music industry value: $32 billion globally\n\n💡 Music is humanity\'s oldest art form and its most powerful connector. Every city in this tour gave birth to a sound that transcended borders, languages, and politics. From Elvis\'s swiveling hips to BTS\'s synchronized choreography — music doesn\'t just reflect culture. It creates it.', text_de: '🌍 VON MEMPHIS BIS SEOUL — kartiert.\n\n📊 FAKTEN:\n• Globaler Musikumsatz (2024): $28,6 Milliarden\n• Spotify-Nutzer: 626 Millionen\n• Meistgestreamter Song: "Blinding Lights" (4,3 Mrd. Streams)\n• Vinyl-Revival: 43 Mio. Platten 2023 — Höchststand seit 1987\n• AI-generierte Tracks auf Spotify: 100.000+\n\n💡 Musik ist die älteste Kunstform der Menschheit. Jede Stadt in dieser Tour brachte einen Sound hervor, der Grenzen, Sprachen und Politik überwand.', layers: [] }
            ]
        },
        filmlocations: {
            name: 'Filming Locations — Where Movies Became Real',
            name_de: 'Drehorte — Wo Filme Wirklichkeit wurden',
            category: 'sports',
            steps: [
                { center: [7.934, 33.544], zoom: 14, title: '🎬 MATMATA, TUNISIA — STAR WARS', title_de: '🎬 MATMATA, TUNESIEN — STAR WARS', text: '📍 Hotel Sidi Driss, Matmata, Tunisia.\n\n📊 George Lucas chose the underground Berber cave dwellings of Matmata as Luke Skywalker\'s childhood home on Tatooine. The planet\'s name comes from the Tunisian city of Tataouine. Star Wars (1977) was filmed across 7 locations in Tunisia. The sets remain in the desert as tourist attractions. Star Wars is the 2nd highest-grossing franchise ($10.3 billion). You can sleep in Luke\'s dining room for $30/night.', text_de: '📍 Hotel Sidi Driss, Matmata, Tunesien.\n\n📊 George Lucas wählte die unterirdischen Berber-Höhlenwohnungen als Luke Skywalkers Heimat auf Tatooine. Star Wars wurde an 7 Orten in Tunesien gedreht. Die Kulissen stehen noch in der Wüste. Man kann im Original-Hotel für $30/Nacht übernachten.', layers: [], image: { wiki: 'Star_Wars_(film)', caption: 'Matmata cave dwellings, Tunisia' } },
                { center: [18.0944, 42.6407], zoom: 14, title: '🎬 DUBROVNIK — GAME OF THRONES', title_de: '🎬 DUBROVNIK — GAME OF THRONES', text: '📍 Old Town, Dubrovnik, Croatia — King\'s Landing.\n\n📊 Dubrovnik\'s medieval walls became King\'s Landing across 8 seasons (2011–2019). Fort Lovrijenac = Red Keep, Jesuit Staircase = Cersei\'s Walk of Shame. GoT tourism increased visitors by 50%. The city charges €35 entry to limit overcrowding. HBO spent $15 million per episode. 59 Emmy Awards — most for any drama. Franchise revenue: $4+ billion.', text_de: '📍 Altstadt, Dubrovnik, Kroatien — Königsmund.\n\n📊 Dubrovniks mittelalterliche Mauern wurden zu Königsmund. GoT-Tourismus steigerte Besucher um 50%. Die Stadt erhebt €35 Eintritt gegen Overtourism. 59 Emmy Awards — Rekord. Franchise-Umsatz: $4+ Milliarden.', layers: [], image: { wiki: 'Game_of_Thrones', caption: 'Fort Lovrijenac, Dubrovnik' } },
                { center: [168.66, -44.73], zoom: 10, title: '🎬 QUEENSTOWN — LORD OF THE RINGS', title_de: '🎬 QUEENSTOWN — HERR DER RINGE', text: '📍 Queenstown & Matamata (Hobbiton), New Zealand.\n\n📊 Peter Jackson used 150+ locations across New Zealand for LOTR (2001–2003) and The Hobbit (2012–2014). Hobbiton draws 700,000 visitors/year. NZ tourism grew 50% after LOTR (+$1.2 billion/year). The country rebranded as "Middle-earth." The trilogy won 17 Oscars — Return of the King swept all 11 nominations. Franchise revenue: $6+ billion.', text_de: '📍 Queenstown & Matamata (Hobbiton), Neuseeland.\n\n📊 150+ Drehorte in ganz Neuseeland. Hobbiton zieht 700.000 Besucher/Jahr an. NZ-Tourismus stieg 50% (+$1,2 Mrd./Jahr). 17 Oscars. Franchise-Umsatz: $6+ Milliarden.', layers: [], image: { wiki: 'The_Lord_of_the_Rings_(film_series)', caption: 'Hobbiton, New Zealand' } },
                { center: [-10.5085, 51.7700], zoom: 14, title: '🎬 SKELLIG MICHAEL — JEDI TEMPLE', title_de: '🎬 SKELLIG MICHAEL — JEDI-TEMPEL', text: '📍 Skellig Michael, County Kerry, Ireland.\n\n📊 This 6th-century monastic island became Luke Skywalker\'s Jedi Temple in The Force Awakens (2015) and The Last Jedi (2017). The 618 ancient stone steps are real — no CGI. UNESCO World Heritage since 1996. Only 180 visitors/day. After Star Wars, demand tripled — Ireland earned €35 million in Star Wars tourism. Also a major puffin colony (4,000 breeding pairs).', text_de: '📍 Skellig Michael, County Kerry, Irland.\n\n📊 Diese Klosterinsel wurde Luke Skywalkers Jedi-Tempel in Star Wars VII–VIII. 618 antike Steinstufen, kein CGI. UNESCO-Welterbe. Nur 180 Besucher/Tag. Irland verdiente €35 Mio. durch Star-Wars-Tourismus.', layers: [], image: { wiki: 'Skellig_Michael', caption: 'Skellig Michael, Ireland' } },
                { center: [29.572, 29.631], zoom: 12, title: '🎬 WADI RUM — MARS ON EARTH', title_de: '🎬 WADI RUM — MARS AUF ERDEN', text: '📍 Wadi Rum Protected Area, Jordan.\n\n📊 Wadi Rum has been Mars, alien planets, and ancient Arabia in 20+ films: Lawrence of Arabia (1962), The Martian (2015), Dune (2021), Star Wars IX, Rogue One, Aladdin. UNESCO World Heritage since 2011. Tourism grew 300% since 2015. Bedouin camps now offer "Mars experience" overnight stays. Jordan earns $15+ million/year from film location fees.', text_de: '📍 Wadi Rum Schutzgebiet, Jordanien.\n\n📊 Wadi Rum war Mars, fremde Planeten und antikes Arabien in 20+ Filmen: Lawrence of Arabia, The Martian, Dune, Star Wars. UNESCO-Welterbe. Tourismus stieg 300%. Jordanien verdient $15+ Mio./Jahr an Drehgebühren.', layers: [], image: { wiki: 'Wadi_Rum', caption: 'Wadi Rum desert, Jordan' } },
                { center: [-110.102, 36.983], zoom: 12, title: '🎬 MONUMENT VALLEY — THE AMERICAN WEST', title_de: '🎬 MONUMENT VALLEY — DER AMERIKANISCHE WESTEN', text: '📍 Monument Valley Navajo Tribal Park, Utah/Arizona.\n\n📊 John Ford shot 10 films here starting with Stagecoach (1939) — creating the Western genre. The iconic buttes (up to 300m tall) appeared in Easy Rider, Forrest Gump, Thelma & Louise, 2001: A Space Odyssey. Navajo Nation land — the tribe manages all tourism. 500,000+ visitors/year.', text_de: '📍 Monument Valley Navajo Tribal Park, Utah/Arizona.\n\n📊 John Ford drehte 10 Filme hier. Die ikonischen Felsen erschienen in Forrest Gump, Easy Rider, Thelma & Louise. Verwaltet von der Navajo Nation. 500.000+ Besucher/Jahr.', layers: [], image: { wiki: 'Monument_Valley', caption: 'Monument Valley, Utah' } },
                { center: [139.7005, 35.6596], zoom: 14, title: '🎬 TOKYO — NEON CINEMA CITY', title_de: '🎬 TOKYO — NEON-KINOSTADT', text: '📍 Shibuya Crossing, Tokyo, Japan.\n\n📊 Shibuya is the world\'s busiest crossing — 3,000 people at once. Featured in: Lost in Translation, Fast & Furious: Tokyo Drift, Avengers: Endgame, John Wick 4. Tokyo is the #3 filming city globally. Akira (1988) and Ghost in the Shell (1995) defined cyberpunk aesthetics that influenced The Matrix and Blade Runner 2049. Japan\'s anime industry: $25 billion/year.', text_de: '📍 Shibuya Crossing, Tokyo, Japan.\n\n📊 Meistbegangenste Kreuzung der Welt. Erschienen in: Lost in Translation, Fast & Furious, Avengers, John Wick. Akira und Ghost in the Shell prägten die Cyberpunk-Ästhetik. Anime-Industrie: $25 Mrd./Jahr.', layers: [], image: { wiki: 'Shibuya', caption: 'Shibuya Crossing, Tokyo' } },
                { center: [10, 30], zoom: 2, title: '🎬 THE REEL WORLD — MAPPED', title_de: '🎬 DIE FILMISCHE WELT — KARTIERT', text: '🌍 FROM TATOOINE TO KING\'S LANDING — mapped.\n\n📊 KEY FACTS:\n• Film tourism industry: $48 billion/year\n• Visitor boost after filming: 25–300%\n• NZ from LOTR: +$1.2 billion/year\n• Most filmed city: London (500+ films)\n• Star Wars locations: 12 countries\n• GoT Dubrovnik: +50% visitors\n\n💡 A 2-hour film can transform a village into a global destination overnight. Film tourism is a $48 billion industry — countries compete for productions with billion-dollar tax incentives.', text_de: '🌍 VON TATOOINE BIS KÖNIGSMUND — kartiert.\n\n📊 FAKTEN:\n• Filmtourismus: $48 Milliarden/Jahr\n• Besucherzuwachs: 25–300%\n• Meistgefilmte Stadt: London (500+ Filme)\n\n💡 Ein 2-Stunden-Film kann ein Dorf zum globalen Reiseziel machen.', layers: [] }
            ]
        },
        extremeplaces: {
            name: 'Extreme Places to Live — Humanity at the Limit',
            name_de: 'Extreme Lebensorte — Menschheit am Limit',
            category: 'science',
            steps: [
                { center: [142.773, 63.464], zoom: 10, title: '🥶 OYMYAKON, SIBERIA — COLDEST INHABITED PLACE', title_de: '🥶 OJMJAKON, SIBIRIEN — KÄLTESTER BEWOHNTER ORT', text: '📍 Oymyakon, Sakha Republic, Russia.\n🌡️ RECORD: −67.7°C (February 6, 1933)\n👥 POPULATION: ~500\n\n📊 Oymyakon and nearby Verkhoyansk compete for the title of coldest permanently inhabited place on Earth. At −50°C (normal winter), car engines run 24/7 — turn them off and they won\'t restart. Glasses freeze to faces. Pen ink freezes. Fish freeze solid within 30 seconds of being caught. Locals eat frozen raw horse liver and drink "kumis" (fermented mare\'s milk). The cemetery requires 3 days of bonfire to thaw the ground before burial. Despite this, people have lived here for centuries — Yakut herders adapted to survive in conditions that would kill most humans in hours.', text_de: '📍 Ojmjakon, Republik Sacha, Russland.\n🌡️ REKORD: −67,7°C (6. Februar 1933)\n👥 EINWOHNER: ~500\n\n📊 Kältester permanent bewohnter Ort der Erde. Bei −50°C laufen Automotoren 24/7. Brillen frieren am Gesicht fest. Tinte gefriert. Fische sind 30 Sekunden nach dem Fang tiefgefroren. Für Beerdigungen muss der Boden 3 Tage mit Lagerfeuern aufgetaut werden.', layers: [], image: { wiki: 'Oymyakon', caption: 'Oymyakon in winter, Siberia' } },
                { center: [40.300, 14.240], zoom: 12, title: '🔥 DALLOL, ETHIOPIA — HOTTEST PLACE ON EARTH', title_de: '🔥 DALLOL, ÄTHIOPIEN — HEISSESTER ORT DER ERDE', text: '📍 Dallol, Danakil Depression, Ethiopia.\n🌡️ RECORD: 41.1°C annual average — highest ever recorded for any inhabited location\n👥 POPULATION: ~30 (Afar salt miners)\n\n📊 Dallol sits in the Danakil Depression — 125m below sea level, with active volcanoes, toxic gas vents, and acid pools. Salt miners work in 50°C+ heat, cutting salt blocks by hand and loading them onto camels. A single camel carries 60 kg over 75 km to market. Workers earn $1–2 per day. The landscape looks like another planet — neon yellow sulfur springs, emerald acid lakes, and orange iron oxide formations. Scientists study Dallol as a Mars analog. The nearest road is 75 km away. No electricity, no running water, no phone signal.', text_de: '📍 Dallol, Danakil-Senke, Äthiopien.\n🌡️ REKORD: 41,1°C Jahresdurchschnitt — höchster je gemessener Wert\n👥 EINWOHNER: ~30 (Afar-Salzarbeiter)\n\n📊 Dallol liegt in der Danakil-Senke — 125m unter dem Meeresspiegel, mit aktiven Vulkanen und Säurepools. Salzarbeiter arbeiten bei 50°C+, schneiden Salzblöcke von Hand. Die Landschaft sieht aus wie ein fremder Planet — NASA nutzt Dallol als Mars-Analogon.', layers: [], image: { wiki: 'Dallol_(volcano)', caption: 'Dallol sulfur springs, Ethiopia' } },
                { center: [-69.546, -14.633], zoom: 14, title: '⛏️ LA RINCONADA, PERU — HIGHEST CITY ON EARTH', title_de: '⛏️ LA RINCONADA, PERU — HÖCHSTE STADT DER ERDE', text: '📍 La Rinconada, Puno Region, Peru.\n🏔️ ALTITUDE: 5,100m above sea level\n👥 POPULATION: ~50,000\n\n📊 The world\'s highest permanent settlement sits on a glacier at the base of a gold mine. There is no running water, no sewage system, and no waste collection — the streets are lined with mercury-contaminated mud from gold processing. Workers use the "cachorreo" system — they work 30 days for free, then on the 31st day they can keep whatever ore they find. Oxygen levels are 50% of sea level. Altitude sickness, pneumonia, and mercury poisoning are endemic. Women are banned from entering the mines — believed to bring bad luck. Despite conditions, people flood in because gold = hope.', text_de: '📍 La Rinconada, Region Puno, Peru.\n🏔️ HÖHE: 5.100m über dem Meeresspiegel\n👥 EINWOHNER: ~50.000\n\n📊 Höchste permanente Siedlung der Welt — auf einem Gletscher an einer Goldmine. Kein fließendes Wasser, keine Kanalisation. Arbeiter arbeiten 30 Tage kostenlos — am 31. Tag dürfen sie behalten, was sie finden. Sauerstoffgehalt: 50% des Meeresspiegels.', layers: [], image: { wiki: 'La_Rinconada,_Peru', caption: 'La Rinconada, Peru, 5100m' } },
                { center: [-12.280, -37.112], zoom: 10, title: '🏝️ TRISTAN DA CUNHA — MOST REMOTE INHABITED ISLAND', title_de: '🏝️ TRISTAN DA CUNHA — ENTLEGENSTE BEWOHNTE INSEL', text: '📍 Edinburgh of the Seven Seas, Tristan da Cunha.\n📏 DISTANCE: 2,434 km from nearest land (Saint Helena)\n👥 POPULATION: 245 (2024) — 80 families with only 8 surnames\n\n📊 Tristan da Cunha is the most remote permanently inhabited island on Earth. A mail ship visits 8–9 times per year. There is no airport — arrival requires a 7-day ship journey from Cape Town. The island has no traffic lights, no fast food, and one pub (the Albatross Bar). Everyone works — either in the lobster factory (primary export: $4 million/year) or farming. In 1961, the entire population was evacuated to England after a volcanic eruption — most returned after 2 years, finding England "too crowded." Internet arrived in 2006. The island declared the world\'s largest marine protection zone (687,000 km²) in 2020.', text_de: '📍 Edinburgh of the Seven Seas, Tristan da Cunha.\n📏 ENTFERNUNG: 2.434 km zum nächsten Land\n👥 EINWOHNER: 245 — 80 Familien, nur 8 Nachnamen\n\n📊 Entlegenste bewohnte Insel der Erde. Post kommt 8–9× pro Jahr per Schiff. Kein Flughafen — Anreise: 7 Tage per Schiff ab Kapstadt. 1961 wurde die gesamte Bevölkerung nach England evakuiert — die meisten kehrten zurück, weil England \"zu voll\" war.', layers: [], image: { wiki: 'Tristan_da_Cunha', caption: 'Edinburgh of the Seven Seas' } },
                { center: [134.755, -29.014], zoom: 12, title: '🕳️ COOBER PEDY, AUSTRALIA — UNDERGROUND CITY', title_de: '🕳️ COOBER PEDY, AUSTRALIEN — UNTERIRDISCHE STADT', text: '📍 Coober Pedy, South Australia.\n🌡️ SURFACE TEMPERATURE: Up to 52°C in summer\n👥 POPULATION: ~1,700\n\n📊 Coober Pedy is the "opal capital of the world" — producing 70% of the world\'s gem-quality opals. But it\'s also famous because most residents live underground. The surface is so hot that people carved homes ("dugouts") into the sandstone — maintaining a natural 23–25°C year-round without air conditioning. There are underground churches, hotels, a bookshop, a bar, and a swimming pool. The name "Coober Pedy" comes from the Aboriginal "kupa-piti" — meaning "white man\'s hole." Mad Max: Beyond Thunderdome (1985) was filmed here. The landscape is so Mars-like that it was used in Pitch Black (2000).', text_de: '📍 Coober Pedy, Südaustralien.\n🌡️ OBERFLÄCHENTEMPERATUR: Bis zu 52°C im Sommer\n👥 EINWOHNER: ~1.700\n\n📊 "Opal-Hauptstadt der Welt" — 70% der weltweiten Edelopale. Die meisten Bewohner leben unterirdisch. In den Sandstein gehauene Wohnungen halten natürliche 23–25°C ohne Klimaanlage. Es gibt unterirdische Kirchen, Hotels und ein Schwimmbad.', layers: [], image: { wiki: 'Coober_Pedy', caption: 'Underground home in Coober Pedy' } },
                { center: [-148.683, 60.774], zoom: 14, title: '🏢 WHITTIER, ALASKA — ONE BUILDING TOWN', title_de: '🏢 WHITTIER, ALASKA — EIN-GEBÄUDE-STADT', text: '📍 Begich Towers, Whittier, Alaska, USA.\n👥 POPULATION: ~220 — nearly all live in ONE building\n\n📊 Almost the entire population of Whittier lives in a single 14-story building: Begich Towers, a former Cold War military barracks. The building contains apartments, a post office, a police station, a general store, a laundromat, a medical clinic, and a church. The only road access is through a 4 km one-lane tunnel through a mountain — shared with trains on a schedule. In winter, winds reach 100+ km/h and snowfall exceeds 6 meters. Children walk to school through an underground tunnel. The building was built by the US Army in 1957.', text_de: '📍 Begich Towers, Whittier, Alaska, USA.\n👥 EINWOHNER: ~220 — fast alle leben in EINEM Gebäude\n\n📊 Fast die gesamte Bevölkerung lebt in einem einzigen 14-stöckigen Gebäude: Begich Towers, eine ehemalige Militärkaserne. Darin: Wohnungen, Post, Polizei, Laden, Arztpraxis und Kirche. Einziger Straßenzugang: ein 4-km-Einspurtunnel durch einen Berg.', layers: [], image: { wiki: 'Whittier,_Alaska', caption: 'Begich Towers, Whittier' } },
                { center: [88.195, 69.347], zoom: 10, title: '☠️ NORILSK, RUSSIA — MOST POLLUTED CITY', title_de: '☠️ NORILSK, RUSSLAND — GIFTIGSTE STADT', text: '📍 Norilsk, Krasnoyarsk Krai, Russia.\n🌡️ WINTER: −50°C; 2 months of polar night (no sun at all)\n👥 POPULATION: ~175,000\n\n📊 Norilsk is the northernmost city with 100,000+ people — and one of the most polluted places on Earth. The Norilsk Nickel smelter (world\'s largest) has released so much sulfur dioxide that no trees grow within 30 km. The snow turns black. The rivers run red from nickel contamination. Life expectancy is 10 years below Russia\'s average. The city was built by Gulag prisoners (1935–1953) — an estimated 17,000 died during construction. Norilsk is a "closed city" — foreigners need special permission to visit. Despite all this, workers stay because salaries are 3× the Russian average.', text_de: '📍 Norilsk, Region Krasnojarsk, Russland.\n🌡️ WINTER: −50°C; 2 Monate Polarnacht\n👥 EINWOHNER: ~175.000\n\n📊 Nördlichste Großstadt der Welt — und einer der giftigsten Orte der Erde. Norilsk Nickel hat so viel Schwefeldioxid freigesetzt, dass im Umkreis von 30 km keine Bäume wachsen. Der Schnee ist schwarz. Die Flüsse rot. Lebenserwartung 10 Jahre unter Russlands Durchschnitt. Erbaut von Gulag-Gefangenen — 17.000 starben beim Bau.', layers: [], image: { wiki: 'Norilsk', caption: 'Norilsk industrial landscape' } },
                { center: [20, 30], zoom: 2, title: '🌍 EXTREME LIVING — THE HUMAN SPIRIT', title_de: '🌍 EXTREMES LEBEN — DER MENSCHLICHE GEIST', text: '🌍 FROM −67°C TO +52°C — mapped.\n\n📊 KEY FACTS:\n• Coldest inhabited: Oymyakon (−67.7°C)\n• Hottest inhabited: Dallol (41.1°C average)\n• Highest city: La Rinconada (5,100m)\n• Most remote island: Tristan da Cunha (2,434 km)\n• Most polluted city: Norilsk (no trees in 30 km)\n• Smallest "town": Whittier (220 people, 1 building)\n• Deepest inhabited: Coober Pedy (underground)\n\n💡 These places prove that humans will live anywhere — from frozen tundra to toxic wastelands to underground caves. The question isn\'t where we can survive. It\'s what we\'re willing to endure for gold, warmth, isolation, or simply the stubbornness of calling a place home.', text_de: '🌍 VON −67°C BIS +52°C — kartiert.\n\n📊 FAKTEN:\n• Kältester Ort: Ojmjakon (−67,7°C)\n• Heißester Ort: Dallol (41,1°C Schnitt)\n• Höchste Stadt: La Rinconada (5.100m)\n• Entlegenste Insel: Tristan da Cunha (2.434 km)\n\n💡 Menschen leben überall — von der Tundra bis in giftige Industrieruinen. Die Frage ist nicht, wo wir überleben können, sondern was wir dafür in Kauf nehmen.', layers: [] }
            ]
        },
        revolutions: {
            name: 'Revolutions — When the People Rose Up',
            name_de: 'Revolutionen — Als das Volk sich erhob',
            category: 'history',
            steps: [
                { center: [2.3694, 48.8566], zoom: 14, title: '🇫🇷 PARIS 1789 — THE FRENCH REVOLUTION', title_de: '🇫🇷 PARIS 1789 — DIE FRANZÖSISCHE REVOLUTION', text: '📍 Place de la Bastille, Paris.\n\n📊 On July 14, 1789, a mob stormed the Bastille fortress. The revolution abolished the monarchy, declared the Rights of Man, and executed Louis XVI by guillotine. The Reign of Terror killed ~40,000. Napoleon seized power in 1799, spreading revolutionary ideals across Europe by force. July 14 remains France\'s national day.', text_de: '📍 Place de la Bastille, Paris.\n\n📊 Am 14. Juli 1789 stürmte ein Mob die Bastille. Die Revolution schaffte die Monarchie ab und guillotinierte Ludwig XVI. Die Schreckensherrschaft tötete ~40.000. Napoleon verbreitete die Ideale in ganz Europa.', layers: [], image: { wiki: 'French_Revolution', caption: 'Storming of the Bastille, 1789' } },
                { center: [30.3351, 59.9343], zoom: 14, title: '🇷🇺 ST. PETERSBURG 1917 — THE RUSSIAN REVOLUTION', title_de: '🇷🇺 ST. PETERSBURG 1917 — DIE RUSSISCHE REVOLUTION', text: '📍 Winter Palace, Saint Petersburg.\n\n📊 On October 25, 1917, Bolsheviks stormed the Winter Palace and created the world\'s first communist state. Tsar Nicholas II was executed with his family in 1918. The Civil War (1917–22) killed 7–12 million. The USSR became a nuclear superpower controlling half of Europe until 1991.', text_de: '📍 Winterpalast, Sankt Petersburg.\n\n📊 Am 25. Oktober 1917 stürmten Bolschewiki den Winterpalast. Zar Nikolaus II. wurde 1918 hingerichtet. Der Bürgerkrieg tötete 7–12 Millionen. Die UdSSR kontrollierte die Hälfte Europas bis 1991.', layers: [], image: { wiki: 'Russian_Revolution', caption: 'Storming the Winter Palace, 1917' } },
                { center: [-82.3666, 23.1136], zoom: 12, title: '🇨🇺 HAVANA 1959 — THE CUBAN REVOLUTION', title_de: '🇨🇺 HAVANNA 1959 — DIE KUBANISCHE REVOLUTION', text: '📍 Havana, Cuba.\n\n📊 On January 1, 1959, Castro\'s guerrillas overthrew Batista. The revolution triggered the Bay of Pigs (1961), the Cuban Missile Crisis (1962) — humanity\'s closest brush with nuclear war — and a US embargo lasting 60+ years. Castro ruled until 2008.', text_de: '📍 Havanna, Kuba.\n\n📊 Am 1. Januar 1959 stürzte Castro Batista. Die Revolution löste die Kubakrise 1962 aus — der nächste Punkt eines Atomkriegs. US-Embargo seit 60+ Jahren.', layers: [], image: { wiki: 'Cuban_Revolution', caption: 'Castro entering Havana, 1959' } },
                { center: [51.3890, 35.6892], zoom: 12, title: '🇮🇷 TEHRAN 1979 — THE ISLAMIC REVOLUTION', title_de: '🇮🇷 TEHERAN 1979 — DIE ISLAMISCHE REVOLUTION', text: '📍 Azadi Tower, Tehran, Iran.\n\n📊 Ayatollah Khomeini overthrew the US-backed Shah, creating the world\'s first Islamic republic. The US embassy hostage crisis (444 days) shattered relations permanently. The Iran-Iraq War (1980–88) killed 1 million. Iran\'s Revolutionary Guard now controls vast military and economic power.', text_de: '📍 Azadi-Turm, Teheran, Iran.\n\n📊 Khomeini stürzte den US-gestützten Schah und schuf die erste Islamische Republik. Die US-Geiselkrise (444 Tage) zerstörte die Beziehungen. Der Iran-Irak-Krieg tötete 1 Million.', layers: [], image: { wiki: 'Iranian_Revolution', caption: 'Protests in Tehran, 1979' } },
                { center: [13.3777, 52.5163], zoom: 14, title: '🇩🇪 BERLIN 1989 — THE FALL OF THE WALL', title_de: '🇩🇪 BERLIN 1989 — DER MAUERFALL', text: '📍 Brandenburg Gate, Berlin.\n\n📊 On November 9, 1989, the Wall opened after 28 years. 140+ people died trying to cross. The fall triggered communist collapse across Eastern Europe. Germany reunified October 3, 1990. The USSR dissolved December 26, 1991. The most consequential peaceful revolution in modern history.', text_de: '📍 Brandenburger Tor, Berlin.\n\n📊 Am 9. November 1989 fiel die Mauer nach 28 Jahren. 140+ Menschen starben bei Fluchtversuchen. Der Mauerfall löste den Zusammenbruch des Kommunismus in Osteuropa aus. Die folgenreichste friedliche Revolution der Neuzeit.', layers: [], image: { wiki: 'Fall_of_the_Berlin_Wall', caption: 'Berliners on the Wall, 1989' } },
                { center: [10.1658, 36.8065], zoom: 12, title: '🇹🇳 TUNIS 2010 — THE ARAB SPRING', title_de: '🇹🇳 TUNIS 2010 — DER ARABISCHE FRÜHLING', text: '📍 Avenue Habib Bourguiba, Tunis.\n\n📊 Mohamed Bouazizi set himself on fire on December 17, 2010. His act — spread on social media — toppled Ben Ali in 28 days. The "Arab Spring" spread to Egypt, Libya, Syria, Yemen. Only Tunisia achieved lasting democracy. Syria descended into civil war (500,000+ dead).', text_de: '📍 Avenue Habib Bourguiba, Tunis.\n\n📊 Mohamed Bouazizi zündete sich am 17. Dezember 2010 an. Sein Akt stürzte Ben Ali in 28 Tagen. Der Arabische Frühling erreichte Ägypten, Libyen, Syrien. Nur Tunesien erreichte Demokratie. Syrien: 500.000+ Tote.', layers: [], image: { wiki: 'Arab_Spring', caption: 'Protests in Tunis, 2011' } },
                { center: [30.5234, 50.4501], zoom: 14, title: '🇺🇦 KYIV 2014 — EUROMAIDAN', title_de: '🇺🇦 KIEW 2014 — EUROMAIDAN', text: '📍 Maidan Nezalezhnosti, Kyiv, Ukraine.\n\n📊 President Yanukovych rejected the EU under Russian pressure. Hundreds of thousands occupied Maidan for 3 months. Snipers killed 108 protesters. Yanukovych fled. Russia annexed Crimea and launched the 2022 full-scale invasion — the largest war in Europe since 1945.', text_de: '📍 Maidan Nesaleschnosti, Kiew, Ukraine.\n\n📊 Janukowytsch lehnte die EU unter russischem Druck ab. Scharfschützen töteten 108 Demonstranten. Russland annektierte die Krim und begann 2022 den größten Krieg in Europa seit 1945.', layers: [], image: { wiki: 'Euromaidan', caption: 'Euromaidan protests, 2014' } },
                { center: [20, 30], zoom: 2, title: '✊ REVOLUTIONS — THE PATTERN', title_de: '✊ REVOLUTIONEN — DAS MUSTER', text: '🌍 FROM THE BASTILLE TO THE MAIDAN — mapped.\n\n📊 DEATH TOLLS:\n• French Revolution: ~40,000\n• Russian Revolution: 7–12 million\n• Cuban → Missile Crisis: near nuclear war\n• Berlin Wall: 28 years, 140+ deaths\n• Arab Spring: 4 dictators toppled, 1 democracy\n• Euromaidan → full-scale war (2022–)\n\n💡 Every revolution follows a pattern: injustice → spark → mass mobilization → regime falls → power vacuum. The question is always what comes after. France got Napoleon. Russia got Stalin. Tunisia got democracy. Syria got war. Toppling a regime is the easy part.', text_de: '🌍 VON DER BASTILLE BIS ZUM MAIDAN — kartiert.\n\n📊 OPFERZAHLEN:\n• Französische Revolution: ~40.000\n• Russische Revolution: 7–12 Millionen\n• Berliner Mauer: 28 Jahre, 140+ Tote\n• Arabischer Frühling: 4 Diktatoren, 1 Demokratie\n\n💡 Jede Revolution folgt einem Muster. Ein Regime zu stürzen ist der einfache Teil. Was danach kommt, ist die wahre Revolution.', layers: [] }
            ]
        },
        pandemics: {
            name: 'Pandemics — Plagues That Shaped Civilization',
            name_de: 'Pandemien — Seuchen, die die Zivilisation formten',
            category: 'science',
            steps: [
                { center: [28.9784, 41.0082], zoom: 12, title: '💀 CONSTANTINOPLE 541 — PLAGUE OF JUSTINIAN', title_de: '💀 KONSTANTINOPEL 541 — JUSTINIANISCHE PEST', text: '📍 Constantinople (modern Istanbul), Byzantine Empire.\n\n📊 In 541 AD, the first recorded bubonic plague pandemic arrived in Constantinople via grain ships from Egypt. At its peak, 5,000–10,000 people died per day. Emperor Justinian himself was infected but survived. Total death toll: 25–50 million (25–50% of the world population). The plague destroyed Justinian\'s dream of reuniting the Roman Empire and contributed to the end of antiquity. The bacterium Yersinia pestis was carried by fleas on rats. The pandemic recurred in waves for 200 years.', text_de: '📍 Konstantinopel (heute Istanbul), Byzantinisches Reich.\n\n📊 541 n. Chr. erreichte die erste dokumentierte Pest-Pandemie Konstantinopel über Getreideschiffe aus Ägypten. Auf dem Höhepunkt starben 5.000–10.000 Menschen pro Tag. Kaiser Justinian infizierte sich, überlebte aber. 25–50 Millionen Tote (25–50% der Weltbevölkerung).', layers: [], image: { wiki: 'Plague_of_Justinian', caption: 'Constantinople, 6th century' } },
                { center: [9.19, 45.46], zoom: 10, title: '💀 MILAN/EUROPE 1347 — THE BLACK DEATH', title_de: '💀 MAILAND/EUROPA 1347 — DER SCHWARZE TOD', text: '📍 Northern Italy — epicenter of European spread.\n\n📊 The Black Death (1347–1353) killed 75–200 million people — roughly 30–60% of Europe\'s population. It arrived via Genoese trading ships from the Crimea. Symptoms: buboes (swollen lymph nodes), fever, necrosis — death within 3–5 days. Entire villages were wiped out. The labor shortage that followed ended feudalism, raised wages, and empowered peasants. Flagellant movements and Jewish pogroms swept Europe. The plague returned in waves for 400 years. It remains the deadliest pandemic in human history by percentage of population killed.', text_de: '📍 Norditalien — Epizentrum der europäischen Ausbreitung.\n\n📊 Der Schwarze Tod (1347–1353) tötete 75–200 Millionen Menschen — 30–60% der europäischen Bevölkerung. Symptome: Beulen, Fieber, Nekrose — Tod innerhalb von 3–5 Tagen. Der Arbeitskräftemangel danach beendete die Leibeigenschaft. Die tödlichste Pandemie der Menschheitsgeschichte.', layers: [], image: { wiki: 'Black_Death', caption: 'The Triumph of Death, Pieter Bruegel' } },
                { center: [-99.1332, 19.4326], zoom: 10, title: '💀 TENOCHTITLÁN 1520 — SMALLPOX IN THE NEW WORLD', title_de: '💀 TENOCHTITLÁN 1520 — POCKEN IN DER NEUEN WELT', text: '📍 Tenochtitlán (modern Mexico City).\n\n📊 When Hernán Cortés arrived in 1519, Tenochtitlán had 200,000+ inhabitants — larger than any European city. Spanish soldiers brought smallpox, which spread catastrophically through populations with zero immunity. Within a century, 90% of the indigenous population of the Americas died — an estimated 56 million people. This was the largest demographic collapse in human history. Smallpox killed the Aztec emperor Cuitláhuac after just 80 days of rule. The population of central Mexico fell from 25 million (1519) to 1 million (1620). Smallpox was eventually eradicated in 1980 — the only human disease ever eliminated.', text_de: '📍 Tenochtitlán (heute Mexiko-Stadt).\n\n📊 Spanische Soldaten brachten Pocken — innerhalb eines Jahrhunderts starben 90% der indigenen Bevölkerung der Amerikas (~56 Millionen). Der größte demographische Zusammenbruch der Geschichte. Die Pocken wurden 1980 ausgerottet — die einzige je eliminierte Krankheit.', layers: [], image: { wiki: 'Smallpox', caption: 'Aztec smallpox victims, Florentine Codex' } },
                { center: [-0.1276, 51.5074], zoom: 12, title: '💀 LONDON 1665 — THE GREAT PLAGUE', title_de: '💀 LONDON 1665 — DIE GROSSE PEST', text: '📍 City of London, England.\n\n📊 The Great Plague of London (1665–66) killed 100,000 people — 25% of London\'s population. Bodies were collected in death carts at night ("Bring out your dead!"). Mass graves called "plague pits" were dug across the city. The wealthy fled; the poor were locked in their homes with a red cross on the door. Samuel Pepys documented the horror in his famous diary. The plague ended abruptly — possibly helped by the Great Fire of London (1666), which destroyed the dense, rat-infested medieval city. London was rebuilt in brick and stone, creating the modern city.', text_de: '📍 City of London, England.\n\n📊 Die Große Pest von London (1665–66) tötete 100.000 Menschen — 25% der Bevölkerung. Leichen wurden nachts mit Karren eingesammelt. Die Reichen flohen, die Armen wurden in ihren Häusern eingeschlossen. Das Große Feuer von 1666 beendete möglicherweise die Pest, indem es die rattenverseuchte Stadt zerstörte.', layers: [], image: { wiki: 'Great_Plague_of_London', caption: 'London plague pit, 1665' } },
                { center: [-97.7431, 38.5], zoom: 5, title: '💀 WORLDWIDE 1918 — SPANISH FLU', title_de: '💀 WELTWEIT 1918 — SPANISCHE GRIPPE', text: '📍 Camp Funston, Fort Riley, Kansas, USA — likely origin.\n\n📊 The 1918 influenza pandemic (H1N1) infected 500 million people — one-third of the world\'s population. Death toll: 50–100 million (3–5% of global population). It killed more people than World War I. Unlike normal flu, it disproportionately killed healthy adults aged 20–40 through cytokine storms. The virus spread globally via WWI troop movements. Cities that imposed early lockdowns (St. Louis) had 50% lower death rates than those that didn\'t (Philadelphia). The pandemic ended by 1920 as survivors gained immunity. It was called "Spanish Flu" only because Spain, being neutral in WWI, freely reported cases.', text_de: '📍 Camp Funston, Fort Riley, Kansas, USA — vermutlicher Ursprung.\n\n📊 Die Spanische Grippe (1918, H1N1) infizierte 500 Millionen Menschen. 50–100 Millionen Tote — mehr als der Erste Weltkrieg. Sie tötete besonders gesunde 20–40-Jährige. Städte mit frühen Lockdowns hatten 50% weniger Tote. "Spanische Grippe" nur, weil Spanien als neutrales Land frei berichtete.', layers: [], image: { wiki: 'Spanish_flu', caption: 'Emergency hospital, Camp Funston, 1918' } },
                { center: [29.3639, -2.0469], zoom: 8, title: '💀 CENTRAL AFRICA — HIV/AIDS', title_de: '💀 ZENTRALAFRIKA — HIV/AIDS', text: '📍 Kinshasa, Democratic Republic of Congo — likely origin.\n\n📊 HIV/AIDS has killed 40+ million people since the 1980s. The virus crossed from chimpanzees to humans around 1920 in Kinshasa. It remained undetected for decades before exploding globally. By 2024: 39 million people living with HIV, 630,000 annual deaths. Sub-Saharan Africa bears 70% of the global burden. The US lost 330,000 to AIDS before effective treatment (ART) arrived in 1996. ART now allows near-normal lifespans but costs $20,000+/year without subsidies. No vaccine exists despite 40 years of research. The pandemic exposed catastrophic stigma, homophobia, and healthcare inequality.', text_de: '📍 Kinshasa, DR Kongo — vermutlicher Ursprung.\n\n📊 HIV/AIDS hat 40+ Millionen Menschen getötet. Das Virus sprang um 1920 in Kinshasa von Schimpansen auf Menschen über. 39 Millionen leben mit HIV. Subsahara-Afrika trägt 70% der globalen Last. Antiretrovirale Therapie ermöglicht heute fast normale Lebenserwartung. Keine Impfung trotz 40 Jahren Forschung.', layers: [], image: { wiki: 'HIV/AIDS', caption: 'AIDS memorial quilt, Washington DC' } },
                { center: [114.2599, 30.5928], zoom: 12, title: '💀 WUHAN 2019 — COVID-19', title_de: '💀 WUHAN 2019 — COVID-19', text: '📍 Huanan Seafood Market, Wuhan, Hubei, China.\n\n📊 In December 2019, a novel coronavirus (SARS-CoV-2) emerged in Wuhan. By March 2020, it was a global pandemic. Official death toll: 7+ million (WHO estimate: 15–20 million excess deaths). The virus triggered the largest global lockdown in history — 4.4 billion people confined. Economic damage: $12+ trillion. Vaccines developed in record time (11 months vs. typical 10+ years). mRNA technology (Pfizer/BioNTech, Moderna) represented a medical revolution. 13+ billion doses administered globally. The pandemic exposed healthcare inequality, accelerated remote work, and permanently changed how the world functions.', text_de: '📍 Huanan Seafood Market, Wuhan, Hubei, China.\n\n📊 Im Dezember 2019 tauchte SARS-CoV-2 in Wuhan auf. 7+ Millionen offizielle Tote (WHO: 15–20 Mio.). Größter globaler Lockdown: 4,4 Milliarden Menschen eingesperrt. Wirtschaftsschaden: $12+ Billionen. Impfstoffe in Rekordzeit (11 Monate). 13+ Milliarden Dosen verabreicht.', layers: [], image: { wiki: 'COVID-19_pandemic', caption: 'Wuhan lockdown, January 2020' } },
                { center: [20, 30], zoom: 2, title: '💀 PANDEMICS — THE INVISIBLE ENEMY', title_de: '💀 PANDEMIEN — DER UNSICHTBARE FEIND', text: '🌍 FROM THE PLAGUE TO COVID — mapped.\n\n📊 DEATH TOLLS:\n• Plague of Justinian (541): 25–50 million\n• Black Death (1347): 75–200 million\n• Smallpox in Americas (1520): 56 million\n• Great Plague of London (1665): 100,000\n• Spanish Flu (1918): 50–100 million\n• HIV/AIDS (1981–): 40+ million\n• COVID-19 (2019–): 15–20 million\n\n💡 Pandemics have killed more humans than all wars combined. They topple empires, reshape economies, and accelerate scientific breakthroughs. The pattern repeats: emergence → denial → panic → adaptation → recovery. Each pandemic teaches us the same lesson — and each time, we forget.', text_de: '🌍 VON DER PEST BIS COVID — kartiert.\n\n📊 OPFERZAHLEN:\n• Justinianische Pest: 25–50 Millionen\n• Schwarzer Tod: 75–200 Millionen\n• Pocken in Amerika: 56 Millionen\n• Spanische Grippe: 50–100 Millionen\n• HIV/AIDS: 40+ Millionen\n• COVID-19: 15–20 Millionen\n\n💡 Pandemien haben mehr Menschen getötet als alle Kriege zusammen. Das Muster wiederholt sich: Entstehung → Leugnung → Panik → Anpassung → Erholung.', layers: [] }
            ]
        },
        hondius: {
            name: 'MV Hondius — Andes Hantavirus Outbreak 2026',
            name_de: 'MV Hondius — Andes-Hantavirus-Ausbruch 2026',
            category: 'science',
            steps: [
                { center: [-68.30, -54.81], zoom: 10, title: '🚢 USHUAIA — DEPARTURE (April 1, 2026)', title_de: '🚢 USHUAIA — ABFAHRT (1. April 2026)', text: '📍 Port of Ushuaia, Tierra del Fuego, Argentina — the southernmost city on Earth.\n\n📊 On April 1, 2026, the Dutch-flagged expedition cruise ship MV Hondius (Oceanwide Expeditions) departed Ushuaia for a 40-day transatlantic voyage to Tenerife. Aboard: 88 passengers and 59 crew — 147 people from 23 countries.\n\n🚢 THE SHIP: Built 2019, 107.6m long, ice class 6, capacity 170 passengers. Specializes in polar expedition cruises to Antarctica, the Arctic, and remote Atlantic islands.\n\n🦠 THE PATHOGEN: Andes virus (Orthohantavirus andesense) — a hantavirus endemic to Patagonian long-tailed pygmy rice mice (Oligoryzomys longicaudatus). Case fatality rate: 30–40%. Incubation period: 7–39 days. It is the only hantavirus with confirmed human-to-human transmission. The virus was likely contracted during a shore excursion in southern Patagonia before or during embarkation.\n\n⚠️ At this point, no one aboard knows the virus is present. The incubation clock is ticking.', text_de: '📍 Hafen von Ushuaia, Feuerland, Argentinien — die südlichste Stadt der Welt.\n\n📊 Am 1. April 2026 verließ das niederländische Expeditionsschiff MV Hondius (Oceanwide Expeditions) Ushuaia für eine 40-tägige Transatlantikreise nach Teneriffa. An Bord: 88 Passagiere und 59 Crew — 147 Personen aus 23 Ländern.\n\n🚢 DAS SCHIFF: Baujahr 2019, 107,6m lang, Eisklasse 6. Spezialisiert auf Polarexpeditionen.\n\n🦠 DER ERREGER: Andes-Virus (Orthohantavirus andesense) — ein Hantavirus, endemisch bei patagonischen Langschwanz-Zwergbeutelratten. Sterblichkeitsrate: 30–40%. Inkubationszeit: 7–39 Tage. Das einzige Hantavirus mit bestätigter Mensch-zu-Mensch-Übertragung.', layers: [], image: { wiki: 'Ushuaia', caption: 'Port of Ushuaia, Argentina — departure point' } },
                { center: [-62.00, -64.50], zoom: 6, title: '🧊 ANTARCTIC PENINSULA — THE EXPEDITION', title_de: '🧊 ANTARKTISCHE HALBINSEL — DIE EXPEDITION', text: '📍 Antarctic Peninsula — Drake Passage crossing and Antarctic landings.\n\n📊 After crossing the notorious Drake Passage (800 km of the roughest seas on Earth), the MV Hondius conducted expedition landings along the Antarctic Peninsula. Passengers explored penguin colonies, glaciers, and research stations via Zodiac boats.\n\n🌡️ CONDITIONS: Air temperatures -5°C to +2°C. Wind chill down to -20°C. Passengers were in close quarters during Zodiac landings and shared common areas aboard.\n\n🔬 EPIDEMIOLOGICAL SIGNIFICANCE: The confined shipboard environment — shared dining, narrow corridors, communal lounges — created ideal conditions for person-to-person transmission of the Andes virus via respiratory droplets. The close-contact nature of expedition cruises amplifies transmission risk compared to larger cruise vessels.\n\n📊 At this stage, the virus may already be spreading silently. Andes hantavirus symptoms mimic altitude sickness or flu — fever, myalgia, headache — making early detection extremely difficult at sea.', text_de: '📍 Antarktische Halbinsel — Drake-Passage-Überquerung und Antarktis-Landungen.\n\n📊 Nach der Überquerung der Drake-Passage führte die MV Hondius Expeditionslandungen entlang der Antarktischen Halbinsel durch. Passagiere erkundeten Pinguinkolonien und Gletscher.\n\n🔬 EPIDEMIOLOGISCHE BEDEUTUNG: Die beengte Schiffsumgebung — gemeinsames Essen, enge Gänge — schuf ideale Bedingungen für die Mensch-zu-Mensch-Übertragung des Andes-Virus über Tröpfcheninfektion.\n\n📊 In diesem Stadium breitet sich das Virus möglicherweise bereits unbemerkt aus. Die Symptome ähneln einer Grippe — Fieber, Muskelschmerzen, Kopfschmerzen.', layers: [], image: { wiki: 'Antarctic_Peninsula', caption: 'Antarctic Peninsula expedition landing' } },
                { center: [-36.51, -54.27], zoom: 8, title: '🏔️ SOUTH GEORGIA — SHACKLETON\'S ISLAND', title_de: '🏔️ SÜDGEORGIEN — SHACKLETONS INSEL', text: '📍 South Georgia Island — British Overseas Territory, South Atlantic.\n\n📊 The MV Hondius visited South Georgia, one of the most wildlife-rich islands on Earth. Home to 450,000+ king penguins, millions of fur seals, and the grave of Sir Ernest Shackleton at Grytviken.\n\n🌍 GEOGRAPHY: 170 km long, covered by glaciers and mountains up to 2,934m (Mount Paget). The island has no permanent population — only researchers at the British Antarctic Survey station.\n\n🦠 VIRUS TIMELINE: By this point in the voyage (mid-April), the first infected passengers may be entering the prodromal phase — the early stage before severe symptoms appear. The incubation period of 7–39 days means the virus timeline is staggered across multiple individuals.\n\n📊 South Georgia is 1,390 km from the Falkland Islands and 2,150 km from the nearest hospital. Any medical emergency at sea requires helicopter evacuation or days of sailing — a critical vulnerability for disease outbreaks on expedition ships.', text_de: '📍 Südgeorgien — Britisches Überseegebiet, Südatlantik.\n\n📊 Die MV Hondius besuchte Südgeorgien — Heimat von 450.000+ Königspinguinen und dem Grab von Sir Ernest Shackleton in Grytviken.\n\n🦠 VIRUS-ZEITLINIE: Zu diesem Zeitpunkt könnten die ersten Infizierten die Prodromalphase erreichen — das Frühstadium vor schweren Symptomen. Die Inkubationszeit von 7–39 Tagen verteilt den Krankheitsverlauf über mehrere Personen.\n\n📊 Südgeorgien liegt 2.150 km vom nächsten Krankenhaus entfernt — ein kritischer Schwachpunkt bei Krankheitsausbrüchen auf Expeditionsschiffen.', layers: [], image: { wiki: 'South_Georgia', caption: 'King penguins at Salisbury Plain, South Georgia' } },
                { center: [-12.28, -37.11], zoom: 8, title: '🏝️ TRISTAN DA CUNHA — THE MOST REMOTE ISLAND', title_de: '🏝️ TRISTAN DA CUNHA — DIE ENTLEGENSTE INSEL', text: '📍 Tristan da Cunha — the world\'s most remote inhabited island, South Atlantic.\n\n📊 The MV Hondius called at Tristan da Cunha, population 245 — located 2,434 km from the nearest land (Saint Helena). The island has no airport; visitors arrive by ship only.\n\n🔒 BIOSECURITY CONCERN: Tristan da Cunha has an extremely vulnerable population. With only 245 residents sharing 8 surnames and no hospital (only a single doctor), any infectious disease introduction could be devastating. The island has no ICU capability and emergency evacuation requires days of sailing.\n\n🦠 STATUS: At this stage of the voyage, the ship\'s medical team had not yet identified any unusual illness cluster. Standard expedition health protocols were in place, but Andes hantavirus was not on any screening checklist — it had never before been documented outside South America.\n\n📊 The island declared the world\'s largest marine protection zone (687,000 km²) in 2020.', text_de: '📍 Tristan da Cunha — die entlegenste bewohnte Insel der Welt, Südatlantik.\n\n📊 Die MV Hondius legte an Tristan da Cunha an (245 Einwohner, 2.434 km vom nächsten Land entfernt).\n\n🔒 BIOSICHERHEIT: Tristan da Cunha hat eine extrem verletzliche Bevölkerung. Mit nur 245 Einwohnern, einem einzigen Arzt und keiner Intensivstation könnte jede Infektionskrankheit verheerend wirken.\n\n🦠 STATUS: Zu diesem Zeitpunkt hatte das medizinische Team an Bord noch kein ungewöhnliches Krankheitscluster identifiziert. Das Andes-Hantavirus war nie zuvor außerhalb Südamerikas dokumentiert worden.', layers: [], image: { wiki: 'Tristan_da_Cunha', caption: 'Edinburgh of the Seven Seas, Tristan da Cunha' } },
                { center: [-5.72, -15.97], zoom: 9, title: '🏝️ SAINT HELENA — NAPOLEON\'S EXILE', title_de: '🏝️ ST. HELENA — NAPOLEONS EXIL', text: '📍 Saint Helena — British Overseas Territory, South Atlantic. Famous as Napoleon Bonaparte\'s place of exile (1815–1821).\n\n📊 The MV Hondius visited Saint Helena, population ~4,500. The island received an airport in 2017 (notoriously difficult to land at due to wind shear), but the ship arrived by sea.\n\n🏥 MEDICAL FACILITIES: Saint Helena has a small general hospital with basic capabilities. Like Tristan da Cunha, the island is highly vulnerable to infectious disease outbreaks due to limited healthcare infrastructure and geographic isolation.\n\n🦠 VIRUS TIMELINE: Late April. The first symptomatic cases may now be presenting with what appears to be flu-like illness. On an expedition cruise with a small medical facility (typically one doctor, one nurse), differentiating between common respiratory illness and a rare hemorrhagic fever virus is nearly impossible without laboratory testing.\n\n📊 Historical note: Napoleon died on Saint Helena on May 5, 1821. Recent studies suggest arsenic poisoning from the wallpaper in his residence at Longwood House.', text_de: '📍 St. Helena — Britisches Überseegebiet, Südatlantik. Berühmt als Napoleons Verbannungsort (1815–1821).\n\n📊 Die MV Hondius besuchte St. Helena (~4.500 Einwohner).\n\n🦠 VIRUS-ZEITLINIE: Ende April. Die ersten symptomatischen Fälle könnten nun grippeähnliche Symptome zeigen. Auf einem Expeditionsschiff mit begrenzter medizinischer Ausstattung ist die Unterscheidung zwischen gewöhnlichen Atemwegserkrankungen und einem seltenen hämorrhagischen Fiebervirus nahezu unmöglich ohne Labortests.', layers: [], image: { wiki: 'Saint_Helena', caption: 'Jamestown, Saint Helena' } },
                { center: [-14.37, -7.95], zoom: 9, title: '🏝️ ASCENSION ISLAND — MID-ATLANTIC OUTPOST', title_de: '🏝️ ASCENSION ISLAND — POSTEN IM MITTELATLANTIK', text: '📍 Ascension Island — British Overseas Territory, mid-Atlantic. A volcanic island with RAF and US military presence.\n\n📊 The MV Hondius called at Ascension Island, population ~800 (mostly military and government staff). The island hosts a critical RAF/USAF air base (Wideawake Airfield) used during the Falklands War (1982).\n\n🦠 OUTBREAK DETECTION: In late April/early May, the ship\'s medical team began to identify a pattern — multiple passengers presenting with severe respiratory distress, fever, and rapidly declining oxygen levels. This was no ordinary flu.\n\n⚠️ CRITICAL MOMENT: The ship\'s doctor contacted Oceanwide Expeditions headquarters in the Netherlands, who alerted WHO and ECDC. Blood samples were arranged for testing. On May 2, 2026, WHO was officially notified of a suspected hantavirus cluster aboard the MV Hondius.\n\n📊 Ascension Island is home to the world\'s largest green turtle nesting colony (up to 20,000 nests/year) and is a critical node in the global submarine cable network.', text_de: '📍 Ascension Island — Britisches Überseegebiet, Mittelatlantik. Vulkaninsel mit RAF- und US-Militärpräsenz.\n\n🦠 AUSBRUCH ERKANNT: Ende April/Anfang Mai identifizierte das medizinische Team ein Muster — mehrere Passagiere mit schwerer Atemnot, Fieber und rapide sinkenden Sauerstoffwerten.\n\n⚠️ KRITISCHER MOMENT: Am 2. Mai 2026 wurde die WHO offiziell über einen vermuteten Hantavirus-Cluster an Bord informiert. Blutproben wurden für Tests arrangiert.\n\n📊 Ascension Island beherbergt die weltweit größte Brutkolonie der Grünen Meeresschildkröte (bis zu 20.000 Nester/Jahr).', layers: [], image: { wiki: 'Ascension_Island', caption: 'Georgetown, Ascension Island' } },
                { center: [-22.93, 16.00], zoom: 7, title: '⚓ CAPE VERDE — EMERGENCY ANCHORAGE', title_de: '⚓ KAP VERDE — NOTANKERUNG', text: '📍 Cape Verde (Cabo Verde) — island nation off the west coast of Africa.\n\n📊 The MV Hondius passed through or anchored near Cape Verde as the outbreak situation escalated. By this point:\n\n☠️ CASUALTIES: The first deaths occurred at sea — a Dutch couple who had been among the earliest symptomatic cases. A German national also died.\n\n🏥 MEDICAL CRISIS: The ship\'s small medical facility was overwhelmed. Hantavirus Cardiopulmonary Syndrome (HCPS) causes rapid fluid accumulation in the lungs — patients essentially drown internally. Without ICU-level care (mechanical ventilation, ECMO), the mortality rate is extremely high.\n\n📡 COORDINATION: An international response was now underway. Spain\'s health ministry was coordinating with WHO, ECDC, and multiple national health agencies to prepare for the ship\'s arrival in Tenerife. Military transport aircraft were being mobilized for repatriation.\n\n📊 FINAL TOLL AT SEA: 9 cases total (7 laboratory-confirmed Andes virus, 2 probable). 3 deaths. Case fatality rate on board: 33% — consistent with known Andes virus lethality.', text_de: '📍 Kap Verde (Cabo Verde) — Inselstaat vor der Westküste Afrikas.\n\n📊 Die MV Hondius passierte Kap Verde, während sich die Ausbruchssituation verschärfte.\n\n☠️ OPFER: Die ersten Todesfälle ereigneten sich auf See — ein niederländisches Ehepaar und ein deutscher Staatsangehöriger.\n\n🏥 MEDIZINISCHE KRISE: Hantavirus-Kardiopulmonales Syndrom (HCPS) verursacht schnelle Flüssigkeitsansammlung in der Lunge — Patienten ertrinken innerlich. Ohne Intensivmedizin (Beatmung, ECMO) ist die Sterblichkeit extrem hoch.\n\n📊 BILANZ AUF SEE: 9 Fälle (7 laborbestätigt, 2 Verdachtsfälle). 3 Tote. Sterblichkeitsrate: 33%.', layers: [], image: { wiki: 'Cape_Verde', caption: 'Cape Verde Islands, Atlantic Ocean' } },
                { center: [-16.53, 28.05], zoom: 10, title: '🏥 TENERIFE — DISEMBARKATION & REPATRIATION (May 10, 2026)', title_de: '🏥 TENERIFFA — AUSSCHIFFUNG & RÜCKFÜHRUNG (10. Mai 2026)', text: '📍 Port of Granadilla, Tenerife, Canary Islands, Spain — final destination.\n\n📊 On May 10, 2026, the MV Hondius arrived at Tenerife. All 147 persons were disembarked under strict biosecurity protocols. Medical screening, PCR testing, and contact tracing were conducted by Spanish health authorities with WHO/ECDC coordination.\n\n✈️ REPATRIATION OPERATION: An unprecedented multinational evacuation followed:\n🇺🇸 USA: 17 passengers → military charter to Nebraska Medical Center (UNMC) quarantine facility\n🇬🇧 UK: ~20 passengers → RAF flight to Arrowe Park Hospital, Wirral (same facility used for COVID Diamond Princess evacuees 2020)\n🇳🇱 Netherlands: 8 → charter to Eindhoven military air base\n🇫🇷 France: 5 → Paris\n🇩🇪 Germany: 4 → repatriated via government arrangement\n🇧🇪 Belgium: 2 → Brussels\n🇦🇷 Argentina, 🇵🇹 Portugal, 🇬🇷 Greece, 🇦🇺 Australia, 🇳🇿 New Zealand, 🇮🇪 Ireland, 🇪🇸 Spain, 🇿🇦 South Africa, 🇨🇦 Canada, 🇨🇭 Switzerland — various arrangements.\n\nCrew nationalities included: 🇵🇭 Philippines, 🇮🇳 India, 🇺🇦 Ukraine, 🇬🇹 Guatemala, 🇲🇪 Montenegro.\n\n🔬 All 147 persons were classified as high-risk contacts with a mandatory 42-day health monitoring period. The MV Hondius was sent to the Netherlands for full disinfection and deep cleaning.', text_de: '📍 Hafen von Granadilla, Teneriffa, Kanarische Inseln, Spanien — Endziel.\n\n📊 Am 10. Mai 2026 erreichte die MV Hondius Teneriffa. Alle 147 Personen wurden unter strengen Biosicherheitsprotokollen von Bord genommen.\n\n✈️ RÜCKFÜHRUNGSOPERATION:\n🇺🇸 USA: 17 Passagiere → Nebraska Medical Center Quarantäne\n🇬🇧 UK: ~20 → Arrowe Park Hospital, Wirral\n🇳🇱 Niederlande: 8 → Eindhoven Militärbasis\n🇫🇷 Frankreich: 5 → Paris\n🇩🇪 Deutschland: 4 → Rückführung\n🇧🇪 Belgien: 2 → Brüssel\nWeitere: Argentinien, Portugal, Griechenland, Australien, Neuseeland, Irland, Spanien, Südafrika, Kanada, Schweiz.\n\nCrew-Nationalitäten: Philippinen, Indien, Ukraine, Guatemala, Montenegro.\n\n🔬 42-tägige Gesundheitsüberwachung für alle 147 Personen. Das Schiff wurde zur Desinfektion in die Niederlande geschickt.', layers: [], image: { wiki: 'Tenerife', caption: 'Port of Tenerife, Canary Islands' } },
                { center: [-20, 15], zoom: 2, title: '🌍 MV HONDIUS — GLOBAL RESPONSE MAP', title_de: '🌍 MV HONDIUS — GLOBALE REAKTIONSKARTE', text: '🌍 FROM PATAGONIA TO 23 NATIONS — a single ship, one virus, global consequences.\n\n📊 THE OUTBREAK IN NUMBERS:\n• Ship: MV Hondius (Oceanwide Expeditions, Netherlands)\n• Route: Ushuaia → Antarctic Peninsula → South Georgia → Tristan da Cunha → Saint Helena → Ascension Island → Cape Verde → Tenerife\n• Voyage: April 1 – May 10, 2026 (40 days)\n• Aboard: 147 people (88 passengers, 59 crew) from 23 countries\n• Pathogen: Andes virus (Orthohantavirus) — only hantavirus with human-to-human transmission\n• Cases: 9 total (7 confirmed, 2 probable)\n• Deaths: 3 (Dutch couple, German national)\n• Case fatality rate: 33%\n• Monitoring period: 42 days for all contacts\n• Repatriation: 13+ countries via military and charter flights\n• Public risk assessment (WHO/ECDC): LOW\n\n🔬 WHY IT MATTERS: The MV Hondius outbreak demonstrated that even a small expedition ship can become a floating epidemiological crisis. A rare South American pathogen — never before seen outside the continent — infected passengers from 23 nations and triggered the mobilization of military assets across 3 continents. The outbreak also highlighted the vulnerability of remote island communities along the ship\'s route.\n\n💡 Data snapshot: May 11, 2026. Situation may evolve during the 42-day monitoring period.', text_de: '🌍 VON PATAGONIEN IN 23 NATIONEN — ein Schiff, ein Virus, globale Konsequenzen.\n\n📊 DER AUSBRUCH IN ZAHLEN:\n• Schiff: MV Hondius (Oceanwide Expeditions, Niederlande)\n• Route: Ushuaia → Antarktis → Südgeorgien → Tristan da Cunha → St. Helena → Ascension → Kap Verde → Teneriffa\n• Reise: 1. April – 10. Mai 2026 (40 Tage)\n• An Bord: 147 Personen aus 23 Ländern\n• Erreger: Andes-Virus — einziges Hantavirus mit Mensch-zu-Mensch-Übertragung\n• Fälle: 9 (7 bestätigt, 2 Verdacht)\n• Tote: 3\n• Sterblichkeit: 33%\n• Rückführung: 13+ Länder via Militär- und Charterflüge\n• Risikobewertung (WHO/ECDC): GERING\n\n🔬 WARUM ES WICHTIG IST: Der Ausbruch zeigte, dass selbst ein kleines Expeditionsschiff zur epidemiologischen Krise werden kann. Ein seltener südamerikanischer Erreger — nie zuvor außerhalb des Kontinents gesehen — infizierte Passagiere aus 23 Nationen und löste den Einsatz militärischer Ressourcen auf 3 Kontinenten aus.\n\n💡 Datenstand: 11. Mai 2026. Situation kann sich während der 42-tägigen Überwachung ändern.', layers: [] }
            ]
        }
    };
    window._TOURS_REF = TOURS; // Expose for tours_de.js translations
    // Apply German translations (tours_de.js may have loaded already or not yet)
    if (typeof window._applyToursDE === 'function') window._applyToursDE();

    // ── GLOBAL TOUR SITES GLOW LAYER ──────────────────────────
    // Build a GeoJSON of all tour stop locations for a subtle ambient glow
    const TOUR_MARKER_LAYERS = new Set(['regimes', 'blocs', 'conflicts', 'nuclear', 'radiation']);
    const allTourSitesFeatures = [];
    const tourSitesMap = {}; // tourId → [feature indices]
    let featureIdx = 0;
    Object.entries(TOURS).forEach(([tourId, tour]) => {
        // Skip the welcome tour — its locations are generic overviews, not POIs
        if (tourId === 'welcome') return;
        tourSitesMap[tourId] = [];
        tour.steps.forEach((step, stepIdx) => {
            allTourSitesFeatures.push({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: step.center },
                properties: {
                    tourId: tourId,
                    stepIdx: stepIdx,
                    title: step.title || '',
                    tourName: tour.name || ''
                }
            });
            tourSitesMap[tourId].push(featureIdx);
            featureIdx++;
        });
    });

    const allTourSitesGeoJSON = { type: 'FeatureCollection', features: allTourSitesFeatures };

    // Add global tour-sites source and layers after map is ready
    const initTourSitesLayer = () => {
        if (map.getSource('tour-sites-src')) return;
        map.addSource('tour-sites-src', { type: 'geojson', data: allTourSitesGeoJSON });

        // Outer glow ring — all tour sites (hidden by default, reserved for future use)
        map.addLayer({
            id: 'tour-sites-glow',
            type: 'circle',
            source: 'tour-sites-src',
            layout: { visibility: 'none' },
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 3, 12, 6, 18, 10, 24],
                'circle-color': 'rgba(0, 212, 255, 0.0)',
                'circle-stroke-color': 'rgba(0, 212, 255, 0.25)',
                'circle-stroke-width': 1.5,
                'circle-blur': 0.6
            }
        });

        // Core dot — all tour sites (hidden by default)
        map.addLayer({
            id: 'tour-sites-core',
            type: 'circle',
            source: 'tour-sites-src',
            layout: { visibility: 'none' },
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 2, 3, 3, 6, 4.5, 10, 6],
                'circle-color': 'rgba(0, 212, 255, 0.25)',
                'circle-stroke-color': 'rgba(0, 212, 255, 0.15)',
                'circle-stroke-width': 0.5
            }
        });

        // Active tour highlight source (used when a tour is running)
        map.addSource('tour-active-src', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        // Active tour glow ring (amber — only current tour's stops)
        map.addLayer({
            id: 'tour-active-glow',
            type: 'circle',
            source: 'tour-active-src',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 22, 3, 30, 6, 40, 10, 50],
                'circle-color': 'rgba(255, 176, 0, 0.12)',
                'circle-stroke-color': 'rgba(255, 176, 0, 0.5)',
                'circle-stroke-width': 2.5
            }
        });

        // Active tour core dot (amber)
        map.addLayer({
            id: 'tour-active-core',
            type: 'circle',
            source: 'tour-active-src',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 3, 7, 6, 9, 10, 12],
                'circle-color': 'rgba(255, 176, 0, 0.7)',
                'circle-stroke-color': 'rgba(255, 220, 100, 0.8)',
                'circle-stroke-width': 1.5
            }
        });
    };

    // Initialize once map is idle (layers loaded)
    if (map.loaded()) {
        initTourSitesLayer();
    } else {
        map.on('load', initTourSitesLayer);
    }

    // Helper: show/hide the global tour sites ambient glow
    function setTourSitesGlowVisible(visible) {
        const vis = visible ? 'visible' : 'none';
        if (map.getLayer('tour-sites-glow')) map.setLayoutProperty('tour-sites-glow', 'visibility', vis);
        if (map.getLayer('tour-sites-core')) map.setLayoutProperty('tour-sites-core', 'visibility', vis);
    }

    // Helper: update active tour highlight layer
    function updateActiveTourLayer(tourId) {
        const src = map.getSource('tour-active-src');
        if (!src) return;
        if (!tourId || !tourSitesMap[tourId]) {
            src.setData({ type: 'FeatureCollection', features: [] });
            return;
        }
        const features = tourSitesMap[tourId].map(idx => allTourSitesFeatures[idx]);
        src.setData({ type: 'FeatureCollection', features });
    }

    // Helper: deactivate ALL markers and layers for a completely clean tour view
    // Directly removes every marker from every array — doesn't rely on checkbox toggles alone
    let _tourPreviousToggles = [];  // checkbox IDs that were checked before tour
    function deactivateAllLayersForTour() {
        _tourActive = true; // Block all data refreshes
        _tourPreviousToggles = [];

        // 1. FORCE-REMOVE every DOM marker from all marker arrays
        //    This is the nuclear option — guarantees no stray markers
        [
            regimeMarkers, blocMarkers, conflictMarkers, dcMarkers,
            nuclearMarkers, nukeArsenalMarkers, volcanoMarkers, radiationMarkers,
            webcamMarkers, flightMarkers, powerMarkers, aiAtlasMarkers
        ].forEach(arr => {
            arr.forEach(m => { try { m.remove(); } catch(e) {} });
        });

        // Also remove ISS marker if present
        if (issMarker && issMarker._map) {
            try { issMarker.remove(); } catch(e) {}
        }

        // 2. Hide ALL MapLibre native layers (comprehensive — matches actual layer IDs)
        const mlLayersToHide = [
            // Data layers
            'cables-layer',
            'earthquakes-core', 'earthquakes-ring', 'earthquakes-pulse',
            'pipelines-layer',
            'starlink-layer',
            'terminator-layer',
            'fires-layer',
            'country-borders', 'country-labels',
            'population-layer', 'temp-layer', 'sst-layer',
            'ai-atlas-lines',
            // Tour ambient dots (replaced by tour-active-glow/core during tours)
            'tour-sites-glow', 'tour-sites-core'
        ];
        mlLayersToHide.forEach(id => {
            if (map.getLayer(id)) {
                try { map.setLayoutProperty(id, 'visibility', 'none'); } catch(e) {}
            }
        });

        // 3. Uncheck ALL toggle checkboxes (comprehensive DOM sweep)
        document.querySelectorAll('.control-item input[type="checkbox"]').forEach(cb => {
            if (cb.id === 'toggle-all' || cb.id === 'toggle-ticker') return;
            if (cb.checked) {
                _tourPreviousToggles.push(cb.id);
                cb.checked = false;
                // Update the toggles object directly
                const key = cb.id.replace('toggle-', '');
                if (key in toggles) toggles[key] = false;
            }
        });
    }

    // Helper: restore layers that were active before the tour started
    function restoreLayersAfterTour() {
        _tourActive = false; // Re-enable data refreshes
        _tourPreviousToggles.forEach(cbId => {
            const cb = document.getElementById(cbId);
            if (cb && !cb.checked) {
                cb.checked = true;
                cb.dispatchEvent(new Event('change'));
            }
        });
        _tourPreviousToggles = [];
    }
    // ════════════════════════════════════════════════════════════
    // ENHANCED NARRATION ENGINE (V2 — Documentary-Quality TTS)
    // ════════════════════════════════════════════════════════════
    // Uses Web Speech API with:
    //   • Scored voice ranking (platform-aware neural voice selection)
    //   • Sentence-by-sentence delivery with breathing pauses
    //   • Dynamic rate variation (slower for stats, normal for narrative)
    //   • Warm documentary-style pitch

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

    // ── Bilingual tour text helper ──
    function getTourTitle(step) {
        return (currentLang === 'de' && step.title_de) ? step.title_de : step.title;
    }
    function getTourText(step) {
        return (currentLang === 'de' && step.text_de) ? step.text_de : step.text;
    }

    // ── Main Narration Function ──
    // Speaks text sentence-by-sentence with natural pacing
    function speakText(text) {
        if (!window.speechSynthesis) return;

        // Cancel any active narration
        speechSynthesis.cancel();
        _narrationQueue = [];
        _narrationActive = false;

        const lang = (currentLang === 'de') ? 'de' : 'en';
        const voice = getBestVoice(lang);
        const langTag = (lang === 'de') ? 'de-DE' : 'en-US';

        // Clean text for speech — remove emoji and special chars that break TTS
        const cleanText = text
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
            .replace(/[📍🏢📊🔒📏☢️🌱🚫💀📜🔧💰🏴‍☠️💣⚡🌋🏛️⚓🚢🏝️🐍]/g, '')
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

    let activeTour = null;
    let tourStepIndex = 0;
    const tourPanel = document.getElementById('tour-briefing');
    const tourTitle = document.getElementById('tour-briefing-title');
    const tourText = document.getElementById('tour-briefing-text');
    const tourCounter = document.getElementById('tour-step-counter');
    const tourPrev = document.getElementById('tour-prev');
    const tourNext = document.getElementById('tour-next');
    const tourClose = document.getElementById('tour-close');

    // ── DRAGGABLE TOUR PANEL (mouse + touch) ──
    if (tourPanel) {
        const dragHeader = tourPanel.querySelector('.tour-briefing-header');
        let isDragging = false, dragOffX = 0, dragOffY = 0;

        const onDragStart = (clientX, clientY) => {
            isDragging = true;
            const rect = tourPanel.getBoundingClientRect();
            dragOffX = clientX - rect.left;
            dragOffY = clientY - rect.top;
            tourPanel.style.transition = 'none';
        };
        const onDragMove = (clientX, clientY) => {
            if (!isDragging) return;
            let nx = clientX - dragOffX;
            let ny = clientY - dragOffY;
            // Clamp within viewport
            nx = Math.max(0, Math.min(nx, window.innerWidth - 60));
            ny = Math.max(0, Math.min(ny, window.innerHeight - 40));
            tourPanel.style.left = nx + 'px';
            tourPanel.style.top = ny + 'px';
            tourPanel.style.bottom = 'auto';
            tourPanel.style.right = 'auto';
        };
        const onDragEnd = () => {
            isDragging = false;
            tourPanel.style.transition = '';
        };

        // Mouse events
        if (dragHeader) {
            dragHeader.addEventListener('mousedown', (e) => {
                if (e.target.closest('button')) return; // Don't drag when clicking buttons
                e.preventDefault();
                onDragStart(e.clientX, e.clientY);
            });
        }
        document.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
        document.addEventListener('mouseup', onDragEnd);

        // Touch events
        if (dragHeader) {
            dragHeader.addEventListener('touchstart', (e) => {
                if (e.target.closest('button')) return;
                const t = e.touches[0];
                onDragStart(t.clientX, t.clientY);
            }, { passive: true });
        }
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            onDragMove(t.clientX, t.clientY);
        }, { passive: true });
        document.addEventListener('touchend', onDragEnd);
    }

    function getTourName(tour) {
        return (currentLang === 'de' && tour.name_de) ? tour.name_de : tour.name;
    }
    function startTour(tourId) {
        const tour = TOURS[tourId];
        if (!tour) return;

        // ── CLEAN SLATE: deactivate all data layers for an uncluttered tour view ──
        deactivateAllLayersForTour();
        setTourSitesGlowVisible(false);

        activeTour = tour;
        activeTourId = tourId;
        tourStepIndex = 0;

        const nm = getTourName(tour).toUpperCase();
        setStatus(currentLang === 'de' ? 'GEFÜHRTE TOUR: ' + nm + ' — ÜBERSICHT' : 'GUIDED TOUR: ' + nm + ' — OVERVIEW');

        // Chime sound on tour start
        if (window._geoSfx) window._geoSfx.chime();

        // ── CINEMATIC OVERVIEW INTRO ──
        // 1. Light up all stops as bright pulsing amber dots
        // 2. Zoom out to frame the entire route (NO text panel)
        // 3. Hold for 6 seconds so the user sees all stops
        // 4. Then fly to first stop and reveal the briefing panel

        updateActiveTourLayer(activeTourId);

        // Calculate bounding box center + zoom
        const lngs = tour.steps.map(s => s.center[0]);
        const lats = tour.steps.map(s => s.center[1]);
        const overviewCenter = [
            (Math.min(...lngs) + Math.max(...lngs)) / 2,
            (Math.min(...lats) + Math.max(...lats)) / 2
        ];
        const maxSpread = Math.max(Math.max(...lngs) - Math.min(...lngs), Math.max(...lats) - Math.min(...lats));
        const overviewZoom = maxSpread > 200 ? 1 : maxSpread > 100 ? 1.8 : maxSpread > 50 ? 2.5 : maxSpread > 20 ? 3.5 : 4.5;

        // HIDE the tour panel — overview should be clean map + dots only
        if (tourPanel) tourPanel.classList.add('hidden');

        // Fly to overview position
        const transOverlay = document.getElementById('tour-transition-overlay');
        if (transOverlay) transOverlay.classList.add('active');
        if (window._geoSfx) window._geoSfx.whoosh();

        map.flyTo({
            center: overviewCenter,
            zoom: overviewZoom,
            duration: 3500,
            essential: true,
            pitch: 0,
            bearing: 0
        });

        // Remove transition overlay when overview flight completes
        map.once('moveend', () => {
            if (transOverlay) transOverlay.classList.remove('active');
        });

        // ── ANIMATED GLOW PULSE on overview dots ──
        let glowPhase = 0;
        const glowInterval = setInterval(() => {
            glowPhase = (glowPhase + 1) % 50;
            const pulseScale = 1 + 0.5 * Math.sin(glowPhase / 50 * Math.PI * 2);
            const pulseOpacity = 0.3 + 0.3 * Math.sin(glowPhase / 50 * Math.PI * 2);
            if (map.getLayer('tour-active-glow')) {
                map.setPaintProperty('tour-active-glow', 'circle-stroke-opacity', pulseOpacity);
                map.setPaintProperty('tour-active-glow', 'circle-radius',
                    ['interpolate', ['linear'], ['zoom'], 1, 22 * pulseScale, 3, 30 * pulseScale, 6, 40 * pulseScale]
                );
            }
            if (map.getLayer('tour-active-core')) {
                const corePulse = 0.5 + 0.3 * Math.sin(glowPhase / 50 * Math.PI * 2);
                map.setPaintProperty('tour-active-core', 'circle-opacity', corePulse);
            }
        }, 50);

        // After 6 seconds: stop pulsing, fly to first actual stop
        setTimeout(() => {
            clearInterval(glowInterval);
            // Reset glow to default steady state
            if (map.getLayer('tour-active-glow')) {
                map.setPaintProperty('tour-active-glow', 'circle-stroke-opacity', 0.5);
                map.setPaintProperty('tour-active-glow', 'circle-radius',
                    ['interpolate', ['linear'], ['zoom'], 1, 22, 3, 30, 6, 40, 10, 50]
                );
            }
            if (map.getLayer('tour-active-core')) {
                map.setPaintProperty('tour-active-core', 'circle-opacity', 0.7);
            }
            // Now proceed to the first tour step
            showTourStep();
        }, 6000);
    }


    // ── Typewriter effect helper ──
    let _typewriterTimer = null;
    function typewriterEffect(element, text, speed = 18, onComplete) {
        clearInterval(_typewriterTimer);
        element.innerHTML = '';
        let i = 0;
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';
        element.appendChild(cursor);
        _typewriterTimer = setInterval(() => {
            if (i < text.length) {
                // Insert character before cursor
                cursor.before(document.createTextNode(text.charAt(i)));
                i++;
                // Auto-scroll the panel to keep cursor visible
                element.closest('.tour-briefing-panel')?.scrollTo({ top: element.closest('.tour-briefing-panel').scrollHeight, behavior: 'smooth' });
            } else {
                clearInterval(_typewriterTimer);
                // Remove cursor after a short delay
                setTimeout(() => cursor.remove(), 2000);
                if (onComplete) onComplete();
            }
        }, speed);
    }

    function showTourStep() {
        if (!activeTour || !tourPanel) return;
        const step = activeTour.steps[tourStepIndex];
        if (!step) return;

        // Update active tour highlight on map
        updateActiveTourLayer(activeTourId);

        // During tours: ONLY activate tour-specific @-prefixed overlays (e.g. roman-empire)
        // All other layers are suppressed for a clean, focused tour experience
        if (step.layers) {
            step.layers.forEach(layerId => {
                // Only allow direct map layers prefixed with '@' (tour-specific overlays)
                if (layerId.startsWith('@')) {
                    const mlId = layerId.slice(1);
                    if (map.getLayer(mlId)) map.setLayoutProperty(mlId, 'visibility', 'visible');
                }
                // All toggle-based layers (regimes, blocs, conflicts, earthquakes, etc.)
                // are intentionally NOT activated — tour uses its own amber highlight dots
            });
        }

        // Stop any ongoing narration + typewriter
        stopNarration();
        clearInterval(_typewriterTimer);

        // Hide briefing during flight + reset drag position to default
        tourPanel.style.left = '';
        tourPanel.style.top = '';
        tourPanel.style.bottom = '';
        tourPanel.style.right = '';
        tourPanel.classList.add('hidden');
        tourPanel.classList.add('flying');

        // Disable nav during flight
        if (tourPrev) tourPrev.disabled = true;
        if (tourNext) tourNext.disabled = true;

        // ── Tour Transition Effect (blur overlay + whoosh) ──
        const transOverlay = document.getElementById('tour-transition-overlay');
        if (transOverlay) { transOverlay.classList.add('active'); }
        if (window._geoSfx) window._geoSfx.whoosh();

        // ── Update Story-Mode Progress Bar ──
        const progressFill = document.getElementById('tour-progress-fill');
        if (progressFill && activeTour) {
            const pct = ((tourStepIndex + 1) / activeTour.steps.length) * 100;
            progressFill.style.width = pct + '%';
        }

        // ── Cinematic Camera Choreography ──
        // Each stop gets a unique bearing offset for visual variety.
        // Higher zoom stops get a dramatic pitch tilt.
        // Overview/world steps (zoom ≤ 2.5) stay flat and centered.
        const baseZoom = step.zoom;
        const boostedZoom = baseZoom <= 2.5 ? baseZoom : Math.min(baseZoom + 3, 14);
        const isCloseup = boostedZoom >= 8;

        // Cinematic bearing: alternate direction per step, ±15-30° for closeups
        const bearingOffset = isCloseup
            ? ((tourStepIndex % 2 === 0 ? 1 : -1) * (15 + (tourStepIndex * 7) % 20))
            : 0;
        const cinematicPitch = isCloseup ? 40 + Math.min(tourStepIndex * 2, 15) : (boostedZoom >= 5 ? 20 : 0);

        map.flyTo({
            center: step.center,
            zoom: boostedZoom,
            duration: 5500,
            essential: true,
            curve: 1.5,
            pitch: cinematicPitch,
            bearing: bearingOffset
        });

        // Show briefing AFTER flight completes
        map.once('moveend', () => {
            tourPanel.classList.remove('flying');
            // Clear transition overlay
            const transOvl = document.getElementById('tour-transition-overlay');
            if (transOvl) transOvl.classList.remove('active');
            if (window._geoSfx) window._geoSfx.tick();
            const stepTitle = getTourTitle(step);
            const stepText = getTourText(step);
            tourTitle.textContent = stepTitle;
            tourCounter.textContent = (currentLang === 'de' ? 'STOPP ' : 'STOP ') + (tourStepIndex + 1) + (currentLang === 'de' ? ' VON ' : ' OF ') + activeTour.steps.length;

            // ── Typewriter Text Reveal ──
            // Text appears character-by-character for a decoded-intel feel
            typewriterEffect(tourText, stepText, 18, () => {
                // Auto-narrate after typewriter completes (if enabled)
                const narrateActive = document.getElementById('tour-narrate');
                if (narrateActive && narrateActive.classList.contains('active')) {
                    speakText(stepText);
                }
            });

            // Load Wikipedia thumbnail image if available
            const imgContainer = document.getElementById('tour-briefing-image');
            if (imgContainer) {
                imgContainer.innerHTML = '';
                imgContainer.classList.add('hidden');
                if (step.image && step.image.wiki) {
                    const wikiLang = (currentLang === 'de') ? 'de' : 'en';
                    const wikiUrl = 'https://' + wikiLang + '.wikipedia.org/wiki/' + encodeURIComponent(step.image.wiki);
                    fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(step.image.wiki))
                        .then(r => r.json())
                        .then(data => {
                            if (data.thumbnail && data.thumbnail.source) {
                                const link = document.createElement('a');
                                link.href = wikiUrl;
                                link.target = '_blank';
                                link.rel = 'noopener';
                                link.title = (currentLang === 'de') ? 'Wikipedia-Artikel öffnen' : 'Open Wikipedia article';
                                const img = document.createElement('img');
                                img.src = data.thumbnail.source;
                                img.alt = step.image.caption || step.title;
                                img.loading = 'lazy';
                                img.style.cursor = 'pointer';
                                link.appendChild(img);
                                const cap = document.createElement('div');
                                cap.className = 'tour-image-caption';
                                cap.textContent = step.image.caption || '';
                                imgContainer.appendChild(link);
                                imgContainer.appendChild(cap);
                                imgContainer.classList.remove('hidden');
                            }
                        })
                        .catch(() => {}); // Silent fail — image is optional enrichment
                    // Update wiki link in hint
                    const wikiLink = document.getElementById('tour-wiki-link');
                    if (wikiLink) {
                        wikiLink.href = wikiUrl;
                        wikiLink.style.display = '';
                    }
                } else {
                    // No wiki image — hide wiki link
                    const wikiLink = document.getElementById('tour-wiki-link');
                    if (wikiLink) wikiLink.style.display = 'none';
                }
            }

            // Load YouTube video if available (Video Pilot)
            const vidContainer = document.getElementById('tour-briefing-video');
            if (vidContainer) {
                vidContainer.innerHTML = '';
                vidContainer.classList.add('hidden');
                if (step.video) {
                    const badge = document.createElement('div');
                    badge.className = 'tour-video-badge';
                    badge.innerHTML = '<i class="fa-solid fa-film"></i> VIDEO PILOT';
                    // Clickable thumbnail card — opens YouTube in new tab (no embed/CSP issues)
                    const card = document.createElement('a');
                    card.href = 'https://www.youtube.com/watch?v=' + step.video;
                    card.target = '_blank';
                    card.rel = 'noopener noreferrer';
                    card.className = 'tour-video-card';
                    card.title = 'Watch on YouTube';
                    card.style.cssText = 'display:block;position:relative;border-radius:8px;overflow:hidden;cursor:pointer;text-decoration:none;border:1px solid rgba(255,0,0,0.3);background:#0a0a0a;transition:all .3s;';
                    // YouTube thumbnail
                    const thumb = document.createElement('img');
                    thumb.src = 'https://img.youtube.com/vi/' + step.video + '/hqdefault.jpg';
                    thumb.alt = 'Video thumbnail';
                    thumb.style.cssText = 'width:100%;height:auto;display:block;opacity:.85;transition:opacity .3s;';
                    thumb.onerror = function() { this.src = 'https://img.youtube.com/vi/' + step.video + '/mqdefault.jpg'; };
                    // Play button overlay
                    const playBtn = document.createElement('div');
                    playBtn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:40px;background:rgba(255,0,0,0.85);border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all .3s;';
                    playBtn.innerHTML = '<i class="fa-solid fa-play" style="color:#fff;font-size:16px;margin-left:2px;"></i>';
                    // Label bar
                    const label = document.createElement('div');
                    label.style.cssText = 'padding:8px 12px;background:rgba(0,0,0,0.9);color:rgba(255,255,255,0.7);font-family:\"Share Tech Mono\",monospace;font-size:0.6rem;letter-spacing:1px;display:flex;align-items:center;gap:6px;';
                    label.innerHTML = '<i class="fa-brands fa-youtube" style="color:#ff0000;font-size:0.8rem;"></i> WATCH ON YOUTUBE <i class="fa-solid fa-external-link" style="opacity:.4;font-size:0.5rem;margin-left:auto;"></i>';
                    // Hover effects
                    card.onmouseenter = function() { this.style.borderColor='rgba(255,0,0,0.6)'; thumb.style.opacity='1'; playBtn.style.background='rgba(255,0,0,1)'; playBtn.style.transform='translate(-50%,-50%) scale(1.1)'; };
                    card.onmouseleave = function() { this.style.borderColor='rgba(255,0,0,0.3)'; thumb.style.opacity='.85'; playBtn.style.background='rgba(255,0,0,0.85)'; playBtn.style.transform='translate(-50%,-50%) scale(1)'; };
                    card.appendChild(thumb);
                    card.appendChild(playBtn);
                    card.appendChild(label);
                    vidContainer.appendChild(badge);
                    vidContainer.appendChild(card);
                    vidContainer.classList.remove('hidden');
                }
            }

            tourPanel.classList.remove('hidden');

            // Re-enable nav
            if (tourPrev) tourPrev.disabled = false;
            if (tourNext) tourNext.disabled = false;

            // Update nav buttons
            tourPrev.style.display = tourStepIndex === 0 ? 'none' : 'flex';
            if (tourStepIndex < activeTour.steps.length - 1) {
                tourNext.innerHTML = 'NEXT <i class="fa-solid fa-chevron-right"></i>';
            } else {
                tourNext.innerHTML = '<i class="fa-solid fa-check"></i> FINISH TOUR';
            }

            // ── Cinematic Orbital Drift ──
            // After landing, slowly rotate the camera 8° for a living-map feel
            if (isCloseup) {
                setTimeout(() => {
                    if (!activeTour) return; // Tour may have ended
                    map.easeTo({
                        bearing: bearingOffset + 8,
                        duration: 4000,
                        easing: t => t * (2 - t) // ease-out
                    });
                }, 800);
            }
        });
    }

    function endTour() {
        activeTour = null;
        activeTourId = null;
        tourStepIndex = 0;
        if (tourPanel) tourPanel.classList.add('hidden');
        stopNarration();
        clearInterval(_typewriterTimer);
        // Reset progress bar
        const progressFill = document.getElementById('tour-progress-fill');
        if (progressFill) progressFill.style.width = '0%';
        // Reset camera to flat north-up
        map.easeTo({ bearing: 0, pitch: 0, duration: 1500 });
        // Hide tour-specific overlay layers
        ['roman-empire-fill', 'roman-empire-border'].forEach(id => {
            if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });
        // Clear active tour highlight (no ambient glow — dots only appear during tours)
        updateActiveTourLayer(null);

        // Restore layers that were active before the tour started
        restoreLayersAfterTour();

        setStatus(currentLang === 'de' ? 'TOUR ABGESCHLOSSEN — FREI ERKUNDEN' : 'TOUR COMPLETE — EXPLORE FREELY');
    }

    tourPrev?.addEventListener('click', () => {
        if (tourStepIndex > 0) { tourStepIndex--; showTourStep(); }
    });
    tourNext?.addEventListener('click', () => {
        if (activeTour && tourStepIndex < activeTour.steps.length - 1) {
            tourStepIndex++;
            showTourStep();
        } else {
            endTour();
        }
    });
    // Audio narrate button — speak current step immediately on click
    const narrateBtn = document.getElementById('tour-narrate');
    if (narrateBtn) {
        // Remove inline onclick (set in HTML) and use proper handler
        narrateBtn.removeAttribute('onclick');
        narrateBtn.addEventListener('click', () => {
            narrateBtn.classList.toggle('active');
            if (narrateBtn.classList.contains('active')) {
                // Start narrating the current step text
                if (activeTour) {
                    const currentText = document.getElementById('tour-briefing-text')?.textContent;
                    if (currentText) speakText(currentText);
                }
            } else {
                // Deactivated — stop speaking
                stopNarration();
            }
        });
    }

    tourClose?.addEventListener('click', () => endTour());

    // Sidebar tour buttons
    document.querySelectorAll('.tour-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tourId = btn.dataset.tour;
            if (tourId) startTour(tourId);
        });
    });

    // ============================================================
    // WIKIPEDIA LINK HELPER (for popup enrichment)
    // ============================================================
    window._wikiLink = function(name) {
        const slug = name.replace(/\s+/g, '_').replace(/[()]/g, '');
        return '<a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(slug) + '" target="_blank" rel="noopener" ' +
               'style="display:block;margin-top:6px;font-size:.6rem;color:#00d4ff;text-decoration:none;letter-spacing:1px;border-top:1px solid rgba(0,212,255,.15);padding-top:4px;">' +
               '\ud83d\udcda Learn more on Wikipedia \u2197</a>';
    };

    // ============================================================
    // FEEDBACK WIDGET
    // ============================================================
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

    // ═══════════════════════════════════════════════════════════════
    // ── GEOQUIZ INITIALIZATION (Phase 2, V2.2) ───────────────────
    // ═══════════════════════════════════════════════════════════════

    (function initQuiz() {
        let quizCategory = 'all';
        let quizDifficulty = 'explorer';

        // Category buttons
        document.querySelectorAll('.quiz-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.quiz-cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                quizCategory = btn.getAttribute('data-cat');
            });
        });

        // Difficulty buttons
        document.querySelectorAll('.quiz-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.quiz-diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                quizDifficulty = btn.getAttribute('data-diff');
            });
        });

        // Start button
        const startBtn = document.getElementById('quiz-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (typeof GeoQuiz === 'undefined' || typeof QUIZ_BANK === 'undefined') {
                    console.warn('[GEOPULSE] Quiz engine or bank not loaded');
                    return;
                }
                const quiz = new GeoQuiz(map);
                quiz.start(quizCategory, quizDifficulty, 10);
                // Close sidebar on mobile
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth < 900 && sidebar) sidebar.classList.remove('open');
            });
        }

        console.log('[GEOPULSE] GeoQuiz initialized');
    })();

    // ═══════════════════════════════════════════════════════════════
    // ── SMART SIDEBAR SEARCH (Phase 1, V2.2) ─────────────────────
    // ═══════════════════════════════════════════════════════════════

    (function initSidebarSearch() {
        const searchInput = document.getElementById('sidebar-search');
        const searchResults = document.getElementById('search-results');
        const searchClear = document.getElementById('search-clear');
        const searchKbd = document.querySelector('.search-kbd');
        if (!searchInput || !searchResults) return;

        // --- Build search index from DOM ---
        const SEARCH_INDEX = [];

        // Tours: extract from tour buttons
        document.querySelectorAll('.tour-btn[data-tour]').forEach(btn => {
            const tourId = btn.getAttribute('data-tour');
            const i18nKey = btn.querySelector('[data-i18n]');
            const cat = btn.closest('.tour-category[data-cat]');
            const catName = cat ? cat.getAttribute('data-cat') : 'featured';
            // Get icon from button text (first emoji)
            const iconMatch = btn.textContent.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/u);
            const icon = iconMatch ? iconMatch[0] : '🎯';
            // Get text from i18n dictionaries
            const enText = i18nKey ? (window._i18n?.en?.[i18nKey.getAttribute('data-i18n')] || i18nKey.textContent) : btn.textContent;
            const deText = i18nKey ? (window._i18n?.de?.[i18nKey.getAttribute('data-i18n')] || '') : '';

            SEARCH_INDEX.push({
                type: 'tour',
                id: tourId,
                icon: icon,
                name_en: enText.trim(),
                name_de: deText.trim(),
                cat: catName,
                el: btn
            });
        });

        // Layers: extract from toggle checkboxes
        document.querySelectorAll('.control-item .toggle-switch input[id^="toggle-"]').forEach(toggle => {
            const layerId = toggle.id.replace('toggle-', '');
            if (layerId === 'all' || layerId === 'ticker') return; // skip system toggles
            const controlItem = toggle.closest('.control-item');
            if (!controlItem) return;
            const labelSpan = controlItem.querySelector('.layer-info [data-i18n]');
            const iconMatch = controlItem.textContent.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/u);
            const icon = iconMatch ? iconMatch[0] : '🗺️';
            const enText = labelSpan ? (window._i18n?.en?.[labelSpan.getAttribute('data-i18n')] || labelSpan.textContent) : layerId;
            const deText = labelSpan ? (window._i18n?.de?.[labelSpan.getAttribute('data-i18n')] || '') : '';
            // Also grab description for better matching
            const descSpan = controlItem.querySelector('.layer-desc[data-i18n]');
            const descEn = descSpan ? (window._i18n?.en?.[descSpan.getAttribute('data-i18n')] || descSpan.textContent) : '';
            const descDe = descSpan ? (window._i18n?.de?.[descSpan.getAttribute('data-i18n')] || '') : '';

            SEARCH_INDEX.push({
                type: 'layer',
                id: layerId,
                icon: icon,
                name_en: enText.trim(),
                name_de: deText.trim(),
                desc_en: descEn.trim(),
                desc_de: descDe.trim(),
                toggleId: toggle.id,
                el: toggle
            });
        });

        // Store i18n reference for search
        // Build a flat text version for each item
        SEARCH_INDEX.forEach(item => {
            item._searchText = [
                item.name_en, item.name_de,
                item.desc_en || '', item.desc_de || '',
                item.id, item.cat || ''
            ].join(' ').toLowerCase();
        });

        console.log(`[GEOPULSE] Search index built: ${SEARCH_INDEX.length} items (tours + layers)`);

        // --- Fuzzy match ---
        function fuzzyMatch(query, item) {
            const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);
            return words.every(w => item._searchText.includes(w));
        }

        // --- Render results ---
        let activeIndex = -1;

        function renderResults(query) {
            if (!query || query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            const matches = SEARCH_INDEX.filter(item => fuzzyMatch(query, item));
            activeIndex = -1;

            if (matches.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
                searchResults.style.display = 'block';
                return;
            }

            // Group by type
            const tours = matches.filter(m => m.type === 'tour');
            const layers = matches.filter(m => m.type === 'layer');
            const lang = document.documentElement.lang === 'de' ? 'de' : 'en';

            let html = '';
            if (tours.length > 0) {
                html += '<div class="search-group-label">Tours</div>';
                tours.forEach((item, i) => {
                    const name = lang === 'de' && item.name_de ? item.name_de : item.name_en;
                    html += `<div class="search-result-item" data-type="tour" data-id="${item.id}" data-idx="${i}">
                        <span class="sr-icon">${item.icon}</span>
                        <span class="sr-name">${highlightMatch(name, query)}</span>
                        <span class="sr-type">tour</span>
                    </div>`;
                });
            }
            if (layers.length > 0) {
                html += '<div class="search-group-label">Layers</div>';
                layers.forEach((item, i) => {
                    const name = lang === 'de' && item.name_de ? item.name_de : item.name_en;
                    html += `<div class="search-result-item" data-type="layer" data-id="${item.id}" data-idx="${tours.length + i}">
                        <span class="sr-icon">${item.icon}</span>
                        <span class="sr-name">${highlightMatch(name, query)}</span>
                        <span class="sr-type">layer</span>
                    </div>`;
                });
            }

            searchResults.innerHTML = html;
            searchResults.style.display = 'block';

            // Click handler for results
            searchResults.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', () => activateResult(el));
            });
        }

        function highlightMatch(text, query) {
            const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
            let result = escapeHtml(text);
            words.forEach(w => {
                const regex = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                result = result.replace(regex, '<span class="sr-highlight">$1</span>');
            });
            return result;
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // --- Activate a result ---
        function activateResult(el) {
            const type = el.getAttribute('data-type');
            const id = el.getAttribute('data-id');

            if (type === 'tour') {
                // Find and click the tour button
                const btn = document.querySelector(`.tour-btn[data-tour="${id}"]`);
                if (btn) {
                    // Open parent category if closed
                    const cat = btn.closest('.tour-category');
                    if (cat && !cat.classList.contains('open')) {
                        cat.classList.add('open');
                    }
                    // Open tours section if collapsed
                    const sec = document.getElementById('sec-tours');
                    if (sec && !sec.classList.contains('open')) {
                        sec.classList.add('open');
                    }
                    btn.click();
                }
            } else if (type === 'layer') {
                // Find and toggle the layer checkbox
                const toggle = document.getElementById('toggle-' + id);
                if (toggle) {
                    toggle.checked = !toggle.checked;
                    toggle.dispatchEvent(new Event('change', { bubbles: true }));
                    // Open the parent section
                    const sec = toggle.closest('.collapsible-section');
                    if (sec && !sec.classList.contains('open')) {
                        sec.classList.add('open');
                    }
                }
            }

            // Clear search
            searchInput.value = '';
            searchResults.style.display = 'none';
            searchClear.style.display = 'none';
            searchKbd.style.display = '';
        }

        // --- Input handler ---
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim();
            searchClear.style.display = q ? 'block' : 'none';
            searchKbd.style.display = q ? 'none' : '';
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => renderResults(q), 120);
        });

        // --- Clear button ---
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.style.display = 'none';
            searchClear.style.display = 'none';
            searchKbd.style.display = '';
            searchInput.focus();
        });

        // --- Keyboard navigation ---
        searchInput.addEventListener('keydown', (e) => {
            const items = searchResults.querySelectorAll('.search-result-item');
            if (!items.length) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIndex = Math.min(activeIndex + 1, items.length - 1);
                items.forEach(el => el.classList.remove('active'));
                items[activeIndex].classList.add('active');
                items[activeIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIndex = Math.max(activeIndex - 1, 0);
                items.forEach(el => el.classList.remove('active'));
                items[activeIndex].classList.add('active');
                items[activeIndex].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter' && activeIndex >= 0) {
                e.preventDefault();
                activateResult(items[activeIndex]);
            } else if (e.key === 'Escape') {
                searchInput.value = '';
                searchResults.style.display = 'none';
                searchClear.style.display = 'none';
                searchKbd.style.display = '';
                searchInput.blur();
            }
        });

        // --- Ctrl+K global shortcut ---
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Open sidebar if closed
                const sidebar = document.getElementById('sidebar');
                if (sidebar && !sidebar.classList.contains('open')) {
                    sidebar.classList.add('open');
                }
                searchInput.focus();
                searchInput.select();
            }
        });

        // --- Close results on outside click ---
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#sec-search')) {
                searchResults.style.display = 'none';
            }
        });

    })();

    // ═══════════════════════════════════════════════════════════════
    // ── OPTION D: Category Collapse Memory + Smart Defaults + 🆕 ──
    // ═══════════════════════════════════════════════════════════════

    // --- 1. Collapse Memory ---
    // Save and restore which tour categories are open/closed
    const CAT_STATE_KEY = 'geopulse_cat_state';
    const FIRST_VISIT_KEY = 'geopulse_first_visit_done';

    // Default categories to open on first visit
    const FIRST_VISIT_DEFAULTS = ['geopolitics', 'science'];

    // All tour categories
    const tourCats = document.querySelectorAll('.tour-category[data-cat]');

    // Override the inline onclick to add persistence
    tourCats.forEach(cat => {
        const header = cat.querySelector('.tour-cat-header');
        if (!header) return;

        // Remove inline onclick (we manage it now)
        header.removeAttribute('onclick');

        header.addEventListener('click', () => {
            cat.classList.toggle('open');
            saveCatState();
        });
    });

    function saveCatState() {
        const state = {};
        tourCats.forEach(cat => {
            const key = cat.getAttribute('data-cat');
            if (key) state[key] = cat.classList.contains('open');
        });
        try { localStorage.setItem(CAT_STATE_KEY, JSON.stringify(state)); } catch(e) {}
    }

    function restoreCatState() {
        const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
        let state = null;

        try {
            const raw = localStorage.getItem(CAT_STATE_KEY);
            if (raw) state = JSON.parse(raw);
        } catch(e) {}

        tourCats.forEach(cat => {
            const key = cat.getAttribute('data-cat');
            if (!key) return;

            if (state && typeof state[key] === 'boolean') {
                // Returning user: restore saved state
                if (state[key]) cat.classList.add('open');
                else cat.classList.remove('open');
            } else if (isFirstVisit && FIRST_VISIT_DEFAULTS.includes(key)) {
                // First visit: auto-open popular categories
                cat.classList.add('open');
            }
        });

        if (isFirstVisit) {
            try { localStorage.setItem(FIRST_VISIT_KEY, '1'); } catch(e) {}
            saveCatState();
        }
    }

    restoreCatState();

    // --- 2. 🆕 Badges for V2.0 tours ---
    // Tours added in V2.0 (released May 15, 2026)
    const V2_NEW_TOURS = [
        'aurorahunters', 'cosmicimpacts', 'climatecrisis',
        'greatmigrations', 'spycraft'
    ];
    const V2_RELEASE_DATE = new Date('2026-05-15');
    const BADGE_DURATION_DAYS = 30;
    const now = new Date();
    const daysSinceV2 = (now - V2_RELEASE_DATE) / (1000 * 60 * 60 * 24);

    if (daysSinceV2 <= BADGE_DURATION_DAYS) {
        V2_NEW_TOURS.forEach(tourId => {
            const btn = document.querySelector(`.tour-btn[data-tour="${tourId}"]`);
            if (btn) {
                const badge = document.createElement('span');
                badge.className = 'tour-new-badge';
                badge.textContent = '🆕';
                badge.title = 'New in V2.0';
                btn.style.position = 'relative';
                btn.appendChild(badge);
            }
        });

        // Update category headers with "new" count
        const catNewCounts = {};
        V2_NEW_TOURS.forEach(tourId => {
            const btn = document.querySelector(`.tour-btn[data-tour="${tourId}"]`);
            if (btn) {
                const cat = btn.closest('.tour-category[data-cat]');
                if (cat) {
                    const key = cat.getAttribute('data-cat');
                    catNewCounts[key] = (catNewCounts[key] || 0) + 1;
                }
            }
        });

        Object.entries(catNewCounts).forEach(([catKey, count]) => {
            const cat = document.querySelector(`.tour-category[data-cat="${catKey}"]`);
            if (!cat) return;
            const countEl = cat.querySelector('.tour-cat-count');
            if (countEl) {
                const total = countEl.textContent.trim();
                countEl.innerHTML = `${total} <span class="cat-new-indicator">• ${count} new</span>`;
            }
        });
    }

    console.log('[GEOPULSE] Option D: Collapse memory + NEW badges initialized');

}); // end DOMContentLoaded
