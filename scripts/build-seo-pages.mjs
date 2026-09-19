#!/usr/bin/env node
/**
 * build-seo-pages.mjs — erzeugt die auffindbaren Seiten rund um die App:
 *   tours/<id>/          englische Tour-Seite mit Lehrkräfte-Block + Arbeitsblatt
 *   de/touren/<id>/      deutsche Tour-Seite, gleicher Aufbau
 *   teachers/            Übersicht für Lehrkräfte (EN), nach Fachbereich
 *   lehrkraefte/         Übersicht für Lehrkräfte (DE)
 *   sitemap.xml          mit hreflang-Paaren (xhtml:link)
 *   robots.txt
 *
 * WARUM
 * GEOPULSE ist eine einzige App-URL. Inhaltlich sind es über 40 abgeschlossene
 * Lerneinheiten — "Kalter Krieg", "Belt and Road", "Ring of Fire". Genau danach
 * sucht eine Lehrkraft. Jede Tour bekommt deshalb eine echte Seite mit dem
 * tatsächlichen Inhalt (keine Doorway-Page), einer Druckvorlage für den
 * Unterricht und einem QR-Code, der die Tour auf Schülergeräten öffnet.
 *
 * Deutsch ist eine eigene URL, nicht dieselbe Seite mit hreflang="de": Google
 * rankt eine Seite in der Sprache, in der ihr Text steht. Die deutschen Texte
 * kommen aus tours_de.js; wo eine Station keinen deutschen Text hat, steht der
 * englische — mit lang="en" markiert.
 *
 * QR-Codes: vendor/qrcode.js (MIT, Kazuhiko Arase), als SVG direkt in die Seite.
 * Quizfragen: quiz_bank.js, Zuordnung über relatedTour.
 *
 * AUFRUF
 *   node scripts/build-seo-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://geopulseworld.com';
const require = createRequire(import.meta.url);
const qrcode = require(path.join(ROOT, 'vendor', 'qrcode.js'));

// ── Tourdaten laden ───────────────────────────────────────────────
// Die Tour-Dateien sind Browser-Skripte. Ein minimaler Sandkasten reicht:
// window, ein document-Stub und ein setTimeout, das sofort ausführt.
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

// quiz_bank.js deklariert `const QUIZ_BANK` — im selben Skript noch erreichbar.
function loadQuiz() {
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
  vm.createContext(sandbox);
  const src = readFileSync(path.join(ROOT, 'quiz_bank.js'), 'utf8').replace(/^﻿/, '');
  vm.runInContext(src + '\n;globalThis.__QB = QUIZ_BANK;', sandbox, { filename: 'quiz_bank.js' });
  const byTour = {};
  for (const list of Object.values(sandbox.__QB || {})) {
    for (const q of list || []) {
      if (q && q.relatedTour && Array.isArray(q.choices) && q.choices.length) (byTour[q.relatedTour] ||= []).push(q);
    }
  }
  return byTour;
}

// Fachbereiche = die Gruppierung des Tour-Katalogs in index.html.
function loadCategories() {
  const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<div class="tour-category[^"]*" data-cat="([a-z]+)"/g;
  const hits = [];
  let m;
  while ((m = re.exec(html))) hits.push([m[1], m.index]);
  return hits.map(([id, at], i) => {
    const chunk = html.slice(at, i + 1 < hits.length ? hits[i + 1][1] : at + 20000);
    return { id, tours: [...new Set([...chunk.matchAll(/data-tour="([a-z0-9_]+)"/g)].map(x => x[1]))] };
  });
}

const CAT = {
  geopolitics: { en: 'Geopolitics', de: 'Geopolitik', subEn: 'History · Politics · Social studies', subDe: 'Geschichte · Politik · Sozialkunde', icon: '🔥' },
  history:     { en: 'History', de: 'Geschichte', subEn: 'History', subDe: 'Geschichte', icon: '📜' },
  earth:       { en: 'Earth & Climate', de: 'Erde & Klima', subEn: 'Geography · Earth science · Biology', subDe: 'Erdkunde · Geographie · Biologie', icon: '🌍' },
  space:       { en: 'Space & Technology', de: 'Weltraum & Technologie', subEn: 'Physics · Technology · Computer science', subDe: 'Physik · Technik · Informatik', icon: '🚀' },
  economy:     { en: 'Economy & Resources', de: 'Wirtschaft & Ressourcen', subEn: 'Economics · Geography', subDe: 'Wirtschaft · Erdkunde', icon: '💰' },
  society:     { en: 'Society & Rights', de: 'Gesellschaft & Rechte', subEn: 'Ethics · Social studies · History', subDe: 'Ethik · Sozialkunde · Geschichte', icon: '✊' },
  religion:    { en: 'Religion', de: 'Religion', subEn: 'Religious education · Ethics', subDe: 'Religion · Ethik', icon: '🕊️' },
  sports:      { en: 'Sport & Culture', de: 'Sport & Kultur', subEn: 'Sport · Music · Art · Geography', subDe: 'Sport · Musik · Kunst · Erdkunde', icon: '🏆' }
};

// ── Text-Werkzeuge ────────────────────────────────────────────────
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Emoji und Zeilenumbrüche raus — Titel und Meta-Texte sind eine Zeile Fließtext.
const plain = (s) => String(s ?? '')
  .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu, '')
  .replace(/\s+/g, ' ').trim();

function clip(s, n) {
  const t = plain(s);
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n - 25)).trim() + '…';
}

// Stations-Titel stehen in Versalien ("BERLIN — THE DIVIDED CITY"). Englisch wird in
// Titelschreibung gebracht; Deutsch bleibt wie es ist — ob ein Wort ein Substantiv
// ist, lässt sich nicht automatisch erkennen ("Die Geteilte Stadt" wäre falsch).
function tidyTitle(s, lang = 'en') {
  const t = plain(s);
  if (lang === 'de' || t !== t.toUpperCase()) return t;
  return t.toLowerCase().replace(/(^|[\s—\-(/"„])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
    .replace(/\b(\p{L}{1,4})\b/gu, (w) => (t.includes(w.toUpperCase()) && /^(ussr|usa|uk|eu|nato|un|ddr|brd|gdr|frg|iss|nasa|cia|kgb|f1|ww1|ww2|ii|i|iii|iv|bc|ad)$/i.test(w)) ? w.toUpperCase() : w);
}

function qrSvg(url) {
  const q = qrcode(0, 'M');
  q.addData(url);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
    .replace('<svg ', '<svg role="img" aria-label="QR code" class="qr" ');
}

const L = {
  en: {
    htmlLang: 'en', eyebrow: 'Guided map tour', open: 'Open this tour on the live map →',
    stationsH: (n) => `${n} stations on this tour`,
    titleSuffix: ' — Interactive Map Tour & Worksheet | GEOPULSE',
    forTeachers: 'For teachers', teachHow: [
      '<strong>On the projector:</strong> open the tour and click through the stations together.',
      '<strong>On student devices:</strong> show the QR code — every scan opens exactly this tour. No app, no login, no cookies.',
      '<strong>On paper:</strong> print the worksheet below; it carries the same QR code.'],
    print: '🖨 Print worksheet', scanHint: 'Scan to open the tour',
    sheetH: 'Worksheet', sheetId: 'worksheet', name: 'Name', klass: 'Class', date: 'Date',
    tasksH: 'Tasks per station', prompts: ['Write down two facts you learned about this place.', 'Why does this place matter? Explain in one or two sentences.', 'Find this place on a blank map: which country and continent is it in?'],
    quizH: 'Quiz', keyH: 'Answer key', noQuiz: 'Reflection: Which station surprised you most, and why?',
    back: (n) => `← All ${n} tours for teachers`, app: 'Open GEOPULSE', about: 'About',
    hubUrl: '/teachers/', tourBase: '/tours/', level: 'Secondary education'
  },
  de: {
    htmlLang: 'de', eyebrow: 'Geführte Kartentour', open: 'Tour auf der Live-Karte öffnen →',
    stationsH: (n) => `${n} Stationen dieser Tour`,
    titleSuffix: ' — interaktive Kartentour & Arbeitsblatt | GEOPULSE',
    forTeachers: 'Für Lehrkräfte', teachHow: [
      '<strong>Am Beamer:</strong> Tour öffnen und die Stationen gemeinsam durchgehen.',
      '<strong>Auf Schülergeräten:</strong> QR-Code zeigen — jeder Scan öffnet genau diese Tour. Ohne App, ohne Login, ohne Cookies.',
      '<strong>Auf Papier:</strong> das Arbeitsblatt unten ausdrucken; es trägt denselben QR-Code.'],
    print: '🖨 Arbeitsblatt drucken', scanHint: 'Scannen, um die Tour zu öffnen',
    sheetH: 'Arbeitsblatt', sheetId: 'arbeitsblatt', name: 'Name', klass: 'Klasse', date: 'Datum',
    tasksH: 'Aufgaben zu den Stationen', prompts: ['Notiere zwei Fakten, die du über diesen Ort erfahren hast.', 'Warum ist dieser Ort bedeutend? Begründe in ein bis zwei Sätzen.', 'Finde den Ort auf einer stummen Karte: In welchem Land und auf welchem Kontinent liegt er?'],
    quizH: 'Quiz', keyH: 'Lösungen', noQuiz: 'Reflexion: Welche Station hat dich am meisten überrascht — und warum?',
    back: (n) => `← Alle ${n} Touren für Lehrkräfte`, app: 'GEOPULSE öffnen', about: 'Über GEOPULSE',
    hubUrl: '/lehrkraefte/', tourBase: '/de/touren/', level: 'Sekundarstufe'
  }
};

const STYLE = `
  :root { color-scheme: dark; }
  body { margin:0; background:#0a0c14; color:#d8e0e6; font-family:'Share Tech Mono',ui-monospace,Menlo,monospace; line-height:1.65; padding:0 20px 80px; }
  .wrap { max-width:780px; margin:0 auto; }
  header { padding:48px 0 26px; border-bottom:1px solid #1e2a35; }
  .top { font-size:.75rem; margin:0 0 26px; } .top a { color:#9fb0bb; text-decoration:none; } .top a:hover { color:#ff9900; }
  .eyebrow { color:#ff9900; font-size:.75rem; letter-spacing:.18em; text-transform:uppercase; margin:0 0 12px; }
  h1 { font-size:clamp(1.7rem,5vw,2.5rem); line-height:1.15; margin:0 0 14px; color:#fff; }
  .lede { color:#9fb0bb; margin:0 0 6px; }
  .cta { display:inline-block; margin:22px 12px 0 0; padding:13px 24px; background:#ff9900; color:#0a0c14; font-weight:700; text-decoration:none; letter-spacing:.08em; text-transform:uppercase; border-radius:3px; }
  .cta:hover { background:#ffb547; }
  .cta.alt { background:transparent; color:#ff9900; border:1px solid #ff9900; cursor:pointer; font:inherit; font-weight:700; }
  h2 { font-size:.85rem; letter-spacing:.16em; text-transform:uppercase; color:#ff9900; margin:46px 0 0; padding-bottom:8px; border-bottom:1px solid #1e2a35; }
  ol { padding-left:1.3em; } li { margin:22px 0; }
  li h3 { font-size:1rem; color:#fff; margin:0 0 6px; } li p { margin:0; color:#9fb0bb; font-size:.93rem; }
  .teach { display:grid; grid-template-columns: 1fr 150px; gap:22px; align-items:start; margin-top:18px; }
  .teach ul { margin:0; padding-left:1.1em; } .teach li { margin:10px 0; font-size:.9rem; color:#c4d0d8; }
  .qr { width:150px; height:150px; background:#fff; border-radius:4px; display:block; }
  .qrnote { font-size:.66rem; color:#9fb0bb; text-align:center; margin-top:4px; }
  .sheet { margin-top:18px; background:#0f141e; border:1px solid #1e2a35; border-radius:4px; padding:22px 24px; }
  .sheet-head { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
  .fields { display:grid; grid-template-columns: 2fr 1fr 1fr; gap:12px; margin:16px 0 8px; font-size:.8rem; }
  .fields span { border-bottom:1px solid #3a4652; padding-bottom:18px; }
  .task { margin:16px 0; } .task h4 { margin:0 0 4px; font-size:.9rem; color:#fff; } .task p { margin:0; font-size:.85rem; color:#9fb0bb; }
  .lines { height:52px; background:repeating-linear-gradient(transparent 0 25px, #2a3440 25px 26px); margin-top:6px; }
  .q { margin:16px 0; font-size:.88rem; } .q ul { list-style:none; padding-left:0; margin:6px 0 0; } .q li { margin:4px 0; font-size:.85rem; }
  .key { margin-top:26px; font-size:.82rem; color:#9fb0bb; } .key h3 { color:#ff9900; font-size:.8rem; letter-spacing:.12em; text-transform:uppercase; }
  .cats h3 { color:#fff; margin:34px 0 2px; font-size:1.05rem; } .cats .subj { font-size:.72rem; color:#9fb0bb; margin:0 0 8px; }
  .tlist { list-style:none; padding:0; margin:0; } .tlist li { margin:0; padding:9px 0; border-bottom:1px solid #161e28; display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px 12px; font-size:.9rem; }
  .tlist .meta { color:#6f808c; font-size:.72rem; white-space:nowrap; } .tlist a { text-decoration:none; }
  .steps { counter-reset:s; list-style:none; padding:0; } .steps li { counter-increment:s; padding-left:44px; position:relative; margin:18px 0; }
  .steps li::before { content:counter(s); position:absolute; left:0; top:0; width:30px; height:30px; border:1px solid #ff9900; color:#ff9900; border-radius:50%; text-align:center; line-height:30px; }
  .badges { display:flex; flex-wrap:wrap; gap:8px; margin:18px 0 0; } .badges span { border:1px solid #2a3440; padding:4px 10px; border-radius:20px; font-size:.72rem; color:#c4d0d8; }
  details { margin:12px 0; border-bottom:1px solid #161e28; padding-bottom:10px; } summary { cursor:pointer; color:#fff; } details p { color:#9fb0bb; font-size:.9rem; }
  nav.back { margin-top:56px; padding-top:20px; border-top:1px solid #1e2a35; font-size:.8rem; }
  a { color:#ff9900; }
  [lang="en"].fallback { font-style:italic; }
  @media (max-width:600px) { .teach { grid-template-columns:1fr; } .fields { grid-template-columns:1fr; } }
  @media print {
    @page { margin:14mm; }
    body { background:#fff; color:#000; padding:0; font-size:11pt; }
    header, .no-print, nav.back, .top, h2.stations-h, ol.stations { display:none !important; }
    .sheet { border:0; padding:0; background:#fff; } h2 { color:#000; border-color:#000; margin-top:0; }
    .task h4, .q, .fields { color:#000; } .task p, .key { color:#222; }
    .lines { background:repeating-linear-gradient(transparent 0 25px, #999 25px 26px); }
    .fields span { border-color:#000; }
    .key { page-break-before:always; } .qr { width:28mm; height:28mm; }
    a { color:#000; text-decoration:none; }
  }`;

// ── Tour-Seite (EN oder DE) ───────────────────────────────────────
function tourPage(lang, id, tour, quiz, cat, total) {
  const x = L[lang];
  const de = lang === 'de';
  const steps = Array.isArray(tour.steps) ? tour.steps : [];
  const nameEn = tidyTitle(tour.name || id);
  const nameDe = tidyTitle(tour.name_de || tour.name || id, 'de');
  const title = de ? nameDe : nameEn;
  const firstText = de ? (steps[0]?.text_de || steps[0]?.text) : steps[0]?.text;
  const desc = clip(firstText || title, 155);
  const url = `${ORIGIN}${x.tourBase}${id}/`;
  const urlEn = `${ORIGIN}/tours/${id}/`;
  const urlDe = `${ORIGIN}/de/touren/${id}/`;
  const deepLink = `${ORIGIN}/#tour=${encodeURIComponent(id)}${de ? '&lang=de' : ''}`;
  const qr = qrSvg(deepLink);
  const catInfo = cat ? CAT[cat] : null;

  const stepText = (s) => {
    const t = de ? (s.text_de || '') : (s.text || '');
    if (t) return { text: t, fallback: false };
    return { text: s.text || s.text_de || '', fallback: de };
  };
  const stepTitle = (s, i) => (de ? tidyTitle(s.title_de || s.title, 'de') : tidyTitle(s.title || s.title_de)) || `Station ${i + 1}`;

  const stations = steps.map((s, i) => {
    const h = stepTitle(s, i);
    const { text, fallback } = stepText(s);
    const body = clip(text, 340);
    return `      <li>\n        <h3>${esc(h)}</h3>\n        <p${fallback ? ' lang="en" class="fallback"' : ''}>${esc(body)}</p>\n      </li>`;
  }).join('\n');

  const tasks = steps.map((s, i) =>
    `      <div class="task"><h4>${i + 1}. ${esc(stepTitle(s, i))}</h4><p>${esc(x.prompts[i % x.prompts.length])}</p><div class="lines"></div></div>`
  ).join('\n');

  const qs = (quiz || []).slice(0, 6);
  const quizHtml = qs.length
    ? qs.map((q, i) => {
        const qt = plain(q.question?.[lang] || q.question?.en || '');
        const ch = q.choices.map(c => `<li>☐ ${esc(plain(c.text?.[lang] || c.text?.en || ''))}</li>`).join('');
        return `      <div class="q"><strong>${i + 1}.</strong> ${esc(qt)}<ul>${ch}</ul></div>`;
      }).join('\n')
    : `      <div class="task"><p>${esc(x.noQuiz)}</p><div class="lines"></div></div>`;
  const keyHtml = qs.length
    ? `    <div class="key">\n      <h3>${esc(x.keyH)}</h3>\n      <ol>${qs.map(q => {
        const right = q.choices.find(c => c.correct);
        const ex = plain(q.explanation?.[lang] || q.explanation?.en || '');
        return `<li><strong>${esc(plain(right?.text?.[lang] || right?.text?.en || ''))}</strong>${ex ? ' — ' + esc(ex) : ''}</li>`;
      }).join('')}</ol>\n    </div>`
    : '';

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description: desc,
    url,
    inLanguage: lang,
    learningResourceType: ['Interactive map tour', 'Worksheet'],
    educationalLevel: x.level,
    audience: { '@type': 'EducationalAudience', educationalRole: ['teacher', 'student'] },
    isAccessibleForFree: true,
    about: catInfo ? (de ? catInfo.de : catInfo.en) : undefined,
    numberOfItems: steps.length,
    isPartOf: { '@type': 'CollectionPage', name: de ? 'GEOPULSE für Lehrkräfte' : 'GEOPULSE for teachers', url: `${ORIGIN}${x.hubUrl}` },
    provider: { '@type': 'Organization', name: 'GEOPULSE by RB Design', url: ORIGIN }
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GEOPULSE', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: de ? 'Lehrkräfte' : 'Teachers', item: `${ORIGIN}${x.hubUrl}` },
      { '@type': 'ListItem', position: 3, name: title, item: url }
    ]
  }];

  return `<!DOCTYPE html>
<html lang="${x.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}${esc(x.titleSuffix)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="de" href="${urlDe}">
<link rel="alternate" hreflang="x-default" href="${urlEn}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#ff9900">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌍</text></svg>">
<meta property="og:type" content="article">
<meta property="og:locale" content="${de ? 'de_DE' : 'en_GB'}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)} — GEOPULSE">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${ORIGIN}/og-preview${de ? '-de' : ''}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="GEOPULSE by RB Design">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)} — GEOPULSE">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}/og-preview${de ? '-de' : ''}.jpg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
  <p class="top"><a href="${ORIGIN}${x.hubUrl}">${esc(x.back(total))}</a> · <a href="${de ? urlEn : urlDe}" hreflang="${de ? 'en' : 'de'}">${de ? 'English' : 'Deutsch'}</a></p>
  <header>
    <p class="eyebrow">${esc(x.eyebrow)}${catInfo ? ' · ' + esc(de ? catInfo.de : catInfo.en) : ''}</p>
    <h1>${esc(title)}</h1>
    <p class="lede">${esc(desc)}</p>
    <a class="cta" href="${deepLink}">${esc(x.open)}</a>
    <button class="cta alt no-print" onclick="window.print()">${esc(x.print)}</button>
  </header>

  <h2 class="no-print">${esc(x.forTeachers)}</h2>
  <div class="teach no-print">
    <ul>${x.teachHow.map(h => `<li>${h}</li>`).join('')}</ul>
    <div>${qr}<div class="qrnote">${esc(x.scanHint)}</div></div>
  </div>

  <h2 class="stations-h">${esc(x.stationsH(steps.length))}</h2>
  <ol class="stations">
${stations}
  </ol>

  <h2 id="${x.sheetId}">${esc(x.sheetH)} — ${esc(title)}</h2>
  <div class="sheet">
    <div class="sheet-head">
      <div class="fields" style="flex:1"><span>${esc(x.name)}:</span><span>${esc(x.klass)}:</span><span>${esc(x.date)}:</span></div>
      <div>${qr}<div class="qrnote">${esc(x.scanHint)}</div></div>
    </div>
    <h3>${esc(x.tasksH)}</h3>
${tasks}
    <h3>${esc(x.quizH)}</h3>
${quizHtml}
${keyHtml}
  </div>

  <nav class="back">
    <a href="${ORIGIN}${x.hubUrl}">${esc(x.back(total))}</a> ·
    <a href="${ORIGIN}/${de ? '#lang=de' : ''}">${esc(x.app)}</a> ·
    <a href="${ORIGIN}/about.html">${esc(x.about)}</a> ·
    <a href="${ORIGIN}/impressum.html">Impressum</a>
  </nav>
</div>
</body>
</html>
`;
}

// ── Übersicht für Lehrkräfte (EN oder DE) ─────────────────────────
function hubPage(lang, cats, TOURS, quizByTour, total) {
  const de = lang === 'de';
  const x = L[lang];
  const url = `${ORIGIN}${x.hubUrl}`;
  const H = de ? {
    title: 'Interaktive Kartentouren für den Unterricht — kostenlos, ohne Login | GEOPULSE',
    desc: `${total} kostenlose, geführte Kartentouren für Geschichte, Erdkunde, Politik und mehr — mit Arbeitsblatt, Quiz und QR-Code. Ohne Anmeldung, ohne Werbung, ohne Cookies.`,
    eyebrow: 'GEOPULSE für Lehrkräfte',
    h1: 'Geschichte und Gegenwart auf einer Karte — fertig für den Unterricht',
    lede: `${total} geführte Kartentouren vom Römischen Reich bis zum Kalten Krieg, dazu Live-Daten zu Erdbeben, Waldbränden und Satelliten. Jede Tour hat ein druckbares Arbeitsblatt und einen QR-Code, der sie direkt auf Schülergeräten öffnet.`,
    badges: ['Kostenlos', 'Ohne Login', 'Ohne Cookies', 'Ohne Werbung', 'Deutsch & Englisch', 'Beamer, Tablet, Handy', 'Open Source'],
    howH: 'So funktioniert es',
    how: ['Tour aus der Liste unten wählen.', 'Am Beamer öffnen — oder den QR-Code zeigen, damit jede Schülerin und jeder Schüler dieselbe Tour auf dem eigenen Gerät startet.', 'Arbeitsblatt ausdrucken: Aufgaben zu jeder Station, Quizfragen und Lösungsblatt.'],
    listH: 'Alle Touren nach Fach', stations: 'Stationen', sheet: 'Arbeitsblatt', questions: 'Quizfragen', question: 'Quizfrage',
    faqH: 'Häufige Fragen',
    faq: [
      ['Kostet GEOPULSE etwas?', 'Nein. GEOPULSE ist kostenlos und Open Source (MIT-Lizenz). Es gibt keine Bezahlversion und keine Werbung.'],
      ['Brauchen Schülerinnen und Schüler ein Konto?', 'Nein. Es gibt keine Anmeldung und keine Konten. Die Seite setzt keine Cookies; Einstellungen wie die Sprache bleiben nur im Browser des Geräts.'],
      ['Auf welchen Geräten läuft es?', 'In jedem aktuellen Browser — am Beamer, auf Tablets und Smartphones. Eine App-Installation ist nicht nötig, lässt sich aber als Web-App zum Startbildschirm hinzufügen.'],
      ['Kann ich eine bestimmte Ansicht mit der Klasse teilen?', 'Ja. Die Adresszeile enthält immer die aktuelle Ansicht: Kartenausschnitt, aktive Ebenen, Sprache und laufende Tour. Diesen Link — oder den QR-Code in der Tour — einfach teilen.'],
      ['Woher kommen die Live-Daten?', 'Aus offenen, öffentlichen Quellen: USGS (Erdbeben), NASA FIRMS und CNEOS (Waldbrände, Feuerbälle), NOAA (Weltraumwetter) und weitere. Alle Quellen stehen auf der About-Seite.']
    ]
  } : {
    title: 'Interactive Map Tours for Your Lessons — Free, No Login | GEOPULSE',
    desc: `${total} free guided map tours for history, geography, politics and more — each with a printable worksheet, quiz and QR code. No sign-up, no ads, no cookies.`,
    eyebrow: 'GEOPULSE for teachers',
    h1: 'History and the live world on one map — ready for class',
    lede: `${total} guided map tours from the Roman Empire to the Cold War, plus live data on earthquakes, wildfires and satellites. Every tour has a printable worksheet and a QR code that opens it straight on student devices.`,
    badges: ['Free', 'No login', 'No cookies', 'No ads', 'English & German', 'Projector, tablet, phone', 'Open source'],
    howH: 'How it works',
    how: ['Pick a tour from the list below.', 'Open it on the projector — or show the QR code so every student starts the same tour on their own device.', 'Print the worksheet: a task for every station, quiz questions and an answer key.'],
    listH: 'All tours by subject', stations: 'stations', sheet: 'Worksheet', questions: 'quiz questions', question: 'quiz question',
    faqH: 'Frequently asked questions',
    faq: [
      ['Does GEOPULSE cost anything?', 'No. GEOPULSE is free and open source (MIT licence). There is no paid tier and no advertising.'],
      ['Do students need an account?', 'No. There is no sign-up and there are no accounts. The site sets no cookies; settings such as the language stay in the device’s own browser.'],
      ['Which devices does it run on?', 'Any current browser — projector, tablets, phones. Nothing to install, though it can be added to the home screen as a web app.'],
      ['Can I share a specific view with my class?', 'Yes. The address bar always holds the current view: map position, active layers, language and running tour. Share that link — or the QR code inside a tour.'],
      ['Where does the live data come from?', 'From open public sources: USGS (earthquakes), NASA FIRMS and CNEOS (wildfires, fireballs), NOAA (space weather) and more. Every source is listed on the About page.']
    ]
  };

  const sections = cats.filter(c => CAT[c.id]).map(c => {
    const info = CAT[c.id];
    const rows = c.tours.filter(id => TOURS[id]).map(id => {
      const t = TOURS[id];
      const name = de ? tidyTitle(t.name_de || t.name, 'de') : tidyTitle(t.name);
      const n = (t.steps || []).length;
      const q = (quizByTour[id] || []).length;
      return `      <li><a href="${x.tourBase}${id}/">${esc(name)}</a><span class="meta">${n} ${esc(H.stations)}${q ? ` · ${Math.min(q, 6)} ${esc(Math.min(q, 6) === 1 ? H.question : H.questions)}` : ''} · <a href="${x.tourBase}${id}/#${x.sheetId}">${esc(H.sheet)}</a></span></li>`;
    }).join('\n');
    return `    <h3>${info.icon} ${esc(de ? info.de : info.en)}</h3>\n    <p class="subj">${esc(de ? info.subDe : info.subEn)}</p>\n    <ul class="tlist">\n${rows}\n    </ul>`;
  }).join('\n');

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: H.title, description: H.desc, url, inLanguage: lang,
    audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' },
    isPartOf: { '@type': 'WebSite', name: 'GEOPULSE', url: `${ORIGIN}/` }
  }, {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: H.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  }];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(H.title)}</title>
<meta name="description" content="${esc(H.desc)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${ORIGIN}/teachers/">
<link rel="alternate" hreflang="de" href="${ORIGIN}/lehrkraefte/">
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/teachers/">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#ff9900">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌍</text></svg>">
<meta property="og:type" content="website">
<meta property="og:locale" content="${de ? 'de_DE' : 'en_GB'}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(H.h1)}">
<meta property="og:description" content="${esc(H.desc)}">
<meta property="og:image" content="${ORIGIN}/og-preview${de ? '-de' : ''}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="GEOPULSE by RB Design">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(H.h1)}">
<meta name="twitter:description" content="${esc(H.desc)}">
<meta name="twitter:image" content="${ORIGIN}/og-preview${de ? '-de' : ''}.jpg">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
  <p class="top"><a href="${ORIGIN}/${de ? '#lang=de' : ''}">← GEOPULSE</a> · <a href="${de ? ORIGIN + '/teachers/' : ORIGIN + '/lehrkraefte/'}" hreflang="${de ? 'en' : 'de'}">${de ? 'English' : 'Deutsch'}</a></p>
  <header>
    <p class="eyebrow">${esc(H.eyebrow)}</p>
    <h1>${esc(H.h1)}</h1>
    <p class="lede">${esc(H.lede)}</p>
    <div class="badges">${H.badges.map(b => `<span>${esc(b)}</span>`).join('')}</div>
    <a class="cta" href="${ORIGIN}/${de ? '#lang=de' : ''}">${esc(x.app)} →</a>
  </header>

  <h2>${esc(H.howH)}</h2>
  <ol class="steps">${H.how.map(s => `<li>${esc(s)}</li>`).join('')}</ol>

  <h2>${esc(H.listH)}</h2>
  <div class="cats">
${sections}
  </div>

  <h2>${esc(H.faqH)}</h2>
${H.faq.map(([q, a]) => `  <details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n')}

  <nav class="back">
    <a href="${ORIGIN}/${de ? '#lang=de' : ''}">${esc(x.app)}</a> ·
    <a href="${ORIGIN}/about.html">${esc(x.about)}</a> ·
    <a href="${ORIGIN}/manual.html">Manual</a> ·
    <a href="${ORIGIN}/impressum.html">Impressum</a>
  </nav>
</div>
</body>
</html>
`;
}

// ── Bauen ─────────────────────────────────────────────────────────
const TOURS = loadTours();
const QUIZ = loadQuiz();
const CATS = loadCategories();
const catOf = {};
CATS.forEach(c => c.tours.forEach(id => { catOf[id] = c.id; }));

const ids = Object.keys(TOURS)
  .filter(id => id !== 'welcome')
  .filter(id => Array.isArray(TOURS[id]?.steps) && TOURS[id].steps.length)
  .sort();

if (!ids.length) {
  console.error('Keine Touren gefunden — Abbruch, damit keine leere Sitemap entsteht.');
  process.exit(1);
}

const OUT = {
  en: path.join(ROOT, 'tours'),
  de: path.join(ROOT, 'de', 'touren'),
  hubEn: path.join(ROOT, 'teachers'),
  hubDe: path.join(ROOT, 'lehrkraefte')
};
for (const dir of Object.values(OUT)) {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
}

for (const id of ids) {
  for (const lang of ['en', 'de']) {
    const dir = path.join(OUT[lang], id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), tourPage(lang, id, TOURS[id], QUIZ[id], catOf[id], ids.length));
  }
}
writeFileSync(path.join(OUT.hubEn, 'index.html'), hubPage('en', CATS, TOURS, QUIZ, ids.length));
writeFileSync(path.join(OUT.hubDe, 'index.html'), hubPage('de', CATS, TOURS, QUIZ, ids.length));

// ── sitemap.xml (mit hreflang-Paaren) ─────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const entry = (loc, pri, freq, alts) =>
  `  <url>\n    <loc>${ORIGIN}${loc}</loc>\n` +
  (alts ? alts.map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${ORIGIN}${href}"/>\n`).join('') : '') +
  `    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`;

const STATIC = [
  ['/', '1.0', 'daily'],
  ['/about.html', '0.6', 'monthly'],
  ['/manual.html', '0.5', 'monthly'],
  ['/changelog.html', '0.3', 'weekly'],
  ['/impressum.html', '0.1', 'yearly']
].filter(([p]) => p === '/' || existsSync(path.join(ROOT, p.slice(1))));

const hubAlts = [['en', '/teachers/'], ['de', '/lehrkraefte/'], ['x-default', '/teachers/']];
const tourAlts = (id) => [['en', `/tours/${id}/`], ['de', `/de/touren/${id}/`], ['x-default', `/tours/${id}/`]];

const urls = [
  ...STATIC.map(([loc, pri, freq]) => entry(loc, pri, freq)),
  entry('/teachers/', '0.9', 'weekly', hubAlts),
  entry('/lehrkraefte/', '0.9', 'weekly', hubAlts),
  ...ids.flatMap(id => [
    entry(`/tours/${id}/`, '0.8', 'monthly', tourAlts(id)),
    entry(`/de/touren/${id}/`, '0.8', 'monthly', tourAlts(id))
  ])
];

writeFileSync(path.join(ROOT, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`);

// ── robots.txt ────────────────────────────────────────────────────
writeFileSync(path.join(ROOT, 'robots.txt'),
`# GEOPULSE — free interactive world atlas for classrooms
# No login, no ads, no cookies. Everything here is meant to be found.
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

const withQuiz = ids.filter(id => (QUIZ[id] || []).length).length;
console.log('──────────────────────────────');
console.log(`Touren        : ${ids.length} (mit Quizfragen: ${withQuiz})`);
console.log(`Tour-Seiten   : ${ids.length} EN + ${ids.length} DE`);
console.log(`Übersichten   : /teachers/ · /lehrkraefte/`);
console.log(`Sitemap       : ${urls.length} URLs`);
