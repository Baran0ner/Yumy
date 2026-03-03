import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

const links = [
  { id: 'privacy', key: 'privacyPolicy', url: 'https://example.com/privacy' },
  { id: 'terms', key: 'termsOfService', url: 'https://example.com/terms' },
  { id: 'support', key: 'supportFaq', url: 'https://example.com/support' },
] as const;

export const PrivacyTermsScreen = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <ScreenContainer testID="screen-privacy-terms" style={styles.container}>
      <Text style={styles.title}>{t('privacy.title')}</Text>
      <View style={styles.list}>
        {links.map(item => (
          <AppCard
            key={item.id}
            onPress={() => Linking.openURL(item.url)}
            style={styles.row}
            contentStyle={styles.rowContent}
            testID={`privacy-link-${item.id}`}>
            <Text style={styles.rowLabel}>{t(`privacy.${item.key}`)}</Text>
            <Text style={styles.chevron}>›</Text>
          </AppCard>
        ))}
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
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    borderRadius: 16,
  },
  rowContent: {
    height: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 24,
  },
});