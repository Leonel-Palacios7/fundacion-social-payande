import type { ServiceIcon } from '../data/services.ts';

/** Estrella de cinco puntas centrada en (cx, cy), para el ícono de beneficiarios. */
function star(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
}

/** Trazos de cada ícono (viewBox 24×24). Se dibujan con stroke para poder animarlos. */
export const serviceIcons: Record<ServiceIcon, string> = {
  educacion: `
    <ellipse cx="12" cy="12" rx="10" ry="4" pathLength="1" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" pathLength="1" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" pathLength="1" />
    <circle cx="12" cy="12" r="1.6" pathLength="1" />`,
  padrino: `
    <circle cx="12" cy="6.5" r="3" pathLength="1" />
    <circle cx="5" cy="9" r="2.2" pathLength="1" />
    <circle cx="19" cy="9" r="2.2" pathLength="1" />
    <path d="M7 21v-3a5 5 0 0 1 10 0v3" pathLength="1" />
    <path d="M1.5 21v-2a3.8 3.8 0 0 1 4.6-3.7" pathLength="1" />
    <path d="M22.5 21v-2a3.8 3.8 0 0 0-4.6-3.7" pathLength="1" />`,
  salud: `
    <path d="M12 20.5S3 15 3 8.8a4.8 4.8 0 0 1 9-2.4 4.8 4.8 0 0 1 9 2.4C21 15 12 20.5 12 20.5z" pathLength="1" />
    <path d="M7.5 11h2.2l1.2-2.2 2 4.4 1.3-2.2h2.3" pathLength="1" />`,
  vivienda: `
    <path d="M7 11.8 12 7.5l5 4.3V17H7z" pathLength="1" />
    <path d="M11 17v-3h2v3" pathLength="1" />
    <path d="M12 7.5V5.5h1.5v1.3" pathLength="1" />
    <path d="M2 11v5.4a3 3 0 0 0 .9 2.1L6.5 22" pathLength="1" />
    <path d="M22 11v5.4a3 3 0 0 1-.9 2.1L17.5 22" pathLength="1" />`,
  beneficiarios: `
    <circle cx="12" cy="5" r="2.6" pathLength="1" />
    <path d="M8 14v-2.5a4 4 0 0 1 8 0V14" pathLength="1" />
    <path d="${star(5, 18.5, 3.2)}" pathLength="1" />
    <path d="${star(12, 18.5, 3.2)}" pathLength="1" />
    <path d="${star(19, 18.5, 3.2)}" pathLength="1" />`,
  otros: `
    <path d="M12 4a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2V17h5v-.2c0-.8.4-1.5 1.1-2A6 6 0 0 0 12 4z" pathLength="1" />
    <path d="M9.5 20h5M10.5 22.5h3" pathLength="1" />
    <path d="M12 .8v1.4M3.2 10H1.8M22.2 10h-1.4M5 3.2l1 1M19 3.2l-1 1" pathLength="1" />`,
};
