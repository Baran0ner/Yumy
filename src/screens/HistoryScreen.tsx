import React, { useMemo } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useMealContext } from '../context/MealContext';
import { toDateKey } from '../utils/date';

type DailyHistory = {
  date: string;
  calories: number;
  meals: number;
};

export const HistoryScreen = (): React.JSX.Element => {
  const { entries } = useMealContext();

  const grouped = useMemo<DailyHistory[]>(() => {
    const map = new Map<string, DailyHistory>();

    for (const entry of entries) {
      const date = toDateKey(entry.createdAt);
      const current = map.get(date) ?? { date, calories: 0, meals: 0 };
      current.calories += entry.calories;
      current.meals += 1;
      map.set(date, current);
    }

    return Array.from(map.values()).sort((left, right) =>
      right.date.localeCompare(left.date),
    );
  }, [entries]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Geçmiş</Text>
        <FlatList
          data={grouped}
          keyExtractor={item => item.date}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.meta}>{item.meals} öğün</Text>
              <Text style={styles.calories}>{item.calories} kCal</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Henüz geçmiş kaydı yok.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAF5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D2910',
    marginBottom: 12,
  },
  row: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DFE6D5',
    padding: 12,
    marginBottom: 8,
  },
  date: {
    color: '#111827',
    fontWeight: '700',
    marginBottom: 2,
  },
  meta: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  calories: {
    color: '#1F2937',
    fontWeight: '600',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
});
