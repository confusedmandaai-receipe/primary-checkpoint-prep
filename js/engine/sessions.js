// Builds question sets for every activity and records finished sessions.

import { isoDate, shuffle, groupBy, seededRandom, uid } from '../core/util.js';
import { allTopicMastery, priorityList } from './analytics.js';
import { updateQuestionCard, updateTopicCard, dueQuestions } from './srs.js';

export const KINDS = {
  diagnostic: { label: 'Diagnostic assessment', mode: 'exam', notSure: true },
  lesson: { label: 'Guided practice', mode: 'feedback', hints: true },
  practice: { label: 'Topic practice', mode: 'feedback', hints: true },
  examstyle: { label: 'Exam-style practice', mode: 'feedback', hints: true },
  topictest: { label: 'Topic assessment', mode: 'exam' },
  mixed: { label: 'Mixed-topic practice', mode: 'feedback', hints: true },
  review: { label: 'Mistakes review', mode: 'feedback', hints: true },
  mini: { label: 'Mini challenge', mode: 'feedback', hints: true },
  weekly: { label: 'Weekly check', mode: 'exam' },
  mock: { label: 'Mock examination', mode: 'exam', timed: true },
};

function seenMap(state) {
  const m = {};
  for (const a of state.attempts) m[a.qid] = { ok: a.ok, ts: a.ts, n: (m[a.qid]?.n || 0) + 1 };
  return m;
}

/** Choose n questions preferring unseen ones, then old mistakes, then oldest seen. */
export function pickQuestions(pool, n, state, rand, { targetDifficulty = null } = {}) {
  const seen = seenMap(state);
  const scored = pool.map((q) => {
    const s = seen[q.id];
    let score = s ? (s.ok ? 0 : 2) : 3;
    if (s) score -= Math.min(2, s.n * 0.3);
    if (targetDifficulty) score -= Math.abs((q.difficulty || 2) - targetDifficulty) * 0.7;
    return { q, score: score + rand() * 0.9 };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, n).map((x) => x.q);
}

/** Keep passage questions together, in passage order. */
function orderForDisplay(qs) {
  const withP = qs.filter((q) => q.passage);
  const without = qs.filter((q) => !q.passage);
  const groups = groupBy(withP, 'passage');
  const ordered = Object.values(groups).flatMap((g) => g.sort((a, b) => (a.order || 0) - (b.order || 0)));
  return [...without, ...ordered];
}

function difficultyFor(category) {
  return { attention: 1, untested: 1.5, developing: 2, strong: 2.6 }[category] || 2;
}

/**
 * opts: {subject, topic, n, seed, focus, minutes}
 * Returns a session spec (not yet stored).
 */
export function buildSession(kind, opts, state, content) {
  const todayIso = opts.today || isoDate();
  const rand = seededRandom(opts.seed || `${kind}-${opts.subject || ''}-${opts.topic || ''}-${Date.now()}`);
  const Q = content.questions;
  const mastery = allTopicMastery(state, content);
  let qs = [];
  let title = KINDS[kind].label;
  let timeLimitSec = null;

  if (kind === 'diagnostic') {
    qs = Q.filter((q) => q.pool === 'diagnostic' && q.subject === opts.subject);
    // Order: topic by topic, easiest first, passages at the end.
    const order = content.subjectById[opts.subject].topics.map((t) => t.id);
    qs.sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic) || (a.difficulty || 2) - (b.difficulty || 2));
    qs = orderForDisplay(qs);
    title = `${content.subjectById[opts.subject].name} diagnostic`;
  } else if (kind === 'lesson' || kind === 'practice' || kind === 'examstyle' || kind === 'topictest') {
    const t = content.topics[opts.topic];
    let pool = Q.filter((q) => q.pool === 'practice' && q.topic === opts.topic);
    let target = difficultyFor(mastery[opts.topic].category);
    if (kind === 'lesson') target = 1;
    if (kind === 'examstyle') {
      const hard = pool.filter((q) => q.skill !== 'knowledge' || (q.difficulty || 2) >= 2);
      if (hard.length >= 4) pool = hard;
      target = 2.6;
    }
    const n = opts.n || (kind === 'lesson' ? 5 : kind === 'topictest' ? 8 : 8);
    qs = orderForDisplay(pickQuestions(pool, n, state, rand, { targetDifficulty: target }));
    title = `${t.name} — ${KINDS[kind].label.toLowerCase()}`;
  } else if (kind === 'mixed' && opts.command) {
    const pool = Q.filter((q) => q.pool === 'practice' && q.command === opts.command && (!opts.subject || q.subject === opts.subject));
    qs = orderForDisplay(pickQuestions(pool, opts.n || 8, state, rand, { targetDifficulty: 2 }));
    title = `Command word practice: “${opts.command}”`;
  } else if (kind === 'mixed' || kind === 'mini' || kind === 'weekly') {
    const prio = priorityList(state, content, { focus: opts.focus || [], todayIso });
    const subjects = opts.subject ? [opts.subject] : content.subjects.map((s) => s.id);
    const n = opts.n || (kind === 'mini' ? 4 : kind === 'weekly' ? 15 : 10);
    // Weighted topic draw: weaker topics more often, but every subject appears.
    let eligible = prio.filter((p) => subjects.includes(p.subject) && (kind !== 'mini' || p.category !== 'untested'));
    if (!eligible.length) eligible = prio.filter((p) => subjects.includes(p.subject));
    const topicsBySubject = groupBy(eligible, 'subject');
    const chosen = [];
    const used = new Set();
    let i = 0;
    const perSubject = Math.ceil(n / subjects.length);
    for (const s of subjects) {
      const tlist = (topicsBySubject[s] || []).slice();
      let count = 0;
      while (count < perSubject && tlist.length && chosen.length < n) {
        // pick from the top half with bias
        const idx = Math.floor(Math.pow(rand(), 1.8) * tlist.length);
        const topic = tlist[idx].topic;
        const pool = Q.filter((q) => q.pool === 'practice' && q.topic === topic && !used.has(q.id) && (!q.passage || kind === 'weekly'));
        const [q] = pickQuestions(pool, 1, state, rand, { targetDifficulty: kind === 'mini' ? 1.5 : 2.2 });
        if (q) { chosen.push(q); used.add(q.id); count++; }
        else tlist.splice(idx, 1);
        if (++i > 400) break;
      }
    }
    qs = orderForDisplay(shuffle(chosen, rand));
    if (kind === 'mixed') title = opts.subject ? `${content.subjectById[opts.subject].name} mixed practice` : 'Mixed-topic practice';
    if (kind === 'mini') { title = '3-minute challenge'; }
    if (kind === 'weekly') { title = `Weekly check`; }
  } else if (kind === 'review') {
    const due = dueQuestions(state.srs, todayIso).filter((id) => content.qById[id] && (!opts.subject || content.qById[id].subject === opts.subject));
    // If nothing is due yet, revisit the most recent mistakes so the button never dead-ends.
    let ids = due.slice(0, opts.n || 10);
    if (!ids.length) ids = Object.keys(state.srs.questions).filter((id) => content.qById[id]).slice(0, opts.n || 10);
    qs = orderForDisplay(ids.map((id) => content.qById[id]));
    title = 'Correct my mistakes';
  } else if (kind === 'mock') {
    const subj = content.subjectById[opts.subject];
    const pool = Q.filter((q) => q.pool === 'mock' && q.subject === opts.subject);
    const n = opts.n || 20;
    if (opts.subject === 'english') {
      // One or two reading passages plus language questions.
      const byP = groupBy(pool.filter((q) => q.passage), 'passage');
      const seen = seenMap(state);
      const passages = shuffle(Object.keys(byP), rand).sort((a, b) => byP[a].filter((q) => seen[q.id]).length - byP[b].filter((q) => seen[q.id]).length);
      const reading = passages.slice(0, 2).flatMap((p) => byP[p]);
      const lang = pickQuestions(pool.filter((q) => !q.passage), Math.max(0, n - reading.length), state, rand);
      qs = orderForDisplay([...lang, ...reading]);
    } else {
      // Balance across topics: round-robin from each topic's best candidates.
      const byT = groupBy(pool, 'topic');
      const lists = Object.values(byT).map((l) => pickQuestions(l, l.length, state, rand));
      while (qs.length < n && lists.some((l) => l.length)) {
        for (const l of lists) if (l.length && qs.length < n) qs.push(l.shift());
      }
      qs = shuffle(qs, rand).sort((a, b) => (a.difficulty || 2) - (b.difficulty || 2));
    }
    timeLimitSec = (opts.minutes || 45) * 60;
    title = `${subj.name} mock examination`;
  }

  return {
    kind,
    title,
    mode: KINDS[kind].mode,
    subject: opts.subject || null,
    topic: opts.topic || null,
    taskId: opts.taskId || null,
    questions: qs.map((q) => q.id),
    timeLimitSec,
  };
}

/**
 * Store a finished session: attempts, SRS updates, diagnostics, lesson flags.
 * results: [{qid, resp, ok, hint, ns, mis}]
 */
export function recordSession(state, spec, results, { startedAt, finishedAt = Date.now(), content }) {
  const todayIso = isoDate(new Date(finishedAt));
  const id = uid('s');
  const score = results.filter((r) => r.ok).length;
  for (const r of results) {
    const q = content.qById[r.qid];
    if (!q) continue;
    state.attempts.push({
      qid: q.id, s: q.subject, t: q.topic, sk: q.skill, cw: q.command,
      ok: !!r.ok, hint: !!r.hint, ns: !!r.ns, mode: spec.kind, ts: finishedAt,
      ...(r.mis ? { mis: r.mis } : {}), sid: id,
    });
    const outcome = updateQuestionCard(state.srs, q.id, !!r.ok && !r.hint, todayIso);
    if (outcome === 'corrected') state.stats.mistakesCorrected = (state.stats.mistakesCorrected || 0) + 1;
  }
  if (spec.topic && ['practice', 'examstyle', 'topictest', 'lesson'].includes(spec.kind)) {
    updateTopicCard(state.srs, spec.topic, results.length ? score / results.length : 0, todayIso);
  }
  if (spec.kind === 'diagnostic') state.diagnostics[spec.subject] = { sessionId: id, completedAt: finishedAt };
  const session = {
    id, kind: spec.kind, title: spec.title, subject: spec.subject, topic: spec.topic, taskId: spec.taskId,
    startedAt, finishedAt, score, total: results.length,
    durationSec: Math.round((finishedAt - startedAt) / 1000), timeLimitSec: spec.timeLimitSec,
    results: results.map((r) => ({ qid: r.qid, ok: !!r.ok, resp: r.resp, ns: !!r.ns, hint: !!r.hint, flag: !!r.flag })),
  };
  state.sessions.push(session);
  return session;
}
