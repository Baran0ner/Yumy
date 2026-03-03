import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { deleteCurrentAccount } from '../../services/accountService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

export const AccountSubscriptionScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc, restoreSubscription, manageSubscription, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: isDeleting ? t('account.deleting') : t('account.delete'),
        style: 'destructive',
        onPress: () => {
          setIsDeleting(true);
          deleteCurrentAccount()
            .catch(() => undefined)
            .finally(() => setIsDeleting(false));
        },
      },
    ]);
  };

  return (
    <ScreenContainer testID="screen-account-subscription" style={styles.container}>
      <Text style={styles.title}>{t('account.title')}</Text>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.label}>{t('account.name')}</Text>
        <Text style={styles.value}>{userDoc?.displayName || 'N/A'}</Text>

        <Text style={styles.label}>{t('account.email')}</Text>
        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>

        <Text style={styles.label}>{t('account.subscription')}</Text>
        <Text style={styles.value}>{userDoc?.subscription.status ?? 'inactive'}</Text>
      </AppCard>

      <AppButton
        variant="outline"
        onPress={() => restoreSubscription().catch(() => undefined)}
        testID="account-restore-button">
        {t('paywall.restore')}
      </AppButton>

      <AppButton
        variant="outline"
        onPress={() => manageSubscription().catch(() => undefined)}
        testID="account-manage-button">
        {t('account.manageSubscription')}
      </AppButton>

      <AppButton variant="danger" onPress={handleDeleteAccount} testID="account-delete-button">
        {isDeleting ? t('account.deleting') : t('account.deleteAccount')}
      </AppButton>

      <AppButton onPress={() => signOut().catch(() => undefined)} testID="account-signout-button">
        {t('account.signOut')}
      </AppButton>
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
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});