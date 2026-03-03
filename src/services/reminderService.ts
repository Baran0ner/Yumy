import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';

const REMINDER_CHANNEL_ID = 'daily-tracking-reminders';
const REMINDER_PREFIX = 'daily-reminder';

const pad = (value: number): string => value.toString().padStart(2, '0');

export const buildReminderTimes = (
  frequency: 1 | 2 | 3 | 4 | 5,
  start: string,
  end: string,
): string[] => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  if (endMin <= startMin) {
    return [start];
  }

  if (frequency === 1) {
    const middle = Math.round((startMin + endMin) / 2);
    return [`${pad(Math.floor(middle / 60))}:${pad(middle % 60)}`];
  }

  const step = (endMin - startMin) / (frequency - 1);

  return Array.from({ length: frequency }, (_, index) => {
    const minute = Math.round(startMin + step * index);
    return `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`;
  });
};

const ensureNotificationPermission = async (): Promise<void> => {
  const settings = await notifee.requestPermission();

  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    throw new Error('Notification permission denied.');
  }
};

const ensureReminderChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Daily Tracking Reminders',
    importance: AndroidImportance.HIGH,
  });
};

const nextTimestampForClock = (clock: string): number => {
  const [hours, minutes] = clock.split(':').map(Number);
  const now = new Date();

  const candidate = new Date(now);
  candidate.setHours(hours, minutes, 0, 0);

  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate.getTime();
};

const clearReminderNotifications = async (): Promise<void> => {
  const triggerIds = await notifee.getTriggerNotificationIds();
  const managedIds = triggerIds.filter(id => id.startsWith(REMINDER_PREFIX));

  if (managedIds.length === 0) {
    return;
  }

  await notifee.cancelTriggerNotifications(managedIds);
};

export const scheduleLocalReminders = async (
  frequency: 1 | 2 | 3 | 4 | 5,
  start: string,
  end: string,
): Promise<string[]> => {
  const times = buildReminderTimes(frequency, start, end);

  await ensureNotificationPermission();
  await ensureReminderChannel();
  await clearReminderNotifications();

  await Promise.all(
    times.map(async (clock, index) => {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: nextTimestampForClock(clock),
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: true,
      };

      await notifee.createTriggerNotification(
        {
          id: `${REMINDER_PREFIX}-${index + 1}`,
          title: 'Log your meals',
          body: 'Write what you ate to keep your streak alive.',
          android: {
            channelId: REMINDER_CHANNEL_ID,
            pressAction: { id: 'default' },
          },
        },
        trigger,
      );
    }),
  );

  return times;
};

export const cancelLocalReminders = async (): Promise<void> => {
  await clearReminderNotifications();
};
