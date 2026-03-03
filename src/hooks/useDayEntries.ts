import { useEffect, useMemo, useState } from 'react';
import type { JournalEntry, MacroTotals } from '../types/firestore';
import { subscribeEntries, writeDayTotals } from '../services/journalService';

const defaultMacros: MacroTotals = {
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
};

export const useDayEntries = (uid: string | null, dateKey: string) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeEntries(
      uid,
      dateKey,
      nextEntries => {
        setEntries(nextEntries);
        setIsLoading(false);
      },
      () => {
        setError('Could not load entries.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, dateKey]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    writeDayTotals(uid, dateKey, entries).catch(() => undefined);
  }, [uid, dateKey, entries]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, entry) => {
          if (entry.status !== 'ready') {
            return acc;
          }

          return {
            calories: acc.calories + entry.nutrition.calories,
            macros: {
              proteinG: acc.macros.proteinG + entry.nutrition.macros.proteinG,
              carbsG: acc.macros.carbsG + entry.nutrition.macros.carbsG,
              fatG: acc.macros.fatG + entry.nutrition.macros.fatG,
            },
          };
        },
        { calories: 0, macros: defaultMacros },
      ),
    [entries],
  );

  return {
    entries,
    totals,
    isLoading,
    error,
  };
};

