import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import type { GoalsStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<GoalsStackParamList, 'MacroPlan'>;

const plans = {
  cut: { calories: 1800, proteinG: 160, carbsG: 150, fatG: 60 },
  maintain: { calories: 2200, proteinG: 140, carbsG: 220, fatG: 70 },
  bulk: { calories: 2800, proteinG: 170, carbsG: 310, fatG: 85 },
};

export const MacroPlanScreen = ({ navigation }: Props): React.JSX.Element => {
  const { user } = useAuth();
  const { setMacroTargets } = useUserSettingsActions(user?.uid ?? null);

  const applyPlan = async (plan: keyof typeof plans) => {
    await setMacroTargets(plans[plan]);
    navigation.goBack();
  };

  return (
    <ScreenContainer testID="screen-macro-plan" style={styles.container}>
      <Text style={styles.title}>Nutrition plan</Text>

      <Pressable style={styles.card} onPress={() => applyPlan('cut').catch(() => undefined)} testID="macro-plan-cut">
        <Text style={styles.cardTitle}>Cut</Text>
        <Text style={styles.cardBody}>Lower calories, high protein.</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => applyPlan('maintain').catch(() => undefined)} testID="macro-plan-maintain">
        <Text style={styles.cardTitle}>Maintain</Text>
        <Text style={styles.cardBody}>Balanced calorie and macro targets.</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => applyPlan('bulk').catch(() => undefined)} testID="macro-plan-bulk">
        <Text style={styles.cardTitle}>Bulk</Text>
        <Text style={styles.cardBody}>Higher calories with increased carbs.</Text>
      </Pressable>
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});


