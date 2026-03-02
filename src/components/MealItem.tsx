import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MealEntry } from '../types/meal';

type MealItemProps = {
  item: MealEntry;
};

export const MealItem = ({ item }: MealItemProps): React.JSX.Element => (
  <View style={styles.container}>
    <View style={styles.row}>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.calories}>{item.calories} kCal</Text>
    </View>
    <Text style={styles.meta}>
      P {item.macros.protein}g · C {item.macros.carbs}g · F {item.macros.fat}g
    </Text>
    <Text style={styles.sync}>{item.synced ? 'Bulut: Senkron' : 'Bulut: Bekliyor'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DFE6D5',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  description: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  calories: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: '#4B5563',
  },
  sync: {
    marginTop: 6,
    fontSize: 11,
    color: '#6B7280',
  },
});
