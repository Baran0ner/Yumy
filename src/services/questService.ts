import type { UserSettings } from '../types/firestore';

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

export type WeeklyQuestId =
  | 'log_3_meals_for_5_days'
  | 'hit_protein_target_3_days'
  | 'stay_within_calorie_target_4_days';

export type WeeklyQuestProgress = {
  id: WeeklyQuestId;
  title: string;
  target: number;
  current: number;
  completed: boolean;
};

export type BadgeProgress = {
  id: string;
  label: string;
  unlocked: boolean;
};

const withinLastDays = (dateKey: string, days: number, now: Date = new Date()): boolean => {
  const endDate = new Date(now);
  endDate.setHours(12, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (days - 1));

  const dayDate = new Date(`${dateKey}T12:00:00`);
  return dayDate >= startDate && dayDate <= endDate;
};

export const computeWeeklyQuestProgress = (
  days: DaySummary[],
  settings: Pick<UserSettings, 'macroTargets'>,
): WeeklyQuestProgress[] => {
  const recent = days.filter(day => withinLastDays(day.id, 7));

  const log3MealsCount = recent.filter(day => day.readyCount >= 3).length;
  const proteinTargetCount = recent.filter(
    day => day.proteinG >= settings.macroTargets.proteinG && day.readyCount > 0,
  ).length;
  const caloriesWithinTargetCount = recent.filter(day => {
    if (day.readyCount === 0) {
      return false;
    }

    const tolerance = Math.round(settings.macroTargets.calories * 0.1);
    return Math.abs(day.totalCalories - settings.macroTargets.calories) <= tolerance;
  }).length;

  return [
    {
      id: 'log_3_meals_for_5_days',
      title: 'Log 3 meals for 5 days',
      target: 5,
      current: log3MealsCount,
      completed: log3MealsCount >= 5,
    },
    {
      id: 'hit_protein_target_3_days',
      title: 'Hit protein target 3 days',
      target: 3,
      current: proteinTargetCount,
      completed: proteinTargetCount >= 3,
    },
    {
      id: 'stay_within_calorie_target_4_days',
      title: 'Stay near calorie target 4 days',
      target: 4,
      current: caloriesWithinTargetCount,
      completed: caloriesWithinTargetCount >= 4,
    },
  ];
};

export const computeBadges = (
  streakCount: number,
  quests: WeeklyQuestProgress[],
): BadgeProgress[] => {
  const completedQuestCount = quests.filter(quest => quest.completed).length;

  return [
    { id: 'first-log', label: 'First Log', unlocked: streakCount >= 1 },
    { id: 'three-day', label: '3 Day Streak', unlocked: streakCount >= 3 },
    { id: 'seven-day', label: '7 Day Streak', unlocked: streakCount >= 7 },
    { id: 'quest-starter', label: 'Quest Starter', unlocked: completedQuestCount >= 1 },
    { id: 'macro-master', label: 'Macro Master', unlocked: completedQuestCount >= 2 },
    { id: 'consistency', label: 'Consistency Hero', unlocked: completedQuestCount >= 3 },
  ];
};
