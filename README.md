# 🌍 GEOPULSE — Live World Intelligence Map

**Free, real-time educational world map combining satellite imagery, geopolitical data, and live intelligence feeds into one interactive dashboard. By RB Design 2026.**

![Version](https://img.shields.io/badge/version-2.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-GitHub%20Pages-orange)
![Cost](https://img.shields.io/badge/cost-%240%2Fmonth-brightgreen)

## 🚀 Live Demo

**➡️ [Launch GEOPULSE](https://geopulseworld.com/)**

> 🌐 *Now live at **geopulseworld.com***

> *10,000+ lines of code · 22+ data layers · 40 guided tours · GeoQuiz · Zero API keys · Zero cost*

## Features

| Category | Layers |
|----------|--------|
| **🛰️ Real-Time Tracking** | ISS Tracker, Earthquakes (USGS), NASA Wildfires, Day/Night Terminator, Live Webcams |
| **🌐 Geopolitics** | Regime Types, Alliances & Blocs, Active Conflicts, Undersea Cables, Nuclear Plants, Nuclear Arsenal |
| **🌋 Environment & Space** | Ocean Temperature, Surface Temperature, Population Density, Volcanoes, Radiation Sites, Starlink, Weather Radar, Aurora Forecast, Fireballs |

### Key Capabilities

- **🧠 GeoQuiz** — 26 bilingual map-integrated questions across 4 categories with 3 difficulty tiers (Explorer/Analyst/Commander)
- **🔍 Smart Search** — Fuzzy search across all tours and layers (EN + DE), Ctrl+K shortcut
- **Now 40 Guided Tours!** — Cinematic educational tours across 5 categories: Geopolitics, History, Society & Rights, Science & Nature, Sports & Culture
- **Cinematic Camera** — Each tour stop approaches from a unique angle with orbital drift
- **Typewriter Text** — Briefing text reveals character-by-character for a decoded-intel feel
- **Ken Burns Effect** — Wikipedia thumbnails slowly pan & zoom like a documentary
- **Story Progress Bar** — Amber gradient bar fills as you advance through tour stops
- **Bilingual Interface** — Full English/German (EN/DE) toggle with persistent preference
- **Audio Narration** — Text-to-speech in English and German with smart voice picker
- **Wikipedia Integration** — Click markers for detailed context with direct Wikipedia links
- **Mobile-First** — Full touch support with swipeable panels and responsive layout
- **Scenario Presets** — One-click educational presets (Taiwan, Red Sea, Europe Energy, Nuclear Risk)
- **Welcome Overlay** — First-visit onboarding with demo tour launcher for students

## Tech Stack

| Component | Technology |
|-----------|------------|
| Map Engine | [MapLibre GL JS](https://maplibre.org/) V4 |
| Satellite Imagery | Esri World Imagery |
| Architecture | Vanilla JavaScript (no frameworks, no bundlers) |
| Hosting | GitHub Pages (static, free) |
| Audio | Web Audio API (procedural) + Web Speech API |
| Data Sources | USGS, NASA FIRMS/GIBS, NOAA, foto-webcam.eu, WhereTheISS, Wikipedia |

> 📋 See [TECH_SPEC.md](TECH_SPEC.md) for the full technical specification, complexity analysis, and API inventory.

## Getting Started

### Run Locally

```bash
# Clone the repository
git clone https://github.com/rblaschke-lab/geopulse.git
cd geopulse

# Start a local server (any of these work)
python -m http.server 8080
# or
npx -y http-server . -p 8080

# Open in browser
open http://localhost:8080
```

> **Zero API keys required.** All data sources are free and keyless. No `npm install`, no build step.

## Deployment

This project is designed for **GitHub Pages** — no build step required.

1. Push to `master` branch
2. Go to **Settings → Pages → Source → Deploy from branch**
3. Select `master` / `/ (root)` → Save
4. Your site is live!

## Security

- **Content Security Policy (CSP)** blocks unauthorized script execution
- **No backend, no auth, no cookies** — pure static client-side app
- **All external data is HTML-escaped** before DOM insertion
- **No user data collected** — GDPR-compliant by design
- See [SECURITY.md](SECURITY.md) for responsible disclosure

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-layer`)
3. Commit your changes (`git commit -m 'Add amazing layer'`)
4. Push to the branch (`git push origin feature/amazing-layer`)
5. Open a Pull Request

## License

This project is open source under the [MIT License](LICENSE).

---

**GEOPULSE V1.5.4** — Built with 🛰️ by RB Design 2026
