/**
 * Movimiento de la portada de Inicio:
 * - Una luz suave sigue al puntero y las capas del fondo se desplazan un poco (solo con ratón).
 * - Al bajar por la página el texto se aleja y se desvanece.
 * - Un botón pausa todas las animaciones (WCAG 2.2.2).
 * Nada de esto ocurre si el usuario pidió reducir movimiento.
 */
export function initHero(root: HTMLElement): void {
  const pause = root.querySelector<HTMLButtonElement>('[data-hero-pause]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (pause) {
    pause.hidden = false;
    // Botón de alternancia: el nombre se mantiene y aria-pressed indica si está en pausa.
    pause.addEventListener('click', () => {
      const paused = root.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed', String(paused));
    });
  }

  let scrollFrame = 0;
  let last = '';
  const onScroll = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / root.offsetHeight)).toFixed(3);
      // Solo se escribe cuando cambia: más abajo de la portada no se toca el estilo.
      if (progress === last) return;
      last = progress;
      root.style.setProperty('--scroll', progress);
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
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      root.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      root.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      root.style.setProperty('--px', (x - 0.5).toFixed(3));
      root.style.setProperty('--py', (y - 0.5).toFixed(3));
      root.classList.add('has-pointer');
    });
  });
  root.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    root.classList.remove('has-pointer');
    ['--px', '--py'].forEach((name) => root.style.setProperty(name, '0'));
  });
}
