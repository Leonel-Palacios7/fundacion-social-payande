/**
 * Galería con filtros y visor (<dialog> nativo).
 * Sin JavaScript cada miniatura sigue siendo un enlace a la foto ampliada.
 */
export function initGallery(root: HTMLElement): void {
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.gallery__link'));
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  const img = root.querySelector<HTMLImageElement>('[data-lightbox-img]');
  const caption = root.querySelector<HTMLElement>('[data-lightbox-caption]');
  const counter = root.querySelector<HTMLElement>('[data-lightbox-counter]');
  if (!dialog || !img || !caption || !counter || links.length === 0) return;

  initFilters(root);

  let current = 0;
  let opener: HTMLElement | null = null;

  /** Solo se navega entre las fotos visibles según el filtro activo. */
  const visibleLinks = () => links.filter((link) => !link.closest<HTMLElement>('.gallery__item')?.hidden);

  const render = () => {
    const visible = visibleLinks();
    const link = visible[current];
    if (!link) return;
    const { large = '', caption: text = '', width = '', height = '' } = link.dataset;
    img.src = large;
    img.alt = text;
    img.width = Number(width);
    img.height = Number(height);
    caption.textContent = text;
    counter.textContent = `Foto ${current + 1} de ${visible.length}`;
  };

  const step = (delta: number) => {
    const total = visibleLinks().length;
    current = (current + delta + total) % total;
    render();
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (typeof dialog.showModal !== 'function') return; // navegador sin <dialog>: abre la imagen
      event.preventDefault();
      opener = link;
      current = Math.max(0, visibleLinks().indexOf(link));
      render();
      dialog.showModal();
    });
  });

  root.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => step(-1));
  root.querySelector('[data-lightbox-next]')?.addEventListener('click', () => step(1));
  root.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  // Clic sobre el fondo (fuera de la foto y los botones) cierra el visor.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus();
  });
}

function initFilters(root: HTMLElement): void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const items = Array.from(root.querySelectorAll<HTMLElement>('.gallery__item'));
  const status = root.querySelector<HTMLElement>('[data-gallery-status]');
  const bar = root.querySelector<HTMLElement>('[data-filters]');
  const pill = root.querySelector<HTMLElement>('[data-filter-pill]');
  if (buttons.length === 0) return;

  // La píldora de color se desliza bajo el filtro activo.
  const movePill = () => {
    const active = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
    if (!bar || !pill || !active) return;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.height = `${active.offsetHeight}px`;
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  };
  if (bar && pill) {
    movePill();
    bar.classList.add('has-pill');
    window.addEventListener('resize', movePill);
    document.fonts?.ready.then(movePill);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset['filter'] ?? 'todas';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      movePill();
      button.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      button.classList.remove('is-bumping');
      void button.offsetWidth;
      button.classList.add('is-bumping');

      let shown = 0;
      items.forEach((item) => {
        const match = filter === 'todas' || item.dataset['category'] === filter;
        item.hidden = !match;
        item.classList.remove('is-entering');
        if (!match) return;
        // Las fotos que quedan entran en cascada.
        item.style.setProperty('--order', String(Math.min(shown, 12)));
        item.classList.add('is-visible');
        void item.offsetWidth;
        item.classList.add('is-entering');
        shown += 1;
      });
      if (status) {
        const label = filter === 'todas' ? '' : ` de ${button.textContent?.replace(/\d+/g, '').trim()}`;
        status.textContent = `Mostrando ${shown} ${shown === 1 ? 'foto' : 'fotos'}${label}.`;
      }
    });
  });

  items.forEach((item) => item.addEventListener('animationend', () => item.classList.remove('is-entering')));

  // Permite enlazar a un filtro concreto: /galeria/?programa=educacion
  const requested = new URLSearchParams(window.location.search).get('programa');
  buttons.find((b) => b.dataset['filter'] === requested)?.click();
}
