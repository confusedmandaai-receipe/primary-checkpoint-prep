import { h, isoDate, addDays, daysBetween, formatDate } from '../core/util.js';

export function renderSetup(root, ctx) {
  const existing = ctx.state.profile;
  const today = isoDate();
  const defaultExam = existing?.examDate || addDays(today, 90);
  const name = h('input', { id: 'name', type: 'text', value: existing?.name || '', autocomplete: 'given-name', maxlength: 40, placeholder: 'e.g. Aanya' });
  const exam = h('input', { id: 'exam', type: 'date', value: defaultExam, min: addDays(today, 7) });
  const minutes = h('select', { id: 'mins' },
    [30, 40, 50, 60, 75].map((m) => h('option', { value: m, selected: (existing?.dailyMinutes || 50) === m }, `${m} minutes a day`)));
  const info = h('p', { class: 'small muted' });
  const updateInfo = () => {
    const d = daysBetween(today, exam.value);
    info.textContent = Number.isFinite(d) ? `${d} days of preparation until ${formatDate(exam.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.` : '';
  };
  exam.addEventListener('input', updateInfo);
  updateInfo();
  const err = h('p', { class: 'small', style: 'color:var(--bad)', role: 'alert' });

  const form = h('form', { class: 'sheet', style: 'max-width:620px' },
    h('div', { class: 'field' }, h('label', { for: 'name' }, 'Your first name'), name),
    h('div', { class: 'field' }, h('label', { for: 'exam' }, 'Checkpoint exam date'), exam, info,
      h('p', { class: 'small muted' }, 'Not sure yet? Keep 90 days from today — you can change it later in Settings.')),
    h('div', { class: 'field' }, h('label', { for: 'mins' }, 'Study time you can manage on a school day'), minutes,
      h('p', { class: 'small muted' }, 'Short, regular sessions work better than long, rare ones. Your daily plan will fit this time.')),
    err,
    h('button', { type: 'submit', class: 'btn' }, existing ? 'Save changes' : 'Create my plan'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!exam.value || daysBetween(today, exam.value) < 7) { err.textContent = 'Choose an exam date at least a week from today.'; return; }
    ctx.store.update((s) => {
      s.profile = {
        name: name.value.trim() || 'Student',
        examDate: exam.value,
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
      h('p', {}, existing ? 'Change your exam date or daily study time.' : 'Three quick questions. Then you’ll take a short diagnostic in each subject so the plan can focus on what you need.')),
    form,
    !existing ? h('div', { class: 'section' },
      h('h2', {}, 'How the 90 days work'),
      h('ol', {},
        h('li', {}, h('b', {}, 'Diagnose'), ' — short assessments in Maths, Science and English find your strengths and gaps.'),
        h('li', {}, h('b', {}, 'Understand'), ' — learn weak topics with clear explanations, worked examples and guided practice.'),
        h('li', {}, h('b', {}, 'Practise'), ' — Cambridge-style questions, command words and mixed-topic sets.'),
        h('li', {}, h('b', {}, 'Get ready'), ' — timed mock exams and targeted revision.')),
      h('p', { class: 'small muted' }, 'Your progress is saved in this browser only. Use Settings to download a backup.')) : null);
}
