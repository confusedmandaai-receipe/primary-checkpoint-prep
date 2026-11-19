// Mastery badges and weekly achievements. Awarded for understanding and
// consistency only — never for speed, and nothing is ranked against others.

import { overview, weeklyReport, weekIndex } from './analytics.js';
import { isoDate } from '../core/util.js';

export const MILESTONES = [
  { id: 'diag-all', icon: '🧭', name: 'Starting point', desc: 'Finished the diagnostic in all three subjects.', test: (s) => ['maths', 'science', 'english'].every((x) => s.diagnostics[x]) },
  { id: 'fix-10', icon: '🔧', name: 'Mistake fixer', desc: 'Corrected 10 earlier mistakes.', test: (s) => (s.stats.mistakesCorrected || 0) >= 10 },
  { id: 'fix-40', icon: '🛠️', name: 'Mistake master', desc: 'Corrected 40 earlier mistakes.', test: (s) => (s.stats.mistakesCorrected || 0) >= 40 },
  { id: 'mock-1', icon: '📝', name: 'First mock', desc: 'Completed a timed mock examination.', test: (s) => s.sessions.some((x) => x.kind === 'mock') },
  { id: 'mock-all', icon: '🎓', name: 'Full set', desc: 'Completed a mock in every subject.', test: (s) => ['maths', 'science', 'english'].every((sub) => s.sessions.some((x) => x.kind === 'mock' && x.subject === sub)) },
  { id: 'writer-3', icon: '✍️', name: 'Practised writer', desc: 'Completed three structured writing tasks.', test: (s) => s.writing.length >= 3 },
  { id: 'reasoner', icon: '🧠', name: 'Clear reasoner', desc: 'Answered 25 reasoning questions correctly without hints.', test: (s) => s.attempts.filter((a) => a.sk === 'reasoning' && a.ok && !a.hint).length >= 25 },
];

/** Topic mastery badge: Strong category including unaided higher-order success. */
export function topicBadgeEarned(m) {
  return m.category === 'strong' && m.higherOrderOk;
}

/** Returns newly awarded badges and records them in state. */
export function awardBadges(state, content) {
  const ov = overview(state, content);
  const fresh = [];
  for (const [topic, m] of Object.entries(ov.mastery)) {
    const id = `topic:${topic}`;
    if (!state.badges[id] && topicBadgeEarned(m)) {
      state.badges[id] = { awardedAt: Date.now() };
      fresh.push({ id, icon: '🏅', name: `${content.topics[topic].name} mastered`, desc: 'Strong results including reasoning or application questions.' });
    }
  }
  for (const b of MILESTONES) {
    if (!state.badges[b.id] && b.test(state)) {
      state.badges[b.id] = { awardedAt: Date.now() };
      fresh.push(b);
    }
  }
  return fresh;
}

/** Achievements celebrate improvement and consistency within one week. */
export function weeklyAchievements(state, content, k) {
  const r = weeklyReport(state, content, k);
  const out = [];
  if (r.studyDays >= 5) out.push({ icon: '📅', text: `Studied on ${r.studyDays} of 7 days` });
  else if (r.studyDays >= 3) out.push({ icon: '📅', text: `Studied on ${r.studyDays} days — steady work` });
  if (r.change != null && r.change >= 5) out.push({ icon: '📈', text: `Accuracy up ${r.change} points on last week` });
  const corrected = state.attempts.filter((a) => a.mode === 'review' && a.ok && weekIndex(state.profile.startDate, isoDate(new Date(a.ts))) === k).length;
  if (corrected >= 5) out.push({ icon: '🔧', text: `Fixed ${corrected} earlier mistakes` });
  const badgesThisWeek = Object.entries(state.badges).filter(([id, b]) => id.startsWith('topic:') && weekIndex(state.profile.startDate, isoDate(new Date(b.awardedAt))) === k).length;
  if (badgesThisWeek) out.push({ icon: '🏅', text: `${badgesThisWeek} topic${badgesThisWeek > 1 ? 's' : ''} mastered` });
  if (r.mocksThisWeek) out.push({ icon: '📝', text: `Completed ${r.mocksThisWeek} mock${r.mocksThisWeek > 1 ? 's' : ''} under exam conditions` });
  return out;
}

/** Garden growth stage 0–4 for a topic, from its mastery score. */
export function growthStage(m) {
  if (m.n === 0) return 0;
  if (m.score < 30) return 1;
  if (m.score < 55) return 2;
  if (m.score < 80) return 3;
  return 4;
}
