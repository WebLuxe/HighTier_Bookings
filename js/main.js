/* ==========================================================================
   WebLuxe template engine
   Builds the whole site from config.js (window.SITE). You should not need to
   edit this file to set up a new client: change config.js instead.
   ========================================================================== */
(() => {
'use strict';

/* Changes saved from the admin panel live in data/site.js (window.SITE_EDITS) and are laid over config.js.
   While the owner previews unsaved changes (?preview), the admin's draft is laid over too. */
const mergeIn = (a, b) => { if (b === undefined) return a; if (b === null || typeof b !== 'object' || Array.isArray(b)) return b; const o = { ...(a && typeof a === 'object' && !Array.isArray(a) ? a : {}) }; for (const k of Object.keys(b)) o[k] = mergeIn(o[k], b[k]); return o; };
const C = (() => {
  let c = mergeIn(window.SITE || {}, window.SITE_EDITS || {});
  try {
    const key = 'wl-preview:' + ((c.admin && c.admin.repo) || c.name);
    if (/[?&]preview\b/.test(location.search)) sessionStorage.setItem('wl-preview-on', '1');
    if (sessionStorage.getItem('wl-preview-on') === '1') { const d = JSON.parse(localStorage.getItem(key) || 'null'); if (d) c = mergeIn(c, d); }
  } catch { /* private mode */ }
  return (window.SITE = c);
})();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const enc = encodeURIComponent;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const langs = (C.languages && C.languages.length) ? C.languages : ['en'];
let lang = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  const pick = [q, store.get('wl-lang'), C.defaultLanguage, (navigator.language || 'en').slice(0, 2)].find((l) => l && langs.includes(l));
  return pick || langs[0];
})();
let T = {};
/** Dates and numbers in the visitor's language: it-IT, fr-FR, en-GB... */
const LOCALE = () => ({ fr: 'fr-FR', it: 'it-IT', de: 'de-DE', es: 'es-ES' }[lang] || 'en-GB');
/** 8.4 in English, 8,4 in Italian or French. */
const decimal = (n) => Number(n).toLocaleString(LOCALE(), { maximumFractionDigits: 1 });

/* ---------- text helpers ---------- */
/** A config value can be plain text or { en: '...', fr: '...' }. */
const tx = (v) => (v == null ? '' : (typeof v === 'object' && !Array.isArray(v) && ('en' in v || 'fr' in v)) ? (v[lang] ?? v.en ?? '') : v);
const L = () => (C.text && (C.text[lang] || C.text.en)) || {};
/** Interface wording from config.text.<lang>, with {placeholders}. */
const ui = (k, vars = {}) => String(L()[k] ?? (C.text && C.text.en && C.text.en[k]) ?? '').replace(/\{(\w+)\}/g, (_, x) => (vars[x] ?? ''));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** True when a config value is worth showing (not empty, not an empty list, not { en: '', fr: '' }). */
const has = (v) => {
  if (v == null || v === '' || v === false) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object' && ('en' in v || 'fr' in v)) return tx(v) !== '';
  return true;
};
const digits = (s) => String(s || '').replace(/\D/g, '');

/* ---------- icons (inline SVG, no icon font to download) ---------- */
const P = {
  truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
  ship: '<path d="M2 20c2 1.3 4 1.3 6 0s4-1.3 6 0 4 1.3 6 0"/><path d="M4 17 3 12h18l-2 5"/><path d="M6 12V7h8v5M10 7V3h2"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  warehouse: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12M6 14h12M6 22V10h12v12"/>',
  doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  star: '<path fill="currentColor" stroke="none" d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  sparkle: '<path d="m12 3 1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 17v4M17 19h4"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  paint: '<path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>',
  quote: '<path fill="currentColor" stroke="none" d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h6.83v-6.83H5.41A1.76 1.76 0 0 1 7.17 9.4zm10 0A5.17 5.17 0 0 0 12 11.17V18h6.83v-6.83h-3.42A1.76 1.76 0 0 1 17.17 9.4z"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  snow: '<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>',
  wave: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/>',
  pool: '<path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 9h8"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  gear: '<circle cx="6" cy="6" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v8M12 8v8M18 8v4H6"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>',
  anchor: '<circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  fish: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 3.37 7 6-.94 2.65-3.44 6-7 6s-7.56-2.54-8.5-6Z"/><path d="M18 12v.5M16 17.93a9.77 9.77 0 0 1 0-11.86M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  tag: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  zoom: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  wa: '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.2 4.24-9.44 9.45-9.44a9.4 9.4 0 0 1 6.68 2.77 9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44zm8.04-17.48A11.3 11.3 0 0 0 12.04.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.6 23.62l6.03-1.58a11.33 11.33 0 0 0 5.42 1.38h.01c6.26 0 11.36-5.1 11.36-11.36 0-3.04-1.18-5.89-3.33-8.04z"/>',
  facebook: '<path fill="currentColor" stroke="none" d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  linkedin: '<path fill="currentColor" stroke="none" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>',
  tiktok: '<path fill="currentColor" stroke="none" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/>',
  youtube: '<path fill="currentColor" stroke="none" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1z"/>',
  tripadvisor: '<circle cx="7" cy="13.5" r="3.5"/><circle cx="17" cy="13.5" r="3.5"/><path d="M2 9h3.5C7.3 7.7 9.5 7 12 7s4.7.7 6.5 2H22l-1.5 2M3.5 11 2 9M12 7v10l-1.5-1.5M12 17l1.5-1.5"/>',
  google: '<path fill="currentColor" stroke="none" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.8 9.4 6 12 6z"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[n] || P.check}</svg>`;

/* ---------- images: Unsplash links get sizes for every screen; your own files are used as they are ---------- */
const isUns = (s) => /images\.unsplash\.com/.test(s || '');
const sized = (s, w) => (isUns(s) ? s.replace(/([?&])w=\d+/, '$1').replace(/[?&]$/, '') + (s.includes('?') ? '&' : '?') + 'w=' + w : s);
const imgOf = (x) => (typeof x === 'string' ? { src: x } : (x || {}));
/* Phones with very dense screens (3x): photos are fetched at about 2x. In the hand it looks the same, and it is about
   half the data. (The hero's preload line in index.html says the same with imagesizes="67vw": keep the two in step.) */
const DENSE_PHONE = innerWidth < 760 && (window.devicePixelRatio || 1) > 2.01;
function pic(x, { sizes = '100vw', eager = false, cls = '', w = 1200 } = {}) {
  const i = imgOf(x);
  if (!i.src) return '';
  if (DENSE_PHONE) sizes = sizes.replace(/(\d+(?:\.\d+)?)vw/g, (m, n) => Math.round(n * 0.67) + 'vw');
  const set = isUns(i.src) ? [360, 560, 800, 1100, 1500, 2000].filter((n) => n <= Math.max(w * 1.7, 560)).map((n) => `${sized(i.src, n)} ${n}w`).join(', ') : '';
  return `<img class="${cls}" src="${esc(sized(i.src, w))}"${set ? ` srcset="${esc(set)}" sizes="${sizes}"` : ''} alt="${esc(tx(i.alt))}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/** Photos after the first in a slideshow load once the page has finished loading. */
const later = (html, i) => (i ? html.replace(' src=', ' data-src=').replace(' srcset=', ' data-srcset=') : html);
function loadLater() {
  const go = () => $$('img[data-src]').forEach((im) => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; im.removeAttribute('data-src'); });
  if (document.readyState === 'complete') setTimeout(go, 600); else addEventListener('load', () => setTimeout(go, 600), { once: true });
}

/* ---------- brand: colours and fonts from config become CSS variables ---------- */
function readable(hex) {
  const h = digits(hex) ? String(hex).replace('#', '') : '';
  if (h.length !== 6) return '#ffffff';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (L + 0.05) / 0.057 >= 1.05 / (L + 0.05) ? '#10141a' : '#ffffff';
}
function applyBrand() {
  const st = document.documentElement.style, c = C.colors || {};
  for (const k of ['primary', 'accent', 'dark', 'light']) if (c[k]) st.setProperty('--' + k, c[k]);
  st.setProperty('--on-primary', readable(c.primary));
  st.setProperty('--on-accent', readable(c.accent));
  const f = C.fonts || {};
  const fam = [[f.heading, f.headingWeights || '500;600;700'], [f.body, f.bodyWeights || '400;500;600;700'], [f.script, f.scriptWeights || '500']].filter(([n]) => n);
  if (fam.length) {
    const uniq = [...new Map(fam.map(([n, w]) => [n, w])).entries()];
    const href = 'https://fonts.googleapis.com/css2?' + uniq.map(([n, w]) => `family=${enc(n).replace(/%20/g, '+')}:wght@${w}`).join('&') + '&display=swap';
    const have = $('#wl-fonts');
    if (!have) document.head.append(Object.assign(document.createElement('link'), { id: 'wl-fonts', rel: 'stylesheet', href }));
    else { if (have.href !== href) have.href = href; if (have.rel === 'preload') { have.onload = null; have.addEventListener('load', () => { have.rel = 'stylesheet'; }, { once: true }); } }
  }
  if (f.heading) st.setProperty('--font-head', `"${f.heading}", ${f.headingFallback || 'system-ui, sans-serif'}`);
  if (f.script) st.setProperty('--font-script', `"${f.script}", cursive`);
  if (f.body) st.setProperty('--font-body', `"${f.body}", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`);
}

/* ---------- opening hours ---------- */
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const toMin = (s) => { const [h, m] = String(s).trim().split(':'); return (+h) * 60 + (+m || 0); };
function nowThere() {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: C.timeZone || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = (t) => (p.find((x) => x.type === t) || {}).value;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: (+g('hour')) * 60 + (+g('minute')) };
  } catch { const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
}
const hoursFor = (d) => { const v = (C.hours || {})[DAY_KEYS[d]]; return v && String(v).includes('-') ? String(v).split('-').map((s) => s.trim()) : null; };
function openNow() {
  if (!C.hours) return null;
  const n = nowThere(), h = hoursFor(n.day);
  if (h && n.min >= toMin(h[0]) && n.min < toMin(h[1])) return { open: true, until: h[1] };
  for (let k = 0; k < 7; k++) {
    const d = (n.day + k) % 7, x = hoursFor(d);
    if (x && (k > 0 || n.min < toMin(x[0]))) return { open: false, day: k === 0 ? ui('today') : k === 1 ? ui('tomorrow') : (L().days || [])[d], at: x[0] };
  }
  return { open: false };
}
/** Monday to Sunday, with days that share the same hours grouped: "Mon – Fri 08:00 – 17:00". */
function hoursGroups() {
  const order = [1, 2, 3, 4, 5, 6, 0], out = [];
  for (const d of order) {
    const h = hoursFor(d), val = h ? `${h[0]} – ${h[1]}` : ui('closed');
    const last = out[out.length - 1];
    if (last && last.val === val) { last.to = d; } else out.push({ from: d, to: d, val, closed: !h });
  }
  const short = L().daysShort || L().days || DAY_KEYS;
  return out.map((g) => ({ label: g.from === g.to ? short[g.from] : `${short[g.from]} – ${short[g.to]}`, val: g.val, closed: g.closed, today: (() => { const t = nowThere().day; const a = order.indexOf(g.from), b = order.indexOf(g.to), x = order.indexOf(t); return x >= a && x <= b; })() }));
}
function hoursTable(cls = 'hours') {
  if (!C.hours) return '';
  return `<table class="${cls}"><tbody>${hoursGroups().map((g) => `<tr${g.today ? ' class="is-today"' : ''}><th scope="row">${esc(g.label)}</th><td>${esc(g.val)}</td></tr>`).join('')}</tbody></table>`;
}
function openBadge() {
  const s = openNow();
  if (!s) return '';
  const msg = s.open ? ui('openUntil', { time: s.until }) : s.at ? ui('closedOpens', { day: s.day, time: s.at }) : ui('closed');
  return `<p class="open-badge${s.open ? ' is-open' : ''}"><span></span>${esc(msg)}</p>`;
}

/* ---------- contact links ---------- */
const K = () => C.contact || {};
const telHref = (p) => 'tel:' + (String(p).trim().startsWith('+') ? '+' : '') + digits(p);
const waHref = (text) => (digits(K().whatsapp) ? `https://wa.me/${digits(K().whatsapp)}${text ? '?text=' + enc(text) : ''}` : '');
const mailHref = (subject = '', body = '') => (K().email ? `mailto:${K().email}${subject || body ? '?' + [subject && 'subject=' + enc(subject), body && 'body=' + enc(body)].filter(Boolean).join('&') : ''}` : '');
const addressLines = () => [K().street, [K().city, K().region].filter(Boolean).join(', '), K().country].filter(has).map(tx);
const mapsLink = () => (K().mapsLink || K().googleBusiness || `https://www.google.com/maps/search/?api=1&query=${enc(addressLines().join(', ') || C.name)}`);
/** "Review us on Google": shown when contact.googleReview is set (the write-a-review link from the Google Business profile). */
const gReview = (cls = 'btn btn-line') => (has(K().googleReview) ? `<a class="${cls} g-review" href="${esc(K().googleReview)}" target="_blank" rel="noopener">${icon('google')}${esc(ui('reviewOnGoogle'))}</a>` : '');

/* ---------- header, footer, demo strip, WhatsApp button ---------- */
function logo(cls = '') {
  const lg = C.logo || {};
  const inner = lg.image
    ? `<img src="${esc(lg.image)}" alt="${esc(C.name)}" class="logo-img"${lg.height ? ` style="height:${+lg.height}px"` : ''}>`
    : `<span class="logo-mark" aria-hidden="true">${esc(lg.mark || (C.name || 'W').trim()[0])}</span><span class="logo-name">${esc(lg.text || C.name)}</span>`;
  return `<a class="logo ${cls}" href="${T.homeHref || './'}" >${inner}</a>`;
}
function demoStrip() {
  const d = C.demo;
  if (!d || !d.enabled) return '';
  const tiers = (d.tiers || []).map((x) => `<a href="${esc(x.url)}"${x.current ? ' aria-current="true"' : ''}><b>${esc(tx(x.label))}</b>${x.price ? `<span>${esc(x.price)}</span>` : ''}</a>`).join('');
  return `<aside class="demo-strip" aria-label="${esc(ui('demoLabel'))}"><p><b>${esc(ui('demoBadge'))}</b><span>${esc(tx(d.note) || ui('demoNote'))}</span></p>${tiers ? `<nav>${tiers}</nav>` : ''}</aside>`;
}
function header(page) {
  const items = T.nav();
  const links = items.map((n) => `<a href="${esc(n.href)}"${n.key === page ? ' aria-current="page"' : ''} data-key="${esc(n.key)}">${esc(n.label)}</a>`).join('');
  const other = langs[(langs.indexOf(lang) + 1) % langs.length];
  const langBtn = langs.length > 1 ? `<button class="hd-btn hd-lang" type="button" data-lang="${other}" aria-label="${other.toUpperCase()}: ${esc(ui('switchLang'))}">${other.toUpperCase()}</button>` : '';
  const themeBtn = C.darkMode !== false ? `<button class="hd-btn hd-theme" type="button" data-theme-toggle aria-label="${esc(ui('toggleTheme'))}">${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}</button>` : '';
  const cta = T.headerCta ? T.headerCta() : '';
  return `<a class="skip" href="#main">${esc(ui('skip'))}</a>
${demoStrip()}
<header class="hd${T.overlayHeader ? ' hd-over' : ''}" data-hd>
  <div class="hd-in">
    ${logo()}
    <nav class="hd-nav" aria-label="${esc(ui('menu'))}">${links}</nav>
    <div class="hd-tools">${langBtn}${themeBtn}${cta}
      <button class="hd-btn hd-burger" type="button" aria-expanded="false" aria-controls="menu" data-burger><span></span><span></span><span></span><b class="sr">${esc(ui('menu'))}</b></button>
    </div>
  </div>
  <div class="menu" id="menu" data-menu><nav aria-label="${esc(ui('menu'))}">${links}</nav>${T.menuExtra ? T.menuExtra() : ''}</div>
</header>`;
}
const SOCIAL = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'tripadvisor', 'google'];
function socialLinks(cls = 'social') {
  const s = C.social || {};
  const a = SOCIAL.filter((k) => has(s[k])).map((k) => `<a href="${esc(s[k])}" target="_blank" rel="noopener" aria-label="${k[0].toUpperCase() + k.slice(1)}">${icon(k)}</a>`).join('');
  return a ? `<p class="${cls}">${a}</p>` : '';
}
function footer() {
  const k = K(), cr = C.credit || { name: 'WebLuxe', url: 'https://webluxe.github.io/WebLuxe/' };
  const contact = [
    has(k.phone) && `<a href="${telHref(k.phone)}">${icon('phone')}${esc(k.phone)}</a>`,
    has(k.email) && `<a href="${mailHref()}">${icon('mail')}${esc(k.email)}</a>`,
    waHref() && `<a href="${waHref(tx(k.whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>`,
  ].filter(Boolean).join('');
  const addr = addressLines();
  return `<footer class="ft">
  <div class="wrap ft-in">
    <div class="ft-brand">${logo('logo-ft')}${has(C.tagline) ? `<p>${esc(tx(C.tagline))}</p>` : ''}${socialLinks()}</div>
    ${T.footerLinks ? `<nav class="ft-col" aria-label="${esc(ui('footerNav'))}"><h2>${esc(ui('explore'))}</h2>${T.footerLinks()}</nav>` : ''}
    ${contact || addr.length ? `<div class="ft-col"><h2>${esc(ui('contactTitle'))}</h2>${addr.length ? `<address><a href="${esc(mapsLink())}" target="_blank" rel="noopener">${icon('pin')}<span>${addr.map(esc).join('<br>')}</span></a></address>` : ''}${contact}</div>` : ''}
    ${C.hours ? `<div class="ft-col"><h2>${esc(ui('hoursTitle'))}</h2>${hoursTable('hours hours-ft')}</div>` : ''}
  </div>
  <div class="wrap ft-base">
    <p>© <span data-year>${new Date().getFullYear()}</span> ${esc(C.legalName || C.name)}. ${esc(ui('rights'))}</p>
    <p><a class="credit" href="${esc(cr.url)}" target="_blank" rel="noopener">${esc(ui('websiteBy'))} <b>${esc(cr.name)}</b></a></p>
  </div>
</footer>`;
}
function fab() {
  const h = waHref(tx(K().whatsappMessage));
  return h ? `<a class="fab" href="${h}" target="_blank" rel="noopener" aria-label="${esc(ui('whatsappUs'))}">${icon('wa')}<span class="fab-tip">${esc(ui('whatsappUs'))}</span></a>` : '';
}

/* ---------- SEO: title, description, Open Graph and schema.org data from config ---------- */
function setMeta(page) {
  const s = C.seo || {};
  const pageTitle = page === '404' ? ui('nfTitle') : T.pageTitle ? T.pageTitle(page) : '';
  const title = pageTitle ? `${pageTitle} | ${C.name}` : (tx(s.title) || C.name);
  const desc = (T.pageDescription && T.pageDescription(page)) || tx(s.description) || tx(C.tagline);
  document.title = title;
  const meta = (attr, key, val) => {
    if (!val) return;
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.append(m); }
    m.setAttribute('content', val);
  };
  meta('name', 'description', desc);
  meta('property', 'og:title', title);
  meta('property', 'og:description', desc);
  meta('property', 'og:site_name', C.name);
  meta('property', 'og:locale', LOCALE().replace('-', '_'));
  if (s.image) meta('property', 'og:image', sized(imgOf(s.image).src, 1200));
  meta('name', 'theme-color', (C.colors || {}).primary);
  if (s.favicon && !$('link[rel="icon"][data-wl]')) document.head.append(Object.assign(document.createElement('link'), { rel: 'icon', href: s.favicon }));
  if (s.favicon) { const f = $('link[rel="icon"]'); if (f) f.href = s.favicon; }
  if ((C.demo && C.demo.enabled) || page === '404') meta('name', 'robots', 'noindex');
  // the address Google should list for this page, and the same page in the other languages
  if (s.siteUrl && page !== '404') {
    const link = (rel, href, hl) => { let l = document.head.querySelector(`link[rel="${rel}"]${hl ? `[hreflang="${hl}"]` : ':not([hreflang])'}`); if (!l) { l = document.createElement('link'); l.rel = rel; if (hl) l.hreflang = hl; document.head.append(l); } l.href = href; };
    const u = new URL((location.pathname.split('/').pop() || '').replace(/^index\.html$/, ''), String(s.siteUrl).replace(/\/?$/, '/'));
    const q = new URLSearchParams(location.search); q.delete('lang'); q.delete('demo'); u.search = q.toString();
    const inLang = (l) => { const x = new URL(u.href); if (l !== langs[0]) x.searchParams.set('lang', l); return x.href; };
    link('canonical', inLang(lang));
    if (langs.length > 1) { langs.forEach((l) => link('alternate', inLang(l), l)); link('alternate', inLang(langs[0]), 'x-default'); }
  }
  document.documentElement.lang = lang;
}
function businessSchema() {
  const k = K(), s = C.social || {};
  const spec = C.hours ? [1, 2, 3, 4, 5, 6, 0].map((d) => { const h = hoursFor(d); return h && { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d], opens: h[0], closes: h[1] }; }).filter(Boolean) : undefined;
  const o = {
    '@context': 'https://schema.org', '@type': (C.seo && C.seo.schemaType) || 'LocalBusiness', name: C.name,
    description: tx((C.seo || {}).description) || tx(C.tagline) || undefined,
    url: (C.seo && C.seo.siteUrl) || location.origin + location.pathname.replace(/[^/]*$/, ''),
    image: (C.seo && C.seo.image) ? sized(imgOf(C.seo.image).src, 1200) : undefined,
    logo: (C.logo && C.logo.image) ? new URL(C.logo.image, location.href).href : undefined,
    telephone: k.phone || undefined, email: k.email || undefined,
    address: addressLines().length ? { '@type': 'PostalAddress', streetAddress: tx(k.street) || undefined, addressLocality: tx(k.city) || undefined, addressRegion: tx(k.region) || undefined, postalCode: k.postalCode || undefined, addressCountry: k.countryCode || tx(k.country) || undefined } : undefined,
    geo: k.lat ? { '@type': 'GeoCoordinates', latitude: k.lat, longitude: k.lng } : undefined,
    openingHoursSpecification: spec && spec.length ? spec : undefined,
    sameAs: [...SOCIAL.map((x) => s[x]), k.googleBusiness].filter(has),
    hasMap: k.googleBusiness || undefined,
    priceRange: (C.seo && C.seo.priceRange) || undefined,
  };
  return o;
}
function setSchema() {
  let el = $('#wl-schema');
  if (!el) { el = Object.assign(document.createElement('script'), { id: 'wl-schema', type: 'application/ld+json' }); document.head.append(el); }
  const base = businessSchema();
  el.textContent = JSON.stringify(T.schema ? T.schema(base) : base);
}

/* ---------- the pop-up used by the demo, forms and confirmations ---------- */
function dialog(title, body, actions = '') {
  let d = $('#wl-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'wl-dialog'; d.className = 'dlg';
    document.body.append(d);
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  }
  d.innerHTML = `<div class="dlg-in"><button class="dlg-x" type="button" data-close aria-label="${esc(ui('close'))}">${icon('close')}</button><h2>${esc(title)}</h2>${body}<div class="dlg-actions">${actions}<button class="btn btn-primary" type="button" data-close>${esc(ui('ok'))}</button></div></div>`;
  d.showModal();
}
const demoOn = () => !!(C.demo && C.demo.enabled);
function demoShow(kind, text) {
  const what = { wa: ui('demoWa'), tel: ui('demoTel'), mail: ui('demoMail'), form: ui('demoForm') }[kind] || '';
  const studio = C.demo && digits(C.demo.studioWhatsapp) ? `<a class="btn btn-wa" href="https://wa.me/${digits(C.demo.studioWhatsapp)}?text=${enc(ui('demoStudioMsg', { site: C.name }))}" target="_blank" rel="noopener" data-real>${icon('wa')}${esc(ui('demoStudio'))}</a>` : '';
  dialog(ui('demoTitle'), `<p>${esc(what)}</p>${text ? `<pre class="dlg-msg">${esc(text)}</pre>` : ''}`, studio);
}

/* ---------- forms: send to the endpoint in config, or fall back to email ---------- */
function formSummary(form) {
  const lines = [];
  for (const el of form.elements) {
    if (!el.name || el.type === 'file' || el.type === 'submit' || el.type === 'hidden' || el.name.startsWith('_')) continue;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
    const v = el.tagName === 'SELECT' ? el.options[el.selectedIndex]?.text : el.value;
    if (!v) continue;
    const lab = el.closest('label')?.querySelector('.lbl')?.textContent || el.dataset.label || el.name;
    lines.push(`${lab}: ${v}`);
  }
  return lines.join('\n');
}
/** The form's main fields, for the inbox. */
/** The deposit payment link from config (payments.link), with {amount}, {currency} and {ref} filled in. */
const payHref = (amount, currency, ref) => String((C.payments || {}).link || '').replace(/\{amount\}/g, amount).replace(/\{currency\}/g, currency).replace(/\{ref\}/g, enc(ref));
const formFields = (form) => Object.fromEntries(['name', 'email', 'phone', 'country', 'message'].map((k) => [k, form.elements[k] ? form.elements[k].value : '']));
/** Every request is also written to the owner's inbox (a Google Sheet, see admin/inbox.gs) when inbox.url is set. */
function inboxSend(record) {
  const url = (C.inbox || {}).url;
  if (!url || demoOn()) return;
  try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ site: C.name, lang, page: location.pathname.split('/').pop() || 'index.html', ...record }) }); } catch { /* never block the visitor */ }
}
async function sendForm(form, { subject = '', summary = '', record = null } = {}) {
  if (!form.reportValidity()) return false;
  const status = $('[data-status]', form), btn = $('[type="submit"]', form);
  const body = summary || formSummary(form);
  const show = (cls, msg) => { if (status) { status.className = 'form-status ' + cls; status.textContent = msg; status.hidden = false; } };
  if (demoOn()) { demoShow('form', body); show('ok', ui('formDemoDone')); return true; }
  inboxSend(record || { type: 'message', ...formFields(form) });
  const endpoint = (C.form || {}).endpoint;
  if (endpoint) {
    btn && (btn.disabled = true); show('wait', ui('formSending'));
    try {
      const fd = new FormData(form);
      if (subject) fd.append('_subject', subject);
      const r = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(r.status);
      form.reset(); show('ok', ui('formSent')); return true;
    } catch {
      show('err', ui('formError', { phone: K().phone || K().email || '' })); return false;
    } finally { btn && (btn.disabled = false); }
  }
  const m = mailHref(subject, body);
  if (m) { location.href = m; show('ok', ui('formMailto')); return true; }
  show('err', ui('formError', { phone: K().phone || '' }));
  return false;
}

/* ---------- motion: things arrive as you scroll, numbers count up ---------- */
let io;
function reveal() {
  const els = $$('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  io && io.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((e) => { if (!e.classList.contains('in')) io.observe(e); });
}
function countUp() {
  const els = $$('[data-count]');
  const run = (el) => {
    const end = parseFloat(el.dataset.count), dec = (String(el.dataset.count).split('.')[1] || '').length;
    if (reduced) { el.textContent = end.toLocaleString('en-US', { minimumFractionDigits: dec }); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }), { threshold: 0.5 });
  els.forEach((e) => o.observe(e));
}

/* ---------- full-screen photos: swipe on phones, arrow keys on computers ---------- */
function lightbox(items, start = 0) {
  let i = start, d = $('#wl-lb');
  if (!d) {
    d = document.createElement('dialog'); d.id = 'wl-lb'; d.className = 'lb';
    d.innerHTML = `<button class="lb-x" type="button" data-lb-x aria-label="${esc(ui('close'))}">${icon('close')}</button><button class="lb-nav lb-prev" type="button" data-lb-prev aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><figure class="lb-fig"><img alt=""><figcaption></figcaption></figure><button class="lb-nav lb-next" type="button" data-lb-next aria-label="${esc(ui('next'))}">${icon('chevR')}</button><p class="lb-n" aria-live="polite"></p>`;
    document.body.append(d);
  }
  const img = $('img', d), cap = $('figcaption', d), n = $('.lb-n', d);
  const show = (k, dir = 0) => {
    i = (k + items.length) % items.length;
    const it = items[i];
    img.classList.remove('lb-in'); void img.offsetWidth;
    img.style.setProperty('--dx', dir * 40 + 'px');
    img.src = sized(imgOf(it.src || it).src, 1600); img.alt = tx(it.alt) || '';
    img.classList.add('lb-in');
    cap.textContent = tx(it.caption) || ''; n.textContent = `${i + 1} / ${items.length}`;
    [i + 1, i - 1].forEach((x) => { const p = items[(x + items.length) % items.length]; if (p) new Image().src = sized(imgOf(p.src || p).src, 1600); });
  };
  d.onclick = (e) => { if (e.target.closest('[data-lb-x]') || e.target === d) d.close(); else if (e.target.closest('[data-lb-prev]')) show(i - 1, -1); else if (e.target.closest('[data-lb-next]')) show(i + 1, 1); };
  d.onkeydown = (e) => { if (e.key === 'ArrowRight') show(i + 1, 1); if (e.key === 'ArrowLeft') show(i - 1, -1); };
  let x0 = null;
  d.onpointerdown = (e) => { x0 = e.clientX; };
  d.onpointerup = (e) => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 45) show(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); };
  $$('.lb-nav', d).forEach((b) => (b.hidden = items.length < 2));
  show(start);
  d.showModal();
}

/* ---------- a row of slides you can swipe, that also moves on its own ---------- */
function carousel(root, { auto = 5500 } = {}) {
  const track = $('[data-track]', root), slides = $$('[data-slide]', root), dots = $('[data-dots]', root);
  if (!track || slides.length < 2) return;
  let i = 0, timer, paused = false;
  if (dots) {
    dots.innerHTML = slides.map((_, k) => `<button type="button" aria-label="${esc(ui('slide', { n: k + 1 }))}"${k === 0 ? ' aria-current="true"' : ''}></button>`).join('');
    dots.onclick = (e) => { const b = e.target.closest('button'); if (b) go([...dots.children].indexOf(b)); };
  }
  const go = (k) => { i = (k + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' }); };
  const mark = () => { const x = track.scrollLeft; let best = 0; slides.forEach((s, k) => { if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = k; }); i = best; if (dots) [...dots.children].forEach((b, k) => b.toggleAttribute('aria-current', k === i)); };
  track.addEventListener('scroll', () => { clearTimeout(track._t); track._t = setTimeout(mark, 80); }, { passive: true });
  $('[data-prev]', root)?.addEventListener('click', () => go(i - 1));
  $('[data-next]', root)?.addEventListener('click', () => go(i + 1));
  if (auto && !reduced) {
    ['pointerdown', 'focusin', 'mouseenter'].forEach((ev) => root.addEventListener(ev, () => { paused = true; }));
    root.addEventListener('mouseleave', () => { paused = false; });
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);
    timer = setInterval(() => { if (!paused && visible && !document.hidden) go(i + 1); }, auto);
  }
}

/* ---------- wiring that every page needs ---------- */
function wireCore() {
  const hd = $('[data-hd]'), burger = $('[data-burger]'), menu = $('[data-menu]');
  const onScroll = () => hd && hd.classList.toggle('is-scrolled', scrollY > 24);
  onScroll();
  window.onscroll = null;
  addEventListener('scroll', onScroll, { passive: true });
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    document.documentElement.classList.toggle('menu-open', open);
  };
  burger?.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu?.classList.contains('open')) { setMenu(false); burger.focus(); } });
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang; store.set('wl-lang', lang);
    const y = scrollY; render(); scrollTo(0, y);
  }));
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    store.set('wl-theme', dark ? 'dark' : 'light');
  }));
  $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
  $$('[data-map]').forEach((m) => m.addEventListener('click', () => {
    m.outerHTML = `<div class="${esc(m.className)}"><iframe src="${esc(m.dataset.map)}" title="${esc(ui('mapTitle'))}" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
  }, { once: true }));
}
let demoWired = false;
function wireDemo() {
  if (demoWired || !demoOn()) return;
  demoWired = true;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-real')) return;
    const h = a.getAttribute('href');
    if (/^https:\/\/wa\.me\//.test(h)) { e.preventDefault(); demoShow('wa', new URL(h).searchParams.get('text') || ''); }
    else if (h.startsWith('tel:')) { e.preventDefault(); demoShow('tel', h.slice(4)); }
    else if (h.startsWith('mailto:')) { e.preventDefault(); demoShow('mail', decodeURIComponent((h.split('body=')[1] || '').split('&')[0])); }
  }, true);
}

/** A section heading block used by every tier. */
const head = (eyebrow, title, lead = '', cls = '') => `<header class="sec-head ${cls}" data-reveal>${has(eyebrow) ? `<p class="eyebrow">${esc(tx(eyebrow))}</p>` : ''}<h2 class="h2">${esc(tx(title))}</h2>${has(lead) ? `<p class="lead">${esc(tx(lead))}</p>` : ''}</header>`;
/** A map that only loads when tapped (keeps the page fast). */
const mapBox = (cls = 'map') => (has(K().mapEmbed) ? `<button type="button" class="${cls}" data-map="${esc(K().mapEmbed)}" aria-label="${esc(ui('showMap'))}"><span class="map-btn">${icon('pin')}${esc(ui('showMap'))}</span></button>` : '');

/* ---------- page changes: a cover sweeps in with the next page's name, the page opens under it, the cover leaves ---------- */
const TX_KEY = 'wl-tx';
const txOn = () => !!T.transitions && !reduced && (C.transitions !== false);
function txEl() {
  let el = $('#wl-tx');
  if (!el) {
    el = document.createElement('div'); el.id = 'wl-tx'; el.className = 'tx'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="tx-body"><span class="tx-mark">${esc((C.logo || {}).mark || (C.name || 'W')[0])}</span><span class="tx-label"></span></div>`;
    document.body.append(el);
  }
  return el;
}
function txWire() {
  if (!txOn()) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-real')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // a link within this page
    e.preventDefault();
    const label = (a.dataset.tx || a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    const el = txEl();
    $('.tx-label', el).textContent = label;
    try { sessionStorage.setItem(TX_KEY, label); } catch { /* fine */ }
    el.classList.remove('is-out'); void el.offsetWidth; el.classList.add('is-in');
    setTimeout(() => { location.href = url.href; }, T.txIn || 650);
  });
  // coming back with the Back button: the page is restored as it was, so take the cover away
  addEventListener('pageshow', (e) => { if (e.persisted) { const el = $('#wl-tx'); el && el.classList.remove('is-in', 'is-out'); } });
}
function txArrive() {
  let label = null;
  try { label = sessionStorage.getItem(TX_KEY); sessionStorage.removeItem(TX_KEY); } catch { /* fine */ }
  document.documentElement.classList.remove('tx-wait');
  if (label == null || !txOn()) return;
  const el = txEl();
  $('.tx-label', el).textContent = label;
  el.classList.add('is-in', 'tx-hold');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.classList.remove('tx-hold', 'is-in'); el.classList.add('is-out');
    setTimeout(() => el.classList.remove('is-out'), T.txOut || 1000);
  }));
}

/* ---------- the opening: once per visit, on the home page, skippable ---------- */
function introPlay(page) {
  const root = document.documentElement, ic = C.intro || {};
  let seen = false;
  try { seen = sessionStorage.getItem('wl-intro') === '1'; } catch { /* fine */ }
  if (!T.intro || ic.enabled === false || page !== 'home' || reduced || (seen && ic.every !== 'visit') || root.classList.contains('tx-came')) { root.classList.remove('intro-on'); root.classList.add('intro-done'); return; }
  try { sessionStorage.setItem('wl-intro', '1'); } catch { /* fine */ }
  const el = document.createElement('div');
  el.className = 'opening'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = T.intro() + `<button class="opening-skip" type="button" tabindex="-1">${esc(ui('introSkip'))}</button>`;
  document.body.append(el);
  root.classList.add('intro-on');
  let over = false;
  const end = () => {
    if (over) return; over = true;
    el.classList.add('leave');
    setTimeout(() => { root.classList.remove('intro-on'); root.classList.add('intro-done'); }, T.introReveal || 250);
    setTimeout(() => el.remove(), T.introLeave || 1300);
  };
  setTimeout(end, T.introLength || 3400);
  el.addEventListener('click', end);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') end(); });
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('run')));
}

/** The page shown for an address that does not exist (404.html). */
function notFound() {
  return `<section class="sec nf"><div class="wrap nf-in"><p class="eyebrow">404</p><h1 class="h1">${esc(ui('nfTitle'))}</h1><p class="lead">${esc(ui('nfText'))}</p>
    <p class="btns"><a class="btn btn-primary btn-lg" href="./">${esc(ui('nfHome'))}</a>${waHref() ? `<a class="btn btn-wa btn-lg" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p></div></section>`;
}
/* ---------- one swipe, one section (home page) ----------
   The browser snaps a whole screen at a time. Each section is sized to the screen below the header;
   a thin strip (a band, a ticker) joins the section above it, and a list of rooms snaps room by room.
   A section that ends up taller than the screen simply scrolls inside before moving on. */
let snapRO = null;
const docTop = (el) => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };
function snapPages() {
  const root = document.documentElement;
  const page = document.body.dataset.page || 'home';
  const on = page !== '404' && !reduced && T.snap !== false && (C.effects || {}).snap !== false;
  root.classList.toggle('snap', on);
  if (snapRO) { snapRO.disconnect(); snapRO = null; }
  if (!on) return;
  const HD = 61;   // the header once the page has scrolled (60px + its line)
  const measure = () => {
    const port = innerHeight - HD;
    $$('[data-fit]').forEach((e) => { e.style.removeProperty('zoom'); e.removeAttribute('data-fit'); });
    $$('[data-fitpad]').forEach((e) => { e.style.removeProperty('padding-top'); e.style.removeProperty('padding-bottom'); e.removeAttribute('data-fitpad'); });
    $$('main .snap-pt').forEach((e) => { e.classList.remove('snap-pt'); e.style.removeProperty('scroll-margin-top'); });
    const ft = $('.ft'); if (ft) ft.classList.add('snap-end');
    $$('main > *').forEach((e) => { e.style.removeProperty('--strip'); e.classList.remove('snap-strip', 'snap-hide'); });
    const kids = $$('main > *').filter((el) => el.offsetHeight > 0);
    const hero = kids[0];
    if (hero) {
      const top = Math.max(0, Math.round(docTop(hero)));
      hero.style.setProperty('--hero-top', top + 'px'); hero.style.scrollMarginTop = top + 'px';
    }
    for (const el of kids) {
      if (page !== 'home' || el.offsetHeight >= port * 0.45 || el === hero) continue;   // inner pages: every section stays, short or long
      el.classList.add('snap-strip');
      const prev = el.previousElementSibling;
      if (!prev) continue;
      prev.style.setProperty('--strip', el.offsetHeight + 'px');
      const room = prev === hero ? innerHeight - (parseFloat(hero.style.getPropertyValue('--hero-top')) || 0) : port;
      if (prev.offsetHeight + el.offsetHeight > room + 3) { prev.style.removeProperty('--strip'); el.classList.add('snap-hide'); }
    }
    for (const el of kids) {
      if (el.classList.contains('snap-strip') || el.classList.contains('pin-spacer')) continue;   // a pinned scene brings its own snap points
      const rows = $$('.rows > .row', el);
      if (rows.length > 1 && el.offsetHeight > port * 1.4) {
        const top = docTop(el);
        const head = $('.sec-head', el);
        el.style.setProperty('--fh', Math.round(docTop(rows[0]) - top) + 'px');
        if (head) { head.classList.add('snap-pt'); head.style.scrollMarginTop = Math.round(docTop(head) - top + HD) + 'px'; }
        rows.forEach((r, i) => { if (i > 0 || !head || docTop(r) + r.offsetHeight - top > port + 4) r.classList.add('snap-pt'); });
      } else {
        el.classList.add('snap-pt');
        // a few pixels too tall: take them from the top padding so the section is exactly one screen
        el.style.removeProperty('padding-top');
        const over = el.offsetHeight - port;
        if (el !== hero && over > 0 && over < 40) { const pt = parseFloat(getComputedStyle(el).paddingTop); if (pt - over >= 8) el.style.paddingTop = (pt - over) + 'px'; }
      }
    }
    fitShort(kids, hero, port);
  };
  /* Phones shorter than the design was drawn for (most iPhones, compact Androids): the home page keeps one section
     per screen by drawing the sections a little smaller, all by the same amount (never under 80%), instead of
     letting them run past the bottom of the screen. The hero first gives up some of the space above its title. */
  const fitShort = (kids, hero, port) => {
    if (page !== 'home' || innerWidth >= 760 || innerHeight <= innerWidth || !(window.CSS && CSS.supports && CSS.supports('zoom', '0.9'))) return;
    const MIN = 0.8;
    const tall = (el) => el.getBoundingClientRect().height;
    const flow = (el) => [...el.children].filter((c) => { if (/^(IMG|VIDEO|CANVAS|PICTURE|SVG)$/i.test(c.tagName) || !c.offsetHeight) return false; const p = getComputedStyle(c).position; return p !== 'absolute' && p !== 'fixed'; });
    const pad = (el) => { const cs = getComputedStyle(el); return parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom); };
    const need = (el, room) => { const h = tall(el), p = Math.min(pad(el), room * 0.5); return h > room + 3 ? (room - p) / Math.max(1, h - p) : 1; };
    const draw = (el, k) => flow(el).forEach((c) => { if (k < 0.995) { c.style.zoom = k.toFixed(3); c.dataset.fit = '1'; } else { c.style.removeProperty('zoom'); c.removeAttribute('data-fit'); } });
    const settle = (list, k) => {   // list: [element, room]; the gaps between things do not shrink, so check and go a little further if needed
      for (let i = 0; i < 4; i++) {
        list.forEach(([el]) => draw(el, k));
        if (k <= MIN || !list.some(([el, room]) => tall(el) > room + 2)) break;
        k = Math.max(MIN, k * 0.965);
      }
    };
    if (hero) {
      const room = innerHeight - (parseFloat(hero.style.getPropertyValue('--hero-top')) || 0) - (parseFloat(hero.style.getPropertyValue('--strip')) || 0);
      let over = tall(hero) - room;
      if (over > 3) {
        const pe = [hero, ...flow(hero)].find((e) => parseFloat(getComputedStyle(e).paddingTop) > HD + 40);
        if (pe) { pe.style.paddingTop = Math.max(HD + 24, parseFloat(getComputedStyle(pe).paddingTop) - over) + 'px'; pe.dataset.fitpad = '1'; over = tall(hero) - room; }
        if (over > 3) settle([[hero, room]], Math.max(MIN, need(hero, room)));
        // the last few pixels come from the space under the hero's content
        over = tall(hero) - room;
        if (over > 2) {
          const be = [hero, ...flow(hero)].find((e) => parseFloat(getComputedStyle(e).paddingBottom) > 28);
          if (be) { const z = parseFloat(be.style.zoom) || 1, pb = parseFloat(getComputedStyle(be).paddingBottom); be.style.paddingBottom = Math.max(14, pb - over / z) + 'px'; be.dataset.fitpad = '1'; }
        }
      }
    }
    const list = [];
    for (const el of kids) {
      if (el === hero || el.classList.contains('snap-strip') || el.classList.contains('pin-spacer') || el.hasAttribute('data-nofit') || !el.offsetHeight) continue;   // data-nofit: a scene that sizes itself
      const rows = el.classList.contains('snap-pt') ? [] : $$('.rows > .row', el);
      if (rows.length) rows.forEach((r) => list.push([r, port])); else if (el.classList.contains('snap-pt')) list.push([el, port]);
    }
    const k = Math.max(MIN, Math.min(1, ...list.map(([el, room]) => need(el, room))));
    if (k < 0.995) settle(list, k);
    // still a little too tall at the smallest size: take the rest from the section's own top and bottom space
    list.forEach(([el, room]) => {
      const over = tall(el) - room;
      if (over <= 2) return;
      const cs = getComputedStyle(el), pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom), spare = pt + pb - 20;
      if (spare < over) return;
      el.style.paddingTop = (pt - over * pt / (pt + pb)) + 'px'; el.style.paddingBottom = (pb - over * pb / (pt + pb)) + 'px'; el.dataset.fitpad = '1';
    });
  };
  // The stops are re-made with the browser's own snapping switched off. Otherwise, in the moment between the old
  // stops going and the new ones arriving, the browser takes the only stop left (the footer, or a pinned scene)
  // as "the section on screen" and carries the page there: after a rotation, an answer opening, a form growing.
  const fit = () => {
    const live = root.classList.contains('snap-on');
    if (live) root.classList.remove('snap-on');
    try { measure(); } finally { if (live) { void root.offsetHeight; root.classList.add('snap-on'); } }
  };
  let t = 0;
  const later = () => { clearTimeout(t); t = setTimeout(() => { fit(); snapPages.realign && snapPages.realign(); }, 120); };
  fit();
  /* A page that swaps its sections for others (the booking form for its confirmation) does it through this: the
     browser's snapping is off while the old sections go, the page is put at the top of the new one, then it is back on. */
  snapPages.swap = (change) => {
    const live = root.classList.contains('snap-on');
    if (live) root.classList.remove('snap-on');
    change();
    scrollTo({ top: 0, behavior: 'instant' });
    measure();
    if (live) { void root.offsetHeight; scrollTo({ top: 0, behavior: 'instant' }); root.classList.add('snap-on'); }
  };
  if (!root.classList.contains('snap-on')) {
    const settleOn = () => setTimeout(() => { const y = scrollY; root.classList.add('snap-on'); scrollTo({ top: y, behavior: 'instant' }); }, 700);
    if (document.readyState === 'complete') settleOn(); else addEventListener('load', settleOn, { once: true });
  }
  snapRO = new ResizeObserver(later);
  snapRO.observe($('main'));
  if (!snapPages.bound) { snapPages.bound = true; snapWheel(); addEventListener('resize', () => document.documentElement.classList.contains('snap') && later()); addEventListener('load', () => document.documentElement.classList.contains('snap') && later()); }
}

/* computers: one wheel step, one trackpad swipe or one key press glides exactly one section (the trackpad's
   leftover momentum is ignored); inside a section taller than the screen, or anything that scrolls by itself,
   the page scrolls normally. Touch screens use the browser's own snapping (core.css). */
function snapWheel() {
  const root = document.documentElement;
  let busy = false, lastT = 0, lastAbs = 0, settle = false;
  const points = () => { const max = root.scrollHeight - innerHeight; return $$('.snap-pt, .snap-mark, .snap-end').map((el) => { if (el.classList.contains('snap-end')) return { y: Math.max(0, Math.round(max)), h: innerHeight }; const m = parseFloat(getComputedStyle(el).scrollMarginTop) || 0; return { y: Math.min(Math.round(max), Math.max(0, Math.round(docTop(el) - m))), h: el.offsetHeight + m }; }).sort((a, b) => a.y - b.y); };
  const innerScroll = (el, dir) => { for (; el && el !== document.body; el = el.parentElement) { const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight + 1 && (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0)) return true; } return false; };
  const active = () => root.classList.contains('snap') && innerWidth >= 760 && !matchMedia('(pointer: coarse)').matches && !root.classList.contains('menu-open') && !$('dialog[open]');
  // is the page inside a section taller than the screen, with more of it to read in this direction?
  const reading = (dir) => { const y = scrollY, vh = innerHeight, cur = points().filter((p) => p.y <= y + 2).pop(); return !!(cur && cur.h > vh + 2 && (dir > 0 ? y + vh < cur.y + cur.h - 2 : y > cur.y + 2)); };
  // the glide: about a second, easing in and out (a little longer for a longer jump)
  const glide = (to, done) => {
    const from = scrollY, d = to - from;
    if (reduced || Math.abs(d) < 2) { scrollTo({ top: to, behavior: 'instant' }); if (done) done(); return; }
    const dur = Math.min(1500, 1000 + Math.abs(d) * 0.12);
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / dur); scrollTo({ top: Math.round(from + d * ease(k)), behavior: 'instant' }); if (k < 1) requestAnimationFrame(step); else if (done) done(); };
    requestAnimationFrame(step);
  };
  snapPages.glide = (to) => { if (busy) return; busy = true; glide(to, () => { busy = false; settle = true; }); };
  const go = (dir, to) => {
    const y = scrollY, P = points();
    const next = to != null ? to : dir > 0 ? P.find((p) => p.y > y + 2) : P.filter((p) => p.y < y - 2).pop();
    if (!next) return;
    busy = true;
    glide(next.y, () => { busy = false; settle = true; });
  };
  // after the layout moves (fonts, photos, a re-measure), a page resting a little off a section settles back onto it
  snapPages.realign = () => { if (!active() || busy) return; const y = scrollY; let best = null; for (const p of points()) if (!best || Math.abs(p.y - y) < Math.abs(best.y - y)) best = p; if (best && Math.abs(best.y - y) > 1 && Math.abs(best.y - y) < 80 && !reading(1)) scrollTo({ top: best.y, behavior: 'instant' }); };
  addEventListener('wheel', (e) => {
    if (!active() || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const dir = Math.sign(e.deltaY);
    if (!dir || innerScroll(e.target, dir) || reading(dir)) return;
    e.preventDefault();
    const now = performance.now(), gap = now - lastT, abs = Math.abs(e.deltaY);
    lastT = now;
    const fresh = gap > 220 || abs > lastAbs * 1.6 + 8;   // a new gesture, not the tail of the last one
    lastAbs = abs;
    if (busy || (settle && !fresh)) return;
    settle = false;
    go(dir);
  }, { passive: false });
  addEventListener('keydown', (e) => {
    if (!active() || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select, button, [contenteditable], .cal')) return;
    const k = e.key;
    const dir = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey) ? 1 : k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey) ? -1 : 0;
    if (k === 'Home' || k === 'End') { e.preventDefault(); const P = points(); if (P.length) go(0, k === 'Home' ? { y: 0 } : P[P.length - 1]); return; }
    if (!dir || reading(dir)) return;
    e.preventDefault();
    if (!busy) go(dir);
  });
}

/* ---------- phones: a list shown one at a time with buttons, never a sideways swipe ---------- */
function pager(list) {
  if (!list || list.dataset.pg) return;
  const items = [...list.children];
  if (items.length < 2) return;
  list.dataset.pg = '1';
  const nav = document.createElement('div');
  nav.className = 'pg-nav';
  nav.innerHTML = `<button type="button" class="pg-b" data-pgo="-1" aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><span class="pg-n" aria-live="polite"></span><button type="button" class="pg-b" data-pgo="1" aria-label="${esc(ui('next'))}">${icon('chevR')}</button>`;
  list.after(nav);
  let i = 0;
  const show = (k) => {
    i = (k + items.length) % items.length;
    items.forEach((el, j) => { el.classList.toggle('pg-on', j === i); if (j === i) el.classList.add('in'); });
    $('.pg-n', nav).textContent = `${i + 1} / ${items.length}`;
  };
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-pgo]'); if (b) show(i + Number(b.dataset.pgo)); });
  show(0);
}

function render() {
  const page = document.body.dataset.page || 'home';
  const app = $('#app');
  const main = (T.pages[page] || (page === '404' ? notFound : T.pages.home))();
  app.innerHTML = `${header(page)}<main id="main" tabindex="-1">${main}</main>${footer()}${fab()}${T.after ? T.after(page) : ''}`;
  document.documentElement.classList.remove('menu-open');
  setMeta(page); setSchema(); wireCore();
  T.wire && T.wire(page);
  snapPages();
  reveal(); countUp(); loadLater();
  document.documentElement.classList.add('ready');
}
function boot(tier) {
  T = tier;
  applyBrand(); wireDemo(); render();
  txArrive(); txWire(); introPlay(document.body.dataset.page || 'home');
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && setTimeout(() => t.scrollIntoView(), 60); }
}
/* ---------- availability calendar (tiers add it with  @uses cal  at the top of src/tier.js) ----------
   Shows months of days. Booked nights are crossed out. A guest taps a check-in day, then a check-out
   day; the calendar refuses ranges that are too short or that run through a booked night.
   booked: [["2026-12-20", "2027-01-03"], ...]  = check-in day to check-out day (that morning is free). */
const CD = {
  iso: (d) => d.toISOString().slice(0, 10),
  add: (s, n) => CD.iso(new Date(new Date(s + 'T00:00:00Z').getTime() + n * 864e5)),
  today: () => CD.iso(new Date(Date.now() - new Date().getTimezoneOffset() * 6e4)),
  nights: (a, b) => (a && b ? Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 864e5) : 0),
  month: (ym, k) => { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m - 1 + k, 1)).toISOString().slice(0, 7); },
  fmt: (s, o) => new Intl.DateTimeFormat(LOCALE(), { timeZone: 'UTC', ...o }).format(new Date(s.length === 7 ? s + '-01T00:00:00Z' : s + 'T00:00:00Z')),
};
CD.nice = (s) => (s ? CD.fmt(s, { weekday: 'short', day: 'numeric', month: 'short' }) : '');
/** True when the night that starts on day d is already booked. */
const nightTaken = (booked, d) => (booked || []).some((r) => r && d >= r[0] && d < r[1]);
/** First free night on or after day d (looks a year ahead). */
const nextFree = (booked, d) => { for (let k = 0; k < 366; k++) { const x = CD.add(d, k); if (!nightTaken(booked, x)) return x; } return ''; };

/**
 * calendar(root, { months, booked: () => [], minFor: (d) => n, price: (d) => 'short text', in, out, onChange(in, out) })
 * Returns { set(in, out), get(), redraw() }.
 */
function calendar(root, o) {
  let a = o.in || '', b = o.out || '', msg = '';
  let view = (a || CD.today()).slice(0, 7);
  const t0 = CD.today();
  const booked = () => (o.booked ? o.booked() : []);
  const free = (d) => !nightTaken(booked(), d);
  const rangeFree = (x, y) => { for (let d = x; d < y; d = CD.add(d, 1)) if (!free(d)) return false; return true; };
  const minFor = (d) => (o.minFor ? o.minFor(d) : 1);
  const week = Array.from({ length: 7 }, (_, i) => CD.fmt(CD.add('2024-01-01', i), { weekday: 'short' }).replace('.', '').slice(0, 2));
  const hint = () => (a && b ? `${CD.nice(a)} → ${CD.nice(b)} · ${ui('nNights', { n: CD.nights(a, b) })}` : a ? ui('calPickOut', { n: minFor(a) }) : ui('calPickIn'));
  const month = (ym) => {
    const first = new Date(ym + '-01T00:00:00Z'), lead = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    let h = '<span class="cal-x" aria-hidden="true"></span>'.repeat(lead);
    for (let n = 1; n <= days; n++) {
      const d = `${ym}-${String(n).padStart(2, '0')}`, past = d < t0, taken = free(d) === false;
      const choosingOut = a && !b && d > a;
      const ok = !past && (choosingOut ? rangeFree(a, d) || !taken : !taken); // past a booked night, a free day starts a new stay
      const cls = ['cal-d', past && 'is-past', taken && 'is-taken', d === t0 && 'is-today', d === a && 'is-a', d === b && 'is-b', a && b && d > a && d < b && 'is-in',
        choosingOut && ok && CD.nights(a, d) < minFor(a) && 'is-short'].filter(Boolean).join(' ');
      const p = o.price && !past && !taken ? o.price(d) : '';
      h += `<button type="button" class="${cls}" data-d="${d}"${ok ? '' : ' disabled'} aria-pressed="${d === a || d === b}" aria-label="${esc(CD.nice(d))}${taken ? ', ' + esc(ui('calBooked')) : ''}"><span>${n}</span>${p ? `<small>${esc(p)}</small>` : ''}</button>`;
    }
    return h;
  };
  const draw = () => {
    const n = o.months || 2;
    root.innerHTML = `<div class="cal-top">
      <button type="button" class="cal-nav" data-cal="-1" aria-label="${esc(ui('prev'))}"${view <= t0.slice(0, 7) ? ' disabled' : ''}>${icon('chevL')}</button>
      <p class="cal-msg${msg ? ' is-err' : ''}" aria-live="polite">${esc(msg || hint())}</p>
      <button type="button" class="cal-nav" data-cal="1" aria-label="${esc(ui('next'))}">${icon('chevR')}</button></div>
      <div class="cal-ms">${Array.from({ length: n }, (_, k) => { const ym = CD.month(view, k); return `<div class="cal-m${k ? ' cal-more' : ''}"><p class="cal-t">${esc(CD.fmt(ym, { month: 'long', year: 'numeric' }))}</p><div class="cal-g">${week.map((w) => `<span class="cal-w">${esc(w)}</span>`).join('')}${month(ym)}</div></div>`; }).join('')}</div>
      <div class="cal-foot"><span><i class="k-free"></i>${esc(ui('calFree'))}</span><span><i class="k-taken"></i>${esc(ui('calBooked'))}</span>${o.priceNote ? `<span class="cal-note">${esc(o.priceNote)}</span>` : ''}${a ? `<button type="button" class="cal-clear" data-cal-clear>${esc(ui('calClear'))}</button>` : ''}</div>`;
  };
  root.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-cal]');
    if (nav) { view = CD.month(view, +nav.dataset.cal); draw(); return; }
    if (e.target.closest('[data-cal-clear]')) { a = b = msg = ''; draw(); o.onChange && o.onChange('', ''); return; }
    const btn = e.target.closest('[data-d]');
    if (!btn || btn.disabled) return;
    const d = btn.dataset.d;
    msg = '';
    if (!a || b || d <= a || !rangeFree(a, d)) { a = d; b = ''; }
    else if (CD.nights(a, d) < minFor(a)) msg = ui('calMin', { n: minFor(a) });
    else b = d;
    draw();
    o.onChange && o.onChange(a, b);
  });
  draw();
  return {
    set(x, y) { a = x || ''; b = y || ''; msg = ''; if (a) view = a.slice(0, 7); draw(); },
    get: () => ({ in: a, out: b }),
    redraw() { if (a && b && !rangeFree(a, b)) { b = ''; msg = ui('calClash'); } draw(); },
  };
}

/** The same calendar in a pop-up (a sheet from the bottom on phones). Calls done(in, out) when the guest confirms. */
function pickDates(o, done) {
  let d = $('#wl-pick');
  if (!d) { d = document.createElement('dialog'); d.id = 'wl-pick'; d.className = 'pick'; document.body.append(d); }
  d.innerHTML = `<div class="pick-in"><div class="pick-head"><h2>${esc(ui('calTitle'))}</h2><button type="button" class="dlg-x" data-pick-x aria-label="${esc(ui('close'))}">${icon('close')}</button></div><div class="cal" data-pick-cal></div><div class="pick-foot"><button type="button" class="btn btn-accent btn-lg" data-pick-ok>${esc(ui('calDone'))}</button></div></div>`;
  const ok = $('[data-pick-ok]', d);
  const c = calendar($('[data-pick-cal]', d), { ...o, months: innerWidth < 760 ? 1 : 2, onChange: (x, y) => { ok.disabled = !(x && y); } });
  ok.disabled = !(o.in && o.out);
  d.onclick = (e) => { if (e.target === d || e.target.closest('[data-pick-x]')) d.close(); };
  ok.onclick = () => { const v = c.get(); d.close(); done(v.in, v.out); };
  d.showModal();
}


/* ==========================================================================
   HIGH TIER: "Bookings". Direct bookings for guesthouses and villas, tours
   and boat trips, or car rental. config.type picks the wording and the maths:
   "accommodation" (per night), "tour" (per person), "rental" (per day).
   ========================================================================== */
/* @uses cal */
const TYPE = ['accommodation', 'tour', 'rental'].includes(C.type) ? C.type : 'accommodation';
const RANGE = TYPE !== 'tour';               // two dates (in / out) or a single date
const W = (k, v) => String(((L().types || {})[TYPE] || {})[k] ?? (((C.text.en.types || {})[TYPE] || {})[k] ?? '')).replace(/\{(\w+)\}/g, (_, x) => (v && v[x] != null ? v[x] : ''));
const S = () => C.sections || {};
const sec = (k) => { const s = S()[k]; return s && s.enabled !== false ? s : null; };
const LIST = () => (C.listings || []).filter((x) => has(x.name));
const byId = (id) => LIST().find((x) => x.id === id);
const Q = new URLSearchParams(location.search);
const B = () => C.booking || {};

/* ---------- money: prices are written in rupees; visitors can view them in euros or dollars ---------- */
const CUR = () => C.currency || {};
/** Prices in config are written in the base currency (currency.base, rupees if not set); rates turn them into the others. */
const BASE = () => CUR().base || 'MUR';
const curList = () => [BASE(), ...Object.keys(CUR().rates || {}).filter((c) => c !== BASE())];
let cur = (() => { const c = store.get('wl-cur'); return curList().includes(c) ? c : (CUR().default || BASE()); })();
const SYM = { MUR: 'Rs ', EUR: '€', USD: '$', GBP: '£', ZAR: 'R ', INR: '₹' };
const fmtIn = (v0, c) => { const v = c === BASE() ? v0 : v0 * ((CUR().rates || {})[c] || 0); return (SYM[c] || c + ' ') + Math.round(v).toLocaleString(LOCALE()); };
const money = (mur) => fmtIn(mur, cur);
const moneyAlt = (v) => { const alt = CUR().secondary; return cur === BASE() && alt && alt !== BASE() && CUR().rates && CUR().rates[alt] ? `≈ ${fmtIn(v, alt)}` : ''; };

/* ---------- dates ---------- */
const iso = (d) => d.toISOString().slice(0, 10);
const day = (s) => new Date(s + 'T00:00:00Z');
const addDays = (s, n) => iso(new Date(day(s).getTime() + n * 864e5));
const today = () => iso(new Date(Date.now() - new Date().getTimezoneOffset() * 6e4));
const nice = (s) => (s ? new Intl.DateTimeFormat(LOCALE(), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(day(s)) : '');
const between = (a, b) => (a && b ? Math.round((day(b) - day(a)) / 864e5) : 0);

/* ---------- the price maths, used by the listing page, the booking page and the sticky bar ---------- */
function rateOn(item, date) {
  const md = date.slice(5);
  for (const s of item.seasons || []) {
    const inside = s.from <= s.to ? md >= s.from && md <= s.to : md >= s.from || md <= s.to;
    if (inside) return { price: s.price, season: s };
  }
  return { price: item.price, season: null };
}
function estimate(item, st) {
  const out = { lines: [], total: 0, units: 0, error: '' };
  if (!item) return out;
  const n = Math.max(1, +st.n || 1), kids = Math.max(0, +st.kids || 0);
  if (RANGE) {
    out.units = between(st.in, st.out);
    if (!st.in || !st.out) { out.error = ui('pickDates'); return out; }
    if (out.units < 1) { out.error = ui('outAfterIn'); return out; }
    if (item.minUnits && out.units < item.minUnits) { out.error = W('minUnits', { n: item.minUnits }); }
    let sum = 0; const rates = new Set();
    for (let k = 0; k < out.units; k++) { const r = rateOn(item, addDays(st.in, k)).price; sum += r; rates.add(r); }
    out.lines.push({ label: rates.size === 1 ? `${out.units} ${out.units === 1 ? W('unit') : W('units')} × ${money([...rates][0])}` : `${out.units} ${W('units')} (${ui('seasonalRates')})`, amount: sum });
    out.total = sum;
  } else {
    if (!st.date) out.error = ui('pickDate');
    out.units = n + kids;
    const adult = st.date ? rateOn(item, st.date).price : item.price;
    out.lines.push({ label: `${n} × ${W('adult')} · ${money(adult)}`, amount: adult * n });
    if (kids) { const cp = item.childPrice ?? adult; out.lines.push({ label: `${kids} × ${W('child')} · ${money(cp)}`, amount: cp * kids }); }
    out.total = out.lines.reduce((a, l) => a + l.amount, 0);
  }
  if (item.capacity && n + kids > item.capacity) out.error = W('tooMany', { n: item.capacity });
  for (const id of st.extras || []) {
    const x = (C.extras || []).find((e) => e.id === id);
    if (!x) continue;
    const people = n + kids, u = RANGE ? Math.max(out.units, 1) : 1;
    const amt = { booking: 1, unit: u, person: people, personUnit: people * u }[x.per || 'booking'] * x.price;
    out.lines.push({ label: tx(x.label), amount: amt });
    out.total += amt;
  }
  return out;
}
const fromPrice = (item) => Math.min(item.price, ...(item.seasons || []).map((s) => s.price));
const minOf = (it) => (it && it.minUnits) || 1;
const curLabel = () => (cur === 'MUR' ? 'Rs' : (SYM[cur] || cur).trim());
/** A short price for a calendar day: "15.5k", "€85". */
const shortMoney = (v0) => { const v = cur === BASE() ? v0 : v0 * ((CUR().rates || {})[cur] || 0); const n = v >= 1000 ? decimal(Math.round(v / 100) / 10) + 'k' : String(Math.round(v)); return (cur === 'MUR' ? '' : (SYM[cur] || '').trim()) + n; };
/** The first stretch of free nights long enough for this listing, starting the search at day `from`. */
function freeRange(it, from) {
  for (let k = 0; k < 150; k++) {
    const a = addDays(from, k), n = Math.max(minOf(it), B().defaultUnits || 4);
    let ok = true;
    for (let j = 0; j < n && ok; j++) if (nightTaken(it.booked, addDays(a, j))) ok = false;
    if (ok) return [a, addDays(a, n)];
  }
  return ['', ''];
}

/* ---------- pages ---------- */
const PG = { home: './', listings: 'listings.html', gallery: 'gallery.html', reviews: 'reviews.html', contact: 'contact.html', book: 'book.html' };
const bookHref = (id, extra = '') => `${PG.book}?${id ? 'id=' + enc(id) : ''}${extra}`;
const itemHref = (id) => `listing.html?id=${enc(id)}`;

const TIER = {
  get overlayHeader() { return !['book', '404'].includes(document.body.dataset.page); },
  homeHref: './',
  transitions: true,
  txIn: 700, txOut: 1100,
  introLength: 3600, introLeave: 1500, introReveal: 350,
  /** The opening: dawn over the lagoon. The sun rises behind the horizon, the waves draw in, the name comes up out of the sea. */
  intro() {
    const name = esc(C.name).split('').map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const w = (d, k) => `<path class="iw iw${k}" d="${d}"/>`;
    return `<div class="in-sky"></div><div class="in-sun"></div>
      <div class="in-sea"><svg viewBox="0 0 1440 300" preserveAspectRatio="none">${[
        w('M0 30 C 180 10 360 10 540 30 S 900 50 1080 30 1260 10 1440 30', 1),
        w('M0 90 C 200 66 400 66 600 90 S 1000 114 1200 90 1340 76 1440 86', 2),
        w('M0 160 C 220 134 440 134 660 160 S 1100 186 1320 160 1400 152 1440 156', 3),
        w('M0 240 C 240 214 480 214 720 240 S 1200 266 1440 236', 4)].join('')}</svg></div>
      <div class="in-copy"><p class="in-place">${esc(tx((sec('hero') || {}).eyebrow) || '')}</p><p class="in-name">${name}</p><p class="in-coord">${esc(coords())}</p></div>
      <svg class="in-edge" viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 0 H1440 V40 C 1260 72 1080 72 900 44 S 540 10 360 38 180 74 0 48Z"/></svg>`;
  },
  nav() {
    return [
      { key: 'listings', href: PG.listings, label: W('items') },
      sec('gallery') && { key: 'gallery', href: PG.gallery, label: ui('navGallery') },
      sec('reviews') && { key: 'reviews', href: PG.reviews, label: ui('navReviews') },
      { key: 'contact', href: PG.contact, label: ui('navContact') },
    ].filter(Boolean);
  },
  headerCta: () => `${curList().length > 1 ? `<button class="hd-btn hd-cur" type="button" data-cur aria-label="${esc(cur === 'MUR' ? 'Rs' : (SYM[cur] || cur).trim())}: ${esc(ui('currency'))}">${esc(cur === 'MUR' ? 'Rs' : (SYM[cur] || cur).trim())}</button>` : ''}<a class="btn btn-accent hd-cta" href="${bookHref()}">${esc(ui('bookNow'))}</a>`,
  menuExtra: () => `<a class="btn btn-accent btn-lg" href="${bookHref()}">${esc(ui('bookNow'))}${icon('arrow', 'i-go')}</a>${curList().length > 1 ? `<div class="cur-seg" role="group" aria-label="${esc(ui('currency'))}">${curList().map((c) => `<button type="button" data-set-cur="${c}" aria-pressed="${c === cur}">${esc((SYM[c] || '').trim() || c)} ${c}</button>`).join('')}</div>` : ''}`,
  footerLinks: () => [{ href: './', label: ui('home') }, ...TIER.nav(), { href: bookHref(), label: ui('bookNow') }].map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join(''),
  pageTitle(p) {
    if (p === 'home') return '';
    if (p === 'listing') { const it = byId(Q.get('id')); return it ? tx(it.name) : W('items'); }
    return { listings: W('items'), gallery: ui('navGallery'), reviews: ui('navReviews'), contact: ui('navContact'), book: ui('bookNow') }[p] || '';
  },
  pageDescription(p) { if (p === 'listing') { const it = byId(Q.get('id')); return it ? tx(it.short) : ''; } return ''; },
  pages: {
    home: () => [hero(), whyDirect(), ticker(), intro(), featured(), dayScene(), parallax(), reviewsBlock(), locationBlock(), insta(), faq(), finalCta()].join(''),
    listings: () => [pageHead('listings'), listingsGrid(LIST(), true), whyDirect()].join(''),
    listing: () => listingPage(),
    gallery: () => [pageHead('gallery'), galleryGrid(), insta()].join(''),
    reviews: () => [pageHead('reviews'), reviewsPage()].join(''),
    contact: () => [pageHead('contact'), contactPage(), locationBlock(true), faq()].join(''),
    book: () => bookPage(),
  },
  after(page) {
    if (page === 'book') return '';
    const it = page === 'listing' ? byId(Q.get('id')) : null;
    const p = it ? fromPrice(it) : Math.min(...LIST().map(fromPrice));
    if (!isFinite(p)) return '';
    return `<div class="book-bar"><p><span>${esc(ui('from'))}</span><b>${esc(money(p))}</b><small>${esc(W('perUnit'))}</small></p><div class="bar-go">${waHref() ? `<a class="bar-wa" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener" aria-label="${esc(ui('whatsappUs'))}">${icon('wa')}</a>` : ''}<a class="btn btn-accent btn-lg" href="${bookHref(it ? it.id : '')}">${esc(ui('bookNow'))}</a></div></div>`;
  },
  schema(base) {
    const types = { accommodation: 'LodgingBusiness', tour: 'TravelAgency', rental: 'AutoRental' };
    const o = { ...base, '@type': (C.seo && C.seo.schemaType) || types[TYPE], currenciesAccepted: BASE() };
    const r = (sec('reviews') || {}).summary;
    if (r && r.rating && r.count) o.aggregateRating = { '@type': 'AggregateRating', ratingValue: r.rating, reviewCount: r.count, bestRating: r.best || 5 };
    const offer = (it) => ({ '@type': 'Offer', price: fromPrice(it), priceCurrency: BASE(), url: new URL(itemHref(it.id), location.href).href });
    if (TYPE === 'tour') {
      return [o, ...LIST().map((it) => ({ '@context': 'https://schema.org', '@type': 'TouristTrip', name: tx(it.name), description: tx(it.short), image: (it.images || []).slice(0, 3).map((x) => sized(imgOf(x).src, 1200)), provider: { '@type': 'TravelAgency', name: C.name }, offers: offer(it) }))];
    }
    o.makesOffer = LIST().map((it) => ({ ...offer(it), itemOffered: TYPE === 'accommodation' ? { '@type': 'HotelRoom', name: tx(it.name), occupancy: it.capacity ? { '@type': 'QuantitativeValue', maxValue: it.capacity } : undefined } : { '@type': 'Car', name: tx(it.name), vehicleSeatingCapacity: it.capacity || undefined } }));
    if (TYPE === 'accommodation' && C.policies && C.policies.checkIn) { o.checkinTime = C.policies.checkIn; o.checkoutTime = C.policies.checkOut; }
    return o;
  },
  wire(page) {
    alive(); if (page === 'home') sectionDots();
    if (matchMedia('(max-width: 759px)').matches && !fxWanted()) pager($('.day-track'));   // no motion layer: the day, one moment at a time
    document.documentElement.classList.toggle('has-book-bar', page !== 'book');
    $$('[data-cur]').forEach((b) => b.addEventListener('click', () => setCur(curList()[(curList().indexOf(cur) + 1) % curList().length])));
    $$('[data-set-cur]').forEach((b) => b.addEventListener('click', () => setCur(b.dataset.setCur)));
    $$('[data-carousel]').forEach((c) => carousel(c, { auto: c.dataset.carousel === 'auto' ? 6500 : 0 }));
    $$('[data-cardpics]').forEach(wireCardPics);
    wireHero(); wireSearch(); wireDay();
    if (window.__fx) window.__fx.refresh(page); else loadFx(page);
    const jr = document.querySelector('[data-journey]');
    if (jr) { if ('IntersectionObserver' in window && !reduced) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { jr.classList.add('run'); o.disconnect(); } }, { threshold: 0.35 }).observe(jr); else jr.classList.add('run'); } wireGallery(); wireListing(); wireBook();
    const typeSw = $('[data-demo-type]');
    typeSw && typeSw.addEventListener('change', (e) => { const t = e.target.value; try { sessionStorage.setItem('wl-demo', t); } catch { /* ok */ } location.href = location.pathname.replace(/[^/]*$/, '') + '?demo=' + t; });
  },
};
function setCur(c) { cur = c; store.set('wl-cur', c); const y = scrollY; const st = bookState && bookState(); render(); if (st) restoreBook(st); scrollTo(0, y); }

/* ---------- living photos: big pictures breathe slowly while they are on screen ---------- */
function alive() {
  const els = $$('.row-pics, .ip, .plx, .fcta-bg, .polas li, .intro-pics, .phead-bg, .lp-gal');
  if (reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const el = e.target;
    el.classList.toggle('alive', e.isIntersecting);
    // room photos open once; when the opening ends the clip is dropped so nothing clips while scrolling
    if (e.isIntersecting && el.classList.contains('row-pics') && !el.classList.contains('opened')) {
      el.classList.add('opened');
      const end = () => el.classList.add('done');
      el.addEventListener('transitionend', (ev) => { if (ev.propertyName === 'clip-path') end(); }, { once: true });
      setTimeout(end, 1800);
    }
  }), { rootMargin: '0px 0px -12% 0px' });
  els.forEach((el) => io.observe(el));
}
/* ---------- the home page's section dots (computers): where you are, and a jump to any section ---------- */
function sectionDots() {
  if (innerWidth < 1100) return;
  const secs = $$('main > section, main > .pin-spacer > section').filter((s) => !s.classList.contains('ticker') && s.offsetHeight > innerHeight * 0.4);
  if (secs.length < 3) return;
  const label = (s) => ((s.querySelector('.sec-head .h2, .h1, .plx-q, .day-head .h2') || {}).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  let nav = $('.sdots');
  if (nav) nav.remove();
  nav = document.createElement('nav'); nav.className = 'sdots'; nav.setAttribute('aria-label', ui('sections'));
  nav.innerHTML = secs.map((s, i) => `<button type="button" data-sdot="${i}" aria-label="${esc(label(s) || String(i + 1))}"><span>${esc(label(s))}</span></button>`).join('');
  document.body.append(nav);
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-sdot]'); if (!b) return; const s = secs[+b.dataset.sdot]; const top = s.getBoundingClientRect().top + scrollY - (s.classList.contains('hero') ? 0 : 61); if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.2 }); else if (document.documentElement.classList.contains('snap') && snapPages.glide && !matchMedia('(pointer: coarse)').matches) snapPages.glide(Math.max(0, top)); else scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }); });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const i = secs.indexOf(e.target); $$('[data-sdot]', nav).forEach((b, k) => b.toggleAttribute('aria-current', k === i)); nav.classList.toggle('on-dark', !!e.target.closest('.hero, .plx, .fcta, [data-day]')); } }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => io.observe(s));
}

/* ---------- shared bits ---------- */
const stars = (n = 5) => `<span class="stars" role="img" aria-label="${esc(ui('ratingOf', { n }))}">${icon('star').repeat(Math.round(n))}</span>`;
function pageHead(key) {
  const h = (S().pageHeads || {})[key] || {};
  const title = tx(h.title) || ({ listings: W('items'), gallery: ui('navGallery'), reviews: ui('navReviews'), contact: ui('navContact') }[key]);
  return `<section class="phead hero-under">
    <div class="phead-bg">${pic(h.image || (sec('hero') || {}).images?.[0], { eager: true, w: 1600 })}</div>
    <div class="wrap phead-in"><p class="eyebrow">${esc(C.name)}</p><h1 class="h1">${esc(title)}</h1>${has(h.text) ? `<p class="lead">${esc(tx(h.text))}</p>` : ''}</div>
  </section>`;
}
const featureRow = (it, max = 4) => (it.features || []).slice(0, max).map((f) => `<li>${icon(f.icon || 'check')}<span>${esc(tx(f.label))}</span></li>`).join('');

/* ---------- home ---------- */
/** A soft wave line, used as the edge between sections. Its colour is the section it leads into. */
const wave = (cls = '') => `<svg class="wave ${cls}" viewBox="0 0 1440 56" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 30 C 160 4 320 4 480 28 S 800 54 960 30 1280 4 1440 26 V56 H0Z"/></svg>`;
const coords = () => { const k = K(); return k.lat ? `${Math.abs(k.lat).toFixed(4)}° ${k.lat < 0 ? 'S' : 'N'}   ${Math.abs(k.lng).toFixed(4)}° ${k.lng < 0 ? 'W' : 'E'}` : ''; };
/** The last word of a headline in italics, the way a signature closes a letter. */
const signLast = (t) => { const w = String(t).trim().split(' '); const last = w.pop(); return `${w.length ? esc(w.join(' ')) + ' ' : ''}<em>${esc(last)}</em>`; };

function hero() {
  const h = sec('hero') || {};
  const imgs = (h.images || []).filter(Boolean);
  const demoTypes = C.demo && C.demo.enabled && C.demo.examples;
  return `<section class="hero hero-under" data-hero>
  <div class="hero-media">
    ${h.video ? (() => { const tall = innerWidth < 760 && innerHeight > innerWidth && h.videoTall; return `<video class="hero-video" src="${esc(tall ? h.videoTall : h.video)}" poster="${esc((tall && h.posterTall) || h.poster || (imgs[0] ? sized(imgOf(imgs[0]).src, 1600) : ''))}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>`; })() : imgs.map((im, i) => `<figure class="hero-slide${i === 0 ? ' on' : ''}" data-hero-slide>${later(pic(im, { eager: i === 0, w: 1800 }), i)}</figure>`).join('')}
  </div>
  <div class="wrap hero-in">
    <p class="hero-loc hero-rise">${esc(tx(h.eyebrow))}${coords() ? `<span>${esc(coords())}</span>` : ''}</p>
    <h1 class="h1 hero-rise">${signLast(tx(h.title) || C.name)}</h1>
    ${has(h.text) ? `<p class="lead hero-rise">${esc(tx(h.text))}</p>` : ''}
    ${searchBar()}
    ${demoTypes ? `<label class="demo-type hero-rise"><span>${esc(ui('demoTypeLabel'))}</span><select data-demo-type>${['accommodation', 'tour', 'rental'].map((t) => `<option value="${t}"${t === TYPE ? ' selected' : ''}>${esc(ui('demoType_' + t))}</option>`).join('')}</select></label>` : ''}
  </div>
  ${imgs.length > 1 && !h.video ? `<div class="hero-dots" aria-hidden="true">${imgs.map((_, i) => `<span${i === 0 ? ' class="on"' : ''}></span>`).join('')}</div>` : ''}
  ${wave('wave-sand')}
</section>`;
}

function peopleOptions(max = 10, sel = 2) { return Array.from({ length: max }, (_, i) => `<option value="${i + 1}"${i + 1 === sel ? ' selected' : ''}>${i + 1} ${esc(i === 0 ? W('person') : W('people').toLowerCase())}</option>`).join(''); }
function searchBar() {
  const t = today(), max = Math.max(2, ...LIST().map((x) => x.capacity || 2));
  return `<form class="search ticket hero-rise" data-search action="${PG.book}" method="get">
    ${RANGE ? `<input type="hidden" name="in" value="${addDays(t, 14)}"><input type="hidden" name="out" value="${addDays(t, 14 + (B().defaultUnits || 4))}">
    <button type="button" class="sf sf-btn" data-search-dates><span>${esc(W('checkIn'))}</span><b data-s-in></b></button>
    <button type="button" class="sf sf-btn" data-search-dates><span>${esc(W('checkOut'))}</span><b data-s-out></b></button>`
    : `<label class="sf"><span>${esc(W('date'))}</span><input type="date" name="date" min="${t}" value="${addDays(t, 7)}" required></label>`}
    <label class="sf"><span>${esc(W('people'))}</span><select name="n">${peopleOptions(max, Math.min(2, max))}</select></label>
    <span class="perf" aria-hidden="true"></span><button class="btn btn-accent btn-lg" type="submit">${esc(ui('checkAvailability'))}${icon('arrow', 'i-go')}</button>
  </form>`;
}
function wireSearch() {
  const f = $('[data-search]');
  if (!f || !RANGE) return;
  const a = f.elements.in, b = f.elements.out;
  const show = () => { $('[data-s-in]', f).textContent = a.value ? CD.nice(a.value) : ui('addDate'); $('[data-s-out]', f).textContent = b.value ? CD.nice(b.value) : ui('addDate'); };
  const minAll = Math.min(...LIST().map(minOf));
  $$('[data-search-dates]', f).forEach((btn) => btn.addEventListener('click', () => pickDates({ in: a.value, out: b.value, minFor: () => minAll }, (x, y) => { a.value = x; b.value = y; show(); })));
  show();
}
function wireHero() {
  if (document.body.dataset.page === 'home') { const past = () => document.documentElement.classList.toggle('past-hero', scrollY > innerHeight * 0.75); past(); addEventListener('scroll', past, { passive: true }); }
  const slides = $$('[data-hero-slide]'), dots = $$('.hero-dots span');
  if (slides.length > 1 && !reduced) {
    let i = 0;
    clearInterval(window.__heroT);
    window.__heroT = setInterval(() => { slides[i].classList.remove('on'); dots[i] && dots[i].classList.remove('on'); i = (i + 1) % slides.length; slides[i].classList.add('on'); dots[i] && dots[i].classList.add('on'); }, 6500);
  }
  // parallax: the hero and the photo band move slower than the page
  const layers = $$('.hero-media, [data-parallax] img');
  if (layers.length && !reduced) {
    let raf;
    const move = () => !document.documentElement.classList.contains('fx') && layers.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const k = el.classList.contains('hero-media') ? 0.35 : 0.18;
      const hero = el.classList.contains('hero-media');
      let y = hero ? -r.top * k : -(r.top + r.height / 2 - innerHeight / 2) * k;
      if (!hero) y = Math.max(-r.height * 0.12, Math.min(r.height * 0.12, y));
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });
    addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(move); }, { passive: true });
    move();
  }
}

/* ---------- the motion layer (js/fx.js) loads after the page is ready, only where it can run smoothly ---------- */
function fxWanted() {
  const e = C.effects || {};
  if (e.enabled === false || reduced) return false;
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g/.test(c.effectiveType || ''))) return false;
  if ((navigator.deviceMemory || 4) < 3 || (navigator.hardwareConcurrency || 4) < 4) return false;
  return true;
}
let fxAsked = false;
function loadFx(page) {
  if (fxAsked || !fxWanted()) return;
  fxAsked = true;
  const go = () => import(new URL('js/fx.js?v=458e4c149f', document.baseURI).href)
    .then((m) => m.start({ C, page, ui, money, tx }))
    .then((api) => { window.__fx = api; })
    .catch((e) => { document.documentElement.classList.remove('fx'); if (matchMedia('(max-width: 759px)').matches) pager($('.day-track')); console.info('WebLuxe effects off:', e && e.message); });
  if (document.readyState === 'complete') setTimeout(go, 150); else addEventListener('load', () => setTimeout(go, 150), { once: true });
}

/** A band of big words drifting slowly across. */
function ticker() {
  const s = sec('ticker'), words = ((s || {}).words || []).map(tx).filter(Boolean);
  if (!s || !words.length) return '';
  const row = (k) => `<div class="ticker-row${k ? ' ticker-alt' : ''}">${[...words, ...words, ...words].map((w) => `<span>${esc(w)}</span><i aria-hidden="true">✦</i>`).join('')}</div>`;
  return `<section class="ticker" aria-label="${esc(words.join(', '))}">${row(0)}${row(1)}</section>`;
}

/** "A day at …": hour by hour in a row you swipe; the colour follows the hour on screen. */
function dayScene() {
  const s = sec('day'), items = ((s || {}).items || []).filter((x) => has(x.title));
  if (!s || !items.length) return '';
  const fg = (hex) => readable(hex || '#f3eadb');
  return `<section class="day" data-day data-nofit style="background-color:${esc(items[0].tone || '')};color:${fg(items[0].tone)}">
  <div class="day-pin">
    <div class="wrap day-head">${head(s.eyebrow, s.title, s.lead)}</div>
    <ol class="day-track" data-day-track>${items.map((it, i) => `<li class="day-card" data-bg="${esc(it.tone || '')}" data-fg="${fg(it.tone)}">
      <figure>${pic(it.image, { sizes: '(min-width: 960px) 34vw, 78vw', w: 900 })}</figure>
      <p class="day-time">${esc(it.time || '')}</p>
      <h3 class="h3">${esc(tx(it.title))}</h3>
      ${has(it.text) ? `<p class="day-text">${esc(tx(it.text))}</p>` : ''}
    </li>`).join('')}</ol>
  </div>
</section>`;
}
/** The background colour follows the hour in view. */
function wireDay() {
  const day = $('[data-day]'), track = $('[data-day-track]');
  if (!day || !track || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !document.documentElement.classList.contains('fx')) { day.style.backgroundColor = e.target.dataset.bg; day.style.color = e.target.dataset.fg; } }), { root: track, threshold: 0.6 });
  $$('.day-card', track).forEach((c) => io.observe(c));
}

/** "Book direct": a receipt that shows, in money, what the guest keeps by not using a booking site. */
function whyDirect() {
  const s = sec('whyDirect');
  if (!s) return '';
  const perks = (s.items || []).filter((x) => has(x.title));
  const pct = B().commissionPct || 0;
  const pickOne = [...LIST()].sort((a, b) => a.price - b.price)[Math.min(1, LIST().length - 1)];
  const n = RANGE ? (B().defaultUnits || 4) : 2;
  const here = pickOne ? pickOne.price * n : 0;
  const there = Math.round(here / (1 - pct / 100) / 100) * 100;
  const receipt = pct && pickOne ? `<figure class="receipt" data-reveal="zoom">
      <p class="rc-top"><b>${esc(C.name)}</b><span>${esc(W('sample', { n, item: tx(pickOne.name) }))}</span></p>
      <dl class="rc-lines">
        <div class="rc-was"><dt>${esc(ui('onSites'))}</dt><dd>${esc(money(there))}</dd></div>
        <div><dt>${esc(ui('bookedHere'))}</dt><dd>${esc(money(here))}</dd></div>
      </dl>
      <p class="rc-keep"><span>${esc(ui('youKeep'))}</span><b data-amount="${there - here}">${esc(money(there - here))}</b></p>
      <figcaption>${esc(ui('commissionNote', { pct }))}</figcaption>
    </figure>` : '';
  return `<section class="direct"><div class="wrap direct-in">
    <div class="direct-copy">
      ${head(s.eyebrow, s.title, s.text)}
      ${perks.length ? `<ul class="perks">${perks.map((x, i) => `<li data-reveal style="--d:${0.06 * i}s"><b>${esc(tx(x.title))}</b><span>${esc(tx(x.text))}</span></li>`).join('')}</ul>` : ''}
    </div>
    ${receipt}
  </div></section>`;
}
function intro() {
  const s = sec('intro');
  if (!s) return '';
  return `<section class="sec intro"><div class="wrap intro-in">
    <div class="intro-copy">${head(s.eyebrow, s.title)}${(Array.isArray(s.text) ? s.text : [s.text]).filter(has).map((p) => `<p data-reveal>${esc(tx(p))}</p>`).join('')}${has(s.signature) ? `<p class="sig" data-reveal>${esc(tx(s.signature))}</p>` : ''}</div>
    <div class="intro-pics">${(s.images || []).slice(0, 2).map((im, i) => `<figure class="ip ip-${i}" data-reveal="zoom">${pic(im, { sizes: '(min-width: 960px) 30vw, 70vw', w: 800 })}</figure>`).join('')}</div>
  </div></section>`;
}
function featured() {
  const s = sec('featured') || {}, list = LIST();
  if (!list.length) return '';
  return `<section class="sec feat"><div class="wrap">
    <div class="sec-row">${head(s.eyebrow || W('items'), s.title || W('items'), s.lead)}<a class="link" href="${PG.listings}" data-reveal>${esc(W('seeAll', { n: list.length }))}${icon('arrow')}</a></div>
    ${listingsGrid(list.slice(0, s.count || 3))}
  </div></section>`;
}
/** Listings as an editorial list: a number, a big name, one line of facts, the price. Photos swipe. */
function listingsGrid(list, page = false) {
  return `<ol class="rows${page ? ' rows-page' : ''}">${list.map((it, i) => {
    const imgs = (it.images || []).slice(0, 5);
    const n = LIST().indexOf(it) + 1;
    return `<li class="row${i % 2 ? ' row-flip' : ''}" data-reveal>
      <div class="row-pics" data-cardpics>
        <ul class="lc-track">${imgs.map((im) => `<li>${pic(im, { sizes: '(min-width: 960px) 56vw, 100vw', w: 1000 })}</li>`).join('')}</ul>
        ${imgs.length > 1 ? `<div class="lc-dots">${imgs.map((_, k) => `<span${k === 0 ? ' class="on"' : ''}></span>`).join('')}</div><button type="button" class="lc-nav lc-prev" aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><button type="button" class="lc-nav lc-next" aria-label="${esc(ui('next'))}">${icon('chevR')}</button>` : ''}
        ${has(it.badge) ? `<span class="lc-badge">${esc(tx(it.badge))}</span>` : ''}
      </div>
      <div class="row-copy">
        <p class="row-n">${String(n).padStart(2, '0')}<span>/ ${String(LIST().length).padStart(2, '0')}</span></p>
        <h3 class="row-name"><a href="${itemHref(it.id)}">${esc(tx(it.name))}</a></h3>
        ${has(it.short) ? `<p class="row-short">${esc(tx(it.short))}</p>` : ''}
        ${has(it.features) ? `<p class="row-facts">${it.features.slice(0, 4).map((f) => `<span>${esc(tx(f.label))}</span>`).join('')}</p>` : ''}
        <div class="row-foot">
          <p class="row-price"><span>${esc(ui('from'))}</span><b>${esc(money(fromPrice(it)))}</b><small>${esc(W('perUnit'))}${moneyAlt(fromPrice(it)) ? ` · ${esc(moneyAlt(fromPrice(it)))}` : ''}</small></p>
          <p class="row-go"><a class="btn btn-accent" href="${bookHref(it.id)}">${esc(ui('bookNow'))}</a><a class="link" href="${itemHref(it.id)}">${esc(W('view'))}${icon('arrow')}</a></p>
        </div>
      </div>
    </li>`;
  }).join('')}</ol>`;
}

function wireCardPics(box) {
  const tr = $('.lc-track', box), dots = $$('.lc-dots span', box), n = dots.length;
  if (!n) return;
  const at = () => Math.round(tr.scrollLeft / tr.clientWidth);
  tr.addEventListener('scroll', () => { const i = at(); dots.forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
  $('.lc-prev', box).addEventListener('click', () => tr.scrollTo({ left: ((at() - 1 + n) % n) * tr.clientWidth, behavior: 'smooth' }));
  $('.lc-next', box).addEventListener('click', () => tr.scrollTo({ left: ((at() + 1) % n) * tr.clientWidth, behavior: 'smooth' }));
}
function parallax() {
  const s = sec('parallax');
  if (!s || !s.image) return '';
  return `<section class="plx" data-parallax>${pic(s.image, { w: 1800 })}<div class="wrap plx-in" data-reveal><p class="plx-q">${esc(tx(s.quote))}</p>${has(s.by) ? `<p class="plx-by">${esc(tx(s.by))}</p>` : ''}</div></section>`;
}
function reviewList() { return ((sec('reviews') || {}).items || []).filter((r) => has(r.text)); }
/** The rating as a wax seal, with links to TripAdvisor and Google. */
function ratingBadge() {
  const r = (sec('reviews') || {}).summary;
  if (!r || !r.rating) return '';
  const links = ((sec('reviews') || {}).links || []).filter((l) => l.url);
  return `<div class="seal" data-reveal="zoom"><b>${esc(decimal(r.rating))}${r.best && r.best !== 5 ? `<i>/${r.best}</i>` : ''}</b>${stars(5)}<span>${esc([r.count && ui('basedOn', { n: r.count }), tx(r.source)].filter(Boolean).join(' · '))}</span></div>${links.length || has(K().googleReview) ? `<p class="rlinks">${links.map((l) => `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(ui('seeUsOn', { site: l.name }))}${icon('arrow')}</a>`).join('')}${has(K().googleReview) ? `<a class="link" href="${esc(K().googleReview)}" target="_blank" rel="noopener">${esc(ui('reviewOnGoogle'))}${icon('arrow')}</a>` : ''}</p>` : ''}`;
}
const TILT = [-1.6, 1.3, -0.8, 1.8, -1.2, 0.9];
/** A guest review written as a postcard home: message on the left, stamp and postmark on the right. */
const reviewCard = (r, i = 0) => {
  const from = tx(r.from) || '';
  return `<article class="postcard" style="--tilt:${TILT[i % TILT.length]}deg">
  <div class="pc-msg"><p class="pc-text">${esc(tx(r.text))}</p><p class="pc-sign">${esc(r.name)}</p></div>
  <div class="pc-side">
    <span class="pc-stamp" aria-hidden="true"><span>${esc(from.slice(0, 2).toUpperCase() || '★')}</span></span>
    <span class="pc-post" aria-hidden="true"><span>${esc(tx(r.date) || C.name)}</span></span>
    <p class="pc-to">${r.rating ? stars(r.rating) : ''}<span>${esc(from)}</span>${has(r.source) ? `<span>${esc(r.source)}</span>` : ''}</p>
  </div>
</article>`;
};
function reviewsBlock() {
  const s = sec('reviews'), list = reviewList();
  if (!s || !list.length) return '';
  return `<section class="sec revs"><div class="wrap">
    <div class="revs-head">${head(s.eyebrow, s.title)}<div class="revs-badge">${ratingBadge()}</div></div>
  </div>
  <div class="rcar" data-carousel="auto"><ul class="rc-track" data-track tabindex="0" aria-label="${esc(tx(s.title))}">${list.map((r, i) => `<li data-slide>${reviewCard(r, i)}</li>`).join('')}</ul>
    <div class="wrap rc-ctrl"><button type="button" class="round" data-prev aria-label="${esc(ui('prev'))}">${icon('chevL')}</button><div class="dots" data-dots></div><button type="button" class="round" data-next aria-label="${esc(ui('next'))}">${icon('chevR')}</button><a class="link" href="${PG.reviews}">${esc(ui('readAll'))}${icon('arrow')}</a></div></div>
</section>`;
}
/** Location as a journey: the business, then each place with how far it is. */
function locationBlock(full = false) {
  const s = sec('location');
  if (!s) return '';
  const facts = (s.facts || []).filter((f) => has(f.value));
  const how = (s.howToGetHere || []).filter((h) => has(h.text));
  return `<section class="sec loc"><div class="wrap">
    ${head(s.eyebrow, s.title, s.text)}
    ${facts.length ? `<ol class="journey" data-journey>
      <li class="j-home"><span class="j-dot">${esc((C.logo || {}).mark || C.name[0])}</span><b>${esc(C.name)}</b><span>${esc(coords())}</span></li>
      ${facts.map((f, i) => `<li style="--i:${i + 1}"><span class="j-dot">${icon(f.icon || 'pin')}</span><b>${esc(tx(f.value))}</b><span>${esc(tx(f.label))}</span></li>`).join('')}
    </ol>` : ''}
    <div class="loc-in">
      ${how.length ? `<div class="how" data-reveal><h3 class="h3">${esc(ui('howToGetHere'))}</h3>${how.map((h) => `<p><b>${esc(tx(h.title))}</b> ${esc(tx(h.text))}</p>`).join('')}</div>` : ''}
      <div class="loc-map" data-reveal>${mapBox('map')}${full ? '' : `<a class="link" href="${esc(mapsLink())}" target="_blank" rel="noopener">${esc(ui('directions'))}${icon('arrow')}</a>`}</div>
    </div>
  </div></section>`;
}
/** Instagram as a scatter of polaroids. */
function insta() {
  const s = sec('instagram'), imgs = ((s || {}).images || []).filter(Boolean);
  if (!s || !imgs.length) return '';
  const T6 = [-3, 2.2, -1.4, 2.8, -2.2, 1.6];
  return `<section class="sec insta"><div class="wrap">
    <div class="sec-row">${head(s.eyebrow, s.title, s.lead)}${s.url ? `<a class="link" href="${esc(s.url)}"${/^https?:/.test(s.url) ? ' target="_blank" rel="noopener"' : ''} data-reveal>${esc(tx(s.handle) || 'Instagram')}${icon('arrow')}</a>` : ''}</div>
    <ul class="polas">${imgs.slice(0, 6).map((im, i) => { const href = imgOf(im).href || s.url || '#'; return `<li style="--tilt:${T6[i]}deg" data-reveal="zoom"><a href="${esc(href)}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : ''}>${pic(im, { sizes: '(min-width: 900px) 30vw, 46vw', w: 500 })}${has(imgOf(im).caption) ? `<span>${esc(tx(imgOf(im).caption))}</span>` : ''}</a></li>`; }).join('')}</ul>
  </div></section>`;
}

function faq() {
  const s = sec('faq'), list = ((s || {}).items || []).filter((x) => has(x.q));
  if (!s || !list.length) return '';
  return `<section class="sec faq-sec"><div class="wrap narrow">${head(s.eyebrow, s.title, s.lead, 'center')}
    <div class="faq">${list.map((f, i) => `<details data-reveal style="--d:${0.04 * i}s"><summary>${esc(tx(f.q))}<span class="faq-x">${icon('plus')}</span></summary><div class="faq-a"><p>${esc(tx(f.a))}</p></div></details>`).join('')}</div>
  </div></section>`;
}
function finalCta() {
  const s = sec('finalCta');
  if (!s || !has(s.title)) return '';
  return `<section class="fcta">${s.image ? `<div class="fcta-bg" data-parallax>${pic(s.image, { w: 1800 })}</div>` : ''}<div class="wrap fcta-in" data-reveal><h2 class="h1">${esc(tx(s.title))}</h2>${has(s.text) ? `<p class="lead">${esc(tx(s.text))}</p>` : ''}<p class="btns"><a class="btn btn-accent btn-lg" href="${bookHref()}">${esc(ui('bookDirect'))}${icon('arrow', 'i-go')}</a>${waHref() ? `<a class="btn btn-ghost btn-lg" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p></div></section>`;
}

/* ---------- gallery and reviews pages ---------- */
function galleryImgs() { return ((sec('gallery') || {}).images || []).filter(Boolean); }
function galleryGrid() {
  const imgs = galleryImgs();
  if (!imgs.length) return '';
  return `<section class="sec gal-sec"><div class="wrap"><ul class="masonry" data-gallery>${imgs.map((im, i) => `<li data-reveal="zoom" style="--d:${(i % 3) * 0.06}s"><button type="button" data-gi="${i}" aria-label="${esc(ui('viewFull'))}">${pic(im, { sizes: '(min-width: 900px) 33vw, 50vw', w: 700 })}</button></li>`).join('')}</ul></div></section>`;
}
function wireGallery() {
  const g = $('[data-gallery]');
  g && g.addEventListener('click', (e) => { const b = e.target.closest('[data-gi]'); if (b) lightbox(galleryImgs().map((im) => ({ src: im, alt: tx(imgOf(im).alt), caption: tx(imgOf(im).alt) })), +b.dataset.gi); });
}
function reviewsPage() {
  const list = reviewList();
  return `<section class="sec revs-page"><div class="wrap"><div class="revs-sum">${ratingBadge()}</div><div class="rgrid">${list.map((r, i) => `<div data-reveal style="--d:${(i % 3) * 0.06}s">${reviewCard(r, i)}</div>`).join('')}</div></div></section>`;
}

/* ---------- contact page ---------- */
function contactPage() {
  const k = K(), addr = addressLines();
  const card = (href, ic, title, val, extra = '') => `<a class="ccard" href="${href}" ${extra} data-reveal>${icon(ic)}<b>${esc(title)}</b><span>${esc(val)}</span></a>`;
  return `<section class="sec contact-sec"><div class="wrap">
    <div class="ccards">
      ${waHref() ? card(waHref(tx(k.whatsappMessage)), 'wa', 'WhatsApp', ui('chatNow'), 'target="_blank" rel="noopener"') : ''}
      ${has(k.phone) ? card(telHref(k.phone), 'phone', ui('phone'), k.phone) : ''}
      ${has(k.email) ? card(mailHref(), 'mail', ui('email'), k.email) : ''}
      ${addr.length ? card(esc(mapsLink()), 'pin', ui('address'), addr.join(', '), 'target="_blank" rel="noopener"') : ''}
      ${has(k.googleBusiness) ? card(esc(k.googleBusiness), 'google', 'Google', ui('seeOnGoogle'), 'target="_blank" rel="noopener"') : ''}
    </div>
    <div class="contact-row">
      ${has(k.responseTime) ? `<p class="resp" data-reveal>${icon('clock')}<span><b>${esc(ui('responseTime'))}</b>${esc(tx(k.responseTime))}</span></p>` : ''}
      ${C.hours ? `<div class="cs-hours" data-reveal>${openBadge()}<h2 class="h3">${esc(ui('hoursTitle'))}</h2>${hoursTable()}</div>` : ''}
    </div>
  </div></section>`;
}

/* ---------- one listing ---------- */
function listingPage() {
  const it = byId(Q.get('id')) || LIST()[0];
  if (!it) return '';
  const imgs = it.images || [];
  const pol = [...(it.policies || []), ...((C.policies && C.policies.items) || [])].filter((p) => has(p.title));
  const seasons = (it.seasons || []).filter((s) => s.price);
  const others = LIST().filter((x) => x.id !== it.id).slice(0, 3);
  return `<section class="lp-top hero-under">
    <div class="lp-gal" data-lpgal>
      <ul class="lp-track">${imgs.map((im, i) => `<li><button type="button" data-li="${i}" aria-label="${esc(ui('viewFull'))}">${pic(im, { eager: i === 0, sizes: i === 0 ? '(min-width: 900px) 60vw, 100vw' : '(min-width: 900px) 20vw, 100vw', w: i === 0 ? 1400 : 800 })}</button></li>`).join('')}</ul>
      ${imgs.length > 1 ? `<button type="button" class="btn lp-all" data-li="0">${icon('camera')}${esc(ui('allPhotos', { n: imgs.length }))}</button>` : ''}
    </div>
  </section>
  <section class="sec lp"><div class="wrap lp-in">
    <div class="lp-main">
      <nav class="crumbs" aria-label="${esc(ui('breadcrumb'))}"><a href="./">${esc(ui('home'))}</a><span aria-hidden="true">/</span><a href="${PG.listings}">${esc(W('items'))}</a></nav>
      <h1 class="h1">${esc(tx(it.name))}</h1>
      ${has(it.short) ? `<p class="lead">${esc(tx(it.short))}</p>` : ''}
      <ul class="feats feats-lg">${featureRow(it, 8)}</ul>
      ${has(it.description) ? `<div class="lp-desc">${(Array.isArray(it.description) ? it.description : [it.description]).map((p) => `<p>${esc(tx(p))}</p>`).join('')}</div>` : ''}
      ${has(it.amenities) ? `<h2 class="h2 lp-h">${esc(W('amenities'))}</h2><ul class="amen">${it.amenities.map((a) => `<li>${icon('check')}${esc(tx(a))}</li>`).join('')}</ul>` : ''}
      <h2 class="h2 lp-h">${esc(ui('prices'))}</h2>
      <table class="ptable"><thead><tr><th scope="col">${esc(ui('period'))}</th><th scope="col">${esc(W('perUnit'))}</th></tr></thead><tbody>
        <tr><th scope="row">${esc(ui('standardRate'))}</th><td>${esc(money(it.price))}${moneyAlt(it.price) ? `<small>${esc(moneyAlt(it.price))}</small>` : ''}</td></tr>
        ${seasons.map((s) => `<tr><th scope="row">${esc(tx(s.name))}<small>${esc(seasonDates(s))}</small></th><td>${esc(money(s.price))}${moneyAlt(s.price) ? `<small>${esc(moneyAlt(s.price))}</small>` : ''}</td></tr>`).join('')}
        ${it.childPrice != null && TYPE === 'tour' ? `<tr><th scope="row">${esc(W('child'))}${has(B().childAge) ? `<small>${esc(tx(B().childAge))}</small>` : ''}</th><td>${esc(money(it.childPrice))}</td></tr>` : ''}
      </tbody></table>
      ${it.minUnits ? `<p class="note">${icon('info')}${esc(W('minUnits', { n: it.minUnits }))}</p>` : ''}
      ${pol.length ? `<h2 class="h2 lp-h">${esc(ui('policies'))}</h2><dl class="pol">${pol.map((p) => `<div>${icon(p.icon || 'info')}<dt>${esc(tx(p.title))}</dt><dd>${esc(tx(p.text))}</dd></div>`).join('')}</dl>` : ''}
    </div>
    <aside class="lp-side"><div class="lp-card" data-quick="${esc(it.id)}">
      <p class="lc-price"><span>${esc(ui('from'))}</span> <b>${esc(money(fromPrice(it)))}</b> <small>${esc(W('perUnit'))}</small></p>
      ${quickFields(it)}
      <div class="qe" data-qe></div>
      <a class="btn btn-accent btn-lg" data-quick-go href="${bookHref(it.id)}">${esc(ui('bookNow'))}</a>
      <p class="lp-small">${icon('lock')}${esc(ui('noPayNow'))}</p>
    </div></aside>
  </div></section>
  ${others.length ? `<section class="sec sec-alt"><div class="wrap">${head('', W('alsoLike'))}${listingsGrid(others)}</div></section>` : ''}`;
}
function seasonDates(s) {
  const f = (md) => new Intl.DateTimeFormat(LOCALE(), { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(day('2001-' + md));
  return `${f(s.from)} – ${f(s.to)}`;
}
function quickFields(it, st = {}) {
  const t = today();
  const max = it.capacity || 10;
  return `<div class="qf-row">${RANGE
    ? `<input type="hidden" name="in" value="${esc(st.in || Q.get('in') || '')}"><input type="hidden" name="out" value="${esc(st.out || Q.get('out') || '')}"><div class="cal qcal" data-qcal></div>`
    : `<label class="sf"><span>${esc(W('date'))}</span><input type="date" name="date" min="${t}" value="${st.date || Q.get('date') || addDays(t, 7)}"></label>`}</div>
    <label class="sf"><span>${esc(W('people'))}</span><select name="n">${peopleOptions(max, Math.min(+(st.n || Q.get('n') || 2), max))}</select></label>`;
}
function wireListing() {
  const g = $('[data-lpgal]');
  if (g) {
    const it = byId(Q.get('id')) || LIST()[0];
    g.addEventListener('click', (e) => { const b = e.target.closest('[data-li]'); if (b) lightbox((it.images || []).map((im) => ({ src: im, alt: tx(imgOf(im).alt) })), +b.dataset.li); });
  }
  const card = $('[data-quick]');
  if (!card) return;
  const it = byId(card.dataset.quick);
  const upd = () => {
    const st = { in: $('[name="in"]', card)?.value, out: $('[name="out"]', card)?.value, date: $('[name="date"]', card)?.value, n: $('[name="n"]', card).value };
    const e = estimate(it, st), box = $('[data-qe]', card);
    const ready = RANGE ? st.in && st.out : st.date;
    box.innerHTML = ready ? (e.error ? `<p class="qe-err">${esc(e.error)}</p>` : `${e.lines.map((l) => `<p><span>${esc(l.label)}</span><span>${esc(money(l.amount))}</span></p>`).join('')}<p class="qe-total"><span>${esc(ui('estTotal'))}</span><b>${esc(money(e.total))}</b></p>`) : `<p class="qe-hint">${esc(RANGE ? ui('pickDates') : ui('pickDate'))}</p>`;
    $('[data-quick-go]', card).href = bookHref(it.id, `&n=${st.n}${st.in ? '&in=' + st.in : ''}${st.out ? '&out=' + st.out : ''}${st.date ? '&date=' + st.date : ''}`);
  };
  const a = $('[name="in"]', card), b = $('[name="out"]', card), qc = $('[data-qcal]', card);
  if (RANGE && qc) {
    if (!a.value || !b.value) { const r = freeRange(it, addDays(today(), 14)); a.value = r[0]; b.value = r[1]; }
    calendar(qc, { months: 1, in: a.value, out: b.value, booked: () => it.booked || [], minFor: () => minOf(it), price: (d) => shortMoney(rateOn(it, d).price), priceNote: ui('calPriceNote', { cur: curLabel() }), onChange: (x, y) => { a.value = x; b.value = y; upd(); } });
  }
  card.addEventListener('input', upd); card.addEventListener('change', upd); upd();
}

/* ---------- the booking flow ---------- */
let bookState = null, bookCal = null;
function bookPage() {
  const id = Q.get('id') || (LIST()[0] || {}).id;
  const it = byId(id) || LIST()[0];
  const extras = (C.extras || []).filter((x) => has(x.label) && (!x.only || x.only.includes(it.id)));
  const countries = (L().countries || []);
  const kidsOn = TYPE === 'tour' && LIST().some((x) => x.childPrice != null);
  return `<section class="book-head"><div class="wrap"><a class="crumb-back" href="${it ? itemHref(it.id) : PG.listings}">${icon('chevL')}${esc(ui('back'))}</a><h1 class="h2">${esc(ui('bookTitle'))}</h1><p class="lead">${esc(ui('bookLead'))}</p></div></section>
  <section class="sec book"><div class="wrap book-in">
    <form class="bk" data-book novalidate>
      <ol class="bk-steps" aria-hidden="true"><li class="on"><span>1</span>${esc(W('step1'))}</li>${extras.length ? `<li><span>2</span>${esc(ui('stepExtras'))}</li>` : ''}<li><span>${extras.length ? 3 : 2}</span>${esc(ui('stepDetails'))}</li></ol>
      <fieldset class="bk-page on" data-bpage>
        <legend class="sr">${esc(W('step1'))}</legend>
        <label class="fld"><span class="lbl">${esc(W('item'))}</span><select name="listing" data-label="${esc(W('item'))}">${LIST().map((x) => `<option value="${esc(x.id)}"${x.id === it.id ? ' selected' : ''}>${esc(tx(x.name))} · ${esc(ui('from').toLowerCase())} ${esc(money(fromPrice(x)))}</option>`).join('')}</select></label>
        <div class="row-2">${RANGE
          ? `<input type="hidden" name="in" value="${esc(Q.get('in') || '')}"><input type="hidden" name="out" value="${esc(Q.get('out') || '')}"><div class="fld bk-calf"><span class="lbl">${esc(ui('dates'))}</span><div class="cal bk-cal" data-bcal></div></div>`
          : `<label class="fld"><span class="lbl">${esc(W('date'))}</span><input type="date" name="date" required min="${today()}" value="${esc(Q.get('date') || '')}" data-label="${esc(W('date'))}"></label>${has(B().times) ? `<label class="fld"><span class="lbl">${esc(ui('time'))}</span><select name="time" data-label="${esc(ui('time'))}">${B().times.map((x) => `<option>${esc(tx(x))}</option>`).join('')}</select></label>` : ''}`}</div>
        <div class="row-2">
          <div class="fld"><span class="lbl">${esc(TYPE === 'tour' ? W('adults') : W('people'))}</span><div class="step"><button type="button" data-step="-1" aria-label="${esc(ui('less'))}">${icon('minus')}</button><input type="number" name="n" min="1" max="${it.capacity || 20}" value="${Math.min(+(Q.get('n') || 2), it.capacity || 20)}" inputmode="numeric" data-label="${esc(TYPE === 'tour' ? W('adults') : W('people'))}"><button type="button" data-step="1" aria-label="${esc(ui('more'))}">${icon('plus')}</button></div></div>
          ${kidsOn ? `<div class="fld"><span class="lbl">${esc(W('children'))}${has(B().childAge) ? ` <small>${esc(tx(B().childAge))}</small>` : ''}</span><div class="step"><button type="button" data-step="-1" aria-label="${esc(ui('less'))}">${icon('minus')}</button><input type="number" name="kids" min="0" max="10" value="0" inputmode="numeric" data-label="${esc(W('children'))}"><button type="button" data-step="1" aria-label="${esc(ui('more'))}">${icon('plus')}</button></div></div>` : ''}
        </div>
        <p class="note">${icon('info')}${esc(ui('availNote'))}</p>
      </fieldset>
      ${extras.length ? `<fieldset class="bk-page" data-bpage><legend class="h3">${esc(ui('extrasTitle'))}</legend><div class="extras">${extras.map((x) => `<label class="xopt"><input type="checkbox" name="extras" value="${esc(x.id)}" data-label="${esc(ui('stepExtras'))}"><span class="xo-box">${icon(x.icon || 'plus')}<span><b>${esc(tx(x.label))}</b>${has(x.text) ? `<small>${esc(tx(x.text))}</small>` : ''}</span><em>${x.price ? `${esc(money(x.price))} <small>${esc(ui('per_' + (x.per || 'booking'), { unit: W('unit'), person: W('person') }))}</small>` : esc(ui('free'))}</em><i class="xo-tick">${icon('check')}</i></span></label>`).join('')}</div></fieldset>` : ''}
      <fieldset class="bk-page" data-bpage>
        <legend class="h3">${esc(ui('yourDetails'))}</legend>
        <label class="fld"><span class="lbl">${esc(ui('fName'))}</span><input name="name" autocomplete="name" required data-label="${esc(ui('fName'))}"></label>
        <div class="row-2">
          <label class="fld"><span class="lbl">${esc(ui('fEmail'))}</span><input name="email" type="email" autocomplete="email" required data-label="${esc(ui('fEmail'))}"></label>
          <label class="fld"><span class="lbl">${esc(ui('fPhone'))} <small>${esc(ui('withCode'))}</small></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required data-label="${esc(ui('fPhone'))}"></label>
        </div>
        <label class="fld"><span class="lbl">${esc(ui('fCountry'))}</span><input name="country" list="wl-countries" autocomplete="country-name" data-label="${esc(ui('fCountry'))}"><datalist id="wl-countries">${countries.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></label>
        <label class="fld"><span class="lbl">${esc(ui('fMessage'))} <small>${esc(ui('optional'))}</small></span><textarea name="message" placeholder="${esc(W('messageHint'))}" data-label="${esc(ui('fMessage'))}"></textarea></label>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
      </fieldset>
      <p class="form-status" data-status role="status" hidden></p>
      <div class="bk-nav">
        <button type="button" class="btn btn-line" data-bback hidden>${icon('chevL')}${esc(ui('back'))}</button>
        <button type="button" class="btn btn-primary btn-lg" data-bnext>${esc(ui('continue'))}${icon('arrow', 'i-go')}</button>
        ${B().sendVia !== 'whatsapp' ? `<button type="submit" class="btn btn-primary btn-lg" data-bsend hidden>${icon('send')}${esc(ui('sendRequest'))}</button>` : ''}
        ${B().sendVia !== 'endpoint' && waHref() ? `<button type="button" class="btn btn-wa btn-lg" data-bwa hidden>${icon('wa')}${esc(ui('confirmWa'))}</button>` : ''}
      </div>
    </form>
    <aside class="bk-sum" data-sum aria-live="polite"></aside>
  </div></section>
  <div class="bk-done" data-bdone hidden></div>`;
}
function readBook(f) {
  const v = (n) => (f.elements[n] ? f.elements[n].value : '');
  return { id: v('listing'), in: v('in'), out: v('out'), date: v('date'), time: v('time'), n: v('n'), kids: v('kids'), extras: $$('[name="extras"]:checked', f).map((x) => x.value) };
}
function restoreBook(st) {
  const f = $('[data-book]');
  if (!f) return;
  for (const k of ['in', 'out', 'date', 'n', 'kids', 'time']) if (f.elements[k] && st[k]) f.elements[k].value = st[k];
  if (st.id) f.elements.listing.value = st.id;
  $$('[name="extras"]', f).forEach((x) => { x.checked = (st.extras || []).includes(x.value); });
  if (bookCal && RANGE) bookCal.set(st.in, st.out);
  f.dispatchEvent(new Event('change'));
}
function bookSummaryText(st, e, it) {
  const d = RANGE ? `${nice(st.in)} → ${nice(st.out)} (${e.units} ${e.units === 1 ? W('unit') : W('units')})` : `${nice(st.date)}${st.time ? ' · ' + st.time : ''}`;
  const lines = [ui('waIntro', { name: C.name }), '', `${W('item')}: ${tx(it.name)}`, `${RANGE ? ui('dates') : W('date')}: ${d}`, `${W('people')}: ${st.n}${+st.kids ? ` + ${st.kids} ${W('children').toLowerCase()}` : ''}`];
  const ex = (st.extras || []).map((id) => tx(((C.extras || []).find((x) => x.id === id) || {}).label)).filter(Boolean);
  if (ex.length) lines.push(`${ui('stepExtras')}: ${ex.join(', ')}`);
  lines.push(`${ui('estTotal')}: ${fmtIn(e.total, BASE())}${cur !== BASE() ? ` (≈ ${money(e.total)})` : ''}`);
  const f = $('[data-book]');
  for (const n of ['name', 'email', 'phone', 'country', 'message']) { const el = f.elements[n]; if (el && el.value) lines.push(`${el.dataset.label}: ${el.value}`); }
  return lines.join('\n');
}
const bookRecord = (st, e, it, f) => ({ type: 'booking', item: tx(it.name), itemId: it.id, in: st.in, out: st.out, date: st.date, time: st.time, guests: st.n, kids: st.kids, total: Math.round(e.total), currency: BASE(), extras: (st.extras || []).join(', '), ...formFields(f) });
function wireBook() {
  const f = $('[data-book]');
  if (!f) return;
  bookState = () => readBook(f);
  const bc = $('[data-bcal]', f);
  bookCal = null;
  if (RANGE && bc) {
    const item = () => byId(f.elements.listing.value) || LIST()[0];
    bookCal = calendar(bc, { months: innerWidth < 760 ? 1 : 2, in: f.elements.in.value, out: f.elements.out.value, booked: () => item().booked || [], minFor: () => minOf(item()), price: (d) => shortMoney(rateOn(item(), d).price), priceNote: ui('calPriceNote', { cur: curLabel() }), onChange: (x, y) => { f.elements.in.value = x; f.elements.out.value = y; draw(); } });
  }
  const pages = $$('[data-bpage]', f), steps = $$('.bk-steps li', f), sum = $('[data-sum]');
  const back = $('[data-bback]', f), next = $('[data-bnext]', f), send = $('[data-bsend]', f), wa = $('[data-bwa]', f);
  let at = 0;
  const draw = () => {
    const st = readBook(f), it = byId(st.id), e = estimate(it, st);
    const dep = B().depositPct ? Math.round(e.total * B().depositPct / 100) : 0;
    const when = RANGE ? (st.in && st.out ? `${nice(st.in)} → ${nice(st.out)}` : ui('pickDates')) : (st.date ? nice(st.date) : ui('pickDate'));
    sum.innerHTML = `<div class="sum-card">
      <figure>${pic((it.images || [])[0], { w: 700, sizes: '(min-width: 1000px) 380px, 100vw' })}</figure>
      <div class="sum-body">
        <p class="eyebrow">${esc(ui('yourBooking'))}</p><h2 class="h3">${esc(tx(it.name))}</h2>
        <p class="sum-meta">${icon('calendar')}${esc(when)}</p><p class="sum-meta">${icon('users')}${esc(st.n)} ${esc(W('people').toLowerCase())}${+st.kids ? ` + ${esc(st.kids)} ${esc(W('children').toLowerCase())}` : ''}</p>
        ${e.error ? `<p class="qe-err">${esc(e.error)}</p>` : ''}
        <div class="sum-lines">${e.lines.map((l) => `<p><span>${esc(l.label)}</span><span>${esc(money(l.amount))}</span></p>`).join('')}</div>
        <p class="sum-total"><span>${esc(ui('estTotal'))}</span><b>${esc(money(e.total))}</b></p>
        ${moneyAlt(e.total) ? `<p class="sum-alt">${esc(moneyAlt(e.total))}</p>` : ''}
        ${dep ? `<p class="sum-dep">${esc(ui('depositLine', { pct: B().depositPct, amount: money(dep) }))}</p>` : ''}
        <ul class="sum-why">${(((sec('whyDirect') || {}).items) || []).slice(0, 3).map((x) => `<li>${icon('check')}${esc(tx(x.title))}</li>`).join('')}</ul>
      </div></div>`;
    const bar = $('[data-bk-total]');
    bar && (bar.textContent = money(e.total));
    // keep the date range sensible
    const a = f.elements.in, b = f.elements.out;
    if (a && b && a.value) b.min = addDays(a.value, 1);
    const cap = it.capacity || 20; f.elements.n.max = cap; if (+f.elements.n.value > cap) f.elements.n.value = cap;
    return e;
  };
  const show = (k, dir = 1) => {
    pages[at].classList.remove('on'); at = k; pages[at].style.setProperty('--dir', dir); pages[at].classList.add('on');
    steps.forEach((s, i) => { s.classList.toggle('on', i <= at); s.classList.toggle('done', i < at); });
    const last = at === pages.length - 1;
    back.hidden = at === 0; next.hidden = last;
    if (send) send.hidden = !last; if (wa) wa.hidden = !last;
    f.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  };
  const valid = () => {
    const ok = $$('input, select, textarea', pages[at]).every((el) => el.checkValidity() || (el.reportValidity(), false));
    if (!ok) return false;
    if (at === 0) { const e = draw(); if (e.error) { const s = $('[data-status]', f); s.hidden = false; s.className = 'form-status err'; s.textContent = e.error; return false; } $('[data-status]', f).hidden = true; }
    return true;
  };
  f.addEventListener('input', draw); f.addEventListener('change', (e) => {
    if (e.target.name === 'listing' && bookCal) { bookCal.redraw(); const g = bookCal.get(); f.elements.in.value = g.in; f.elements.out.value = g.out; }
    draw();
  });
  f.addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const inp = $('input', b.parentElement), v = (+inp.value || 0) + (+b.dataset.step);
    inp.value = Math.max(+inp.min || 0, Math.min(+inp.max || 99, v)); draw();
  });
  next.addEventListener('click', () => { if (valid()) show(at + 1, 1); });
  back.addEventListener('click', () => show(at - 1, -1));
  const finish = (via) => {
    const st = readBook(f), it = byId(st.id), e = estimate(it, st);
    const ref = (C.booking && C.booking.refPrefix || 'BK') + '-' + Date.now().toString(36).slice(-5).toUpperCase();
    const done = $('[data-bdone]');
    const swap = () => {
    $('.book').hidden = true; $('.book-head').hidden = true;
    const bar = $('.bk-mbar'); bar && bar.remove();   // the "total / details" bar belongs to the form, not to the thank-you screen
    done.hidden = false;
    done.innerHTML = `<div class="wrap narrow done-in">${icon('check', 'done-tick')}<p class="eyebrow">${esc(ui('ref', { ref }))}</p><h1 class="h1">${esc(ui('doneTitle'))}</h1><p class="lead">${esc(via === 'wa' ? ui('doneWa') : ui('doneSent'))}</p>
      <div class="done-card"><h2 class="h3">${esc(tx(it.name))}</h2><p>${esc(RANGE ? `${nice(st.in)} → ${nice(st.out)}` : nice(st.date))} · ${esc(st.n)} ${esc(W('people').toLowerCase())}</p><p class="sum-total"><span>${esc(ui('estTotal'))}</span><b>${esc(money(e.total))}</b></p></div>
      ${(C.payments || {}).link && e.total ? (() => { const amt = Math.round(B().depositPct ? e.total * B().depositPct / 100 : e.total); return `<div class="pay-box"><a class="btn btn-accent btn-lg" href="${esc(payHref(amt, BASE(), ref))}" target="_blank" rel="noopener">${icon('lock')}${esc(ui('payNow', { amount: fmtIn(amt, BASE()) }))}</a>${has((C.payments || {}).note) ? `<p>${esc(tx(C.payments.note))}</p>` : ''}</div>`; })() : ''}
      <ol class="next-steps"><li>${esc(ui('next1'))}</li><li>${esc(ui('next2', { pct: B().depositPct }))}</li><li>${esc(ui('next3'))}</li></ol>
      <p class="btns"><a class="btn btn-primary btn-lg" href="./">${esc(ui('backHome'))}</a>${waHref() ? `<a class="btn btn-line btn-lg" href="${waHref(ui('waFollow', { ref }))}" target="_blank" rel="noopener">${icon('wa')}WhatsApp</a>` : ''}</p></div>`;
    };
    // shown from its top, whatever the page was doing (on a snapping page the old sections must not be held on to)
    if (snapPages.swap && document.documentElement.classList.contains('snap')) snapPages.swap(swap); else { swap(); scrollTo({ top: 0, behavior: 'instant' }); }
  };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!valid()) return;
    const st = readBook(f), it = byId(st.id), text = bookSummaryText(st, estimate(it, st), it);
    const ok = await sendForm(f, { subject: ui('bookSubject', { name: C.name }), summary: text, record: bookRecord(st, estimate(it, st), it, f) });
    if (ok && (demoOn() || (C.form || {}).endpoint)) finish('form');
  });
  wa && wa.addEventListener('click', () => {
    if (!valid()) return;
    const st = readBook(f), it = byId(st.id), text = bookSummaryText(st, estimate(it, st), it);
    if (demoOn()) demoShow('wa', text); else { inboxSend({ ...bookRecord(st, estimate(it, st), it, f), via: 'whatsapp' }); window.open(waHref(text), '_blank', 'noopener'); }
    finish('wa');
  });
  // start one step on if dates arrived from the search bar or the listing page
  if (RANGE && bookCal) {
    if (!f.elements.in.value || !f.elements.out.value) { const r = freeRange(byId(f.elements.listing.value) || LIST()[0], addDays(today(), 14)); bookCal.set(r[0], r[1]); } else bookCal.redraw();
    const g = bookCal.get(); f.elements.in.value = g.in; f.elements.out.value = g.out;
  }
  if (!RANGE && !f.elements.date.value) f.elements.date.value = addDays(today(), 7);
  draw();
  document.body.insertAdjacentHTML('beforeend', '');
  const bar = $('.bk-mbar');
  bar || $('#app').insertAdjacentHTML('beforeend', `<div class="bk-mbar"><p><span>${esc(ui('estTotal'))}</span><b data-bk-total></b></p><div class="bar-go">${waHref() ? `<a class="bar-wa" href="${waHref(tx(K().whatsappMessage))}" target="_blank" rel="noopener" aria-label="${esc(ui('whatsappUs'))}">${icon('wa')}</a>` : ''}<button type="button" class="btn btn-accent" data-to-sum>${esc(ui('details'))}</button></div></div>`);
  $('[data-to-sum]')?.addEventListener('click', () => sum.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }));
  draw();
}

boot(TIER);
})();
