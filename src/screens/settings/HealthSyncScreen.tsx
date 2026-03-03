import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { readHealthSnapshot, requestHealthPermissions } from '../../services/healthService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

export const HealthSyncScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { setHealthSync, setHealthSyncWeight, setHealthSyncSteps } = useUserSettingsActions(user?.uid ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const healthSyncEnabled = userDoc?.settings.healthSyncEnabled ?? false;
  const syncWeight = userDoc?.settings.healthSyncWeight ?? false;
  const syncSteps = userDoc?.settings.healthSyncSteps ?? false;

  const handleRequestPermissions = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    setStatusMessage(null);

    try {
      const permission = await requestHealthPermissions({ syncWeight, syncSteps });
      if (!permission.granted) {
        setStatusMessage(permission.message ?? t('healthSync.permissionDenied'));
        return;
      }

      const snapshot = await readHealthSnapshot({ syncWeight, syncSteps });
      setLatestWeight(snapshot.latestWeightKg);
      setTodaySteps(snapshot.todaySteps);
      setStatusMessage(t('healthSync.synced'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('healthSync.syncFailed');
      setStatusMessage(message);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-health-sync" style={styles.container}>
      <Text style={styles.title}>{t('healthSync.title')}</Text>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('healthSync.enable')}</Text>
          <Switch
            value={healthSyncEnabled}
            onValueChange={value => setHealthSync(value).catch(() => undefined)}
            testID="health-sync-master-toggle"
          />
        </View>
        <Text style={styles.caption}>{t('healthSync.caption')}</Text>
      </AppCard>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('healthSync.syncWeight')}</Text>
          <Switch
            value={syncWeight}
            onValueChange={value => setHealthSyncWeight(value).catch(() => undefined)}
            testID="health-sync-weight-toggle"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('healthSync.syncSteps')}</Text>
          <Switch
            value={syncSteps}
            onValueChange={value => setHealthSyncSteps(value).catch(() => undefined)}
            testID="health-sync-steps-toggle"
          />
        </View>

        <AppButton
          onPress={() => handleRequestPermissions().catch(() => undefined)}
          disabled={isRequesting || !healthSyncEnabled}
          testID="health-sync-request-permission-button">
          {isRequesting ? t('healthSync.syncing') : t('healthSync.requestPermissions')}
        </AppButton>

        <Text style={styles.snapshotLabel}>{`${t('healthSync.latestWeight')}: ${latestWeight != null ? `${latestWeight} kg` : 'N/A'}`}</Text>
        <Text style={styles.snapshotLabel}>{`${t('healthSync.todaySteps')}: ${todaySteps != null ? `${todaySteps}` : 'N/A'}`}</Text>

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
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
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.xs,
  },
  cardContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.sm,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  snapshotLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});