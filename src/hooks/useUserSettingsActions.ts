import { useCallback } from 'react';
import { updateMacroTargets, updateReminderWindow, updateUserSettings } from '../services/userService';
import type { AppLanguage, CalorieBias, Units, UserSettings } from '../types/firestore';

export const useUserSettingsActions = (uid: string | null) => {
  const setLanguage = useCallback(
    async (language: AppLanguage) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { language });
    },
    [uid],
  );

  const setCalorieBias = useCallback(
    async (calorieBias: CalorieBias) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { calorieBias });
    },
    [uid],
  );

  const setThoughtProcessVisible = useCallback(
    async (showThoughtProcess: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { showThoughtProcess });
    },
    [uid],
  );

  const setReminderEnabled = useCallback(
    async (remindersEnabled: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { remindersEnabled });
    },
    [uid],
  );

  const setReminderFrequency = useCallback(
    async (remindersFrequency: 1 | 2 | 3 | 4 | 5) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { remindersFrequency });
    },
    [uid],
  );

  const setReminderWindow = useCallback(
    async (start: string, end: string) => {
      if (!uid) {
        return;
      }
      await updateReminderWindow(uid, start, end);
    },
    [uid],
  );

  const setUnits = useCallback(
    async (units: Units) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { units });
    },
    [uid],
  );

  const setLocationForRestaurants = useCallback(
    async (useLocationForRestaurants: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { useLocationForRestaurants });
    },
    [uid],
  );

  const setHealthSync = useCallback(
    async (healthSyncEnabled: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { healthSyncEnabled });
    },
    [uid],
  );

  const setHealthSyncWeight = useCallback(
    async (healthSyncWeight: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { healthSyncWeight });
    },
    [uid],
  );

  const setHealthSyncSteps = useCallback(
    async (healthSyncSteps: boolean) => {
      if (!uid) {
        return;
      }
      await updateUserSettings(uid, { healthSyncSteps });
    },
    [uid],
  );

  const setMacroTargets = useCallback(
    async (macroTargets: UserSettings['macroTargets']) => {
      if (!uid) {
        return;
      }
      await updateMacroTargets(uid, macroTargets);
    },
    [uid],
  );

  return {
    setLanguage,
    setCalorieBias,
    setThoughtProcessVisible,
    setReminderEnabled,
    setReminderFrequency,
    setReminderWindow,
    setUnits,
    setLocationForRestaurants,
    setHealthSync,
    setHealthSyncWeight,
    setHealthSyncSteps,
    setMacroTargets,
  };
};
