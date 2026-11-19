// The 90-day plan: four stages, scheduled assessments, and an adaptive daily
// plan built from the latest performance data.

import { addDays, daysBetween, isoDate, clamp, uid, sum } from '../core/util.js';
import { overview, priorityList, weekIndex, weeklyReport } from './analytics.js';
import { dueQuestions } from './srs.js';

export const STAGES = [
  { id: 1, name: 'Diagnostic assessment', short: 'Diagnose', desc: 'Find out what you already know in each subject.' },
  { id: 2, name: 'Concept reinforcement', short: 'Understand', desc: 'Learn weak concepts with explanations, worked examples and guided practice.' },
  { id: 3, name: 'Examination practice', short: 'Practise', desc: 'Cambridge-style questions, command words and mixed-topic sets.' },
  { id: 4, name: 'Final examination readiness', short: 'Get ready', desc: 'Timed mocks and targeted revision. No big new topics.' },
];

export const TASK_MINUTES = { diagnostic: 25, lesson: 15, practice: 12, examstyle: 12, mixed: 15, review: 8, writing: 20, weekly: 25, mock: 45, mini: 4, rest: 0 };

export const WHY = {
  diagnostic: 'Find out what you need to learn',
  lesson: 'Learn a concept you need',
  practice: 'Practise a skill',
  examstyle: 'Practise exam-style questions',
  mixed: 'Practise switching between topics',
  review: 'Correct past mistakes',
  writing: 'Practise structured writing',
  weekly: 'Measure how much you have improved',
  mock: 'Check exam readiness',
  mini: 'Keep earlier topics fresh',
  rest: 'Rest well before the exam',
};

const MOCK_ROTATION = ['maths', 'science', 'english'];

/** Stage boundaries (inclusive dates) for a profile. */
export function stageBoundaries(profile) {
  const start = profile.startDate;
  const exam = profile.examDate;
  const total = Math.max(7, daysBetween(start, exam)); // days of study before exam day
  const s1Len = total >= 30 ? 3 : 1;
  const s4Len = clamp(Math.round(total * 0.17), 3, 15);
  const middle = total - s1Len - s4Len;
  const s2Len = Math.max(1, Math.round(middle * 0.5));
  const s1 = { from: start, to: addDays(start, s1Len - 1) };
  const s2 = { from: addDays(s1.to, 1), to: addDays(s1.to, s2Len) };
  const s3 = { from: addDays(s2.to, 1), to: addDays(exam, -s4Len - 1) };
  const s4 = { from: addDays(s3.to, 1), to: addDays(exam, -1) };
  return [s1, s2, s3, s4].map((r, i) => ({ ...STAGES[i], ...r }));
}

export function stageForDate(profile, iso, state) {
  const b = stageBoundaries(profile);
  const diagnosticsDone = state ? ['maths', 'science', 'english'].every((s) => state.diagnostics[s]) : true;
  let stage = b.find((s) => iso >= s.from && iso <= s.to) || (iso < b[0].from ? b[0] : b[3]);
  // Diagnostics always come first; finishing them early moves straight on.
  if (state && !diagnosticsDone && iso <= b[2].to) stage = b[0];
  else if (state && diagnosticsDone && stage.id === 1) stage = b[1];
  return stage;
}

export function countdown(profile, todayIso) {
  const daysLeft = daysBetween(todayIso, profile.examDate);
  const total = Math.max(1, daysBetween(profile.startDate, profile.examDate));
  const dayNumber = clamp(daysBetween(profile.startDate, todayIso) + 1, 1, total);
  return { daysLeft, total, dayNumber, fraction: clamp((dayNumber - 1) / total, 0, 1) };
}

/** Scheduled assessment for a date, if any: {type:'weekly'|'mock', subject?} */
export function scheduledEvent(profile, iso) {
  const b = stageBoundaries(profile);
  const d = daysBetween(profile.startDate, iso);
  const daysLeft = daysBetween(iso, profile.examDate);
  if (daysLeft <= 1) return null; // nothing heavy the day before
  const s3 = b[2], s4 = b[3];
  if (iso >= s4.from && iso <= s4.to) {
    const k = daysBetween(s4.from, iso);
    if (k % 2 === 0) {
      const before = mocksBefore(profile, iso);
      return { type: 'mock', subject: MOCK_ROTATION[before % 3] };
    }
    return null;
  }
  if (iso >= s3.from && iso <= s3.to) {
    const k = daysBetween(s3.from, iso);
    if (k % 7 === 3) return { type: 'mock', subject: MOCK_ROTATION[mocksBefore(profile, iso) % 3] };
  }
  if (iso >= b[1].from && iso <= s3.to && d % 7 === 6) return { type: 'weekly' };
  return null;
}

function mocksBefore(profile, iso) {
  const b = stageBoundaries(profile);
  let n = 0;
  for (let x = b[2].from; x < iso; x = addDays(x, 1)) {
    if (x >= b[3].from) { if (daysBetween(b[3].from, x) % 2 === 0) n++; }
    else if (daysBetween(b[2].from, x) % 7 === 3) n++;
  }
  return n;
}

export function upcomingEvents(profile, fromIso, days = 14) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    if (iso >= profile.examDate) break;
    const e = scheduledEvent(profile, iso);
    if (e) out.push({ date: iso, ...e });
  }
  out.push({ date: profile.examDate, type: 'exam' });
  return out;
}

/** Recent minutes of completed work per subject (for balancing). */
function recentSubjectMinutes(state, todayIso) {
  const from = addDays(todayIso, -7);
  const m = { maths: 0, science: 0, english: 0 };
  for (const [d, plan] of Object.entries(state.plans)) {
    if (d < from || d >= todayIso) continue;
    for (const t of plan.tasks) if (t.status === 'done' && t.subject) m[t.subject] += t.minutes;
  }
  return m;
}

function subjectOrder(state, content, todayIso) {
  const ov = overview(state, content);
  const weights = Object.fromEntries(content.subjects.map((s) => [s.id, 0.6 + (1 - ov.subjects[s.id].score / 100)]));
  const total = sum(Object.values(weights));
  const minutes = recentSubjectMinutes(state, todayIso);
  const done = sum(Object.values(minutes)) || 1;
  return content.subjects
    .map((s) => ({ id: s.id, deficit: weights[s.id] / total - minutes[s.id] / done }))
    .sort((a, b) => b.deficit - a.deficit)
    .map((x) => x.id);
}

function task(type, extra = {}) {
  return { id: uid('t'), type, minutes: TASK_MINUTES[type], status: 'todo', why: WHY[type], ...extra };
}

function topicTitle(content, topic) { return content.topics[topic]?.name || topic; }

/** Build the plan for one day. Pure apart from task ids. */
export function generateDayPlan(state, content, iso) {
  const profile = state.profile;
  const budget = profile.dailyMinutes || 50;
  const stage = stageForDate(profile, iso, state);
  const { daysLeft } = countdown(profile, iso);
  const d = daysBetween(profile.startDate, iso);
  const focus = state.weeklyFocus[weekIndex(profile.startDate, iso)] || [];
  const prio = priorityList(state, content, { focus, todayIso: iso });
  const due = dueQuestions(state.srs, iso).filter((q) => content.qById[q]);
  const order = subjectOrder(state, content, iso);
  const core = [];
  const extras = [];

  if (daysLeft <= 0) {
    return { stage: stage.id, tasks: [task('rest', { title: 'Exam day — trust your preparation', minutes: 0 })] };
  }
  if (daysLeft === 1) {
    core.push(task('review', { title: 'Light review of past mistakes', minutes: 8 }));
    core.push(task('mini', { title: '3-minute challenge', optional: false }));
    core.push(task('rest', { title: 'Pack your equipment and get a good night’s sleep', minutes: 0 }));
    return { stage: stage.id, tasks: core };
  }

  // Pick two focus topics from different subjects, led by subject balance.
  const pickTopic = (subject, exclude = [], filter = () => true) =>
    prio.find((p) => p.subject === subject && !exclude.includes(p.topic) && filter(p));
  const firstSubject = order[0];
  const secondSubject = order[1];

  if (stage.id === 1) {
    for (const s of content.subjects) {
      if (!state.diagnostics[s.id]) core.push(task('diagnostic', { subject: s.id, title: `${s.name} diagnostic assessment` }));
    }
  } else {
    const event = scheduledEvent(profile, iso);
    if (event?.type === 'mock') {
      core.push(task('mock', { subject: event.subject, title: `${content.subjectById[event.subject].name} mock examination` }));
    } else if (event?.type === 'weekly') {
      core.push(task('weekly', { title: 'Weekly check (all subjects)' }));
    }

    if (stage.id === 2) {
      const a = pickTopic(firstSubject, [], (p) => p.category !== 'strong') || pickTopic(firstSubject);
      const b = pickTopic(secondSubject, [a?.topic], (p) => p.category !== 'strong') || pickTopic(secondSubject, [a?.topic]);
      for (const p of [a, b].filter(Boolean)) {
        const needsLesson = !state.lessonsDone[p.topic] || p.category === 'attention';
        core.push(needsLesson && content.lessons[p.topic]
          ? task('lesson', { subject: p.subject, topic: p.topic, title: `Learn: ${topicTitle(content, p.topic)}` })
          : task('practice', { subject: p.subject, topic: p.topic, title: `Practise: ${topicTitle(content, p.topic)}` }));
      }
      if (d % 3 === 1) core.push(task('writing', { subject: 'english', title: 'Writing practice' }));
      const c = pickTopic(order[2], [a?.topic, b?.topic]);
      if (c) extras.push(task('practice', { subject: c.subject, topic: c.topic, title: `Practise: ${topicTitle(content, c.topic)}` }));
    } else if (stage.id === 3) {
      if (!event) {
        const a = pickTopic(firstSubject);
        if (a) core.push(task('examstyle', { subject: a.subject, topic: a.topic, title: `Exam-style: ${topicTitle(content, a.topic)}` }));
        core.push(task('mixed', { title: 'Mixed-topic practice (all subjects)' }));
        if (d % 4 === 2) core.push(task('writing', { subject: 'english', title: 'Writing practice' }));
        else {
          const b = pickTopic(secondSubject, [a?.topic]);
          if (b) extras.push(task('practice', { subject: b.subject, topic: b.topic, title: `Practise: ${topicTitle(content, b.topic)}` }));
        }
      }
    } else if (stage.id === 4) {
      if (!event) {
        // Targeted revision on remaining weaknesses; recap only, no new material.
        const weak = prio.filter((p) => p.category === 'attention' || p.category === 'developing');
        const a = weak.find((p) => p.subject === firstSubject) || weak[0] || prio[0];
        const b = weak.find((p) => p.subject !== a?.subject && p.topic !== a?.topic);
        for (const p of [a, b].filter(Boolean)) {
          core.push(task('examstyle', { subject: p.subject, topic: p.topic, title: `Revise: ${topicTitle(content, p.topic)}` }));
        }
        core.push(task('mixed', { title: 'Mixed-topic practice (all subjects)' }));
      }
    }
    if (due.length >= 3) core.push(task('review', { title: `Correct my mistakes (${Math.min(due.length, 10)} due)` }));
    else if (due.length) extras.push(task('review', { title: `Correct my mistakes (${due.length} due)` }));
  }

  // Fit to the daily budget; overflow becomes optional, never compulsory.
  const tasks = [];
  let used = 0;
  for (const t of core) {
    if (!tasks.length || used + t.minutes <= budget + 5) { tasks.push(t); used += t.minutes; }
    else extras.unshift({ ...t, optional: true });
  }
  // Rescheduled work fills spare time before optional extras.
  const backlog = state.backlog || [];
  while (backlog.length && used + backlog[0].minutes <= budget + 5 && stage.id !== 1) {
    const t = backlog.shift();
    tasks.push({ ...t, id: uid('t'), status: 'todo', origin: 'rescheduled' });
    used += t.minutes;
  }
  // Extra activities that fit the budget are part of the plan; overflow is optional.
  for (const t of extras) {
    if (used + t.minutes <= budget) { tasks.push(t); used += t.minutes; }
  }
  if (stage.id !== 1 && used + 4 <= budget + 4) tasks.push(task('mini', { title: '3-minute challenge', optional: true }));
  return { stage: stage.id, tasks };
}

/**
 * Called on app start: moves unfinished tasks from earlier days to the
 * backlog and makes sure today has a plan. Mutates state.
 */
export function ensureTodayPlan(state, content, todayIso = isoDate()) {
  if (!state.profile) return null;
  const keyOf = (t) => `${t.type}|${t.subject || ''}|${t.topic || ''}`;
  for (const [d, plan] of Object.entries(state.plans)) {
    if (d >= todayIso) continue;
    for (const t of plan.tasks) {
      if (t.status !== 'todo') continue;
      t.status = 'missed';
      if (t.optional || ['mini', 'rest', 'diagnostic'].includes(t.type)) continue;
      if (!state.backlog.some((b) => keyOf(b) === keyOf(t))) {
        state.backlog.push({ ...t, missedOn: d });
      }
    }
  }
  // Keep the backlog short so it never becomes a source of pressure.
  if (state.backlog.length > 6) state.backlog = state.backlog.slice(-6);
  // A new week starts with focus topics taken from last week's report.
  const wk = weekIndex(profile0(state), todayIso);
  if (wk > 0 && state.weeklyFocus[wk] === undefined) {
    state.weeklyFocus[wk] = weeklyReport(state, content, wk - 1).focus;
  }
  if (!state.plans[todayIso]) {
    const plan = generateDayPlan(state, content, todayIso);
    state.plans[todayIso] = { generatedAt: Date.now(), ...plan };
  }
  return state.plans[todayIso];
}

function profile0(state) { return state.profile.startDate; }

/** Rebuild today's plan (e.g. after the diagnostic finishes), keeping finished tasks. */
export function regenerateToday(state, content, todayIso = isoDate()) {
  const old = state.plans[todayIso];
  const done = old ? old.tasks.filter((t) => t.status === 'done') : [];
  const fresh = generateDayPlan(state, content, todayIso);
  const doneKeys = new Set(done.map((t) => `${t.type}|${t.subject || ''}|${t.topic || ''}`));
  const remaining = fresh.tasks.filter((t) => !doneKeys.has(`${t.type}|${t.subject || ''}|${t.topic || ''}`));
  state.plans[todayIso] = { generatedAt: Date.now(), stage: fresh.stage, tasks: [...done, ...remaining] };
  return state.plans[todayIso];
}

export function findTask(state, taskId) {
  for (const [date, plan] of Object.entries(state.plans)) {
    const t = plan.tasks.find((x) => x.id === taskId);
    if (t) return { date, task: t };
  }
  const b = state.backlog.find((x) => x.id === taskId);
  return b ? { date: null, task: b, backlog: true } : null;
}

export function completeTask(state, taskId, sessionId) {
  const f = findTask(state, taskId);
  if (f && !f.backlog) { f.task.status = 'done'; f.task.sessionId = sessionId; f.task.doneAt = Date.now(); }
}

/** Move a task from today to the backlog ("do it another day"). */
export function postponeTask(state, taskId) {
  const f = findTask(state, taskId);
  if (!f || f.backlog) return;
  f.task.status = 'moved';
  state.backlog.unshift({ ...f.task, status: 'todo', missedOn: f.date });
}

export function addBacklogToToday(state, taskId, todayIso = isoDate()) {
  const i = state.backlog.findIndex((t) => t.id === taskId);
  if (i < 0) return;
  const [t] = state.backlog.splice(i, 1);
  state.plans[todayIso].tasks.push({ ...t, id: uid('t'), status: 'todo', origin: 'rescheduled' });
}

export function dropBacklog(state, taskId) {
  state.backlog = state.backlog.filter((t) => t.id !== taskId);
}

/** Session options for a plan task. */
export function sessionFor(task) {
  const map = {
    diagnostic: ['diagnostic', { subject: task.subject }],
    lesson: ['lesson', { subject: task.subject, topic: task.topic }],
    practice: ['practice', { subject: task.subject, topic: task.topic }],
    examstyle: ['examstyle', { subject: task.subject, topic: task.topic }],
    mixed: ['mixed', { subject: task.subject }],
    review: ['review', {}],
    weekly: ['weekly', {}],
    mock: ['mock', { subject: task.subject }],
    mini: ['mini', {}],
  };
  return map[task.type] || null;
}

/** A light forecast of the next days (stage + scheduled assessments). */
export function forecast(state, fromIso, days = 7) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    if (iso > state.profile.examDate) break;
    out.push({ date: iso, stage: stageForDate(state.profile, iso, i === 0 ? state : null).id, event: scheduledEvent(state.profile, iso), exam: iso === state.profile.examDate });
  }
  return out;
}
