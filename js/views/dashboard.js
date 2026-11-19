import { h, formatDate, addDays, daysBetween, minutesLabel, sum } from '../core/util.js';
import { overview, readiness } from '../engine/analytics.js';
import { stageBoundaries, stageForDate, countdown, upcomingEvents, scheduledEvent } from '../engine/planner.js';
import { progressBar, ring, subjClass } from '../components/ui.js';
import { taskList, TASK_ICON } from '../components/tasks.js';
import { active } from '../app.js';

function journeyStrip(ctx) {
  const { profile } = ctx.state;
  const today = ctx.today();
  const cd = countdown(profile, today);
  const b = stageBoundaries(profile);
  const stage = stageForDate(profile, today, ctx.state);
  const total = Math.max(1, daysBetween(profile.startDate, profile.examDate));
  const studied = new Set(ctx.state.attempts.map((a) => new Date(a.ts).toDateString()));
  const dots = h('div', { class: 'dots', style: `--n:${total + 1}`, 'aria-hidden': 'true' });
  for (let i = 0; i <= total; i++) {
    const iso = addDays(profile.startDate, i);
    const ev = scheduledEvent(profile, iso);
    const cls = [iso < today ? 'past' : '', iso < today && studied.has(new Date(iso + 'T12:00').toDateString()) ? 'done' : '', ev ? 'ev' : '', iso === today ? 'today' : '', iso === profile.examDate ? 'exam' : ''].join(' ');
    dots.append(h('i', { class: cls, title: `${formatDate(iso)}${ev ? ` — ${ev.type === 'mock' ? 'mock exam' : 'weekly check'}` : ''}${iso === profile.examDate ? ' — Checkpoint' : ''}` }));
  }
  const stages = h('div', { class: 'stages', style: `grid-template-columns:${b.map((s) => Math.max(1, daysBetween(s.from, s.to) + 1)).join('fr ')}fr` },
    b.map((s) => h('span', { class: s.id === stage.id ? 'current' : '' }, s.short)));
  const label = cd.daysLeft > 0 ? `${cd.daysLeft} day${cd.daysLeft === 1 ? '' : 's'} to Checkpoint` : cd.daysLeft === 0 ? 'Checkpoint is today — good luck!' : 'Checkpoint date has passed';
  return h('section', { class: 'journey-strip', 'aria-label': 'Your 90-day journey' },
    h('div', { class: 'journey-head' },
      h('div', {}, h('div', { class: 'day' }, `Day ${cd.dayNumber} of ${total}`), h('div', { class: 'muted small' }, `Stage ${stage.id}: ${stage.name}`)),
      h('div', { class: 'muted small', style: 'text-align:right' }, label, h('br'), formatDate(profile.examDate, { day: 'numeric', month: 'long', year: 'numeric' }))),
    dots, stages,
    h('p', { class: 'small muted', style: 'margin:.6rem 0 0' }, stage.desc));
}

export function renderDashboard(root, ctx) {
  const { state, content } = ctx;
  const today = ctx.today();
  const plan = state.plans[today];
  const ov = overview(state, content);
  const rd = readiness(state, content);
  const tasks = plan?.tasks || [];
  const next = tasks.find((t) => t.status === 'todo' && !t.optional && t.type !== 'rest');
  const required = tasks.filter((t) => !t.optional && t.type !== 'rest');
  const doneCount = required.filter((t) => t.status === 'done').length;
  const minutesLeft = sum(required.filter((t) => t.status === 'todo'), (t) => t.minutes);
  const inProgress = active.get();

  root.append(h('div', { class: 'hello' },
    h('div', {}, h('p', { class: 'muted', style: 'margin:0' }, formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })), h('h1', {}, `Hello, ${state.profile.name}`))));

  if (inProgress) {
    root.append(h('div', { class: 'note', style: 'margin-bottom:1rem' },
      h('p', {}, h('b', {}, `You have “${inProgress.spec.title}” in progress.`), inProgress.spec.kind === 'mock' ? ' The timer kept running while you were away.' : ''),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn small', onclick: () => ctx.go('#/quiz') }, 'Carry on'),
        h('button', { class: 'btn ghost small', onclick: () => { active.clear(); ctx.refresh(); } }, 'Discard this attempt'))));
  }

  root.append(journeyStrip(ctx));

  const left = h('div', {});
  if (next) {
    left.append(h('section', { class: 'next-up', style: 'margin-top:1.5rem' },
      h('div', { class: 'why' }, `${TASK_ICON[next.type]} Recommended next · ${next.why}`),
      h('h2', {}, next.title),
      h('p', {}, `${minutesLabel(next.minutes)}. ${doneCount ? `${doneCount} of ${required.length} done today.` : `Today’s plan: ${required.length} activit${required.length === 1 ? 'y' : 'ies'}, about ${minutesLabel(minutesLeft)}.`}`),
      h('button', { class: 'btn', onclick: () => ctx.startTask(next.id) }, 'Start')));
  } else if (required.length) {
    left.append(h('section', { class: 'next-up', style: 'margin-top:1.5rem' },
      h('div', { class: 'why' }, '✓ Today’s plan is complete'),
      h('h2', {}, 'Well done — that’s today’s work finished.'),
      h('p', {}, 'Rest is part of the plan. If you want a little more, try an optional activity below or a 3-minute challenge.'),
      h('button', { class: 'btn', onclick: () => ctx.start('mini') }, '3-minute challenge')));
  }
  left.append(h('section', { class: 'section' },
    h('h2', {}, 'Today’s plan', h('a', { href: '#/plan' }, 'Full plan')),
    tasks.length ? taskList(ctx, tasks) : h('div', { class: 'empty' }, 'No plan for today.'),
    state.backlog.length ? h('p', { class: 'small muted' }, `${state.backlog.length} rescheduled activit${state.backlog.length === 1 ? 'y is' : 'ies are'} waiting. `, h('a', { href: '#/plan' }, 'Choose when to do them')) : null));

  const right = h('div', {});
  right.append(h('section', { class: 'section sheet' },
    h('h2', {}, 'Exam readiness'),
    h('div', { class: 'readiness' },
      ring(rd.score, { label: `Readiness ${rd.score} out of 100` }),
      h('div', {}, h('h3', { style: 'margin:0' }, rd.label),
        h('p', { class: 'small muted', style: 'margin:.3rem 0 0' },
          rd.missing.includes('exam') ? 'Readiness also needs timed mock results — these come in the exam practice stage.' : 'Based on topic mastery, reasoning questions and timed mocks.'))),
    h('div', { style: 'margin-top:1rem;display:grid;gap:.8rem' },
      content.subjects.map((s) => progressBar(ov.subjects[s.id].score, { label: `${s.icon} ${s.name}`, subject: s.id })))),
  );
  right.append(h('section', { class: 'kv' },
    h('div', {}, h('b', {}, `${ov.mastered}`), h('span', {}, `of ${ov.totalTopics} topics mastered`)),
    h('div', {}, h('b', {}, `${ov.needRevision}`), h('span', {}, 'topics to revise')),
    h('div', {}, h('b', {}, `${Object.keys(state.srs.questions).length}`), h('span', {}, 'mistakes to correct'))));

  const events = upcomingEvents(state.profile, today, 21).slice(0, 4);
  right.append(h('section', { class: 'section' },
    h('h3', {}, 'Coming up'),
    h('ul', { class: 'list' }, events.map((e) => h('li', {},
      h('span', { 'aria-hidden': 'true' }, e.type === 'mock' ? '📝' : e.type === 'weekly' ? '📊' : '🎓'),
      h('div', { class: 'grow' }, h('b', {}, e.type === 'mock' ? `${content.subjectById[e.subject].name} mock exam` : e.type === 'weekly' ? 'Weekly check' : 'Checkpoint examination'),
        h('div', { class: 'small muted' }, e.date === today ? 'Today' : formatDate(e.date))))))));

  const diagMissing = content.subjects.filter((s) => !state.diagnostics[s.id]);
  if (diagMissing.length && diagMissing.length < 3) {
    right.append(h('p', { class: 'note small' }, `Diagnostic still to do: ${diagMissing.map((s) => s.name).join(', ')}. `, h('a', { href: '#/diagnostic' }, 'Open diagnostics')));
  }
  root.append(h('div', { class: 'split' }, left, right));
}
