import type {
  AnalyzeItem,
  DayDoc,
  EntryDoc,
  JournalEntry,
  SavedMeal,
  SavedMealDoc,
  UserDoc,
} from '../../types/firestore';
import { defaultSettings, defaultSubscription } from '../defaults';

type TimestampLike = {
  toDate?: () => Date;
};

const toIso = (value: unknown, fallback: string = new Date().toISOString()): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && typeof (value as TimestampLike).toDate === 'function') {
    return (value as TimestampLike).toDate!().toISOString();
  }

  return fallback;
};

const numberOr = (value: unknown, fallback: number = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapAnalyzeItems = (items: unknown): AnalyzeItem[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(item => ({
    name: String((item as AnalyzeItem)?.name ?? ''),
    calories: numberOr((item as AnalyzeItem)?.calories),
    macros: {
      protein_g: numberOr((item as AnalyzeItem)?.macros?.protein_g),
      carbs_g: numberOr((item as AnalyzeItem)?.macros?.carbs_g),
      fat_g: numberOr((item as AnalyzeItem)?.macros?.fat_g),
    },
  }));
};

export const mapUserDoc = (value: unknown): UserDoc => {
  const source = (value as Partial<UserDoc>) ?? {};
  const settings = source.settings ?? defaultSettings;
  const subscription = source.subscription ?? defaultSubscription;

  return {
    displayName: String(source.displayName ?? ''),
    email: String(source.email ?? ''),
    createdAt: toIso(source.createdAt),
    settings: {
      ...defaultSettings,
      ...settings,
      macroTargets: {
        ...defaultSettings.macroTargets,
        ...(settings.macroTargets ?? {}),
      },
      remindersWindow: {
        ...defaultSettings.remindersWindow,
        ...(settings.remindersWindow ?? {}),
      },
      guestTrialStartedAt: settings.guestTrialStartedAt ?? null,
      guestTrialExpiresAt: settings.guestTrialExpiresAt ?? null,
      guestTrialConsumed: Boolean(settings.guestTrialConsumed),
    },
    subscription: {
      ...defaultSubscription,
      ...subscription,
      renewedAt: subscription.renewedAt ?? null,
      expiresAt: subscription.expiresAt ?? null,
    },
  };
};

export const mapEntryDoc = (id: string, value: unknown): JournalEntry => {
  const source = (value as Partial<EntryDoc>) ?? {};
  return {
    id,
    mealText: String(source.mealText ?? ''),
    createdAt: toIso(source.createdAt),
    source: source.source ?? 'text',
    status: source.status ?? 'processing',
    nutrition: {
      calories: numberOr(source.nutrition?.calories),
      macros: {
        proteinG: numberOr(source.nutrition?.macros?.proteinG),
        carbsG: numberOr(source.nutrition?.macros?.carbsG),
        fatG: numberOr(source.nutrition?.macros?.fatG),
      },
      micros: source.nutrition?.micros,
    },
    ai: {
      model: String(source.ai?.model ?? 'gemini-unknown'),
      confidence: numberOr(source.ai?.confidence),
      sourcesCount: numberOr(source.ai?.sourcesCount),
      reasoningSummary: String(source.ai?.reasoningSummary ?? ''),
      items: mapAnalyzeItems(source.ai?.items),
      sources: Array.isArray(source.ai?.sources)
        ? source.ai.sources.map(sourceItem => ({
            title: String(sourceItem?.title ?? ''),
            type: String(sourceItem?.type ?? ''),
          }))
        : [],
    },
    attachments: {
      photoUrl: source.attachments?.photoUrl,
      thumbnailUrl: source.attachments?.thumbnailUrl,
      barcodeValue: source.attachments?.barcodeValue,
      scanProvider: source.attachments?.scanProvider,
    },
  };
};

export const mapDayDoc = (value: unknown): DayDoc => {
  const source = (value as Partial<DayDoc>) ?? {};
  return {
    totalCalories: numberOr(source.totalCalories),
    totalMacros: {
      proteinG: numberOr(source.totalMacros?.proteinG),
      carbsG: numberOr(source.totalMacros?.carbsG),
      fatG: numberOr(source.totalMacros?.fatG),
    },
    streakEligible: Boolean(source.streakEligible),
    updatedAt: toIso(source.updatedAt),
    readyCount: numberOr(source.readyCount),
  };
};

export const mapSavedMeal = (id: string, value: unknown): SavedMeal => {
  const source = (value as Partial<SavedMealDoc>) ?? {};
  return {
    id,
    title: String(source.title ?? ''),
    defaultText: String(source.defaultText ?? ''),
    nutritionSnapshot: source.nutritionSnapshot
      ? {
          calories: numberOr(source.nutritionSnapshot.calories),
          macros: {
            proteinG: numberOr(source.nutritionSnapshot.macros?.proteinG),
            carbsG: numberOr(source.nutritionSnapshot.macros?.carbsG),
            fatG: numberOr(source.nutritionSnapshot.macros?.fatG),
          },
        }
      : undefined,
    createdAt: toIso(source.createdAt),
  };
};
