import { h } from '../core/util.js';
import { overview } from '../engine/analytics.js';
import { categoryChip, subjClass, renderVisual, backLink, subjectChip } from '../components/ui.js';

export function subjectTabs(ctx, current, base) {
  return h('div', { class: 'seg', role: 'group', 'aria-label': 'Subject' },
    ctx.content.subjects.map((s) => h('button', { type: 'button', 'aria-pressed': s.id === current ? 'true' : 'false', onclick: () => ctx.go(`${base}?subject=${s.id}`) }, `${s.icon} ${s.short}`)));
}

export function renderLearn(root, ctx, query) {
  const { state, content } = ctx;
  const subject = query.subject || 'maths';
  const s = content.subjectById[subject];
  const ov = overview(state, content);
  root.append(h('div', { class: 'page-head' },
    h('h1', {}, 'Learn'),
    h('p', {}, 'Short lessons for every topic: the key idea, worked examples, common mistakes and an exam tip. Each lesson ends with guided practice.')),
    subjectTabs(ctx, subject, '#/learn'));

  const strands = [...new Set(s.topics.map((t) => t.strand))];
  for (const strand of strands) {
    root.append(h('section', { class: 'section' }, h('h2', {}, strand),
      h('div', { class: `sheet tabbed ${subjClass(subject)}` }, s.topics.filter((t) => t.strand === strand).map((t) => {
        const m = ov.mastery[t.id];
        return h('div', { class: 'topic-row' },
          h('div', {},
            h('div', { class: 'name' }, t.name, state.lessonsDone[t.id] ? h('span', { class: 'small muted' }, ' · lesson read') : null),
            h('div', { class: 't-meta' }, categoryChip(m.category), m.n ? h('span', {}, `${m.score}% mastery from ${m.n} answers`) : null)),
          h('div', { class: 'acts' },
            h('a', { class: 'btn small', href: `#/learn/${t.id}` }, 'Lesson'),
            h('button', { class: 'btn small secondary', onclick: () => ctx.start('practice', { topic: t.id }) }, 'Practise')));
      }))));
  }
}

export function renderLesson(root, ctx, topicId, query) {
  const { content, state } = ctx;
  const t = content.topics[topicId];
  const l = content.lessons[topicId];
  if (!t || !l) { root.append(h('div', { class: 'empty' }, 'Lesson not found.')); return; }
  const taskId = query.task || null;

  const wrap = h('article', { class: `lesson ${subjClass(t.subject)}` });
  wrap.append(backLink(`#/learn?subject=${t.subject}`, 'All topics'));
  wrap.append(h('div', { class: 'page-head' },
    h('div', { class: 't-meta' }, subjectChip(content, t.subject), h('span', { class: 'muted' }, t.strand)),
    h('h1', {}, l.title)));
  wrap.append(h('div', { class: 'key-idea' }, l.keyIdea));
  if (l.visual) wrap.append(h('div', { class: 'visual' }, renderVisual(l.visual)));
  for (const sec of l.sections) wrap.append(h('section', {}, h('h3', {}, sec.heading), h('p', { html: sec.body })));

  wrap.append(h('h2', {}, 'Worked examples'));
  wrap.append(h('p', { class: 'muted small' }, 'Try each one yourself first, then reveal the steps one at a time.'));
  l.workedExamples.forEach((ex) => {
    const list = h('ol', {});
    let shown = 0;
    const ans = h('p', { class: 'ans', hidden: true }, 'Answer: ', ex.answer);
    const btn = h('button', { type: 'button', class: 'btn secondary small' }, 'Show first step');
    btn.addEventListener('click', () => {
      if (shown < ex.steps.length) { list.append(h('li', {}, ex.steps[shown])); shown++; }
      if (shown >= ex.steps.length) { ans.hidden = false; btn.remove(); }
      else btn.textContent = 'Show next step';
    });
    wrap.append(h('div', { class: 'worked' }, h('p', { style: 'font-weight:700' }, ex.question), list, ans, btn));
  });

  wrap.append(h('section', {}, h('h2', {}, 'Common mistakes'), h('ul', { class: 'mistakes' }, l.commonMistakes.map((m) => h('li', {}, m)))));
  if (l.examTip) wrap.append(h('p', { class: 'note' }, h('b', {}, 'Exam tip: '), l.examTip));
  if (t.objectives) wrap.append(h('details', { style: 'margin:1rem 0' }, h('summary', {}, 'What you need to be able to do'), h('ul', {}, t.objectives.map((o) => h('li', {}, o)))));

  wrap.append(h('div', { class: 'sheet', style: 'margin-top:1.5rem' },
    h('h3', {}, 'Now try it'),
    h('p', { class: 'muted' }, 'Five guided questions, easiest first, with hints and explanations.'),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => ctx.start('lesson', { topic: topicId, subject: t.subject, taskId }) }, 'Start guided practice'),
      h('button', { class: 'btn ghost', onclick: () => { ctx.store.update((s) => { s.lessonsDone[topicId] = Date.now(); }); ctx.go('#/'); } }, state.lessonsDone[topicId] ? 'Back to today' : 'Mark as read for now'))));
  root.append(wrap);
}
