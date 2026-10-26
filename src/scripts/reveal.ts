/**
 * Aparición progresiva al hacer scroll ([data-reveal]).
 * El contenido es visible sin JavaScript: el estado oculto solo se aplica con html.js
 * y nunca cuando el usuario pidió reducir movimiento (ver global.css).
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

/** Cabecera compacta con sombra en cuanto la página se desplaza. */
export function initHeaderOnScroll(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;height:24px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry?.isIntersecting);
  }).observe(sentinel);
}

/**
 * Las secciones con animaciones continuas (portada, testimonios, cinta, carrusel 3D, pie)
 * se pausan mientras no se ven: así el navegador no gasta trabajo en lo que está fuera de pantalla.
 */
export function initMotionVisibility(): void {
  if (!('IntersectionObserver' in window)) return;
  const sections = document.querySelectorAll<HTMLElement>(
    '[data-hero], [data-testimonials], [data-marquee], [data-ring], [data-footer], .contact-hero, .page-hero',
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
    },
    { rootMargin: '120px 0px' },
  );
  sections.forEach((el) => observer.observe(el));
}
