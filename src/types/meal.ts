export type MealSource = 'manual' | 'photo' | 'api' | 'gemini';

export type MacroNutrients = {
  protein: number;
  carbs: number;
  fat: number;
};

export type MealEntry = {
  id: string;
  userId: string;
  description: string;
  calories: number;
  macros: MacroNutrients;
  createdAt: string;
  source: MealSource;
  imageUri?: string;
  synced: boolean;
};

export type MealEntryInput = {
  description: string;
  source?: MealSource;
  imageUri?: string;
};

export type DailySummary = {
  dateKey: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
