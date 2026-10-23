/**
 * Cursor propio de la Fundación: un punto que sigue al mouse y un anillo que lo
 * alcanza con suavidad. El anillo cambia según lo que hay debajo:
 * - enlaces y botones pequeños: el anillo los abraza (toma su tamaño y forma);
 * - tarjetas y enlaces grandes: crece, se rellena y dice «Abrir» o «Ver»;
 * - imágenes: se vuelve una lupa con borde de colores que gira;
 * - carrusel 3D: dice «Arrastra»; campos de texto: vuelve el cursor normal.
 * Al hacer clic se encoge y suelta un destello con hojitas de colores.
 * Solo se activa con mouse (puntero fino) y sin movimiento reducido.
 */
type Mode = 'default' | 'link' | 'wrap' | 'image' | 'drag' | 'text' | 'disabled';

const INTERACTIVE = 'a[href], button, [role="button"], label[for], summary, select, .social__item';
const TEXT = 'input:not([type="checkbox"], [type="radio"], [type="submit"], [type="button"], [type="range"]), textarea, [contenteditable="true"]';
const COLORS = ['#8eca6d', '#5ebd91', '#33b8b8', '#1fa2c6', '#8ee05a', '#ffd76a'];

export function initCursor(): void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.querySelector<HTMLElement>('[data-cursor]');
  if (!root || !fine.matches || reduce.matches) return;

  const dot = root.querySelector<HTMLElement>('[data-cursor-dot]')!;
  const ring = root.querySelector<HTMLElement>('[data-cursor-ring]')!;
  const label = root.querySelector<HTMLElement>('[data-cursor-label]')!;
  const html = document.documentElement;

  let x = -100;
  let y = -100;
  let rx = x;
  let ry = y;
  let w = 34;
  let h = 34;
  let tw = w;
  let th = h;
  let target: HTMLElement | null = null;
  let mode: Mode = 'default';
  let raf = 0;
  let last = 0;

  const setMode = (next: Mode, text = ''): void => {
    mode = next;
    root.dataset.mode = next;
    label.textContent = text;
  };

  /** Decide el modo según el elemento bajo el puntero. */
  const inspect = (el: Element | null): void => {
    target = null;
    if (!el) return setMode('default');
    if (el.closest(TEXT)) return setMode('text');
    if (el.closest('[data-ring-stage]') && !el.closest('button, a')) return setMode('drag', 'Arrastra');
    const hit = el.closest<HTMLElement>(INTERACTIVE);
    if (hit) {
      if (hit.matches(':disabled, [aria-disabled="true"]')) return setMode('disabled');
      const box = hit.getBoundingClientRect();
      if (box.width <= 220 && box.height <= 72) {
        target = hit;
        return setMode('wrap');
      }
      return setMode('link', hit.querySelector('img, picture') ? 'Ver' : 'Abrir');
    }
    // Una imagen puede estar debajo de una capa decorativa: se busca en toda la pila.
    if (el.closest('img, picture, figure, video') || document.elementsFromPoint(x, y).some((e) => e.matches('img, video'))) {
      return setMode('image');
    }
    setMode('default');
  };

  const tick = (now: number): void => {
    // Suavizado según el tiempo real, para que vaya igual a 60 o a 120 cuadros por segundo.
    const frames = last ? Math.min((now - last) / 16.67, 4) : 1;
    last = now;
    const follow = 1 - Math.pow(0.8, frames);
    const grow = 1 - Math.pow(0.78, frames);
    let cx = x;
    let cy = y;
    if (mode === 'wrap' && target) {
      // El anillo abraza el botón y se deja llevar un poco hacia el puntero (efecto imán).
      const box = target.getBoundingClientRect();
      tw = box.width + 12;
      th = box.height + 12;
      cx = box.left + box.width / 2 + (x - (box.left + box.width / 2)) * 0.15;
      cy = box.top + box.height / 2 + (y - (box.top + box.height / 2)) * 0.15;
      ring.style.borderRadius = getComputedStyle(target).borderRadius === '50%' ? '50%' : '999px';
    } else {
      const size = mode === 'link' ? 66 : mode === 'image' ? 64 : mode === 'drag' ? 86 : mode === 'disabled' ? 26 : 34;
      tw = th = size;
      ring.style.borderRadius = '50%';
    }
    rx += (cx - rx) * follow;
    ry += (cy - ry) * follow;
    w += (tw - w) * grow;
    h += (th - h) * grow;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx - w / 2}px, ${ry - h / 2}px, 0)`;
    ring.style.width = `${w}px`;
    ring.style.height = `${h}px`;
    const settled = Math.abs(cx - rx) < 0.1 && Math.abs(cy - ry) < 0.1 && Math.abs(tw - w) < 0.1 && Math.abs(th - h) < 0.1;
    raf = settled ? 0 : requestAnimationFrame(tick);
    if (!raf) last = 0;
  };

  const wake = (): void => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  /** Destello al hacer clic: una onda y hojitas que salen en todas direcciones. */
  const burst = (px: number, py: number): void => {
    const wave = document.createElement('span');
    wave.className = 'cursor__wave';
    wave.style.left = `${px}px`;
    wave.style.top = `${py}px`;
    root.append(wave);
    wave.animate(
      [
        { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 },
        { transform: 'translate(-50%, -50%) scale(2.4)', opacity: 0 },
      ],
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).onfinish = () => wave.remove();

    for (let i = 0; i < 9; i++) {
      const leaf = document.createElement('span');
      leaf.className = 'cursor__leaf';
      leaf.style.left = `${px}px`;
      leaf.style.top = `${py}px`;
      leaf.style.background = COLORS[i % COLORS.length]!;
      root.append(leaf);
      const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 26 + Math.random() * 26;
      const turn = Math.round(Math.random() * 360);
      leaf.animate(
        [
          { transform: `translate(-50%, -50%) rotate(${turn}deg) scale(1)`, opacity: 1 },
          {
            transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) rotate(${turn + 180}deg) scale(0.2)`,
            opacity: 0,
          },
        ],
        { duration: 700 + Math.random() * 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      ).onfinish = () => leaf.remove();
    }
  };

  const start = (): void => {
    html.classList.add('has-cursor');
    root.hidden = false;
  };

  const stop = (): void => {
    html.classList.remove('has-cursor');
    root.hidden = true;
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (root.hidden) {
        start();
        rx = e.clientX;
        ry = e.clientY;
      }
      x = e.clientX;
      y = e.clientY;
      root.classList.remove('is-out');
      inspect(e.target as Element);
      wake();
    },
    { passive: true },
  );

  // Al hacer scroll lo que queda bajo el puntero cambia aunque el mouse no se mueva.
  addEventListener(
    'scroll',
    () => {
      if (root.hidden) return;
      inspect(document.elementFromPoint(x, y));
      wake();
    },
    { passive: true },
  );

  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || root.hidden) return;
    root.classList.add('is-down');
    burst(e.clientX, e.clientY);
  });

  addEventListener('pointerup', () => root.classList.remove('is-down'));
  document.addEventListener('pointerleave', () => root.classList.add('is-out'));
  addEventListener('blur', () => root.classList.add('is-out'));

  // Si el usuario cambia a táctil o pide menos movimiento, se vuelve al cursor del sistema.
  const check = (): void => {
    if (!fine.matches || reduce.matches) stop();
  };
  fine.addEventListener('change', check);
  reduce.addEventListener('change', check);
}
