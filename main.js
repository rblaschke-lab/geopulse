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
            sessionEl.innerText = ((data.count || 0) + COUNTER_OFFSET).toLocaleString();
        } catch (e) {
            // Fallback: localStorage counter if API unreachable
            let count = parseInt(localStorage.getItem('geopulseSessionCount') || String(COUNTER_OFFSET), 10);
            count++;
            localStorage.setItem('geopulseSessionCount', count);
            sessionEl.innerText = count.toLocaleString();
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
            layer_flights: 'Live Flights', desc_flights: 'Real-time aircraft positions worldwide via ADS-B (ADSB.lol). Free, open-source data.',
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
            tour_coldwar: 'Cold War → Reunification', tour_bri: 'Belt & Road Initiative',
            tour_trump: 'Trump World Tour', tour_chokepoints: 'Chokepoints', tour_water: 'Water Wars',
            tour_ww1: 'World War I (1914–1918)', tour_ww2: 'World War II (1939–1945)',
            tour_ringoffire: 'Ring of Fire', tour_nuclear: 'Nuclear Legacy', tour_cables: 'Digital Silk Road',
            tour_battery: 'Battery Race', tour_climate: 'Climate Frontlines',
            tour_quakes: 'Earthquakes & Eruptions', tour_olympics: 'Olympic Games History',
            tour_f1: 'Formula 1 World Tour', tour_worldcup: 'FIFA World Cup',
            tour_romanempire: 'Roman Empire (753 BC–476 AD)',
            // Tour hint
            tour_hint: 'Click the markers on the map for detailed info & Wikipedia links',
            // Welcome overlay
            welcome_subtitle: 'INTERACTIVE WORLD MAP',
            welcome_feat_1: 'Real-time earthquakes & volcanoes',
            welcome_feat_2: 'Live flights & satellite orbits',
            welcome_feat_3: 'Geopolitics, conflicts & alliances',
            welcome_feat_4: 'Nuclear sites & radiation history',
            welcome_start_tour: 'START GUIDED TOUR', welcome_explore: 'EXPLORE FREELY',
            welcome_dont_show: "Don't show again",
            welcome_footer: 'No login · No ads · 100% free & open source · For students & educators',
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
            layer_flights: 'Live-Flüge', desc_flights: 'Echtzeit-Flugzeugpositionen weltweit via ADS-B (ADSB.lol). Kostenlose, offene Daten.',
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
            tour_coldwar: 'Kalter Krieg → Wiedervereinigung', tour_bri: 'Neue Seidenstraße',
            tour_trump: 'Trump Welttour', tour_chokepoints: 'Nadelöhre der Welt', tour_water: 'Wasserkriege',
            tour_ww1: 'Erster Weltkrieg (1914–1918)', tour_ww2: 'Zweiter Weltkrieg (1939–1945)',
            tour_ringoffire: 'Pazifischer Feuerring', tour_nuclear: 'Nukleares Erbe', tour_cables: 'Digitale Seidenstraße',
            tour_battery: 'Batterie-Wettlauf', tour_climate: 'Klima-Frontlinien',
            tour_quakes: 'Erdbeben & Vulkanausbrüche', tour_olympics: 'Olympische Spiele',
            tour_f1: 'Formel 1 Welttour', tour_worldcup: 'FIFA Weltmeisterschaft',
            tour_romanempire: 'Römisches Reich (753 v. Chr.–476 n. Chr.)',
            // Tour hint
            tour_hint: 'Klicke auf die Marker auf der Karte für Details & Wikipedia-Links',
            // Welcome overlay
            welcome_subtitle: 'INTERAKTIVE WELTKARTE',
            welcome_feat_1: 'Echtzeit-Erdbeben & Vulkane',
            welcome_feat_2: 'Live-Flüge & Satellitenbahnen',
            welcome_feat_3: 'Geopolitik, Konflikte & Allianzen',
            welcome_feat_4: 'Nuklearstandorte & Strahlengeschichte',
            welcome_start_tour: 'GEFÜHRTE TOUR STARTEN', welcome_explore: 'FREI ERKUNDEN',
            welcome_dont_show: 'Nicht mehr anzeigen',
            welcome_footer: 'Kein Login · Keine Werbung · 100% kostenlos & Open Source · Für Schüler & Lehrer',
            // Feedback widget
            fb_title: 'FEEDBACK', fb_rate: 'Wie bewerten Sie GEOPULSE?',
            fb_enjoy: 'Was gefällt Ihnen am besten?', fb_wish: 'Feature-Wunsch (optional)',
            fb_comment: 'Noch etwas? (optional)', fb_submit: 'FEEDBACK SENDEN',
            fb_bug: 'Fehler melden (GitHub)', fb_footer: 'Feedback geht an ein Google-Formular — kein Login nötig.'
        }
    };

    let currentLang = localStorage.getItem('geopulseLang') || 'en';

    const setLanguage = (lang) => {
        currentLang = lang;
        localStorage.setItem('geopulseLang', lang);
        document.getElementById('app-root')?.setAttribute('lang', lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        const dict = i18n[lang] || i18n.en;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) el.textContent = dict[key];
        });
    };

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Apply saved language on load
    setLanguage(currentLang);

    const toggles = {
        terminator: false, fires: false, weather: false, borders: false,
        flights: false, iss: false, starlink: false, earthquakes: false, webcams: false,
        nightlights: false, population: false, satellites: false, temperature: false,
        volcanoes: false, radiation: false, internet: false, power: false,
        cables: false, datacenters: false, nuclear: false, conflicts: false, regimes: false, blocs: false, aiAtlas: false
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
            disablePolling: ['flights', 'iss', 'earthquakes']
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
            layers: ['flights', 'cables', 'conflicts', 'regimes', 'nukes'],
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
            layers: ['nukes', 'radiation', 'conflicts', 'blocs', 'flights', 'satellites'],
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
                <p>${eventData.what || ''}</p>
                <h3>ASSESSMENT</h3>
                <p>${eventData.why || ''}</p>
                
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
            // Open the scenarios section (contains tours) and scroll to it
            const scenarioSection = document.getElementById('sec-scenarios');
            if (scenarioSection) {
                scenarioSection.classList.add('open');
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

        // ── FLIGHTS (ADSB.lol — free, keyless real-time ADS-B data) ──────
        try {
            map.addSource('flights-src', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
            map.addLayer({ id: 'flights-layer', type: 'circle', source: 'flights-src', layout: { visibility: 'none' }, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 4, 5, 6, 10, 9], 'circle-color': '#00d4ff', 'circle-opacity': 0.85, 'circle-stroke-width': 1.2, 'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.4 } });

            // Click handler for flights
            map.on('click', 'flights-layer', (e) => {
                const p = e.features[0].properties;
                const coords = e.features[0].geometry.coordinates;
                new maplibregl.Popup({ offset: 6, maxWidth: '260px' })
                    .setLngLat(coords)
                    .setHTML(`<div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;">
                        <h3 style="color:#00d4ff;margin:0 0 5px;font-size:.75rem;border-bottom:1px solid rgba(0,212,255,0.2);padding-bottom:4px;">✈️ ${escHtml(p.callsign || (currentLang==='de'?'UNBEKANNT':'UNKNOWN'))}</h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:4px;">
                            <div style="background:rgba(0,212,255,.05);padding:3px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'TYP':'TYPE'}</div><div style="color:#00d4ff;font-size:.65rem;">${escHtml(p.type || 'N/A')}</div></div>
                            <div style="background:rgba(0,212,255,.05);padding:3px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">REG</div><div style="font-size:.65rem;">${escHtml(p.reg || 'N/A')}</div></div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;">
                            <div style="background:rgba(0,212,255,.05);padding:3px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'HÖHE':'ALTITUDE'}</div><div style="color:#00d4ff;">${p.alt ? Number(p.alt).toLocaleString() + ' ft' : 'N/A'}</div></div>
                            <div style="background:rgba(0,212,255,.05);padding:3px 6px;border-radius:2px;"><div style="opacity:.4;font-size:.5rem;">${currentLang==='de'?'GESCHW.':'SPEED'}</div><div style="color:#00d4ff;">${p.gs ? Math.round(Number(p.gs) * 1.852) + ' km/h' : 'N/A'}</div></div>
                        </div>
                        <div style="opacity:.3;font-size:.45rem;margin-top:5px;letter-spacing:1px;">VIA ADSB.LOL · LIVE ADS-B</div>
                    </div>`)
                    .addTo(map);
            });
            map.on('mouseenter', 'flights-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', 'flights-layer', () => { map.getCanvas().style.cursor = ''; });
            const fetchFlights = async () => {
                if (!toggles.flights) return;
                try {
                    // ADSB.lol: free, no key required, real ADS-B data
                    const center = map.getCenter();
                    const result = await window.reliableFetch(
                        `https://api.adsb.lol/v2/lat/${center.lat.toFixed(2)}/lon/${center.lng.toFixed(2)}/dist/250`,
                        'flights', { timeout: 15000, mode: 'cors' }
                    );
                    const aircraft = result.data?.ac || [];
                    const features = aircraft
                        .filter(a => a.lat && a.lon && a.alt_baro !== 'ground')
                        .slice(0, 300)
                        .map(a => ({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: [a.lon, a.lat] },
                            properties: {
                                callsign: (a.flight || '').trim(),
                                type: a.t || '',
                                reg: a.r || '',
                                alt: a.alt_baro || 0,
                                gs: a.gs || 0
                            }
                        }));
                    if (features.length > 0) {
                        if (_tourActive) return; // Block flight updates during tours
                        map.getSource('flights-src')?.setData({ type: 'FeatureCollection', features });
                        updateLayerStatus('flights', 'LIVE', `${features.length} aircraft`);
                    } else {
                        updateLayerStatus('flights', 'STATIC', 'No aircraft in view');
                    }
                } catch(err) {
                    console.warn('[FLIGHTS] ADSB.lol fetch failed:', err.message);
                    updateLayerStatus('flights', 'OFFLINE', 'API unavailable');
                }
            };
            window._fetchFlights = fetchFlights;
            setInterval(fetchFlights, 15000);
        } catch(e) { console.warn('[FLIGHTS] Init failed:', e.message); }

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

        // ── POPULATION DENSITY (NASA GIBS SEDAC GPW v4) ──────────────
        try {
            const popDateStr = getYesterdaysDateForGIBS();
            map.addSource('population-src', {
                type: 'raster',
                tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SEDAC_POP_2000-2005-01-01T00:00:00Z/default/' + popDateStr + '/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png'],
                tileSize: 256
            });
            map.addLayer({ id: 'population-layer', type: 'raster', source: 'population-src', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.55 } });
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
                return `<div style="padding:4px 0;border-bottom:1px solid rgba(255,100,0,.15);font-size:.65rem;">
                    <div style="color:#ff9955;">${icon} ${escHtml(name.length > 28 ? name.slice(0,27)+'…' : name)}</div>
                    <div style="display:flex;justify-content:space-between;margin-top:2px;">
                        <span style="opacity:.55;">${escHtml(rocket)}</span>
                        ${countdown}
                    </div>
                    ${pad ? `<div style="opacity:.35;font-size:.58rem;">${escHtml(pad)}</div>` : ''}
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
            name: 'Iran — Israel Shadow War', lat: 32.5, lon: 43.5, severity: 'CRITICAL',
            type: 'Regional Proxy / Direct Military Clash', since: 2019,
            parties: [['🇮🇱 Israel (IDF/Mossad)', 'Strikes, assassinations, sabotage'], ['🇮🇷 Iran (IRGC)', 'Proxies + direct strikes']],
            support: 'Israel: US backing, F-35s, Iron Dome. Iran: Hezbollah, Hamas, Houthis, PMF Iraq.',
            casualties: 'Hundreds killed in strikes/assassinations; April 2024: first direct Iran-Israel exchange',
            displaced: 'N/A — shadow war, no mass displacement',
            status: 'ACTIVE — Ongoing covert war; direct missile/drone exchanges Apr+Oct 2024',
            note: 'Iran fired 300+ drones/missiles at Israel Apr 13-14, 2024. Israel retaliated Oct 26, 2024. Proxy network: Hezbollah, Hamas, Houthis, Iraqi PMF.'
        },
        {
            name: 'Iran — USA Tensions', lat: 26.0, lon: 56.0, severity: 'HIGH',
            type: 'Geopolitical / Military Confrontation', since: 2019,
            parties: [['🇺🇸 USA (CENTCOM)', 'Carrier groups, airbases, sanctions'], ['🇮🇷 Iran (IRGC)', 'Proxy attacks, nuclear program, tanker seizures']],
            support: 'USA: Israel, Gulf states (KSA, UAE, Bahrain). Iran: Russia, China (limited).',
            casualties: 'Jan 2024: Jordan base attack killed 3 US soldiers. 160+ US strikes on Iran proxies in Iraq/Syria.',
            displaced: 'N/A',
            status: 'HIGH TENSION — Naval confrontations, proxy strikes, nuclear standoff',
            note: 'Maximum pressure campaign (Trump 2018/2025). IRGC-backed PMF targeting US forces 160+ times since Oct 2023. Strait of Hormuz flashpoint: 20% of global oil.'
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
                        { label: 'View Power Infrastructure', layerId: 'power' },
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

    document.getElementById('toggle-flights')?.addEventListener('change', (e) => {
        toggles.flights = e.target.checked;
        if (map.getLayer('flights-layer')) map.setLayoutProperty('flights-layer', 'visibility', toggles.flights ? 'visible' : 'none');
        if (toggles.flights && window._fetchFlights) window._fetchFlights();
    });
    
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
        if (map.getLayer('population-layer'))
            map.setLayoutProperty('population-layer', 'visibility', toggles.population ? 'visible' : 'none');
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

    // ── NUCLEAR ARSENAL TOGGLE (nukes) ────────────────────
    document.getElementById('toggle-nukes')?.addEventListener('change', (e) => {
        toggles.nukes = e.target.checked;
        if (toggles.nukes && nukeArsenalMarkers.length === 0 && nuclearMarkers.length === 0) initNuclearLayer();
        nukeArsenalMarkers.forEach(m => toggles.nukes ? m.addTo(map) : m.remove());
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
                if (sidePanel.style.maxHeight === '90vh') {
                    sidePanel.style.maxHeight = '42px';
                } else {
                    sidePanel.style.maxHeight = '90vh';
                    sidePanel.style.overflowY = 'auto';
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
                    text: 'Welcome to GEOPULSE! Right now, seismic sensors around the world are streaming earthquake data to this map. Toggle "Earthquakes" in the sidebar to see today\'s seismic activity — each circle is a real event detected by USGS in the last 24 hours. You can also track live flights, wildfires, and the ISS orbit.',
                    text_de: 'Willkommen bei GEOPULSE! Gerade jetzt streamen seismische Sensoren weltweit Erdbebendaten auf diese Karte. Schalten Sie "Erdbeben" in der Seitenleiste ein, um die heutige Aktivität zu sehen — jeder Kreis ist ein reales Ereignis der letzten 24 Stunden. Sie können auch Flüge, Waldbrände und die ISS-Umlaufbahn live verfolgen.',
                    layers: []
                },
                {
                    center: [-77.04, 38.9], zoom: 4,
                    title: '🏛️ GUIDED TOURS — LEARN BY EXPLORING',
                    title_de: '🏛️ GEFÜHRTE TOUREN — LERNEN DURCH ENTDECKEN',
                    text: 'GEOPULSE offers 17 guided tours on geopolitics, history, and the environment. Each tour flies you to key locations with expert briefings and Wikipedia references. Try the "Trump World Tour" to trace U.S. foreign policy across 9 countries — or explore nuclear history, the Cold War, and climate change.',
                    text_de: 'GEOPULSE bietet 17 geführte Touren zu Geopolitik, Geschichte und Umwelt. Jede Tour fliegt Sie zu Schlüsselorten mit Expertenbriefings und Wikipedia-Referenzen. Probieren Sie die "Trump Welttour" mit 9 Ländern — oder erkunden Sie Nukleargeschichte, den Kalten Krieg und Klimawandel.',
                    layers: []
                },
                {
                    center: [20, 20], zoom: 2,
                    title: '🗺️ YOUR COMMAND CENTER — 20+ LAYERS',
                    title_de: '🗺️ IHRE KOMMANDOZENTRALE — 20+ EBENEN',
                    text: 'Open the sidebar (top-right) to access 20+ data layers: political regimes, military alliances, conflict zones, submarine cables, nuclear sites, and more. Combine layers to discover patterns — like how conflict zones overlap with resource routes. This is your global intelligence dashboard. Start exploring!',
                    text_de: 'Öffnen Sie die Seitenleiste (oben rechts) für 20+ Datenebenen: Regierungsformen, Militärbündnisse, Konfliktzonen, Seekabel, Atomstandorte und mehr. Kombinieren Sie Ebenen, um Muster zu entdecken — etwa wie Konfliktzonen sich mit Ressourcenrouten überschneiden. Dies ist Ihr globales Nachrichtenzentrum. Viel Spaß beim Erkunden!',
                    layers: []
                }
            ]
        },
        ringoffire: {
            name: 'Ring of Fire',
            steps: [
                {
                    center: [140, 35], zoom: 4, title: '\ud83c\udf0b MOUNT FUJI \u2014 JAPAN',
                    text: 'Japan sits on the Pacific Ring of Fire \u2014 a 40,000km horseshoe of seismic and volcanic activity. Mount Fuji (3,776m) last erupted in 1707 and is monitored 24/7. Japan experiences ~1,500 earthquakes per year.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [110, -7.5], zoom: 5, title: '\ud83c\udf0b KRAKATOA & MERAPI \u2014 INDONESIA',
                    text: 'Indonesia has 130+ active volcanoes \u2014 the most of any country. Krakatoa\'s 1883 eruption was heard 5,000km away and caused a global temperature drop. The child volcano, Anak Krakatau, triggered a tsunami in 2018.',
                    layers: ['earthquakes', 'volcanoes'],
                    image: { wiki: 'Krakatoa', caption: 'Anak Krakatau erupting' }
                },
                {
                    center: [-122, 46.2], zoom: 5, title: '\ud83c\udf0b CASCADES RANGE \u2014 USA',
                    text: 'The Cascade Range stretches from BC to California. Mount St. Helens\' 1980 eruption killed 57 and was the deadliest in US history. Mount Rainier is considered the most dangerous due to lahar risk threatening 3M+ residents near Tacoma and Seattle.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [-78, -1], zoom: 4, title: '\ud83c\udf0b ANDES VOLCANOES \u2014 SOUTH AMERICA',
                    text: 'The Andes chain hosts Earth\'s highest active volcanoes. Cotopaxi (5,897m) in Ecuador is one of the world\'s most dangerous. Nevado del Ruiz in Colombia killed 23,000 people in 1985 when lahars buried the town of Armero.',
                    layers: ['earthquakes', 'volcanoes']
                },
                {
                    center: [-20, 64], zoom: 5, title: '\ud83c\udf0b ICELAND \u2014 MID-ATLANTIC RIDGE',
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
                    center: [142.37, 38.32], zoom: 5, title: '🌊 TŌHOKU EARTHQUAKE — JAPAN, 2011',
                    text: 'On March 11, 2011, a magnitude 9.1 earthquake struck off the Pacific coast of Japan — the 4th most powerful ever recorded. The resulting tsunami reached heights of 40 meters and traveled up to 10 km inland. 19,759 people died, 6,242 were injured, and 2,553 remain missing. The tsunami triggered the Fukushima Daiichi nuclear disaster (INES Level 7). Japan\'s earthquake early warning system gave just 8–30 seconds of notice. Economic damage: $235 billion — the costliest natural disaster in history.',
                    layers: ['earthquakes', 'volcanoes'],
                    image: { wiki: '2011_Tōhoku_earthquake_and_tsunami', caption: 'Tsunami wave hitting Miyako, 2011' },
                    video: 'oWzdgBNfhQU'
                },
                {
                    center: [80.2, 7.0], zoom: 4, title: '🌊 INDIAN OCEAN TSUNAMI — 2004',
                    text: 'On December 26, 2004, a magnitude 9.1 earthquake off Sumatra triggered the deadliest tsunami in recorded history. Waves up to 30 meters struck 14 countries across the Indian Ocean. Death toll: 227,898 people across Indonesia (170,000), Sri Lanka (35,000), India (16,000), and Thailand (8,000). The tsunami traveled at 800 km/h — the speed of a jet aircraft. There was no tsunami warning system in the Indian Ocean at the time. One was installed by 2006.',
                    layers: ['earthquakes'],
                    image: { wiki: '2004_Indian_Ocean_earthquake_and_tsunami', caption: 'Tsunami waves striking the coast of Thailand, 2004' },
                    video: 'LI3lHgRq5bU'
                },
                {
                    center: [-72.3, 18.5], zoom: 7, title: '💔 HAITI EARTHQUAKE — 2010',
                    text: 'On January 12, 2010, a magnitude 7.0 earthquake struck just 25 km from Port-au-Prince, Haiti\'s capital. The earthquake killed an estimated 220,000–316,000 people, injured 300,000, and left 1.5 million homeless — in a country that was already the poorest in the Western Hemisphere. 250,000 homes and 30,000 commercial buildings collapsed. International aid exceeded $13 billion, but reconstruction was plagued by mismanagement. The earthquake exposed catastrophic building code failures.',
                    layers: ['earthquakes'],
                    image: { wiki: '2010_Haiti_earthquake', caption: 'Devastation in Port-au-Prince, 2010' }
                },
                {
                    center: [36.2, 37.2], zoom: 5, title: '💔 TURKEY-SYRIA EARTHQUAKE — 2023',
                    text: 'On February 6, 2023, two massive earthquakes (M7.8 and M7.7) struck southeastern Turkey and northern Syria within 9 hours. Death toll: 59,259 (Turkey: 50,783, Syria: 8,476). Over 120,000 were injured. 14 million people were affected across both countries. The quake was felt in Egypt, 1,500 km away. In Turkey, 520,000+ buildings were damaged or destroyed — many due to corrupt construction practices that ignored building codes. It was Turkey\'s deadliest natural disaster in modern history.',
                    layers: ['earthquakes'],
                    image: { wiki: '2023_Turkey–Syria_earthquake', caption: 'Collapsed buildings in Hatay, Turkey, 2023' }
                },
                {
                    center: [14.43, 40.82], zoom: 7, title: '🌋 VESUVIUS — POMPEII, 79 AD',
                    text: 'On August 24, 79 AD, Mount Vesuvius erupted with a force estimated at VEI-5, burying the Roman cities of Pompeii and Herculaneum under 4–6 meters of volcanic ash and pumice. An estimated 16,000 people died from pyroclastic flows reaching 700°C and moving at 100 km/h. The cities were preserved in extraordinary detail — frozen in time for 1,700 years until their rediscovery in 1748. Today, 3 million people live in the danger zone around Vesuvius. It is considered one of the most dangerous volcanoes on Earth.',
                    layers: ['volcanoes'],
                    image: { wiki: 'Eruption_of_Mount_Vesuvius_in_79_AD', caption: 'The Destruction of Pompeii and Herculaneum by John Martin' },
                    video: 'dY_3ggKg0Bc'
                },
                {
                    center: [105.42, -6.10], zoom: 6, title: '🌋 KRAKATOA — INDONESIA, 1883',
                    text: 'On August 27, 1883, Krakatoa erupted in one of the most violent volcanic events in recorded history (VEI-6). The explosion was heard 4,800 km away in Australia — the loudest sound in modern history. It produced tsunamis up to 30 meters high, killing 36,417 people. The eruption ejected 25 km³ of rock and ash, causing global temperatures to drop by 1.2°C for 5 years. Vivid red sunsets were observed worldwide for months. The child volcano, Anak Krakatau, emerged in 1927 and caused a deadly tsunami in 2018.',
                    layers: ['volcanoes', 'earthquakes'],
                    image: { wiki: '1883_eruption_of_Krakatoa', caption: 'Lithograph of the 1883 Krakatoa eruption' },
                    video: 'fMaONzGdCYY'
                },
                {
                    center: [118.0, -8.4], zoom: 6, title: '🌋 TAMBORA — THE YEAR WITHOUT A SUMMER, 1815',
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
                    video: 'X6yTWJBG_Ys'
                },
                {
                    center: [13.38, 52.52], zoom: 7, title: '✊ BERLIN 1936 — PROPAGANDA & DEFIANCE',
                    text: 'Adolf Hitler intended the 1936 Berlin Olympics to showcase Aryan supremacy. Instead, African-American athlete Jesse Owens won 4 gold medals, defying Nazi racial ideology before 100,000 spectators. Participants: 3,963 athletes from 49 nations. Sports: 19. These were the first Games to be televised (to 162,000 viewers). The Olympic torch relay was introduced here — designed by Hitler\'s regime as propaganda. Jewish athletes were banned from the German team. Several nations debated boycotting but ultimately attended.',
                    layers: [],
                    image: { wiki: '1936_Summer_Olympics', caption: 'Jesse Owens at the Berlin Olympics, 1936' },
                    video: 'oQIhGqCWb58'
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
                    video: 'fSSMfBcEZv0'
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
                    video: 'JsDY1Ha83M8'
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
                    video: 'VkfEUr0g3uw'
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
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 10, 4, 16, 8, 24],
                'circle-color': 'rgba(255, 176, 0, 0.0)',
                'circle-stroke-color': 'rgba(255, 176, 0, 0.25)',
                'circle-stroke-width': 1.5,
                'circle-blur': 0.5
            }
        });

        // Active tour core dot (amber)
        map.addLayer({
            id: 'tour-active-core',
            type: 'circle',
            source: 'tour-active-src',
            paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3, 4, 4, 8, 6],
                'circle-color': 'rgba(255, 176, 0, 0.45)',
                'circle-stroke-color': 'rgba(255, 176, 0, 0.2)',
                'circle-stroke-width': 0.5
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
            'cables-layer', 'flights-layer',
            'earthquakes-core', 'earthquakes-ring',
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
    // Unknown voices get a baseline score from heuristic rules.
    const VOICE_SCORES_EN = {
        // Microsoft Edge Neural voices (best on Windows)
        'microsoft jenny': 95, 'microsoft aria': 94, 'microsoft guy': 93,
        'microsoft ryan': 92, 'microsoft sara': 91,
        // Google Chrome voices
        'google us english': 85, 'google uk english female': 84,
        'google uk english male': 83,
        // Apple macOS / iOS
        'samantha': 80, 'alex': 78, 'karen': 77, 'daniel': 76,
        // Fallback heuristic keywords
        'neural': 70, 'natural': 70, 'enhanced': 65, 'premium': 65,
        'online': 60
    };
    const VOICE_SCORES_DE = {
        'microsoft katja': 95, 'microsoft conrad': 94,
        'microsoft stefan': 93,
        'google deutsch': 85,
        'anna': 80, 'petra': 78, 'markus': 77,
        'neural': 70, 'natural': 70, 'enhanced': 65, 'premium': 65,
        'online': 60
    };

    function scoreVoice(voice, lang) {
        const scores = (lang === 'de') ? VOICE_SCORES_DE : VOICE_SCORES_EN;
        const nameLower = voice.name.toLowerCase();

        // Check exact known voices first
        for (const [key, score] of Object.entries(scores)) {
            if (key.length > 10 && nameLower.includes(key)) return score;
        }
        // Then check keyword matches
        for (const [key, score] of Object.entries(scores)) {
            if (key.length <= 10 && nameLower.includes(key)) return score;
        }
        // Prefer non-local voices (cloud/remote tend to be higher quality)
        if (!voice.localService) return 50;
        return 30;
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
        console.log(`[NARRATION] Selected voice: "${best.name}" (${best.lang}, score: ${scoreVoice(best, lang)}, local: ${best.localService})`);
        return best;
    }

    // Preload voices (Chrome loads them async)
    if (window.speechSynthesis) {
        speechSynthesis.onvoiceschanged = () => { _voiceCache = {}; };
        speechSynthesis.getVoices();
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
    // Sentences heavy with numbers/statistics get read slightly slower
    function getSentenceRate(sentence) {
        const baseRate = 0.92;
        const numCount = (sentence.match(/\d[\d,.]+/g) || []).length;
        const hasPercent = /%/.test(sentence);
        const hasCurrency = /\$|€|£|billion|million|trillion/i.test(sentence);
        const isShort = sentence.length < 60;

        let rate = baseRate;
        // Slow down for data-heavy sentences
        if (numCount >= 3) rate -= 0.06;
        else if (numCount >= 1) rate -= 0.03;
        if (hasPercent || hasCurrency) rate -= 0.02;
        // Slightly faster for short transitional sentences
        if (isShort && numCount === 0) rate += 0.03;

        return Math.max(0.78, Math.min(0.98, rate));
    }

    // ── Breathing Pause Calculator ──
    // Longer pauses after complex sentences, shorter after simple ones
    function getBreathingPause(sentence) {
        const base = 350;
        const isLong = sentence.length > 150;
        const endsQuestion = sentence.endsWith('?');
        const endsDramatic = /—[^—]*$/.test(sentence) || sentence.endsWith('...');

        if (isLong) return base + 120;
        if (endsDramatic) return base + 80;
        if (endsQuestion) return base + 50;
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

        // Split into sentences
        const sentences = splitSentences(text);
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
        utter.pitch = 0.95;  // Slightly lower — warm, authoritative documentary tone
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

        // Hide the global tour-sites glow (only show current tour's amber stops)
        setTourSitesGlowVisible(false);

        activeTour = tour;
        activeTourId = tourId;
        tourStepIndex = 0;
        showTourStep();
        const nm = getTourName(tour).toUpperCase();
        setStatus(currentLang === 'de' ? 'GEFÜHRTE TOUR: ' + nm + ' GESTARTET' : 'GUIDED TOUR: ' + nm + ' INITIATED');
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

        // Stop any ongoing narration
        stopNarration();

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

        // Fly to location — mid speed, cinematic
        // Zoom boost: push in closer for richer satellite detail at historic sites
        // Overview/world steps (zoom ≤ 2.5) are untouched; others get +3, capped at 14
        const baseZoom = step.zoom;
        const boostedZoom = baseZoom <= 2.5 ? baseZoom : Math.min(baseZoom + 3, 14);
        map.flyTo({
            center: step.center,
            zoom: boostedZoom,
            duration: 5500,
            essential: true,
            curve: 1.5,
            pitch: boostedZoom >= 8 ? 35 : 0,
            bearing: 0
        });

        // Show briefing AFTER flight completes
        map.once('moveend', () => {
            tourPanel.classList.remove('flying');
            const stepTitle = getTourTitle(step);
            const stepText = getTourText(step);
            tourTitle.textContent = stepTitle;
            tourText.textContent = stepText;
            tourCounter.textContent = (currentLang === 'de' ? 'STOPP ' : 'STOP ') + (tourStepIndex + 1) + (currentLang === 'de' ? ' VON ' : ' OF ') + activeTour.steps.length;

            // Load Wikipedia thumbnail image if available
            const imgContainer = document.getElementById('tour-briefing-image');
            if (imgContainer) {
                imgContainer.innerHTML = '';
                imgContainer.classList.add('hidden');
                if (step.image && step.image.wiki) {
                    fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(step.image.wiki))
                        .then(r => r.json())
                        .then(data => {
                            if (data.thumbnail && data.thumbnail.source) {
                                const img = document.createElement('img');
                                img.src = data.thumbnail.source;
                                img.alt = step.image.caption || step.title;
                                img.loading = 'lazy';
                                const cap = document.createElement('div');
                                cap.className = 'tour-image-caption';
                                cap.textContent = step.image.caption || '';
                                imgContainer.appendChild(img);
                                imgContainer.appendChild(cap);
                                imgContainer.classList.remove('hidden');
                            }
                        })
                        .catch(() => {}); // Silent fail — image is optional enrichment
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
                    const wrapper = document.createElement('div');
                    wrapper.className = 'tour-video-wrapper';
                    const iframe = document.createElement('iframe');
                    iframe.src = 'https://www.youtube-nocookie.com/embed/' + step.video + '?rel=0&modestbranding=1&playsinline=1';
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('loading', 'lazy');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('width', '280');
                    iframe.setAttribute('height', '158');
                    iframe.title = stepTitle;
                    wrapper.appendChild(iframe);
                    vidContainer.appendChild(badge);
                    vidContainer.appendChild(wrapper);
                    vidContainer.classList.remove('hidden');
                }
            }

            tourPanel.classList.remove('hidden');

            // Auto-narrate if enabled
            const narrateActive = document.getElementById('tour-narrate');
            if (narrateActive && narrateActive.classList.contains('active')) {
                speakText(stepText);
            }

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
        });
    }

    function endTour() {
        activeTour = null;
        activeTourId = null;
        tourStepIndex = 0;
        if (tourPanel) tourPanel.classList.add('hidden');
        stopNarration();
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

}); // end DOMContentLoaded
