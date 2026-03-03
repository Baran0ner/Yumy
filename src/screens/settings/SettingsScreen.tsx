import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { SettingsStackParamList } from '../../navigation/types';
import { SettingsRow } from '../../components/common/SettingsRow';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { setLocationForRestaurants } = useUserSettingsActions(user?.uid ?? null);

  return (
    <ScreenContainer testID="screen-settings" style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.nutritionGoals')}</Text>
          <SettingsRow
            title={t('settings.aiBias')}
            subtitle={userDoc?.settings.calorieBias ?? 'neutral'}
            onPress={() => navigation.navigate('AISettings')}
            testID="settings-ai-settings-row"
          />
          <SettingsRow
            title={t('settings.language')}
            subtitle={t('settings.languageSubtitle')}
            onPress={() => navigation.navigate('Language')}
            testID="settings-language-row"
          />
          <SettingsRow
            title={t('settings.locationForRestaurants')}
            subtitle={t('settings.locationCityRegion')}
            onPress={() => navigation.navigate('LocationRestaurants')}
            testID="settings-location-screen-row"
          />
          <SettingsRow
            title={t('settings.useLocationForRestaurants')}
            subtitle={t('settings.locationOnlyCity')}
            toggleValue={userDoc?.settings.useLocationForRestaurants ?? false}
            onToggle={value => setLocationForRestaurants(value).catch(() => undefined)}
            testID="settings-location-toggle"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.reminders')}</Text>
          <SettingsRow
            title={t('settings.reminders')}
            subtitle={t('settings.timesPerDay', { count: userDoc?.settings.remindersFrequency ?? 3 })}
            onPress={() => navigation.navigate('Reminders')}
            testID="settings-reminders-row"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.device')}</Text>
          <SettingsRow
            title={t('settings.units')}
            subtitle={userDoc?.settings.units ?? 'metric'}
            onPress={() => navigation.navigate('Units')}
            testID="settings-units-row"
          />
          <SettingsRow
            title={t('settings.healthSync')}
            subtitle={userDoc?.settings.healthSyncEnabled ? t('settings.enabled') : t('settings.disabled')}
            onPress={() => navigation.navigate('HealthSync')}
            testID="settings-health-sync-row"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.account')}</Text>
          <SettingsRow
            title={t('settings.savedMeals')}
            onPress={() => navigation.navigate('SavedMeals')}
            testID="settings-saved-meals-row"
          />
          <SettingsRow
            title={t('settings.accountSubscription')}
            onPress={() => navigation.navigate('AccountSubscription')}
            testID="settings-account-row"
          />
          <SettingsRow
            title={t('settings.privacyTerms')}
            onPress={() => navigation.navigate('PrivacyTerms')}
            testID="settings-privacy-row"
          />
          <SettingsRow
            title={t('settings.support')}
            onPress={() => navigation.navigate('Support')}
            testID="settings-support-row"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
});
