/** Menú móvil: abre/cierra, cierra con Escape o al hacer clic fuera, y devuelve el foco al botón. */
export function initNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!toggle || !nav || !header) return;

  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, true);
  });

  document.addEventListener('click', (event) => {
    if (nav.classList.contains('is-open') && !header.contains(event.target as Node)) setOpen(false);
  });

  // Al pasar a escritorio el panel deja de existir: se restablece el estado.
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

/** Escritorio: una píldora se desliza detrás del enlace que se señala y vuelve a la página actual. */
export function initNavIndicator(): void {
  const list = document.querySelector<HTMLElement>('[data-nav-list]');
  const indicator = document.querySelector<HTMLElement>('[data-nav-indicator]');
  if (!list || !indicator) return;
  const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('.site-nav__link:not(.site-nav__link--cta)'));
  const desktop = window.matchMedia('(min-width: 64rem)');

  const moveTo = (link: HTMLAnchorElement | undefined) => {
    if (!link || !desktop.matches) {
      indicator.classList.remove('is-active');
      return;
    }
    const listRect = list.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    indicator.style.setProperty('--x', `${rect.left - listRect.left}px`);
    indicator.style.setProperty('--y', `${rect.top - listRect.top}px`);
    indicator.style.setProperty('--w', `${rect.width}px`);
    indicator.style.setProperty('--h', `${rect.height}px`);
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

/** La cabecera se oculta al bajar y reaparece al subir, salvo con el menú abierto o con el foco dentro. */
export function initHeaderAutoHide(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    const locked = nav?.classList.contains('is-open') || header.contains(document.activeElement);
    if (goingDown && y > header.offsetHeight * 4 && !locked) header.classList.add('is-hidden');
    else if (goingUp || y < header.offsetHeight || locked) header.classList.remove('is-hidden');
    if (goingDown || goingUp) lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
}
