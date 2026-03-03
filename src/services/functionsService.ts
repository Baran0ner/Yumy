import functions from '@react-native-firebase/functions';
import type { AnalyzeResult, CalorieBias, Units } from '../types/firestore';

type AnalyzeMealTextArgs = {
  mealText: string;
  date: string;
  locale?: string;
  bias: CalorieBias;
  units: Units;
  location?: string;
};

type AnalyzeMealPhotoArgs = {
  photoUrl: string;
  date: string;
  locale?: string;
  bias: CalorieBias;
  units: Units;
  location?: string;
};

export const analyzeMealText = async (payload: AnalyzeMealTextArgs): Promise<AnalyzeResult> => {
  const callable = functions().httpsCallable('analyzeMealText');
  const result = await callable(payload);
  return result.data as AnalyzeResult;
};

export const analyzeMealPhoto = async (payload: AnalyzeMealPhotoArgs): Promise<AnalyzeResult> => {
  const callable = functions().httpsCallable('analyzeMealPhoto');
  const result = await callable(payload);
  return result.data as AnalyzeResult;
};

export const recomputeDayTotals = async (date: string): Promise<void> => {
  const callable = functions().httpsCallable('recomputeDayTotals');
  await callable({ date });
};

