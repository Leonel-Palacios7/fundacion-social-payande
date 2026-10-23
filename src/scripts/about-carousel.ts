const INTERVAL = 5000;

/**
 * Carrusel de «Sobre nosotros»: avanza solo cada pocos segundos, se detiene al pasar
 * el ratón o enfocar un control, fuera de pantalla y con el botón de pausa.
 * Si el usuario pidió reducir movimiento no avanza solo ni se inclina.
 */
export function initAboutCarousel(root: HTMLElement): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-about-slide]'));
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-about-dot]'));
  const controls = root.querySelector<HTMLElement>('[data-about-controls]');
  const pause = root.querySelector<HTMLButtonElement>('[data-about-pause]');
  const counter = root.querySelector<HTMLElement>('[data-about-current]');
  const frame = root.querySelector<HTMLElement>('[data-about-frame]');
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

  // Quita y vuelve a poner una clase para reiniciar su animación.
  const restart = (name: string) => {
    root.classList.remove(name);
    void root.offsetWidth;
    root.classList.add(name);
  };

  const show = (next: number, dir: 'next' | 'prev' = 'next') => {
    index = (next + slides.length) % slides.length;
    root.dataset.dir = dir;
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
    if (counter) counter.textContent = String(index + 1).padStart(2, '0');
    root.classList.toggle('is-shuffled', index % 2 === 1);
    restart('is-changed');
  };

  const schedule = () => {
    window.clearTimeout(timer);
    const running = !(userPaused || hovering || !visible || document.hidden);
    root.classList.remove('is-running');
    if (!running) return;
    restart('is-running');
    timer = window.setTimeout(() => {
      show(index + 1);
      schedule();
    }, INTERVAL);
  };

  show(0);
  root.classList.remove('is-changed');

  root.querySelector('[data-about-prev]')?.addEventListener('click', () => {
    show(index - 1, 'prev');
    schedule();
  });
  root.querySelector('[data-about-next]')?.addEventListener('click', () => {
    show(index + 1);
    schedule();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => {
      show(i, i < index ? 'prev' : 'next');
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

  // La tarjeta se inclina un poco hacia el puntero (solo con ratón).
  if (!frame || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
  root.addEventListener('pointermove', (event) => {
    const box = frame.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    frame.style.setProperty('--rx', `${(x * 8).toFixed(2)}deg`);
    frame.style.setProperty('--ry', `${(-y * 6).toFixed(2)}deg`);
  });
  root.addEventListener('pointerleave', () => {
    frame.style.setProperty('--rx', '0deg');
    frame.style.setProperty('--ry', '0deg');
  });
}
