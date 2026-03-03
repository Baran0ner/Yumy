import { useEffect, useMemo, useState } from 'react';
import { shiftDateKey, toDateKey } from '../utils/date';
import { subscribeDays } from '../services/journalService';

type DaySummary = {
  id: string;
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  streakEligible: boolean;
  updatedAt: string;
  readyCount: number;
};

export const useDaysSummary = (uid: string | null) => {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setDays([]);
      return;
    }

    const unsubscribe = subscribeDays(
      uid,
      nextDays => {
        setDays(nextDays);
        setError(null);
      },
      () => {
        setError('Could not load day history.');
      },
    );

    return unsubscribe;
  }, [uid]);

  const streakCount = useMemo(() => {
    if (days.length === 0) {
      return 0;
    }

    const byDate = new Map(days.map(day => [day.id, day]));
    let cursor = toDateKey(new Date());
    let total = 0;

    while (byDate.get(cursor)?.streakEligible) {
      total += 1;
      cursor = shiftDateKey(cursor, -1);
    }

    return total;
  }, [days]);

  return {
    days,
    streakCount,
    error,
  };
};
