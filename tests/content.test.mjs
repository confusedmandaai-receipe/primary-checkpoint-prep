// Validates every question, lesson and passage so content edits can't break the app.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContentSync } from './helpers.mjs';
import { mark, answerText } from '../js/engine/marking.js';

const C = loadContentSync();

test('question ids are unique', () => {
  const ids = C.questions.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every question is well formed', () => {
  const skills = new Set(['knowledge', 'application', 'reasoning']);
  const pools = new Set(['diagnostic', 'practice', 'mock']);
  for (const q of C.questions) {
    const where = q.id;
    assert.ok(C.topics[q.topic], `${where}: unknown topic`);
    assert.equal(C.topics[q.topic].subject, q.subject, `${where}: subject mismatch`);
    assert.ok(skills.has(q.skill), `${where}: skill`);
    assert.ok(pools.has(q.pool), `${where}: pool`);
    assert.ok(q.prompt && q.prompt.length > 5, `${where}: prompt`);
    assert.ok(q.explanation, `${where}: needs an explanation`);
    assert.ok(q.hint, `${where}: needs a hint`);
    if (q.passage) assert.ok(C.passages[q.passage], `${where}: passage missing`);
    if (q.type === 'mcq') {
      assert.ok(Array.isArray(q.options) && q.options.length >= 2, `${where}: options`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${where}: answer index`);
      assert.equal(new Set(q.options).size, q.options.length, `${where}: duplicate options`);
      for (const k of Object.keys(q.mistakes || {})) assert.notEqual(Number(k), q.answer, `${where}: misconception attached to correct option`);
    } else if (q.type === 'multi') {
      assert.ok(q.answer.length >= 1);
    } else if (q.type === 'numeric') {
      const a = Array.isArray(q.answer) ? q.answer : [q.answer];
      assert.ok(a.every((x) => typeof x === 'number' && Number.isFinite(x)), `${where}: numeric answer`);
    } else if (q.type === 'text') {
      assert.ok(q.answer.length >= 1, `${where}: text answers`);
    } else assert.fail(`${where}: unknown type ${q.type}`);
  }
});

test('the stated correct answer is marked correct', () => {
  for (const q of C.questions) {
    let resp;
    if (q.type === 'mcq') resp = q.answer;
    else if (q.type === 'multi') resp = q.answer;
    else if (q.type === 'numeric') resp = String(Array.isArray(q.answer) ? q.answer[0] : q.answer);
    else resp = q.answer[0];
    assert.ok(mark(q, resp).ok, `${q.id} should accept its own answer`);
    assert.ok(answerText(q).length > 0, `${q.id} answer text`);
  }
});

test('numeric misconception keys are not correct answers', () => {
  for (const q of C.questions.filter((x) => x.type === 'numeric' && x.mistakes)) {
    for (const k of Object.keys(q.mistakes)) assert.equal(mark(q, k).ok, false, `${q.id}: mistake ${k} is marked correct`);
  }
});

test('every topic has enough questions in each pool', () => {
  for (const t of Object.values(C.topics)) {
    const qs = C.questions.filter((q) => q.topic === t.id);
    assert.ok(qs.filter((q) => q.pool === 'diagnostic').length >= 1, `${t.id} diagnostic`);
    assert.ok(qs.filter((q) => q.pool === 'practice').length >= 5, `${t.id} practice`);
    assert.ok(qs.filter((q) => q.pool === 'mock').length >= 2, `${t.id} mock`);
    assert.ok(qs.some((q) => q.skill !== 'knowledge'), `${t.id} needs higher-order questions`);
  }
});

test('every topic has a lesson with a worked example', () => {
  for (const t of Object.keys(C.topics)) {
    const l = C.lessons[t];
    assert.ok(l, `${t}: lesson missing`);
    assert.ok(l.sections.length >= 2, `${t}: sections`);
    assert.ok(l.workedExamples.length >= 1, `${t}: worked example`);
    assert.ok(l.commonMistakes.length >= 2, `${t}: common mistakes`);
  }
});

test('marking handles common input formats', () => {
  const num = { type: 'numeric', answer: 45 };
  assert.ok(mark(num, '$45').ok);
  assert.ok(mark(num, '45 ').ok);
  assert.ok(mark({ type: 'numeric', answer: 0.5 }, '1/2').ok);
  assert.ok(mark({ type: 'numeric', answer: -5 }, '−5').ok);
  assert.ok(mark({ type: 'numeric', answer: 2500 }, '2,500 g').ok);
  assert.ok(mark({ type: 'numeric', answer: 30 }, '30cm²').ok);
  assert.ok(mark({ type: 'text', answer: ['(-1, 3)'] }, '( −1 , 3 )').ok);
  assert.ok(mark({ type: 'text', answer: ['2:3'] }, '2 : 3').ok);
  assert.ok(!mark(num, '').ok);
  assert.ok(!mark(num, 'forty five').ok);
});
