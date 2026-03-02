import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { FirebaseRemoteMealStore } from '../services/firebaseRemoteMealStore';
import { MealRepository } from '../services/mealRepository';
import type { MealEntry } from '../types/meal';

type MealContextType = {
  entries: MealEntry[];
  isLoading: boolean;
  error: string | null;
  loadEntries: () => Promise<void>;
  addMeal: (description: string, imageUri?: string) => Promise<void>;
  syncPending: () => Promise<number>;
};

const mealRepository = new MealRepository(new FirebaseRemoteMealStore());
const MealContext = createContext<MealContextType | undefined>(undefined);

type MealProviderProps = {
  children: React.ReactNode;
  userId: string;
};

export const MealProvider = ({ children, userId }: MealProviderProps): React.JSX.Element => {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const refreshedEntries = await mealRepository.refreshFromRemote(userId);
      setEntries(refreshedEntries);
    } catch {
      setError('Kayitlar yuklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addMeal = useCallback(
    async (description: string, imageUri?: string) => {
      setError(null);
      try {
        await mealRepository.addEntry(userId, {
          description,
          imageUri,
        });
        const updated = await mealRepository.getEntries(userId);
        setEntries(updated);
      } catch {
        setError('Ogun eklenemedi.');
      }
    },
    [userId],
  );

  const syncPending = useCallback(async () => {
    setError(null);
    try {
      const syncedCount = await mealRepository.syncUnsynced(userId);
      const refreshed = await mealRepository.refreshFromRemote(userId);
      setEntries(refreshed);
      return syncedCount;
    } catch {
      setError('Senkronizasyon basarisiz.');
      return 0;
    }
  }, [userId]);

  const contextValue = useMemo(
    () => ({
      entries,
      isLoading,
      error,
      loadEntries,
      addMeal,
      syncPending,
    }),
    [entries, isLoading, error, loadEntries, addMeal, syncPending],
  );

  return <MealContext.Provider value={contextValue}>{children}</MealContext.Provider>;
};

export const useMealContext = (): MealContextType => {
  const value = useContext(MealContext);
  if (!value) {
    throw new Error('useMealContext must be used inside MealProvider.');
  }
  return value;
};
