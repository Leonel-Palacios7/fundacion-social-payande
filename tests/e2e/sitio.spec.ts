import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { path: '/', h1: /Fundación Social Payandé/ },
  { path: '/nosotros/', h1: /hecha por y para Payandé/ },
  { path: '/programas/', h1: /Cinco ramas/ },
  { path: '/galeria/', h1: /Momentos/ },
  { path: '/como-ayudar/', h1: /Cada aporte/ },
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
    await expect(page).toHaveTitle(/Fundación Payandé/);
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
  for (const label of ['Nosotros', 'Programas', 'Galería', 'Cómo ayudar', 'Contacto']) {
    await openMenuIfMobile(page);
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: label }).click();
    // En móvil el menú se cierra al cambiar de página, por eso se busca sin filtrar por visibilidad.
    await expect(page.locator('#menu-principal [aria-current="page"]')).toHaveText(label);
    await expect(page).toHaveURL(new RegExp(`/${label === 'Cómo ayudar' ? 'como-ayudar' : label.toLowerCase().replace('í', 'i')}/$`));
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

test('el carrusel avanza con los controles y se puede pausar', async ({ page }) => {
  await page.goto('/');
  const slides = page.locator('[data-slide]');
  await expect(slides.nth(0)).toHaveClass(/is-active/);
  await page.getByRole('button', { name: 'Foto siguiente' }).click();
  await expect(slides.nth(1)).toHaveClass(/is-active/);
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'true');
  await page.getByRole('button', { name: 'Ver foto 3' }).click();
  await expect(slides.nth(2)).toHaveClass(/is-active/);
  const toggle = page.getByRole('button', { name: /Pausar presentación|Reanudar presentación/ });
  const before = await toggle.getAttribute('aria-label');
  await toggle.click();
  await expect(toggle).not.toHaveAttribute('aria-label', before ?? '');
});

test('el carrusel no avanza solo con movimiento reducido', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reanudar presentación' })).toBeVisible();
  await context.close();
});

test('la galería filtra, abre el visor y navega con el teclado', async ({ page }) => {
  await page.goto('/galeria/');
  const items = page.locator('.gallery__item:visible');
  const total = await items.count();
  expect(total).toBe(24);

  await page.getByRole('button', { name: 'Jóvenes y deporte' }).click();
  await expect(page.getByRole('button', { name: 'Jóvenes y deporte' })).toHaveAttribute('aria-pressed', 'true');
  await expect(items).toHaveCount(2);
  await expect(page.locator('[data-gallery-status]')).toHaveText('Mostrando 2 fotos de Jóvenes y deporte.');

  await items.first().getByRole('link').click();
  const dialog = page.getByRole('dialog', { name: 'Visor de fotos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('Foto 1 de 2');
  await expect(dialog.locator('img')).toHaveJSProperty('complete', true);
  await page.keyboard.press('ArrowRight');
  await expect(dialog.locator('[data-lightbox-counter]')).toHaveText('Foto 2 de 2');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(items.first().getByRole('link')).toBeFocused();
});

test('la galería acepta un filtro por URL', async ({ page }) => {
  await page.goto('/galeria/?programa=vivienda');
  await expect(page.getByRole('button', { name: 'Vivienda y personas mayores' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gallery__item:visible')).toHaveCount(6);
});

test('el formulario muestra errores accesibles y prepara el correo', async ({ page }) => {
  await page.goto('/contacto/?motivo=Voluntariado');
  await expect(page.getByLabel('Motivo')).toHaveValue('Voluntariado');

  await page.getByRole('button', { name: 'Preparar mensaje' }).click();
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
  await page.getByRole('button', { name: 'Preparar mensaje' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Abrimos tu aplicación de correo' })).toBeVisible();
  await expect(page.getByRole('alert')).toBeHidden();
  const href = await mailto.getAttribute('href');
  expect(href).toMatch(/^mailto:contacto@example\.org\?subject=/);
  expect(decodeURIComponent(href ?? '')).toContain('[Sitio web] Voluntariado - Ana Gómez');
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
  const photo = page.locator('#jovenes .editorial__photo');
  await photo.scrollIntoViewIfNeeded();
  await expect(photo).toHaveClass(/is-visible/);
  await expect(photo.locator('img')).toHaveJSProperty('complete', true);
  expect(await photo.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('las preguntas frecuentes de contacto abren de a una', async ({ page }) => {
  await page.goto('/contacto/');
  const items = page.locator('.faq__item');
  await expect(items).toHaveCount(6);
  await expect(items.first()).toHaveAttribute('open', '');
  await items.nth(2).locator('summary').click();
  await expect(items.nth(2)).toHaveAttribute('open', '');
  await expect(items.first()).not.toHaveAttribute('open', '');
});
