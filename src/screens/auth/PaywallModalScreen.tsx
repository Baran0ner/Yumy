import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { colors, elevation, radius, spacing, typography } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';
import type { RevenueCatPlan } from '../../services/revenueCatService';

type Props = NativeStackScreenProps<RootStackParamList, 'PaywallModal'>;

export const PaywallModalScreen = ({ navigation }: Props): React.JSX.Element => {
  const { startTrial, restoreSubscription, refreshPaywallPlans, paywallPlans, authError } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<RevenueCatPlan>('yearly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingPlans(true);
    refreshPaywallPlans()
      .catch(() => undefined)
      .finally(() => setIsLoadingPlans(false));
  }, [refreshPaywallPlans]);

  const selectedPlanDetails = useMemo(
    () => paywallPlans.find(plan => plan.id === selectedPlan),
    [paywallPlans, selectedPlan],
  );

  const handleStartTrial = async () => {
    if (isSubmitting) {
      return;
    }

    setPurchaseError(null);
    setIsSubmitting(true);
    try {
      await startTrial(selectedPlan);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed.';
      setPurchaseError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (isSubmitting) {
      return;
    }

    setPurchaseError(null);
    setIsSubmitting(true);
    try {
      await restoreSubscription();
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed.';
      setPurchaseError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-paywall" style={styles.container}>
      <View>
        <Text style={styles.title}>3-day free trial</Text>
        <Text style={styles.subtitle}>Unlock full food journal insights and AI estimations.</Text>
      </View>

      <View style={styles.planWrap}>
        {paywallPlans.map(plan => (
          <Pressable
            key={plan.id}
            onPress={() => setSelectedPlan(plan.id)}
            style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
            testID={`paywall-plan-${plan.id}`}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planPrice}>{plan.priceLabel}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        {isLoadingPlans ? <ActivityIndicator /> : null}
        <Text style={styles.selectedLabel}>{`Selected: ${selectedPlanDetails?.title ?? 'Plan'}`}</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => handleStartTrial().catch(() => undefined)}
          disabled={isSubmitting || isLoadingPlans}
          testID="paywall-start-trial-button">
          <Text style={styles.primaryButtonLabel}>{isSubmitting ? 'Starting...' : 'Start trial'}</Text>
        </Pressable>

        <Pressable
          onPress={() => handleRestore().catch(() => undefined)}
          disabled={isSubmitting || isLoadingPlans}
          testID="paywall-restore-button">
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>

        {purchaseError || authError ? (
          <Text style={styles.errorText}>{purchaseError ?? authError}</Text>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  planWrap: {
    gap: spacing.md,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...elevation.card,
  },
  planCardSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: '#FFFDF9',
  },
  planTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
  selectedLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  restoreText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 12,
  },
});
