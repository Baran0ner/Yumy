import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

const badgeItems = [
  { id: 'first-log', label: 'First Log' },
  { id: 'three-day', label: '3 Day Streak' },
  { id: 'seven-day', label: '7 Day Streak' },
  { id: 'macro-master', label: 'Macro Master' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'saved-meal', label: 'Saved Meal Pro' },
];

export const StreaksBadgesScreen = (): React.JSX.Element => {
  const { user } = useAuth();
  const { streakCount } = useDaysSummary(user?.uid ?? null);

  return (
    <ScreenContainer testID="screen-streaks-badges" style={styles.container}>
      <Text style={styles.title}>Streaks & Badges</Text>
      <Text style={styles.streak}>{`?? ${streakCount} day streak`}</Text>

      <FlatList
        data={badgeItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.badgeCard} testID={`badge-${item.id}`}>
            <Text style={styles.badgeIcon}>??</Text>
            <Text style={styles.badgeText}>{item.label}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
  },
  streak: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  row: {
    gap: spacing.sm,
  },
  badgeCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeText: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
});

