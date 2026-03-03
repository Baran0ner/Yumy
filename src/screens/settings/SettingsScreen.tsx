import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { SettingsStackParamList } from '../../navigation/types';
import { SettingsRow } from '../../components/common/SettingsRow';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const { setLocationForRestaurants } = useUserSettingsActions(user?.uid ?? null);

  return (
    <ScreenContainer testID="screen-settings" style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Nutrition Goals</Text>
          <SettingsRow
            title="Calorie Estimate Bias"
            subtitle={userDoc?.settings.calorieBias ?? 'neutral'}
            onPress={() => navigation.navigate('AISettings')}
            testID="settings-ai-settings-row"
          />
          <SettingsRow
            title="Location for Restaurants"
            subtitle="City/region context"
            onPress={() => navigation.navigate('LocationRestaurants')}
            testID="settings-location-screen-row"
          />
          <SettingsRow
            title="Use Location for Restaurants"
            subtitle="Only city/region sent"
            toggleValue={userDoc?.settings.useLocationForRestaurants ?? false}
            onToggle={value => setLocationForRestaurants(value).catch(() => undefined)}
            testID="settings-location-toggle"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Tracking Reminders</Text>
          <SettingsRow
            title="Reminders"
            subtitle={`${userDoc?.settings.remindersFrequency ?? 3} times per day`}
            onPress={() => navigation.navigate('Reminders')}
            testID="settings-reminders-row"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Settings</Text>
          <SettingsRow
            title="Units"
            subtitle={userDoc?.settings.units ?? 'metric'}
            onPress={() => navigation.navigate('Units')}
            testID="settings-units-row"
          />
          <SettingsRow
            title="Health Sync"
            subtitle={userDoc?.settings.healthSyncEnabled ? 'Enabled' : 'Disabled'}
            onPress={() => navigation.navigate('HealthSync')}
            testID="settings-health-sync-row"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow
            title="Saved Meals"
            onPress={() => navigation.navigate('SavedMeals')}
            testID="settings-saved-meals-row"
          />
          <SettingsRow
            title="Account & Subscription"
            onPress={() => navigation.navigate('AccountSubscription')}
            testID="settings-account-row"
          />
          <SettingsRow
            title="Privacy / Terms"
            onPress={() => navigation.navigate('PrivacyTerms')}
            testID="settings-privacy-row"
          />
          <SettingsRow
            title="Support"
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

