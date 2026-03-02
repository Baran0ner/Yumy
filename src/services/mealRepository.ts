import { analyzeNutrition } from './nutritionService';
import { getLocalEntries, saveLocalEntries } from './localMealStore';
import { nowIso, toDateKey } from '../utils/date';
import type { DailySummary, MealEntry, MealEntryInput } from '../types/meal';
import { NoopRemoteMealStore, type RemoteMealStore } from './remoteMealStore';

const createId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sortByDateDesc = (entries: MealEntry[]): MealEntry[] =>
  [...entries].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

export class MealRepository {
  constructor(private readonly remoteStore: RemoteMealStore = new NoopRemoteMealStore()) {}

  async getEntries(userId?: string): Promise<MealEntry[]> {
    const entries = await getLocalEntries();
    const filtered = userId ? entries.filter(entry => entry.userId === userId) : entries;
    return sortByDateDesc(filtered);
  }

  private async replaceUserEntries(userId: string, userEntries: MealEntry[]): Promise<void> {
    const allEntries = await getLocalEntries();
    const merged = [...allEntries.filter(entry => entry.userId !== userId), ...sortByDateDesc(userEntries)];
    await saveLocalEntries(merged);
  }

  private mergeLocalAndRemote(localEntries: MealEntry[], remoteEntries: MealEntry[]): MealEntry[] {
    const map = new Map<string, MealEntry>();

    for (const entry of localEntries) {
      map.set(entry.id, entry);
    }

    for (const entry of remoteEntries) {
      map.set(entry.id, { ...entry, synced: true });
    }

    return sortByDateDesc(Array.from(map.values()));
  }

  async refreshFromRemote(userId: string): Promise<MealEntry[]> {
    const localEntries = await this.getEntries(userId);
    const remoteEntries = await this.remoteStore.fetchEntries(userId);

    if (remoteEntries.length === 0) {
      return localEntries;
    }

    const merged = this.mergeLocalAndRemote(localEntries, remoteEntries);
    await this.replaceUserEntries(userId, merged);
    return merged;
  }

  async addEntry(userId: string, input: MealEntryInput): Promise<MealEntry> {
    const nutrition = await analyzeNutrition(input.description);

    const entry: MealEntry = {
      id: createId(),
      userId,
      description: input.description.trim(),
      calories: nutrition.calories,
      macros: nutrition.macros,
      createdAt: nowIso(),
      source: input.source ?? 'manual',
      imageUri: input.imageUri,
      synced: false,
    };

    const userEntries = await this.getEntries(userId);
    const withNew = sortByDateDesc([entry, ...userEntries]);
    await this.replaceUserEntries(userId, withNew);

    const remoteResult = await this.remoteStore.saveEntry(entry);
    if (!remoteResult.synced) {
      return entry;
    }

    const syncedEntry = { ...entry, synced: true };
    const syncedList = withNew.map(item => (item.id === syncedEntry.id ? syncedEntry : item));
    await this.replaceUserEntries(userId, syncedList);
    return syncedEntry;
  }

  async syncUnsynced(userId: string): Promise<number> {
    const userEntries = await this.getEntries(userId);
    let syncedCount = 0;

    const nextEntries: MealEntry[] = [];
    for (const entry of userEntries) {
      if (entry.synced) {
        nextEntries.push(entry);
        continue;
      }

      const remoteResult = await this.remoteStore.saveEntry(entry);
      if (remoteResult.synced) {
        syncedCount += 1;
        nextEntries.push({ ...entry, synced: true });
        continue;
      }

      nextEntries.push(entry);
    }

    await this.replaceUserEntries(userId, nextEntries);
    return syncedCount;
  }
}

export const calculateSummary = (
  entries: MealEntry[],
  dateKey: string = toDateKey(nowIso()),
): DailySummary => {
  const filtered = entries.filter(entry => toDateKey(entry.createdAt) === dateKey);

  return filtered.reduce<DailySummary>(
    (summary, entry) => ({
      ...summary,
      calories: summary.calories + entry.calories,
      protein: summary.protein + entry.macros.protein,
      carbs: summary.carbs + entry.macros.carbs,
      fat: summary.fat + entry.macros.fat,
    }),
    {
      dateKey,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  );
};
