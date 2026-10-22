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
  if (buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset['filter'] ?? 'todas';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      let shown = 0;
      items.forEach((item) => {
        const match = filter === 'todas' || item.dataset['category'] === filter;
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (status) {
        const label = filter === 'todas' ? '' : ` de ${button.textContent?.trim()}`;
        status.textContent = `Mostrando ${shown} ${shown === 1 ? 'foto' : 'fotos'}${label}.`;
      }
    });
  });

  // Permite enlazar a un filtro concreto: /galeria/?programa=educacion
  const requested = new URLSearchParams(window.location.search).get('programa');
  buttons.find((b) => b.dataset['filter'] === requested)?.click();
}
