import React, { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { buildReminderTimes, cancelLocalReminders, scheduleLocalReminders } from '../../services/reminderService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

const timeOptions = ['06:00', '08:00', '10:00', '20:00', '22:00', '23:00'];

export const RemindersScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
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
      const message = error instanceof Error ? error.message : t('reminders.scheduleFailed');
      setScheduleError(message);
    }
  };

  return (
    <ScreenContainer testID="screen-reminders" style={styles.container}>
      <Text style={styles.title}>{t('reminders.title')}</Text>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <View style={styles.toggleRow}>
          <Text style={styles.cardTitle}>{t('reminders.enable')}</Text>
          <Switch
            value={settings?.remindersEnabled ?? false}
            onValueChange={value => {
              setReminderEnabled(value).catch(() => undefined);

              if (value) {
                setScheduleError(null);
                scheduleLocalReminders(frequency, start, end)
                  .then(times => setPreviewTimes(times))
                  .catch(error => {
                    const message = error instanceof Error ? error.message : t('reminders.scheduleFailed');
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
      </AppCard>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.cardTitle}>{t('reminders.frequency')}</Text>
        <View style={styles.rowWrap}>
          {frequencyOptions.map(option => (
            <AppButton
              key={option}
              variant={frequency === option ? 'primary' : 'outline'}
              size="sm"
              onPress={() => {
                setReminderFrequency(option).catch(() => undefined);
                if (settings?.remindersEnabled) {
                  scheduleLocalReminders(option, start, end)
                    .then(times => {
                      setScheduleError(null);
                      setPreviewTimes(times);
                    })
                    .catch(error => {
                      const message = error instanceof Error ? error.message : t('reminders.scheduleFailed');
                      setScheduleError(message);
                    });
                }
              }}
              testID={`reminders-frequency-${option}`}>
              {`${option}`}
            </AppButton>
          ))}
        </View>
        <Text style={styles.caption}>{t('reminders.timesPerDay', { count: frequency })}</Text>
      </AppCard>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.cardTitle}>{t('reminders.timeWindow')}</Text>

        <Text style={styles.subLabel}>{t('reminders.start')}</Text>
        <View style={styles.rowWrap}>
          {timeOptions.map(option => (
            <AppButton
              key={`start-${option}`}
              variant={start === option ? 'primary' : 'outline'}
              size="sm"
              onPress={() => updateWindow(option, end).catch(() => undefined)}
              testID={`reminders-window-start-${option}`}>
              {option}
            </AppButton>
          ))}
        </View>

        <Text style={styles.subLabel}>{t('reminders.end')}</Text>
        <View style={styles.rowWrap}>
          {timeOptions.map(option => (
            <AppButton
              key={`end-${option}`}
              variant={end === option ? 'primary' : 'outline'}
              size="sm"
              onPress={() => updateWindow(start, option).catch(() => undefined)}
              testID={`reminders-window-end-${option}`}>
              {option}
            </AppButton>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.cardTitle}>{t('reminders.scheduledTimes')}</Text>
        <Text style={styles.caption}>{t('reminders.devicePreview')}</Text>
        <Text style={styles.times}>
          {(previewTimes.length > 0 ? previewTimes : computedTimes).join(' · ') || t('reminders.none')}
        </Text>
        {scheduleError ? <Text style={styles.errorText}>{scheduleError}</Text> : null}
      </AppCard>
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
    marginBottom: spacing.xs,
  },
  cardContent: {
    gap: spacing.sm,
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