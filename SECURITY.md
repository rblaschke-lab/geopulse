# 🔒 GEOPULSE — Security Policy

> **Version:** 1.3  
> **Last Audit:** 2026-05-04  
> **Status:** ✅ All clear — no active vulnerabilities

---

## Reporting Vulnerabilities

If you discover a security vulnerability in GEOPULSE, please report it responsibly:

1. **Do NOT open a public GitHub issue** for security vulnerabilities
2. Email: dev@geopulse.local (or use GitHub private vulnerability reporting)
3. Include steps to reproduce, expected vs actual behavior, and impact assessment
4. We aim to acknowledge reports within 48 hours

---

## Architecture — Security by Design

GEOPULSE is a **static client-side application** hosted on GitHub Pages:

| Principle | Implementation |
|-----------|---------------|
| **No backend** | All processing happens in the browser — no server to compromise |
| **No authentication** | No accounts, no passwords, no session tokens |
| **No database** | Data fetched directly from public APIs at runtime |
| **No cookies** | Only `localStorage` for language preference and UI state |
| **No user data** | GDPR-compliant by design — nothing to leak |
| **No API keys** | All data sources are free and keyless (since V1.2) |
| **No tracking** | No analytics, no fingerprinting, no telemetry |

---

## Security Measures

| Measure | Status | Details |
|---------|--------|---------|
| Content Security Policy (CSP) | ✅ Active | Strict CSP via `<meta>` tag — blocks unauthorized scripts, restricts `connect-src` to whitelisted APIs |
| HTML output escaping (XSS) | ✅ Active | All external data is HTML-escaped via `escHtml()` before DOM insertion |
| Subresource Integrity (SRI) | 🔄 Planned | Hashes for CDN resources (Font Awesome, MapLibre) |
| No inline script execution | ✅ Active | CSP blocks `eval()` and dynamic script injection |
| API key protection | ✅ Resolved | Zero API keys in codebase (see incident SEC-001 below) |
| Debug exposure removed | ✅ Active | No `window.__wv` or diagnostic globals in production |
| Referrer policy | ✅ Active | `no-referrer` — no origin leakage to external APIs |
| Content-Type sniffing | ✅ Blocked | `X-Content-Type-Options: nosniff` |

---

## Supported Versions

| Version | Status |
|---------|--------|
| 1.3     | ✅ Current — fully supported |
| 1.2     | ⚠️ Superseded — API_KEYS block removed |
| 1.0–1.1 | ❌ Legacy — contained empty API_KEYS field |
| < 1.0   | ❌ Retired (formerly "Worldview") — contained committed API key |

---

## 📋 Security Incident Log

### SEC-001: AISStream API Key Committed to Git History

| Field | Detail |
|-------|--------|
| **Severity** | 🟡 Low |
| **Discovered** | 2026-05-03 |
| **Resolved** | 2026-05-04 |
| **Affected versions** | V9.0 (commit `0e35510`, 2026-04-14) |
| **Type** | Secret exposure in version control |

**What happened:**  
During development of the Worldview V9.0 release, an aisstream.io API key (`44b523...966e`) was hardcoded in `config.js` and committed to the Git repository. The key was used for real-time AIS ship tracking via WebSocket.

**Timeline:**
1. `2026-04-14` — Key committed in V9.0 (`0e35510`) with comment "USER_INSERT_API_KEY_HERE"
2. `2026-04-30` — Ship tracking layer removed in V1.1, key field set to empty string
3. `2026-05-01` — V1.2 removed the `API_KEYS.AISSTREAM` field entirely, replaced with comment
4. `2026-05-03` — Leak identified during security review via `git log -p -S`
5. `2026-05-04` — Full remediation: `API_KEYS` block removed from `config.js`, all AIS/ships references cleaned from README, manual, and codebase. SECURITY.md updated.

**Risk assessment:**
- aisstream.io is a **free, public AIS data service** — no payment information attached
- Worst case: Unauthorized use of the key for excessive API calls → account rate-limited or suspended
- No access to sensitive data, no financial exposure, no user data at risk
- The key is **no longer used** — GEOPULSE removed ship tracking in V1.2

**Remediation:**
- [x] Key revoked/rotated on aisstream.io dashboard
- [x] `API_KEYS` block removed from `config.js`
- [x] All AIS/ships references removed from README.md, manual.html
- [x] Ships layer and toggle removed from index.html and main.js (V1.2)
- [x] CSP `connect-src` no longer whitelists `wss://stream.aisstream.io`
- [x] Incident documented in SECURITY.md

**Key remains in Git history** — this is expected. Rewriting Git history (`git filter-branch` / `BFG`) was deemed unnecessary because:
1. The key is for a free, non-sensitive service
2. The key has been revoked at the provider
3. The repository is open source — history rewriting causes force-push complications

**Lesson learned:**  
Even "placeholder" keys should never be committed. Use environment variables or `.gitignore`d config files for any secret, regardless of sensitivity level.

---

## 🔄 Monthly Security Audit Checklist

> **Schedule:** First Saturday of each month  
> **Owner:** Repository maintainer  
> **Method:** Manual review + automated scanning  
> **Duration:** ~30 minutes  

### 1. Secret & Key Scanning
- [ ] Run `git log --all -p -S "key" -S "token" -S "secret" -S "password" -- .` — check for new committed secrets
- [ ] Search codebase: `grep -rni "api.key\|apikey\|token\|secret\|password" --include="*.js" --include="*.html"`
- [ ] Verify `config.js` contains zero API keys
- [ ] Check `.gitignore` covers any local config overrides

### 2. Content Security Policy (CSP) Audit
- [ ] Review CSP `<meta>` tag in `index.html`
- [ ] Verify `connect-src` only contains currently used API endpoints
- [ ] Verify `frame-src` only contains currently embedded origins
- [ ] Check for any `unsafe-eval` violations (should be blocked)
- [ ] Test: Open browser DevTools → Console → look for CSP violation warnings

### 3. Dependency & CDN Review
- [ ] Check MapLibre GL JS version — any security advisories?
- [ ] Check Font Awesome CDN version — any known vulnerabilities?
- [ ] Verify all CDN URLs use `https://`
- [ ] (Future) Validate SRI hashes if implemented

### 4. XSS & Injection Review
- [ ] Verify all API response data passes through `escHtml()` before DOM insertion
- [ ] Check for any new `innerHTML` usage without sanitization
- [ ] Review any new popup/tooltip content for injection risks
- [ ] Test: Enter `<script>alert(1)</script>` in any user-facing input (feedback form)

### 5. Data Source Integrity
- [ ] Verify all external API endpoints are still active and returning expected data
- [ ] Check for any deprecated or sunset APIs that need replacement
- [ ] Confirm no API requires authentication (zero-key policy)
- [ ] Review CORS behavior — any new cross-origin issues?

### 6. Privacy & Compliance
- [ ] Confirm no analytics/tracking scripts present
- [ ] Verify `localStorage` only stores: language preference, welcome overlay state, data cache
- [ ] Check that `referrer: no-referrer` is active
- [ ] Confirm no external fonts/scripts phone home with user data

### 7. Documentation
- [ ] Update "Last Audit" date in this file
- [ ] Log any new findings in the Incident Log section
- [ ] Update "Supported Versions" table if versions changed

---

## Audit Log

| Date | Auditor | Findings | Actions |
|------|---------|----------|---------|
| 2026-05-04 | RB | SEC-001: AISStream API key in Git history | Key revoked, API_KEYS block removed, all AIS references cleaned, incident documented |
| — | — | *Next audit due: 2026-06-07* | — |

---

## External Data Sources — Trust Assessment

All data consumed by GEOPULSE comes from **public, free, keyless APIs**:

| Source | Data | Transport | Auth | Trust |
|--------|------|-----------|------|-------|
| USGS | Earthquakes | HTTPS/GeoJSON | None | ⭐⭐⭐⭐⭐ US Government |
| NASA FIRMS | Wildfires | HTTPS/CSV | None | ⭐⭐⭐⭐⭐ US Government |
| NOAA SWPC | Solar/Space Weather | HTTPS/JSON | None | ⭐⭐⭐⭐⭐ US Government |
| ADSB.lol | Live Flights | HTTPS/JSON | None | ⭐⭐⭐⭐ Open Source community |
| RainViewer | Weather Radar | HTTPS/Tiles | None | ⭐⭐⭐⭐ Commercial free tier |
| WhereTheISS | ISS Position | HTTPS/JSON | None | ⭐⭐⭐⭐ Community project |
| foto-webcam.eu | Alpine Webcams | HTTPS/JPEG | None | ⭐⭐⭐⭐ Austrian non-profit |
| Wikipedia/Wikimedia | Tour Images | HTTPS/JSON | None | ⭐⭐⭐⭐⭐ Wikimedia Foundation |
| Smithsonian GVP | Volcanoes | Static/GeoJSON | None | ⭐⭐⭐⭐⭐ Smithsonian Institution |
| RSS2JSON | News Ticker | HTTPS/JSON | None | ⭐⭐⭐ Free proxy service |

---

*This security policy is part of GEOPULSE's commitment to transparency, education, and responsible development. It also serves as a real-world example of how open-source projects should handle security — from incident response to routine auditing.*
