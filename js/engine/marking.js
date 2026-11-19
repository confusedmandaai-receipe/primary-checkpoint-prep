// Answer checking for every question type.
// Types: mcq (answer = option index), multi (answer = [indices]),
// numeric (answer = number, optional tolerance), text (answer = [accepted strings]).

export function parseNumber(input) {
  if (input == null) return NaN;
  let s = String(input).trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');
  s = s.replace(/−/g, '-').replace(/^[£$€₹]\s*/, '').replace(/^(-?)[£$€₹]/, '$1');
  s = s.replace(/\s*(cm²|cm³|m²|m³|[a-z%°£$€₹²³]+)\.?$/i, '').trim(); // allow a trailing unit
  if (s === '') return NaN;
  // mixed number "1 1/2"
  let m = s.match(/^(-?\d+) (\d+)\/(\d+)$/);
  if (m) {
    const whole = Number(m[1]);
    const frac = Number(m[2]) / Number(m[3]);
    return whole < 0 ? whole - frac : whole + frac;
  }
  m = s.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  if (/^-?\d*\.?\d+$/.test(s)) return Number(s);
  return NaN;
}

export function normaliseText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/−/g, '-')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([:,/()])\s*/g, '$1')
    .trim();
}

/** Returns {ok, misconception?} for a response. Empty responses are incorrect. */
export function mark(q, response) {
  if (response == null || response === '' || (Array.isArray(response) && response.length === 0)) {
    return { ok: false };
  }
  switch (q.type) {
    case 'mcq': {
      const ok = Number(response) === q.answer;
      return { ok, misconception: ok ? undefined : q.mistakes?.[String(response)] };
    }
    case 'multi': {
      const want = [...q.answer].sort().join(',');
      const got = [...response].map(Number).sort().join(',');
      return { ok: want === got };
    }
    case 'numeric': {
      const v = parseNumber(response);
      if (Number.isNaN(v)) return { ok: false };
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      const tol = q.tolerance ?? 1e-9;
      const ok = answers.some((a) => Math.abs(v - a) <= tol);
      return { ok, misconception: ok ? undefined : q.mistakes?.[String(v)] };
    }
    case 'text': {
      const r = normaliseText(response);
      const ok = q.answer.some((a) => normaliseText(a) === r);
      return { ok, misconception: ok ? undefined : q.mistakes?.[r] };
    }
    default:
      return { ok: false };
  }
}

/** Human-readable correct answer. */
export function answerText(q) {
  switch (q.type) {
    case 'mcq': return q.options[q.answer];
    case 'multi': return q.answer.map((i) => q.options[i]).join('; ');
    case 'numeric': {
      const a = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      if (q.display != null) return String(q.display);
      if (!q.unit) return String(a);
      if (q.unit === '$') return `$${a}`;
      if (q.unit === '°' || q.unit === '%' || q.unit === 'c') return `${a}${q.unit}`;
      return `${a} ${q.unit}`;
    }
    case 'text': return q.answer[0];
    default: return '';
  }
}

export function responseText(q, resp) {
  if (resp == null || resp === '' || (Array.isArray(resp) && !resp.length)) return '—';
  if (q.type === 'mcq') return q.options[Number(resp)] ?? '—';
  if (q.type === 'multi') return resp.map((i) => q.options[i]).join('; ');
  return String(resp);
}
