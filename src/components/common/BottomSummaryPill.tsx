import React from 'react';
import { StyleSheet, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import type { MacroTotals } from '../../types/firestore';
import { colors, spacing } from '../../theme/tokens';
import { AppCard } from './AppCard';

type BottomSummaryPillProps = {
  calories: number;
  macros: MacroTotals;
  testID?: string;
};

const FIRE_ICON = '\u{1F525}';

export const BottomSummaryPill = ({ calories, macros, testID }: BottomSummaryPillProps) => {
  return (
    <Animatable.View animation="fadeInUp" duration={320} useNativeDriver>
      <AppCard
        testID={testID ?? 'bottom-summary-pill'}
        style={styles.container}
        contentStyle={styles.content}>
        <Text style={styles.calories}>{`${FIRE_ICON} ${calories}`}</Text>
        <Text style={styles.macros}>{`C ${macros.carbsG} · P ${macros.proteinG} · F ${macros.fatG}`}</Text>
      </AppCard>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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