import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { DailySummary } from '../types/meal';
import { AppCard } from './common/AppCard';

type SummaryCardProps = {
  summary: DailySummary;
};

export const SummaryCard = ({ summary }: SummaryCardProps): React.JSX.Element => (
  <AppCard style={styles.card} contentStyle={styles.content}>
    <Text style={styles.title}>Günlük Özet</Text>
    <Text style={styles.calories}>{summary.calories} kCal</Text>
    <Text style={styles.macros}>
      Protein {summary.protein}g · Karbonhidrat {summary.carbs}g · Yağ {summary.fat}g
    </Text>
  </AppCard>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#3D4F29',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  calories: {
    color: '#1D2910',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  macros: {
    color: '#405433',
    fontSize: 12,
  },
});