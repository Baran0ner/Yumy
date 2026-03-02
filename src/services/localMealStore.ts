import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MealEntry } from '../types/meal';

const ENTRIES_KEY = 'meal_entries_v1';

const safeParse = (raw: string | null): MealEntry[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as MealEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const getLocalEntries = async (): Promise<MealEntry[]> => {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  return safeParse(raw);
};

export const saveLocalEntries = async (entries: MealEntry[]): Promise<void> => {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};
