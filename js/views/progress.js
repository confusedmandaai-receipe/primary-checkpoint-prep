import { h, pct, formatDate, isoDate } from '../core/util.js';
import { overview, readiness, weekIndex } from '../engine/analytics.js';
import { MILESTONES, growthStage, topicBadgeEarned } from '../engine/badges.js';
import { ring, progressBar, subjClass, categoryChip } from '../components/ui.js';

const TABS = [['overview', 'Learning journey'], ['badges', 'Badges'], ['garden', 'Progress garden']];

function plantSvg(stage, color) {
  const stem = ['', '<line x1="32" y1="66" x2="32" y2="56" stroke="#3f7d4f" stroke-width="3"/>',
    '<line x1="32" y1="66" x2="32" y2="44" stroke="#3f7d4f" stroke-width="3"/><ellipse cx="25" cy="50" rx="7" ry="4" fill="#5aa368"/>',
    '<line x1="32" y1="66" x2="32" y2="30" stroke="#3f7d4f" stroke-width="3"/><ellipse cx="24" cy="48" rx="8" ry="4" fill="#5aa368"/><ellipse cx="40" cy="40" rx="8" ry="4" fill="#5aa368"/>',
    `<line x1="32" y1="66" x2="32" y2="24" stroke="#3f7d4f" stroke-width="3"/><ellipse cx="24" cy="50" rx="8" ry="4" fill="#5aa368"/><ellipse cx="40" cy="42" rx="8" ry="4" fill="#5aa368"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${32 + 7 * Math.cos((a * Math.PI) / 180)}" cy="${18 + 7 * Math.sin((a * Math.PI) / 180)}" rx="6" ry="6" fill="${color}" opacity=".85"/>`).join('')}<circle cx="32" cy="18" r="4.5" fill="#ffe26a"/>`][stage];
  const seed = stage === 0 ? '<ellipse cx="32" cy="64" rx="4" ry="2.5" fill="#8a6b45"/>' : '';
  return `<svg viewBox="0 0 64 72" aria-hidden="true">${stem}${seed}<rect x="14" y="64" width="36" height="8" rx="2" fill="#b98b5e"/></svg>`;
}

export function renderProgress(root, ctx, query) {
  const { state, content } = ctx;
  const tab = query.tab || 'overview';
  const ov = overview(state, content);
  const rd = readiness(state, content);
  const wk = weekIndex(state.profile.startDate, ctx.today());

  root.append(h('div', { class: 'page-head' }, h('h1', {}, 'Progress'),
    h('p', {}, 'How far you’ve come, topic by topic. There are no rankings here — the only comparison is with your own earlier work.')));

  root.append(h('section', { class: 'grid grid-2' },
    h('div', { class: 'sheet' }, h('h3', {}, 'Exam readiness'),
      h('div', { class: 'readiness' }, ring(rd.score), h('div', {}, h('b', {}, rd.label), h('p', { class: 'small muted', style: 'margin:.2rem 0 0' }, `${rd.mocksTaken} of 3 subjects have a mock result.`))),
      h('div', { style: 'display:grid;gap:.6rem;margin-top:1rem' }, rd.parts.map((p) => p.value == null
        ? h('p', { class: 'small muted', style: 'margin:0' }, `${p.label}: not enough evidence yet`)
        : progressBar(p.value, { label: p.label })))),
    h('div', { class: 'sheet' }, h('h3', {}, 'Weekly reports'),
      h('p', { class: 'small muted' }, 'Questions attempted, accuracy, topic results, repeated mistakes and what to revise next.'),
      h('div', { class: 'btn-row' },
        wk > 0 ? h('a', { class: 'btn', href: `#/reports?week=${wk - 1}` }, `Week ${wk} report`) : null,
        h('a', { class: `btn ${wk > 0 ? 'secondary' : ''}`, href: `#/reports?week=${wk}` }, 'This week so far')))));

  const tabs = h('div', { class: 'seg', role: 'tablist', style: 'margin:1.5rem 0 1rem' });
  for (const [id, label] of TABS) {
    if (id === 'garden' && state.profile.garden === false) continue;
    tabs.append(h('button', { type: 'button', role: 'tab', 'aria-selected': id === tab ? 'true' : 'false', 'aria-pressed': id === tab ? 'true' : 'false', onclick: () => ctx.go(`#/progress?tab=${id}`) }, label));
  }
  root.append(tabs);

  if (tab === 'overview') {
    for (const s of content.subjects) {
      const sp = ov.subjects[s.id];
      root.append(h('section', { class: `sheet tabbed ${subjClass(s.id)}`, style: 'margin-bottom:1rem' },
        h('div', { style: 'display:flex;justify-content:space-between;gap:1rem;align-items:center;flex-wrap:wrap' },
          h('h3', { style: 'margin:0' }, `${s.icon} ${s.name}`),
          h('span', { class: 'small muted' }, `${sp.counts.strong} strong · ${sp.counts.developing} developing · ${sp.counts.attention} need attention · ${sp.counts.untested} not assessed`)),
        h('div', { style: 'margin:.8rem 0' }, progressBar(sp.score, { subject: s.id, label: 'Subject mastery' })),
        h('div', { class: 'path' }, s.topics.map((t) => {
          const m = ov.mastery[t.id];
          return h('a', { class: `stone ${m.category}`, href: `#/learn/${t.id}`, title: `${t.name}: ${m.n ? m.score + '% mastery' : 'not assessed yet'}` },
            topicBadgeEarned(m) ? '🏅 ' : '', t.name);
        }))));
    }
    root.append(h('p', { class: 'small muted' }, 'Legend: ', categoryChip('strong'), ' ', categoryChip('developing'), ' ', categoryChip('attention'), ' ', categoryChip('untested'), '. A topic is Strong at 80%+ with at least one reasoning or application question right without a hint.'));
  }

  if (tab === 'badges') {
    const topicBadges = Object.values(content.topics).map((t) => ({ id: `topic:${t.id}`, icon: '🏅', name: t.name, desc: 'Mastered: strong results including reasoning.' }));
    const all = [...MILESTONES, ...topicBadges];
    const earned = all.filter((b) => state.badges[b.id]).length;
    root.append(h('p', { class: 'muted' }, `${earned} of ${all.length} earned. Badges are given for showing understanding and for steady work — never for speed.`),
      h('h3', {}, 'Milestones'),
      h('div', { class: 'badge-grid' }, MILESTONES.map((b) => badgeTile(b, state))),
      h('h3', { style: 'margin-top:1.5rem' }, 'Topic mastery badges'),
      h('div', { class: 'badge-grid' }, topicBadges.map((b) => badgeTile(b, state))));
  }

  if (tab === 'garden') {
    root.append(h('p', { class: 'muted' }, 'Each plant is one topic. It grows as your mastery grows. This is optional — you can turn it off in Settings.'));
    for (const s of content.subjects) {
      root.append(h('h3', {}, s.name), h('div', { class: 'garden', style: 'margin-bottom:1.2rem' }, s.topics.map((t) => {
        const m = ov.mastery[t.id];
        return h('div', { class: 'plant', title: `${t.name}: ${m.score}%` }, h('div', { html: plantSvg(growthStage(m), s.color) }), t.name);
      })));
    }
  }
}

function badgeTile(b, state) {
  const got = state.badges[b.id];
  return h('div', { class: `badge${got ? '' : ' locked'}` },
    h('div', { class: 'b-ico', 'aria-hidden': 'true' }, b.icon),
    h('h4', {}, b.name),
    h('p', {}, got ? `Earned ${formatDate(isoDate(new Date(got.awardedAt)))}` : b.desc));
}
