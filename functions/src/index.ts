import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

type Bias = 'over' | 'neutral' | 'under';
type Units = 'metric' | 'imperial';

type AnalyzeResult = {
  items: Array<{
    name: string;
    calories: number;
    macros: {
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    };
  }>;
  total: {
    calories: number;
    macros: {
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    };
  };
  sources: Array<{ title: string; type: string }>;
  confidence: number;
  reasoning_summary: string;
  model?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const defaultResult: AnalyzeResult = {
  items: [],
  total: {
    calories: 0,
    macros: {
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    },
  },
  sources: [],
  confidence: 0,
  reasoning_summary: 'No estimate generated.',
};

const coerceNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const applyBiasMultiplier = (result: AnalyzeResult, bias: Bias): AnalyzeResult => {
  const multiplier = bias === 'over' ? 1.05 : bias === 'under' ? 0.95 : 1;

  if (multiplier === 1) {
    return result;
  }

  const adjustedItems = result.items.map(item => ({
    ...item,
    calories: Math.round(item.calories * multiplier),
    macros: {
      protein_g: Math.round(item.macros.protein_g * multiplier),
      carbs_g: Math.round(item.macros.carbs_g * multiplier),
      fat_g: Math.round(item.macros.fat_g * multiplier),
    },
  }));

  return {
    ...result,
    items: adjustedItems,
    total: {
      calories: Math.round(result.total.calories * multiplier),
      macros: {
        protein_g: Math.round(result.total.macros.protein_g * multiplier),
        carbs_g: Math.round(result.total.macros.carbs_g * multiplier),
        fat_g: Math.round(result.total.macros.fat_g * multiplier),
      },
    },
  };
};

const parseJsonPayload = (text: string): AnalyzeResult => {
  const trimmed = text.trim();
  const rawJson = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    : trimmed;

  const parsed = JSON.parse(rawJson) as Partial<AnalyzeResult>;

  const items = Array.isArray(parsed.items)
    ? parsed.items.map(item => ({
        name: String(item.name ?? ''),
        calories: Math.round(coerceNumber(item.calories)),
        macros: {
          protein_g: Math.round(coerceNumber(item.macros?.protein_g)),
          carbs_g: Math.round(coerceNumber(item.macros?.carbs_g)),
          fat_g: Math.round(coerceNumber(item.macros?.fat_g)),
        },
      }))
    : [];

  return {
    items,
    total: {
      calories: Math.round(coerceNumber(parsed.total?.calories)),
      macros: {
        protein_g: Math.round(coerceNumber(parsed.total?.macros?.protein_g)),
        carbs_g: Math.round(coerceNumber(parsed.total?.macros?.carbs_g)),
        fat_g: Math.round(coerceNumber(parsed.total?.macros?.fat_g)),
      },
    },
    sources: Array.isArray(parsed.sources)
      ? parsed.sources.map(source => ({
          title: String(source.title ?? 'Unknown source'),
          type: String(source.type ?? 'estimate'),
        }))
      : [],
    confidence: Math.max(0, Math.min(1, coerceNumber(parsed.confidence))),
    reasoning_summary: String(parsed.reasoning_summary ?? defaultResult.reasoning_summary),
  };
};

const buildPrompt = ({
  mealText,
  date,
  locale,
  bias,
  units,
  location,
  photoUrl,
}: {
  mealText?: string;
  date: string;
  locale?: string;
  bias: Bias;
  units: Units;
  location?: string;
  photoUrl?: string;
}): string => {
  const biasInstruction =
    bias === 'over'
      ? 'Slightly overestimate if uncertain.'
      : bias === 'under'
        ? 'Slightly underestimate if uncertain.'
        : 'Use best estimate if uncertain.';

  return [
    'Estimate nutrition for the user meal and return JSON only.',
    'No markdown. No additional text.',
    'Use this exact schema:',
    '{',
    '  "items":[{"name":"...","calories":123,"macros":{"protein_g":10,"carbs_g":20,"fat_g":5}}],',
    '  "total":{"calories":123,"macros":{"protein_g":10,"carbs_g":20,"fat_g":5}},',
    '  "sources":[{"title":"USDA FoodData Central","type":"database"}],',
    '  "confidence":0.7,',
    '  "reasoning_summary":"Short explanation for user (no chain of thought)."',
    '}',
    `Date: ${date}`,
    `Locale: ${locale ?? 'en-US'}`,
    `Units: ${units}`,
    `Bias: ${bias} (${biasInstruction})`,
    location ? `Location context (city/region only): ${location}` : 'Location context: not provided',
    mealText ? `Meal text: ${mealText}` : '',
    photoUrl ? `Photo URL for meal reference: ${photoUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const callGemini = async (prompt: string): Promise<AnalyzeResult> => {
  if (!GEMINI_API_KEY) {
    throw new HttpsError('failed-precondition', 'GEMINI_API_KEY is not configured.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    throw new HttpsError('internal', 'Gemini request failed.');
  }

  const payload = (await response.json()) as GeminiResponse;
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new HttpsError('internal', 'Gemini response was empty.');
  }

  const parsed = parseJsonPayload(text);
  return {
    ...parsed,
    model: GEMINI_MODEL,
  };
};

const parseBias = (value: unknown): Bias =>
  value === 'over' || value === 'under' || value === 'neutral' ? value : 'neutral';

const parseUnits = (value: unknown): Units => (value === 'imperial' ? 'imperial' : 'metric');

export const analyzeMealText = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const mealText = String(request.data?.mealText ?? '').trim();
  const date = String(request.data?.date ?? '').trim();

  if (mealText.length < 3) {
    throw new HttpsError('invalid-argument', 'mealText must include at least 3 characters.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpsError('invalid-argument', 'date must be in yyyy-mm-dd format.');
  }

  const bias = parseBias(request.data?.bias);
  const units = parseUnits(request.data?.units);
  const locale = request.data?.locale ? String(request.data.locale) : undefined;
  const location = request.data?.location ? String(request.data.location) : undefined;

  const prompt = buildPrompt({
    mealText,
    date,
    locale,
    bias,
    units,
    location,
  });

  const result = await callGemini(prompt);
  return applyBiasMultiplier(result, bias);
});

export const analyzeMealPhoto = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const photoUrl = String(request.data?.photoUrl ?? '').trim();
  const date = String(request.data?.date ?? '').trim();

  if (!photoUrl) {
    throw new HttpsError('invalid-argument', 'photoUrl is required.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpsError('invalid-argument', 'date must be in yyyy-mm-dd format.');
  }

  const bias = parseBias(request.data?.bias);
  const units = parseUnits(request.data?.units);
  const locale = request.data?.locale ? String(request.data.locale) : undefined;
  const location = request.data?.location ? String(request.data.location) : undefined;

  const prompt = buildPrompt({
    date,
    locale,
    bias,
    units,
    location,
    photoUrl,
  });

  const result = await callGemini(prompt);
  return applyBiasMultiplier(result, bias);
});

export const recomputeDayTotals = onCall(async request => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = request.auth.uid;
  const date = String(request.data?.date ?? '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new HttpsError('invalid-argument', 'date must be in yyyy-mm-dd format.');
  }

  const db = getFirestore();
  const entriesRef = db.collection('users').doc(uid).collection('days').doc(date).collection('entries');
  const snapshot = await entriesRef.get();

  const totals = snapshot.docs.reduce(
    (acc, doc) => {
      const data = doc.data() as {
        status?: string;
        nutrition?: {
          calories?: number;
          macros?: {
            proteinG?: number;
            carbsG?: number;
            fatG?: number;
          };
        };
      };

      if (data.status !== 'ready') {
        return acc;
      }

      return {
        calories: acc.calories + coerceNumber(data.nutrition?.calories),
        proteinG: acc.proteinG + coerceNumber(data.nutrition?.macros?.proteinG),
        carbsG: acc.carbsG + coerceNumber(data.nutrition?.macros?.carbsG),
        fatG: acc.fatG + coerceNumber(data.nutrition?.macros?.fatG),
        readyCount: acc.readyCount + 1,
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, readyCount: 0 },
  );

  await db.collection('users').doc(uid).collection('days').doc(date).set(
    {
      totalCalories: Math.round(totals.calories),
      totalMacros: {
        proteinG: Math.round(totals.proteinG),
        carbsG: Math.round(totals.carbsG),
        fatG: Math.round(totals.fatG),
      },
      streakEligible: totals.readyCount > 0,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return {
    totalCalories: Math.round(totals.calories),
    totalMacros: {
      proteinG: Math.round(totals.proteinG),
      carbsG: Math.round(totals.carbsG),
      fatG: Math.round(totals.fatG),
    },
    streakEligible: totals.readyCount > 0,
  };
});

