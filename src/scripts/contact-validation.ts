/**
 * Validación del formulario de contacto (lógica pura, sin DOM, para poder probarla).
 * Es una ayuda de experiencia de usuario: no reemplaza validaciones de un servidor.
 */
export type ContactField = 'nombre' | 'correo' | 'telefono' | 'motivo' | 'mensaje' | 'consentimiento';

export interface ContactData {
  nombre: string;
  correo: string;
  telefono: string;
  motivo: string;
  mensaje: string;
  consentimiento: boolean;
}

export type ContactErrors = Partial<Record<ContactField, string>>;

export const MOTIVOS = ['Información general', 'Servicios de la Fundación', 'Otro'] as const;

export const LIMITS = {
  nombreMin: 2,
  nombreMax: 80,
  mensajeMin: 10,
  // Los enlaces mailto muy largos fallan en algunos clientes de correo.
  mensajeMax: 1500,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

export function validateContact(data: ContactData): ContactErrors {
  const errors: ContactErrors = {};
  const nombre = data.nombre.trim();
  const correo = data.correo.trim();
  const telefono = data.telefono.trim();
  const mensaje = data.mensaje.trim();

  if (!nombre) errors.nombre = 'Escribe tu nombre.';
  else if (nombre.length < LIMITS.nombreMin) errors.nombre = `El nombre debe tener al menos ${LIMITS.nombreMin} caracteres.`;
  else if (nombre.length > LIMITS.nombreMax) errors.nombre = `El nombre no puede superar ${LIMITS.nombreMax} caracteres.`;

  if (!correo) errors.correo = 'Escribe tu correo electrónico.';
  else if (!EMAIL_RE.test(correo)) errors.correo = 'Escribe un correo válido, por ejemplo nombre@correo.com.';

  if (telefono && (!PHONE_RE.test(telefono) || telefono.replace(/\D/g, '').length < 7)) {
    errors.telefono = 'Escribe un teléfono válido (solo números, espacios o +).';
  }

  if (!(MOTIVOS as readonly string[]).includes(data.motivo)) errors.motivo = 'Elige el motivo de tu mensaje.';

  if (!mensaje) errors.mensaje = 'Escribe tu mensaje.';
  else if (mensaje.length < LIMITS.mensajeMin) errors.mensaje = `El mensaje debe tener al menos ${LIMITS.mensajeMin} caracteres.`;
  else if (mensaje.length > LIMITS.mensajeMax) errors.mensaje = `El mensaje no puede superar ${LIMITS.mensajeMax} caracteres.`;

  if (!data.consentimiento) errors.consentimiento = 'Debes autorizar el tratamiento de tus datos para continuar.';

  return errors;
}

export function composeMessage(data: ContactData): { subject: string; body: string } {
  const subject = `[Sitio web] ${data.motivo} - ${data.nombre.trim()}`;
  const lines = [
    data.mensaje.trim(),
    '',
    '---',
    `Nombre: ${data.nombre.trim()}`,
    `Correo: ${data.correo.trim()}`,
  ];
  if (data.telefono.trim()) lines.push(`Teléfono: ${data.telefono.trim()}`);
  lines.push(`Motivo: ${data.motivo}`);
  return { subject, body: lines.join('\n') };
}

/** Construye el enlace mailto con asunto y cuerpo codificados (RFC 6068). */
export function buildMailto(to: string, data: ContactData): string {
  const { subject, body } = composeMessage(data);
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?${params}`;
}

/** Campos que se envían a FormSubmit (los que empiezan con _ son opciones del servicio). */
export function buildPayload(data: ContactData): Record<string, string> {
  const { subject } = composeMessage(data);
  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    _replyto: data.correo.trim(),
    Nombre: data.nombre.trim(),
    Correo: data.correo.trim(),
    Motivo: data.motivo,
    Mensaje: data.mensaje.trim(),
  };
  if (data.telefono.trim()) payload['Teléfono'] = data.telefono.trim();
  return payload;
}
