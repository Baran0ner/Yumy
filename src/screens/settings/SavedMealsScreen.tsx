import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { SavedMeal } from '../../types/firestore';
import type { SettingsStackParamList } from '../../navigation/types';
import { quickAddSavedMeal, subscribeSavedMeals } from '../../services/journalService';
import { toDateKey } from '../../utils/date';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SavedMeals'>;

export const SavedMealsScreen = ({ route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, canLogMeals, startGuestTrialIfNeeded } = useAuth();
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);

  const targetDate = useMemo(() => route.params?.dateKey ?? toDateKey(new Date()), [route.params]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeSavedMeals(
      user.uid,
      meals => setSavedMeals(meals),
      () => setSavedMeals([]),
    );

    return unsubscribe;
  }, [user]);

  const handleQuickAdd = async (meal: SavedMeal) => {
    if (!user) {
      return;
    }

    if (!canLogMeals) {
      Alert.alert(t('common.signIn'), t('today.quickAddBlocked'));
      return;
    }

    await quickAddSavedMeal(user.uid, targetDate, meal);
    await startGuestTrialIfNeeded();
    Alert.alert(t('savedMeals.addedTitle'), t('savedMeals.addedBody'));
  };

  return (
    <ScreenContainer testID="screen-saved-meals" style={styles.container}>
      <Text style={styles.title}>{t('savedMeals.title')}</Text>
      <Text style={styles.subtitle}>{t('savedMeals.subtitle', { date: targetDate })}</Text>

      <FlatList
        data={savedMeals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppCard style={styles.card} contentStyle={styles.cardContent} testID={`saved-meal-${item.id}`}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.defaultText}
            </Text>
            {item.nutritionSnapshot ? (
              <Text style={styles.cardMeta}>{`\u{1F525} ${item.nutritionSnapshot.calories} · C ${item.nutritionSnapshot.macros.carbsG} · P ${item.nutritionSnapshot.macros.proteinG} · F ${item.nutritionSnapshot.macros.fatG}`}</Text>
            ) : null}
            <AppButton
              size="sm"
              onPress={() => handleQuickAdd(item).catch(() => undefined)}
              testID={`saved-meal-quick-add-${item.id}`}>
              {t('savedMeals.quickAdd')}
            </AppButton>
          </AppCard>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t('savedMeals.empty')}</Text>}
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
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardMeta: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});