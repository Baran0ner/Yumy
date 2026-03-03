import { computeWeeklyQuestProgress } from '../src/services/questService';

describe('questService', () => {
  it('computes weekly quest progress from day summaries', () => {
    const days = [
      { id: '2026-03-03', totalCalories: 2200, proteinG: 150, carbsG: 220, fatG: 70, streakEligible: true, updatedAt: 'x', readyCount: 3 },
      { id: '2026-03-02', totalCalories: 2150, proteinG: 145, carbsG: 210, fatG: 65, streakEligible: true, updatedAt: 'x', readyCount: 3 },
      { id: '2026-03-01', totalCalories: 2280, proteinG: 130, carbsG: 240, fatG: 72, streakEligible: true, updatedAt: 'x', readyCount: 3 },
      { id: '2026-02-28', totalCalories: 2200, proteinG: 155, carbsG: 220, fatG: 70, streakEligible: true, updatedAt: 'x', readyCount: 3 },
      { id: '2026-02-27', totalCalories: 2000, proteinG: 120, carbsG: 180, fatG: 60, streakEligible: true, updatedAt: 'x', readyCount: 2 },
    ];

    const result = computeWeeklyQuestProgress(days, {
      macroTargets: {
        calories: 2200,
        proteinG: 140,
        carbsG: 220,
        fatG: 70,
      },
    });

    expect(result.find(item => item.id === 'log_3_meals_for_5_days')?.current).toBe(4);
    expect(result.find(item => item.id === 'hit_protein_target_3_days')?.current).toBe(3);
    expect(result.find(item => item.id === 'stay_within_calorie_target_4_days')?.current).toBe(5);
  });
});
