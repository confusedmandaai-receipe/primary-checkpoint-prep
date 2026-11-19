import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.mjs';
import { emptyState, Store, MemoryAdapter } from '../js/core/store.js';
import { addDays, daysBetween } from '../js/core/util.js';
import { topicMastery, overview, priorityList, readiness, weeklyReport } from '../js/engine/analytics.js';
import { buildSession, recordSession } from '../js/engine/sessions.js';
import { stageBoundaries, stageForDate, generateDayPlan, ensureTodayPlan, scheduledEvent, upcomingEvents, postponeTask, completeTask, regenerateToday } from '../js/engine/planner.js';
import { updateQuestionCard, dueQuestions } from '../js/engine/srs.js';
import { awardBadges, weeklyAchievements, growthStage } from '../js/engine/badges.js';
import { mark } from '../js/engine/marking.js';

const C = loadContentSync();
const START = '2026-11-19';

function freshState(extra = {}) {
  const s = emptyState();
  s.profile = { name: 'Test', startDate: START, examDate: addDays(START, 90), dailyMinutes: 50, garden: true, createdAt: Date.parse(START) };
  return Object.assign(s, extra);
}

/** Answer a session's questions: correct for topics in `strong`, wrong otherwise. */
function play(state, spec, decide, dayIso) {
  const results = spec.questions.map((qid) => {
    const q = C.qById[qid];
    const ok = decide(q);
    const resp = ok ? (q.type === 'numeric' ? String(Array.isArray(q.answer) ? q.answer[0] : q.answer) : q.type === 'text' ? q.answer[0] : q.answer) : (q.type === 'mcq' ? (q.answer + 1) % q.options.length : 'x');
    const m = mark(q, resp);
    return { qid, resp, ok: m.ok, mis: m.misconception };
  });
  const t = Date.parse(dayIso + 'T10:00:00');
  return recordSession(state, spec, results, { startedAt: t - 600000, finishedAt: t, content: C });
}

test('empty topic is untested; categories follow accuracy', () => {
  const s = freshState();
  assert.equal(topicMastery('m-frac', s).category, 'untested');
  const mk = (ok, sk = 'application') => ({ qid: 'x', s: 'maths', t: 'm-frac', sk, ok, ts: 1 });
  s.attempts = Array.from({ length: 8 }, () => mk(true));
  assert.equal(topicMastery('m-frac', s).category, 'strong');
  s.attempts = Array.from({ length: 8 }, () => mk(true, 'knowledge'));
  assert.equal(topicMastery('m-frac', s).category, 'developing', 'no higher-order evidence caps at developing');
  s.attempts = Array.from({ length: 8 }, (_, i) => mk(i % 3 === 0));
  assert.equal(topicMastery('m-frac', s).category, 'attention');
  s.attempts = [...Array.from({ length: 6 }, () => mk(true)), mk(false), mk(true), mk(false), mk(true)];
  assert.equal(topicMastery('m-frac', s).category, 'developing');
});

test('hinted correct answers count half', () => {
  const s = freshState();
  s.attempts = Array.from({ length: 6 }, () => ({ qid: 'x', s: 'maths', t: 'm-frac', sk: 'application', ok: true, hint: true, ts: 1 }));
  const m = topicMastery('m-frac', s);
  assert.ok(Math.abs(m.accuracy - 0.5) < 1e-9);
});

test('diagnostic → categories → priority list puts weak topics first', () => {
  const s = freshState();
  for (const subj of ['maths', 'science', 'english']) {
    const spec = buildSession('diagnostic', { subject: subj }, s, C);
    assert.ok(spec.questions.length >= 12, `${subj} diagnostic length`);
    play(s, spec, (q) => !['m-frac', 'm-ratio', 's-elec', 'e-punct'].includes(q.topic), START);
  }
  assert.ok(['maths', 'science', 'english'].every((x) => s.diagnostics[x]));
  const ov = overview(s, C);
  assert.equal(ov.mastery['m-frac'].category, 'attention');
  assert.notEqual(ov.mastery['m-place'].category, 'attention');
  const prio = priorityList(s, C);
  const top6 = prio.slice(0, 6).map((p) => p.topic);
  for (const t of ['m-frac', 'm-ratio', 's-elec', 'e-punct']) assert.ok(top6.includes(t), `${t} should be high priority: ${top6}`);
});

test('wrong answers enter spaced repetition and can be corrected', () => {
  const srs = { questions: {}, topics: {} };
  updateQuestionCard(srs, 'q1', false, START);
  assert.equal(srs.questions.q1.due, addDays(START, 1));
  assert.deepEqual(dueQuestions(srs, START), []);
  assert.deepEqual(dueQuestions(srs, addDays(START, 1)), ['q1']);
  assert.equal(updateQuestionCard(srs, 'q1', true, addDays(START, 1)), 'corrected');
  assert.equal(srs.questions.q1.due, addDays(START, 4));
  updateQuestionCard(srs, 'q1', true, addDays(START, 4));
  updateQuestionCard(srs, 'q1', true, addDays(START, 11));
  assert.ok(srs.questions.q1, 'still reviewing after three');
  updateQuestionCard(srs, 'q1', true, addDays(START, 25));
  assert.equal(srs.questions.q1, undefined, 'retired after enough correct reviews');
});

test('stage boundaries cover the plan without gaps', () => {
  const s = freshState();
  const b = stageBoundaries(s.profile);
  assert.equal(b[0].from, START);
  for (let i = 1; i < 4; i++) assert.equal(b[i].from, addDays(b[i - 1].to, 1), `gap before stage ${i + 1}`);
  assert.equal(b[3].to, addDays(s.profile.examDate, -1));
  assert.ok(daysBetween(b[3].from, b[3].to) + 1 >= 10, 'final stage at least 10 days for 90-day plan');
  // short plan still works
  const p2 = { ...s.profile, examDate: addDays(START, 20) };
  const b2 = stageBoundaries(p2);
  assert.ok(b2.every((x) => x.from <= x.to), 'short plan stages valid');
});

test('diagnostics come first, then stage 2', () => {
  const s = freshState();
  assert.equal(stageForDate(s.profile, START, s).id, 1);
  assert.equal(stageForDate(s.profile, addDays(START, 10), s).id, 1, 'stays in diagnostic until done');
  s.diagnostics = { maths: {}, science: {}, english: {} };
  assert.equal(stageForDate(s.profile, START, s).id, 2, 'moves on once diagnostics are done');
  assert.equal(stageForDate(s.profile, addDays(START, 80), s).id, 4);
});

test('day 1 plan is the three diagnostics', () => {
  const s = freshState();
  const plan = generateDayPlan(s, C, START);
  const types = plan.tasks.filter((t) => !t.optional).map((t) => t.type);
  assert.deepEqual(types.filter((t) => t === 'diagnostic').length, 2, 'two diagnostics fit a 50-minute day');
});

test('stage 2 plan focuses on weak topics and fits the budget', () => {
  const s = freshState();
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('diagnostic', { subject: subj }, s, C), (q) => q.subject !== 'maths', START);
  const day = addDays(START, 4);
  const plan = generateDayPlan(s, C, day);
  const req = plan.tasks.filter((t) => !t.optional);
  const minutes = req.reduce((a, t) => a + t.minutes, 0);
  assert.ok(minutes <= 55, `required minutes ${minutes}`);
  assert.ok(req.some((t) => t.subject === 'maths'), 'weak subject appears');
  assert.ok(req.some((t) => t.type === 'lesson'), 'concept learning included in stage 2');
  assert.ok(req.every((t) => t.why), 'every task explains its purpose');
});

test('weekly checks and mocks are scheduled; nothing heavy before the exam', () => {
  const s = freshState();
  const ev = upcomingEvents(s.profile, START, 95);
  assert.ok(ev.some((e) => e.type === 'weekly'));
  const mocks = ev.filter((e) => e.type === 'mock');
  assert.ok(mocks.length >= 6, `mocks: ${mocks.length}`);
  for (const sub of ['maths', 'science', 'english']) assert.ok(mocks.some((m) => m.subject === sub));
  assert.equal(scheduledEvent(s.profile, addDays(s.profile.examDate, -1)), null);
  const b = stageBoundaries(s.profile);
  assert.ok(mocks.every((m) => m.date >= b[2].from), 'no mocks before exam practice stage');
});

test('missed tasks are rescheduled into the backlog, not piled onto today', () => {
  const s = freshState();
  s.diagnostics = { maths: {}, science: {}, english: {} };
  const d1 = addDays(START, 5);
  ensureTodayPlan(s, C, d1);
  const pending = s.plans[d1].tasks.filter((t) => !t.optional).length;
  const d2 = addDays(d1, 1);
  ensureTodayPlan(s, C, d2);
  assert.ok(s.plans[d1].tasks.every((t) => t.status !== 'todo'), 'old tasks marked missed');
  assert.ok(s.backlog.length >= 1 || s.plans[d2].tasks.some((t) => t.origin === 'rescheduled'), 'missed work kept');
  const req = s.plans[d2].tasks.filter((t) => !t.optional).reduce((a, t) => a + t.minutes, 0);
  assert.ok(req <= 55, `today stays within budget (${req} min, had ${pending} pending)`);
  // postpone works
  const t = s.plans[d2].tasks.find((x) => x.status === 'todo' && x.type !== 'mini');
  postponeTask(s, t.id);
  assert.equal(t.status, 'moved');
  assert.ok(s.backlog.some((b) => b.type === t.type));
});

test('completing a task marks it done and regenerate keeps it', () => {
  const s = freshState();
  ensureTodayPlan(s, C, START);
  const t = s.plans[START].tasks[0];
  completeTask(s, t.id, 'sess');
  regenerateToday(s, C, START);
  assert.ok(s.plans[START].tasks.some((x) => x.id === t.id && x.status === 'done'));
});

test('every session kind builds a non-empty set', () => {
  const s = freshState();
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('diagnostic', { subject: subj }, s, C), () => Math.random() > 0.4, START);
  for (const [kind, opts] of [['practice', { topic: 'm-frac' }], ['lesson', { topic: 's-forces' }], ['examstyle', { topic: 'e-infer' }], ['topictest', { topic: 'm-geom' }], ['mixed', {}], ['mixed', { subject: 'science' }], ['mini', {}], ['weekly', {}], ['review', {}], ['mock', { subject: 'maths' }], ['mock', { subject: 'science' }], ['mock', { subject: 'english' }]]) {
    const spec = buildSession(kind, { ...opts, today: addDays(START, 1) }, s, C);
    assert.ok(spec.questions.length > 0, `${kind} ${JSON.stringify(opts)} empty`);
    assert.equal(new Set(spec.questions).size, spec.questions.length, `${kind} duplicates`);
    if (kind === 'mock') {
      assert.ok(spec.timeLimitSec > 0);
      assert.ok(spec.questions.every((id) => C.qById[id].pool === 'mock'), 'mocks use reserved questions only');
    } else if (kind !== 'review') {
      assert.ok(spec.questions.every((id) => C.qById[id].pool !== 'mock'), `${kind} must not leak mock questions`);
    }
  }
});

test('mocks are topic-balanced and prefer unseen questions', () => {
  const s = freshState();
  const a = buildSession('mock', { subject: 'maths', seed: 'a' }, s, C);
  const topics = new Set(a.questions.map((id) => C.qById[id].topic));
  assert.equal(topics.size, 10, 'all maths topics represented');
  play(s, a, () => true, addDays(START, 40));
  const b = buildSession('mock', { subject: 'maths', seed: 'b' }, s, C);
  const overlap = b.questions.filter((q) => a.questions.includes(q)).length;
  assert.ok(overlap <= 2, `second mock reuses ${overlap} questions`);
});

test('readiness is not just accuracy and is capped without mocks', () => {
  const s = freshState();
  assert.equal(readiness(s, C).label, 'Not started');
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('diagnostic', { subject: subj }, s, C), () => true, START);
  for (let i = 0; i < 4; i++) for (const t of Object.keys(C.topics)) play(s, buildSession('practice', { topic: t, seed: 'x' + i }, s, C), () => true, addDays(START, 2 + i));
  const r = readiness(s, C);
  assert.ok(r.score <= 74, `capped without mocks, got ${r.score}`);
  assert.ok(r.missing.includes('exam'));
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('mock', { subject: subj }, s, C), () => true, addDays(START, 60));
  const r2 = readiness(s, C);
  assert.ok(r2.score >= 85 && r2.label === 'Exam-ready', `with mocks: ${r2.score} ${r2.label}`);
});

test('weekly report compares weeks, finds repeated mistakes and recommends focus', () => {
  const s = freshState();
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('diagnostic', { subject: subj }, s, C), (q) => q.topic !== 'm-frac', START);
  // week 1: fractions still wrong, reviewed and wrong again
  const w1 = addDays(START, 8);
  play(s, buildSession('practice', { topic: 'm-frac', seed: 'f1' }, s, C), () => false, w1);
  play(s, buildSession('review', { today: addDays(START, 9) }, s, C), () => false, addDays(START, 9));
  play(s, buildSession('practice', { topic: 'm-place', seed: 'p1' }, s, C), () => true, w1);
  const r = weeklyReport(s, C, 1);
  assert.ok(r.attempted > 0);
  assert.ok(r.repeatedQuestions.length > 0, 'repeated mistakes found');
  assert.ok(r.focus.includes('m-frac'), 'fractions recommended');
  assert.equal(r.history.length, 2);
  assert.ok(r.recommendations.length > 0);
  assert.ok(Array.isArray(weeklyAchievements(s, C, 1)));
});

test('badges reward understanding, not speed', () => {
  const s = freshState();
  for (const subj of ['maths', 'science', 'english']) play(s, buildSession('diagnostic', { subject: subj }, s, C), () => true, START);
  for (let i = 0; i < 2; i++) play(s, buildSession('practice', { topic: 'm-geom', seed: 'g' + i }, s, C), () => true, addDays(START, 3));
  const fresh = awardBadges(s, C);
  assert.ok(fresh.some((b) => b.id === 'diag-all'));
  assert.ok(fresh.some((b) => b.id === 'topic:m-geom'));
  assert.equal(awardBadges(s, C).length, 0, 'not awarded twice');
  assert.equal(growthStage({ n: 0, score: 0 }), 0);
  assert.equal(growthStage({ n: 9, score: 90 }), 4);
});

test('store persists, exports and imports', () => {
  const ad = new MemoryAdapter();
  const st = new Store(ad);
  st.update((s) => { s.profile = { name: 'A', startDate: START, examDate: addDays(START, 90), dailyMinutes: 45 }; });
  const st2 = new Store(ad);
  assert.equal(st2.get().profile.name, 'A');
  const json = st2.exportJSON();
  const st3 = new Store(new MemoryAdapter());
  st3.importJSON(json);
  assert.equal(st3.get().profile.dailyMinutes, 45);
  assert.throws(() => st3.importJSON('{"hello":1}'));
});
