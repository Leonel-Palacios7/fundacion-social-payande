/**
 * Barra de navegación: la burbuja y la hendidura se colocan sobre el ícono del enlace
 * señalado (o de la página actual) y ese ícono sube hasta quedar dentro de la burbuja.
 */
export function initNavIndicator(): void {
  const bar = document.querySelector<HTMLElement>('[data-tabbar]');
  const list = bar?.querySelector<HTMLElement>('[data-nav-list]');
  const bubble = bar?.querySelector<HTMLElement>('.tabbar__bubble');
  if (!bar || !list || !bubble) return;
  const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('.tabbar__link'));

  // Posición respecto a la barra sumando offsets: no cambia con las animaciones de entrada,
  // y sirve aunque un elemento animado pase a ser el offsetParent mientras se mueve.
  const offsetIn = (el: HTMLElement) => {
    let x = 0;
    let y = 0;
    let node: HTMLElement | null = el;
    while (node && node !== bar) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return { x, y };
  };

  const moveTo = (link: HTMLAnchorElement | undefined) => {
    links.forEach((item) => item.classList.toggle('is-lifted', item === link));
    if (!link) {
      bar.classList.remove('has-bubble');
      return;
    }
    const icon = link.querySelector<HTMLElement>('.tabbar__icon');
    if (!icon) return;
    const pos = offsetIn(icon);
    const left = pos.x + icon.offsetWidth / 2;
    const iconCenterY = pos.y + icon.offsetHeight / 2;
    const bubbleCenterY = bubble.offsetTop + bubble.offsetHeight / 2;
    bar.style.setProperty('--cx', `${left}px`);
    link.style.setProperty('--lift', `${bubbleCenterY - iconCenterY}px`);
    bar.classList.add('has-bubble');
  };

  const current = () => links.find((link) => link.getAttribute('aria-current') === 'page');

  for (const link of links) {
    link.addEventListener('pointerenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  }
  list.addEventListener('pointerleave', () => moveTo(current()));
  list.addEventListener('focusout', (event) => {
    if (!list.contains(event.relatedTarget as Node | null)) moveTo(current());
  });
  // Vuelve a medir cuando cambia el tamaño de la barra o de los enlaces (fuentes, ventana).
  const observer = new ResizeObserver(() => {
    const target = links.find((link) => link.classList.contains('is-lifted')) ?? current();
    moveTo(target);
  });
  observer.observe(bar);
  observer.observe(list);
  links.forEach((link) => observer.observe(link));
  void document.fonts.ready.then(() => moveTo(current()));
}
