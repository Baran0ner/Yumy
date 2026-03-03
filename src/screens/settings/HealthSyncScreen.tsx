import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { readHealthSnapshot, requestHealthPermissions } from '../../services/healthService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

export const HealthSyncScreen = (): React.JSX.Element => {
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
        setStatusMessage(permission.message ?? 'Permission denied.');
        return;
      }

      const snapshot = await readHealthSnapshot({ syncWeight, syncSteps });
      setLatestWeight(snapshot.latestWeightKg);
      setTodaySteps(snapshot.todaySteps);
      setStatusMessage('Permissions granted and latest data synced.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not sync health data.';
      setStatusMessage(message);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-health-sync" style={styles.container}>
      <Text style={styles.title}>Health Sync</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Enable Apple Health / Google Fit</Text>
          <Switch
            value={healthSyncEnabled}
            onValueChange={value => setHealthSync(value).catch(() => undefined)}
            testID="health-sync-master-toggle"
          />
        </View>
        <Text style={styles.caption}>If permission is denied, app continues without syncing.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Sync weight</Text>
          <Switch
            value={syncWeight}
            onValueChange={value => setHealthSyncWeight(value).catch(() => undefined)}
            testID="health-sync-weight-toggle"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Sync steps</Text>
          <Switch
            value={syncSteps}
            onValueChange={value => setHealthSyncSteps(value).catch(() => undefined)}
            testID="health-sync-steps-toggle"
          />
        </View>

        <Pressable
          style={[styles.button, isRequesting && styles.buttonDisabled]}
          onPress={() => handleRequestPermissions().catch(() => undefined)}
          disabled={isRequesting || !healthSyncEnabled}
          testID="health-sync-request-permission-button">
          <Text style={styles.buttonLabel}>{isRequesting ? 'Syncing...' : 'Request permissions'}</Text>
        </Pressable>

        <Text style={styles.snapshotLabel}>{`Latest weight: ${latestWeight != null ? `${latestWeight} kg` : 'N/A'}`}</Text>
        <Text style={styles.snapshotLabel}>{`Today steps: ${todaySteps != null ? `${todaySteps}` : 'N/A'}`}</Text>

        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
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
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
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
  button: {
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: colors.surface,
    fontWeight: '700',
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
