import type { MacroNutrients } from '../types/meal';

export type NutritionResult = {
  calories: number;
  macros: MacroNutrients;
};

const keywordCalories: Record<string, number> = {
  egg: 78,
  eggs: 78,
  toast: 90,
  chicken: 165,
  rice: 130,
  yogurt: 120,
  salad: 80,
  banana: 105,
  apple: 95,
  bread: 85,
  cheese: 110,
};

export const estimateNutritionFromText = (text: string): NutritionResult => {
  const lower = text.toLowerCase();
  let calories = 0;

  for (const [keyword, value] of Object.entries(keywordCalories)) {
    if (lower.includes(keyword)) {
      calories += value;
    }
  }

  if (calories === 0) {
    calories = 250;
  }

  return {
    calories,
    macros: {
      protein: Math.round((calories * 0.2) / 4),
      carbs: Math.round((calories * 0.5) / 4),
      fat: Math.round((calories * 0.3) / 9),
    },
  };
};
