import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import type { Units } from '../../types/firestore';
import { colors, spacing } from '../../theme/tokens';

const options: Array<{ labelKey: string; value: Units }> = [
  { labelKey: 'metric', value: 'metric' },
  { labelKey: 'imperial', value: 'imperial' },
];

export const UnitsScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { setUnits } = useUserSettingsActions(user?.uid ?? null);
  const current = userDoc?.settings.units ?? 'metric';

  return (
    <ScreenContainer testID="screen-units" style={styles.container}>
      <Text style={styles.title}>{t('units.title')}</Text>
      {options.map(option => (
        <AppCard
          key={option.value}
          onPress={() => setUnits(option.value).catch(() => undefined)}
          style={[styles.option, current === option.value && styles.optionActive]}
          testID={`units-option-${option.value}`}>
          <Text style={styles.label}>{t(`units.${option.labelKey}`)}</Text>
        </AppCard>
      ))}
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
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  option: {
    marginBottom: spacing.xs,
  },
  optionActive: {
    backgroundColor: '#FFF1E4',
    borderColor: '#FFD5AA',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});