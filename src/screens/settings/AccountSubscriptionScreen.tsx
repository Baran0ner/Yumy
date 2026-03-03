import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { deleteCurrentAccount } from '../../services/accountService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

export const AccountSubscriptionScreen = (): React.JSX.Element => {
  const { user, userDoc, restoreSubscription, manageSubscription, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    Alert.alert('Delete account', 'This will remove your account data from Firestore and storage.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: isDeleting ? 'Deleting...' : 'Delete',
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
      <Text style={styles.title}>Account & Subscription</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{userDoc?.displayName || 'N/A'}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'N/A'}</Text>

        <Text style={styles.label}>Subscription</Text>
        <Text style={styles.value}>{userDoc?.subscription.status ?? 'inactive'}</Text>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => restoreSubscription().catch(() => undefined)}
        testID="account-restore-button">
        <Text style={styles.secondaryLabel}>Restore purchases</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => manageSubscription().catch(() => undefined)}
        testID="account-manage-button">
        <Text style={styles.secondaryLabel}>Manage subscription</Text>
      </Pressable>

      <Pressable style={styles.warningButton} onPress={handleDeleteAccount} testID="account-delete-button">
        <Text style={styles.warningLabel}>{isDeleting ? 'Deleting...' : 'Delete account'}</Text>
      </Pressable>

      <Pressable
        style={styles.signoutButton}
        onPress={() => signOut().catch(() => undefined)}
        testID="account-signout-button">
        <Text style={styles.signoutLabel}>Sign out</Text>
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
  secondaryButton: {
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  warningButton: {
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: '#FFEDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningLabel: {
    color: colors.error,
    fontWeight: '700',
  },
  signoutButton: {
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signoutLabel: {
    color: colors.surface,
    fontWeight: '700',
  },
});
