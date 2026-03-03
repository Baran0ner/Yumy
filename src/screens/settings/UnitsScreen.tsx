import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import type { Units } from '../../types/firestore';
import { colors, radius, spacing } from '../../theme/tokens';

const options: Array<{ label: string; value: Units }> = [
  { label: 'Metric', value: 'metric' },
  { label: 'Imperial', value: 'imperial' },
];

export const UnitsScreen = (): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const { setUnits } = useUserSettingsActions(user?.uid ?? null);
  const current = userDoc?.settings.units ?? 'metric';

  return (
    <ScreenContainer testID="screen-units" style={styles.container}>
      <Text style={styles.title}>Units</Text>
      {options.map(option => (
        <Pressable
          key={option.value}
          style={[styles.option, current === option.value && styles.optionActive]}
          onPress={() => setUnits(option.value).catch(() => undefined)}
          testID={`units-option-${option.value}`}>
          <Text style={styles.label}>{option.label}</Text>
        </Pressable>
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
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

