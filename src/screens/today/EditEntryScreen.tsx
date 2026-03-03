import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { JournalEntry } from '../../types/firestore';
import type { TodayStackParamList } from '../../navigation/types';
import { analyzeMealText } from '../../services/functionsService';
import {
  applyAnalysisResultToEntry,
  deleteEntry,
  markEntryAsError,
  markEntryProcessing,
  overrideEntryNutrition,
  subscribeEntry,
  updateEntryMealText,
} from '../../services/journalService';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'EditEntry'>;

export const EditEntryScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [mealText, setMealText] = useState<string>('');
  const [overrideEnabled, setOverrideEnabled] = useState<boolean>(false);
  const [calories, setCalories] = useState<string>('0');
  const [carbs, setCarbs] = useState<string>('0');
  const [protein, setProtein] = useState<string>('0');
  const [fat, setFat] = useState<string>('0');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeEntry(
      user.uid,
      route.params.dateKey,
      route.params.entryId,
      next => {
        setEntry(next);
        if (next) {
          setMealText(next.mealText);
          setCalories(String(next.nutrition.calories));
          setCarbs(String(next.nutrition.macros.carbsG));
          setProtein(String(next.nutrition.macros.proteinG));
          setFat(String(next.nutrition.macros.fatG));
        }
      },
      () => setEntry(null),
    );

    return unsubscribe;
  }, [user, route.params.dateKey, route.params.entryId]);

  const handleSave = async () => {
    if (!user || !userDoc || !entry || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const trimmed = mealText.trim();
      await updateEntryMealText(user.uid, route.params.dateKey, route.params.entryId, trimmed);

      if (overrideEnabled) {
        await overrideEntryNutrition(user.uid, route.params.dateKey, route.params.entryId, Number(calories) || 0, {
          carbsG: Number(carbs) || 0,
          proteinG: Number(protein) || 0,
          fatG: Number(fat) || 0,
        });
      } else {
        await markEntryProcessing(user.uid, route.params.dateKey, route.params.entryId);
        try {
          const analysis = await analyzeMealText({
            mealText: trimmed,
            date: route.params.dateKey,
            locale: Intl.DateTimeFormat().resolvedOptions().locale,
            bias: userDoc.settings.calorieBias,
            units: userDoc.settings.units,
            location: userDoc.settings.useLocationForRestaurants ? 'city-only' : undefined,
          });

          await applyAnalysisResultToEntry(user.uid, route.params.dateKey, route.params.entryId, analysis);
        } catch (error) {
          const reason = error instanceof Error ? error.message : t('editEntry.reestimateFailed');
          await markEntryAsError(user.uid, route.params.dateKey, route.params.entryId, reason);
        }
      }

      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !entry) {
      return;
    }

    Alert.alert(t('editEntry.deleteTitle'), t('editEntry.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('editEntry.delete'),
        style: 'destructive',
        onPress: () => {
          deleteEntry(user.uid, route.params.dateKey, route.params.entryId)
            .then(() => navigation.popToTop())
            .catch(() => undefined);
        },
      },
    ]);
  };

  if (!entry) {
    return (
      <View style={styles.centered} testID="screen-edit-entry">
        <Text style={styles.placeholder}>{t('editEntry.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} testID="screen-edit-entry">
      <Text style={styles.title}>{t('editEntry.title')}</Text>

      <AppInput
        value={mealText}
        onChangeText={setMealText}
        multiline
        style={styles.textInput}
        contentStyle={styles.textInputContent}
        testID="edit-entry-meal-text-input"
      />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{t('editEntry.override')}</Text>
        <Switch
          value={overrideEnabled}
          onValueChange={setOverrideEnabled}
          testID="edit-entry-override-toggle"
        />
      </View>

      {overrideEnabled ? (
        <View style={styles.overrideGrid}>
          <View style={styles.overrideField}>
            <Text style={styles.overrideLabel}>{t('today.calories')}</Text>
            <AppInput
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              style={styles.overrideInput}
              testID="edit-entry-calories-input"
            />
          </View>
          <View style={styles.overrideField}>
            <Text style={styles.overrideLabel}>{t('today.carbs')}</Text>
            <AppInput
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              style={styles.overrideInput}
              testID="edit-entry-carbs-input"
            />
          </View>
          <View style={styles.overrideField}>
            <Text style={styles.overrideLabel}>{t('today.protein')}</Text>
            <AppInput
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              style={styles.overrideInput}
              testID="edit-entry-protein-input"
            />
          </View>
          <View style={styles.overrideField}>
            <Text style={styles.overrideLabel}>{t('today.fat')}</Text>
            <AppInput
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              style={styles.overrideInput}
              testID="edit-entry-fat-input"
            />
          </View>
        </View>
      ) : null}

      <AppButton onPress={() => handleSave().catch(() => undefined)} testID="edit-entry-save-button">
        {isSaving ? t('editEntry.saving') : t('editEntry.saveChanges')}
      </AppButton>

      <AppButton variant="danger" onPress={handleDelete} testID="edit-entry-delete-button">
        {t('editEntry.deleteEntry')}
      </AppButton>
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
    paddingVertical: spacing.lg,
    gap: spacing.md,
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
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 140,
  },
  textInputContent: {
    textAlignVertical: 'top',
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  overrideGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  overrideField: {
    width: '48%',
  },
  overrideLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  overrideInput: {
    height: 48,
  },
});