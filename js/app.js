// App shell: loads content, owns the store, routes between views and runs sessions.
import { Store, LocalStorageAdapter, MemoryAdapter } from './core/store.js';
import { loadContent } from './core/content.js';
import { isoDate, h } from './core/util.js';
import { ensureTodayPlan, regenerateToday, completeTask, findTask, sessionFor, activeSubjects } from './engine/planner.js';
import { buildSession, recordSession, KINDS } from './engine/sessions.js';
import { awardBadges } from './engine/badges.js';
import { runQuiz } from './components/quiz.js';
import { toast } from './components/ui.js';

import { renderSetup } from './views/setup.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPlan } from './views/plan.js';
import { renderLearn, renderLesson } from './views/learn.js';
import { renderPractice, renderWriting, renderWritingTask, renderCommandWords } from './views/practice.js';
import { renderExams } from './views/exams.js';
import { renderResult } from './views/results.js';
import { renderProgress } from './views/progress.js';
import { renderReport } from './views/reports.js';
import { renderSettings } from './views/settings.js';
import { renderDiagnostic } from './views/diagnostic.js';

const ACTIVE_KEY = 'checkpoint-prep:active-session';

function storageWorks() {
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; } catch { return false; }
}

const store = new Store(storageWorks() ? new LocalStorageAdapter() : new MemoryAdapter());
const main = document.getElementById('main');
let content = null;
let activeQuiz = null;

export const active = {
  get() { try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)); } catch { return null; } },
  set(v) { try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(v)); } catch { /* memory only */ } },
  clear() { try { localStorage.removeItem(ACTIVE_KEY); } catch { /* ignore */ } },
};

const ctx = {
  store,
  get content() { return content; },
  get state() { return store.get(); },
  today: () => isoDate(),
  go(hash) { if (location.hash === hash) route(); else location.hash = hash; },
  refresh: () => route(),
  /** Build a session and open it. opts may include taskId. */
  start(kind, opts = {}) {
    const current = active.get();
    if (current && current.spec.kind === 'mock' && kind !== 'mock') {
      toast('You have a mock exam in progress. Finish or discard it first.');
      return ctx.go('#/quiz');
    }
    const act = store.get().profile ? activeSubjects(store.get().profile, isoDate()) : [];
    const subjects = ['mixed', 'mini', 'weekly', 'review'].includes(kind) && !opts.subject && act.length ? act : undefined;
    const spec = buildSession(kind, { subjects, ...opts, today: isoDate() }, store.get(), content);
    if (!spec.questions.length) {
      toast(kind === 'review' ? 'No mistakes to review yet — great!' : 'No questions available for this yet.');
      return;
    }
    active.set({ spec, quiz: null });
    ctx.go('#/quiz');
  },
  startTask(taskId) {
    const f = findTask(store.get(), taskId);
    if (!f) return;
    const t = f.task;
    if (t.type === 'lesson') return ctx.go(`#/learn/${t.topic}?task=${t.id}`);
    if (t.type === 'writing') return ctx.go(`#/practice/writing?task=${t.id}`);
    if (t.type === 'rest') return;
    const s = sessionFor(t);
    if (s) ctx.start(s[0], { ...s[1], taskId: t.id });
  },
  completeTask(taskId, sessionId) {
    store.update((s) => completeTask(s, taskId, sessionId));
  },
  celebrate(fresh) {
    if (!fresh?.length) return;
    const b = fresh[0];
    toast(`${b.icon} <b>${b.name}</b><br>${b.desc}${fresh.length > 1 ? `<br>+${fresh.length - 1} more on your Progress page` : ''}`, 6000);
  },
};

function finishSession(spec, results, meta) {
  let session;
  let fresh = [];
  store.update((s) => {
    session = recordSession(s, spec, results, { startedAt: meta.startedAt, content });
    if (spec.taskId) completeTask(s, spec.taskId, session.id);
    if (spec.kind === 'lesson' && spec.topic) s.lessonsDone[spec.topic] = Date.now();
    if (spec.kind === 'diagnostic') regenerateToday(s, content, isoDate());
    fresh = awardBadges(s, content);
  });
  active.clear();
  ctx.go(`#/result/${session.id}`);
  setTimeout(() => ctx.celebrate(fresh), 400);
}

function renderQuiz() {
  const a = active.get();
  if (!a) { main.innerHTML = ''; main.append(h('div', { class: 'empty' }, 'No activity in progress. ', h('a', { href: '#/' }, 'Back to today'))); return; }
  activeQuiz = runQuiz(main, {
    spec: a.spec,
    content,
    kindInfo: KINDS[a.spec.kind],
    resume: a.quiz,
    onSave: (q) => active.set({ spec: a.spec, quiz: q }),
    onFinish: (results, meta) => finishSession(a.spec, results, meta),
    onExit: (q) => {
      if (a.spec.mode === 'exam') { active.set({ spec: a.spec, quiz: q }); toast('Saved. You can carry on from Today.'); }
      else active.clear();
      ctx.go('#/');
    },
  });
}

const ROUTES = [
  [/^$/, () => renderDashboard(main, ctx)],
  [/^setup$/, () => renderSetup(main, ctx)],
  [/^diagnostic$/, () => renderDiagnostic(main, ctx)],
  [/^plan$/, () => renderPlan(main, ctx)],
  [/^learn$/, (m, q) => renderLearn(main, ctx, q)],
  [/^learn\/([\w-]+)$/, (m, q) => renderLesson(main, ctx, m[1], q)],
  [/^practice$/, (m, q) => renderPractice(main, ctx, q)],
  [/^practice\/writing$/, (m, q) => renderWriting(main, ctx, q)],
  [/^practice\/writing\/([\w-]+)$/, (m, q) => renderWritingTask(main, ctx, m[1], q)],
  [/^practice\/command-words$/, () => renderCommandWords(main, ctx)],
  [/^exams$/, () => renderExams(main, ctx)],
  [/^quiz$/, () => renderQuiz()],
  [/^result\/([\w-]+)$/, (m) => renderResult(main, ctx, m[1])],
  [/^progress$/, (m, q) => renderProgress(main, ctx, q)],
  [/^reports$/, (m, q) => renderReport(main, ctx, q)],
  [/^settings$/, () => renderSettings(main, ctx)],
];

function route() {
  activeQuiz?.destroy();
  activeQuiz = null;
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  const state = store.get();
  if (!state.profile && path !== 'setup' && path !== 'settings') { location.hash = '#/setup'; return; }
  if (state.profile) {
    const before = JSON.stringify(state.plans[isoDate()] || null);
    ensureTodayPlan(state, content, isoDate());
    if (JSON.stringify(state.plans[isoDate()]) !== before) store.update(() => {});
  }
  document.querySelectorAll('#nav a').forEach((a) => {
    const r = a.dataset.route;
    const on = r === '' ? path === '' : path === r || path.startsWith(r + '/');
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  main.innerHTML = '';
  for (const [re, fn] of ROUTES) {
    const m = path.match(re);
    if (m) {
      try { fn(m, query); } catch (e) { console.error(e); main.append(h('div', { class: 'empty' }, 'Something went wrong showing this page. ', h('a', { href: '#/' }, 'Back to today'))); }
      if (path !== 'quiz') window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
      if (!store.saveOk) toast('Progress could not be saved in this browser. Use Settings → Download backup.');
      return;
    }
  }
  main.append(h('div', { class: 'empty' }, 'Page not found. ', h('a', { href: '#/' }, 'Back to today')));
}

async function boot() {
  try {
    content = await loadContent();
  } catch (e) {
    main.innerHTML = '';
    main.append(h('div', { class: 'empty' },
      h('h2', {}, 'The study content could not be loaded'),
      h('p', {}, 'If you opened index.html directly from your computer, run a small local server instead (see README), or use the GitHub Pages link.'),
      h('p', { class: 'small muted' }, String(e.message))));
    return;
  }
  window.addEventListener('hashchange', route);
  route();
}

boot();
