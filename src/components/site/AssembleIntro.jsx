import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { AGENTS, createCursor } from '@/lib/agents';

const MAX_PIECES = 6; // acima disso a abertura fica longa; o resto só aparece
const WAIT_FOR_PAGE = 2500; // rotas sob demanda: quanto esperar o conteúdo montar

// Rotas já montadas nesta visita (some ao recarregar): a montagem com cursores
// toca uma vez por rota; ao voltar para ela, a entrada é só um fade rápido.
const seen = new Set();
let firstRun = true;

/**
 * Abertura da página, como se agentes montassem a interface: cursores com
 * nome entram pelas laterais, cada um arrastando uma peça da primeira tela
 * até o lugar dela. As peças são os elementos com `data-assemble` (o Reveal
 * marca sozinho as que estão na primeira tela) e, só na primeira página
 * aberta, os com `data-assemble-once` (a navbar).
 *
 * Enquanto a montagem não começa, `html.assembling` esconde as peças (ver
 * index.css) para nada piscar no lugar final antes de ser "trazido".
 * Decorativo: com movimento reduzido, não roda.
 */
export default function AssembleIntro() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const html = document.documentElement;
    const full = !seen.has(pathname);
    const once = firstRun ? [...document.querySelectorAll('[data-assemble-once]')] : [];
    once.forEach((el) => el.setAttribute('data-assemble', ''));
    html.dataset.assembleMode = full ? 'full' : 'quick';
    html.classList.add('assembling');

    let timeline;
    let layer;
    let frame;
    const startedAt = performance.now();

    const finish = () => {
      html.classList.remove('assembling');
      delete html.dataset.assembleMode;
      once.forEach((el) => el.removeAttribute('data-assemble'));
      layer?.remove();
    };

    const start = () => {
      seen.add(pathname);
      firstRun = false;

      const pieces = [...document.querySelectorAll('[data-assemble]')]
        .map((el) => ({ el, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width > 0 && rect.top < window.innerHeight && rect.bottom > 0);
      const all = pieces.map((p) => p.el);
      if (!all.length) {
        finish();
        return;
      }

      timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          gsap.set(all, { clearProps: 'transform,opacity' });
          finish();
        },
      });

      // Rota já vista: as peças só sobem com opacidade, em sequência.
      if (!full) {
        timeline.fromTo(
          all,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'expo.out' }
        );
        return;
      }

      const carried = pieces.slice(0, MAX_PIECES);
      const rest = pieces.slice(MAX_PIECES).map((p) => p.el);
      const width = window.innerWidth;
      const height = window.innerHeight;

      layer = document.createElement('div');
      layer.className = 'agent-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.appendChild(layer);

      // Cada agente tem a própria sequência (uma timeline aninhada); as
      // sequências rodam em paralelo, com um pequeno atraso entre elas.
      const agents = AGENTS.slice(0, Math.min(AGENTS.length, carried.length)).map((agent, i) => {
        const cursor = createCursor(agent);
        layer.appendChild(cursor);
        const fromLeft = i % 2 === 0;
        const home = { x: fromLeft ? -80 : width + 80, y: height * (0.25 + 0.25 * i) };
        gsap.set(cursor, { x: home.x, y: home.y, opacity: 0 });
        return { cursor, home, sequence: gsap.timeline({ defaults: { ease: 'power3.inOut' } }) };
      });

      carried.forEach(({ el, rect }, i) => {
        const { cursor, sequence } = agents[i % agents.length];
        // A peça começa fora do lugar, do lado da tela em que ela fica.
        const side = rect.left + rect.width / 2 < width / 2 ? -1 : 1;
        const dx = side * gsap.utils.random(140, 260);
        const dy = gsap.utils.random(-70, 70);
        const grab = { x: Math.min(rect.width * 0.5, 140), y: Math.min(rect.height * 0.5, 44) };
        const hold = { x: rect.left + grab.x, y: rect.top + grab.y };

        gsap.set(el, { x: dx, y: dy, rotation: side * gsap.utils.random(1.5, 4), opacity: 0 });

        sequence
          .to(cursor, { x: hold.x + dx, y: hold.y + dy, opacity: 1, duration: 0.32 })
          .call(() => el.classList.add('is-held'))
          .to(el, { opacity: 1, duration: 0.1, ease: 'none' })
          .to(cursor, { x: hold.x, y: hold.y, duration: 0.5 })
          .to(el, { x: 0, y: 0, rotation: 0, duration: 0.5 }, '<')
          .call(() => el.classList.remove('is-held'))
          .to(cursor, { scale: 0.82, duration: 0.05, repeat: 1, yoyo: true, ease: 'none' });
      });

      agents.forEach(({ cursor, home, sequence }, i) => {
        sequence.to(cursor, { x: home.x, y: home.y, opacity: 0, duration: 0.4, ease: 'power2.in' });
        timeline.add(sequence, i * 0.14);
      });

      if (rest.length) {
        timeline.fromTo(rest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' }, 0.5);
      }
    };

    // Espera o conteúdo da rota existir (rotas sob demanda montam depois).
    const waitForPage = () => {
      const ready = document.querySelector('#main-content h1');
      if (ready || performance.now() - startedAt > WAIT_FOR_PAGE) {
        // mais um frame: os Reveal da página se marcam no layout effect deles
        frame = requestAnimationFrame(start);
        return;
      }
      frame = requestAnimationFrame(waitForPage);
    };
    frame = requestAnimationFrame(waitForPage);

    return () => {
      cancelAnimationFrame(frame);
      if (timeline) {
        // interrompida (troca de rota): leva tudo ao estado final antes de limpar
        timeline.progress(1);
        timeline.kill();
      }
      document.querySelectorAll('.is-held').forEach((el) => el.classList.remove('is-held'));
      finish();
    };
  }, [pathname]);

  return null;
}
