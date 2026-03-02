import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DailySummary } from '../types/meal';

type SummaryCardProps = {
  summary: DailySummary;
};

export const SummaryCard = ({ summary }: SummaryCardProps): React.JSX.Element => (
  <View style={styles.card}>
    <Text style={styles.title}>Günlük Özet</Text>
    <Text style={styles.calories}>{summary.calories} kCal</Text>
    <Text style={styles.macros}>
      Protein {summary.protein}g · Karbonhidrat {summary.carbs}g · Yağ {summary.fat}g
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F7E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
