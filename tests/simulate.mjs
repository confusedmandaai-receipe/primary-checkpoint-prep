// Day-by-day simulation of three student profiles through the whole plan,
// using the real planner, session builder, marking, SRS and badge code.
// Run: node tests/simulate.mjs  (writes tests/sim-output/*.json)
import { writeFileSync, mkdirSync } from 'node:fs';
import { loadContentSync } from './helpers.mjs';
import { emptyState } from '../js/core/store.js';
import { addDays, daysBetween, seededRandom, groupBy } from '../js/core/util.js';
import { ensureTodayPlan, regenerateToday, completeTask, sessionFor, stageForDate, activeSubjects, examSchedule, scheduledEvent, TASK_MINUTES } from '../js/engine/planner.js';
import { buildSession, recordSession } from '../js/engine/sessions.js';
import { overview, readiness, weeklyReport, mockHistory, weekIndex } from '../js/engine/analytics.js';
import { awardBadges, weeklyAchievements } from '../js/engine/badges.js';
import { mark } from '../js/engine/marking.js';

const C = loadContentSync();
export const START = '2026-11-19';
export const EXAMS = { maths: '2027-02-22', science: '2027-02-24', english: '2027-03-01' };

export const PERSONAS = {
  quick: {
    label: 'Quick learner, above-average scorer',
    ability: { maths: 0.72, science: 0.68, english: 0.66 },
    lessonGain: 0.28, practiceGain: 0.045, examGain: 0.015, forget: 0.004,
    studyProb: () => 0.92, willing: () => 70, optionalProb: 0.5, hintProb: 0.08, minutes: 50,
  },
  reluctant: {
    label: 'Dislikes studying, slower to understand',
    ability: { maths: 0.36, science: 0.42, english: 0.4 },
    lessonGain: 0.09, practiceGain: 0.014, examGain: 0.004, forget: 0.006,
    studyProb: () => 0.55, willing: (r) => 12 + r() * 18, optionalProb: 0.03, hintProb: 0.55, minutes: 40,
  },
  needsPush: {
    label: 'Needs a push, fast once interested',
    ability: { maths: 0.5, science: 0.46, english: 0.5 },
    lessonGain: null, practiceGain: null, examGain: 0.012, forget: 0.005,
    // engagement e in [0,1] drives how often and how well they study
    studyProb: (e, dow) => Math.min(0.95, 0.25 + 0.65 * e + (dow === 0 || dow === 6 ? 0.1 : 0)),
    willing: (r, e) => 10 + 45 * e + r() * 5,
    optionalProb: 0.25, hintProb: 0.25, minutes: 50,
    engagement: 0.3,
  },
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function profileState(p) {
  const s = emptyState();
  s.profile = { name: p.label, startDate: START, examDates: { ...EXAMS }, examDate: EXAMS.english, dailyMinutes: p.minutes, garden: true, createdAt: Date.parse(START) };
  return s;
}

export function simulate(key, { seed = 1, endDate = EXAMS.english } = {}) {
  const P = PERSONAS[key];
  const rand = seededRandom(`${key}-${seed}`);
  const state = profileState(P);
  // latent skill per topic
  const theta = {};
  for (const t of Object.values(C.topics)) theta[t.id] = clamp(P.ability[t.subject] + (rand() - 0.5) * 0.22, 0.05, 0.95);
  const theta0 = { ...theta };
  let engagement = P.engagement ?? 1;
  const daily = [];
  const issues = [];
  const lastPractised = {};

  const gain = (kind) => {
    if (key !== 'needsPush') return kind === 'lesson' ? P.lessonGain : P.practiceGain;
    const lo = kind === 'lesson' ? 0.07 : 0.01, hi = kind === 'lesson' ? 0.3 : 0.05;
    return lo + (hi - lo) * engagement;
  };

  function answer(q, kindMode) {
    const th = theta[q.topic];
    let p = th - ((q.difficulty || 2) - 2) * 0.12 - (q.skill === 'reasoning' ? 0.06 : 0);
    const useHint = kindMode === 'feedback' && rand() < P.hintProb * (1 - th);
    if (useHint) p += 0.15;
    if (key === 'needsPush') p += (engagement - 0.5) * 0.1; // careless when bored
    p = clamp(p, 0.03, 0.97);
    const ok = rand() < p;
    let resp;
    if (ok) resp = q.type === 'numeric' ? String(Array.isArray(q.answer) ? q.answer[0] : q.answer) : q.type === 'text' ? q.answer[0] : q.answer;
    else if (q.type === 'mcq') {
      const mk = Object.keys(q.mistakes || {});
      resp = mk.length && rand() < 0.6 ? Number(mk[Math.floor(rand() * mk.length)]) : (q.answer + 1 + Math.floor(rand() * (q.options.length - 1))) % q.options.length;
    } else if (q.type === 'multi') resp = [0];
    else resp = q.mistakes && rand() < 0.5 ? Object.keys(q.mistakes)[0] : 'x';
    const ns = kindMode === 'diag' && th < 0.25 && rand() < 0.5;
    const m = ns ? { ok: false } : mark(q, resp);
    // learning from feedback
    if (kindMode === 'feedback') theta[q.topic] = clamp(th + gain('practice') * (1 - th) * (m.ok ? 0.6 : 1.2), 0, 0.98);
    else theta[q.topic] = clamp(th + P.examGain * (1 - th), 0, 0.98);
    lastPractised[q.topic] = true;
    return { qid: q.id, resp: ns ? null : resp, ok: m.ok, hint: useHint, ns, mis: m.misconception };
  }

  function runSession(kind, opts, day, taskId, minuteOffset) {
    const spec = buildSession(kind, { ...opts, taskId, today: day, seed: `${key}-${day}-${kind}-${opts.topic || opts.subject || ''}-${minuteOffset}` }, state, C);
    if (!spec.questions.length) return null;
    const mode = spec.kind === 'diagnostic' ? 'diag' : spec.mode;
    const results = spec.questions.map((id) => answer(C.qById[id], mode));
    const t = Date.parse(`${day}T16:00:00`) + minuteOffset * 60000;
    const sess = recordSession(state, spec, results, { startedAt: t - 600000, finishedAt: t, content: C });
    if (taskId) completeTask(state, taskId, sess.id);
    if (spec.kind === 'lesson') state.lessonsDone[spec.topic] = t;
    if (spec.kind === 'diagnostic') regenerateToday(state, C, day);
    awardBadges(state, C);
    return sess;
  }

  for (let day = START; day <= endDate; day = addDays(day, 1)) {
    ensureTodayPlan(state, C, day);
    const plan = state.plans[day];
    const active = activeSubjects(state.profile, day);
    const dow = new Date(`${day}T12:00:00`).getDay();
    const examToday = examSchedule(state.profile).filter((x) => x.date === day);
    const examTomorrow = examSchedule(state.profile).filter((x) => x.date === addDays(day, 1));
    const required = plan.tasks.filter((t) => !t.optional && t.type !== 'rest');
    const reqMin = required.reduce((a, t) => a + t.minutes, 0);

    // ---- invariants on the plan itself
    for (const t of plan.tasks) {
      if (t.subject && !active.includes(t.subject) && !examToday.some((x) => x.subject === t.subject)) issues.push(`${day}: task for ${t.subject} after its exam (${t.title})`);
      if (t.type === 'mock' && examTomorrow.length) issues.push(`${day}: mock the day before an exam`);
    }
    if (reqMin > state.profile.dailyMinutes + 10 && !required.some((t) => t.type === 'mock')) issues.push(`${day}: plan ${reqMin} min exceeds budget ${state.profile.dailyMinutes}`);
    if (examToday.length && required.some((t) => t.type !== 'mini')) issues.push(`${day}: exam day has study tasks`);
    if (state.backlog.length > 6) issues.push(`${day}: backlog ${state.backlog.length}`);

    // ---- does the student study today? (a short plan is a little less daunting)
    const shortPlanBoost = key !== 'quick' && reqMin <= 30 ? 0.08 : 0;
    const studies = rand() < Math.min(0.97, P.studyProb(engagement, dow) + shortPlanBoost);
    let doneMin = 0, sessionsToday = [], minuteOffset = 0;
    if (studies && !examToday.length) {
      const willing = P.willing(rand, engagement);
      const ordered = [...plan.tasks.filter((t) => !t.optional), ...plan.tasks.filter((t) => t.optional)];
      for (const t of ordered) {
        if (t.status !== 'todo' || t.type === 'rest') continue;
        if (doneMin > 0 && doneMin + t.minutes > willing + 5) break;
        if (t.optional && rand() > P.optionalProb) continue;
        minuteOffset += t.minutes + 5;
        if (t.type === 'lesson') {
          theta[t.topic] = clamp(theta[t.topic] + gain('lesson') * (1 - theta[t.topic]), 0, 0.98);
        }
        if (t.type === 'writing') {
          state.writing.push({ id: `w${day}`, taskId: C.writing[0].id, text: '...', checks: [], ts: Date.parse(`${day}T17:00:00`) });
          completeTask(state, t.id, null);
          theta['e-sentences'] = clamp(theta['e-sentences'] + gain('practice') * 2 * (1 - theta['e-sentences']), 0, 0.98);
        } else {
          const s = sessionFor(t);
          if (!s) continue;
          const sess = runSession(s[0], s[1], day, t.id, minuteOffset);
          if (!sess) { issues.push(`${day}: empty session for ${t.type} ${t.topic || t.subject || ''}`); completeTask(state, t.id, null); continue; }
          sessionsToday.push(sess);
        }
        doneMin += t.minutes;
      }
    }
    // ---- forgetting for topics not touched today
    for (const id of Object.keys(theta)) {
      if (!lastPractised[id]) theta[id] = Math.max(theta0[id] * 0.9, theta[id] - P.forget * (theta[id] - theta0[id] * 0.9));
      lastPractised[id] = false;
    }
    // ---- engagement dynamics for the "needs a push" student
    if (key === 'needsPush') {
      if (!studies) engagement -= 0.03;
      for (const s of sessionsToday) engagement += s.score / s.total >= 0.7 ? 0.05 : -0.015;
      if (dow === 0) engagement += 0.04; // weekly nudge from a parent looking at the report
      if (sessionsToday.some((s) => s.kind === 'mock')) engagement += 0.03;
      engagement = clamp(engagement, 0.1, 1);
    }

    const ov = overview(state, C);
    const rd = readiness(state, C);
    daily.push({
      day, stage: stageForDate(state.profile, day, state).id, studied: studies && !examToday.length, reqMin, doneMin,
      tasks: plan.tasks.map((t) => `${t.type}${t.optional ? '?' : ''}${t.subject ? ':' + t.subject : ''}${t.status === 'done' ? '✓' : ''}`),
      readiness: rd.score, label: rd.label, overall: ov.overall,
      maths: ov.subjects.maths.score, science: ov.subjects.science.score, english: ov.subjects.english.score,
      backlog: state.backlog.length, due: Object.keys(state.srs.questions).length,
      theta: { maths: avg(C.subjectById.maths.topics.map((t) => theta[t.id])), science: avg(C.subjectById.science.topics.map((t) => theta[t.id])), english: avg(C.subjectById.english.topics.map((t) => theta[t.id])) },
      engagement: key === 'needsPush' ? +engagement.toFixed(2) : undefined,
      event: scheduledEvent(state.profile, day),
    });
  }
  return { key, label: P.label, state, daily, issues, theta };
}

function avg(a) { return Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 100); }

export function summarise(r) {
  const { state, daily } = r;
  const ov = overview(state, C);
  const at = (d) => daily.find((x) => x.day === d) || daily[daily.length - 1];
  const mocks = Object.fromEntries(['maths', 'science', 'english'].map((s) => [s, mockHistory(state, s).reverse().map((m) => ({ date: new Date(m.finishedAt).toISOString().slice(0, 10), pct: Math.round((m.score / m.total) * 100) }))]));
  const mockPlanned = daily.filter((d) => d.event?.type === 'mock').length;
  const cats = groupBy(Object.values(ov.mastery), 'category');
  const weeks = weekIndex(START, EXAMS.english);
  const reports = [];
  for (let k = 0; k <= weeks; k++) {
    const wr = weeklyReport(state, C, k);
    reports.push({ week: k + 1, attempted: wr.attempted, accuracy: wr.accuracy, studyDays: wr.studyDays, focus: wr.focus.map((t) => C.topics[t].name), achievements: weeklyAchievements(state, C, k).map((a) => a.text) });
  }
  const studied = daily.filter((d) => d.studied).length;
  const byKind = groupBy(state.sessions, 'kind');
  const lessonsRead = Object.keys(state.lessonsDone).length;
  const diagDone = Object.keys(state.diagnostics);
  const diagDay = Math.max(...diagDone.map((s) => daysBetween(START, new Date(state.diagnostics[s].completedAt).toISOString().slice(0, 10)) + 1));
  return {
    persona: r.label,
    daysInPlan: daily.length, daysStudied: studied, studyRate: Math.round((studied / daily.length) * 100),
    diagnosticsCompletedByDay: diagDone.length === 3 ? diagDay : `only ${diagDone.join(', ')}`,
    questionsAnswered: state.attempts.length,
    accuracy: Math.round((state.attempts.filter((a) => a.ok).length / state.attempts.length) * 100),
    sessions: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.length])),
    lessonsRead: `${lessonsRead}/29`,
    writingTasks: state.writing.length,
    mocksScheduled: mockPlanned, mocks,
    readiness: { day30: at(addDays(START, 29)).readiness, day60: at(addDays(START, 59)).readiness, beforeMaths: at(addDays(EXAMS.maths, -1)), beforeScience: at(addDays(EXAMS.science, -1)), beforeEnglish: at(addDays(EXAMS.english, -1)) },
    masteryAtExam: {
      maths: at(addDays(EXAMS.maths, -1)).maths, science: at(addDays(EXAMS.science, -1)).science, english: at(addDays(EXAMS.english, -1)).english,
    },
    trueSkillAtExam: { maths: at(addDays(EXAMS.maths, -1)).theta.maths, science: at(addDays(EXAMS.science, -1)).theta.science, english: at(addDays(EXAMS.english, -1)).theta.english },
    categoriesAtEnd: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, v.length])),
    weakestAtEnd: Object.values(ov.mastery).sort((a, b) => a.score - b.score).slice(0, 5).map((m) => `${C.topics[m.topic].name} (${m.score}%, ${m.n} answers)`),
    neverPractisedTopics: Object.values(ov.mastery).filter((m) => m.n <= 2).map((m) => C.topics[m.topic].name),
    badges: Object.keys(state.badges).length,
    maxBacklog: Math.max(...daily.map((d) => d.backlog)),
    maxDueMistakes: Math.max(...daily.map((d) => d.due)),
    avgPlannedMinutes: Math.round(daily.reduce((a, d) => a + d.reqMin, 0) / daily.length),
    avgMinutesOnStudyDays: Math.round(daily.filter((d) => d.studied).reduce((a, d) => a + d.doneMin, 0) / Math.max(1, studied)),
    issues: [...new Set(r.issues)],
    weekly: reports,
  };
}

if (process.argv[1] && process.argv[1].endsWith('simulate.mjs')) {
  mkdirSync(new URL('./sim-output/', import.meta.url), { recursive: true });
  for (const key of Object.keys(PERSONAS)) {
    const r = simulate(key);
    const sum = summarise(r);
    writeFileSync(new URL(`./sim-output/${key}-summary.json`, import.meta.url), JSON.stringify(sum, null, 1));
    writeFileSync(new URL(`./sim-output/${key}-daily.json`, import.meta.url), JSON.stringify(r.daily, null, 0));
    writeFileSync(new URL(`./sim-output/${key}-state.json`, import.meta.url), JSON.stringify(r.state));
    console.log(`\n=== ${sum.persona}`);
    const { weekly, ...rest } = sum;
    console.log(JSON.stringify(rest, (k, v) => (k === 'tasks' || k === 'theta' && typeof v === 'object' && !Array.isArray(v) && v.maths === undefined ? undefined : v), 1));
  }
}
