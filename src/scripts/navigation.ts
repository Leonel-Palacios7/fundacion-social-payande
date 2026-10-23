/** Una pestaña se desliza detrás del enlace que se señala y vuelve a la página actual. */
export function initNavIndicator(): void {
  const list = document.querySelector<HTMLElement>('[data-nav-list]');
  const indicator = document.querySelector<HTMLElement>('[data-nav-indicator]');
  if (!list || !indicator) return;
  const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('.tabbar__link'));

  const moveTo = (link: HTMLAnchorElement | undefined) => {
    if (!link) {
      indicator.classList.remove('is-active');
      return;
    }
    // Medidas de diseño (offset*): no cambian mientras la barra hace su animación de entrada.
    indicator.style.setProperty('--x', `${link.offsetLeft}px`);
    indicator.style.setProperty('--y', `${link.offsetTop}px`);
    indicator.style.setProperty('--w', `${link.offsetWidth}px`);
    indicator.style.setProperty('--h', `${link.offsetHeight}px`);
    indicator.classList.add('is-active');
  };

  const current = () => links.find((link) => link.getAttribute('aria-current') === 'page');

  for (const link of links) {
    link.addEventListener('pointerenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  }
  list.addEventListener('pointerleave', () => moveTo(current()));
  list.addEventListener('focusout', (event) => {
    if (!list.contains(event.relatedTarget as Node | null)) moveTo(current());
  });
  window.addEventListener('resize', () => moveTo(current()));
  // Espera a que carguen las fuentes para medir el enlace actual con su ancho real.
  void document.fonts.ready.then(() => moveTo(current()));
}

