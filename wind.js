/**
 * ═══════════════════════════════════════════════════════════════════════
 * GEOPULSE — WIND PARTICLE LAYER (wind.js)
 * ═══════════════════════════════════════════════════════════════════════
 * Animated global wind visualization using Canvas2D particle system.
 * Data: Open-Meteo Forecast API (free, no key required)
 * Pattern: earth.nullschool.net-inspired flowing particles
 *
 * Usage: Include this script after main.js. Call window.initWindLayer(map)
 * from inside the map 'load' callback, or the module will auto-detect the
 * map via a MutationObserver fallback.
 *
 * Toggle: checkbox with id="toggle-wind"
 * Status: window.setStatus(), window.updateLayerStatus()
 *
 * Performance targets:
 *   Desktop: 3000–5000 particles @ 60 fps
 *   Mobile:  1000–2000 particles @ 60 fps
 * ═══════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    // ─── CONFIGURATION ──────────────────────────────────────────────────
    const CONFIG = {
        // Grid resolution: 5° intervals → 72 lon × 36 lat = 2,592 points
        GRID_STEP: 5,
        LAT_MIN: -85,
        LAT_MAX: 85,
        LON_MIN: -180,
        LON_MAX: 175,

        // Particle counts
        PARTICLES_DESKTOP: 4000,
        PARTICLES_MOBILE: 1500,

        // Particle behavior
        PARTICLE_MIN_AGE: 40,
        PARTICLE_MAX_AGE: 120,
        PARTICLE_LINE_WIDTH: 0.8,
        PARTICLE_SPEED_SCALE: 0.0012,   // scale factor: wind m/s → degrees/frame
        PARTICLE_TRAIL_LENGTH: 6,       // number of trail segments
        FADE_FILL_ALPHA: 0.92,          // canvas fade per frame (lower = longer trails)

        // Data refresh interval (ms)
        DATA_REFRESH_INTERVAL: 30 * 60 * 1000,  // 30 minutes

        // API batching: Open-Meteo allows ~60-80 params per request.
        // We batch lat/lon pairs into groups to avoid URL length limits.
        API_BATCH_SIZE: 50,             // locations per API call
        API_REQUEST_DELAY: 120,         // ms delay between batch requests

        // Color thresholds (wind speed in m/s)
        SPEED_SLOW: 3,      // < 3 m/s → dim teal
        SPEED_MEDIUM: 8,    // 3–8 m/s → cyan
        SPEED_FAST: 18,     // 8–18 m/s → bright white-cyan
        SPEED_JET: 55,      // 55+ m/s (~200 km/h) → amber
    };

    // ─── COLOR PALETTE (GeoPulse dark tactical) ─────────────────────────
    const COLORS = {
        SLOW:   { r: 0,   g: 180, b: 220, a: 0.30 },  // dim teal
        MEDIUM: { r: 0,   g: 212, b: 255, a: 0.60 },  // cyan
        FAST:   { r: 180, g: 240, b: 255, a: 0.90 },  // bright white-cyan
        JET:    { r: 255, g: 200, b: 100, a: 1.00 },  // amber highlight
    };

    // ─── STATE ──────────────────────────────────────────────────────────
    let map = null;
    let canvas = null;
    let ctx = null;
    let particles = [];
    let windGrid = null;          // { u[][], v[][], lats[], lons[], nlat, nlon }
    let animFrameId = null;
    let isActive = false;
    let isDataLoaded = false;
    let isFetching = false;
    let refreshTimer = null;
    let isMobile = false;
    let lastBounds = null;

    // ─── UTILITY ────────────────────────────────────────────────────────

    function detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || (window.innerWidth <= 768);
    }

    function getLang() {
        return document.documentElement.lang || 'en';
    }

    function status(msg) {
        if (window.setStatus) window.setStatus(msg);
    }

    function layerStatus(state, info) {
        if (window.updateLayerStatus) window.updateLayerStatus('wind', state, info);
    }

    /** Linearly interpolate between two values */
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /** Clamp a value between min and max */
    function clamp(v, min, max) {
        return v < min ? min : v > max ? max : v;
    }

    /** Get wind color based on speed (m/s) — returns CSS rgba string */
    function windColor(speed) {
        let c;
        if (speed < CONFIG.SPEED_SLOW) {
            const t = speed / CONFIG.SPEED_SLOW;
            c = COLORS.SLOW;
            return `rgba(${c.r},${c.g},${c.b},${lerp(0.10, c.a, t)})`;
        } else if (speed < CONFIG.SPEED_MEDIUM) {
            const t = (speed - CONFIG.SPEED_SLOW) / (CONFIG.SPEED_MEDIUM - CONFIG.SPEED_SLOW);
            return `rgba(${Math.round(lerp(COLORS.SLOW.r, COLORS.MEDIUM.r, t))},${Math.round(lerp(COLORS.SLOW.g, COLORS.MEDIUM.g, t))},${Math.round(lerp(COLORS.SLOW.b, COLORS.MEDIUM.b, t))},${lerp(COLORS.SLOW.a, COLORS.MEDIUM.a, t).toFixed(2)})`;
        } else if (speed < CONFIG.SPEED_FAST) {
            const t = (speed - CONFIG.SPEED_MEDIUM) / (CONFIG.SPEED_FAST - CONFIG.SPEED_MEDIUM);
            return `rgba(${Math.round(lerp(COLORS.MEDIUM.r, COLORS.FAST.r, t))},${Math.round(lerp(COLORS.MEDIUM.g, COLORS.FAST.g, t))},${Math.round(lerp(COLORS.MEDIUM.b, COLORS.FAST.b, t))},${lerp(COLORS.MEDIUM.a, COLORS.FAST.a, t).toFixed(2)})`;
        } else {
            const t = clamp((speed - CONFIG.SPEED_FAST) / (CONFIG.SPEED_JET - CONFIG.SPEED_FAST), 0, 1);
            return `rgba(${Math.round(lerp(COLORS.FAST.r, COLORS.JET.r, t))},${Math.round(lerp(COLORS.FAST.g, COLORS.JET.g, t))},${Math.round(lerp(COLORS.FAST.b, COLORS.JET.b, t))},${lerp(COLORS.FAST.a, COLORS.JET.a, t).toFixed(2)})`;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // WIND GRID DATA — Fetch & Process
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Build the grid coordinate arrays.
     * Returns { lats: number[], lons: number[] }
     */
    function buildGridCoords() {
        const lats = [];
        const lons = [];
        for (let lat = CONFIG.LAT_MAX; lat >= CONFIG.LAT_MIN; lat -= CONFIG.GRID_STEP) {
            lats.push(lat);
        }
        for (let lon = CONFIG.LON_MIN; lon <= CONFIG.LON_MAX; lon += CONFIG.GRID_STEP) {
            lons.push(lon);
        }
        return { lats, lons };
    }

    /**
     * Fetch wind data from Open-Meteo.
     * Uses the bulk/multi-location endpoint by batching coordinate pairs.
     * Returns a 2D grid of {u, v} components (m/s) indexed as [latIdx][lonIdx].
     */
    async function fetchWindData() {
        if (isFetching) return windGrid;
        isFetching = true;

        const lang = getLang();
        status(lang === 'de' ? 'WINDDATEN WERDEN GELADEN…' : 'FETCHING WIND DATA…');

        const { lats, lons } = buildGridCoords();
        const nlat = lats.length;
        const nlon = lons.length;

        // Pre-allocate grids
        const uGrid = Array.from({ length: nlat }, () => new Float32Array(nlon));
        const vGrid = Array.from({ length: nlat }, () => new Float32Array(nlon));

        // Build list of all grid points with their indices
        const points = [];
        for (let i = 0; i < nlat; i++) {
            for (let j = 0; j < nlon; j++) {
                points.push({ lat: lats[i], lon: lons[j], i, j });
            }
        }

        // Batch the requests
        const batches = [];
        for (let b = 0; b < points.length; b += CONFIG.API_BATCH_SIZE) {
            batches.push(points.slice(b, b + CONFIG.API_BATCH_SIZE));
        }

        let completed = 0;
        let failed = 0;

        for (const batch of batches) {
            try {
                // Open-Meteo supports comma-separated lat/lon for multi-location
                const latStr = batch.map(p => p.lat).join(',');
                const lonStr = batch.map(p => p.lon).join(',');

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lonStr}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms&timezone=auto`;

                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);

                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                // Open-Meteo returns an array for multi-location queries
                const results = Array.isArray(data) ? data : [data];

                for (let k = 0; k < results.length && k < batch.length; k++) {
                    const r = results[k];
                    const p = batch[k];
                    if (r && r.current) {
                        const speed = r.current.wind_speed_10m || 0;        // m/s
                        const dir = r.current.wind_direction_10m || 0;     // degrees (where wind comes FROM)
                        // Convert meteorological direction to u,v components
                        // Meteorological convention: direction = where wind COMES FROM
                        // u = -speed * sin(dir), v = -speed * cos(dir)
                        const dirRad = (dir * Math.PI) / 180;
                        uGrid[p.i][p.j] = -speed * Math.sin(dirRad);
                        vGrid[p.i][p.j] = -speed * Math.cos(dirRad);
                    }
                }
                completed += batch.length;
            } catch (err) {
                console.warn('[WIND] Batch fetch failed:', err.message);
                failed += batch.length;
            }

            // Rate-limiting delay between batches
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.API_REQUEST_DELAY));
            }

            // Progress update (every 10 batches)
            if (completed % (CONFIG.API_BATCH_SIZE * 10) === 0) {
                const pct = Math.round((completed / points.length) * 100);
                status(lang === 'de' ? `WINDDATEN: ${pct}%` : `WIND DATA: ${pct}%`);
            }
        }

        windGrid = { u: uGrid, v: vGrid, lats, lons, nlat, nlon };
        isDataLoaded = true;
        isFetching = false;

        const totalPoints = points.length;
        const successRate = Math.round(((totalPoints - failed) / totalPoints) * 100);

        if (failed > totalPoints * 0.5) {
            layerStatus('ERROR', `Only ${successRate}% data received`);
            status(lang === 'de' ? 'WIND: DATENFEHLER — TEILWEISE GELADEN' : 'WIND: DATA ERROR — PARTIALLY LOADED');
        } else {
            layerStatus('LIVE', 'Open-Meteo');
            status(lang === 'de'
                ? `WIND: ${totalPoints - failed} DATENPUNKTE GELADEN`
                : `WIND: ${totalPoints - failed} DATA POINTS LOADED`);
        }

        console.log(`[WIND] Grid loaded: ${nlat}×${nlon} = ${totalPoints} points, ${failed} failed (${successRate}% success)`);
        return windGrid;
    }

    // ═══════════════════════════════════════════════════════════════════
    // WIND INTERPOLATION — Bilinear on grid
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Interpolate wind vector (u, v) at a given geographic coordinate
     * using bilinear interpolation on the regular lat/lon grid.
     * @param {number} lng - Longitude (-180..180)
     * @param {number} lat - Latitude (-90..90)
     * @returns {{ u: number, v: number, speed: number }} interpolated wind
     */
    function interpolateWind(lng, lat) {
        if (!windGrid) return { u: 0, v: 0, speed: 0 };

        const { u, v, lats, lons, nlat, nlon } = windGrid;

        // Grid runs from LAT_MAX (index 0) down to LAT_MIN (index nlat-1)
        // and from LON_MIN (index 0) to LON_MAX (index nlon-1)
        const latIdx = (CONFIG.LAT_MAX - lat) / CONFIG.GRID_STEP;
        const lonIdx = (lng - CONFIG.LON_MIN) / CONFIG.GRID_STEP;

        // Clamp to valid grid range
        const i0 = clamp(Math.floor(latIdx), 0, nlat - 2);
        const j0 = clamp(Math.floor(lonIdx), 0, nlon - 2);
        const i1 = i0 + 1;
        const j1 = j0 + 1;

        const fi = clamp(latIdx - i0, 0, 1);
        const fj = clamp(lonIdx - j0, 0, 1);

        // Bilinear interpolation
        const wu = lerp(
            lerp(u[i0][j0], u[i0][j1], fj),
            lerp(u[i1][j0], u[i1][j1], fj),
            fi
        );
        const wv = lerp(
            lerp(v[i0][j0], v[i0][j1], fj),
            lerp(v[i1][j0], v[i1][j1], fj),
            fi
        );

        return { u: wu, v: wv, speed: Math.sqrt(wu * wu + wv * wv) };
    }

    // ═══════════════════════════════════════════════════════════════════
    // CANVAS OVERLAY — Creation & Sync
    // ═══════════════════════════════════════════════════════════════════

    function createCanvas() {
        if (canvas) return;

        canvas = document.createElement('canvas');
        canvas.id = 'wind-canvas';
        canvas.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'pointer-events: none',
            'z-index: 5',
            'mix-blend-mode: screen',
            'opacity: 0',
            'transition: opacity 0.6s ease',
        ].join(';');

        // Insert into the map container so it overlays the map
        const mapContainer = map.getContainer();
        mapContainer.appendChild(canvas);

        ctx = canvas.getContext('2d', { willReadFrequently: false });

        resizeCanvas();
    }

    function resizeCanvas() {
        if (!canvas || !map) return;
        const container = map.getContainer();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);  // cap at 2x for perf
        const w = container.clientWidth;
        const h = container.clientHeight;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Reset particles when canvas size changes significantly
        if (particles.length > 0) {
            resetParticles();
        }
    }

    function showCanvas() {
        if (canvas) canvas.style.opacity = '1';
    }

    function hideCanvas() {
        if (canvas) canvas.style.opacity = '0';
    }

    // ═══════════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    function getParticleCount() {
        return isMobile ? CONFIG.PARTICLES_MOBILE : CONFIG.PARTICLES_DESKTOP;
    }

    /**
     * Create a single particle at a random position within the current map bounds.
     */
    function createParticle() {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Slight padding beyond visible bounds to avoid edge pop-in
        const lngRange = ne.lng - sw.lng;
        const latRange = ne.lat - sw.lat;
        const pad = 0.05;

        const lng = sw.lng - lngRange * pad + Math.random() * lngRange * (1 + 2 * pad);
        const lat = sw.lat - latRange * pad + Math.random() * latRange * (1 + 2 * pad);

        return {
            lng: lng,
            lat: clamp(lat, -85, 85),
            age: Math.floor(Math.random() * CONFIG.PARTICLE_MAX_AGE),  // stagger ages
            maxAge: CONFIG.PARTICLE_MIN_AGE + Math.floor(Math.random() * (CONFIG.PARTICLE_MAX_AGE - CONFIG.PARTICLE_MIN_AGE)),
            trail: [],     // array of {x, y} screen positions for trail rendering
        };
    }

    function resetParticles() {
        const count = getParticleCount();
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(createParticle());
        }
    }

    function respawnParticle(p) {
        const newP = createParticle();
        p.lng = newP.lng;
        p.lat = newP.lat;
        p.age = 0;
        p.maxAge = newP.maxAge;
        p.trail = [];
    }

    // ═══════════════════════════════════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════════════════════════════════

    function animate() {
        if (!isActive || !ctx || !isDataLoaded || !map) {
            animFrameId = null;
            return;
        }

        const container = map.getContainer();
        const w = container.clientWidth;
        const h = container.clientHeight;

        // Fade previous frame to create trails
        ctx.fillStyle = `rgba(0, 3, 8, ${1 - CONFIG.FADE_FILL_ALPHA})`;
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.FADE_FILL_ALPHA})`;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';

        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Zoom-dependent speed scaling: particles move more at low zoom, less at high zoom
        const zoom = map.getZoom();
        const zoomScale = Math.pow(2, zoom) * CONFIG.PARTICLE_SPEED_SCALE;

        // Line width scales slightly with zoom
        const lineWidth = CONFIG.PARTICLE_LINE_WIDTH * clamp(0.5 + zoom * 0.1, 0.5, 2.0);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Interpolate wind at particle position
            const wind = interpolateWind(p.lng, p.lat);

            // Project current position to screen
            const screenPos = map.project([p.lng, p.lat]);
            const x = screenPos.x;
            const y = screenPos.y;

            // Store trail point
            p.trail.push({ x, y });
            if (p.trail.length > CONFIG.PARTICLE_TRAIL_LENGTH) {
                p.trail.shift();
            }

            // Draw trail
            if (p.trail.length >= 2) {
                const ageFade = 1 - (p.age / p.maxAge);       // fade as particle ages
                const color = windColor(wind.speed);

                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth * ageFade;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Draw smooth trail
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (let t = 1; t < p.trail.length; t++) {
                    ctx.lineTo(p.trail[t].x, p.trail[t].y);
                }
                ctx.stroke();
            }

            // Move particle along wind vector
            // u = east-west component (positive = eastward)
            // v = north-south component (positive = northward)
            // Convert m/s to approximate degrees per frame
            const latFactor = 1.0;
            const lonFactor = 1.0 / Math.max(Math.cos(p.lat * Math.PI / 180), 0.01);

            p.lng += wind.u * CONFIG.PARTICLE_SPEED_SCALE * lonFactor;
            p.lat += wind.v * CONFIG.PARTICLE_SPEED_SCALE * latFactor;

            // Age the particle
            p.age++;

            // Respawn if: too old, out of bounds, or if there's no wind (stuck)
            const outOfBounds = p.lng < sw.lng - 20 || p.lng > ne.lng + 20
                             || p.lat < sw.lat - 20 || p.lat > ne.lat + 20
                             || p.lat < -85 || p.lat > 85;

            if (p.age >= p.maxAge || outOfBounds) {
                respawnParticle(p);
            }
        }

        // Reset composite for next frame's fade
        ctx.globalCompositeOperation = 'source-over';

        animFrameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (animFrameId) return;
        animFrameId = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MAP SYNCHRONIZATION
    // ═══════════════════════════════════════════════════════════════════

    function onMapMove() {
        // Clear trails during movement to prevent smearing
        if (ctx && canvas && isActive) {
            const container = map.getContainer();
            ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
            // Reset all trails (positions are stale after projection change)
            for (let i = 0; i < particles.length; i++) {
                particles[i].trail = [];
            }
        }
    }

    function onMapMoveEnd() {
        if (isActive && isDataLoaded) {
            // After map stops moving, respawn some particles in new viewport area
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.lng < sw.lng - 5 || p.lng > ne.lng + 5 ||
                    p.lat < sw.lat - 5 || p.lat > ne.lat + 5) {
                    respawnParticle(p);
                }
            }
        }
    }

    function onMapResize() {
        resizeCanvas();
    }

    function bindMapEvents() {
        map.on('move', onMapMove);
        map.on('moveend', onMapMoveEnd);
        map.on('resize', onMapResize);

        // Handle window resize for canvas dimensions
        window.addEventListener('resize', onMapResize);
    }

    function unbindMapEvents() {
        if (!map) return;
        map.off('move', onMapMove);
        map.off('moveend', onMapMoveEnd);
        map.off('resize', onMapResize);
        window.removeEventListener('resize', onMapResize);
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API — Activate / Deactivate
    // ═══════════════════════════════════════════════════════════════════

    async function activate() {
        if (isActive) return;
        isActive = true;

        const lang = getLang();
        status(lang === 'de' ? 'WIND-LAYER WIRD AKTIVIERT…' : 'ACTIVATING WIND LAYER…');

        createCanvas();
        bindMapEvents();

        // Fetch data if not already loaded
        if (!isDataLoaded) {
            try {
                await fetchWindData();
            } catch (err) {
                console.error('[WIND] Failed to fetch wind data:', err);
                layerStatus('ERROR', err.message);
                status(lang === 'de' ? 'WIND: DATENFEHLER' : 'WIND: DATA ERROR');
                isActive = false;
                return;
            }
        }

        resetParticles();
        showCanvas();
        startAnimation();

        // Schedule periodic data refresh
        if (!refreshTimer) {
            refreshTimer = setInterval(async () => {
                if (!isActive) return;
                try {
                    await fetchWindData();
                    console.log('[WIND] Data refreshed');
                } catch (err) {
                    console.warn('[WIND] Refresh failed:', err.message);
                }
            }, CONFIG.DATA_REFRESH_INTERVAL);
        }

        console.log(`[WIND] Activated with ${particles.length} particles`);
    }

    function deactivate() {
        if (!isActive) return;
        isActive = false;

        stopAnimation();
        hideCanvas();
        unbindMapEvents();

        // Clear the canvas
        if (ctx && canvas) {
            const container = map.getContainer();
            ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
        }

        // Stop refresh timer
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }

        const lang = getLang();
        status(lang === 'de' ? 'WIND-LAYER DEAKTIVIERT' : 'WIND LAYER DEACTIVATED');
        console.log('[WIND] Deactivated');
    }

    // ═══════════════════════════════════════════════════════════════════
    // TOGGLE SETUP
    // ═══════════════════════════════════════════════════════════════════

    function setupToggle() {
        const checkbox = document.getElementById('toggle-wind');
        if (!checkbox) {
            console.warn('[WIND] Toggle checkbox #toggle-wind not found in DOM');
            return;
        }

        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activate();
            } else {
                deactivate();
            }
        });

        console.log('[WIND] Toggle listener attached to #toggle-wind');
    }

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Initialize the wind layer with a MapLibre GL map instance.
     * @param {maplibregl.Map} mapInstance
     */
    function initWindLayer(mapInstance) {
        if (!mapInstance) {
            console.error('[WIND] initWindLayer called without a map instance');
            return;
        }

        if (map) {
            console.warn('[WIND] Already initialized — ignoring duplicate init call');
            return;
        }

        map = mapInstance;
        isMobile = detectMobile();

        console.log(`[WIND] Initializing (mobile: ${isMobile}, particles: ${getParticleCount()})`);

        // Register layer metadata if config system exists
        if (window.GeopulseConfig && window.GeopulseConfig.LAYER_METADATA) {
            window.GeopulseConfig.LAYER_METADATA['wind'] = {
                id: 'wind',
                name: 'Wind Particles',
                status: 'STATIC',
                source: 'Open-Meteo',
                reliabilityScore: 92
            };
        }

        setupToggle();

        const lang = getLang();
        status(lang === 'de' ? 'WIND-MODUL BEREIT' : 'WIND MODULE READY');
    }

    // Expose globally
    window.initWindLayer = initWindLayer;

    // ─── AUTO-INIT FALLBACK ─────────────────────────────────────────────
    // If the main.js doesn't call initWindLayer explicitly, try to hook in
    // once the map container is available.
    // This observer watches for the maplibregl canvas to appear and then
    // finds the map instance.
    (function autoInit() {
        // If already initialized (e.g., main.js called initWindLayer), skip.
        if (map) return;

        // Check on DOMContentLoaded / load
        const tryInit = () => {
            if (map) return; // Already initialized by explicit call

            // Look for a MapLibre GL map on the page
            const mapContainer = document.getElementById('map');
            if (!mapContainer) return;

            // MapLibre stores the map reference on the container element
            // via internal properties. Since we can't access that reliably,
            // we just wait for initWindLayer() to be called by main.js.
            // But set up the toggle handler in advance.
            setupToggle();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInit);
        } else {
            setTimeout(tryInit, 500);
        }
    })();

})();
