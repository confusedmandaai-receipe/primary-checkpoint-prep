import { h, minutesLabel } from '../core/util.js';
import { subjectChip } from './ui.js';
import { postponeTask, swapTask } from '../engine/planner.js';
import { toast } from './ui.js';

export const TASK_ICON = { diagnostic: '🧭', lesson: '📘', practice: '✏️', examstyle: '🎯', mixed: '🔀', review: '🔧', writing: '✍️', weekly: '📊', mock: '📝', mini: '⚡', rest: '🌙' };

export function taskList(ctx, tasks, { allowPostpone = true, highlightNext = true } = {}) {
  const ul = h('ol', { class: 'tasks' });
  const nextId = highlightNext ? tasks.find((t) => t.status === 'todo' && !t.optional && t.type !== 'rest')?.id : null;
  for (const t of tasks) {
    const cls = ['task', t.status, t.optional ? 'optional' : '', t.id === nextId ? 'next' : ''].join(' ');
    const meta = h('div', { class: 't-meta' },
      t.subject ? subjectChip(ctx.content, t.subject) : null,
      t.minutes ? h('span', {}, `⏱ ${minutesLabel(t.minutes)}`) : null,
      h('span', {}, t.why),
      t.optional ? h('span', { class: 'chip' }, 'Optional') : null,
      t.origin === 'rescheduled' ? h('span', { class: 'chip' }, 'Rescheduled') : null,
      t.warmup ? h('span', { class: 'chip strong' }, 'Quick win') : null,
      t.status === 'moved' ? h('span', { class: 'chip' }, 'Moved to another day') : null);
    const actions = h('div', { class: 'task-actions' });
    if (t.status === 'todo' && t.type !== 'rest') {
      actions.append(h('button', { type: 'button', class: `btn small${t.id === nextId ? '' : ' secondary'}`, onclick: () => ctx.startTask(t.id) }, 'Start'));
      if (t.topic && !t.warmup && ['lesson', 'practice', 'examstyle'].includes(t.type)) {
        actions.append(h('button', { type: 'button', class: 'btn ghost small', title: 'Choose a different topic you need instead', onclick: () => {
          let n = null;
          ctx.store.update((s) => { n = swapTask(s, ctx.content, t.id); });
          if (n) toast(`Swapped to <b>${n.title.replace(/</g, '&lt;')}</b>`); else toast('No other topic to swap to today.');
          ctx.refresh();
        } }, 'Swap topic'));
      }
      if (allowPostpone && !t.optional && !['diagnostic', 'mini'].includes(t.type)) {
        actions.append(h('button', { type: 'button', class: 'btn ghost small', title: 'Move this to another day', onclick: () => { ctx.store.update((s) => postponeTask(s, t.id)); ctx.refresh(); } }, 'Later'));
      }
    } else if (t.status === 'done' && t.sessionId) {
      actions.append(h('a', { class: 'btn ghost small', href: `#/result/${t.sessionId}` }, 'Review'));
    }
    ul.append(h('li', { class: cls },
      h('span', { class: 'tick', 'aria-hidden': 'true' }),
      h('div', {}, h('div', { class: 't-title' }, `${TASK_ICON[t.type] || ''} ${t.title}`), meta),
      actions));
  }
  return ul;
}
