import { Platform } from 'react-native';

export type HealthPermissionRequest = {
  syncWeight: boolean;
  syncSteps: boolean;
};

export type HealthPermissionResult = {
  granted: boolean;
  message?: string;
};

export type HealthSnapshot = {
  latestWeightKg: number | null;
  todaySteps: number | null;
};

const getTodayRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  };
};

const toKilograms = (value: number, unit?: string): number => {
  if (unit === 'pound') {
    return Number((value * 0.45359237).toFixed(2));
  }

  return Number(value.toFixed(2));
};

const getIOSSnapshot = async (
  syncWeight: boolean,
  syncSteps: boolean,
): Promise<HealthSnapshot> => {
  const AppleHealthKit = require('react-native-health').default as any;

  const latestWeightKg = syncWeight
    ? await new Promise<number | null>(resolve => {
        AppleHealthKit.getLatestWeight({}, (error: string | null, result: { value?: number } | null) => {
          if (error || !result?.value) {
            resolve(null);
            return;
          }

          resolve(toKilograms(result.value));
        });
      })
    : null;

  const todaySteps = syncSteps
    ? await new Promise<number | null>(resolve => {
        const range = getTodayRange();
        AppleHealthKit.getDailyStepCountSamples(
          { startDate: range.startDate, endDate: range.endDate },
          (error: string | null, results: Array<{ value?: number }> | null) => {
            if (error || !results || results.length === 0) {
              resolve(null);
              return;
            }

            const total = results.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
            resolve(Math.round(total));
          },
        );
      })
    : null;

  return { latestWeightKg, todaySteps };
};

const getAndroidSnapshot = async (
  syncWeight: boolean,
  syncSteps: boolean,
): Promise<HealthSnapshot> => {
  const GoogleFit = require('react-native-google-fit').default as any;

  const range = getTodayRange();

  const latestWeightKg = syncWeight
    ? await GoogleFit.getWeightSamples({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: range.endDate,
        unit: 'kg',
        ascending: false,
      })
        .then((samples: Array<{ value?: number }>) => {
          const value = samples?.[0]?.value;
          return typeof value === 'number' ? Number(value.toFixed(2)) : null;
        })
        .catch(() => null)
    : null;

  const todaySteps = syncSteps
    ? await GoogleFit.getDailyStepCountSamples({
        startDate: range.startDate,
        endDate: range.endDate,
      })
        .then((sources: Array<{ steps?: Array<{ value?: number }> }>) => {
          if (!sources || sources.length === 0) {
            return null;
          }

          const highestSource = sources.reduce((max, source) => {
            const total = (source.steps ?? []).reduce((sum, item) => sum + Number(item.value ?? 0), 0);
            return total > max ? total : max;
          }, 0);

          return highestSource > 0 ? Math.round(highestSource) : null;
        })
        .catch(() => null)
    : null;

  return { latestWeightKg, todaySteps };
};

export const requestHealthPermissions = async (
  request: HealthPermissionRequest,
): Promise<HealthPermissionResult> => {
  if (!request.syncWeight && !request.syncSteps) {
    return {
      granted: false,
      message: 'Enable weight or steps sync before requesting permission.',
    };
  }

  if (Platform.OS === 'ios') {
    const AppleHealthKit = require('react-native-health').default as any;

    const permissions = {
      permissions: {
        read: [
          ...(request.syncWeight ? [AppleHealthKit.Constants.Permissions.Weight] : []),
          ...(request.syncSteps ? [AppleHealthKit.Constants.Permissions.StepCount] : []),
        ],
        write: [
          ...(request.syncWeight ? [AppleHealthKit.Constants.Permissions.Weight] : []),
          ...(request.syncSteps ? [AppleHealthKit.Constants.Permissions.StepCount] : []),
        ],
      },
    };

    return new Promise(resolve => {
      AppleHealthKit.initHealthKit(permissions, (error: string | null) => {
        if (error) {
          resolve({
            granted: false,
            message: error,
          });
          return;
        }

        resolve({ granted: true });
      });
    });
  }

  if (Platform.OS === 'android') {
    const googleFitModule = require('react-native-google-fit');
    const GoogleFit = googleFitModule.default as any;
    const Scopes = googleFitModule.Scopes as Record<string, string>;

    const scopes = [
      ...(request.syncWeight ? [Scopes.FITNESS_BODY_READ, Scopes.FITNESS_BODY_WRITE] : []),
      ...(request.syncSteps ? [Scopes.FITNESS_ACTIVITY_READ] : []),
    ];

    const authorization = await GoogleFit.authorize({ scopes });

    if (!authorization.success) {
      return {
        granted: false,
        message: authorization.message ?? 'Google Fit authorization denied.',
      };
    }

    return { granted: true };
  }

  return {
    granted: false,
    message: 'Health sync is not supported on this platform.',
  };
};

export const readHealthSnapshot = async (
  request: HealthPermissionRequest,
): Promise<HealthSnapshot> => {
  if (Platform.OS === 'ios') {
    return getIOSSnapshot(request.syncWeight, request.syncSteps);
  }

  if (Platform.OS === 'android') {
    return getAndroidSnapshot(request.syncWeight, request.syncSteps);
  }

  return {
    latestWeightKg: null,
    todaySteps: null,
  };
};
