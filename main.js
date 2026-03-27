document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize MapLibre GL JS v4 with Globe and ESRI Satellites
    const map = new maplibregl.Map({
        container: 'map',
        style: {
            version: 8,
            sources: {
                'esri-satellite': {
                    type: 'raster',
                    tiles: [
                        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    ],
                    tileSize: 256,
                    attribution: '&copy; Esri &mdash; Source: Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EAP'
                }
            },
            layers: [{
                id: 'base-map',
                type: 'raster',
                source: 'esri-satellite',
                minzoom: 0,
                maxzoom: 22
            }]
        },
        center: [15.0, 48.0],
        zoom: 2, // Zoomed out farther so you can see the globe shape
        pitch: 0, 
        bearing: 0,
        projection: { type: 'globe' }, // Native MapLibre 3D Globe Projection
        dragRotate: true,
        dragPan: true,
        scrollZoom: true
    });

    // Add navigation UI to the map
    map.addControl(new maplibregl.NavigationControl(), 'top-left');

    const statusText = document.getElementById("status-text");
    const setStatus = (msg) => { statusText.innerText = msg; };

    // State & Layers
    let issMarker = null;
    let flightMarkers = [];
    let shipMarkers = [];
    let webcamMarkers = [];
    
    // Store toggle states
    const toggles = {
        iss: true,
        earthquakes: true,
        flights: true,
        ships: true,
        weather: true,
        webcams: true
    };

    map.on('load', () => {
        setStatus("SATELLITE DOWNLINK ESTABLISHED. INITIALIZING FEEDS.");

        // Setup Earthquake geojson source & layers
        map.addSource('earthquakes', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        map.addLayer({
            id: 'earthquakes-core',
            type: 'circle',
            source: 'earthquakes',
            paint: {
                'circle-radius': ['*', ['get', 'mag'], 2.5],
                'circle-color': '#ffb000',
                'circle-opacity': 0.8
            }
        });

        map.addLayer({
            id: 'earthquakes-halo',
            type: 'circle',
            source: 'earthquakes',
            paint: {
                'circle-radius': ['*', ['get', 'mag'], 6],
                'circle-color': 'transparent',
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ffb000',
                'circle-stroke-opacity': 0.6
            }
        });

        // Initialize Feeds
        fetchWeather();
        fetchISS();
        setInterval(fetchISS, 5000);
        fetchEarthquakes();
        fetchFlights();
        setInterval(fetchFlights, 60000);
        initGhostFleet();
        initWebcams();
    });

    // ----------------------------------------------------
    // API: Weather Radar (RainViewer)
    // ----------------------------------------------------
    const fetchWeather = async () => {
        try {
            const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const data = await res.json();
            const latestTime = data.radar.past[data.radar.past.length - 1].path;
            
            map.addLayer({
                id: 'weather-radar',
                type: 'raster',
                source: {
                    type: 'raster',
                    tiles: [`https://tilecache.rainviewer.com${latestTime}/256/{z}/{x}/{y}/2/1_1.png`],
                    tileSize: 256
                },
                paint: {
                    'raster-opacity': 0.65
                }
            }, 'earthquakes-core');
            
            if(!toggles.weather) {
                map.setLayoutProperty('weather-radar', 'visibility', 'none');
            }
        } catch(err) {}
    };

    // ----------------------------------------------------
    // API: ISS Tracker
    // ----------------------------------------------------
    const issSvg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="#ffb000" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="#ffb000"/>
    </svg>`;

    const fetchISS = async () => {
        try {
            const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
            const data = await response.json();
            const { latitude, longitude, velocity, altitude } = data;

            if (!issMarker) {
                const el = document.createElement('div');
                el.className = 'marker-iss';
                el.innerHTML = issSvg;
                
                issMarker = new maplibregl.Marker({ element: el })
                    .setLngLat([longitude, latitude])
                    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
                        <h3>ORBITAL: ISS</h3>
                        <p>ALT: ${altitude.toFixed(0)} KM</p>
                        <p>VEL: ${velocity.toFixed(0)} KM/H</p>
                    `));
                if (toggles.iss) issMarker.addTo(map);
            } else {
                issMarker.setLngLat([longitude, latitude]);
                issMarker.getPopup().setHTML(`
                    <h3>ORBITAL: ISS</h3>
                    <p>ALT: ${altitude.toFixed(0)} KM</p>
                    <p>VEL: ${velocity.toFixed(0)} KM/H</p>
                `);
            }
        } catch (error) {}
    };

    // ----------------------------------------------------
    // API: Earthquakes
    // ----------------------------------------------------
    const fetchEarthquakes = async () => {
        setStatus("FETCHING SEISMIC DATA...");
        try {
            const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
            const data = await response.json();
            const geojson = {
                type: 'FeatureCollection',
                features: data.features.map(f => ({
                    type: 'Feature',
                    geometry: f.geometry,
                    properties: { ...f.properties, time: new Date(f.properties.time).toLocaleTimeString() }
                }))
            };
            map.getSource('earthquakes').setData(geojson);
            map.on('click', 'earthquakes-core', (e) => {
                const p = e.features[0].properties;
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <h3>SEISMIC EVENT</h3>
                        <p>MAG: ${p.mag}</p>
                        <p>LOC: ${p.place.toUpperCase()}</p>
                        <p>TIME: ${p.time}</p>
                    `).addTo(map);
            });
            map.on('mouseenter', 'earthquakes-core', () => map.getCanvas().style.cursor = 'pointer');
            map.on('mouseleave', 'earthquakes-core', () => map.getCanvas().style.cursor = '');
            setStatus("SEISMIC DATA LOADED.");
        } catch (error) {}
    };

    // ----------------------------------------------------
    // API: Live Flights
    // ----------------------------------------------------
    const planeSvg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z"/>
    </svg>`;

    const fetchFlights = async () => {
        setStatus("SCANNING AIRSPACE...");
        try {
            const response = await fetch('https://opensky-network.org/api/states/all?lamin=40.0&lomin=-10.0&lamax=60.0&lomax=30.0');
            if(!response.ok) throw new Error("API Limit");
            const data = await response.json();
            flightMarkers.forEach(m => m.remove());
            flightMarkers = [];
            if (!data.states) return;
            const planes = data.states.slice(0, 150);
            planes.forEach(plane => {
                const [_, callsign, __, ___, ____, lon, lat, _____, ______, velocity, true_track, _______, ________, altitude] = plane;
                if (lat && lon) {
                    const el = document.createElement('div');
                    el.className = 'marker-flight';
                    el.innerHTML = planeSvg;
                    const marker = new maplibregl.Marker({ element: el, rotation: true_track, rotationAlignment: 'map', pitchAlignment: 'map' })
                        .setLngLat([lon, lat])
                        .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML(`
                            <h3>FLIGHT: ${callsign ? callsign.trim() : 'UNK'}</h3>
                            <p>ALT: ${altitude ? Math.round(altitude) + ' M' : 'N/A'}</p>
                            <p>SPD: ${velocity ? Math.round(velocity * 3.6) + ' KM/H' : 'N/A'}</p>
                        `));
                    flightMarkers.push(marker);
                    if (toggles.flights) marker.addTo(map);
                }
            });
            setStatus("AIRSPACE DATA LOADED.");
        } catch (error) { setStatus("FLIGHT DATA LIMITED/ERROR."); }
    };

    // ----------------------------------------------------
    // MOCK: Marine AIS (Ghost Fleet)
    // ----------------------------------------------------
    const shipSvg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 4H9L3 10V20H21V10L15 4ZM11 6H13V8H11V6ZM19 18H5V11L9.5 6L14.5 6L19 11V18Z"/>
    </svg>`;

    const fleetData = [
        { name: 'USS GERALD R. FORD', type: 'naval', cls: 'Aircraft Carrier', lat: 34.5, lon: 18.2, hdg: 45, spd: 0.00008 },
        { name: 'USS TEXAS', type: 'naval', cls: 'Submarine', lat: 36.1, lon: -5.4, hdg: 90, spd: 0.00005 },
        { name: 'EVER GIVEN', type: 'cargo', cls: 'Container Ship', lat: 31.5, lon: 32.5, hdg: 10, spd: 0.00006 },
        { name: 'MSC OSCAR', type: 'cargo', cls: 'Container Ship', lat: 48.8, lon: -6.5, hdg: 210, spd: 0.00007 },
        { name: 'HMS QUEEN ELIZABETH', type: 'naval', cls: 'Aircraft Carrier', lat: 51.5, lon: 1.5, hdg: 30, spd: 0.00009 },
        { name: 'MAERSK MC-KINNEY', type: 'cargo', cls: 'Container Ship', lat: 38.0, lon: 12.0, hdg: 300, spd: 0.00006 },
        { name: 'UNKNOWN CONTACT', type: 'naval', cls: 'Frigate (Est)', lat: 55.0, lon: 3.5, hdg: 180, spd: 0.00010 },
        { name: 'HAPAG-LLOYD', type: 'cargo', cls: 'Container Ship', lat: 43.2, lon: 5.3, hdg: 270, spd: 0.00008 },
        { name: 'FS CHARLES DE GAULLE', type: 'naval', cls: 'Aircraft Carrier', lat: 41.5, lon: 6.2, hdg: 110, spd: 0.00007 },
        { name: 'COSCO SHIPPING', type: 'cargo', cls: 'Bulk Carrier', lat: 36.8, lon: -1.2, hdg: 75, spd: 0.00005 }
    ];

    const initGhostFleet = () => {
        fleetData.forEach(ship => {
            const el = document.createElement('div');
            el.className = `marker-ship ship-${ship.type}`;
            el.innerHTML = shipSvg;
            
            const marker = new maplibregl.Marker({ 
                element: el, 
                rotation: ship.hdg,
                rotationAlignment: 'map',
                pitchAlignment: 'map'
            })
            .setLngLat([ship.lon, ship.lat])
            .setPopup(new maplibregl.Popup({ offset: 15 }).setHTML(`
                <h3><i class="${ship.type === 'naval' ? 'fa-solid fa-crosshairs' : 'fa-solid fa-box'}"></i> ${ship.name}</h3>
                <p>CLASS: ${ship.cls.toUpperCase()}</p>
                <p>HDG: ${ship.hdg}&deg; TRUE</p>
                <p>SPD: ${(ship.spd * 200000).toFixed(1)} KTS</p>
            `));
            
            ship.marker = marker;
            if (toggles.ships) marker.addTo(map);
            shipMarkers.push(ship);
        });

        const animateShips = () => {
            shipMarkers.forEach(s => {
                s.lat += Math.cos(s.hdg * Math.PI / 180) * s.spd;
                s.lon += Math.sin(s.hdg * Math.PI / 180) * s.spd;
                s.marker.setLngLat([s.lon, s.lat]);
            });
            requestAnimationFrame(animateShips);
        }
        requestAnimationFrame(animateShips);
    };

    // ----------------------------------------------------
    // API: Live Webcams
    // ----------------------------------------------------
    const webcamData = [
        { name: 'Venice Grand Canal', code: 'ph1vpnYm4To', lat: 45.4383, lon: 12.3364 },
        { name: 'Eiffel Tower, Paris', code: 'hZf1O-lPjQk', lat: 48.8584, lon: 2.2945 },
        { name: 'Shibuya Crossing, Tokyo', code: 'HpdO5Kq3o7Y', lat: 35.6595, lon: 139.7005 },
        { name: 'Times Square, NYC', code: '1-iS7LmhJZg', lat: 40.7580, lon: -73.9855 },
        { name: 'Amsterdam / Dam Square', code: 'sL2C5YnI170', lat: 52.3729, lon: 4.8936 }
    ];

    const initWebcams = () => {
        webcamData.forEach(cam => {
            const el = document.createElement('div');
            el.className = 'marker-webcam';
            el.innerHTML = '<i class="fa-solid fa-camera-security"></i>';
            
            // Generate Iframe Dynamically to preserve system memory until clicked
            const popup = new maplibregl.Popup({ offset: 15, closeOnClick: true, maxWidth: '320px' });
            
            popup.on('open', () => {
                popup.setHTML(`
                    <h3><i class="fa-solid fa-camera"></i> ${cam.name}</h3>
                    <iframe width="300" height="170" src="https://www.youtube.com/embed/${cam.code}?autoplay=1&mute=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                `);
            });
            popup.on('close', () => {
                popup.setHTML(`<h3><i class="fa-solid fa-camera"></i> ${cam.name}</h3><p>Loading downlink stream...</p>`);
            });
            
            // Set initial HTML
            popup.setHTML(`<h3><i class="fa-solid fa-camera"></i> ${cam.name}</h3><p>Loading downlink stream...</p>`);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([cam.lon, cam.lat])
                .setPopup(popup);

            if (toggles.webcams) marker.addTo(map);
            webcamMarkers.push(marker);
        });
    }

    // ----------------------------------------------------
    // UI Toggles
    // ----------------------------------------------------
    document.getElementById('toggle-iss').addEventListener('change', (e) => {
        toggles.iss = e.target.checked;
        if (issMarker) toggles.iss ? issMarker.addTo(map) : issMarker.remove();
    });

    document.getElementById('toggle-earthquakes').addEventListener('change', (e) => {
        toggles.earthquakes = e.target.checked;
        const visibility = toggles.earthquakes ? 'visible' : 'none';
        if (map.getLayer('earthquakes-core')) {
            map.setLayoutProperty('earthquakes-core', 'visibility', visibility);
            map.setLayoutProperty('earthquakes-halo', 'visibility', visibility);
        }
    });

    document.getElementById('toggle-flights').addEventListener('change', (e) => {
        toggles.flights = e.target.checked;
        flightMarkers.forEach(m => toggles.flights ? m.addTo(map) : m.remove());
    });

    document.getElementById('toggle-weather').addEventListener('change', (e) => {
        toggles.weather = e.target.checked;
        if (map.getLayer('weather-radar')) {
            map.setLayoutProperty('weather-radar', 'visibility', toggles.weather ? 'visible' : 'none');
        }
    });

    document.getElementById('toggle-ships').addEventListener('change', (e) => {
        toggles.ships = e.target.checked;
        shipMarkers.forEach(s => toggles.ships ? s.marker.addTo(map) : s.marker.remove());
    });

    document.getElementById('toggle-webcams').addEventListener('change', (e) => {
        toggles.webcams = e.target.checked;
        webcamMarkers.forEach(s => toggles.webcams ? s.addTo(map) : s.remove());
    });

    setInterval(() => {
        if(statusText.innerText.includes("UPDATED") || statusText.innerText.includes("LOADED") || statusText.innerText.includes("ESTABLISHED")) {
            setStatus("SYSTEM NOMINAL // RECEIVING UPLINK");
        }
    }, 5000);
});
