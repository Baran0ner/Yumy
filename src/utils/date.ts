export const toDateKey = (isoDate: string): string => isoDate.slice(0, 10);

export const nowIso = (): string => new Date().toISOString();
