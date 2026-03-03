import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import { computeBadges, computeWeeklyQuestProgress } from '../../services/questService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

export const StreaksBadgesScreen = (): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { days, streakCount } = useDaysSummary(user?.uid ?? null);

  const quests = useMemo(
    () => computeWeeklyQuestProgress(days, userDoc?.settings ?? { macroTargets: { calories: 2200, proteinG: 140, carbsG: 220, fatG: 70 } }),
    [days, userDoc?.settings],
  );

  const badges = useMemo(() => computeBadges(streakCount, quests), [streakCount, quests]);

  return (
    <ScreenContainer testID="screen-streaks-badges" style={styles.container}>
      <Text style={styles.title}>{t('streaks.title')}</Text>
      <Text style={styles.streak}>{t('streaks.dayStreak', { count: streakCount })}</Text>

      <Text style={styles.sectionTitle}>{t('streaks.weeklyQuests')}</Text>
      <View style={styles.questWrap}>
        {quests.map(quest => {
          const progress = Math.min(1, quest.current / quest.target);
          return (
            <View key={quest.id} style={styles.questCard} testID={`quest-${quest.id}`}>
              <View style={styles.questTop}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={[styles.questCount, quest.completed && styles.questCompleted]}>
                  {`${Math.min(quest.current, quest.target)}/${quest.target}`}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t('streaks.badges')}</Text>
      <FlatList
        data={badges}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View
            style={[styles.badgeCard, item.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}
            testID={`badge-${item.id}`}>
            <Text style={styles.badgeIcon}>{item.unlocked ? '\u{1F3C5}' : '\u{1F512}'}</Text>
            <Text style={styles.badgeText}>{item.label}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
  },
  streak: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  questWrap: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  questCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  questTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  questTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  questCount: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  questCompleted: {
    color: '#2E7D32',
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: radius.round,
    backgroundColor: '#E4E4E7',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: radius.round,
  },
  row: {
    gap: spacing.sm,
  },
  badgeCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badgeUnlocked: {
    borderColor: '#D8EAD7',
    backgroundColor: '#F4FBF4',
  },
  badgeLocked: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeText: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
});

