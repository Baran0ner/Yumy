import { appConfig, isEdamamConfigured } from '../config/appConfig';
import { estimateNutritionFromText, type NutritionResult } from '../utils/nutritionFallback';

type EdamamResponse = {
  calories?: number;
  totalNutrients?: {
    PROCNT?: { quantity?: number };
    CHOCDF?: { quantity?: number };
    FAT?: { quantity?: number };
  };
};

const EDAMAM_ENDPOINT = 'https://api.edamam.com/api/nutrition-data';

const mapEdamamResponse = (payload: EdamamResponse): NutritionResult | null => {
  if (typeof payload.calories !== 'number') {
    return null;
  }

  return {
    calories: Math.round(payload.calories),
    macros: {
      protein: Math.round(payload.totalNutrients?.PROCNT?.quantity ?? 0),
      carbs: Math.round(payload.totalNutrients?.CHOCDF?.quantity ?? 0),
      fat: Math.round(payload.totalNutrients?.FAT?.quantity ?? 0),
    },
  };
};

export const analyzeNutrition = async (description: string): Promise<NutritionResult> => {
  if (!isEdamamConfigured()) {
    return estimateNutritionFromText(description);
  }

  try {
    const query = new URLSearchParams({
      app_id: appConfig.edamamAppId,
      app_key: appConfig.edamamAppKey,
      ingr: description,
    });

    const response = await fetch(`${EDAMAM_ENDPOINT}?${query.toString()}`);
    if (!response.ok) {
      return estimateNutritionFromText(description);
    }

    const payload = (await response.json()) as EdamamResponse;
    return mapEdamamResponse(payload) ?? estimateNutritionFromText(description);
  } catch {
    return estimateNutritionFromText(description);
  }
};
