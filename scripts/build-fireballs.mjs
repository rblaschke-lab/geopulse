#!/usr/bin/env node
/**
 * build-fireballs.mjs — erzeugt data/fireballs.json aus der NASA-CNEOS-Fireball-API.
 *
 * WARUM ZUR BAUZEIT
 * ssd-api.jpl.nasa.gov sendet keinen Access-Control-Allow-Origin-Header. Der
 * Browser verweigert den direkten Abruf deshalb — die Fireball-Ebene blieb auf
 * geopulseworld.com leer. Node kennt CORS nicht; hier klappt der Abruf, und die
 * Seite liefert das Ergebnis als eigene Datei aus.
 *
 * FORMAT
 * Unverändert die Antwort der API ({ signature, count, fields, data }), damit
 * main.js ohne Umbau weiterliest. Zusätzlich: generated (ISO-Datum des Laufs).
 *
 * AKTUALITÄT
 * Neue Fireballs kommen mit Tagen bis Wochen Verzug in den Katalog. Ein
 * täglicher Lauf (GitHub Action) reicht völlig.
 *
 * AUFRUF
 *   node scripts/build-fireballs.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'fireballs.json');
const URL = 'https://ssd-api.jpl.nasa.gov/fireball.api?limit=150';

const res = await fetch(URL, { headers: { 'User-Agent': 'GEOPULSE fireball snapshot builder' } });
if (!res.ok) {
  console.error(`Fireball-API antwortet mit HTTP ${res.status} — bestehende Datei bleibt unverändert.`);
  process.exit(1);
}
const api = await res.json();
if (!Array.isArray(api.fields) || !Array.isArray(api.data) || api.data.length === 0) {
  console.error('Unerwartetes Antwortformat — bestehende Datei bleibt unverändert.');
  process.exit(1);
}

// Unchanged events → leave the file alone, so the daily Action doesn't commit
// a new "generated" date every morning.
try {
  const prev = JSON.parse(readFileSync(OUT, 'utf8'));
  if (JSON.stringify(prev.data) === JSON.stringify(api.data)) {
    console.log('data/fireballs.json: keine neuen Ereignisse.');
    process.exit(0);
  }
} catch { /* no previous file — write it */ }

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), ...api }));
console.log(`data/fireballs.json: ${api.data.length} Ereignisse, neuestes ${api.data[0][api.fields.indexOf('date')]}`);
