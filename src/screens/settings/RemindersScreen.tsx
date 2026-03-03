import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { buildReminderTimes, cancelLocalReminders, scheduleLocalReminders } from '../../services/reminderService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

const timeOptions = ['06:00', '08:00', '10:00', '20:00', '22:00', '23:00'];

export const RemindersScreen = (): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const {
    setReminderEnabled,
    setReminderFrequency,
    setReminderWindow,
  } = useUserSettingsActions(user?.uid ?? null);

  const settings = userDoc?.settings;
  const [previewTimes, setPreviewTimes] = useState<string[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const start = settings?.remindersWindow.start ?? '08:00';
  const end = settings?.remindersWindow.end ?? '22:00';
  const frequency = settings?.remindersFrequency ?? 3;

  const frequencyOptions: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

  const computedTimes = useMemo(() => buildReminderTimes(frequency, start, end), [frequency, start, end]);

  const updateWindow = async (nextStart: string, nextEnd: string) => {
    await setReminderWindow(nextStart, nextEnd);
    if (!settings?.remindersEnabled) {
      return;
    }

    try {
      setScheduleError(null);
      const scheduled = await scheduleLocalReminders(frequency, nextStart, nextEnd);
      setPreviewTimes(scheduled);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not schedule reminders.';
      setScheduleError(message);
    }
  };

  return (
    <ScreenContainer testID="screen-reminders" style={styles.container}>
      <Text style={styles.title}>Daily Tracking Reminders</Text>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.cardTitle}>Enable reminders</Text>
          <Switch
            value={settings?.remindersEnabled ?? false}
            onValueChange={value => {
              setReminderEnabled(value).catch(() => undefined);

              if (value) {
                setScheduleError(null);
                scheduleLocalReminders(frequency, start, end)
                  .then(times => setPreviewTimes(times))
                  .catch(error => {
                    const message = error instanceof Error ? error.message : 'Could not schedule reminders.';
                    setScheduleError(message);
                  });
              } else {
                cancelLocalReminders().catch(() => undefined);
                setPreviewTimes([]);
              }
            }}
            testID="reminders-enabled-toggle"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Frequency</Text>
        <View style={styles.rowWrap}>
          {frequencyOptions.map(option => (
            <Pressable
              key={option}
              style={[styles.chip, frequency === option && styles.chipActive]}
              onPress={() => {
                setReminderFrequency(option).catch(() => undefined);
                if (settings?.remindersEnabled) {
                  scheduleLocalReminders(option, start, end)
                    .then(times => {
                      setScheduleError(null);
                      setPreviewTimes(times);
                    })
                    .catch(error => {
                      const message = error instanceof Error ? error.message : 'Could not schedule reminders.';
                      setScheduleError(message);
                    });
                }
              }}
              testID={`reminders-frequency-${option}`}>
              <Text style={styles.chipLabel}>{`${option}`}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.caption}>{`${frequency} times a day`}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Time window</Text>

        <Text style={styles.subLabel}>Start</Text>
        <View style={styles.rowWrap}>
          {timeOptions.map(option => (
            <Pressable
              key={`start-${option}`}
              style={[styles.chip, start === option && styles.chipActive]}
              onPress={() => updateWindow(option, end).catch(() => undefined)}
              testID={`reminders-window-start-${option}`}>
              <Text style={styles.chipLabel}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.subLabel}>End</Text>
        <View style={styles.rowWrap}>
          {timeOptions.map(option => (
            <Pressable
              key={`end-${option}`}
              style={[styles.chip, end === option && styles.chipActive]}
              onPress={() => updateWindow(start, option).catch(() => undefined)}
              testID={`reminders-window-end-${option}`}>
              <Text style={styles.chipLabel}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Scheduled times</Text>
        <Text style={styles.caption}>Device notification schedule preview.</Text>
        <Text style={styles.times}>
          {(previewTimes.length > 0 ? previewTimes : computedTimes).join(' · ') || 'None'}
        </Text>
        {scheduleError ? <Text style={styles.errorText}>{scheduleError}</Text> : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: '#FFF1E4',
    borderColor: '#FFD5AA',
  },
  chipLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  subLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  times: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  errorText: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: 12,
  },
});
