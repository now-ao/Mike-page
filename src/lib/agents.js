import { gsap } from 'gsap';

// Os "agentes" que montam a interface: nome e cor de cada cursor.
export const AGENTS = [
  { name: 'agent·01', color: 'var(--primary)' },
  { name: 'agent·02', color: 'var(--syntax-string)' },
  { name: 'agent·03', color: 'var(--syntax-number)' },
];

export function createCursor({ name, color }) {
  const el = document.createElement('div');
  el.className = 'agent-cursor';
  el.style.setProperty('--agent', color);
  el.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 2.5 19.5 11l-6.6 1.7L10.4 20 4 2.5Z" fill="var(--agent)" stroke="#04070f" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
    `<span>${name}</span>`;
  return el;
}

// Quantos cursores podem trabalhar ao mesmo tempo durante a rolagem. Acima
// disso a peça entra sozinha (deslize lateral), para a tela não virar enxame.
const MAX_ACTIVE = AGENTS.length;
let active = 0;
let turn = 0;

/**
 * Um agente traz `el` da lateral até o lugar dele (uso: entrada ao rolar).
 * O cursor vive numa camada dentro do palco ([data-agent-stage]), em
 * coordenadas do documento, então acompanha a página se ela rolar no meio
 * do caminho. Devolve `{ timeline, cancel }`, ou `null` se todos os agentes
 * estão ocupados (quem chamou decide a entrada alternativa).
 */
export function carry(el, { delay = 0 } = {}) {
  const stage = document.querySelector('[data-agent-stage]');
  if (!stage || active >= MAX_ACTIVE) return null;

  const rect = el.getBoundingClientRect();
  const origin = stage.getBoundingClientRect();
  const side = rect.left + rect.width / 2 < window.innerWidth / 2 ? -1 : 1;
  const dx = side * gsap.utils.random(90, 160);
  const dy = gsap.utils.random(-36, 36);
  const hold = {
    x: rect.left - origin.left + Math.min(rect.width * 0.5, 140),
    y: rect.top - origin.top + Math.min(rect.height * 0.5, 44),
  };

  const cursor = createCursor(AGENTS[turn++ % AGENTS.length]);
  stage.appendChild(cursor);
  active += 1;

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    active -= 1;
    cursor.remove();
    el.classList.remove('is-held');
  };

  gsap.set(cursor, { x: hold.x + dx, y: hold.y + dy, opacity: 0 });
  gsap.set(el, { x: dx, y: dy, rotation: side * gsap.utils.random(1, 2.5), opacity: 0 });

  const timeline = gsap
    .timeline({ delay, defaults: { ease: 'power3.inOut' }, onComplete: release })
    .to(cursor, { opacity: 1, duration: 0.14, ease: 'none' })
    .call(() => el.classList.add('is-held'))
    .to(el, { opacity: 1, duration: 0.12, ease: 'none' }, '<')
    .to(cursor, { x: hold.x, y: hold.y, duration: 0.5 })
    .to(el, { x: 0, y: 0, rotation: 0, duration: 0.5, clearProps: 'transform,opacity' }, '<')
    .call(() => el.classList.remove('is-held'))
    .to(cursor, { scale: 0.82, duration: 0.05, repeat: 1, yoyo: true, ease: 'none' })
    .to(cursor, { opacity: 0, duration: 0.2, ease: 'none' });

  return {
    timeline,
    cancel: () => {
      timeline.kill();
      gsap.set(el, { clearProps: 'transform,opacity' });
      release();
    },
  };
}
