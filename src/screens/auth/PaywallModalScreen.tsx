import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/tokens';
import type { RootStackParamList } from '../../navigation/types';
import type { RevenueCatPlan } from '../../services/revenueCatService';
import { logKpiEvent } from '../../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'PaywallModal'>;

export const PaywallModalScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const {
    user,
    startTrial,
    restoreSubscription,
    refreshPaywallPlans,
    paywallPlans,
    authError,
    forceSignInFromGuest,
  } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<RevenueCatPlan>('yearly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const isGuest = Boolean(user?.isAnonymous);

  useEffect(() => {
    setIsLoadingPlans(true);
    refreshPaywallPlans()
      .catch(() => undefined)
      .finally(() => setIsLoadingPlans(false));
  }, [refreshPaywallPlans]);

  useEffect(() => {
    if (!user) {
      return;
    }

    logKpiEvent(user.uid, 'paywall_viewed', { isGuest }).catch(() => undefined);
  }, [isGuest, user]);

  const selectedPlanDetails = useMemo(
    () => paywallPlans.find(plan => plan.id === selectedPlan),
    [paywallPlans, selectedPlan],
  );

  const handleStartTrial = async () => {
    if (isSubmitting || isGuest) {
      return;
    }

    setPurchaseError(null);
    setIsSubmitting(true);
    try {
      await startTrial(selectedPlan);
      if (user) {
        logKpiEvent(user.uid, 'purchase_success', { plan: selectedPlan }).catch(() => undefined);
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed.';
      setPurchaseError(message);
      if (user) {
        logKpiEvent(user.uid, 'purchase_failed', {
          plan: selectedPlan,
          message,
        }).catch(() => undefined);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (isSubmitting || isGuest) {
      return;
    }

    setPurchaseError(null);
    setIsSubmitting(true);
    try {
      await restoreSubscription();
      if (user) {
        logKpiEvent(user.uid, 'restore_success').catch(() => undefined);
      }
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed.';
      setPurchaseError(message);
      if (user) {
        logKpiEvent(user.uid, 'restore_failed', { message }).catch(() => undefined);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-paywall" style={styles.container}>
      <View>
        <Text style={styles.title}>{isGuest ? t('paywall.guestTitle') : t('paywall.title')}</Text>
        <Text style={styles.subtitle}>{isGuest ? t('paywall.guestSubtitle') : t('paywall.subtitle')}</Text>
      </View>

      {!isGuest ? (
        <View style={styles.planWrap}>
          {paywallPlans.map(plan => (
            <AppCard
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
              testID={`paywall-plan-${plan.id}`}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planPrice}>{plan.priceLabel}</Text>
            </AppCard>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {isLoadingPlans ? <ActivityIndicator /> : null}

        {!isGuest ? (
          <Text style={styles.selectedLabel}>{`${t('paywall.selected')}: ${selectedPlanDetails?.title ?? 'Plan'}`}</Text>
        ) : null}

        {isGuest ? (
          <AppButton
            onPress={() => {
              if (user) {
                logKpiEvent(user.uid, 'guest_signin_redirect').catch(() => undefined);
              }
              forceSignInFromGuest().catch(() => undefined);
            }}
            disabled={isSubmitting}
            testID="paywall-signin-button">
            {t('paywall.signInToContinue')}
          </AppButton>
        ) : (
          <>
            <AppButton
              onPress={() => handleStartTrial().catch(() => undefined)}
              disabled={isSubmitting || isLoadingPlans}
              testID="paywall-start-trial-button">
              {isSubmitting ? t('paywall.starting') : t('paywall.startTrial')}
            </AppButton>

            <AppButton
              variant="text"
              onPress={() => handleRestore().catch(() => undefined)}
              disabled={isSubmitting || isLoadingPlans}
              testID="paywall-restore-button">
              {t('paywall.restore')}
            </AppButton>
          </>
        )}

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
    padding: spacing.md,
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
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 12,
  },
});