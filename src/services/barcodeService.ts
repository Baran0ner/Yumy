import type { BarcodeLookupResult } from './functionsService';

const numberOrZero = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
};

export const normalizeBarcodeLookupResult = (
  value: Partial<BarcodeLookupResult> | null | undefined,
): BarcodeLookupResult => {
  return {
    found: Boolean(value?.found),
    productName: String(value?.productName ?? ''),
    calories: numberOrZero(value?.calories),
    macros: {
      protein_g: numberOrZero(value?.macros?.protein_g),
      carbs_g: numberOrZero(value?.macros?.carbs_g),
      fat_g: numberOrZero(value?.macros?.fat_g),
    },
    sourceTitle: String(value?.sourceTitle ?? 'OpenFoodFacts'),
  };
};
