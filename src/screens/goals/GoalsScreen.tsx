import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import type { GoalsStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Goals'>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const GoalsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const { streakCount } = useDaysSummary(user?.uid ?? null);
  const { setMacroTargets } = useUserSettingsActions(user?.uid ?? null);

  const targets = useMemo(
    () =>
      userDoc?.settings.macroTargets ?? {
        calories: 2200,
        carbsG: 220,
        proteinG: 140,
        fatG: 70,
      },
    [userDoc],
  );

  const bumpCalories = async (delta: number) => {
    await setMacroTargets({
      ...targets,
      calories: clamp(targets.calories + delta, 1200, 4500),
    });
  };

  const bumpMacro = async (key: 'carbsG' | 'proteinG' | 'fatG', delta: number) => {
    await setMacroTargets({
      ...targets,
      [key]: clamp(targets[key] + delta, 20, 400),
    });
  };

  return (
    <ScreenContainer testID="screen-goals" style={styles.container}>
      <Text style={styles.title}>Goals at a glance</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily calories</Text>
        <Text style={styles.metric}>{targets.calories}</Text>
        <View style={styles.stepRow}>
          <Pressable style={styles.stepButton} onPress={() => bumpCalories(-100).catch(() => undefined)} testID="goals-calories-minus">
            <Text style={styles.stepLabel}>-100</Text>
          </Pressable>
          <Pressable style={styles.stepButton} onPress={() => bumpCalories(100).catch(() => undefined)} testID="goals-calories-plus">
            <Text style={styles.stepLabel}>+100</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macro ratios</Text>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>{`Protein ${targets.proteinG}g`}</Text>
          <View style={styles.macroActions}>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('proteinG', -5).catch(() => undefined)}>
              <Text style={styles.microLabel}>-</Text>
            </Pressable>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('proteinG', 5).catch(() => undefined)}>
              <Text style={styles.microLabel}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>{`Carbs ${targets.carbsG}g`}</Text>
          <View style={styles.macroActions}>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('carbsG', -5).catch(() => undefined)}>
              <Text style={styles.microLabel}>-</Text>
            </Pressable>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('carbsG', 5).catch(() => undefined)}>
              <Text style={styles.microLabel}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.macroRow}>
          <Text style={styles.macroLabel}>{`Fat ${targets.fatG}g`}</Text>
          <View style={styles.macroActions}>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('fatG', -5).catch(() => undefined)}>
              <Text style={styles.microLabel}>-</Text>
            </Pressable>
            <Pressable style={styles.microButton} onPress={() => bumpMacro('fatG', 5).catch(() => undefined)}>
              <Text style={styles.microLabel}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current streak</Text>
        <Text style={styles.metric}>{`?? ${streakCount}`}</Text>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('StreaksBadges')} testID="goals-streaks-badges-button">
          <Text style={styles.secondaryLabel}>See streaks & badges</Text>
        </Pressable>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('MacroPlan')} testID="goals-nutrition-plan-button">
        <Text style={styles.primaryLabel}>Nutrition plan presets</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  metric: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepButton: {
    flex: 1,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  macroActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  microButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: spacing.xs,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
});

