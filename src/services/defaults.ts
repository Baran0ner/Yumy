import type { MacroTargets, UserSettings, UserSubscription } from '../types/firestore';

export const defaultMacroTargets: MacroTargets = {
  calories: 2200,
  proteinG: 140,
  carbsG: 220,
  fatG: 70,
};

export const defaultSettings: UserSettings = {
  language: 'auto',
  units: 'metric',
  calorieBias: 'neutral',
  remindersEnabled: false,
  remindersFrequency: 3,
  remindersWindow: { start: '08:00', end: '22:00' },
  useLocationForRestaurants: false,
  healthSyncEnabled: false,
  healthSyncWeight: false,
  healthSyncSteps: false,
  showThoughtProcess: true,
  macroTargets: defaultMacroTargets,
  guestTrialStartedAt: null,
  guestTrialExpiresAt: null,
  guestTrialConsumed: false,
};

export const defaultSubscription: UserSubscription = {
  status: 'inactive',
  provider: 'revenuecat',
  renewedAt: null,
  expiresAt: null,
};
