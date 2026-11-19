// The quiz runner used by every activity.
// mode 'feedback': one question at a time with hints and instant explanations.
// mode 'exam': answers held until the end, navigator, flags, optional timer.

import { h, esc } from '../core/util.js';
import { mark, answerText } from '../engine/marking.js';
import { renderVisual, renderPassage, subjectChip } from './ui.js';

const LETTERS = 'ABCDEFGH';
const PRAISE = ['That’s right.', 'Correct — well reasoned.', 'Yes, exactly.', 'Spot on.', 'Correct.'];
const ENCOURAGE = ['Not quite — let’s look at why.', 'Close. Here’s how to get there.', 'Good try. Read the explanation, then you’ll have it.', 'Not this time — this is how it works.'];

function highlightCommand(prompt, command) {
  const safe = esc(prompt);
  if (!command) return safe;
  const word = command.split(/[ /(]/)[0];
  const re = new RegExp(`\\b(${word})\\b`, 'i');
  return safe.replace(re, '<span class="cmd">$1</span>');
}

/**
 * runQuiz(root, {spec, content, kindInfo, resume, onSave, onFinish, onExit})
 * onFinish(results, {startedAt}) with results = [{qid, resp, ok, hint, ns, mis, flag}]
 */
export function runQuiz(root, opts) {
  const { spec, content, kindInfo } = opts;
  const qs = spec.questions.map((id) => content.qById[id]).filter(Boolean);
  const exam = spec.mode === 'exam';
  const st = opts.resume || {
    idx: 0,
    startedAt: Date.now(),
    answers: qs.map(() => ({ resp: null, checked: false, ok: false, hint: false, ns: false, flag: false, mis: null })),
  };
  let timerId = null;
  let finished = false;

  const save = () => opts.onSave?.(st);

  function remainingSec() {
    if (!spec.timeLimitSec) return null;
    return Math.max(0, spec.timeLimitSec - Math.floor((Date.now() - st.startedAt) / 1000));
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timerId);
    const results = qs.map((q, i) => {
      const a = st.answers[i];
      const m = a.ns ? { ok: false } : mark(q, a.resp);
      return { qid: q.id, resp: a.resp, ok: m.ok, hint: a.hint, ns: a.ns, mis: m.misconception, flag: a.flag };
    });
    opts.onFinish(results, { startedAt: st.startedAt });
  }

  function answeredCount() {
    return st.answers.filter((a) => a.ns || (a.resp != null && a.resp !== '' && !(Array.isArray(a.resp) && !a.resp.length))).length;
  }

  function inputFor(q, a, locked) {
    if (q.type === 'mcq' || q.type === 'multi') {
      const multi = q.type === 'multi';
      const box = h('div', { class: 'options', role: multi ? 'group' : 'radiogroup', 'aria-label': 'Answer options' });
      q.options.forEach((opt, i) => {
        const selected = multi ? (a.resp || []).includes(i) : a.resp === i;
        let cls = 'option';
        if (selected) cls += ' selected';
        if (locked) {
          const correct = multi ? q.answer.includes(i) : q.answer === i;
          if (correct) cls += ' correct';
          else if (selected) cls += ' wrong';
        }
        box.append(h('button', {
          type: 'button', class: cls, disabled: locked, role: multi ? 'checkbox' : 'radio', 'aria-checked': selected ? 'true' : 'false',
          onclick: () => {
            if (multi) {
              const set = new Set(a.resp || []);
              set.has(i) ? set.delete(i) : set.add(i);
              a.resp = [...set].sort();
            } else a.resp = i;
            a.ns = false;
            save();
            render();
          },
        }, h('span', { class: 'letter' }, LETTERS[i]), h('span', {}, opt)));
      });
      if (multi) box.prepend(h('p', { class: 'small muted' }, 'Select all that apply.'));
      return box;
    }
    const input = h('input', {
      class: 'answer-input', type: 'text', inputmode: q.type === 'numeric' ? 'decimal' : 'text', autocomplete: 'off', spellcheck: 'false',
      'aria-label': 'Your answer', value: a.resp ?? '', disabled: locked,
      placeholder: q.type === 'numeric' ? 'Type a number' : 'Type your answer',
    });
    input.addEventListener('input', () => { a.resp = input.value; a.ns = false; save(); if (exam) updateNavigator(); else updateCheckBtn(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); primaryAction(); } });
    setTimeout(() => !locked && input.focus({ preventScroll: true }), 0);
    return h('div', { class: 'input-row' }, input, q.unit && q.unit !== '$' ? h('span', { class: 'unit' }, q.unit) : null);
  }

  let checkBtn = null;
  let primaryAction = () => {};
  function updateCheckBtn() {
    if (!checkBtn) return;
    const a = st.answers[st.idx];
    checkBtn.disabled = a.resp == null || a.resp === '' || (Array.isArray(a.resp) && !a.resp.length);
  }

  let navEl = null;
  function updateNavigator() {
    if (!navEl) return;
    [...navEl.children].forEach((b, i) => {
      const a = st.answers[i];
      b.className = [a.ns || (a.resp != null && a.resp !== '') ? 'answered' : '', i === st.idx ? 'current' : '', a.flag ? 'flagged' : ''].join(' ');
    });
  }

  function feedbackPanel(q, a) {
    const good = a.ok;
    const panel = h('div', { class: `feedback ${good ? 'good' : 'bad'}`, role: 'status' });
    const msgs = good ? PRAISE : ENCOURAGE;
    panel.append(h('h4', {}, msgs[(q.id.length + st.idx) % msgs.length]));
    if (!good) {
      panel.append(h('p', {}, h('b', {}, 'Correct answer: '), answerText(q)));
      if (a.mis) panel.append(h('p', {}, h('b', {}, 'Likely slip: '), a.mis));
    }
    if (q.steps) panel.append(h('ol', {}, q.steps.map((s) => h('li', {}, s))));
    panel.append(h('p', { style: 'margin:0' }, q.explanation));
    if (good && a.hint) panel.append(h('p', { class: 'small muted', style: 'margin:.4rem 0 0' }, 'You used a hint, so this counts as half towards mastery. Try the next one without!'));
    return panel;
  }

  function render() {
    root.innerHTML = '';
    const q = qs[st.idx];
    const a = st.answers[st.idx];
    const total = qs.length;
    const wrap = h('div', { class: 'quiz' });

    const timer = h('span', { class: 'timer', 'aria-live': 'off' });
    const top = h('div', { class: 'quiz-top' },
      h('h1', {}, spec.title),
      exam && spec.timeLimitSec ? timer : null,
      h('span', { class: 'chip' }, `${st.idx + 1} / ${total}`),
      h('button', { type: 'button', class: 'btn ghost small', onclick: () => opts.onExit?.(st) }, exam ? 'Save & leave' : 'Leave'));
    wrap.append(top);
    wrap.append(h('div', { class: 'progress-line' }, h('span', { style: `width:${((exam ? answeredCount() : st.idx + (a.checked ? 1 : 0)) / total) * 100}%` })));

    if (exam && spec.kind === 'diagnostic' && st.idx === 0 && !a.resp) {
      wrap.append(h('div', { class: 'note info', style: 'margin-bottom:1rem' }, 'This is not a test you pass or fail. It shows what you already know so your plan can focus on the right topics. If you have not learned something yet, choose “I haven’t learned this yet” rather than guessing.'));
    }
    if (exam && spec.kind === 'mock' && st.idx === 0 && answeredCount() === 0) {
      wrap.append(h('div', { class: 'note info', style: 'margin-bottom:1rem' }, 'Exam conditions: no hints and no feedback until you finish. Use the numbered boxes to move between questions and flag any you want to come back to. The timer keeps running if you leave.'));
    }

    const passage = q.passage ? content.passages[q.passage] : null;
    const layout = h('div', { class: `q-layout${passage ? ' with-passage' : ''}` });
    if (passage) layout.append(renderPassage(passage));

    const card = h('section', { class: 'q-card', 'aria-labelledby': 'qprompt' });
    card.append(h('div', { class: 'q-meta' },
      subjectChip(content, q.subject),
      h('span', { class: 'chip' }, content.topics[q.topic].name),
      q.marks > 1 ? h('span', { class: 'chip' }, `${q.marks} marks`) : null));
    card.append(h('div', { class: 'q-prompt', id: 'qprompt', html: highlightCommand(q.prompt, q.command) }));
    if (q.stimulus) card.append(renderVisual(q.stimulus));

    const locked = !exam && a.checked;
    if (exam && a.ns) card.append(h('p', { class: 'note' }, 'Marked as “not learned yet”. You can still choose an answer.'));
    card.append(inputFor(q, a, locked));

    if (!exam && a.hintShown && q.hint && !a.checked) card.append(h('div', { class: 'hint-box' }, h('b', {}, 'Hint: '), q.hint));
    if (locked) card.append(feedbackPanel(q, a));

    const actions = h('div', { class: 'q-actions' });
    if (exam) {
      const left = h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn secondary small', disabled: st.idx === 0, onclick: () => { st.idx--; save(); render(); } }, '‹ Previous'),
        spec.kind === 'mock' || spec.kind === 'weekly' || spec.kind === 'topictest'
          ? h('button', { type: 'button', class: 'btn ghost small', 'aria-pressed': a.flag ? 'true' : 'false', onclick: () => { a.flag = !a.flag; save(); render(); } }, a.flag ? '⚑ Flagged' : '⚐ Flag for review')
          : null,
        kindInfo?.notSure ? h('button', { type: 'button', class: 'btn ghost small', onclick: () => { a.ns = true; a.resp = null; save(); goNext(); } }, 'I haven’t learned this yet') : null);
      const isLast = st.idx === total - 1;
      const right = h('button', { type: 'button', class: `btn${isLast ? ' highlight' : ''}`, onclick: () => (isLast ? confirmFinish() : goNext()) }, isLast ? 'Finish' : 'Next ›');
      primaryAction = () => (isLast ? confirmFinish() : goNext());
      actions.append(left, right);
    } else if (!a.checked) {
      const hintBtn = q.hint && kindInfo?.hints && !a.hintShown
        ? h('button', { type: 'button', class: 'btn ghost small', onclick: () => { a.hintShown = true; a.hint = true; save(); render(); } }, '💡 Show a hint')
        : h('span');
      checkBtn = h('button', { type: 'button', class: 'btn', onclick: check }, 'Check answer');
      primaryAction = check;
      actions.append(hintBtn, checkBtn);
      updateCheckBtn();
    } else {
      const isLast = st.idx === total - 1;
      const next = h('button', { type: 'button', class: `btn${isLast ? ' highlight' : ''}`, onclick: () => (isLast ? finish() : (st.idx++, save(), render())) }, isLast ? 'See results' : 'Next question ›');
      primaryAction = () => next.click();
      actions.append(h('span', { class: 'small muted' }, a.ok ? '' : 'This question will come back in your mistakes review.'), next);
      setTimeout(() => next.focus({ preventScroll: true }), 0);
    }
    card.append(actions);
    layout.append(card);
    wrap.append(layout);

    if (exam) {
      navEl = h('div', { class: 'navigator', 'aria-label': 'Question navigator' },
        qs.map((_, i) => h('button', { type: 'button', 'aria-label': `Question ${i + 1}`, onclick: () => { st.idx = i; save(); render(); } }, String(i + 1))));
      wrap.append(navEl);
      updateNavigator();
    }
    root.append(wrap);

    if (exam && spec.timeLimitSec) {
      const tick = () => {
        const r = remainingSec();
        timer.textContent = `⏱ ${fmtTime(r)}`;
        timer.classList.toggle('low', r <= 300);
        timer.setAttribute('aria-label', `${Math.ceil(r / 60)} minutes left`);
        if (r <= 0) finish();
      };
      clearInterval(timerId);
      tick();
      timerId = setInterval(tick, 1000);
    }
  }

  function goNext() {
    if (st.idx < qs.length - 1) st.idx++;
    save();
    render();
  }

  function confirmFinish() {
    const unanswered = qs.length - answeredCount();
    const flagged = st.answers.filter((x) => x.flag).length;
    if (!unanswered && !flagged) return finish();
    root.querySelector('.confirm-finish')?.remove();
    const box = h('div', { class: 'note confirm-finish', role: 'alertdialog', 'aria-live': 'assertive', style: 'margin-top:1rem' },
      h('p', {}, [unanswered ? `${unanswered} question${unanswered > 1 ? 's are' : ' is'} unanswered. ` : '', flagged ? `${flagged} flagged for review. ` : '', 'Finish anyway?'].join('')),
      h('div', { class: 'btn-row' },
        h('button', { type: 'button', class: 'btn', onclick: finish }, 'Finish and see results'),
        h('button', { type: 'button', class: 'btn secondary', onclick: () => { const i = st.answers.findIndex((x) => x.flag || x.resp == null || x.resp === ''); st.idx = Math.max(0, i); render(); } }, 'Go back')));
    root.querySelector('.quiz').append(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function check() {
    const q = qs[st.idx];
    const a = st.answers[st.idx];
    if (a.resp == null || a.resp === '') return;
    const m = mark(q, a.resp);
    a.checked = true;
    a.ok = m.ok;
    a.mis = m.misconception || null;
    save();
    render();
  }

  render();
  return { destroy() { clearInterval(timerId); } };
}
