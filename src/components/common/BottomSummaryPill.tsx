import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MacroTotals } from '../../types/firestore';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

type BottomSummaryPillProps = {
  calories: number;
  macros: MacroTotals;
  testID?: string;
};

export const BottomSummaryPill = ({ calories, macros, testID }: BottomSummaryPillProps) => {
  return (
    <View style={styles.container} testID={testID ?? 'bottom-summary-pill'}>
      <Text style={styles.calories}>{`?? ${calories}`}</Text>
      <Text style={styles.macros}>{`C ${macros.carbsG} · P ${macros.proteinG} · F ${macros.fatG}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...elevation.card,
  },
  calories: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  macros: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

