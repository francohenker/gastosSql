const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const money = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const pad = (n: number) => String(n).padStart(2, '0');

export const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const currentMonth = () => toDateStr(new Date()).slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Fecha por defecto para altas: hoy si es el mes seleccionado, si no el día 1 de ese mes. */
export function defaultDateFor(month: string): string {
  const today = toDateStr(new Date());
  return today.slice(0, 7) === month ? today : `${month}-01`;
}

/** Acepta "1234,5" o "1234.5"; devuelve null si no es un número válido. */
export function parseAmount(s: string): number | null {
  const n = Number(s.trim().replace(',', '.'));
  return s.trim() !== '' && Number.isFinite(n) ? n : null;
}

export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && toDateStr(new Date(`${s}T12:00:00`)) === s;
