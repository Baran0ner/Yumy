import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useDayEntries } from '../../hooks/useDayEntries';
import type { HistoryStackParamList } from '../../navigation/types';
import { formatLongDate, shiftDateKey } from '../../utils/date';
import { EntryListRow } from '../../components/common/EntryListRow';
import { BottomSummaryPill } from '../../components/common/BottomSummaryPill';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<HistoryStackParamList, 'DayDetail'>;

export const DayDetailScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { user } = useAuth();
  const { entries, totals } = useDayEntries(user?.uid ?? null, route.params.dateKey);

  const goDay = (delta: number) => {
    navigation.setParams({ dateKey: shiftDateKey(route.params.dateKey, delta) });
  };

  return (
    <ScreenContainer testID="screen-day-detail" style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.dayButton} onPress={() => goDay(-1)} testID="day-detail-prev-button">
          <Text style={styles.dayButtonLabel}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{formatLongDate(route.params.dateKey)}</Text>
        <Pressable style={styles.dayButton} onPress={() => goDay(1)} testID="day-detail-next-button">
          <Text style={styles.dayButtonLabel}>›</Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EntryListRow
            entry={item}
            onPress={entry =>
              (navigation.getParent() as any)?.navigate('TodayTab', {
                  screen: 'EntryDetail',
                  params: {
                    dateKey: route.params.dateKey,
                    entryId: entry.id,
                  },
                })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.listSpacer} />}
        ListEmptyComponent={<Text style={styles.empty}>No entries for this day.</Text>}
      />

      <View style={styles.bottomWrap}>
        <BottomSummaryPill calories={totals.calories} macros={totals.macros} testID="day-detail-summary-pill" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  dayButton: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayButtonLabel: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  listSpacer: {
    height: 96,
  },
  bottomWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  empty: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

