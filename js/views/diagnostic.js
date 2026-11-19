import { h, pct, formatDate, isoDate } from '../core/util.js';
import { overview, priorityList, CATEGORY } from '../engine/analytics.js';
import { categoryChip, subjClass, subjectChip } from '../components/ui.js';

export function renderDiagnostic(root, ctx) {
  const { state, content } = ctx;
  const ov = overview(state, content);
  root.append(h('div', { class: 'page-head' },
    h('h1', {}, 'Diagnostic assessment'),
    h('p', {}, 'One short assessment per subject (about 20–25 minutes each). No hints and no time limit — just show what you know. Your results set the priorities for the rest of the plan.')));

  root.append(h('div', { class: 'grid grid-3' }, content.subjects.map((s) => {
    const d = state.diagnostics[s.id];
    const sess = d && state.sessions.find((x) => x.id === d.sessionId);
    const n = content.questions.filter((q) => q.pool === 'diagnostic' && q.subject === s.id).length;
    return h('div', { class: `sheet tabbed ${subjClass(s.id)}` },
      h('h3', {}, `${s.icon} ${s.name}`),
      h('p', { class: 'small muted' }, `Cambridge Primary ${s.code} · ${n} questions`),
      sess
        ? h('div', {}, h('p', {}, `Completed ${formatDate(isoDate(new Date(sess.finishedAt)))} — ${sess.score}/${sess.total} (${pct(sess.score, sess.total)}%)`),
          h('div', { class: 'btn-row' }, h('a', { class: 'btn secondary small', href: `#/result/${sess.id}` }, 'Review answers'),
            h('button', { class: 'btn ghost small', onclick: () => ctx.start('diagnostic', { subject: s.id }) }, 'Retake')))
        : h('button', { class: 'btn', onclick: () => ctx.start('diagnostic', { subject: s.id }) }, `Start ${s.short} diagnostic`));
  })));

  if (!Object.keys(state.diagnostics).length) return;

  root.append(h('section', { class: 'section' }, h('h2', {}, 'What the diagnostic shows'),
    h('div', { class: 'grid grid-3' }, content.subjects.filter((s) => state.diagnostics[s.id]).map((s) => {
      const groups = { strong: [], developing: [], attention: [], untested: [] };
      for (const t of s.topics) groups[ov.mastery[t.id].category].push(t);
      return h('div', { class: `sheet tabbed ${subjClass(s.id)}` },
        h('h3', {}, s.name),
        ['attention', 'developing', 'strong'].map((c) => groups[c].length ? h('div', { style: 'margin-bottom:.7rem' },
          categoryChip(c),
          h('ul', { class: 'small', style: 'margin:.3rem 0 0;padding-left:1.1rem' }, groups[c].map((t) => h('li', {}, t.name)))) : null));
    }))));

  const prio = priorityList(state, content).filter((p) => p.category !== 'strong').slice(0, 8);
  root.append(h('section', { class: 'section' },
    h('h2', {}, 'Your study priority list'),
    h('p', { class: 'muted' }, 'Topics are ordered by how much they need work and how often they appear in Checkpoint papers. Your daily plan follows this order and updates as you improve.'),
    h('ol', { class: 'list sheet' }, prio.map((p) => h('li', {},
      h('div', { class: 'grow' }, h('b', {}, p.name), h('div', { class: 't-meta small' }, subjectChip(content, p.subject), ' ', categoryChip(p.category), p.n ? h('span', { class: 'muted' }, ` ${Math.round(p.accuracy * 100)}% so far`) : null)),
      h('a', { class: 'btn secondary small', href: `#/learn/${p.topic}` }, 'Learn'))))));
}
