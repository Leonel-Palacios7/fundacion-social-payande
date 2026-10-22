import {
  buildMailto,
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

/**
 * Formulario sin backend: valida en el navegador y prepara un correo (mailto)
 * para que la persona lo envíe desde su propia aplicación. Nunca muestra
 * "mensaje enviado", porque el sitio no puede comprobar el envío.
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
  if (!summary || !summaryList || !result || !retry || !copyButton || !copyStatus) return;

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
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
    const href = buildMailto(to, data);
    const { subject, body } = composeMessage(data);
    lastText = `Para: ${to}\nAsunto: ${subject}\n\n${body}`;
    retry.href = href;
    copyStatus.textContent = '';
    result.hidden = false;
    window.location.href = href;
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
