# GEOPULSE — Technical Specification

> **Version:** V1.5.5 · **Updated:** May 7, 2026  
> **Repository:** [github.com/rblaschke-lab/geopulse](https://github.com/rblaschke-lab/geopulse)  
> **Live:** [geopulse.is-a.dev](https://geopulse.is-a.dev)  
> **License:** MIT · Free & Open Source

---

## 1. Project Overview

GEOPULSE is an interactive geospatial intelligence platform built for education. It combines real-time data feeds, satellite imagery, and 25 guided tours into a single-page web application. Designed for students, teachers, and the curious.

**Key metrics:**

| Metric | Value |
|---|---|
| Total code lines | **12,026** |
| Total files | **26** (15 code + 11 assets) |
| Total codebase | **783 KB** (no minification, raw source) |
| Repository size | **9.2 MB** (incl. images) |
| Git commits | **156** |
| AI conversations | **29** sessions |
| Development period | Mar 27 – May 7, 2026 (~6 weeks) |
| Data layers | **24** toggleable overlays |
| Guided tours | **25** across 7 categories |
| External API calls | **0 API keys required** |
| Monthly hosting cost | **$0** (GitHub Pages) |
| Estimated AI tokens | **~8–12M** total (see Section 11) |

---

## 2. Technology Stack

### 2.1 Languages

| Language | Files | Lines | Purpose |
|---|---|---|---|
| **JavaScript** (ES2020+) | 4 | 5,634 | Core logic, map interaction, tours, audio, particles |
| **CSS3** | 1 | 2,051 | Full design system, animations, responsive layout |
| **HTML5** | 5 | 3,706 | Pages (index, about, manual, changelog, impressum) |
| **Markdown** | 4 | 635 | Documentation (README, SECURITY, TECH_SPEC, QA) |

**No build tools, no transpilers, no bundlers.** Raw browser-native code.

### 2.2 Frontend Framework

| Component | Technology | Version |
|---|---|---|
| Map engine | [MapLibre GL JS](https://maplibre.org/) | 4.x (via CDN) |
| Map tiles | Esri World Imagery (satellite) | REST API |
| Icons | Font Awesome | 6.x (via CDN) |
| Typography | Google Fonts (Share Tech Mono, Outfit, Inter) | — |
| Audio | Web Audio API (procedural synthesis) | Native |
| Speech | Web Speech API (SpeechSynthesis) | Native |
| Storage | LocalStorage (preferences, language, counter) | Native |

### 2.3 Backend & Hosting

| Component | Technology |
|---|---|
| Hosting | GitHub Pages (static, free) |
| CDN | GitHub's built-in CDN |
| CI/CD | Git push → auto-deploy |
| Database | None (stateless) |
| Server-side code | None (100% client-side) |
| Authentication | None (no login required) |

### 2.4 Data Format Standards

| Format | Usage |
|---|---|
| **GeoJSON** | Earthquake feed, cable routes, tour stop coordinates |
| **JSON** | API responses (ISS, weather, Kp-index, launches, Wikipedia) |
| **XML/RSS** | BBC World News feed (converted via rss2json) |
| **WMTS** | NASA GIBS tiles (temperature, population, fires, SST) |
| **WMS** | RainViewer weather radar tiles |

---

## 3. File Structure

```
geopulse/
├── index.html          769 lines    Main application (SPA)
├── about.html        1,229 lines    Feature showcase & tech stack
├── manual.html         467 lines    User documentation
├── changelog.html      838 lines    Version history timeline
├── impressum.html      403 lines    Legal compliance (§5 DDG)
├── main.js           5,176 lines    Core application logic
├── tours_de.js         349 lines    German tour translations
├── config.js            43 lines    Global configuration & layer metadata
├── fetchWrapper.js      66 lines    Resilient HTTP fetch with retry/cache
├── style.css         2,051 lines    Complete design system
├── TECH_SPEC.md        380 lines    Technical specification (this file)
├── README.md           102 lines    Project overview
├── SECURITY.md         187 lines    Security audit documentation
├── qa-audit.md          22 lines    Quality assurance notes
├── LICENSE              17 lines    MIT License
├── .gitignore           24 lines    Git ignore rules
└── *.png             11 files       OG previews, social cards, tour banners
```

### 3.1 Architecture Pattern

**Single-Page Application (SPA)** — no router, no framework. The `index.html` loads the map, all UI panels are DOM elements toggled via CSS classes. State is managed through a simple `toggles` object and `currentLang` variable.

```
┌─────────────────────────────────────────────────────┐
│                   index.html                        │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Sidebar │  │   Map    │  │  Tour Briefing    │  │
│  │ Toggles │  │ MapLibre │  │  Panel + Progress │  │
│  │ Accordion│  │ GL JS   │  │  Bar              │  │
│  └─────────┘  └──────────┘  └───────────────────┘  │
│  ┌─────────────────────────────────────────────┐    │
│  │         Bottom: Quick Links + Clock         │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  config.js → Global settings, layer metadata        │
│  fetchWrapper.js → Retry logic, timeout, caching    │
│  main.js → All application logic (monolith)         │
│  tours_de.js → German translations for tour content │
│  style.css → Full visual design system              │
└─────────────────────────────────────────────────────┘
```

---

## 4. External API Inventory

All APIs are **free, keyless, and public**. Zero cost, zero credentials.

| API | Endpoint | Data | Update Freq |
|---|---|---|---|
| USGS Earthquake | earthquake.usgs.gov | Live seismic events M2.5+ | 5 min |
| NASA FIRMS | firms.modaps.eosdis.nasa.gov | Active wildfire hotspots | 3 hrs |
| NASA GIBS (WMTS) | gibs.earthdata.nasa.gov | SST, surface temp, population | Daily |
| WhereTheISS | api.wheretheiss.at | ISS latitude/longitude/speed | 5 sec |
| NOAA SWPC | services.swpc.noaa.gov | Planetary K-index (solar storms) | 15 min |
| RainViewer | api.rainviewer.com | Global weather radar composites | 10 min |
| Wikipedia REST | en.wikipedia.org/api/rest_v1 | Tour stop thumbnails & summaries | On demand |
| Launch Library 2 | ll.thespacedevs.com | Upcoming rocket launches | On demand |
| CounterAPI | api.counterapi.dev | Visitor count tracking | On page load |
| rss2json | api.rss2json.com | BBC World News RSS → JSON | On demand |
| foto-webcam.eu | www.foto-webcam.eu | Alpine & city webcam snapshots | 5 min |
| Esri World Imagery | server.arcgisonline.com | Satellite map tiles | — |

---

## 5. Code Complexity Analysis

### 5.1 Size Assessment

| Metric | GEOPULSE | Typical SPA | Assessment |
|---|---|---|---|
| Total JS lines | 4,907 | 2,000–20,000 | ✅ **Normal** |
| Largest file | main.js (4,477) | — | ⚠️ **Monolith — should split** |
| CSS lines | 1,776 | 500–5,000 | ✅ **Normal** |
| HTML total | 3,450 | 500–3,000 | ✅ **Normal** |
| External deps | 3 (MapLibre, FA, Fonts) | 20–200 | ✅ **Minimal** |

### 5.2 Performance Profile

| Area | Status | Notes |
|---|---|---|
| **Initial load** | ✅ Fast | No bundling overhead. ~740 KB total (CSS+JS+HTML). Map tiles lazy-load |
| **Runtime memory** | ✅ Low | GeoJSON features stay under 1,000 per layer. No virtual DOM diffing |
| **API calls** | ✅ Minimal | Only active layers poll. Most data is static overlays |
| **Animations** | ✅ GPU-accelerated | CSS transforms and MapLibre's WebGL for all map rendering |
| **Mobile** | ✅ Responsive | Touch-friendly, viewport-aware, accordion nav |
| **Offline** | ⚠️ None | No service worker. Requires internet for tiles + API data |

### 5.3 Complexity Verdict

**For an educational geospatial platform, the complexity is appropriate.** The codebase is a single-page monolith — which is both a strength and a weakness:

**Strengths:**
- Zero build pipeline → any student can fork, edit, and deploy in minutes
- No framework lock-in → pure browser APIs, nothing to deprecate
- GitHub Pages hosting → literally zero cost, zero DevOps
- CDN-loaded deps → no `node_modules`, no `package.json`, no npm

**Weaknesses (acceptable for this scope):**
- `main.js` at 4,477 lines is a monolith — ideally would split into modules (map.js, tours.js, layers.js, ui.js)
- No minification — production code is human-readable (arguably a feature for students)
- No automated testing — manual QA only
- No TypeScript — dynamic typing throughout

**Recommendation:** The monolith is fine for V1.x. If the project grows beyond 8,000 JS lines or adds more contributors, consider splitting `main.js` into ES modules. For now, the simplicity is a competitive advantage for education.

### 5.4 Competitive Positioning

| vs. | GEOPULSE Advantage | Their Advantage |
|---|---|---|
| Google Earth Web | Free, open source, no account needed | More data, 3D buildings, Street View |
| ArcGIS StoryMaps | Zero cost, self-hosted, full code access | Enterprise support, WYSIWYG editor |
| Mapbox Studio | No API key, no usage limits, no billing | Custom styling, terrain 3D, geocoding |
| OpenStreetMap | Guided tours, real-time data, cinematic UX | Editable base map, massive community |

---

## 6. Feature Inventory

### 6.1 Data Layers (22)

| Category | Layers |
|---|---|
| **Real-Time Tracking** | ISS Tracker · Starlink Constellation · Earthquakes · Wildfires · Webcams |
| **Environment & Space** | Solar Terminator · Weather Radar · Surface Temperature · Sea Surface Temp · Volcanoes |
| **Infrastructure** | Undersea Cables · Data Centers · Nuclear Plants · Power Grid |
| **Geopolitics** | Regime Freedom Map · Geopolitical Blocs · Active Conflicts · Nuclear Arsenal · Radiation Sites |
| **Demographics** | Population Density · Night Lights |
| **Intelligence** | AI Atlas (curated hotspots) |

### 6.2 Guided Tours (25)

| Category | Tours | Total Stops |
|---|---|---|
| 🎖️ History | World War II, World War I, Roman Empire, Cold War, Lost Civilizations | ~55 |
| 🌍 Geopolitics | Trump World Tour, Forbidden Zones, Active Conflicts | ~30 |
| 🏔️ Nature & Science | 14 Summits (8000ers), Extreme Earth, Great Barrier Reef | ~35 |
| 🚀 Space & Tech | Space Race, ISS Orbital Tour, Starlink Demo | ~25 |
| ⚽ Sports | FIFA World Cup 2026, Formula 1 Circuit Tour | ~20 |
| 🏛️ Culture | 7 Wonders (Ancient + Modern), UNESCO Heritage | ~25 |
| 🎓 Demo | GEOPULSE Introduction Tour | 5 |

### 6.3 Immersive Features (V1.5.4)

- **Cinematic Camera** — Unique bearing/pitch per tour stop with orbital drift
- **Typewriter Text** — Character-by-character briefing reveal at 18ms/char
- **Ken Burns Effect** — Wikipedia images slowly pan & zoom (12s cycle)
- **Story Progress Bar** — Amber gradient fill with shimmer effect
- **Procedural Audio** — Web Audio API splash drone on gateway entry
- **Audio Narration** — Web Speech API for hands-free tour consumption
- **Bilingual UI** — Full DE/EN toggle with persistent preference

---

## 7. Deployment & Hosting

### 7.1 Current Setup

```
GitHub Repository → git push → GitHub Pages (auto-deploy)
                                 ↓
                    https://geopulse.is-a.dev
```

- **Cost:** $0/month
- **SSL:** ✅ Automatic (GitHub-managed)
- **CDN:** ✅ Global (GitHub's Fastly CDN)
- **Uptime:** 99.9% (GitHub Pages SLA)
- **Deploy time:** ~30 seconds after push

### 7.2 Custom Domain Options (Free)

| Option | Domain Example | Provider | Process |
|---|---|---|---|
| **.is-a.dev** | `geopulse.is-a.dev` | GitHub PR | Submit PR to is-a-dev/register repo |
| **.eu.org** | `geopulse.eu.org` | nic.eu.org | Register account, wait for manual approval (1-3 weeks) |
| **.js.org** | `geopulse.js.org` | GitHub PR | Submit PR to js-org/js.org repo (JS projects only) |
| **thedev.id** | `geopulse.thedev.id` | GitHub PR | Submit PR to thedev-id/thedev.id repo |

**Recommended:** `geopulse.is-a.dev` — best fit for an educational dev project. Professional-looking, fast approval via GitHub PR, and commonly used by open-source projects.

**Paid alternatives (if budget allows later):**

| Domain | Est. Cost/yr | Notes |
|---|---|---|
| geopulse.earth | ~€25 | Perfect semantic match |
| geopulse.app | ~€12 | Modern, short |
| geopulse.edu.eu | ~€8 | Educational signaling |

---

## 8. Security Posture

- **Zero API keys** — Nothing to leak, nothing to rotate
- **CSP headers** — Strict Content-Security-Policy whitelisting all domains
- **No cookies** — LocalStorage only for preferences
- **No tracking** — CounterAPI is anonymous, no analytics, no fingerprinting
- **No user data** — No accounts, no forms (except anonymous feedback via Google Forms)
- **HTTPS-only** — Enforced by GitHub Pages

---

## 9. For Students: How to Fork & Deploy

```bash
# 1. Fork the repository on GitHub
# 2. Clone it
git clone https://github.com/YOUR-USERNAME/geopulse.git
cd geopulse

# 3. Open locally (no build step needed!)
npx -y http-server -p 8080 -c-1
# → Open http://localhost:8080

# 4. Edit any file directly — HTML, CSS, or JS
# 5. Push to deploy
git add -A
git commit -m "my changes"
git push

# 6. Enable GitHub Pages in Settings → Pages → Source: master
# → Your site is live at https://YOUR-USERNAME.github.io/geopulse/
```

**No npm install. No build. No config. Edit → push → live.**

---

## 10. AI-Assisted Development Metrics

### 10.1 Development Model

GEOPULSE was built **100% via AI pair programming** — no line of code was written manually. The entire codebase (12,026 lines) was generated, debugged, and refined through conversational AI sessions.

### 10.2 Token Consumption Estimate

| Metric | Value | Basis |
|---|---|---|
| **AI Conversations** | 29 sessions | Tracked via local brain storage |
| **Git Commits** | 156 | Each commit = 1–5 AI tool calls |
| **Avg. tokens per conversation** | ~300K–400K | Context window + code edits + browser testing |
| **Total estimated input tokens** | **~5–7M** | Conversation context, file reads, DOM snapshots |
| **Total estimated output tokens** | **~3–5M** | Code generation, edits, explanations |
| **Total estimated tokens** | **~8–12M** | Combined I/O across all 29 sessions |

### 10.3 Token Breakdown by Category

| Category | Est. % | Why |
|---|---|---|
| **Code generation** | ~35% | main.js (5,176 lines), style.css (2,051 lines) |
| **Code editing/refactoring** | ~25% | Iterative fixes, layer debugging, text shortening |
| **Browser testing** | ~20% | DOM snapshots, screenshot analysis, UI verification |
| **Context/conversation** | ~15% | User requests, explanations, planning |
| **Documentation** | ~5% | README, TECH_SPEC, changelog, about page |

### 10.4 Development Economics

| Metric | Value |
|---|---|
| Development time | ~6 weeks (part-time) |
| Equivalent manual dev time | ~3–4 months (1 full-stack developer) |
| Cost of human equivalent | ~€15,000–20,000 (freelance rate) |
| Actual infrastructure cost | **€0** (GitHub Pages, free APIs, free domain) |
| Lines of code per session | ~415 avg |
| Features per session | ~2–3 avg |

### 10.5 What AI Built (Scope)

- Complete MapLibre GL JS integration with 24 data layers
- 25 guided tours (200+ stops) with bilingual EN/DE content
- Procedural audio engine (Web Audio API synthesis)
- Cinematic camera system (bearing, pitch, orbital drift)
- Particle effects, animated earthquake ripples, atmospheric fog
- Full responsive UI with accordion sidebar, draggable panels
- Security-hardened CSP with zero API keys
- 5 HTML pages (index, about, manual, changelog, impressum)
- Complete design system (2,051 lines CSS)
- SEO optimization, OG tags, social cards

---

## 11. Revision History

| Version | Date | Highlights |
|---|---|---|
| V1.5.5 | May 7, 2026 | Pipelines, Gen Z effects, tour overview intro, earthquake pulse |
| V1.5.4 | May 6, 2026 | Cinematic camera, typewriter text, Ken Burns, progress bar |
| V1.5.3 | May 2026 | Live Flights removed, Impressum, visitor counter |
| V1.5 | May 2026 | Tour expansion (25 tours), bilingual DE/EN |
| V1.3 | Apr 2026 | Cinematic gateway, procedural audio, Trump tour |
| V1.0 | Apr 2026 | Production release, 14 tours, audio narration |
| V0.1 | Mar 2026 | Initial commit, MapLibre base, first data layers |

---

*GEOPULSE is maintained by RB Design 2026. MIT Licensed.*  
*Built with zero budget, zero API keys, zero backend servers — and ~10M AI tokens.*
