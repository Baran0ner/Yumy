import React from 'react';
import { Linking, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

export const SupportScreen = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <ScreenContainer testID="screen-support" style={styles.container}>
      <Text style={styles.title}>{t('support.title')}</Text>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.label}>{t('support.needHelp')}</Text>
        <Text style={styles.text}>{t('support.body')}</Text>
        <AppButton
          onPress={() => Linking.openURL('mailto:support@example.com')}
          testID="support-email-button">
          {t('support.emailButton')}
        </AppButton>
      </AppCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
});