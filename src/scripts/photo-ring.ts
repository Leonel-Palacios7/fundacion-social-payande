const AUTO_SPEED = 9; // grados por segundo
const DRAG_FACTOR = 0.35; // grados por píxel arrastrado
const FRICTION = 0.94;

/**
 * Anima el carrusel 3D: giro automático, arrastre con inercia, botones y
 * opacidad según la profundidad de cada foto. Se detiene fuera de pantalla,
 * con la pestaña oculta y por completo si el usuario pidió reducir movimiento.
 */
export function initPhotoRing(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-ring-stage]');
  const track = root.querySelector<HTMLElement>('[data-ring-track]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-ring-card]'));
  const controls = root.querySelector<HTMLElement>('[data-ring-controls]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-ring-toggle]');
  if (!stage || !track || !controls || !toggle || cards.length === 0) return;

  controls.hidden = false;
  const step = 360 / cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let angle = -step / 2;
  let target: number | null = null;
  let velocity = 0;
  let paused = reduceMotion;
  let visible = false;
  let dragging = false;
  let lastX = 0;
  let lastTime = 0;
  let frame = 0;

  const render = () => {
    track.style.setProperty('--angle', `${angle}deg`);
    // Las fotos de atrás se atenúan para dar profundidad.
    cards.forEach((card, i) => {
      const rad = ((i * step + angle) * Math.PI) / 180;
      card.style.setProperty('--depth', (0.35 + 0.65 * ((Math.cos(rad) + 1) / 2)).toFixed(3));
    });
  };

  const tick = (time: number) => {
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0);
    lastTime = time;
    if (!dragging) {
      if (target !== null) {
        const diff = target - angle;
        angle += diff * Math.min(1, dt * 8);
        if (Math.abs(diff) < 0.05) {
          angle = target;
          target = null;
        }
      } else if (Math.abs(velocity) > 0.01) {
        angle += velocity;
        velocity *= FRICTION;
      } else if (!paused) {
        angle -= AUTO_SPEED * dt;
      }
    }
    render();
    frame = running() ? requestAnimationFrame(tick) : 0;
  };

  const running = () =>
    visible && !document.hidden && (dragging || target !== null || Math.abs(velocity) > 0.01 || !paused);

  const wake = () => {
    if (!frame && running()) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const setPaused = (value: boolean) => {
    paused = value;
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Reanudar carrusel 3D' : 'Pausar carrusel 3D');
    wake();
  };

  const snapBy = (direction: number) => {
    const base = target ?? angle;
    target = Math.round((base + direction * step) / step) * step - step / 2;
    velocity = 0;
    wake();
  };

  root.querySelector('[data-ring-prev]')?.addEventListener('click', () => snapBy(1));
  root.querySelector('[data-ring-next]')?.addEventListener('click', () => snapBy(-1));
  toggle.addEventListener('click', () => setPaused(!paused));

  stage.addEventListener('pointerdown', (event) => {
    dragging = true;
    target = null;
    velocity = 0;
    lastX = event.clientX;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-dragging');
    wake();
  });

  stage.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const delta = (event.clientX - lastX) * DRAG_FACTOR;
    lastX = event.clientX;
    angle += delta;
    velocity = delta;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    wake();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    wake();
  }).observe(root);
  document.addEventListener('visibilitychange', wake);

  setPaused(paused);
  render();
}
