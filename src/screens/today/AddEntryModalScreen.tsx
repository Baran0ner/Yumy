import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import type { TodayStackParamList } from '../../navigation/types';
import { analyzeMealText } from '../../services/functionsService';
import {
  applyAnalysisResultToEntry,
  createProcessingEntry,
  markEntryAsError,
} from '../../services/journalService';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'AddEntryModal'>;

export const AddEntryModalScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc, canLogMeals, startGuestTrialIfNeeded } = useAuth();
  const [mealText, setMealText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const tooLongHint = useMemo(() => {
    if (mealText.trim().length > 280) {
      return t('addEntry.longHint');
    }

    return null;
  }, [mealText, t]);

  const submit = async () => {
    const value = mealText.trim();

    if (!user || !userDoc) {
      return;
    }

    if (!canLogMeals) {
      setValidationError(t('today.quickAddBlocked'));
      return;
    }

    if (value.length < 3) {
      setValidationError(t('today.typeThreeChars'));
      return;
    }

    if (isSubmitting) {
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    const dateKey = route.params.dateKey;
    const entryId = await createProcessingEntry(user.uid, dateKey, {
      mealText: value,
      source: 'text',
    });

    navigation.goBack();

    try {
      const analysis = await analyzeMealText({
        mealText: value,
        date: dateKey,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        bias: userDoc.settings.calorieBias,
        units: userDoc.settings.units,
        location: userDoc.settings.useLocationForRestaurants ? 'city-only' : undefined,
      });

      await applyAnalysisResultToEntry(user.uid, dateKey, entryId, analysis);
      await startGuestTrialIfNeeded();
    } catch (error) {
      const reason = error instanceof Error ? error.message : t('addEntry.estimateFailed');
      await markEntryAsError(user.uid, dateKey, entryId, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.overlay} testID="screen-add-entry-modal">
      <View style={styles.sheet}>
        <Text style={styles.title}>{t('addEntry.title')}</Text>

        <AppInput
          value={mealText}
          onChangeText={setMealText}
          placeholder={t('addEntry.placeholder')}
          style={styles.input}
          contentStyle={styles.inputContent}
          multiline
          testID="add-entry-input"
        />

        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}
        {tooLongHint ? <Text style={styles.hint}>{tooLongHint}</Text> : null}

        <AppButton
          variant="outline"
          onPress={() =>
            navigation.replace('PhotoCapture', {
              dateKey: route.params.dateKey,
            })
          }
          testID="add-entry-photo-button">
          {t('addEntry.addPhoto')}
        </AppButton>

        <AppButton
          variant="outline"
          onPress={() =>
            navigation.replace('BarcodeScan', {
              dateKey: route.params.dateKey,
            })
          }
          testID="add-entry-barcode-button">
          {t('addEntry.scanBarcode')}
        </AppButton>

        <AppButton
          onPress={() => submit().catch(() => undefined)}
          disabled={isSubmitting}
          testID="add-entry-log-button">
          {isSubmitting ? t('addEntry.logging') : t('addEntry.log')}
        </AppButton>

        <AppButton
          variant="text"
          onPress={() => navigation.goBack()}
          testID="add-entry-cancel-button">
          {t('common.cancel')}
        </AppButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 120,
    maxHeight: 210,
  },
  inputContent: {
    textAlignVertical: 'top',
    fontSize: 16,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: 12,
  },
  hint: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
  },
});