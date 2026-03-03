import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { SavedMeal } from '../../types/firestore';
import type { SettingsStackParamList } from '../../navigation/types';
import { quickAddSavedMeal, subscribeSavedMeals } from '../../services/journalService';
import { toDateKey } from '../../utils/date';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SavedMeals'>;

export const SavedMealsScreen = ({ route }: Props): React.JSX.Element => {
  const { user } = useAuth();
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

    await quickAddSavedMeal(user.uid, targetDate, meal);
    Alert.alert('Added', 'Saved meal added to Today.');
  };

  return (
    <ScreenContainer testID="screen-saved-meals" style={styles.container}>
      <Text style={styles.title}>Saved Meals</Text>
      <Text style={styles.subtitle}>Quick add meals to {targetDate}</Text>

      <FlatList
        data={savedMeals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`saved-meal-${item.id}`}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.defaultText}
            </Text>
            {item.nutritionSnapshot ? (
              <Text style={styles.cardMeta}>{`?? ${item.nutritionSnapshot.calories} · C ${item.nutritionSnapshot.macros.carbsG} · P ${item.nutritionSnapshot.macros.proteinG} · F ${item.nutritionSnapshot.macros.fatG}`}</Text>
            ) : null}
            <Pressable style={styles.quickButton} onPress={() => handleQuickAdd(item).catch(() => undefined)} testID={`saved-meal-quick-add-${item.id}`}>
              <Text style={styles.quickButtonLabel}>Quick add</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No saved meals yet. Save from entry detail.</Text>}
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
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  cardBody: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  cardMeta: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  quickButton: {
    alignSelf: 'flex-start',
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  quickButtonLabel: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

