import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import type { CalorieBias } from '../../types/firestore';
import { colors, spacing } from '../../theme/tokens';

const biasOptions: Array<{ key: string; value: CalorieBias }> = [
  { key: 'overestimate', value: 'over' },
  { key: 'neutral', value: 'neutral' },
  { key: 'underestimate', value: 'under' },
];

export const AISettingsScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { setCalorieBias, setThoughtProcessVisible } = useUserSettingsActions(user?.uid ?? null);

  const currentBias = userDoc?.settings.calorieBias ?? 'neutral';

  return (
    <ScreenContainer testID="screen-ai-settings" style={styles.container}>
      <Text style={styles.title}>{t('aiSettings.title')}</Text>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <Text style={styles.cardTitle}>{t('aiSettings.calorieEstimateBias')}</Text>
        {biasOptions.map(option => (
          <AppButton
            key={option.value}
            variant={currentBias === option.value ? 'primary' : 'outline'}
            onPress={() => setCalorieBias(option.value).catch(() => undefined)}
            testID={`ai-bias-${option.value}`}>
            {t(`aiSettings.${option.key}`)}
          </AppButton>
        ))}
      </AppCard>

      <AppCard style={styles.card} contentStyle={styles.cardContent}>
        <View style={styles.toggleRow}>
          <Text style={styles.cardTitle}>{t('aiSettings.showThoughtProcess')}</Text>
          <Switch
            value={userDoc?.settings.showThoughtProcess ?? true}
            onValueChange={value => setThoughtProcessVisible(value).catch(() => undefined)}
            testID="ai-settings-thought-toggle"
          />
        </View>
        <Text style={styles.caption}>{t('aiSettings.caption')}</Text>
      </AppCard>
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
    marginBottom: spacing.xs,
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});