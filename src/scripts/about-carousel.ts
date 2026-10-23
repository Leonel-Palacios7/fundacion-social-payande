const INTERVAL = 5000;

/**
 * Carrusel de «Sobre nosotros»: avanza solo cada pocos segundos, se detiene al pasar
 * el ratón o enfocar un control, fuera de pantalla y con el botón de pausa.
 * Si el usuario pidió reducir movimiento no avanza solo.
 */
export function initAboutCarousel(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-about-slide]'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-about-dot]'));
  const controls = root.querySelector<HTMLElement>('[data-about-controls]');
  const pause = root.querySelector<HTMLButtonElement>('[data-about-pause]');
  if (slides.length < 2 || !controls || !pause) return;

  controls.hidden = false;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = 0;
  let userPaused = reduceMotion;
  let hovering = false;
  let visible = false;

  pause.setAttribute('aria-pressed', String(userPaused));
  root.classList.toggle('is-paused', userPaused);

  const show = (next: number) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle('is-active', active);
      slide.toggleAttribute('inert', !active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const schedule = () => {
    window.clearTimeout(timer);
    if (userPaused || hovering || !visible || document.hidden) return;
    timer = window.setTimeout(() => {
      show(index + 1);
      schedule();
    }, INTERVAL);
  };

  show(0);

  root.querySelector('[data-about-prev]')?.addEventListener('click', () => {
    show(index - 1);
    schedule();
  });
  root.querySelector('[data-about-next]')?.addEventListener('click', () => {
    show(index + 1);
    schedule();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      show(i);
      schedule();
    }),
  );
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    pause.setAttribute('aria-pressed', String(userPaused));
    root.classList.toggle('is-paused', userPaused);
    schedule();
  });

  const hold = (value: boolean) => () => {
    hovering = value;
    schedule();
  };
  root.addEventListener('pointerenter', hold(true));
  root.addEventListener('pointerleave', hold(false));
  root.addEventListener('focusin', hold(true));
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) hold(false)();
  });
  document.addEventListener('visibilitychange', schedule);

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    schedule();
  }).observe(root);
}
