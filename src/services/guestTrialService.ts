import type { UserSettings } from '../types/firestore';

const GUEST_TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

export type GuestTrialStatus = {
  startedAt: string | null;
  expiresAt: string | null;
  isStarted: boolean;
  isActive: boolean;
  isExpired: boolean;
};

const parseDate = (value: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const buildGuestTrialWindow = (startedAtIso: string): { startedAt: string; expiresAt: string } => {
  const startedAtDate = new Date(startedAtIso);
  const expiresAtDate = new Date(startedAtDate.getTime() + GUEST_TRIAL_DURATION_MS);

  return {
    startedAt: startedAtDate.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
  };
};

export const getGuestTrialStatus = (
  settings: Pick<UserSettings, 'guestTrialStartedAt' | 'guestTrialExpiresAt'>,
  now: Date = new Date(),
): GuestTrialStatus => {
  const startedAtDate = parseDate(settings.guestTrialStartedAt);
  const expiresAtDate = parseDate(settings.guestTrialExpiresAt);

  if (!startedAtDate || !expiresAtDate) {
    return {
      startedAt: null,
      expiresAt: null,
      isStarted: false,
      isActive: false,
      isExpired: false,
    };
  }

  const isExpired = now.getTime() >= expiresAtDate.getTime();

  return {
    startedAt: startedAtDate.toISOString(),
    expiresAt: expiresAtDate.toISOString(),
    isStarted: true,
    isActive: !isExpired,
    isExpired,
  };
};
