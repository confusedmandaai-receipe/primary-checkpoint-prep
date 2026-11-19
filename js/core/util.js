// Small shared helpers. No DOM access except `h` / `esc`.

export const DAY_MS = 86400000;

/** Local date as YYYY-MM-DD (study days follow the student's own clock). */
export function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

/** Whole days from a to b (b - a). */
export function daysBetween(aIso, bIso) {
  return Math.round((parseDate(bIso) - parseDate(aIso)) / DAY_MS);
}

export function formatDate(iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return parseDate(iso).toLocaleDateString(undefined, opts);
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Deterministic PRNG so a day's plan / question pick is stable. */
export function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function groupBy(arr, fn) {
  const out = {};
  for (const x of arr) {
    const k = typeof fn === 'function' ? fn(x) : x[fn];
    (out[k] ||= []).push(x);
  }
  return out;
}

export function sum(arr, fn = (x) => x) {
  return arr.reduce((s, x) => s + fn(x), 0);
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function pct(n, d) {
  return d ? Math.round((n / d) * 100) : 0;
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Tiny element builder: h('div', {class:'x', onclick: fn}, child, 'text') */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function minutesLabel(m) {
  if (m < 60) return `${m} min`;
  const hrs = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${hrs} h ${rest} min` : `${hrs} h`;
}
