import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import type { JournalEntry } from '../../types/firestore';
import { colors, spacing } from '../../theme/tokens';
import { AppCard } from './AppCard';

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
    <Animatable.View animation="fadeInUp" duration={340} useNativeDriver>
      <AppCard
        onPress={() => onPress(entry)}
        testID={testID ?? `entry-row-${entry.id}`}
        style={styles.card}
        contentStyle={styles.row}>
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
      </AppCard>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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