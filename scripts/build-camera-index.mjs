#!/usr/bin/env node
/**
 * build-camera-index.mjs — erzeugt data/cameras.json aus offenen Kamerakatalogen.
 *
 * WARUM ZUR BAUZEIT
 * Die Rohkataloge sind zusammen über 3 MB (TfL 1,15 MB · Austin 864 KB ·
 * Caltrans D11 1,04 MB). Die dürfen einem Besucher nicht zugemutet werden.
 * Hier werden sie einmal auf das eingedampft, was die Karte wirklich braucht —
 * Position, Name, Bildzugang — und als eine kompakte Datei ausgeliefert.
 *
 * Zweiter Grund: CORS ist eine reine Browser-Regel. Node kennt sie nicht, also
 * sind hier auch Kataloge nutzbar, die keine CORS-Header senden. Im Browser
 * bleibt nur der Bildabruf übrig, und <img> unterliegt CORS ohnehin nicht.
 *
 * FORMAT (Array-Zeilen statt Objekte — spart ~40 % gegenüber benannten Feldern)
 *   [quelle, id, lat, lon, name, bildUrl?]
 *   bildUrl entfällt, wenn sie sich aus der id ableiten lässt (siehe IMAGE_URL).
 *
 * MOMENTAUFNAHME — WICHTIG
 * Kameras werden abgeschaltet, umbenannt, entfernt. Diese Datei friert den
 * Stand des Bauzeitpunkts ein. Monatlich neu erzeugen; das Frontend blendet
 * tote Bilder sauber aus, aber ein halbes Jahr alter Index wird löchrig.
 *
 * AUFRUF
 *   node scripts/build-camera-index.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'cameras.json');

/** Quellkürzel -> wie das Frontend daraus eine Bild-URL macht. Muss mit main.js übereinstimmen. */
export const IMAGE_URL = {
  t: (id) => `https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/${id}.jpg`,
  a: (id) => `https://cctv.austinmobility.io/image/${id}.jpg`,
  // c (Caltrans) hat keine ableitbare URL — sie steht als 6. Feld in der Zeile.
  f: (id) => `https://www.foto-webcam.eu/webcam/${id}/current/640.jpg`,
  d: (id) => `https://weathercam.digitraffic.fi/${id}.jpg`,
  h: (id) => `https://tdcctv.data.one.gov.hk/${id}.JPG`,
  b: (id) => `https://images.drivebc.ca/bchighwaycam/pub/cameras/${id}.jpg`,
  o: (id) => `https://511on.ca/map/Cctv/${id}`,
  n: (id) => `https://www.trafficnz.info/camera/${id}.jpg`,
};

const round5 = (v) => Math.round(Number(v) * 1e5) / 1e5;
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

async function getText(url) {
  // Digitraffic lehnt Anfragen ohne gzip mit 406 ab; fetch entpackt selbst.
  const res = await fetch(url, { headers: { 'User-Agent': 'GEOPULSE camera index builder', 'Accept-Encoding': 'gzip' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} für ${url}`);
  return res.text();
}
const getJson = async (url) => JSON.parse(await getText(url));

/** Minimaler XML-Feldleser — die Kataloge sind flach, ein Parser wäre Ballast. */
const xmlBlocks = (xml, tag) => xml.match(new RegExp(`<${tag}>[\\s\\S]*?</${tag}>`, 'g')) || [];
const xmlField = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return m ? m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
};

/** TfL JamCams — ganz London in einem Aufruf. Bild-URL aus der id ableitbar. */
async function tfl() {
  const rows = [];
  const cams = await getJson('https://api.tfl.gov.uk/Place/Type/JamCam');
  for (const c of cams) {
    // Ohne imageUrl ist die Kamera für uns wertlos — es gibt nichts zu zeigen.
    const img = (c.additionalProperties || []).find((p) => p.key === 'imageUrl');
    if (!img?.value || c.lat == null || c.lon == null) continue;
    // id kommt als "JamCams_00002.00865"; die Bild-URL nutzt nur den Teil danach.
    const id = String(c.id).replace(/^JamCams_/, '');
    // Gegenprobe: leitet unsere Vorlage wirklich die veröffentlichte URL her?
    // Wenn TfL das Ablageschema ändert, soll der Bau scheitern, nicht die Karte.
    if (IMAGE_URL.t(id) !== img.value) continue;
    rows.push(['t', id, round5(c.lat), round5(c.lon), String(c.commonName || '').trim()]);
  }
  return rows;
}

/** Austin Open Data — Socrata. Nur eingeschaltete Kameras. */
async function austin() {
  const rows = [];
  const cams = await getJson('https://data.austintexas.gov/resource/b4k4-adkb.json?$limit=5000');
  for (const c of cams) {
    if (c.camera_status !== 'TURNED_ON') continue;
    const coords = c.location?.coordinates;
    if (!coords || !c.camera_id) continue;
    const expected = IMAGE_URL.a(c.camera_id);
    if (c.screenshot_address && c.screenshot_address !== expected) continue;
    const name = String(c.location_name || '').replace(/\s+/g, ' ').trim();
    rows.push(['a', String(c.camera_id), round5(coords[1]), round5(coords[0]), name]);
  }
  return rows;
}

/**
 * Caltrans — je Bezirk eine Datei, Schema variiert.
 * Bild-URL ist NICHT ableitbar und wird darum mitgespeichert.
 * Bezirke, die ein abweichendes Schema liefern, werden gemeldet statt still
 * übersprungen: eine stumme Null wäre nicht von "Bezirk hat keine Kameras" zu
 * unterscheiden.
 */
async function caltrans() {
  const rows = [];
  const districts = ['03', '04', '05', '06', '07', '08', '10', '11', '12'];
  for (const d of districts) {
    const n = Number(d);
    const url = `https://cwwp2.dot.ca.gov/data/d${n}/cctv/cctvStatusD${d}.json`;
    let j;
    try {
      j = await getJson(url);
    } catch (err) {
      console.warn(`  ! Caltrans D${d}: nicht erreichbar (${err.message})`);
      continue;
    }
    const before = rows.length;
    for (const entry of j.data || []) {
      const c = entry?.cctv;
      if (!c?.inService) continue;
      const loc = c.location, img = c.imageData?.static?.currentImageURL;
      if (!loc?.latitude || !img) continue;
      const name = [loc.locationName, loc.nearbyPlace || loc.county].filter(Boolean).join(', ');
      rows.push([
        'c', `${d}-${c.index}`, round5(loc.latitude), round5(loc.longitude),
        name.replace(/\s+/g, ' ').trim(), img,
      ]);
    }
    const got = rows.length - before;
    console.log(`  Caltrans D${d}: ${got}`);
    if (got === 0) console.warn(`  ! D${d} lieferte 0 — abweichendes Schema oder wirklich leer`);
  }
  return rows;
}

/**
 * Region je Kamera, falls sie nicht einfach "die Quelle" ist. foto-webcam.eu
 * deckt DE, AT, IT und CH ab — eine einzige Marke mit Schwerpunkt in Tirol
 * würde Deutschland verschweigen. Nur für den Bau, landet nicht in der Datei.
 */
const regionOf = new Map();

/**
 * Bildhosts, die die Seite laden darf — gelesen aus der CSP (`img-src`) in
 * index.html. Der Browser blockt jeden anderen Host still; eine Kamera, deren
 * Bild dort liegt, wäre auf der Karte ein toter Punkt. Also lieber weglassen —
 * und laut sagen, welcher Host fehlt.
 */
const CSP_IMG_HOSTS = (() => {
  const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/img-src([^;]*);/);
  return new Set((m ? m[1] : '').trim().split(/\s+/).filter((s) => s.startsWith('https://')));
})();
const hostAllowed = (url) => {
  const origin = (String(url).match(/^https:\/\/[^/]+/) || [''])[0];
  return CSP_IMG_HOSTS.has(origin);
};

/**
 * foto-webcam.eu — hochaufgelöste Panoramen, v. a. Alpenraum und Bayern.
 * Der Katalog ist dieselbe Datei, aus der die Übersichtskarte der Seite lebt.
 *
 * Zwei Sorten:
 *  - eigene Kameras: Bild-URL aus der id ableitbar, 640 px.
 *  - Partnerkameras (z. B. sauerland.camera, megacam.at): Bild liegt auf
 *    fremdem Server, die URL steht als 6. Feld in der Zeile. Nur aufgenommen,
 *    wenn der Host in der CSP steht (siehe CSP_IMG_HOSTS).
 */
async function fotowebcam() {
  const rows = [];
  const missingHosts = new Map();
  const j = await getJson('https://www.foto-webcam.eu/webcam/include/metadata.php');
  for (const c of j.cams || []) {
    if (c.offline || c.hidden || !c.latitude || !c.longitude || !c.id) continue;
    const img = String(c.imgurl || '').replace(/^http:/, 'https:');
    const own = img.startsWith(`https://www.foto-webcam.eu/webcam/${c.id}/`);
    if (!own) {
      if (!img) continue;
      if (!hostAllowed(img)) {
        const h = img.match(/^https?:\/\/[^/]+/)?.[0] || img;
        missingHosts.set(h, (missingHosts.get(h) || 0) + 1);
        continue;
      }
    }
    const row = ['f', String(c.id), round5(c.latitude), round5(c.longitude), clean(c.title || c.name)];
    if (!own) row.push(img);
    rows.push(row);
    regionOf.set(`f:${c.id}`, `f-${String(c.country || '').toLowerCase()}`);
  }
  for (const [h, n] of missingHosts) console.warn(`  ! ${n} Partnerkamera(s) übersprungen — ${h} fehlt in der CSP img-src`);
  return rows;
}

/**
 * Digitraffic (Fintraffic) — Straßenwetterkameras in ganz Finnland, CC BY 4.0.
 * Je Station mehrere Blickrichtungen ("Presets"); wir nehmen die erste aktive,
 * sonst verdreifacht sich der Index für nahezu gleiche Bilder.
 * Stationsnamen kommen als "kt51_Inkoo" (Straßenklasse + Nummer + Ort).
 */
async function digitraffic() {
  const rows = [];
  const j = await getJson('https://tie.digitraffic.fi/api/weathercam/v1/stations');
  for (const f of j.features || []) {
    const p = f.properties || {};
    if (p.collectionStatus !== 'GATHERING') continue;
    const preset = (p.presets || []).find((x) => x.inCollection);
    const [lon, lat] = f.geometry?.coordinates || [];
    if (!preset || lat == null) continue;
    const m = String(p.name || '').match(/^([a-z]+)(\d+)_(.+)$/i);
    const name = m ? `${m[3].replace(/_/g, ' ')} (${m[1]}${m[2]})` : String(p.name || '').replace(/_/g, ' ');
    rows.push(['d', preset.id, round5(lat), round5(lon), clean(name)]);
  }
  return rows;
}

/** Hongkong Transport Department — XML-Katalog, Bild-URL aus dem Schlüssel ableitbar. */
async function hongkong() {
  const rows = [];
  const xml = await getText('https://static.data.gov.hk/td/traffic-snapshot-images/code/Traffic_Camera_Locations_En.xml');
  for (const b of xmlBlocks(xml, 'image')) {
    const key = xmlField(b, 'key'), lat = xmlField(b, 'latitude'), lon = xmlField(b, 'longitude');
    if (!key || !lat || !lon) continue;
    const url = xmlField(b, 'url');
    // Gegenprobe wie bei TfL: weicht die veröffentlichte URL ab, lieber mitspeichern als raten.
    const extra = url && url !== IMAGE_URL.h(key) ? [url] : [];
    const name = clean(xmlField(b, 'description').replace(/\s*\[[^\]]+\]\s*$/, ''));
    rows.push(['h', key, round5(lat), round5(lon), name, ...extra]);
  }
  return rows;
}

/** DriveBC (British Columbia) — als veraltet markierte Kameras bleiben draußen. */
async function drivebc() {
  const rows = [];
  const cams = await getJson('https://www.drivebc.ca/api/webcams/');
  for (const c of cams) {
    if (c.marked_stale || c.is_on === false) continue;
    const [lon, lat] = c.location?.coordinates || [];
    if (lat == null || c.id == null) continue;
    rows.push(['b', String(c.id), round5(lat), round5(lon), clean(c.caption || c.name)]);
  }
  return rows;
}

/**
 * 511 Ontario — eine Kamera hat bis zu drei Blickrichtungen ("Views"), jede mit
 * eigenem Bild. Wie bei Finnland: die erste freigeschaltete genügt.
 */
async function ontario() {
  const rows = [];
  const cams = await getJson('https://511on.ca/api/v2/get/cameras?format=json');
  for (const c of cams) {
    const v = (c.Views || []).find((x) => x.Status === 'Enabled');
    if (!v || c.Latitude == null) continue;
    const dir = v.Description && !/^unknown$/i.test(v.Description) ? ` · ${v.Description}` : '';
    rows.push(['o', String(v.Id), round5(c.Latitude), round5(c.Longitude), clean(`${c.Location}${dir}`)]);
  }
  return rows;
}

/** NZ Transport Agency Waka Kotahi — XML, CC BY 4.0. Offline und Wartung bleiben draußen. */
async function newzealand() {
  const rows = [];
  const xml = await getText('https://www.trafficnz.info/service/traffic/rest/4/cameras/all');
  for (const b of xmlBlocks(xml, 'camera')) {
    if (xmlField(b, 'offline') === 'true' || xmlField(b, 'underMaintenance') === 'true') continue;
    const id = xmlField(b, 'id'), lat = xmlField(b, 'latitude'), lon = xmlField(b, 'longitude');
    if (!id || !lat || !lon) continue;
    const img = xmlField(b, 'imageUrl');
    if (img && `https://www.trafficnz.info${img}` !== IMAGE_URL.n(id)) continue;
    const name = [xmlField(b, 'name'), xmlField(b, 'description')].map(clean).filter(Boolean).join(' — ');
    rows.push(['n', id, round5(lat), round5(lon), name]);
  }
  return rows;
}

const SOURCES = [
  ['TfL London', tfl],
  ['Austin', austin],
  ['Caltrans', caltrans],
  ['foto-webcam.eu', fotowebcam],
  ['Digitraffic Finnland', digitraffic],
  ['Hongkong TD', hongkong],
  ['DriveBC', drivebc],
  ['511 Ontario', ontario],
  ['NZTA', newzealand],
];

const all = [];
for (const [label, fn] of SOURCES) {
  console.log(`\n${label} …`);
  try {
    const rows = await fn();
    console.log(`  ${rows.length} Kameras`);
    all.push(...rows);
  } catch (err) {
    // Eine ausgefallene Quelle darf den Bau nicht kippen — aber sie muss laut
    // sein, sonst schrumpft der Index unbemerkt.
    console.error(`  FEHLER bei ${label}: ${err.message}`);
  }
}

// Stabile Sortierung: gleiche Eingabe -> gleiche Datei -> saubere Diffs im Git.
all.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));

/**
 * Abdeckungsregionen — je Quelle Schwerpunkt und Anzahl.
 *
 * WARUM DAS HIER ENTSTEHT UND NICHT IM FRONTEND
 * Die Kameras decken drei Flecken der Erde ab, nicht die Welt. Ohne diese
 * Angabe zoomt jemand in Wiesbaden auf Stadtebene, sieht nichts und hält das
 * Feature für kaputt — die Karte hätte ihm 4.983 Kameras versprochen, ohne zu
 * sagen wo. Das Frontend setzt daraus beim Herauszoomen anklickbare Marken.
 *
 * Wächst automatisch mit: kommt eine Quelle dazu, erscheint ihre Region von
 * selbst — solange sie unten ein Label bekommt.
 */
const REGION_LABEL = {
  t: { de: 'London', en: 'London' },
  a: { de: 'Austin, Texas', en: 'Austin, Texas' },
  c: { de: 'Kalifornien', en: 'California' },
  'f-de': { de: 'Deutschland · Panoramen', en: 'Germany · panoramas' },
  'f-at': { de: 'Österreich · Panoramen', en: 'Austria · panoramas' },
  'f-it': { de: 'Südtirol & Italien · Panoramen', en: 'South Tyrol & Italy · panoramas' },
  'f-ch': { de: 'Schweiz · Panoramen', en: 'Switzerland · panoramas' },
  d: { de: 'Finnland', en: 'Finland' },
  h: { de: 'Hongkong', en: 'Hong Kong' },
  b: { de: 'British Columbia', en: 'British Columbia' },
  o: { de: 'Ontario', en: 'Ontario' },
  n: { de: 'Neuseeland', en: 'New Zealand' },
};

/** Ab welcher Zoomstufe eine Region Einzelkameras zeigt. Muss zu main.js passen. */
const REGION_ZOOM = { f: 7 };   // Panoramen sind dünn gesät — schon auf Landesebene zeigen
const MIN_REGION_SIZE = 5;      // Splitter (eine Grönland-Kamera) bekommen keine eigene Marke

const regions = Object.entries(
  all.reduce((acc, c) => {
    const key = regionOf.get(`${c[0]}:${c[1]}`) || c[0];
    (acc[key] ||= []).push(c);
    return acc;
  }, {}),
).filter(([, rows]) => rows.length >= MIN_REGION_SIZE).map(([key, rows]) => {
  // Schwerpunkt statt Mittelpunkt der Bounding-Box: Kalifornien ist lang und
  // dünn besiedelt, die Box-Mitte läge im Nirgendwo.
  const lat = rows.reduce((s, r) => s + r[2], 0) / rows.length;
  const lon = rows.reduce((s, r) => s + r[3], 0) / rows.length;
  const src = rows[0][0];
  return {
    key,
    src,
    zoom: REGION_ZOOM[src] ?? 11,
    count: rows.length,
    lat: round5(lat),
    lon: round5(lon),
    label_de: REGION_LABEL[key]?.de || key,
    label_en: REGION_LABEL[key]?.en || key,
  };
}).sort((a, b) => b.count - a.count);

for (const r of regions) {
  if (!REGION_LABEL[r.key]) console.warn(`  ! Region "${r.key}" hat kein Label in REGION_LABEL`);
}

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  attribution: {
    t: 'Powered by TfL Open Data. Contains OS data © Crown copyright and database rights',
    a: 'City of Austin, TX — data.austintexas.gov',
    c: 'Caltrans — cwwp2.dot.ca.gov',
    f: 'foto-webcam.eu — Bilder © jeweilige Kamerabetreiber',
    d: 'Fintraffic / digitraffic.fi — CC BY 4.0',
    h: 'Transport Department, HKSAR — data.gov.hk',
    b: 'DriveBC — Province of British Columbia',
    o: '511ON — Ontario Ministry of Transportation',
    n: 'NZ Transport Agency Waka Kotahi — CC BY 4.0',
  },
  regions,
  cameras: all,
};

const json = JSON.stringify(payload);
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, json);

console.log(`\n──────────────────────────────`);
console.log(`Kameras gesamt : ${all.length}`);
console.log(`roh            : ${(json.length / 1024).toFixed(1)} KB`);
console.log(`gzip (so wird ausgeliefert): ${(gzipSync(json).length / 1024).toFixed(1)} KB`);
console.log(`geschrieben    : ${path.relative(ROOT, OUT)}`);
