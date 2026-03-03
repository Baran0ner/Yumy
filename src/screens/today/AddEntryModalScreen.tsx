import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { TodayStackParamList } from '../../navigation/types';
import { analyzeMealText } from '../../services/functionsService';
import {
  applyAnalysisResultToEntry,
  createProcessingEntry,
  markEntryAsError,
} from '../../services/journalService';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<TodayStackParamList, 'AddEntryModal'>;

export const AddEntryModalScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const [mealText, setMealText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const tooLongHint = useMemo(() => {
    if (mealText.trim().length > 280) {
      return 'Tip: Split into separate lines for better estimates.';
    }

    return null;
  }, [mealText]);

  const submit = async () => {
    const value = mealText.trim();

    if (!user || !userDoc) {
      return;
    }

    if (value.length < 3) {
      setValidationError('Please enter at least 3 characters.');
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
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Could not estimate nutrition.';
      await markEntryAsError(user.uid, dateKey, entryId, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.overlay} testID="screen-add-entry-modal">
      <View style={styles.sheet}>
        <Text style={styles.title}>Add entry</Text>

        <TextInput
          value={mealText}
          onChangeText={setMealText}
          placeholder="Type what you ate..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          multiline
          testID="add-entry-input"
        />

        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}
        {tooLongHint ? <Text style={styles.hint}>{tooLongHint}</Text> : null}

        <Pressable
          style={styles.photoButton}
          onPress={() =>
            navigation.replace('PhotoCapture', {
              dateKey: route.params.dateKey,
            })
          }
          testID="add-entry-photo-button">
          <Text style={styles.photoButtonLabel}>Add photo</Text>
        </Pressable>

        <Pressable
          style={[styles.logButton, isSubmitting && styles.logButtonDisabled]}
          onPress={() => submit().catch(() => undefined)}
          disabled={isSubmitting}
          testID="add-entry-log-button">
          <Text style={styles.logButtonLabel}>{isSubmitting ? 'Logging...' : 'Log'}</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()} testID="add-entry-cancel-button">
          <Text style={styles.cancelButtonLabel}>Cancel</Text>
        </Pressable>
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
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 120,
    maxHeight: 210,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    color: colors.textPrimary,
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
  photoButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoButtonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  logButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonLabel: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  cancelButtonLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});


