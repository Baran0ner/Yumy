import { getCurrentLocale } from '../i18n';

const pad = (value: number): string => value.toString().padStart(2, '0');

export const toDateKey = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const nowIso = (): string => new Date().toISOString();

export const formatDatePill = (dateKey: string): string => {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(getCurrentLocale(), {
    month: 'short',
    day: 'numeric',
  });
};

export const formatLongDate = (dateKey: string): string => {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(getCurrentLocale(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const shiftDateKey = (dateKey: string, deltaDays: number): string => {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return toDateKey(date);
};

export const compareDateKeyDesc = (left: string, right: string): number =>
  right.localeCompare(left);
