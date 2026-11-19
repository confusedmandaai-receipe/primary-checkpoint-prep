import { h, isoDate, addDays, daysBetween, formatDate } from '../core/util.js';
import { examDates } from '../engine/planner.js';

const SUBJECTS = [['maths', 'Mathematics (0096)'], ['science', 'Science (0097)'], ['english', 'English (0058)']];

export function renderSetup(root, ctx) {
  const existing = ctx.state.profile;
  const today = isoDate();
  const current = existing ? examDates(existing) : { maths: addDays(today, 90), science: addDays(today, 90), english: addDays(today, 90) };
  const name = h('input', { id: 'name', type: 'text', value: existing?.name || '', autocomplete: 'given-name', maxlength: 40, placeholder: 'e.g. Aanya' });
  // Dates already saved stay valid even once they are close or past (e.g. between exams).
  const dates = Object.fromEntries(SUBJECTS.map(([id]) => [id, h('input', { id: `exam-${id}`, type: 'date', value: current[id], min: existing && current[id] < addDays(today, 7) ? current[id] : addDays(today, 7) })]));
  const minutes = h('select', { id: 'mins' },
    [30, 40, 50, 60, 75].map((m) => h('option', { value: m, selected: (existing?.dailyMinutes || 50) === m }, `${m} minutes a day`)));
  const info = h('p', { class: 'small muted' });
  const updateInfo = () => {
    const vals = Object.values(dates).map((d) => d.value).filter(Boolean).sort();
    if (!vals.length) { info.textContent = ''; return; }
    const upcoming = vals.filter((v) => v >= today);
    if (!upcoming.length) { info.textContent = 'All exam dates have passed.'; return; }
    const first = upcoming[0], last = vals[vals.length - 1];
    info.textContent = vals[0] < today ? `Next exam in ${daysBetween(today, first)} days (${formatDate(first, { day: 'numeric', month: 'long' })}); the last is on ${formatDate(last, { day: 'numeric', month: 'long', year: 'numeric' })}.` : first === last
      ? `${daysBetween(today, first)} days of preparation until ${formatDate(first, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`
      : `${daysBetween(today, first)} days until your first exam (${formatDate(first, { day: 'numeric', month: 'long' })}); the last is on ${formatDate(last, { day: 'numeric', month: 'long', year: 'numeric' })}.`;
  };
  Object.values(dates).forEach((d) => d.addEventListener('input', updateInfo));
  updateInfo();
  const err = h('p', { class: 'small', style: 'color:var(--bad)', role: 'alert' });

  const form = h('form', { class: 'sheet', style: 'max-width:620px' },
    h('div', { class: 'field' }, h('label', { for: 'name' }, 'Your first name'), name),
    h('fieldset', { class: 'field', style: 'border:0;padding:0;margin:0 0 1rem' },
      h('legend', { style: 'font-weight:700;margin-bottom:.4rem' }, 'Checkpoint exam dates'),
      SUBJECTS.map(([id, label]) => h('div', { style: 'display:grid;grid-template-columns:minmax(150px,auto) 1fr;gap:.6rem;align-items:center;margin-bottom:.5rem' },
        h('label', { for: `exam-${id}` }, label), dates[id])),
      info,
      h('p', { class: 'small muted' }, 'Use the dates on your exam timetable. Not sure yet? Keep 90 days from today — you can change them later in Settings.')),
    h('div', { class: 'field' }, h('label', { for: 'mins' }, 'Study time you can manage on a school day'), minutes,
      h('p', { class: 'small muted' }, 'Short, regular sessions work better than long, rare ones. Your daily plan will fit this time.')),
    err,
    h('button', { type: 'submit', class: 'btn' }, existing ? 'Save changes' : 'Create my plan'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const vals = Object.fromEntries(Object.entries(dates).map(([k, el]) => [k, el.value]));
    if (Object.values(vals).some((v) => !v)) { err.textContent = 'Enter an exam date for each subject.'; return; }
    const changedTooSoon = Object.entries(vals).some(([k, v]) => v !== current[k] && daysBetween(today, v) < 7);
    if (!existing && Object.values(vals).some((v) => daysBetween(today, v) < 7)) { err.textContent = 'Each exam date must be at least a week from today.'; return; }
    if (existing && changedTooSoon) { err.textContent = 'A changed exam date must be at least a week from today.'; return; }
    ctx.store.update((s) => {
      s.profile = {
        name: name.value.trim() || 'Student',
        examDates: vals,
        examDate: Object.values(vals).sort().pop(),
        startDate: existing?.startDate || today,
        dailyMinutes: Number(minutes.value),
        garden: existing?.garden ?? true,
        createdAt: existing?.createdAt || Date.now(),
      };
      // Plans depend on the dates, so rebuild today's.
      delete s.plans[today];
    });
    ctx.go('#/');
  });

  root.append(
    h('div', { class: 'page-head' },
      h('h1', {}, existing ? 'Your plan settings' : 'Let’s set up your 90-day plan'),
      h('p', {}, existing ? 'Change your exam dates or daily study time.' : 'A few quick questions. Then you’ll take a short diagnostic in each subject so the plan can focus on what you need.')),
    form,
    !existing ? h('div', { class: 'section' },
      h('h2', {}, 'How the plan works'),
      h('ol', {},
        h('li', {}, h('b', {}, 'Diagnose'), ' — short assessments in Maths, Science and English find your strengths and gaps.'),
        h('li', {}, h('b', {}, 'Understand'), ' — learn weak topics with clear explanations, worked examples and guided practice.'),
        h('li', {}, h('b', {}, 'Practise'), ' — Cambridge-style questions, command words and mixed-topic sets.'),
        h('li', {}, h('b', {}, 'Get ready'), ' — timed mock exams and targeted revision, with each subject’s revision ending on its own exam day.')),
      h('p', { class: 'small muted' }, 'Your progress is saved in this browser only. Use Settings to download a backup.')) : null);
}
