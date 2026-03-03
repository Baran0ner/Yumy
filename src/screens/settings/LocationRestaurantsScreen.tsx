import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

export const LocationRestaurantsScreen = (): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const { setLocationForRestaurants } = useUserSettingsActions(user?.uid ?? null);

  const cityPreview = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ScreenContainer testID="screen-location-restaurants" style={styles.container}>
      <Text style={styles.title}>Location for Restaurants</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Use location</Text>
          <Switch
            value={userDoc?.settings.useLocationForRestaurants ?? false}
            onValueChange={value => setLocationForRestaurants(value).catch(() => undefined)}
            testID="location-restaurants-toggle"
          />
        </View>
        <Text style={styles.caption}>Only city/region level context is sent to AI prompts.</Text>
        <Text style={styles.city}>{`Current city preview: ${cityPreview}`}</Text>
      </View>

      <Text style={styles.note}>If permission is denied, logging still works normally.</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  city: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

