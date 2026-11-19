// Persistence layer. All progress lives in one versioned state object.
// The adapter is the only thing that touches storage, so a backend can be
// added later by writing a RemoteAdapter with the same load/save interface.

import { isoDate } from './util.js';

export const STATE_VERSION = 1;
const KEY = 'checkpoint-prep:v1';

export function emptyState() {
  return {
    version: STATE_VERSION,
    profile: null, // {name, examDate, startDate, dailyMinutes, garden, createdAt}
    attempts: [], // {qid, s, t, sk, cw, ok, hint, ns, mode, ts, mis, sid}
    sessions: [], // {id, kind, title, subject, topic, startedAt, finishedAt, score, total, durationSec, timeLimitSec, results:[{qid, ok, resp, ns}]}
    diagnostics: {}, // subject -> {sessionId, completedAt}
    srs: { questions: {}, topics: {} },
    plans: {}, // date -> {generatedAt, stage, tasks:[...]}
    backlog: [], // rescheduled tasks
    lessonsDone: {}, // topicId -> ts
    writing: [], // {id, taskId, text, checks:[bool], ts}
    badges: {}, // badgeId -> {awardedAt}
    weeklyFocus: {}, // weekIndex -> [topicIds]
    stats: { mistakesCorrected: 0 },
  };
}

export class LocalStorageAdapter {
  constructor(key = KEY) {
    this.key = key;
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Could not read saved progress', e);
      return null;
    }
  }
  save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Could not save progress', e);
      return false;
    }
  }
  clear() {
    try { localStorage.removeItem(this.key); } catch { /* ignore */ }
  }
}

/** In-memory adapter: used by tests and as a fallback when storage is blocked. */
export class MemoryAdapter {
  constructor(initial = null) { this.data = initial; }
  load() { return this.data ? JSON.parse(JSON.stringify(this.data)) : null; }
  save(state) { this.data = JSON.parse(JSON.stringify(state)); return true; }
  clear() { this.data = null; }
}

export function migrate(state) {
  if (!state || typeof state !== 'object') return emptyState();
  const base = emptyState();
  // Fill any missing top-level keys so older saves keep working.
  for (const k of Object.keys(base)) if (state[k] === undefined) state[k] = base[k];
  if (!state.srs.questions) state.srs.questions = {};
  if (!state.srs.topics) state.srs.topics = {};
  state.version = STATE_VERSION;
  return state;
}

export class Store {
  constructor(adapter) {
    this.adapter = adapter;
    this.state = migrate(adapter.load());
    this.listeners = new Set();
    this.saveOk = true;
  }
  get() { return this.state; }
  /** Mutate state through a function, then persist once. */
  update(fn) {
    fn(this.state);
    this.saveOk = this.adapter.save(this.state);
    for (const l of this.listeners) l(this.state);
  }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  exportJSON() {
    return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'checkpoint-prep', state: this.state }, null, 1);
  }
  importJSON(text) {
    const parsed = JSON.parse(text);
    const incoming = parsed.state || parsed;
    if (!incoming || !Array.isArray(incoming.attempts)) throw new Error('This file does not look like a progress backup.');
    this.state = migrate(incoming);
    this.adapter.save(this.state);
    for (const l of this.listeners) l(this.state);
  }
  reset() {
    this.adapter.clear();
    this.state = emptyState();
    this.adapter.save(this.state);
    for (const l of this.listeners) l(this.state);
  }
}

export function today() { return isoDate(); }
