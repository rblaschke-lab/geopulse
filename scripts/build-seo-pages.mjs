#!/usr/bin/env node
/**
 * build-seo-pages.mjs — erzeugt Landing-Pages je Tour, sitemap.xml und robots.txt.
 *
 * WARUM
 * GEOPULSE ist eine einzige URL. Inhaltlich sind es aber über 40 abgeschlossene
 * Lerneinheiten — "Kalter Krieg", "Belt and Road", "Ring of Fire". Genau danach
 * sucht eine Lehrkraft, und genau das findet derzeit niemand: ohne robots.txt,
 * ohne sitemap.xml und ohne eigene URL existiert keine dieser Touren für eine
 * Suchmaschine.
 *
 * Erzeugt wird pro Tour eine echte Seite mit Titel, Beschreibung, Stationen-
 * übersicht und JSON-LD (LearningResource) — kein leerer Redirect. Eine Seite,
 * die nur weiterleitet, wertet Google als Doorway-Page ab; eine Seite mit dem
 * tatsächlichen Inhalt ist das, was sie zu sein vorgibt.
 *
 * Zweisprachig: jede Seite trägt den deutschen Text mit, wo er existiert, und
 * verweist per hreflang auf sich selbst.
 *
 * AUFRUF
 *   node scripts/build-seo-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://geopulseworld.com';
const OUT_TOURS = path.join(ROOT, 'tours');

// ── Tourdaten laden ───────────────────────────────────────────────
// Die Tour-Dateien sind Browser-Skripte. Ein minimaler Sandkasten reicht:
// window, ein document-Stub und ein setTimeout, das sofort ausführt — die
// Dateien nutzen es nur, um ihr Zusammenführen hinter den Seitenaufbau zu
// schieben, und den gibt es hier nicht.
function loadTours() {
  const sandbox = {
    window: {},
    document: { readyState: 'complete', addEventListener() {} },
    setTimeout: (fn) => { try { fn(); } catch (e) { console.warn('  merge:', e.message); } },
    console: { log() {}, warn() {}, error() {} }
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);

  const run = (file) => vm.runInContext(readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });

  run('tours_data.js');
  sandbox.window._TOURS_REF = sandbox.window._TOURS_DATA; // wie main.js es tut
  run('tours_new.js');
  run('tours_wind.js');
  run('tours_de.js');
  if (typeof sandbox.window._applyToursDE === 'function') sandbox.window._applyToursDE();

  return sandbox.window._TOURS_REF || {};
}

// ── Text-Werkzeuge ────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Emoji und Zeilenumbrüche raus — eine Meta-Description ist eine Zeile Fließtext.
const plain = (s) => String(s ?? '')
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, '')
  .replace(/\s+/g, ' ').trim();

function clip(s, n) {
  const t = plain(s);
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 25)).trim() + '…';
}

// ── Seitenvorlage ─────────────────────────────────────────────────
function tourPage(id, tour, total) {
  const steps = Array.isArray(tour.steps) ? tour.steps : [];
  const title = plain(tour.name || id);
  const titleDe = plain(tour.name_de || '');
  const desc = clip(steps[0]?.text || tour.name || id, 155);
  const url = `${ORIGIN}/tours/${id}/`;
  const deepLink = `${ORIGIN}/#tour=${encodeURIComponent(id)}`;

  const stations = steps.map((s, i) => {
    const h = plain(s.title || s.title_de || `Station ${i + 1}`);
    const body = clip(s.text || s.text_de || '', 340);
    if (!h && !body) return '';
    return `      <li>\n        <h3>${esc(h)}</h3>\n        <p>${esc(body)}</p>\n      </li>`;
  }).filter(Boolean).join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description: desc,
    url,
    inLanguage: titleDe ? ['en', 'de'] : ['en'],
    learningResourceType: 'Interactive map tour',
    educationalLevel: 'secondary education',
    isAccessibleForFree: true,
    about: plain(tour.category || 'geography'),
    numberOfItems: steps.length,
    provider: { '@type': 'Organization', name: 'GEOPULSE', url: ORIGIN }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — GEOPULSE Guided Map Tour</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="de" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#ff9900">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌍</text></svg>">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)} — GEOPULSE">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ORIGIN}/og-preview.png">
<meta property="og:site_name" content="GEOPULSE by RB Design">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)} — GEOPULSE">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}/og-preview.png">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
  :root { color-scheme: dark; }
  body { margin:0; background:#0a0c14; color:#d8e0e6;
         font-family:'Share Tech Mono',ui-monospace,Menlo,monospace;
         line-height:1.65; padding:0 20px 80px; }
  .wrap { max-width:760px; margin:0 auto; }
  header { padding:56px 0 28px; border-bottom:1px solid #1e2a35; }
  .eyebrow { color:#ff9900; font-size:.75rem; letter-spacing:.18em; text-transform:uppercase; margin:0 0 12px; }
  h1 { font-size:clamp(1.7rem,5vw,2.6rem); line-height:1.15; margin:0 0 14px; color:#fff; }
  .lede { color:#9fb0bb; margin:0; }
  .cta { display:inline-block; margin:26px 0 0; padding:13px 26px; background:#ff9900; color:#0a0c14;
         font-weight:700; text-decoration:none; letter-spacing:.08em; text-transform:uppercase; border-radius:3px; }
  .cta:hover { background:#ffb547; }
  h2 { font-size:.85rem; letter-spacing:.16em; text-transform:uppercase; color:#ff9900;
       margin:48px 0 0; padding-bottom:8px; border-bottom:1px solid #1e2a35; }
  ol { padding-left:1.3em; }
  li { margin:26px 0; }
  li h3 { font-size:1rem; color:#fff; margin:0 0 6px; }
  li p { margin:0; color:#9fb0bb; font-size:.93rem; }
  nav.back { margin-top:56px; padding-top:20px; border-top:1px solid #1e2a35; font-size:.8rem; }
  a { color:#ff9900; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">GEOPULSE Guided Tour${tour.category ? ' · ' + esc(plain(tour.category)) : ''}</p>
    <h1>${esc(title)}</h1>
${titleDe ? `    <p class="lede" lang="de">${esc(titleDe)}</p>\n` : ''}    <p class="lede">${esc(desc)}</p>
    <a class="cta" href="${deepLink}">Open this tour on the live map →</a>
  </header>

  <h2>${steps.length} stations on this tour</h2>
  <ol>
${stations}
  </ol>

  <nav class="back">
    <a href="${ORIGIN}/">← All ${total} GEOPULSE tours</a> ·
    <a href="${ORIGIN}/manual.html">Command manual</a> ·
    <a href="${ORIGIN}/about.html">About</a>
  </nav>
</div>
</body>
</html>
`;
}

// ── Bauen ─────────────────────────────────────────────────────────
const TOURS = loadTours();
const ids = Object.keys(TOURS)
  .filter(id => id !== 'welcome')
  .filter(id => Array.isArray(TOURS[id]?.steps) && TOURS[id].steps.length)
  .sort();

if (!ids.length) {
  console.error('Keine Touren gefunden — Abbruch, damit keine leere Sitemap entsteht.');
  process.exit(1);
}

if (existsSync(OUT_TOURS)) rmSync(OUT_TOURS, { recursive: true });
mkdirSync(OUT_TOURS, { recursive: true });

for (const id of ids) {
  const dir = path.join(OUT_TOURS, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), tourPage(id, TOURS[id], ids.length));
}

// ── sitemap.xml ───────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const STATIC = [
  ['/', '1.0', 'daily'],
  ['/about.html', '0.6', 'monthly'],
  ['/manual.html', '0.6', 'monthly'],
  ['/changelog.html', '0.4', 'weekly'],
  ['/impressum.html', '0.2', 'yearly']
].filter(([p]) => p === '/' || existsSync(path.join(ROOT, p.slice(1))));

const urls = [
  ...STATIC.map(([loc, pri, freq]) =>
    `  <url>\n    <loc>${ORIGIN}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`),
  ...ids.map(id =>
    `  <url>\n    <loc>${ORIGIN}/tours/${id}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
];

writeFileSync(path.join(ROOT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`);

// ── robots.txt ────────────────────────────────────────────────────
writeFileSync(path.join(ROOT, 'robots.txt'),
`# GEOPULSE — free educational world map
# No login, no ads. Everything here is meant to be found.
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

console.log('──────────────────────────────');
console.log(`Touren        : ${ids.length}`);
console.log(`Landing-Pages : tours/<id>/index.html`);
console.log(`Sitemap       : ${STATIC.length + ids.length} URLs`);
console.log(`robots.txt    : geschrieben`);
