/**
 * Movimiento de la portada de Inicio:
 * - Las capas del logo se desplazan siguiendo el puntero (solo con ratón).
 * - Al bajar por la página el árbol se aleja y se desvanece.
 * - Un botón pausa todas las animaciones (WCAG 2.2.2).
 * Nada de esto ocurre si el usuario pidió reducir movimiento.
 */
export function initHero(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-hero-stage]');
  const tilt = root.querySelector<HTMLElement>('[data-hero-tilt]');
  const pause = root.querySelector<HTMLButtonElement>('[data-hero-pause]');
  if (!stage || !tilt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (pause) {
    pause.hidden = false;
    // Botón de alternancia: el nombre se mantiene y aria-pressed indica si está en pausa.
    pause.addEventListener('click', () => {
      const paused = root.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed', String(paused));
    });
  }

  let scrollFrame = 0;
  const onScroll = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const progress = Math.min(1, Math.max(0, window.scrollY / root.offsetHeight));
      stage.style.setProperty('--scroll', progress.toFixed(3));
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!window.matchMedia('(pointer: fine)').matches) return;
  let frame = 0;
  root.addEventListener('pointermove', (event) => {
    if (root.classList.contains('is-paused')) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = root.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      stage.style.setProperty('--px', x.toFixed(3));
      stage.style.setProperty('--py', y.toFixed(3));
      tilt.style.setProperty('--rx', `${(x * 22).toFixed(2)}deg`);
      tilt.style.setProperty('--ry', `${(-y * 16).toFixed(2)}deg`);
    });
  });
  root.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    ['--px', '--py'].forEach((name) => stage.style.setProperty(name, '0'));
    ['--rx', '--ry'].forEach((name) => tilt.style.setProperty(name, '0deg'));
  });
}
