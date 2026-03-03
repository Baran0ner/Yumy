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

export type BarcodeLookupArgs = {
  barcode: string;
  locale?: string;
};

export type BarcodeLookupResult = {
  found: boolean;
  productName: string;
  calories: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  sourceTitle: string;
};

export type StartGuestTrialResult = {
  startedAt: string;
  expiresAt: string;
  isStarted: boolean;
  isActive: boolean;
  alreadyStarted: boolean;
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

export const lookupBarcode = async (payload: BarcodeLookupArgs): Promise<BarcodeLookupResult> => {
  const callable = functions().httpsCallable('lookupBarcode');
  const result = await callable(payload);
  return result.data as BarcodeLookupResult;
};

export const startGuestTrial = async (): Promise<StartGuestTrialResult> => {
  const callable = functions().httpsCallable('startGuestTrial');
  const result = await callable({});
  return result.data as StartGuestTrialResult;
};

export const recomputeDayTotals = async (date: string): Promise<void> => {
  const callable = functions().httpsCallable('recomputeDayTotals');
  await callable({ date });
};
