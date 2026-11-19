// Runs the three student scenarios through the whole plan (22 Feb – 1 Mar 2027 exams)
// and checks the plan behaves correctly for each.
import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate, summarise, EXAMS } from './simulate.mjs';
import { addDays } from '../js/core/util.js';

const runs = Object.fromEntries(['quick', 'reluctant', 'needsPush'].map((k) => {
  const r = simulate(k);
  return [k, { r, s: summarise(r) }];
}));

for (const [k, { r, s }] of Object.entries(runs)) {
  test(`${k}: no planning rule is broken on any day`, () => {
    assert.deepEqual(s.issues, []);
  });
  test(`${k}: diagnostics finish within the first two weeks`, () => {
    assert.equal(typeof s.diagnosticsCompletedByDay, 'number');
    assert.ok(s.diagnosticsCompletedByDay <= 14, `day ${s.diagnosticsCompletedByDay}`);
  });
  test(`${k}: every subject gets at least one mock before its exam`, () => {
    for (const sub of ['maths', 'science', 'english']) {
      assert.ok(s.mocks[sub].some((m) => m.date < EXAMS[sub]), `${sub}: ${JSON.stringify(s.mocks[sub])}`);
    }
  });
  test(`${k}: nothing is studied for a subject after its exam`, () => {
    for (const sess of r.state.sessions) {
      const d = new Date(sess.finishedAt).toISOString().slice(0, 10);
      if (sess.subject) assert.ok(d < EXAMS[sess.subject], `${sess.kind} ${sess.subject} on ${d}`);
    }
  });
  test(`${k}: lessons are spread across topics, not repeated`, () => {
    const counts = {};
    for (const sess of r.state.sessions.filter((x) => x.kind === 'lesson')) counts[sess.topic] = (counts[sess.topic] || 0) + 1;
    assert.ok(Math.max(0, ...Object.values(counts)) <= 3, JSON.stringify(counts));
  });
  test(`${k}: the mistakes queue and rescheduled list stay bounded`, () => {
    assert.ok(s.maxDueMistakes <= 60);
    assert.ok(s.maxBacklog <= 6);
  });
}

test('quick learner reaches exam-ready before the first exam', () => {
  const s = runs.quick.s;
  assert.equal(s.readiness.beforeMaths.label, 'Exam-ready');
  assert.ok(s.categoriesAtEnd.strong >= 20);
});

test('struggling students get shorter plans, not longer ones', () => {
  for (const k of ['reluctant', 'needsPush']) {
    const light = runs[k].r.daily.filter((d) => d.reqMin && d.reqMin <= 32).length;
    assert.ok(light > 20, `${k}: only ${light} short days`);
    assert.ok(runs[k].s.avgPlannedMinutes < runs.quick.s.avgPlannedMinutes);
  }
});

test('readiness never claims exam-ready for a student who has not done the work', () => {
  for (const k of ['reluctant', 'needsPush']) assert.notEqual(runs[k].s.readiness.beforeEnglish.label, 'Exam-ready');
});

test('day before each exam is light and exam days have no study tasks', () => {
  const d = runs.quick.r.daily;
  for (const sub of ['maths', 'science', 'english']) {
    const before = d.find((x) => x.day === addDays(EXAMS[sub], -1));
    assert.ok(before.reqMin <= 15, `${sub} eve: ${before.tasks}`);
    const on = d.find((x) => x.day === EXAMS[sub]);
    if (on) assert.ok(on.tasks.every((t) => t.startsWith('rest') || t.includes('?')), `${sub} day: ${on.tasks}`);
  }
});
