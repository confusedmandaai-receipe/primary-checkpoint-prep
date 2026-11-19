import { h, formatDate, pct } from '../core/util.js';
import { weeklyReport, weekIndex } from '../engine/analytics.js';
import { weeklyAchievements } from '../engine/badges.js';
import { progressBar, barChart, subjectChip, backLink } from '../components/ui.js';
import { answerText } from '../engine/marking.js';

export function renderReport(root, ctx, query) {
  const { state, content } = ctx;
  const current = weekIndex(state.profile.startDate, ctx.today());
  const k = Math.max(0, Math.min(current, query.week != null ? Number(query.week) : Math.max(0, current - (current > 0 ? 1 : 0))));
  const r = weeklyReport(state, content, k);

  root.append(backLink('#/progress', 'Progress'),
    h('div', { class: 'page-head' },
      h('h1', {}, `Week ${k + 1} report`),
      h('p', {}, `${formatDate(r.from)} – ${formatDate(r.to)}${k === current ? ' (this week so far)' : ''}`)));

  const weeks = h('div', { class: 'seg', role: 'group', 'aria-label': 'Choose week' });
  for (let i = 0; i <= current; i++) weeks.append(h('button', { type: 'button', 'aria-pressed': i === k ? 'true' : 'false', onclick: () => ctx.go(`#/reports?week=${i}`) }, `Week ${i + 1}`));
  root.append(weeks);

  if (!r.attempted) { root.append(h('div', { class: 'empty', style: 'margin-top:1rem' }, 'No questions answered in this week yet.')); return; }

  root.append(h('section', { class: 'section kv' },
    h('div', {}, h('b', {}, r.attempted), h('span', {}, 'questions attempted')),
    h('div', {}, h('b', {}, `${r.accuracy}%`), h('span', {}, 'accuracy')),
    h('div', {}, h('b', {}, r.change == null ? '—' : `${r.change > 0 ? '+' : ''}${r.change}`), h('span', {}, 'points vs previous week')),
    h('div', {}, h('b', {}, `${r.studyDays}/7`), h('span', {}, 'days with study')),
    h('div', {}, h('b', {}, r.mocksThisWeek), h('span', {}, 'mock exams'))));

  root.append(h('p', { class: 'note info small' }, 'Accuracy shows how you did on the questions you chose this week. It is one signal only — exam readiness also depends on topic coverage, reasoning questions and timed mocks.'));

  const ach = weeklyAchievements(state, content, k);
  if (ach.length) root.append(h('section', { class: 'section' }, h('h2', {}, 'Achievements this week'),
    h('div', { class: 'path' }, ach.map((a) => h('span', { class: 'stone strong' }, `${a.icon} ${a.text}`)))));

  root.append(h('section', { class: 'section grid grid-2' },
    h('div', { class: 'sheet' }, h('h3', {}, 'By subject'),
      h('div', { style: 'display:grid;gap:.8rem' }, content.subjects.map((s) => r.bySubject[s.id].n
        ? progressBar(r.bySubject[s.id].pct, { label: `${s.name} (${r.bySubject[s.id].correct}/${r.bySubject[s.id].n})`, subject: s.id })
        : h('p', { class: 'small muted', style: 'margin:0' }, `${s.name}: no questions this week`)))),
    h('div', { class: 'sheet' }, h('h3', {}, 'Accuracy week by week'),
      h('div', { class: 'chart', html: barChart({ labels: r.history.map((x) => `W${x.week + 1}`), values: r.history.map((x) => x.pct), max: 100, color: r.history.map((x) => (x.week === k ? '#1b2a4a' : '#9fb3d4')), height: 180, fmt: (v) => `${v}%` }) }))));

  root.append(h('section', { class: 'section' }, h('h2', {}, 'By topic'),
    h('div', { class: 'sheet table-wrap' }, h('table', { class: 'data-table', style: 'width:100%' },
      h('thead', {}, h('tr', {}, ['Topic', 'Subject', 'Correct', 'Accuracy'].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, r.byTopic.map((t) => h('tr', {},
        h('th', { scope: 'row', style: 'text-align:left' }, t.name),
        h('td', {}, content.subjectById[t.subject]?.short),
        h('td', {}, `${t.correct}/${t.n}`),
        h('td', { style: `font-weight:700;color:${t.pct >= 80 ? 'var(--good)' : t.pct >= 50 ? 'var(--warn)' : 'var(--bad)'}` }, `${t.pct}%`))))))));

  const rep = h('section', { class: 'section' }, h('h2', {}, 'Repeated mistakes'));
  if (!r.repeatedQuestions.length && !r.repeatedMisconceptions.length) rep.append(h('div', { class: 'empty' }, 'No repeated mistakes this week. Good — your reviews are working.'));
  else {
    if (r.repeatedMisconceptions.length) rep.append(h('div', { class: 'sheet' }, h('h3', {}, 'Slips that happened more than once'),
      h('ul', { class: 'list' }, r.repeatedMisconceptions.map((m) => h('li', {}, h('div', { class: 'grow' }, h('b', {}, m.text), h('div', { class: 'small muted' }, `${content.topics[m.topic]?.name} · ${m.times} times`)), h('a', { class: 'btn small secondary', href: `#/learn/${m.topic}` }, 'Lesson'))))));
    if (r.repeatedQuestions.length) rep.append(h('div', { class: 'sheet' }, h('h3', {}, 'Questions answered wrongly more than once'),
      h('ul', { class: 'list' }, r.repeatedQuestions.slice(0, 8).map((x) => {
        const q = content.qById[x.qid];
        return q ? h('li', {}, h('div', { class: 'grow' }, h('div', {}, q.prompt), h('div', { class: 'small muted' }, `Answer: ${answerText(q)} · wrong ${x.times} times`))) : null;
      }))));
  }
  root.append(rep);

  const nextFocus = state.weeklyFocus[k + 1];
  const applied = nextFocus && JSON.stringify(nextFocus) === JSON.stringify(r.focus);
  root.append(h('section', { class: 'section' }, h('h2', {}, 'Recommended revision'),
    r.recommendations.length ? h('ol', { class: 'list sheet' }, r.recommendations.map((x) => h('li', {},
      h('div', { class: 'grow' }, x.text),
      x.action === 'lesson' ? h('a', { class: 'btn small secondary', href: `#/learn/${x.topic}` }, 'Lesson')
        : x.action === 'practice' ? h('button', { class: 'btn small secondary', onclick: () => ctx.start('examstyle', { topic: x.topic }) }, 'Practise')
          : h('button', { class: 'btn small secondary', onclick: () => ctx.start('review') }, 'Review')))) : h('p', { class: 'muted' }, 'Keep following your daily plan.'),
    r.focus.length ? h('div', { class: 'note', style: 'margin-top:1rem' },
      h('p', {}, h('b', {}, 'Next week’s plan: '), applied || k < current ? `focus topics ${applied ? 'are' : 'were'} ` : 'these topics will get extra time: ', r.focus.map((t) => content.topics[t]?.name).join(', '), '.'),
      !applied && k === current ? h('button', { class: 'btn small', onclick: () => { ctx.store.update((s) => { s.weeklyFocus[k + 1] = r.focus; }); ctx.refresh(); } }, 'Use these for next week') : null) : null));
}
