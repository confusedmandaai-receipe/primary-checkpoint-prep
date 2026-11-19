// Reusable UI pieces: progress bars, rings, charts, stimulus renderers, toasts.
import { h, esc, pct } from '../core/util.js';
import { CATEGORY } from '../engine/analytics.js';

export function subjClass(subject) { return subject ? `subj-${subject}` : ''; }

export function categoryChip(cat) {
  return h('span', { class: `chip ${cat}` }, CATEGORY[cat]?.label ?? cat);
}

export function subjectChip(content, subject) {
  const s = content.subjectById[subject];
  if (!s) return null;
  return h('span', { class: `chip subj ${subjClass(subject)}` }, s.short);
}

export function progressBar(value, { label, subject, suffix = '%' } = {}) {
  const wrap = h('div', { class: subjClass(subject) });
  if (label != null) wrap.append(h('div', { class: 'metric' }, h('span', {}, label), h('span', { class: 'val' }, `${value}${suffix}`)));
  wrap.append(h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': value, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': label || 'progress' }, h('span', { style: `width:${Math.max(0, Math.min(100, value))}%` })));
  return wrap;
}

export function ring(value, { small = false, color, label } = {}) {
  return h('div', { class: `ring${small ? ' sm' : ''}`, style: `--p:${value};${color ? `--c:${color}` : ''}`, role: 'img', 'aria-label': label || `${value}%` }, h('b', {}, `${value}`));
}

export function toast(html, ms = 4200) {
  const el = h('div', { class: 'toast', role: 'status', html });
  document.body.append(el);
  setTimeout(() => el.remove(), ms);
}

/* ---------- charts (plain SVG, no library) ---------- */

export function barChart({ labels, values, max = null, color = '#1b2a4a', yLabel = '', height = 200, fmt = (v) => v }) {
  const W = 520, H = height, padL = 40, padB = 34, padT = 14;
  const top = max ?? Math.max(...values.filter((v) => v != null), 1) * 1.15;
  const bw = (W - padL - 10) / labels.length;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel || 'Bar chart')}" font-family="Atkinson Hyperlegible, sans-serif" font-size="12">`;
  for (let i = 0; i <= 4; i++) {
    const y = padT + ((H - padT - padB) * i) / 4;
    const v = Math.round(top - (top * i) / 4);
    s += `<line x1="${padL}" x2="${W - 6}" y1="${y}" y2="${y}" stroke="#e3eaf4"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end" fill="#4a5878">${v}</text>`;
  }
  labels.forEach((lab, i) => {
    const v = values[i];
    const x = padL + i * bw + bw * 0.18;
    const w = bw * 0.64;
    if (v != null) {
      const bh = ((H - padT - padB) * v) / top;
      s += `<rect x="${x}" y="${H - padB - bh}" width="${w}" height="${bh}" rx="3" fill="${Array.isArray(color) ? color[i] : color}"/>`;
      s += `<text x="${x + w / 2}" y="${H - padB - bh - 4}" text-anchor="middle" fill="#1b2a4a" font-weight="700">${esc(fmt(v))}</text>`;
    }
    s += `<text x="${x + w / 2}" y="${H - padB + 16}" text-anchor="middle" fill="#4a5878">${esc(lab)}</text>`;
  });
  if (yLabel) s += `<text x="12" y="${padT + 4}" fill="#4a5878" font-size="11">${esc(yLabel)}</text>`;
  return s + '</svg>';
}

export function lineChart({ labels, values, yLabel = '', xLabel = '', height = 220 }) {
  const W = 520, H = height, padL = 46, padB = 44, padT = 16;
  const vmax = Math.max(...values), vmin = Math.min(0, ...values);
  const top = Math.ceil((vmax * 1.1) / 10) * 10 || 10;
  const sx = (i) => padL + ((W - padL - 16) * i) / Math.max(1, labels.length - 1);
  const sy = (v) => H - padB - ((H - padT - padB) * (v - vmin)) / (top - vmin);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yLabel || 'Line graph')}" font-family="Atkinson Hyperlegible, sans-serif" font-size="12">`;
  for (let i = 0; i <= 5; i++) {
    const v = vmin + ((top - vmin) * i) / 5;
    s += `<line x1="${padL}" x2="${W - 10}" y1="${sy(v)}" y2="${sy(v)}" stroke="#e3eaf4"/><text x="${padL - 6}" y="${sy(v) + 4}" text-anchor="end" fill="#4a5878">${Math.round(v)}</text>`;
  }
  labels.forEach((l, i) => { s += `<line x1="${sx(i)}" x2="${sx(i)}" y1="${padT}" y2="${H - padB}" stroke="#eef2f8"/><text x="${sx(i)}" y="${H - padB + 16}" text-anchor="middle" fill="#4a5878">${esc(l)}</text>`; });
  s += `<polyline fill="none" stroke="#1b2a4a" stroke-width="2.5" points="${values.map((v, i) => `${sx(i)},${sy(v)}`).join(' ')}"/>`;
  values.forEach((v, i) => { s += `<circle cx="${sx(i)}" cy="${sy(v)}" r="4.5" fill="#fff" stroke="#1b2a4a" stroke-width="2"/>`; });
  if (yLabel) s += `<text x="10" y="${padT - 4}" fill="#4a5878" font-size="11">${esc(yLabel)}</text>`;
  if (xLabel) s += `<text x="${(W + padL) / 2}" y="${H - 6}" text-anchor="middle" fill="#4a5878" font-size="11">${esc(xLabel)}</text>`;
  return s + '</svg>';
}

/** Renders question stimuli and lesson visuals. */
export function renderVisual(v) {
  if (!v) return null;
  const fig = h('figure', { class: 'stimulus' });
  if (v.type === 'table') {
    const t = h('table', { class: 'data-table' });
    if (v.caption) t.append(h('caption', {}, v.caption));
    t.append(h('thead', {}, h('tr', {}, v.headers.map((x) => h('th', { scope: 'col' }, x)))));
    t.append(h('tbody', {}, v.rows.map((r) => h('tr', {}, r.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, c) : h('td', {}, c)))))));
    fig.append(h('div', { class: 'table-wrap' }, t));
    return fig;
  }
  if (v.type === 'bar') fig.append(h('div', { class: 'chart', html: barChart({ labels: v.labels, values: v.values, yLabel: v.yLabel, color: '#5b7fb5' }) }));
  else if (v.type === 'line') fig.append(h('div', { class: 'chart', html: lineChart(v) }));
  else if (v.type === 'svg') fig.append(h('div', { html: v.svg }));
  else if (v.type === 'placeValue') {
    fig.append(h('div', { class: 'pv' }, v.columns.map((c, i) => h('div', { class: c === '.' ? 'pt' : '' }, h('small', {}, c === '.' ? '' : c), h('b', {}, v.digits[i])))));
  } else if (v.type === 'fractionBars') {
    const rows = v.bars.map((b) => {
      const cells = Array.from({ length: b.parts }, (_, i) => `<rect x="${2 + (i * 300) / b.parts}" y="2" width="${300 / b.parts}" height="30" fill="${i < b.shaded ? '#9cc3f0' : '#fff'}" stroke="#1b2a4a" stroke-width="1.5"/>`).join('');
      return `<div style="display:flex;align-items:center;gap:.8rem;margin-bottom:.4rem"><svg viewBox="0 0 304 34" style="max-width:320px;width:100%">${cells}</svg><b>${esc(b.label)}</b></div>`;
    }).join('');
    fig.append(h('div', { html: rows }));
  }
  if (v.caption && v.type !== 'table') fig.append(h('figcaption', {}, v.caption));
  return fig;
}

export function renderPassage(p) {
  const isPoem = /poem/i.test(p.type);
  return h('article', { class: `passage${isPoem ? ' poem' : ''}`, 'aria-label': `Reading passage: ${p.title}` },
    h('h3', {}, p.title),
    h('div', { class: 'ptype' }, `${p.type}${isPoem ? ' — numbers show verses' : ' — numbers show paragraphs'}`),
    h('ol', {}, p.paragraphs.map((para) => h('li', {}, isPoem ? para.split(' / ').join('\n') : para))));
}

export function percentText(score, total) { return `${pct(score, total)}%`; }

export function backLink(href, text) {
  return h('a', { href, class: 'btn ghost small' }, '‹ ', text);
}
