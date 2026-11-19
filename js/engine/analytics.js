// Performance analytics: topic mastery, categories, priorities, readiness and
// weekly reports. Everything here is a pure function of (state, content).

import { groupBy, pct, isoDate, daysBetween, addDays, sum, clamp } from '../core/util.js';

export const CATEGORY = {
  strong: { id: 'strong', label: 'Strong', order: 3 },
  developing: { id: 'developing', label: 'Developing', order: 2 },
  attention: { id: 'attention', label: 'Needs attention', order: 1 },
  untested: { id: 'untested', label: 'Not yet assessed', order: 0 },
};

const RECENT = 15; // attempts per topic that count
const DECAY = 0.88; // older attempts count a little less
const FULL_EVIDENCE = 6; // attempts needed before a score is fully trusted

/** Credit for one attempt: hinted correct answers count for half. */
function credit(a) {
  if (!a.ok) return 0;
  return a.hint ? 0.5 : 1;
}

/** Weighted recent accuracy for a list of attempts (oldest first). */
export function weightedAccuracy(attempts) {
  const recent = attempts.slice(-RECENT);
  let w = 0, s = 0;
  recent.forEach((a, i) => {
    const weight = Math.pow(DECAY, recent.length - 1 - i);
    w += weight;
    s += weight * credit(a);
  });
  return w ? s / w : 0;
}

export function attemptsByTopic(state) {
  return groupBy(state.attempts, 't');
}

export function topicMastery(topicId, state, byTopic = attemptsByTopic(state)) {
  const list = byTopic[topicId] || [];
  const n = list.length;
  if (!n) return { topic: topicId, n: 0, accuracy: 0, score: 0, category: 'untested', higherOrderOk: false, lowEvidence: true };
  const accuracy = weightedAccuracy(list);
  const confidence = Math.min(1, n / FULL_EVIDENCE);
  const score = Math.round(accuracy * confidence * 100);
  const recent = list.slice(-RECENT);
  const higherOrderOk = recent.some((a) => a.ok && !a.hint && (a.sk === 'reasoning' || a.sk === 'application'));
  let category;
  if (accuracy >= 0.8 && n >= 4) category = higherOrderOk ? 'strong' : 'developing';
  else if (accuracy >= 0.5) category = 'developing';
  else category = 'attention';
  return { topic: topicId, n, accuracy, score, category, higherOrderOk, lowEvidence: n < 4, last: list[n - 1].ts };
}

export function allTopicMastery(state, content) {
  const byTopic = attemptsByTopic(state);
  const out = {};
  for (const id of Object.keys(content.topics)) out[id] = topicMastery(id, state, byTopic);
  return out;
}

export function subjectProgress(subjectId, mastery, content) {
  const topics = content.subjectById[subjectId].topics;
  const scores = topics.map((t) => mastery[t.id].score);
  const counts = { strong: 0, developing: 0, attention: 0, untested: 0 };
  topics.forEach((t) => counts[mastery[t.id].category]++);
  return { subject: subjectId, score: Math.round(sum(scores) / topics.length), counts, total: topics.length };
}

export function overview(state, content) {
  const mastery = allTopicMastery(state, content);
  const subjects = {};
  for (const s of content.subjects) subjects[s.id] = subjectProgress(s.id, mastery, content);
  const overall = Math.round(sum(Object.values(subjects), (x) => x.score) / content.subjects.length);
  const mastered = Object.values(mastery).filter((m) => m.category === 'strong').length;
  const needRevision = Object.values(mastery).filter((m) => m.category === 'attention' || m.category === 'developing').length;
  return { mastery, subjects, overall, mastered, needRevision, totalTopics: Object.keys(mastery).length };
}

/**
 * Ordered study priorities. Weak, heavily examined topics first;
 * topics flagged in the weekly report get a boost.
 */
export function priorityList(state, content, { focus = [], todayIso = isoDate() } = {}) {
  const mastery = allTopicMastery(state, content);
  const base = { attention: 3, untested: 2.4, developing: 2, strong: 0.6 };
  const list = Object.values(content.topics).map((t) => {
    const m = mastery[t.id];
    let p = base[m.category] * (t.weight || 2);
    if (m.category !== 'untested') p += (1 - m.accuracy) * 1.5;
    if (focus.includes(t.id)) p += 1.5;
    const srs = state.srs.topics[t.id];
    if (srs && srs.due <= todayIso) p += 0.8;
    if (m.lowEvidence && m.category !== 'untested') p += 0.4;
    return { topic: t.id, subject: t.subject, name: t.name, category: m.category, accuracy: m.accuracy, score: m.score, n: m.n, priority: Math.round(p * 100) / 100 };
  });
  return list.sort((a, b) => b.priority - a.priority);
}

/** Accuracy broken down by skill and by command word. */
export function skillBreakdown(attempts) {
  const bySkill = groupBy(attempts, 'sk');
  const byCommand = groupBy(attempts.filter((a) => a.cw), 'cw');
  const fmt = (g) => Object.fromEntries(Object.entries(g).map(([k, v]) => [k, { n: v.length, correct: v.filter((a) => a.ok).length, pct: pct(v.filter((a) => a.ok).length, v.length) }]));
  return { skill: fmt(bySkill), command: fmt(byCommand) };
}

/** Latest mock percentages per subject (newest first). */
export function mockHistory(state, subject) {
  return state.sessions
    .filter((s) => s.kind === 'mock' && s.finishedAt && (!subject || s.subject === subject))
    .sort((a, b) => b.finishedAt - a.finishedAt);
}

/**
 * Exam readiness is NOT quiz accuracy. It blends four separate signals and
 * says plainly when there is not enough evidence yet.
 */
export function readiness(state, content) {
  const ov = overview(state, content);
  const m = Object.values(ov.mastery);
  const coverage = pct(m.filter((x) => x.n >= 4).length, m.length);
  const higher = state.attempts.filter((a) => a.sk === 'reasoning' || a.sk === 'application').slice(-40);
  const higherOrder = higher.length >= 5 ? pct(higher.filter((a) => a.ok && !a.hint).length, higher.length) : null;
  const perSubjectMock = content.subjects.map((s) => {
    const h = mockHistory(state, s.id).slice(0, 2);
    return h.length ? sum(h, (x) => pct(x.score, x.total)) / h.length : null;
  });
  const mocksTaken = perSubjectMock.filter((x) => x != null);
  const examConditions = mocksTaken.length ? Math.round(sum(mocksTaken) / mocksTaken.length) : null;

  const parts = [
    { id: 'coverage', label: 'Topics with enough evidence', value: coverage, weight: 0.2 },
    { id: 'mastery', label: 'Topic mastery', value: ov.overall, weight: 0.35 },
    { id: 'higher', label: 'Reasoning & application questions', value: higherOrder, weight: 0.2 },
    { id: 'exam', label: 'Timed mock exams', value: examConditions, weight: 0.25 },
  ];
  const known = parts.filter((p) => p.value != null);
  const wsum = sum(known, (p) => p.weight);
  let score = wsum ? Math.round(sum(known, (p) => p.value * p.weight) / wsum) : 0;
  const missing = parts.filter((p) => p.value == null).map((p) => p.id);
  // Without mocks on every subject we cannot claim exam-readiness.
  if (mocksTaken.length < content.subjects.length) score = Math.min(score, 74);
  let label;
  if (!state.attempts.length) label = 'Not started';
  else if (score >= 85) label = 'Exam-ready';
  else if (score >= 70) label = 'On track';
  else if (score >= 50) label = 'Getting there';
  else label = 'Building foundations';
  return { score, label, parts, missing, mocksTaken: mocksTaken.length };
}

/** Week index counted from the plan start (week 0 = first 7 days). */
export function weekIndex(startIso, iso) {
  return Math.floor(daysBetween(startIso, iso) / 7);
}

export function weekRange(startIso, k) {
  const from = addDays(startIso, k * 7);
  return { from, to: addDays(from, 6) };
}

function attemptsInRange(state, fromIso, toIso) {
  return state.attempts.filter((a) => {
    const d = isoDate(new Date(a.ts));
    return d >= fromIso && d <= toIso;
  });
}

/** Weekly performance report for week k. */
export function weeklyReport(state, content, k) {
  const start = state.profile.startDate;
  const { from, to } = weekRange(start, k);
  const atts = attemptsInRange(state, from, to);
  const correct = atts.filter((a) => a.ok).length;
  const bySubject = {};
  for (const s of content.subjects) {
    const sa = atts.filter((a) => a.s === s.id);
    bySubject[s.id] = { n: sa.length, correct: sa.filter((a) => a.ok).length, pct: pct(sa.filter((a) => a.ok).length, sa.length) };
  }
  const byTopic = Object.entries(groupBy(atts, 't')).map(([t, list]) => ({
    topic: t,
    name: content.topics[t]?.name ?? t,
    subject: content.topics[t]?.subject,
    n: list.length,
    correct: list.filter((a) => a.ok).length,
    pct: pct(list.filter((a) => a.ok).length, list.length),
  })).sort((a, b) => a.pct - b.pct);

  // Repeated mistakes: same question wrong twice (ever, with one this week) or
  // the same misconception appearing more than once this week.
  const wrongCounts = groupBy(state.attempts.filter((a) => !a.ok && isoDate(new Date(a.ts)) <= to), 'qid');
  const repeatedQuestions = Object.entries(wrongCounts)
    .filter(([qid, list]) => list.length >= 2 && list.some((a) => isoDate(new Date(a.ts)) >= from))
    .map(([qid, list]) => ({ qid, times: list.length, topic: list[0].t }));
  const misGroups = groupBy(atts.filter((a) => a.mis), 'mis');
  const repeatedMisconceptions = Object.entries(misGroups)
    .filter(([, list]) => list.length >= 2)
    .map(([mis, list]) => ({ text: mis, times: list.length, topic: list[0].t }))
    .sort((a, b) => b.times - a.times);

  const studyDays = new Set(atts.map((a) => isoDate(new Date(a.ts)))).size;
  const sessions = state.sessions.filter((s) => s.finishedAt && isoDate(new Date(s.finishedAt)) >= from && isoDate(new Date(s.finishedAt)) <= to);

  const history = [];
  for (let i = 0; i <= k; i++) {
    const r = weekRange(start, i);
    const a = attemptsInRange(state, r.from, r.to);
    history.push({ week: i, n: a.length, pct: a.length ? pct(a.filter((x) => x.ok).length, a.length) : null });
  }
  const prev = history.slice(0, k).reverse().find((x) => x.pct != null);
  const thisPct = pct(correct, atts.length);
  const change = prev && atts.length ? thisPct - prev.pct : null;

  // Recommendations feed next week's plan.
  const weakTopics = byTopic.filter((t) => t.n >= 3 && t.pct < 70).slice(0, 3).map((t) => t.topic);
  const misTopics = repeatedMisconceptions.map((m) => m.topic);
  const ov = overview(state, content);
  const untouched = Object.values(ov.mastery).filter((m) => m.category === 'attention').map((m) => m.topic);
  const focus = [...new Set([...weakTopics, ...misTopics, ...untouched])].slice(0, 4);
  const recommendations = [];
  for (const t of focus) {
    const name = content.topics[t]?.name ?? t;
    const m = ov.mastery[t];
    if (m.category === 'attention') recommendations.push({ topic: t, text: `${state.lessonsDone?.[t] ? 'Re-read' : 'Read'} the ${name} lesson, then do a guided practice set.`, action: 'lesson' });
    else recommendations.push({ topic: t, text: `Do an exam-style practice set on ${name} and review each explanation.`, action: 'practice' });
  }
  if (repeatedQuestions.length) recommendations.push({ text: `Work through your mistakes review (${repeatedQuestions.length} question${repeatedQuestions.length > 1 ? 's' : ''} answered wrongly more than once).`, action: 'review' });
  const mocksThisWeek = sessions.filter((s) => s.kind === 'mock').length;

  return {
    week: k, from, to,
    attempted: atts.length,
    correct,
    accuracy: thisPct,
    bySubject,
    byTopic,
    repeatedQuestions,
    repeatedMisconceptions,
    studyDays,
    sessions: sessions.length,
    mocksThisWeek,
    history,
    change,
    focus,
    recommendations,
    skills: skillBreakdown(atts),
  };
}

export function categoryFor(score) {
  return clamp(score, 0, 100);
}
