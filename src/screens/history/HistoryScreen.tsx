import React from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import type { HistoryStackParamList } from '../../navigation/types';
import { formatLongDate } from '../../utils/date';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HistoryStackParamList, 'History'>;

export const HistoryScreen = ({ navigation }: Props): React.JSX.Element => {
  const { user } = useAuth();
  const { days } = useDaysSummary(user?.uid ?? null);

  return (
    <ScreenContainer testID="screen-history" style={styles.container}>
      <Text style={styles.title}>History</Text>

      <FlatList
        data={days}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('DayDetail', { dateKey: item.id })}
            testID={`history-day-${item.id}`}>
            <Text style={styles.date}>{formatLongDate(item.id)}</Text>
            <Text style={styles.calories}>{`?? ${item.totalCalories} kcal`}</Text>
            <Text style={styles.macros}>{`C ${item.carbsG} · P ${item.proteinG} · F ${item.fatG}`}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty} testID="history-empty-state">
            No days logged yet.
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  date: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  calories: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  macros: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});


