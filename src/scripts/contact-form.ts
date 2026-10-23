import {
  buildMailto,
  buildPayload,
  composeMessage,
  LIMITS,
  validateContact,
  type ContactData,
  type ContactErrors,
  type ContactField,
} from './contact-validation.ts';

const FIELDS: readonly ContactField[] = ['nombre', 'correo', 'telefono', 'motivo', 'mensaje', 'consentimiento'];

function readForm(form: HTMLFormElement): ContactData {
  const data = new FormData(form);
  const text = (name: string) => String(data.get(name) ?? '');
  return {
    nombre: text('nombre'),
    correo: text('correo'),
    telefono: text('telefono'),
    motivo: text('motivo'),
    mensaje: text('mensaje'),
    consentimiento: data.get('consentimiento') === 'on',
  };
}

/** Envía el mensaje a FormSubmit; true solo si el servicio confirma el envío. */
async function sendToEndpoint(endpoint: string, data: ContactData): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildPayload(data)),
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const json = (await response.json()) as { success?: boolean | string };
    return json.success === true || json.success === 'true';
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Formulario sin backend propio: valida en el navegador y envía el mensaje con
 * FormSubmit. Si el envío falla, ofrece abrir el correo de la persona (mailto)
 * con el mensaje ya escrito. Solo dice "enviado" cuando el servicio lo confirma.
 */
export function initContactForm(form: HTMLFormElement): void {
  const to = form.dataset['to'] ?? '';
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  const summaryList = form.querySelector<HTMLUListElement>('[data-error-list]');
  const result = form.querySelector<HTMLElement>('[data-result]');
  const retry = form.querySelector<HTMLAnchorElement>('[data-mailto-retry]');
  const copyButton = form.querySelector<HTMLButtonElement>('[data-copy]');
  const copyStatus = form.querySelector<HTMLElement>('[data-copy-status]');
  const counter = form.querySelector<HTMLElement>('[data-counter]');
  const message = form.querySelector<HTMLTextAreaElement>('#mensaje');
  const endpoint = form.dataset['endpoint'] ?? '';
  const sent = form.querySelector<HTMLElement>('[data-sent]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const trap = form.querySelector<HTMLInputElement>('[name="_honey"]');
  if (!summary || !summaryList || !result || !retry || !copyButton || !copyStatus || !sent || !submit) return;

  const touched = new Set<ContactField>();

  const showErrors = (errors: ContactErrors, only?: ReadonlySet<ContactField>) => {
    for (const field of FIELDS) {
      if (only && !only.has(field)) continue;
      const input = form.elements.namedItem(field) as HTMLInputElement | null;
      const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      const error = errors[field];
      if (slot) slot.textContent = error ?? '';
      if (input) {
        if (error) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    }
  };

  // Validación en línea solo después de que la persona sale del campo, para no interrumpir mientras escribe.
  form.addEventListener('focusout', (event) => {
    const name = (event.target as HTMLInputElement).name as ContactField;
    if (!FIELDS.includes(name)) return;
    touched.add(name);
    showErrors(validateContact(readForm(form)), touched);
  });

  form.addEventListener('input', (event) => {
    const name = (event.target as HTMLInputElement).name as ContactField;
    if (touched.has(name)) showErrors(validateContact(readForm(form)), new Set([name]));
  });

  message?.addEventListener('input', () => {
    if (counter) counter.textContent = `${message.value.length} de ${LIMITS.mensajeMax} caracteres.`;
  });

  let lastText = '';

  let sending = false;

  const setSending = (value: boolean) => {
    sending = value;
    submit.classList.toggle('is-sending', value);
    submit.setAttribute('aria-disabled', String(value));
    if (submitLabel) submitLabel.textContent = value ? 'Enviando…' : 'Enviar mensaje';
  };

  const showSent = () => {
    form.reset();
    touched.clear();
    showErrors({});
    if (counter) counter.textContent = `Máximo ${LIMITS.mensajeMax} caracteres.`;
    result.hidden = true;
    sent.hidden = false;
    sent.focus();
  };

  form.querySelector('[data-new-message]')?.addEventListener('click', () => {
    sent.hidden = true;
    (form.elements.namedItem('nombre') as HTMLElement | null)?.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const data = readForm(form);
    const errors = validateContact(data);
    FIELDS.forEach((f) => touched.add(f));
    showErrors(errors);

    const invalid = FIELDS.filter((f) => errors[f]);
    if (invalid.length > 0) {
      result.hidden = true;
      summaryList.replaceChildren(
        ...invalid.map((field) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = `#${field}`;
          a.textContent = errors[field] ?? '';
          a.addEventListener('click', (e) => {
            e.preventDefault();
            (form.elements.namedItem(field) as HTMLElement | null)?.focus();
          });
          li.append(a);
          return li;
        }),
      );
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;
    sent.hidden = true;
    result.hidden = true;

    // Un robot llenó el campo trampa: se finge el envío sin mandar nada.
    if (trap?.value) {
      showSent();
      return;
    }

    if (endpoint) {
      setSending(true);
      const ok = await sendToEndpoint(endpoint, data);
      setSending(false);
      if (ok) {
        showSent();
        return;
      }
    }

    // Sin servicio de envío, o si falló: el mensaje se abre en el correo de la persona.
    const href = buildMailto(to, data);
    const { subject, body } = composeMessage(data);
    lastText = `Para: ${to}\nAsunto: ${subject}\n\n${body}`;
    retry.href = href;
    copyStatus.textContent = '';
    result.hidden = false;
    result.focus();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(lastText);
      copyStatus.textContent = 'Mensaje copiado al portapapeles.';
    } catch {
      copyStatus.textContent = 'No se pudo copiar automáticamente. Selecciona y copia el texto del formulario.';
    }
  });
}
