import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMailto, composeMessage, LIMITS, validateContact, type ContactData } from '../../src/scripts/contact-validation.ts';

const valid: ContactData = {
  nombre: 'Ana Gómez',
  correo: 'ana@correo.com',
  telefono: '',
  motivo: 'Voluntariado',
  mensaje: 'Quiero apoyar las jornadas escolares.',
  consentimiento: true,
};

describe('validateContact', () => {
  test('acepta datos válidos', () => {
    assert.deepEqual(validateContact(valid), {});
  });

  test('exige los campos obligatorios', () => {
    const errors = validateContact({ nombre: ' ', correo: '', telefono: '', motivo: '', mensaje: '', consentimiento: false });
    assert.deepEqual(Object.keys(errors).sort(), ['consentimiento', 'correo', 'mensaje', 'motivo', 'nombre']);
  });

  test('rechaza correos mal formados', () => {
    for (const correo of ['ana', 'ana@', 'ana@correo', 'ana correo@x.com']) {
      assert.ok(validateContact({ ...valid, correo }).correo, correo);
    }
  });

  test('el teléfono es opcional pero se valida si se escribe', () => {
    assert.equal(validateContact({ ...valid, telefono: '+57 300 123 4567' }).telefono, undefined);
    assert.ok(validateContact({ ...valid, telefono: 'abc123' }).telefono);
    assert.ok(validateContact({ ...valid, telefono: '12 3' }).telefono);
  });

  test('aplica límites de longitud', () => {
    assert.ok(validateContact({ ...valid, nombre: 'A' }).nombre);
    assert.ok(validateContact({ ...valid, mensaje: 'corto' }).mensaje);
    assert.ok(validateContact({ ...valid, mensaje: 'x'.repeat(LIMITS.mensajeMax + 1) }).mensaje);
  });

  test('solo acepta motivos de la lista', () => {
    assert.ok(validateContact({ ...valid, motivo: 'Spam' }).motivo);
  });
});

describe('buildMailto', () => {
  test('codifica asunto y cuerpo', () => {
    const href = buildMailto('contacto@example.org', { ...valid, mensaje: 'Hola & gracias?\nSaludos' });
    assert.ok(href.startsWith('mailto:contacto@example.org?subject='));
    assert.ok(!href.includes(' '));
    const url = new URL(href);
    assert.equal(url.searchParams.get('subject'), '[Sitio web] Voluntariado - Ana Gómez');
    assert.match(url.searchParams.get('body') ?? '', /Hola & gracias\?\r\nSaludos/);
  });

  test('incluye el teléfono solo si existe', () => {
    assert.ok(!composeMessage(valid).body.includes('Teléfono'));
    assert.ok(composeMessage({ ...valid, telefono: '3001234567' }).body.includes('Teléfono: 3001234567'));
  });
});
