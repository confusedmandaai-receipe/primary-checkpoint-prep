import { h, formatDate, daysBetween, minutesLabel } from '../core/util.js';
import { stageBoundaries, stageForDate, forecast, addBacklogToToday, dropBacklog, regenerateToday } from '../engine/planner.js';
import { weekIndex } from '../engine/analytics.js';
import { taskList, TASK_ICON } from '../components/tasks.js';
import { subjectChip } from '../components/ui.js';

export function renderPlan(root, ctx) {
  const { state, content } = ctx;
  const today = ctx.today();
  const b = stageBoundaries(state.profile);
  const current = stageForDate(state.profile, today, state);

  root.append(h('div', { class: 'page-head' },
    h('h1', {}, 'Your 90-day plan'),
    h('p', {}, `Each day’s plan is built from your latest results and fits about ${minutesLabel(state.profile.dailyMinutes)}. Weak topics get more time, all three subjects stay in balance, and earlier topics come back for review at spaced intervals.`)));

  root.append(h('section', { class: 'sheet' },
    h('h2', {}, 'The four stages'),
    h('ol', { class: 'list' }, b.map((s) => h('li', {},
      h('span', { class: 'ring sm', style: `--p:${s.id < current.id ? 100 : s.id === current.id ? Math.round((Math.max(0, daysBetween(s.from, today)) / Math.max(1, daysBetween(s.from, s.to) + 1)) * 100) : 0}` }, h('b', {}, String(s.id))),
      h('div', { class: 'grow' },
        h('b', {}, s.name), s.id === current.id ? h('span', { class: 'chip', style: 'margin-left:.5rem;background:var(--highlight)' }, 'Now') : null,
        h('div', { class: 'small muted' }, `${formatDate(s.from)} – ${formatDate(s.to)} · ${s.desc}`)))))));

  const plan = state.plans[today];
  root.append(h('section', { class: 'section' },
    h('h2', {}, 'Today'),
    plan ? taskList(ctx, plan.tasks) : null,
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn ghost small', onclick: () => { ctx.store.update((s) => regenerateToday(s, content, today)); ctx.refresh(); } }, '↻ Rebuild today’s plan from my latest results'),
      h('a', { class: 'btn ghost small', href: '#/settings' }, 'Change daily study time'))));

  root.append(h('section', { class: 'section' },
    h('h2', {}, 'Rescheduled activities'),
    state.backlog.length
      ? h('div', {},
        h('p', { class: 'muted' }, 'Activities you missed or moved. They are added to days with spare time automatically, or you can choose one now. Drop any you no longer need — there is no penalty.'),
        h('ul', { class: 'list sheet' }, state.backlog.map((t) => h('li', {},
          h('span', { 'aria-hidden': 'true' }, TASK_ICON[t.type]),
          h('div', { class: 'grow' }, h('b', {}, t.title), h('div', { class: 't-meta' }, t.subject ? subjectChip(content, t.subject) : null, h('span', {}, minutesLabel(t.minutes)), t.missedOn ? h('span', { class: 'muted' }, `from ${formatDate(t.missedOn)}`) : null)),
          h('div', { class: 'task-actions' },
            h('button', { class: 'btn small secondary', onclick: () => { ctx.store.update((s) => addBacklogToToday(s, t.id, today)); ctx.refresh(); } }, 'Add to today'),
            h('button', { class: 'btn ghost small', onclick: () => { ctx.store.update((s) => dropBacklog(s, t.id)); ctx.refresh(); } }, 'Drop'))))))
      : h('div', { class: 'empty' }, 'Nothing waiting. Missed activities appear here so they never pile up on one day.')));

  const fc = forecast(state, today, 10).slice(1);
  const focus = state.weeklyFocus[weekIndex(state.profile.startDate, today)] || [];
  root.append(h('section', { class: 'section' },
    h('h2', {}, 'Coming days'),
    focus.length ? h('p', { class: 'note small' }, 'This week’s focus from your weekly report: ', focus.map((t) => content.topics[t]?.name).join(', '), '.') : null,
    h('ul', { class: 'list sheet' }, fc.map((d) => h('li', {},
      h('b', { style: 'min-width:7.5rem' }, formatDate(d.date)),
      h('div', { class: 'grow' },
        d.exam ? '🎓 Checkpoint examination'
          : d.event?.type === 'mock' ? `📝 ${content.subjectById[d.event.subject].name} mock exam + short review`
            : d.event?.type === 'weekly' ? '📊 Weekly check + targeted practice'
              : `Stage ${d.stage} study: ${['', 'diagnostics', 'learn and practise weak topics', 'exam-style and mixed practice', 'targeted revision'][d.stage]}`),
      h('span', { class: 'small muted' }, 'Planned on the day'))))),
    h('p', { class: 'small muted' }, 'Detailed activities are chosen each morning, so the plan always reflects your most recent work.'));
}
