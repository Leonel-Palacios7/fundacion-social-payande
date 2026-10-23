/**
 * Movimiento del logo de la portada:
 * - Da un pequeño salto cada vez que cambia la foto del carrusel.
 * - Se inclina siguiendo el puntero (solo con ratón).
 * Nada de esto ocurre si el usuario pidió reducir movimiento.
 */
export function initHeroLogo(root: HTMLElement): void {
  const logo = root.querySelector<HTMLElement>('[data-hero-logo]');
  const tilt = root.querySelector<HTMLElement>('[data-hero-tilt]');
  if (!logo || !tilt || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.addEventListener('carousel:change', () => {
    logo.classList.remove('is-bumping');
    // Fuerza un reflujo para que la animación vuelva a empezar.
    void logo.offsetWidth;
    logo.classList.add('is-bumping');
  });
  logo.addEventListener('animationend', (event) => {
    if (event.animationName.includes('logo-bump')) logo.classList.remove('is-bumping');
  });

  if (!window.matchMedia('(pointer: fine)').matches) return;
  let frame = 0;
  root.addEventListener('pointermove', (event) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const box = logo.getBoundingClientRect();
      const x = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
      const y = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
      tilt.style.setProperty('--rx', `${(x * 18).toFixed(2)}deg`);
      tilt.style.setProperty('--ry', `${(-y * 14).toFixed(2)}deg`);
    });
  });
  root.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    tilt.style.setProperty('--rx', '0deg');
    tilt.style.setProperty('--ry', '0deg');
  });
}
