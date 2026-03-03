import React, { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { colors, spacing, typography } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const privacyUrl = 'https://example.com/privacy';
const termsUrl = 'https://example.com/terms';

export const SignInScreen = (_: Props): React.JSX.Element => {
  const { t } = useTranslation();
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
        <Text style={styles.title}>{t('signIn.title')}</Text>
        <Text style={styles.subtitle}>{t('signIn.subtitle')}</Text>
      </View>

      <View style={styles.actions}>
        {Platform.OS === 'ios' ? (
          <AppButton
            onPress={() => handleApple().catch(() => undefined)}
            disabled={isSubmitting}
            testID="signin-apple-button">
            {t('signIn.withApple')}
          </AppButton>
        ) : null}

        <AppButton
          variant="outline"
          onPress={() => handleGoogle().catch(() => undefined)}
          disabled={isSubmitting}
          testID="signin-google-button">
          {t('signIn.withGoogle')}
        </AppButton>

        <AppButton
          variant="text"
          onPress={() => handleContinueAsGuest().catch(() => undefined)}
          disabled={isSubmitting}
          testID="signin-skip-button">
          {t('signIn.asGuest')}
        </AppButton>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      </View>

      <Text style={styles.footnote}>{t('signIn.agreement')}</Text>
      <View style={styles.linksRow}>
        <AppButton
          variant="text"
          size="sm"
          onPress={() => Linking.openURL(privacyUrl)}
          testID="signin-privacy-link">
          {t('signIn.privacy')}
        </AppButton>
        <AppButton
          variant="text"
          size="sm"
          onPress={() => Linking.openURL(termsUrl)}
          testID="signin-terms-link">
          {t('signIn.terms')}
        </AppButton>
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
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});