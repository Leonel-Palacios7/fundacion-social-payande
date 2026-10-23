const AUTOPLAY_MS = 7000;

/**
 * Carrusel de fotos accesible:
 * - Avance automático solo si el usuario no pidió reducir movimiento (WCAG 2.2.2 y 2.3.3).
 * - Botón visible para pausar/reanudar; se pausa también al enfocar o pasar el ratón.
 * - Las diapositivas ocultas quedan fuera del árbol de accesibilidad.
 */
export function initCarousel(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-slide]'));
  const controls = root.querySelector<HTMLElement>('[data-carousel-controls]');
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
  const toggle = root.querySelector<HTMLButtonElement>('[data-carousel-toggle]');
  if (slides.length < 2 || !controls || !toggle) return;

  controls.hidden = false;

  // Fotos al azar elegidas por HeroPicture (una por diapositiva desde la segunda);
  // si no hay, se usan las de la plantilla.
  const random = (window as { __payandeHeroSlides?: string[] }).__payandeHeroSlides ?? [];
  /** Inserta la foto de una diapositiva solo cuando hace falta: así no se descargan portadas que nadie ve. */
  const hydrate = (i: number) => {
    const slide = slides[(i + slides.length) % slides.length];
    const tpl = slide?.querySelector<HTMLTemplateElement>('template[data-slide-template]');
    if (!slide || !tpl) return;
    const html = random[slides.indexOf(slide) - 1];
    if (html) tpl.innerHTML = html;
    tpl.replaceWith(tpl.content.cloneNode(true));
  };
  // Tras la carga se prepara solo la siguiente diapositiva.
  if (document.readyState === 'complete') hydrate(1);
  else window.addEventListener('load', () => hydrate(1), { once: true });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer: number | undefined;
  let userPaused = reduceMotion;
  let hoverPaused = false;

  const show = (next: number) => {
    index = (next + slides.length) % slides.length;
    hydrate(index);
    hydrate(index + 1);
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    root.dispatchEvent(new CustomEvent('carousel:change', { detail: index }));
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = undefined;
  };

  const sync = () => {
    stop();
    if (!userPaused && !hoverPaused && !document.hidden) {
      timer = window.setInterval(() => show(index + 1), AUTOPLAY_MS);
    }
    toggle.classList.toggle('is-paused', userPaused);
    toggle.setAttribute('aria-label', userPaused ? 'Reanudar presentación' : 'Pausar presentación');
  };

  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
    show(index - 1);
    sync();
  });
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
    show(index + 1);
    sync();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      show(i);
      sync();
    }),
  );
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });

  const pauseOnInteraction = (paused: boolean) => () => {
    hoverPaused = paused;
    sync();
  };
  root.addEventListener('mouseenter', pauseOnInteraction(true));
  root.addEventListener('mouseleave', pauseOnInteraction(false));
  root.addEventListener('focusin', pauseOnInteraction(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) pauseOnInteraction(false)();
  });
  document.addEventListener('visibilitychange', sync);

  sync();
}
