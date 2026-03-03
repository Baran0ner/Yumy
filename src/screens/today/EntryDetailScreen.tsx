import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { JournalEntry } from '../../types/firestore';
import type { TodayStackParamList } from '../../navigation/types';
import { duplicateEntry, saveMealFromEntry, subscribeEntry } from '../../services/journalService';
import { AppCard } from '../../components/common/AppCard';
import { colors, elevation, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'EntryDetail'>;

type DetailItem = {
  name: string;
  calories: number;
};

const FIRE_ICON = '\u{1F525}';
const PROTEIN_ICON = '\u{1F9C8}';
const CARBS_ICON = '\u{1F353}';
const FAT_ICON = '\u{1F48A}';

const getConfidenceMeta = (confidence: number, t: (key: string) => string) => {
  if (confidence >= 0.7) {
    return { label: t('entryDetail.confidenceHigh'), color: '#2EBE6E' };
  }

  if (confidence >= 0.45) {
    return { label: t('entryDetail.confidenceMedium'), color: '#EAA038' };
  }

  return { label: t('entryDetail.confidenceLow'), color: '#D86363' };
};

const buildFallbackItems = (entry: JournalEntry, t: (key: string) => string): DetailItem[] => {
  const totalCalories = Math.max(0, Math.round(entry.nutrition.calories));
  if (totalCalories === 0) {
    return [];
  }

  const parts = entry.mealText
    .split(/\s+(?:and|&)\s+|,/gi)
    .map(item => item.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [{ name: entry.mealText || t('entryDetail.mealItem'), calories: totalCalories }];
  }

  const evenSplit = Math.floor(totalCalories / parts.length);
  let remaining = totalCalories;

  return parts.map((name, index) => {
    const calories = index === parts.length - 1 ? remaining : evenSplit;
    remaining -= calories;
    return { name, calories };
  });
};

export const EntryDetailScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeEntry(
      user.uid,
      route.params.dateKey,
      route.params.entryId,
      next => setEntry(next),
      () => setEntry(null),
    );

    return unsubscribe;
  }, [user, route.params.dateKey, route.params.entryId]);

  const handleDuplicate = async () => {
    if (!user || !entry) {
      return;
    }

    await duplicateEntry(user.uid, route.params.dateKey, entry);
    Alert.alert(t('entryDetail.duplicatedTitle'), t('entryDetail.duplicatedBody'));
  };

  const handleSaveMeal = async () => {
    if (!user || !entry) {
      return;
    }

    const fallbackTitle = entry.mealText.slice(0, 36) || t('savedMeals.title');
    await saveMealFromEntry(user.uid, entry, fallbackTitle);
    Alert.alert(t('entryDetail.savedTitle'), t('entryDetail.savedBody'));
  };

  const handleMorePress = () => {
    Alert.alert(t('entryDetail.actionsTitle'), '', [
      {
        text: t('entryDetail.edit'),
        onPress: () =>
          navigation.navigate('EditEntry', {
            dateKey: route.params.dateKey,
            entryId: route.params.entryId,
          }),
      },
      { text: t('entryDetail.duplicate'), onPress: () => handleDuplicate().catch(() => undefined) },
      { text: t('entryDetail.saveAsMeal'), onPress: () => handleSaveMeal().catch(() => undefined) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const detailItems = useMemo<DetailItem[]>(() => {
    if (!entry) {
      return [];
    }

    if (Array.isArray(entry.ai.items) && entry.ai.items.length > 0) {
      return entry.ai.items.map(item => ({
        name: item.name,
        calories: Math.round(item.calories),
      }));
    }

    return buildFallbackItems(entry, t);
  }, [entry, t]);

  if (!entry) {
    return (
      <View style={styles.centered} testID="screen-entry-detail">
        <Text style={styles.placeholder}>{t('entryDetail.notFound')}</Text>
      </View>
    );
  }

  const confidencePct = Math.max(0, Math.min(100, Math.round((entry.ai.confidence ?? 0) * 100)));
  const confidenceMeta = getConfidenceMeta(entry.ai.confidence ?? 0, t);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="screen-entry-detail">
      <View style={styles.dragHandle} />

      <View style={styles.topRow}>
        <Text style={styles.navTitle}>{t('entryDetail.title')}</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.topActionButton} onPress={handleMorePress} testID="entry-detail-more-button">
            <Text style={styles.topActionLabel}>•••</Text>
          </Pressable>
          <Pressable
            style={styles.topActionButton}
            onPress={() => navigation.goBack()}
            testID="entry-detail-close-button">
            <Text style={styles.topActionLabel}>×</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.mealTitle}>{entry.mealText}</Text>

      <AppCard style={styles.summaryCard} contentStyle={styles.summaryContent}>
        <View style={styles.calorieRow}>
          <Text style={styles.fireIcon}>{FIRE_ICON}</Text>
          <Text style={styles.calorieValue}>{Math.round(entry.nutrition.calories)}</Text>
          <Text style={styles.calorieCaption}>{t('entryDetail.totalCalories')}</Text>
        </View>

        <View style={styles.macroGrid}>
          <View style={styles.macroCell}>
            <Text style={styles.macroValue}>{`${entry.nutrition.macros.proteinG.toFixed(1)} g`}</Text>
            <Text style={styles.macroLabel}>{`${PROTEIN_ICON} ${t('today.protein')}`}</Text>
          </View>
          <View style={styles.macroCell}>
            <Text style={styles.macroValue}>{`${entry.nutrition.macros.carbsG.toFixed(1)} g`}</Text>
            <Text style={styles.macroLabel}>{`${CARBS_ICON} ${t('today.carbs')}`}</Text>
          </View>
          <View style={styles.macroCell}>
            <Text style={styles.macroValue}>{`${entry.nutrition.macros.fatG.toFixed(1)} g`}</Text>
            <Text style={styles.macroLabel}>{`${FAT_ICON} ${t('today.fat')}`}</Text>
          </View>
        </View>
      </AppCard>

      <Text style={styles.sectionTitle}>{t('entryDetail.items')}</Text>
      <View style={styles.itemsWrap}>
        {detailItems.length > 0 ? (
          detailItems.map((item, index) => (
            <AppCard
              key={`${item.name}-${index}`}
              style={styles.itemRow}
              contentStyle={styles.itemRowContent}
              testID={`entry-detail-item-${index}`}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemRight}>
                <Text style={styles.itemCalories}>{`${item.calories} ${t('entryDetail.cal')}`}</Text>
                <Text style={styles.itemChevron}>?</Text>
              </View>
            </AppCard>
          ))
        ) : (
          <AppCard style={styles.itemRow} contentStyle={styles.itemRowContent}>
            <Text style={styles.itemName}>{t('entryDetail.noBreakdown')}</Text>
            <Text style={styles.itemCalories}>-</Text>
          </AppCard>
        )}
      </View>

      {userDoc?.settings.showThoughtProcess ? (
        <>
          <Text style={styles.sectionTitle}>{t('entryDetail.thoughtProcess')}</Text>
          <AppCard style={styles.thoughtCard} contentStyle={styles.thoughtContent}>
            <View style={styles.confidenceRow}>
              <View style={[styles.confidenceRing, { borderColor: confidenceMeta.color }]}> 
                <Text style={[styles.confidenceNumber, { color: confidenceMeta.color }]}>{confidencePct}</Text>
              </View>
              <View style={styles.confidenceTextWrap}>
                <Text style={styles.confidenceCaption}>{t('entryDetail.confidenceLevel')}</Text>
                <Text style={[styles.confidenceLevel, { color: confidenceMeta.color }]}>
                  {confidenceMeta.label}
                </Text>
              </View>
            </View>

            <Text style={styles.reasoningText}>
              {entry.ai.reasoningSummary || t('entryDetail.noThoughtProcess')}
            </Text>

            <Text style={styles.sourcesText}>{`${t('entryDetail.sourcesUsed')}: ${entry.ai.sourcesCount}`}</Text>
          </AppCard>
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  dragHandle: {
    width: 52,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#D0CBC4',
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navTitle: {
    color: colors.textPrimary,
    fontSize: 38 / 2,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topActionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1EEE7',
    ...elevation.card,
  },
  topActionLabel: {
    color: '#76706A',
    fontSize: 28 / 2,
    fontWeight: '700',
  },
  mealTitle: {
    color: colors.textPrimary,
    fontSize: 58 / 2,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  summaryCard: {
    borderRadius: 28,
  },
  summaryContent: {
    padding: spacing.lg,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireIcon: {
    fontSize: 34 / 2,
    marginRight: spacing.sm,
  },
  calorieValue: {
    color: '#080808',
    fontSize: 88 / 2,
    fontWeight: '800',
    marginRight: spacing.sm,
  },
  calorieCaption: {
    color: '#8A8580',
    fontSize: 18 * 0.95,
    fontWeight: '500',
    marginTop: 8,
  },
  macroGrid: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCell: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    color: '#1D1D1D',
    fontSize: 24 / 1.3,
    fontWeight: '700',
  },
  macroLabel: {
    marginTop: spacing.xs,
    color: '#7E7973',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#8A8580',
    fontSize: 44 / 2,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemsWrap: {
    gap: spacing.sm,
  },
  itemRow: {
    minHeight: 76,
    borderRadius: 22,
  },
  itemRowContent: {
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    color: '#1E1E1E',
    fontSize: 20 / 1.2,
    fontWeight: '500',
    paddingRight: spacing.sm,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemCalories: {
    color: '#1E1E1E',
    fontSize: 36 / 2,
    fontWeight: '700',
  },
  itemChevron: {
    color: '#96908A',
    fontSize: 24 / 1.3,
    marginTop: 2,
  },
  thoughtCard: {
    borderRadius: 22,
  },
  thoughtContent: {
    padding: spacing.md,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confidenceRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  confidenceNumber: {
    fontSize: 34 / 2,
    fontWeight: '700',
  },
  confidenceTextWrap: {
    flex: 1,
  },
  confidenceCaption: {
    color: '#8A8580',
    fontSize: 18 / 1.1,
    fontWeight: '500',
  },
  confidenceLevel: {
    fontSize: 40 / 2,
    fontWeight: '800',
    marginTop: 2,
  },
  reasoningText: {
    color: '#252525',
    fontSize: 20 / 1.2,
    lineHeight: 38 / 1.2,
    fontWeight: '500',
  },
  sourcesText: {
    marginTop: spacing.md,
    color: '#8A8580',
    fontSize: 14,
    fontWeight: '600',
  },
});
