import { h, formatDate, isoDate } from '../core/util.js';
import { renderSetup } from './setup.js';
import { toast } from '../components/ui.js';

export function renderSettings(root, ctx) {
  const state = ctx.state;
  if (!state.profile) { renderSetup(root, ctx); return; }
  renderSetup(root, ctx);

  const garden = h('input', { type: 'checkbox', checked: state.profile.garden !== false });
  garden.addEventListener('change', () => { ctx.store.update((s) => { s.profile.garden = garden.checked; }); toast(garden.checked ? 'Progress garden turned on.' : 'Progress garden turned off.'); });

  const file = h('input', { type: 'file', accept: 'application/json,.json', class: 'sr-only', id: 'import-file' });
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    try { ctx.store.importJSON(await f.text()); toast('Progress restored from backup.'); ctx.go('#/'); }
    catch (e) { toast(`Could not restore: ${e.message}`); }
  });

  const confirmBox = h('div');
  root.append(
    h('section', { class: 'section sheet', style: 'max-width:620px' },
      h('h2', {}, 'Display'),
      h('label', { class: 'check' }, garden, h('span', {}, 'Show the progress garden (one plant per topic)'))),
    h('section', { class: 'section sheet', style: 'max-width:620px' },
      h('h2', {}, 'Your data'),
      h('p', { class: 'small muted' }, `Progress is stored in this browser on this device. ${state.attempts.length} answers and ${state.sessions.length} sessions saved since ${formatDate(state.profile.startDate)}. Download a backup regularly, especially before clearing your browser.`),
      h('div', { class: 'btn-row' },
        h('button', { class: 'btn', onclick: () => {
          const blob = new Blob([ctx.store.exportJSON()], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: `checkpoint-prep-backup-${isoDate()}.json` });
          document.body.append(a); a.click(); a.remove();
        } }, 'Download backup'),
        h('label', { class: 'btn secondary', for: 'import-file', tabindex: '0', onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') file.click(); } }, 'Restore from backup'), file),
      h('hr', { style: 'border:0;border-top:1px dashed var(--line);margin:1.2rem 0' }),
      h('button', { class: 'btn ghost', style: 'color:var(--bad)', onclick: () => {
        confirmBox.replaceChildren(h('div', { class: 'note' },
          h('p', {}, h('b', {}, 'Delete all progress?'), ' This removes every answer, plan and badge from this browser and cannot be undone. Download a backup first if you might want it later.'),
          h('div', { class: 'btn-row' },
            h('button', { class: 'btn', style: 'background:var(--bad);border-color:var(--bad)', onclick: () => { ctx.store.reset(); ctx.go('#/setup'); } }, 'Yes, delete everything'),
            h('button', { class: 'btn secondary', onclick: () => confirmBox.replaceChildren() }, 'Cancel'))));
      } }, 'Start again from scratch…'),
      confirmBox),
    h('section', { class: 'section', style: 'max-width:620px' },
      h('h2', {}, 'About'),
      h('p', { class: 'small muted' }, 'Topics follow the Cambridge Primary curriculum frameworks for Mathematics (0096), Science (0097) and English (0058). All questions, passages and lessons are original practice material, not Cambridge past papers. Cambridge Primary Checkpoint is a trademark of Cambridge University Press & Assessment, which is not affiliated with this site.')));
}
