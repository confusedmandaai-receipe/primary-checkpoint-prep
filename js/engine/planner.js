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

export const TASK_MINUTES = { diagnostic: 12, lesson: 15, practice: 12, examstyle: 12, mixed: 15, review: 8, writing: 20, weekly: 25, mock: 45, mini: 4, rest: 0 };

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

const SUBJECTS = ['maths', 'science', 'english'];
const SUBJECT_NAME = { maths: 'Mathematics', science: 'Science', english: 'English' };

/** Exam date per subject. Older profiles have one date for all three. */
export function examDates(profile) {
  const e = profile.examDates || {};
  return Object.fromEntries(SUBJECTS.map((s) => [s, e[s] || profile.examDate]));
}
export function firstExamDate(profile) { return Object.values(examDates(profile)).sort()[0]; }
export function lastExamDate(profile) { return Object.values(examDates(profile)).sort().pop(); }
/** Subjects still to be examined on (exam strictly after this date). */
export function activeSubjects(profile, iso) {
  const e = examDates(profile);
  return SUBJECTS.filter((s) => e[s] > iso);
}
/** Exams in date order: [{subject, date}] */
export function examSchedule(profile) {
  const e = examDates(profile);
  return SUBJECTS.map((s) => ({ subject: s, date: e[s] })).sort((a, b) => a.date.localeCompare(b.date) || SUBJECTS.indexOf(a.subject) - SUBJECTS.indexOf(b.subject));
}
export function nextExam(profile, iso) {
  return examSchedule(profile).find((x) => x.date >= iso) || null;
}

/** Stage boundaries (inclusive dates). Stages 1–3 lead to the first exam; stage 4 runs until the last. */
export function stageBoundaries(profile) {
  const start = profile.startDate;
  const exam = firstExamDate(profile);
  const last = lastExamDate(profile);
  const total = Math.max(7, daysBetween(start, exam)); // days of study before the first exam
  const s1Len = total >= 30 ? 3 : 1;
  const s4Len = clamp(Math.round(total * 0.17), 3, 15);
  const middle = total - s1Len - s4Len;
  const s2Len = Math.max(1, Math.round(middle * 0.5));
  const s1 = { from: start, to: addDays(start, s1Len - 1) };
  const s2 = { from: addDays(s1.to, 1), to: addDays(s1.to, s2Len) };
  const s3 = { from: addDays(s2.to, 1), to: addDays(exam, -s4Len - 1) };
  const s4 = { from: addDays(s3.to, 1), to: addDays(last, -1) };
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
  const next = nextExam(profile, todayIso);
  const daysLeft = next ? daysBetween(todayIso, next.date) : -1;
  const total = Math.max(1, daysBetween(profile.startDate, lastExamDate(profile)));
  const dayNumber = clamp(daysBetween(profile.startDate, todayIso) + 1, 1, total);
  return { daysLeft, total, dayNumber, next, fraction: clamp((dayNumber - 1) / total, 0, 1) };
}

/** True if any exam falls on this date or the next day (keep those days light). */
function nearExam(profile, iso) {
  const e = Object.values(examDates(profile));
  return e.includes(iso) || e.includes(addDays(iso, 1));
}

function isMockSlot(profile, b, iso) {
  if (nearExam(profile, iso) || !activeSubjects(profile, iso).length) return false;
  if (iso >= b[3].from && iso <= b[3].to) return daysBetween(b[3].from, iso) % 2 === 0;
  if (iso >= b[2].from && iso <= b[2].to) return daysBetween(b[2].from, iso) % 7 === 3;
  return false;
}

/** Scheduled assessment for a date, if any: {type:'weekly'|'mock', subject?} */
export function scheduledEvent(profile, iso) {
  const b = stageBoundaries(profile);
  if (isMockSlot(profile, b, iso)) {
    // Rotate through subjects still to be examined, nearest exam first on ties.
    let n = 0;
    for (let x = b[2].from; x < iso; x = addDays(x, 1)) if (isMockSlot(profile, b, x)) n++;
    const active = activeSubjects(profile, iso).sort((a, c) => examDates(profile)[a].localeCompare(examDates(profile)[c]));
    return { type: 'mock', subject: active[n % active.length] };
  }
  const d = daysBetween(profile.startDate, iso);
  if (iso >= b[1].from && iso <= b[2].to && d % 7 === 6 && !nearExam(profile, iso)) return { type: 'weekly' };
  return null;
}

export function upcomingEvents(profile, fromIso, days = 14) {
  const out = [];
  const last = lastExamDate(profile);
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    if (iso > last) break;
    const e = scheduledEvent(profile, iso);
    if (e) out.push({ date: iso, ...e });
  }
  for (const x of examSchedule(profile)) if (x.date >= fromIso) out.push({ date: x.date, type: 'exam', subject: x.subject });
  return out.sort((a, b) => a.date.localeCompare(b.date));
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
  const active = activeSubjects(state.profile, todayIso);
  const ov = overview(state, content);
  const weights = Object.fromEntries(content.subjects.map((s) => [s.id, 0.6 + (1 - ov.subjects[s.id].score / 100)]));
  const total = sum(Object.values(weights));
  const minutes = recentSubjectMinutes(state, todayIso);
  const done = sum(Object.values(minutes)) || 1;
  return content.subjects
    .filter((s) => active.includes(s.id))
    .map((s) => ({ id: s.id, deficit: weights[s.id] / total - minutes[s.id] / done }))
    .sort((a, b) => b.deficit - a.deficit)
    .map((x) => x.id);
}

/** Share of required tasks finished over the last 7 planned days (null if too little data). */
export function recentCompletion(state, iso) {
  let total = 0, done = 0;
  for (let i = 1; i <= 7; i++) {
    const plan = state.plans[addDays(iso, -i)];
    if (!plan) continue;
    for (const t of plan.tasks) {
      if (t.optional || t.type === 'rest' || t.origin === 'rescheduled') continue;
      total++;
      if (t.status === 'done') done++;
    }
  }
  return total >= 4 ? done / total : null;
}

function recentPlannedTopics(state, iso, days = 2) {
  const out = new Set();
  for (let i = 1; i <= days; i++) for (const t of state.plans[addDays(iso, -i)]?.tasks || []) if (t.topic) out.add(t.topic);
  return out;
}

/** Subjects whose scheduled mock in the last week was missed and not yet made up. */
function missedMocks(state, iso) {
  const out = [];
  for (let i = 1; i <= 7; i++) {
    const d = addDays(iso, -i);
    for (const t of state.plans[d]?.tasks || []) {
      if (t.type !== 'mock' || t.status === 'done' || out.includes(t.subject)) continue;
      const since = Date.parse(`${d}T00:00:00`);
      if (!state.sessions.some((s) => s.kind === 'mock' && s.subject === t.subject && s.finishedAt >= since)) out.push(t.subject);
    }
  }
  return out;
}

/** Diagnostic parts not yet done, in order. */
function diagnosticPartsLeft(state, subject) {
  if (state.diagnostics[subject]) return [];
  const done = state.diagParts?.[subject] || [];
  return [1, 2].filter((p) => !done.includes(p));
}

function task(type, extra = {}) {
  return { id: uid('t'), type, minutes: TASK_MINUTES[type], status: 'todo', why: WHY[type], ...extra };
}

function topicTitle(content, topic) { return content.topics[topic]?.name || topic; }

/** Build the plan for one day. Pure apart from task ids. */
export function generateDayPlan(state, content, iso) {
  const profile = state.profile;
  // When most of last week's plan went unfinished, keep today's plan short:
  // finishing a small plan builds the habit better than skipping a big one.
  const completion = recentCompletion(state, iso);
  const light = completion != null && completion < 0.5;
  const budget = light ? Math.max(25, Math.round((profile.dailyMinutes || 50) * 0.6)) : (profile.dailyMinutes || 50);
  const stage = stageForDate(profile, iso, state);
  const d = daysBetween(profile.startDate, iso);
  const active = activeSubjects(profile, iso);
  const allActive = active.length === SUBJECTS.length;
  const mixedTitle = allActive ? 'Mixed-topic practice (all subjects)' : `Mixed-topic practice (${active.map((x) => SUBJECT_NAME[x]).join(' and ')})`;
  const focus = state.weeklyFocus[weekIndex(profile.startDate, iso)] || [];
  const prio = priorityList(state, content, { focus, todayIso: iso }).filter((p) => active.includes(p.subject));
  const due = dueQuestions(state.srs, iso).filter((q) => content.qById[q] && active.includes(content.qById[q].subject));
  const order = subjectOrder(state, content, iso);
  const core = [];
  const extras = [];
  const sched = examSchedule(profile);
  const todayExams = sched.filter((x) => x.date === iso);
  const tomorrowExams = sched.filter((x) => x.date === addDays(iso, 1));

  if (!active.length && !todayExams.length) {
    return { stage: stage.id, tasks: [task('rest', { title: 'All Checkpoint exams are finished — well done!', minutes: 0 })] };
  }
  if (todayExams.length) {
    const names = todayExams.map((x) => SUBJECT_NAME[x.subject]).join(' and ');
    const tasks = [task('rest', { title: `${names} exam today — trust your preparation`, minutes: 0 })];
    // After an exam, a short optional look at the next subject (only if its exam is not tomorrow too).
    const nextSub = active.find((x) => !todayExams.some((t) => t.subject === x));
    if (nextSub) tasks.push(task('mini', { title: `Optional: a few ${SUBJECT_NAME[nextSub]} questions after your exam`, subject: nextSub, optional: true }));
    return { stage: stage.id, tasks };
  }
  if (tomorrowExams.length) {
    const subs = tomorrowExams.map((x) => x.subject);
    const names = subs.map((x) => SUBJECT_NAME[x]).join(' and ');
    const dueTomorrow = due.filter((q) => subs.includes(content.qById[q].subject)).length;
    if (dueTomorrow) core.push(task('review', { title: `Light review: ${names} mistakes`, subject: subs.length === 1 ? subs[0] : undefined, minutes: 8 }));
    core.push(task('mini', { title: `3-minute ${names} warm-up`, subject: subs.length === 1 ? subs[0] : undefined }));
    core.push(task('rest', { title: `${names} exam tomorrow — pack your equipment and sleep well`, minutes: 0 }));
    return { stage: stage.id, tasks: core };
  }

  // Pick two focus topics from different subjects, led by subject balance.
  // Prefer topics not planned in the last two days, so weak topics take turns.
  const recent = recentPlannedTopics(state, iso);
  const pickTopic = (subject, exclude = [], filter = () => true) =>
    prio.find((p) => p.subject === subject && !exclude.includes(p.topic) && !recent.has(p.topic) && filter(p))
    || prio.find((p) => p.subject === subject && !exclude.includes(p.topic) && filter(p));
  const lessonDue = (p) => {
    if (!content.lessons[p.topic]) return false;
    const last = state.lessonsDone[p.topic];
    if (!last) return true;
    // Re-teach a still-weak topic, but not more than once every 10 days.
    return p.category === 'attention' && Date.parse(`${iso}T23:59:59`) - last > 10 * 86400000;
  };
  const writtenRecently = state.writing.some((w) => w.ts > Date.parse(`${addDays(iso, -9)}T00:00:00`));
  const firstSubject = order[0];
  const secondSubject = order[1] || order[0];

  if (stage.id === 1) {
    // Diagnostics come in two short parts per subject, so starting is easy.
    for (const s of content.subjects) {
      for (const part of diagnosticPartsLeft(state, s.id)) {
        core.push(task('diagnostic', { subject: s.id, part, title: `${s.name} diagnostic (part ${part} of 2)` }));
      }
    }
  } else {
    let event = scheduledEvent(profile, iso);
    // A missed mock comes back on the next day without a scheduled assessment.
    if (!event && stage.id >= 3) {
      const makeUp = missedMocks(state, iso).find((x) => active.includes(x) && examDates(profile)[x] > addDays(iso, 1));
      if (makeUp) event = { type: 'mock', subject: makeUp, makeUp: true };
    }
    if (event?.type === 'mock') {
      // On light days a half-length mock builds stamina without being overwhelming.
      core.push(light
        ? task('mock', { subject: event.subject, half: true, minutes: 25, title: `${content.subjectById[event.subject].name} short mock (half paper)${event.makeUp ? ' — catch-up' : ''}` })
        : task('mock', { subject: event.subject, title: `${content.subjectById[event.subject].name} mock examination${event.makeUp ? ' (catch-up)' : ''}` }));
    } else if (event?.type === 'weekly') {
      core.push(task('weekly', { title: allActive ? 'Weekly check (all subjects)' : 'Weekly check' }));
    }

    if (stage.id === 2) {
      const a = pickTopic(firstSubject, [], (p) => p.category !== 'strong') || pickTopic(firstSubject);
      const b = pickTopic(secondSubject, [a?.topic], (p) => p.category !== 'strong') || pickTopic(secondSubject, [a?.topic]);
      for (const p of [a, b].filter(Boolean)) {
        core.push(lessonDue(p)
          ? task('lesson', { subject: p.subject, topic: p.topic, title: `Learn: ${topicTitle(content, p.topic)}` })
          : task('practice', { subject: p.subject, topic: p.topic, title: `Practise: ${topicTitle(content, p.topic)}` }));
      }
      if ((d % 3 === 1 || !writtenRecently) && active.includes('english') && !light) core.push(task('writing', { subject: 'english', title: 'Writing practice' }));
      else if (!writtenRecently && light && active.includes('english') && d % 2 === 0) {
        // Short plans lead with writing on writing days, otherwise it is never reached.
        core.splice(core.length - 1, 1);
        core.unshift(task('writing', { subject: 'english', title: 'Writing practice (short)', minutes: 15 }));
      }
      const c = order[2] ? pickTopic(order[2], [a?.topic, b?.topic]) : null;
      if (c) extras.push(task('practice', { subject: c.subject, topic: c.topic, title: `Practise: ${topicTitle(content, c.topic)}` }));
    } else if (stage.id === 3) {
      if (!event) {
        const a = pickTopic(firstSubject);
        if (a) core.push(task('examstyle', { subject: a.subject, topic: a.topic, title: `Exam-style: ${topicTitle(content, a.topic)}` }));
        core.push(task('mixed', { title: mixedTitle, subject: active.length === 1 ? active[0] : undefined }));
        if ((d % 4 === 2 || !writtenRecently) && active.includes('english')) {
          if (light) core.unshift(task('writing', { subject: 'english', title: 'Writing practice (short)', minutes: 15 }));
          else core.splice(1, 0, task('writing', { subject: 'english', title: 'Writing practice' }));
        }
        else {
          const b = pickTopic(secondSubject, [a?.topic]);
          if (b) extras.push(task('practice', { subject: b.subject, topic: b.topic, title: `Practise: ${topicTitle(content, b.topic)}` }));
        }
      }
    } else if (stage.id === 4) {
      if (!event) {
        // Targeted revision on remaining weaknesses; recap only, no new material.
        const weak = prio.filter((p) => p.category === 'attention' || p.category === 'developing');
        // The subject with the nearest exam leads.
        const lead = sched.find((x) => active.includes(x.subject))?.subject || firstSubject;
        const a = weak.find((p) => p.subject === lead) || prio.find((p) => p.subject === lead) || weak[0] || prio[0];
        const b = weak.find((p) => p.topic !== a?.topic && (active.length === 1 || p.subject !== a?.subject)) || prio.find((p) => p.topic !== a?.topic);
        for (const p of [a, b].filter(Boolean)) {
          core.push(task('examstyle', { subject: p.subject, topic: p.topic, title: `Revise: ${topicTitle(content, p.topic)}` }));
        }
        core.push(task('mixed', { title: mixedTitle, subject: active.length === 1 ? active[0] : undefined }));
        if (lead === 'english' && d % 3 === 0) core.push(task('writing', { subject: 'english', title: 'Timed writing practice' }));
      }
    }
    if (due.length >= 3) core.push(task('review', { title: `Correct my mistakes (${Math.min(due.length, 10)} due)` }));
    else if (due.length) extras.push(task('review', { title: `Correct my mistakes (${due.length} due)` }));
  }

  // Light days open with a short, winnable warm-up on a topic already going well.
  if (light && stage.id !== 1 && !core.some((t) => t.type === 'mock')) {
    const used = new Set(core.map((t) => t.subject).filter(Boolean));
    const goodTopics = prio.slice().reverse().filter((p) => p.category === 'strong' || p.category === 'developing');
    const known = goodTopics.find((p) => !used.has(p.subject)) || goodTopics[0];
    if (known) core.unshift(task('practice', { subject: known.subject, topic: known.topic, title: `Warm-up: ${topicTitle(content, known.topic)}`, minutes: 4, warmup: true }));
  }
  // Fit to the daily budget; overflow becomes optional, never compulsory.
  const tasks = [];
  let used = 0;
  for (const t of core) {
    if (!tasks.length || used + t.minutes <= budget + 5) { tasks.push(t); used += t.minutes; }
    else extras.unshift({ ...t, optional: true });
  }
  // Rescheduled work fills spare time before optional extras.
  const keyOf = (t) => `${t.type}|${t.subject || ''}|${t.topic || ''}`;
  const planned = new Set(tasks.map(keyOf));
  if (stage.id !== 1) {
    for (const t of (state.backlog || []).slice()) {
      if (planned.has(keyOf(t)) || (t.subject && !active.includes(t.subject))) { state.backlog = state.backlog.filter((b) => b !== t); continue; }
      if (used + t.minutes > budget + 5) continue;
      state.backlog = state.backlog.filter((b) => b !== t);
      tasks.push({ ...t, id: uid('t'), status: 'todo', origin: 'rescheduled' });
      planned.add(keyOf(t));
      used += t.minutes;
    }
  }
  // Extra activities that fit the budget are part of the plan; overflow is optional.
  for (const t of extras) {
    if (used + t.minutes <= budget) { tasks.push(t); used += t.minutes; }
  }
  if (stage.id !== 1 && used + 4 <= budget + 4) tasks.push(task('mini', { title: '3-minute challenge', optional: true }));
  return { stage: stage.id, tasks, light };
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
      // Mocks get their own catch-up slot and reviews regenerate daily, so they never pile up here.
      if (t.optional || t.warmup || ['mini', 'rest', 'diagnostic', 'mock', 'weekly', 'review'].includes(t.type)) continue;
      if (!state.backlog.some((b) => keyOf(b) === keyOf(t))) {
        state.backlog.push({ ...t, missedOn: d });
      }
    }
  }
  // Keep the backlog short and current so it never becomes a source of pressure:
  // drop work for subjects already examined and anything missed over 10 days ago.
  const active = activeSubjects(state.profile, todayIso);
  state.backlog = state.backlog.filter((t) => (!t.subject || active.includes(t.subject)) && (!t.missedOn || t.missedOn >= addDays(todayIso, -10)));
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

/**
 * Let the student swap a topic task for another topic they need, in a
 * different subject where possible. Returns the new task or null.
 */
export function swapTask(state, content, taskId, todayIso = isoDate()) {
  const plan = state.plans[todayIso];
  const t = plan?.tasks.find((x) => x.id === taskId);
  if (!t || !t.topic || t.status !== 'todo') return null;
  const active = activeSubjects(state.profile, todayIso);
  const taken = new Set(plan.tasks.map((x) => x.topic).filter(Boolean));
  const prio = priorityList(state, content, { todayIso }).filter((p) => active.includes(p.subject) && !taken.has(p.topic) && p.category !== 'strong');
  const pick = prio.find((p) => p.subject !== t.subject) || prio[0];
  if (!pick) return null;
  const type = t.type === 'lesson' && content.lessons[pick.topic] && state.lessonsDone[pick.topic] ? 'practice' : t.type;
  const verb = { lesson: 'Learn', practice: 'Practise', examstyle: t.title.startsWith('Revise') ? 'Revise' : 'Exam-style' }[type] || 'Practise';
  Object.assign(t, { type, subject: pick.subject, topic: pick.topic, title: `${verb}: ${topicTitle(content, pick.topic)}`, why: WHY[type], minutes: t.warmup ? t.minutes : TASK_MINUTES[type], swapped: true });
  return t;
}

export function dropBacklog(state, taskId) {
  state.backlog = state.backlog.filter((t) => t.id !== taskId);
}

/** Session options for a plan task. */
export function sessionFor(task) {
  const map = {
    diagnostic: ['diagnostic', { subject: task.subject, part: task.part }],
    lesson: ['lesson', { subject: task.subject, topic: task.topic }],
    practice: ['practice', { subject: task.subject, topic: task.topic, n: task.warmup ? 3 : undefined }],
    examstyle: ['examstyle', { subject: task.subject, topic: task.topic }],
    mixed: ['mixed', { subject: task.subject }],
    review: ['review', { subject: task.subject }],
    weekly: ['weekly', {}],
    mock: ['mock', task.half ? { subject: task.subject, n: 10, minutes: 22 } : { subject: task.subject }],
    mini: ['mini', { subject: task.subject }],
  };
  return map[task.type] || null;
}

/** A light forecast of the next days (stage + scheduled assessments). */
export function forecast(state, fromIso, days = 7) {
  const out = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i);
    if (iso > lastExamDate(state.profile)) break;
    out.push({ date: iso, stage: stageForDate(state.profile, iso, i === 0 ? state : null).id, event: scheduledEvent(state.profile, iso), exams: examSchedule(state.profile).filter((x) => x.date === iso) });
  }
  return out;
}
