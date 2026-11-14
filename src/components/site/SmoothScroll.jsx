import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Rolagem suave (Lenis) sincronizada com o GSAP: o ticker do GSAP conduz o
 * Lenis e cada scroll atualiza o ScrollTrigger, então animações com scrub não
 * tremem. Com movimento reduzido o Lenis nem liga e a rolagem fica nativa.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // A altura da página muda com rotas carregadas sob demanda; o ScrollTrigger
    // só se recalcula sozinho em resize de janela.
    let refreshTimer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    resizeObserver.observe(document.body);

    let teardownLenis = () => {};
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Com um diálogo aberto (Radix marca o body com data-scroll-locked), o Lenis
      // não assume o scroll: a página atrás fica parada, como sem ele.
      const lenis = new Lenis({
        lerp: 0.1,
        anchors: true,
        virtualScroll: () => !document.body.hasAttribute('data-scroll-locked'),
      });
      setLenis(lenis);

      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      teardownLenis = () => {
        gsap.ticker.remove(tick);
        setLenis(null);
        lenis.destroy();
      };
    }

    return () => {
      clearTimeout(refreshTimer);
      resizeObserver.disconnect();
      teardownLenis();
    };
  }, []);

  return null;
}
