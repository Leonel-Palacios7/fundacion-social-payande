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
