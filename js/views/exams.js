import { h, pct, formatDate, isoDate, minutesLabel } from '../core/util.js';
import { mockHistory } from '../engine/analytics.js';
import { stageForDate } from '../engine/planner.js';
import { subjClass, barChart } from '../components/ui.js';

export function renderExams(root, ctx) {
  const { state, content } = ctx;
  const stage = stageForDate(state.profile, ctx.today(), state);
  root.append(h('div', { class: 'page-head' },
    h('h1', {}, 'Checkpoint Practice Centre'),
    h('p', {}, 'Exam simulations are kept separate from everyday practice. There are no hints and no feedback until you finish — just like the real thing. Questions here are original and written in the Cambridge style; they are not past papers.')));

  if (stage.id < 3) {
    root.append(h('p', { class: 'note' }, 'Timed mocks are scheduled from the exam practice stage onwards, once you have worked on your weak topics. You can still try one now to see where you stand.'));
  }

  root.append(h('section', { class: 'section' }, h('h2', {}, 'Subject mock examinations'),
    h('div', { class: 'grid grid-3' }, content.subjects.map((s) => {
      const hist = mockHistory(state, s.id);
      const pool = content.questions.filter((q) => q.pool === 'mock' && q.subject === s.id).length;
      const mins = h('select', { 'aria-label': `${s.name} mock length` }, [30, 45, 60].map((m) => h('option', { value: m, selected: m === 45 }, `${m} minutes`)));
      return h('div', { class: `sheet tabbed ${subjClass(s.id)}` },
        h('h3', {}, `${s.icon} ${s.name}`),
        h('p', { class: 'small muted' }, `About 20 questions across all topics · ${pool} questions in the mock bank`),
        hist.length ? h('p', { class: 'small' }, `Last mock: ${pct(hist[0].score, hist[0].total)}% on ${formatDate(isoDate(new Date(hist[0].finishedAt)))}`) : h('p', { class: 'small muted' }, 'Not attempted yet'),
        h('div', { class: 'field', style: 'margin-bottom:.6rem' }, mins),
        h('button', { class: 'btn', onclick: () => ctx.start('mock', { subject: s.id, minutes: Number(mins.value) }) }, 'Start timed mock'));
    }))));

  root.append(h('section', { class: 'section grid grid-2' },
    h('div', { class: 'sheet' },
      h('h3', {}, 'Mixed-topic assessment'),
      h('p', { class: 'small muted' }, '15 questions across all three subjects, under exam conditions but untimed. This is the same format as your weekly check.'),
      h('button', { class: 'btn secondary', onclick: () => ctx.start('weekly') }, 'Start mixed assessment')),
    topicAssessment(ctx)));

  // History & comparisons
  const mocks = mockHistory(state);
  const weeklies = state.sessions.filter((s) => s.kind === 'weekly' && s.finishedAt).sort((a, b) => b.finishedAt - a.finishedAt);
  const hist = h('section', { class: 'section' }, h('h2', {}, 'Your results over time'));
  if (!mocks.length && !weeklies.length) hist.append(h('div', { class: 'empty' }, 'Your mock and assessment results will be compared here.'));
  else {
    const charts = h('div', { class: 'grid grid-3' });
    for (const s of content.subjects) {
      const list = mockHistory(state, s.id).slice(0, 6).reverse();
      if (!list.length) continue;
      charts.append(h('div', { class: 'sheet' }, h('h4', {}, `${s.name} mocks`),
        h('div', { class: 'chart', html: barChart({ labels: list.map((m, i) => `#${i + 1}`), values: list.map((m) => pct(m.score, m.total)), max: 100, color: s.color, height: 170, fmt: (v) => `${v}%` }) }),
        list.length > 1 ? h('p', { class: 'small muted', style: 'margin:0' }, change(list)) : null));
    }
    hist.append(charts);
    const rows = [...mocks, ...weeklies].sort((a, b) => b.finishedAt - a.finishedAt);
    hist.append(h('div', { class: 'sheet table-wrap', style: 'margin-top:1rem' }, h('table', { class: 'data-table', style: 'width:100%' },
      h('thead', {}, h('tr', {}, ['Date', 'Assessment', 'Score', 'Time', ''].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, rows.map((r) => h('tr', {},
        h('td', {}, formatDate(isoDate(new Date(r.finishedAt)))),
        h('td', { style: 'text-align:left' }, r.title),
        h('td', {}, `${r.score}/${r.total} (${pct(r.score, r.total)}%)`),
        h('td', {}, minutesLabel(Math.max(1, Math.round(r.durationSec / 60)))),
        h('td', {}, h('a', { href: `#/result/${r.id}` }, 'Review'))))))));
  }
  root.append(hist);
}

function change(list) {
  const first = pct(list[0].score, list[0].total);
  const last = pct(list[list.length - 1].score, list[list.length - 1].total);
  const d = last - first;
  return d > 0 ? `Up ${d} points since your first mock.` : d < 0 ? `Down ${-d} points — check the topic breakdown of your latest mock.` : 'Same score as your first mock.';
}

function topicAssessment(ctx) {
  const { content } = ctx;
  const sel = h('select', { 'aria-label': 'Topic' }, content.subjects.map((s) => h('optgroup', { label: s.name }, s.topics.map((t) => h('option', { value: t.id }, t.name)))));
  return h('div', { class: 'sheet' },
    h('h3', {}, 'Topic-based assessment'),
    h('p', { class: 'small muted' }, 'Eight questions on one topic with no help until the end.'),
    h('div', { class: 'field', style: 'margin-bottom:.6rem' }, sel),
    h('button', { class: 'btn secondary', onclick: () => ctx.start('topictest', { topic: sel.value }) }, 'Start topic assessment'));
}
