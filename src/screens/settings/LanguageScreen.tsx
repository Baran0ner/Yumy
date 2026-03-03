import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import type { AppLanguage } from '../../types/firestore';
import { colors, spacing } from '../../theme/tokens';

const options: Array<{ labelKey: string; value: AppLanguage }> = [
  { labelKey: 'language.auto', value: 'auto' },
  { labelKey: 'language.turkish', value: 'tr' },
  { labelKey: 'language.english', value: 'en' },
];

export const LanguageScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { setLanguage } = useUserSettingsActions(user?.uid ?? null);
  const current = userDoc?.settings.language ?? 'auto';

  return (
    <ScreenContainer testID="screen-language" style={styles.container}>
      <Text style={styles.title}>{t('language.title')}</Text>
      {options.map(option => (
        <AppCard
          key={option.value}
          onPress={() => setLanguage(option.value).catch(() => undefined)}
          style={[styles.option, current === option.value && styles.optionActive]}
          testID={`language-option-${option.value}`}>
          <Text style={styles.label}>{t(option.labelKey)}</Text>
        </AppCard>
      ))}
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
  option: {
    marginBottom: spacing.xs,
  },
  optionActive: {
    backgroundColor: '#FFF1E4',
    borderColor: '#FFD5AA',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});