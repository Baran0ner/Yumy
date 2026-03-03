import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Animatable from 'react-native-animatable';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import type { HistoryStackParamList } from '../../navigation/types';
import { formatLongDate } from '../../utils/date';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HistoryStackParamList, 'History'>;

export const HistoryScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { days } = useDaysSummary(user?.uid ?? null);

  return (
    <ScreenContainer testID="screen-history" style={styles.container}>
      <Text style={styles.title}>{t('history.title')}</Text>

      <FlatList
        data={days}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Animatable.View animation="fadeInUp" duration={320} useNativeDriver>
            <AppCard
              onPress={() => navigation.navigate('DayDetail', { dateKey: item.id })}
              style={styles.card}
              testID={`history-day-${item.id}`}>
              <Text style={styles.date}>{formatLongDate(item.id)}</Text>
              <Text style={styles.calories}>{`\u{1F525} ${item.totalCalories} kcal`}</Text>
              <Text style={styles.macros}>{`C ${item.carbsG} · P ${item.proteinG} · F ${item.fatG}`}</Text>
            </AppCard>
          </Animatable.View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty} testID="history-empty-state">
            {t('history.empty')}
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