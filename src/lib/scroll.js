// Ponto único de rolagem programática. Quando o Lenis está ativo, tudo passa
// por ele (senão a rolagem nativa e a suavizada brigam); sem ele (movimento
// reduzido), cai na rolagem nativa.
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Rola até um elemento. `center` centraliza na tela; `immediate` pula a animação.
 */
export function scrollToElement(el, { center = false, immediate = false } = {}) {
  if (!el) return;
  if (!lenis) {
    el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth', block: center ? 'center' : 'start' });
    return;
  }
  const offset = center ? -Math.max(0, (window.innerHeight - el.offsetHeight) / 2) : 0;
  // O Lenis mede a página com atraso (debounce); logo após uma rota montar, o
  // limite antigo cortaria o destino. Mede de novo antes de rolar.
  lenis.resize();
  lenis.scrollTo(el, { offset, immediate, force: true });
}
