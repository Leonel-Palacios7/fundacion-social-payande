const KEY = 'payande-tema';
type Theme = 'light' | 'dark';

const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function apply(theme: Theme, button: HTMLButtonElement): void {
  document.documentElement.dataset.theme = theme;
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Sin almacenamiento el tema dura solo esta página.
  }
}

/**
 * Botón de modo claro / oscuro. El cambio se revela con un círculo que crece desde
 * el botón (View Transitions); sin ese soporte o con movimiento reducido cambia al instante.
 */
export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) return;
  button.hidden = false;
  button.setAttribute('aria-pressed', String(currentTheme() === 'dark'));

  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('startViewTransition' in document)) {
      apply(next, button);
      return;
    }

    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.classList.add('theme-switching');

    const transition = document.startViewTransition(() => apply(next, button));
    void transition.ready.then(() => {
      const options = { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' };
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`];
      root.animate({ clipPath }, { ...options, pseudoElement: '::view-transition-new(root)' });
      root.animate({ clipPath }, { ...options, pseudoElement: '::view-transition-new(site-header)' });
    });
    void transition.finished.finally(() => root.classList.remove('theme-switching'));

    // Destello que sale del botón.
    button.classList.remove('is-bursting');
    void button.offsetWidth;
    button.classList.add('is-bursting');
  });
}
