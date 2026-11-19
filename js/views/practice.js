import { h, formatDate, isoDate, uid } from '../core/util.js';
import { overview } from '../engine/analytics.js';
import { dueQuestions } from '../engine/srs.js';
import { completeTask, findTask } from '../engine/planner.js';
import { awardBadges } from '../engine/badges.js';
import { categoryChip, subjClass, backLink } from '../components/ui.js';
import { subjectTabs } from './learn.js';

export function renderPractice(root, ctx, query) {
  const { state, content } = ctx;
  const subject = query.subject || 'maths';
  const due = dueQuestions(state.srs, ctx.today()).filter((q) => content.qById[q]).length;
  const totalMistakes = Object.keys(state.srs.questions).length;
  const ov = overview(state, content);

  root.append(h('div', { class: 'page-head' },
    h('h1', {}, 'Practise'),
    h('p', {}, 'Choose what you need: correct past mistakes, practise one topic, or mix topics the way the real exam does.')));

  root.append(h('div', { class: 'grid grid-3' },
    h('div', { class: 'sheet' },
      h('h3', {}, '🔧 Correct my mistakes'),
      h('p', { class: 'small muted' }, totalMistakes ? `${due} due today · ${totalMistakes} in total. Each one comes back after 1, 3, 7 and 14 days until it sticks.` : 'Questions you get wrong will appear here for spaced review.'),
      h('button', { class: 'btn', disabled: !totalMistakes, onclick: () => ctx.start('review') }, due ? `Review ${Math.min(due, 10)} now` : 'Review anyway')),
    h('div', { class: 'sheet' },
      h('h3', {}, '🔀 Mixed-topic practice'),
      h('p', { class: 'small muted' }, 'Ten questions from different topics, weighted towards your weaker areas.'),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => ctx.start('mixed') }, 'All subjects'),
        content.subjects.map((s) => h('button', { class: 'btn secondary small', onclick: () => ctx.start('mixed', { subject: s.id }) }, s.short)))),
    h('div', { class: 'sheet' },
      h('h3', {}, '⚡ 3-minute challenge'),
      h('p', { class: 'small muted' }, 'Four quick questions on topics you have already studied, to keep them fresh. Take your time — speed is not scored.'),
      h('button', { class: 'btn secondary', onclick: () => ctx.start('mini') }, 'Start challenge')),
    h('div', { class: 'sheet' },
      h('h3', {}, '🗣️ Command words'),
      h('p', { class: 'small muted' }, 'Learn what “explain”, “describe”, “suggest” and other exam words ask you to do — then practise them.'),
      h('a', { class: 'btn secondary', href: '#/practice/command-words' }, 'Open command words')),
    h('div', { class: 'sheet' },
      h('h3', {}, '✍️ Writing practice'),
      h('p', { class: 'small muted' }, `Structured writing tasks with planning frames and success criteria. ${state.writing.length} completed.`),
      h('a', { class: 'btn secondary', href: '#/practice/writing' }, 'Choose a task'))));

  const s = content.subjectById[subject];
  root.append(h('section', { class: 'section' },
    h('h2', {}, 'Practise a topic'),
    subjectTabs(ctx, subject, '#/practice'),
    h('p', { class: 'small muted', style: 'margin-top:.8rem' }, h('b', {}, 'Practise'), ': hints and instant explanations. ', h('b', {}, 'Exam-style'), ': harder reasoning questions. ', h('b', {}, 'Topic test'), ': no help until the end — a true check of understanding.'),
    h('div', { class: `sheet tabbed ${subjClass(subject)}` }, s.topics.map((t) => {
      const m = ov.mastery[t.id];
      return h('div', { class: 'topic-row' },
        h('div', {}, h('div', { class: 'name' }, t.name), h('div', { class: 't-meta' }, categoryChip(m.category), m.n ? h('span', {}, `${m.score}% mastery`) : null)),
        h('div', { class: 'acts' },
          h('button', { class: 'btn small', onclick: () => ctx.start('practice', { topic: t.id }) }, 'Practise'),
          h('button', { class: 'btn small secondary', onclick: () => ctx.start('examstyle', { topic: t.id }) }, 'Exam-style'),
          h('button', { class: 'btn small ghost', onclick: () => ctx.start('topictest', { topic: t.id }) }, 'Topic test')));
    }))));
}

export function renderCommandWords(root, ctx) {
  const { content } = ctx;
  root.append(backLink('#/practice', 'Practise'),
    h('div', { class: 'page-head' }, h('h1', {}, 'Command words'),
      h('p', {}, 'The command word tells you what kind of answer earns the marks. In questions, it is highlighted like this: ', h('span', { class: 'cmd' }, 'Explain'), '.')));
  root.append(h('div', { class: 'sheet' }, h('ul', { class: 'list' }, content.commandWords.map((w) => {
    const key = w.word.toLowerCase().split(/[ /(]/)[0];
    const n = content.questions.filter((q) => q.pool === 'practice' && q.command === key).length;
    return h('li', { style: 'align-items:flex-start' },
      h('div', { class: 'grow' },
        h('b', { style: 'font-size:1.1rem' }, w.word),
        h('p', { style: 'margin:.2rem 0' }, w.meaning),
        h('p', { class: 'small muted', style: 'margin:0' }, 'Example: ', h('i', {}, w.example))),
      n >= 3 ? h('button', { class: 'btn small secondary', onclick: () => ctx.start('mixed', { command: key }) }, `Practise (${Math.min(n, 8)})`) : null);
  }))));
}

export function renderWriting(root, ctx, query) {
  const { content, state } = ctx;
  root.append(backLink('#/practice', 'Practise'),
    h('div', { class: 'page-head' }, h('h1', {}, 'Writing practice'),
      h('p', {}, 'Plan, write, then check your work against the success criteria. Writing is self-assessed here — if you can, ask a teacher or parent to read it too.')));
  root.append(h('div', { class: 'grid grid-2' }, content.writing.map((t) => {
    const done = state.writing.filter((w) => w.taskId === t.id);
    return h('div', { class: 'sheet tabbed subj-english' },
      h('p', { class: 'small muted', style: 'margin:0' }, `${t.type} · about ${t.minutes} minutes`),
      h('h3', {}, t.title),
      h('p', { class: 'small' }, t.prompt),
      done.length ? h('p', { class: 'small muted' }, `Written ${done.length} time${done.length > 1 ? 's' : ''}, last on ${formatDate(isoDate(new Date(done[done.length - 1].ts)))}`) : null,
      h('a', { class: 'btn small', href: `#/practice/writing/${t.id}${query.task ? `?task=${query.task}` : ''}` }, done.length ? 'Write again' : 'Start'));
  })));
}

export function renderWritingTask(root, ctx, id, query) {
  const { content } = ctx;
  const t = content.writing.find((x) => x.id === id);
  if (!t) { root.append(h('div', { class: 'empty' }, 'Task not found.')); return; }
  const draftKey = `checkpoint-prep:draft:${id}`;
  let draft = '';
  try { draft = localStorage.getItem(draftKey) || ''; } catch { /* ignore */ }
  const area = h('textarea', { id: 'w-text', 'aria-describedby': 'w-count' }, draft);
  const count = h('p', { id: 'w-count', class: 'small muted' });
  const updateCount = () => { const n = area.value.trim() ? area.value.trim().split(/\s+/).length : 0; count.textContent = `${n} words`; };
  area.addEventListener('input', () => { updateCount(); try { localStorage.setItem(draftKey, area.value); } catch { /* ignore */ } });
  updateCount();
  const checks = t.criteria.map((c) => h('input', { type: 'checkbox' }));
  const result = h('div', {});

  root.append(backLink('#/practice/writing', 'All writing tasks'),
    h('div', { class: 'page-head' }, h('p', { class: 'muted', style: 'margin:0' }, `${t.type} · ${t.purpose} · for ${t.audience}`), h('h1', {}, t.title)),
    h('div', { class: 'split' },
      h('div', {},
        h('p', { class: 'note', style: 'font-weight:700' }, t.prompt),
        h('div', { class: 'field' }, h('label', { for: 'w-text' }, `Your writing (aim for about ${t.minutes} minutes)`), area, count),
        h('h3', {}, 'Check your work'),
        h('p', { class: 'small muted' }, 'Tick only the criteria you can point to in your writing.'),
        h('div', {}, t.criteria.map((c, i) => h('label', { class: 'check' }, checks[i], h('span', {}, c)))),
        h('div', { class: 'btn-row', style: 'margin-top:1rem' },
          h('button', { class: 'btn', onclick: () => {
            if (area.value.trim().split(/\s+/).length < 40) { result.replaceChildren(h('p', { class: 'note' }, 'Write at least a few paragraphs before checking — around 150 words or more is a good target.')); return; }
            const ticked = checks.map((c) => c.checked);
            let fresh = [];
            ctx.store.update((s) => {
              s.writing.push({ id: uid('w'), taskId: t.id, text: area.value, checks: ticked, ts: Date.now() });
              if (query.task) completeTask(s, query.task, null);
              fresh = awardBadges(s, ctx.content);
            });
            try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
            const missing = t.criteria.filter((_, i) => !ticked[i]);
            result.replaceChildren(h('div', { class: 'feedback good' },
              h('h4', {}, `Saved. You met ${ticked.filter(Boolean).length} of ${t.criteria.length} success criteria.`),
              missing.length ? h('div', {}, h('p', { style: 'margin:0' }, 'Next time, focus on:'), h('ul', {}, missing.slice(0, 3).map((m) => h('li', {}, m)))) : h('p', {}, 'Every criterion met — excellent. Try a different text type next.'),
              h('a', { class: 'btn small', href: '#/' }, 'Back to today')));
            ctx.celebrate(fresh);
          } }, 'Save and check')),
        result),
      h('aside', {},
        h('div', { class: 'sheet' }, h('h3', {}, 'Plan first'), h('ol', {}, t.plan.map((p) => h('li', {}, p)))),
        h('details', { class: 'sheet', style: 'margin-top:1rem' }, h('summary', {}, 'See an example opening'), h('p', { style: 'white-space:pre-line;margin-top:.6rem' }, t.model)))));
}
