# 🌐 Worldview V8.7 — Global Command Center

A real-time global intelligence dashboard built with MapLibre GL JS.

## Key Features (V8.7 Update)
- **Artemis II Keplerian Engine**: High-fidelity orbital physics simulator based on the April 2026 launch trajectory.
- **USGS Seismic & Tsunami Int**: Direct PTWC Tsunami-warnings parsing for earthquakes > 6.0.
- **Authentic Geo-Political OSINT**: Hardcoded military surveillance tracking of the Ukraine frontline, Iran/Middle East, and Taiwan Strait.
- **100+ Live Ships**: Highly dense global maritime traffic layer prioritizing military logistics in the Strait of Hormuz.
- **Terminal UI & Mobile HUD**: Cinematic QA aesthetics with phosphor glows, glass-morphism, and full 9:16 portrait mode support.

## Live Data Sources

| Layer | Source |
|---|---|
| 🗺️ Satellite Base Map | Esri World Imagery |
| 🌑 Night Lights | NASA VIIRS / GIBS |
| 🌡️ Surface Temperature | NASA MERRA-2 / GIBS |
| 👥 Population Density | Built-in heatmap (GPW v4 data) |
| 🔥 Active Wildfires | NASA FIRMS |
| 🌦️ Weather Radar | OpenWeatherMap |
| 🛸 ISS Tracker | WhereTheISS API + NASA TV |
| 🌋 Active Volcanoes | Smithsonian GVP |
| ☢️ Radiation Hotspots | Safecast / IAEA |
| ⚔️ Conflict Zones | Geopolitical Hotspots Tracker (Built-in) |
| 🌊 Tsunami Warning | USGS Seismic Data (Real-time PTWC flags) |
| 🌕 Artemis Tracker | Deep Space Orbital Simulator |
| 🌐 Internet Outages | IODA / Georgia Tech |
| 🚀 Launch Tracker | Launch Library 2 |

## Tech Stack

- **MapLibre GL JS** v4.7 (3D Globe)
- Vanilla HTML5 / CSS / JavaScript
- Zero backend — all client-side

## Usage

Open `index.html` via a local server (e.g. `npx serve .` or VS Code Live Server).

---

*by RB_Design 2026*
