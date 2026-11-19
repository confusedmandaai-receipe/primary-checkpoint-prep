import { h, pct, groupBy, minutesLabel } from '../core/util.js';
import { answerText, responseText } from '../engine/marking.js';
import { KINDS } from '../engine/sessions.js';
import { skillBreakdown } from '../engine/analytics.js';
import { subjectChip, progressBar, renderVisual } from '../components/ui.js';

const SKILL_LABEL = { knowledge: 'Knowledge and recall', application: 'Applying skills', reasoning: 'Reasoning and explaining' };

export function renderResult(root, ctx, sessionId) {
  const { state, content } = ctx;
  const s = state.sessions.find((x) => x.id === sessionId);
  if (!s) { root.append(h('div', { class: 'empty' }, 'That session could not be found.')); return; }
  const p = pct(s.score, s.total);
  const isExam = KINDS[s.kind]?.mode === 'exam';
  const attempts = s.results.map((r) => ({ ...r, q: content.qById[r.qid] })).filter((r) => r.q);

  let headline;
  if (s.kind === 'diagnostic') headline = 'Diagnostic complete. Your plan has been updated to focus on the topics that need it most.';
  else if (!s.topic && p < 65) headline = 'Use the topic and skill breakdown below to see where to focus next. Wrong answers will come back in your mistakes review.';
  else if (p >= 85) headline = 'Excellent work — this is secure.';
  else if (p >= 65) headline = 'Good progress. Review the explanations for the ones you missed.';
  else if (p >= 40) headline = 'You’re getting there. The questions you missed will come back in your mistakes review.';
  else headline = 'This topic needs more work — and that’s exactly what the plan is for. Start with the lesson.';

  root.append(h('div', { class: 'page-head' },
    h('p', { class: 'muted', style: 'margin:0' }, KINDS[s.kind]?.label),
    h('h1', {}, s.title)));

  const top = h('section', { class: 'sheet', style: 'display:flex;flex-wrap:wrap;gap:1.5rem;align-items:center' },
    h('div', {}, h('div', { class: 'score-big' }, `${s.score}/${s.total}`), h('div', { class: 'muted' }, `${p}% correct`)),
    h('div', { style: 'flex:1;min-width:240px' },
      h('p', { style: 'font-weight:700' }, headline),
      h('p', { class: 'small muted', style: 'margin:0' },
        `Time taken: ${minutesLabel(Math.max(1, Math.round(s.durationSec / 60)))}`,
        s.timeLimitSec ? ` of ${minutesLabel(Math.round(s.timeLimitSec / 60))} allowed` : '',
        s.results.some((r) => r.hint) ? ` · hints used on ${s.results.filter((r) => r.hint).length}` : '',
        s.results.some((r) => r.ns) ? ` · ${s.results.filter((r) => r.ns).length} marked “not learned yet”` : '')),
    h('div', { class: 'btn-row' },
      h('a', { class: 'btn', href: '#/' }, 'Back to today'),
      s.topic ? h('a', { class: 'btn secondary', href: `#/learn/${s.topic}` }, 'Open lesson') : null));
  root.append(top);

  // Topic & skill analysis (most useful for diagnostics, weekly checks and mocks)
  if (isExam || attempts.length >= 8) {
    const byTopic = Object.entries(groupBy(attempts, (r) => r.q.topic)).map(([t, list]) => ({ t, n: list.length, ok: list.filter((r) => r.ok).length }))
      .sort((a, b) => a.ok / a.n - b.ok / b.n);
    const sk = skillBreakdown(attempts.map((r) => ({ sk: r.q.skill, ok: r.ok, cw: r.q.command })));
    root.append(h('section', { class: 'section grid grid-2' },
      h('div', { class: 'sheet' }, h('h3', {}, 'By topic'),
        h('div', { style: 'display:grid;gap:.7rem' }, byTopic.map((x) => progressBar(pct(x.ok, x.n), { label: `${content.topics[x.t].name} (${x.ok}/${x.n})`, subject: content.topics[x.t].subject })))),
      h('div', { class: 'sheet' }, h('h3', {}, 'By skill'),
        h('div', { style: 'display:grid;gap:.7rem' }, Object.entries(sk.skill).map(([k, v]) => progressBar(v.pct, { label: `${SKILL_LABEL[k] || k} (${v.correct}/${v.n})` }))),
        h('p', { class: 'small muted', style: 'margin-top:.8rem' }, 'Checkpoint papers reward reasoning and application, not just recall. Look at which skill is weakest.'))));
  }

  const wrong = attempts.filter((r) => !r.ok);
  root.append(h('section', { class: 'section' },
    h('h2', {}, wrong.length ? 'Review your answers' : 'All correct — review if you like'),
    wrong.length ? h('p', { class: 'muted' }, 'Read each explanation carefully. Understanding why an answer is right is what makes it stick.') : null,
    h('div', { class: 'sheet' }, [...wrong, ...attempts.filter((r) => r.ok)].map((r, i) => reviewItem(content, r, i)))));
}

function reviewItem(content, r, i) {
  const q = r.q;
  const passage = q.passage ? content.passages[q.passage] : null;
  return h('div', { class: 'review-item' },
    h('div', { class: 't-meta small', style: 'margin-bottom:.3rem' },
      h('span', { class: `mark ${r.ok ? 'ok' : 'no'}` }, r.ok ? '✓ Correct' : r.ns ? '○ Not learned yet' : '✗ Not correct'),
      subjectChip(content, q.subject), h('span', { class: 'muted' }, content.topics[q.topic].name),
      r.flag ? h('span', { class: 'chip' }, '⚑ flagged') : null),
    passage ? h('p', { class: 'small muted', style: 'margin:0' }, `From “${passage.title}”`) : null,
    h('p', { style: 'font-weight:700;margin:.2rem 0 .5rem' }, q.prompt),
    q.stimulus && !r.ok ? renderVisual(q.stimulus) : null,
    h('p', { class: 'small', style: 'margin:0' }, h('b', {}, 'Your answer: '), r.ns ? '—' : responseText(q, r.resp)),
    !r.ok ? h('p', { class: 'small', style: 'margin:0' }, h('b', {}, 'Correct answer: '), answerText(q)) : null,
    !r.ok && q.mistakes && r.resp != null && q.mistakes[String(r.resp)] ? h('p', { class: 'small', style: 'margin:0' }, h('b', {}, 'Likely slip: '), q.mistakes[String(r.resp)]) : null,
    h('details', { open: !r.ok ? true : null, style: 'margin-top:.4rem' },
      h('summary', { class: 'small' }, 'Explanation'),
      q.steps ? h('ol', { class: 'small' }, q.steps.map((s) => h('li', {}, s))) : null,
      h('p', { class: 'small', style: 'margin:.3rem 0 0' }, q.explanation)));
}
