import {
  dayDocRef,
  entriesCollectionRef,
  entryDocRef,
  savedMealDocRef,
  savedMealsCollectionRef,
  userDocRef,
} from './firebase/firestoreRefs';
import { mapEntryDoc, mapSavedMeal } from './firebase/firestoreMapper';
import type {
  AnalyzeResult,
  EntrySource,
  JournalEntry,
  MacroTotals,
  SavedMeal,
  SavedMealDoc,
} from '../types/firestore';
import { nowIso, toDateKey } from '../utils/date';

type CreateEntryInput = {
  mealText: string;
  source: EntrySource;
  photoUrl?: string;
};

const emptyMacros: MacroTotals = {
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
};

export const subscribeEntries = (
  uid: string,
  dateKey: string,
  onNext: (entries: JournalEntry[]) => void,
  onError: (error: unknown) => void,
): (() => void) => {
  return entriesCollectionRef(uid, dateKey)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const entries = snapshot.docs.map(doc => mapEntryDoc(doc.id, doc.data()));
        onNext(entries);
      },
      error => onError(error),
    );
};

export const subscribeEntry = (
  uid: string,
  dateKey: string,
  entryId: string,
  onNext: (entry: JournalEntry | null) => void,
  onError: (error: unknown) => void,
): (() => void) => {
  return entryDocRef(uid, dateKey, entryId).onSnapshot(
    snapshot => {
      if (!snapshot.exists) {
        onNext(null);
        return;
      }

      onNext(mapEntryDoc(snapshot.id, snapshot.data()));
    },
    error => onError(error),
  );
};

export const createProcessingEntry = async (
  uid: string,
  dateKey: string,
  input: CreateEntryInput,
): Promise<string> => {
  const ref = entriesCollectionRef(uid, dateKey).doc();
  await ref.set({
    mealText: input.mealText,
    createdAt: nowIso(),
    source: input.source,
    status: 'processing',
    nutrition: {
      calories: 0,
      macros: emptyMacros,
    },
    ai: {
      model: 'gemini-pending',
      confidence: 0,
      sourcesCount: 0,
      reasoningSummary: '',
      items: [],
      sources: [],
    },
    attachments: {
      photoUrl: input.photoUrl,
      thumbnailUrl: input.photoUrl,
    },
  });
  return ref.id;
};

export const applyAnalysisResultToEntry = async (
  uid: string,
  dateKey: string,
  entryId: string,
  result: AnalyzeResult,
): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).set(
    {
      status: 'ready',
      nutrition: {
        calories: Math.round(result.total.calories),
        macros: {
          proteinG: Math.round(result.total.macros.protein_g),
          carbsG: Math.round(result.total.macros.carbs_g),
          fatG: Math.round(result.total.macros.fat_g),
        },
      },
      ai: {
        model: result.model ?? 'gemini-2.0-flash',
        confidence: Number(result.confidence ?? 0),
        sourcesCount: result.sources.length,
        reasoningSummary: result.reasoning_summary ?? '',
        items: result.items.map(item => ({
          name: String(item.name ?? ''),
          calories: Math.round(Number(item.calories ?? 0)),
          macros: {
            protein_g: Math.round(Number(item.macros?.protein_g ?? 0)),
            carbs_g: Math.round(Number(item.macros?.carbs_g ?? 0)),
            fat_g: Math.round(Number(item.macros?.fat_g ?? 0)),
          },
        })),
        sources: result.sources.map(source => ({
          title: String(source.title ?? ''),
          type: String(source.type ?? ''),
        })),
      },
    },
    { merge: true },
  );
};

export const markEntryAsError = async (
  uid: string,
  dateKey: string,
  entryId: string,
  reason?: string,
): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).set(
    {
      status: 'error',
      ai: {
        model: 'gemini-error',
        confidence: 0,
        sourcesCount: 0,
        reasoningSummary: reason ?? 'Could not estimate nutrition.',
        items: [],
        sources: [],
      },
    },
    { merge: true },
  );
};

export const updateEntryMealText = async (
  uid: string,
  dateKey: string,
  entryId: string,
  mealText: string,
): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).set({ mealText }, { merge: true });
};

export const markEntryProcessing = async (
  uid: string,
  dateKey: string,
  entryId: string,
): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).set(
    {
      status: 'processing',
    },
    { merge: true },
  );
};

export const overrideEntryNutrition = async (
  uid: string,
  dateKey: string,
  entryId: string,
  calories: number,
  macros: MacroTotals,
): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).set(
    {
      status: 'ready',
      nutrition: {
        calories,
        macros,
      },
      ai: {
        model: 'manual-override',
        confidence: 1,
        sourcesCount: 0,
        reasoningSummary: 'Manually edited by user.',
        items: [
          {
            name: 'Manual override',
            calories,
            macros: {
              protein_g: macros.proteinG,
              carbs_g: macros.carbsG,
              fat_g: macros.fatG,
            },
          },
        ],
        sources: [],
      },
    },
    { merge: true },
  );
};

export const deleteEntry = async (uid: string, dateKey: string, entryId: string): Promise<void> => {
  await entryDocRef(uid, dateKey, entryId).delete();
};

export const duplicateEntry = async (
  uid: string,
  dateKey: string,
  entry: JournalEntry,
): Promise<void> => {
  const cloneRef = entriesCollectionRef(uid, dateKey).doc();
  await cloneRef.set({
    ...entry,
    createdAt: nowIso(),
  });
};

export const writeDayTotals = async (
  uid: string,
  dateKey: string,
  entries: JournalEntry[],
): Promise<void> => {
  const totals = entries.reduce(
    (acc, entry) => {
      if (entry.status !== 'ready') {
        return acc;
      }

      return {
        calories: acc.calories + entry.nutrition.calories,
        proteinG: acc.proteinG + entry.nutrition.macros.proteinG,
        carbsG: acc.carbsG + entry.nutrition.macros.carbsG,
        fatG: acc.fatG + entry.nutrition.macros.fatG,
        readyCount: acc.readyCount + 1,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, readyCount: 0 },
  );

  await dayDocRef(uid, dateKey).set(
    {
      totalCalories: totals.calories,
      totalMacros: {
        proteinG: totals.proteinG,
        carbsG: totals.carbsG,
        fatG: totals.fatG,
      },
      streakEligible: totals.readyCount > 0,
      updatedAt: nowIso(),
    },
    { merge: true },
  );
};

export const subscribeDays = (
  uid: string,
  onNext: (
    days: Array<{
      id: string;
      totalCalories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      streakEligible: boolean;
      updatedAt: string;
    }>,
  ) => void,
  onError: (error: unknown) => void,
): (() => void) => {
  return userDocRef(uid)
    .collection('days')
    .orderBy('updatedAt', 'desc')
    .limit(30)
    .onSnapshot(
      snapshot => {
        onNext(
          snapshot.docs.map(doc => {
            const data = (doc.data() as {
              totalCalories?: number;
              totalMacros?: { proteinG?: number; carbsG?: number; fatG?: number };
              streakEligible?: boolean;
              updatedAt?: string;
            }) ?? { totalCalories: 0, totalMacros: emptyMacros };

            return {
              id: doc.id,
              totalCalories: Number(data.totalCalories ?? 0),
              proteinG: Number(data.totalMacros?.proteinG ?? 0),
              carbsG: Number(data.totalMacros?.carbsG ?? 0),
              fatG: Number(data.totalMacros?.fatG ?? 0),
              streakEligible: Boolean(data.streakEligible),
              updatedAt: String(data.updatedAt ?? ''),
            };
          }),
        );
      },
      error => onError(error),
    );
};

export const subscribeSavedMeals = (
  uid: string,
  onNext: (meals: SavedMeal[]) => void,
  onError: (error: unknown) => void,
): (() => void) => {
  return savedMealsCollectionRef(uid)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        onNext(snapshot.docs.map(doc => mapSavedMeal(doc.id, doc.data())));
      },
      error => onError(error),
    );
};

export const saveMealFromEntry = async (
  uid: string,
  entry: JournalEntry,
  title: string,
): Promise<void> => {
  const doc = savedMealDocRef(uid, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const payload: SavedMealDoc = {
    title,
    defaultText: entry.mealText,
    nutritionSnapshot:
      entry.status === 'ready'
        ? {
            calories: entry.nutrition.calories,
            macros: entry.nutrition.macros,
          }
        : undefined,
    createdAt: nowIso(),
  };
  await doc.set(payload);
};

export const quickAddSavedMeal = async (
  uid: string,
  dateKey: string,
  savedMeal: SavedMeal,
): Promise<string> => {
  const entryId = await createProcessingEntry(uid, dateKey, {
    mealText: savedMeal.defaultText,
    source: 'saved_meal',
  });

  if (savedMeal.nutritionSnapshot) {
    await entryDocRef(uid, dateKey, entryId).set(
      {
        status: 'ready',
        nutrition: {
          calories: savedMeal.nutritionSnapshot.calories,
          macros: savedMeal.nutritionSnapshot.macros,
        },
        ai: {
          model: 'saved-meal-snapshot',
          confidence: 1,
          sourcesCount: 0,
          reasoningSummary: 'Added from saved meal snapshot.',
          items: [
            {
              name: savedMeal.title || 'Saved meal',
              calories: savedMeal.nutritionSnapshot.calories,
              macros: {
                protein_g: savedMeal.nutritionSnapshot.macros.proteinG,
                carbs_g: savedMeal.nutritionSnapshot.macros.carbsG,
                fat_g: savedMeal.nutritionSnapshot.macros.fatG,
              },
            },
          ],
          sources: [],
        },
      },
      { merge: true },
    );
  }

  return entryId;
};

export const findEntryDateKey = async (uid: string, entryId: string): Promise<string | null> => {
  const days = await userDocRef(uid).collection('days').get();

  for (const dayDoc of days.docs) {
    const entry = await entriesCollectionRef(uid, dayDoc.id).doc(entryId).get();
    if (entry.exists()) {
      return dayDoc.id;
    }
  }

  return null;
};

export const ensureDateKey = (candidate?: string): string => {
  if (candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }
  return toDateKey(new Date());
};

