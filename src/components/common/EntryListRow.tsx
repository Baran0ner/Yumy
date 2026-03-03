import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { JournalEntry } from '../../types/firestore';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

type EntryListRowProps = {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
  testID?: string;
};

export const EntryListRow = ({ entry, onPress, testID }: EntryListRowProps) => {
  const caloriesLabel =
    entry.status === 'processing'
      ? 'Thinking...'
      : entry.status === 'error'
        ? 'Error'
        : `${entry.nutrition.calories} kcal`;

  return (
    <Pressable
      style={styles.row}
      onPress={() => onPress(entry)}
      testID={testID ?? `entry-row-${entry.id}`}>
      <View style={styles.leftColumn}>
        <Text style={styles.mealText} numberOfLines={3}>
          {entry.mealText}
        </Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.calorieText}>{caloriesLabel}</Text>
        {entry.ai.sourcesCount > 0 ? (
          <Text style={styles.sourceLabel}>{`${entry.ai.sourcesCount} sources`}</Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    ...elevation.card,
  },
  leftColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  mealText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  rightColumn: {
    alignItems: 'flex-end',
    minWidth: 88,
  },
  calorieText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  sourceLabel: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

