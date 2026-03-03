import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import type { CalorieBias } from '../../types/firestore';
import { colors, radius, spacing } from '../../theme/tokens';

const biasOptions: Array<{ label: string; value: CalorieBias }> = [
  { label: 'Overestimate', value: 'over' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Underestimate', value: 'under' },
];

export const AISettingsScreen = (): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const { setCalorieBias, setThoughtProcessVisible } = useUserSettingsActions(user?.uid ?? null);

  const currentBias = userDoc?.settings.calorieBias ?? 'neutral';

  return (
    <ScreenContainer testID="screen-ai-settings" style={styles.container}>
      <Text style={styles.title}>AI Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorie estimate bias</Text>
        {biasOptions.map(option => (
          <Pressable
            key={option.value}
            style={[styles.option, currentBias === option.value && styles.optionActive]}
            onPress={() => setCalorieBias(option.value).catch(() => undefined)}
            testID={`ai-bias-${option.value}`}>
            <Text style={styles.optionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <Text style={styles.cardTitle}>Show thought process</Text>
          <Switch
            value={userDoc?.settings.showThoughtProcess ?? true}
            onValueChange={value => setThoughtProcessVisible(value).catch(() => undefined)}
            testID="ai-settings-thought-toggle"
          />
        </View>
        <Text style={styles.caption}>Reasoning summary can be shown on entry detail screen.</Text>
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
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  option: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  optionActive: {
    backgroundColor: '#FFF1E4',
    borderColor: '#FFD5AA',
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

