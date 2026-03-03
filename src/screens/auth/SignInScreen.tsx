import React, { useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const privacyUrl = 'https://example.com/privacy';
const termsUrl = 'https://example.com/terms';

export const SignInScreen = (_: Props): React.JSX.Element => {
  const { signInWithGoogle, signInWithApple, continueAsGuest, authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleGoogle = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApple = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithApple();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await continueAsGuest();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-sign-in" style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>Continue to sync your food journal across devices.</Text>
      </View>

      <View style={styles.actions}>
        {Platform.OS === 'ios' ? (
          <Pressable
            style={styles.primaryButton}
            onPress={() => handleApple().catch(() => undefined)}
            disabled={isSubmitting}
            testID="signin-apple-button">
            <Text style={styles.primaryButtonLabel}>Continue with Apple</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => handleGoogle().catch(() => undefined)}
          disabled={isSubmitting}
          testID="signin-google-button">
          <Text style={styles.secondaryButtonLabel}>Continue with Google</Text>
        </Pressable>

        <Pressable
          style={styles.tertiaryButton}
          onPress={() => handleContinueAsGuest().catch(() => undefined)}
          disabled={isSubmitting}
          testID="signin-skip-button">
          <Text style={styles.tertiaryButtonLabel}>Continue without sign in</Text>
        </Pressable>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      </View>

      <Text style={styles.footnote}>
        By continuing you agree to the Privacy Policy and Terms.
      </Text>
      <View style={styles.linksRow}>
        <Pressable onPress={() => Linking.openURL(privacyUrl)} testID="signin-privacy-link">
          <Text style={styles.linkText}>Privacy</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(termsUrl)} testID="signin-terms-link">
          <Text style={styles.linkText}>Terms</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  top: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  tertiaryButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButtonLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  footnote: {
    ...typography.caption,
    textAlign: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  linkText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});

