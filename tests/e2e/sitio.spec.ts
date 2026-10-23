import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', h1: /Fundación Social Payandé/ },
  { path: '/programas/', h1: /Programas Sociales/ },
  { path: '/galeria/', h1: /Momentos/ },
  { path: '/contacto/', h1: /Contacto/ },
];

/** Recorre la página para que las animaciones de aparición terminen antes de auditar. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1600);
}

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

async function openMenuIfMobile(page: Page) {
  if (isMobile(page)) await page.getByRole('button', { name: 'Menú' }).click();
}

for (const { path, h1 } of PAGES) {
  test(`${path} carga, tiene un único h1 y no presenta errores de consola`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(h1);
    await expect(page).toHaveTitle(/Fundación Social Payandé/);
    expect(errors).toEqual([]);
  });

  test(`${path} no tiene violaciones axe (WCAG 2.2 A/AA)`, async ({ page }) => {
    await page.goto(path);
    await revealAll(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`${path} no tiene desplazamiento horizontal`, async ({ page }) => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `ancho ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('la navegación lleva a cada página y marca la actual', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Programas', 'Galería', 'Contacto']) {
    await openMenuIfMobile(page);
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: label }).click();
    // En móvil el menú se cierra al cambiar de página, por eso se busca sin filtrar por visibilidad.
    await expect(page.locator('#menu-principal [aria-current="page"]')).toHaveText(label);
    await expect(page).toHaveURL(new RegExp(`/${label.toLowerCase().replace('í', 'i')}/$`));
  }
});

test('el menú móvil abre, cierra con Escape y devuelve el foco', async ({ page }) => {
  test.skip(!isMobile(page), 'Solo aplica en móvil');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menú' });
  const nav = page.getByRole('navigation', { name: 'Principal' });
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('la portada anima el logo de fondo y su animación se puede pausar', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-hero]');
  await expect(hero.locator('.hero__tree')).toBeVisible();
  await expect(hero.locator('img')).toHaveCount(1);
  const pause = hero.getByRole('button', { name: 'Pausar animación de la portada' });
  await pause.click();
  await expect(hero).toHaveClass(/is-paused/);
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  const state = await hero.locator('.hero__orbit--1').evaluate((el) => getComputedStyle(el).animationPlayState);
  expect(state).toContain('paused');
});

test('la portada deja solo el lema y el pie lleva los datos de contacto reales', async ({ page }) => {
  await page.goto('/');
  const details = page.locator('.hero__details');
  await expect(details).toHaveText(/^\s*Transformando vidas con compromiso y solidaridad\s*$/);
  await expect(page.locator('.hero')).not.toContainText('Km 75');
  await expect(page.locator('.site-footer')).toContainText('direccion@fundacionpayande.com');
  await expect(page.locator('.site-footer')).toContainText('Km 75 vía Bogotá-Villeta, Vereda Pilones.');
});

test('no quedan enlaces a Nosotros y el botón de historia no navega', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*="nosotros"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Conoce nuestra historia' })).toHaveCount(0);
  await expect(page.getByText('Conoce nuestra historia')).toBeVisible();
  await page.goto('/programas/');
  await expect(page.locator('a[href*="nosotros"]')).toHaveCount(0);
});

test('la galería filtra, abre el visor y navega con el teclado', async ({ page }) => {
  await page.goto('/galeria/');
  const items = page.locator('.gallery__item:visible');
  const total = await items.count();
  expect(total).toBe(39);

  await page.getByRole('button', { name: 'Jóvenes y deporte' }).click();
  await expect(page.getByRole('button', { name: 'Jóvenes y deporte' })).toHaveAttribute('aria-pressed', 'true');
  await expect(items).toHaveCount(7);
  await expect(page.locator('[data-gallery-status]')).toHaveText('Mostrando 7 fotos de Jóvenes y deporte.');

  await items.first().getByRole('link').click();
  const dialog = page.getByRole('dialog', { name: 'Visor de fotos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('Foto 1 de 7');
  await expect(dialog.locator('img')).toHaveJSProperty('complete', true);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('Foto 2 de 7');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(items.first().getByRole('link')).toBeFocused();
});

test('la galería acepta un filtro por URL', async ({ page }) => {
  await page.goto('/galeria/?programa=vivienda');
  await expect(page.getByRole('button', { name: 'Vivienda y personas mayores' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gallery__item:visible')).toHaveCount(8);
});

test('las fotos cambian al azar sin repetirse en la página', async ({ page }) => {
  const visit = async () => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    return page.locator('picture[data-random]').evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset['photo']));
  };
  const first = await visit();
  expect(new Set(first).size).toBe(first.length);
  // Con 39 fotos, tres visitas seguidas idénticas son prácticamente imposibles.
  const others = [await visit(), await visit()];
  expect(others.some((ids) => ids.join() !== first.join())).toBe(true);
});

test('el formulario muestra errores accesibles y, si el envío falla, prepara el correo', async ({ page }) => {
  await page.route('https://formsubmit.co/**', (route) => route.fulfill({ status: 500, body: '{}' }));
  await page.goto('/contacto/?motivo=Servicios%20de%20la%20Fundaci%C3%B3n');
  await expect(page.getByLabel('Motivo')).toHaveValue('Servicios de la Fundación');

  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  const summary = page.getByRole('alert');
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(page.getByLabel('Nombre completo')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Motivo')).not.toHaveAttribute('aria-invalid', 'true');

  // Enlace del resumen lleva al campo
  await summary.getByRole('link', { name: 'Escribe tu nombre.' }).click();
  await expect(page.getByLabel('Nombre completo')).toBeFocused();

  await page.getByLabel('Nombre completo').fill('Ana Gómez');
  await page.getByLabel('Correo electrónico').fill('correo-invalido');
  await page.getByRole('textbox', { name: 'Mensaje' }).fill('Quiero apoyar las jornadas escolares.');
  await page.getByRole('textbox', { name: 'Mensaje' }).blur();
  await expect(page.locator('#correo-error')).toHaveText(/correo válido/);

  await page.getByLabel('Correo electrónico').fill('ana@correo.com');
  await page.getByLabel(/Autorizo/).check();

  const mailto = page.locator('[data-mailto-retry]');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'No pudimos enviar el mensaje' })).toBeVisible();
  await expect(page.getByRole('alert')).toBeHidden();
  const href = await mailto.getAttribute('href');
  expect(href).toMatch(/^mailto:direccion@fundacionpayande\.com\?subject=/);
  expect(decodeURIComponent(href ?? '')).toContain('[Sitio web] Servicios de la Fundación - Ana Gómez');
});

test('la página 404 responde y ofrece volver al inicio', async ({ page }) => {
  const response = await page.goto('/no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toBeVisible();
});

test('las imágenes se sirven en AVIF/WebP con dimensiones reservadas', async ({ page }) => {
  await page.goto('/');
  const sources = await page.locator('picture source').evaluateAll((els) => els.map((e) => e.getAttribute('type')));
  expect(sources).toContain('image/avif');
  expect(sources).toContain('image/webp');
  const missing = await page
    .locator('main img:not([data-lightbox-img])')
    .evaluateAll((imgs) => imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length);
  expect(missing).toBe(0);
});

test('el carrusel 3D gira con los botones y se puede pausar', async ({ page }) => {
  await page.goto('/');
  const ring = page.locator('[data-ring]');
  await ring.scrollIntoViewIfNeeded();
  const track = ring.locator('[data-ring-track]');
  const pause = ring.getByRole('button', { name: 'Pausar carrusel 3D' });
  await pause.click();
  await expect(ring.getByRole('button', { name: 'Reanudar carrusel 3D' })).toBeVisible();
  const angle = () => track.evaluate((el) => parseFloat(el.style.getPropertyValue('--angle')));
  const before = await angle();
  await ring.getByRole('button', { name: 'Girar el carrusel a la derecha' }).click();
  await expect.poll(angle).toBeLessThan(before - 20);
  // Espera a que termine el ajuste animado; en pausa el ángulo ya no cambia solo.
  await page.waitForTimeout(1500);
  const settled = await angle();
  await page.waitForTimeout(600);
  expect(Math.abs((await angle()) - settled)).toBeLessThan(0.5);
});

test('el carrusel 3D gira solo y responde al arrastre', async ({ page }) => {
  test.skip(isMobile(page), 'El arrastre se prueba con ratón');
  await page.goto('/');
  const stage = page.locator('[data-ring-stage]');
  await stage.scrollIntoViewIfNeeded();
  const track = page.locator('[data-ring-track]');
  const angle = () => track.evaluate((el) => parseFloat(el.style.getPropertyValue('--angle')));
  const a0 = await angle();
  await expect.poll(angle).not.toBe(a0);
  const box = await stage.boundingBox();
  if (!box) throw new Error('sin escenario');
  await page.getByRole('button', { name: 'Pausar carrusel 3D' }).click();
  const a1 = await angle();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 200, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  expect((await angle()) - a1).toBeGreaterThan(40);
});

test('con movimiento reducido no hay animaciones automáticas y todo el contenido es visible', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reanudar carrusel 3D' })).toBeAttached();
  const hidden = await page
    .locator('[data-reveal]')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '1').length);
  expect(hidden).toBe(0);
  const marquee = await page.locator('.marquee__track').evaluate((el) => getComputedStyle(el).animationName);
  expect(marquee).toBe('none');
  await context.close();
});

test('la cinta animada se puede detener', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Detener la cinta animada' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const state = await page.locator('.marquee__track').evaluate((el) => getComputedStyle(el).animationPlayState);
  expect(state).toBe('paused');
});

test('los programas se revelan al hacer scroll y cargan su foto', async ({ page }) => {
  await page.goto('/programas/');
  const photo = page.locator('#otros .editorial__photo');
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toHaveClass(/is-visible/);
  await expect(photo.locator('img')).toHaveJSProperty('complete', true);
  expect(await photo.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('el formulario envía el mensaje y confirma el envío', async ({ page }) => {
  let payload: Record<string, string> = {};
  await page.route('https://formsubmit.co/**', async (route) => {
    payload = route.request().postDataJSON() as Record<string, string>;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
  });
  await page.goto('/contacto/');
  await page.getByLabel('Nombre completo').fill('Ana Gómez');
  await page.getByLabel('Correo electrónico').fill('ana@correo.com');
  await page.getByLabel('Motivo').selectOption('Otro');
  await page.getByRole('textbox', { name: 'Mensaje' }).fill('Hola, quiero más información.');
  await page.getByLabel(/Autorizo/).check();
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  const sent = page.getByRole('status').filter({ hasText: 'Tu mensaje fue enviado' });
  await expect(sent).toBeVisible();
  await expect(sent).toBeFocused();
  expect(payload['Nombre']).toBe('Ana Gómez');
  expect(payload['_subject']).toBe('[Sitio web] Otro - Ana Gómez');
  await expect(page.getByLabel('Nombre completo')).toHaveValue('');
});

test('contacto ya no tiene preguntas frecuentes y el mapa apunta a la dirección', async ({ page }) => {
  await page.goto('/contacto/');
  await expect(page.locator('.faq__item')).toHaveCount(0);
  await expect(page.locator('.contact-card__map iframe')).toHaveAttribute('src', /Km%2075/);
});

test('las tarjetas de programas muestran su foto al pasar el cursor', async ({ page }) => {
  await page.goto('/');
  test.skip(isMobile(page), 'El efecto es de puntero');
  const card = page.locator('.service').first();
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await expect(card.locator('.service__photo')).toHaveCSS('opacity', '1');
});

test('el botón de volver arriba aparece al bajar y regresa al inicio', async ({ page }) => {
  await page.goto('/programas/');
  const toTop = page.getByRole('link', { name: 'Volver al inicio de la página' });
  await expect(toTop).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(toTop).toBeVisible();
  await toTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('#contenido')).toBeFocused();
});

test('la portada muestra el logo animado con el saludo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Fundación Social Payandé' })).toBeAttached();
  await expect(page.locator('.hero__tree')).toBeVisible();
  await expect(page.locator('.hero__content')).toContainText('Bienvenidos a');
});

test('cada tarjeta de servicio de Inicio lleva a su programa', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.service__link');
  await expect(cards).toHaveCount(6);
  await cards.filter({ hasText: 'Salud' }).click();
  await expect(page).toHaveURL(/\/programas\/#salud$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Salud' })).toBeInViewport();
});

test('la galería se muestra en mosaico con fotos de proporciones distintas', async ({ page }) => {
  await page.goto('/galeria/');
  await expect(page.locator('.gallery__filters')).toHaveClass(/has-pill/);
  const grid = page.locator('.gallery__grid--masonry');
  await expect(grid).toBeVisible();
  const ratios = await grid.locator('.gallery__img').evaluateAll((imgs) =>
    imgs.map((img) => ((img as HTMLImageElement).height / (img as HTMLImageElement).width).toFixed(2)),
  );
  expect(new Set(ratios).size).toBeGreaterThan(1);
});
