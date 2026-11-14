import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { carry } from '@/lib/agents';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SIDE_OFFSET = 72;

// De que lado a peça entra: o lado da tela em que ela está. Peças centradas
// (ou de largura total) alternam esquerda/direita pela ordem entre as irmãs.
function sideOf(el, rect) {
  const center = (rect.left + rect.width / 2) / window.innerWidth;
  if (center < 0.45) return 'left';
  if (center > 0.55) return 'right';
  const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
  return index % 2 === 0 ? 'left' : 'right';
}

/**
 * Entrada ao rolar de um elemento, em estilo de apresentação: quando a peça
 * entra na tela, um cursor de agente a traz da lateral até o lugar (ver
 * lib/agents.js). Se os agentes estão todos ocupados, ela desliza sozinha da
 * lateral (ou sobe, com `from: 'up'`). Acontece uma vez. Devolve a limpeza.
 *
 * Na abertura de uma página (ver AssembleIntro), as peças que já estão na
 * primeira tela não se animam sozinhas: elas se marcam com `data-assemble` e
 * são "colocadas" pelos cursores. Com movimento reduzido, nada se move.
 */
function revealElement(el, { delay = 0, y = 24, from = 'auto' } = {}) {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const rect = el.getBoundingClientRect();

    if (document.documentElement.dataset.assembleMode === 'full' && rect.top < window.innerHeight && rect.bottom > 0) {
      el.setAttribute('data-assemble', '');
      return () => el.removeAttribute('data-assemble');
    }

    // Peça que já ficou para cima da tela (página aberta no meio): só aparece.
    if (rect.bottom < 0) return undefined;

    // As animações abaixo nascem num callback de scroll, fora do contexto do
    // useGSAP, então a limpeza é manual: `job` (agente) e `slide` (alternativa).
    let job = null;
    let slide = null;

    // Entrada alternativa, quando os três agentes já estão ocupados.
    const slideIn = () => {
      const side = from === 'auto' ? sideOf(el, rect) : from;
      const offset = side === 'up' ? { y } : { x: side === 'left' ? -SIDE_OFFSET : SIDE_OFFSET };
      slide = gsap.fromTo(
        el,
        { ...offset, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 0.9, delay, ease: 'expo.out', clearProps: 'transform,opacity' }
      );
    };

    gsap.set(el, { opacity: 0 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      // Posição de scroll em que o topo da peça chega a 88% da tela. Fica
      // negativa para o que já está na primeira tela (dispara de imediato, mesmo
      // com o scroll em 0) e é limitada ao scroll máximo, para as peças do fim
      // da página (rodapé) ainda dispararem.
      start: () =>
        Math.min(
          el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.88,
          ScrollTrigger.maxScroll(window) - 1
        ),
      once: true,
      onEnter: () => {
        job = carry(el, { delay });
        if (!job) slideIn();
      },
    });

    return () => {
      trigger.kill();
      slide?.kill();
      job?.cancel();
      gsap.set(el, { clearProps: 'transform,opacity' });
    };
  });

  return () => mm.revert();
}

/**
 * Peça que entra ao rolar (ver revealElement). `delay` em passos de ~70ms dá
 * a ordem título → texto → imagem.
 */
export default function Reveal({ children, delay = 0, y = 24, from = 'auto', as: Tag = 'div', className, ...props }) {
  const ref = useRef(null);

  useGSAP(() => revealElement(ref.current, { delay, y, from }));

  return (
    <Tag ref={ref} data-reveal className={className} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Contêiner cujos filhos diretos entram ao rolar, um a um, sem precisar
 * embrulhar cada um num Reveal. Filhos que já têm Reveal dentro (o
 * PageHeader, por exemplo) ficam de fora, para não animar duas vezes.
 */
export function RevealGroup({ children, as: Tag = 'div', className, ...props }) {
  const ref = useRef(null);

  useGSAP(() => {
    const cleanups = [...ref.current.children]
      .filter((child) => !child.matches('[data-reveal]') && !child.querySelector('[data-reveal]'))
      .map((child, i) => revealElement(child, { delay: Math.min(i, 4) * 0.06 }));
    return () => cleanups.forEach((cleanup) => cleanup());
  });

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
