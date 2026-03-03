import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import type { TodayStackParamList } from '../../navigation/types';
import { useDayEntries } from '../../hooks/useDayEntries';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import {
  applyAnalysisResultToEntry,
  createProcessingEntry,
  ensureDateKey,
  markEntryAsError,
} from '../../services/journalService';
import { analyzeMealText } from '../../services/functionsService';
import { formatDatePill, toDateKey } from '../../utils/date';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, elevation, radius, spacing, typography } from '../../theme/tokens';
import type { JournalEntry } from '../../types/firestore';

type Props = NativeStackScreenProps<TodayStackParamList, 'Today'>;

const FIRE_ICON = '\u{1F525}';
const GEAR_ICON = '\u2699';
const MIC_ICON = '\u{1F3A4}';
const KEYBOARD_ICON = '\u2328';
const HEART_ICON = '\u2665';
const PROTEIN_ICON = '\u{1F357}';
const FAT_ICON = '\u{1F4A7}';

type EntryRowProps = {
  entry: JournalEntry;
  onCaloriesPress: (entryId: string) => void;
};

type GoalRowProps = {
  icon: string;
  iconStyle?: StyleProp<TextStyle>;
  fillStyle?: StyleProp<ViewStyle>;
  label: string;
  value: number;
  target: number;
};

const clampProgress = (value: number, target: number): number => {
  if (target <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, value / target));
};

const GoalRow = ({ icon, iconStyle, fillStyle, label, value, target }: GoalRowProps): React.JSX.Element => {
  const progress = clampProgress(value, target);

  return (
    <View style={styles.goalRow}>
      <View style={styles.goalRowTop}>
        <View style={styles.goalLabelWrap}>
          <Text style={[styles.goalRowIcon, iconStyle]}>{icon}</Text>
          <Text style={styles.goalLabel}>{label}</Text>
        </View>
        <Text style={styles.goalValue}>
          {`${value.toLocaleString()} `}
          <Text style={styles.goalTarget}>{`/ ${target.toLocaleString()}${label === 'Calories' ? '' : 'g'}`}</Text>
        </Text>
      </View>

      <View style={styles.goalTrack}>
        <View style={[styles.goalFill, fillStyle, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
};

const EntryRow = ({ entry, onCaloriesPress }: EntryRowProps): React.JSX.Element => {
  const caloriesLabel =
    entry.status === 'processing'
      ? 'Thinking...'
      : entry.status === 'error'
        ? 'Error'
        : `${entry.nutrition.calories} kcal`;

  return (
    <View style={styles.entryRow} testID={`entry-row-${entry.id}`}>
      <Text style={styles.entryText} numberOfLines={3}>
        {entry.mealText}
      </Text>

      <Pressable
        style={styles.entryRightTap}
        onPress={() => onCaloriesPress(entry.id)}
        testID={`entry-calories-hit-${entry.id}`}>
        <Text style={styles.entryCalories}>{caloriesLabel}</Text>
        {entry.ai.sourcesCount > 0 ? (
          <Text style={styles.entrySources}>{`${entry.ai.sourcesCount} sources`}</Text>
        ) : null}
      </Pressable>
    </View>
  );
};

export const TodayScreen = ({ navigation, route }: Props): React.JSX.Element => {
  const { user, userDoc } = useAuth();
  const [dateKey, setDateKey] = useState<string>(ensureDateKey(route.params?.dateKey));
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [draftText, setDraftText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState<boolean>(true);
  const inputRef = useRef<TextInput>(null);

  const { entries, totals, isLoading, error } = useDayEntries(user?.uid ?? null, dateKey);
  const { streakCount } = useDaysSummary(user?.uid ?? null);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const date = useMemo(() => new Date(`${dateKey}T12:00:00`), [dateKey]);
  const macroTargets =
    userDoc?.settings.macroTargets ?? {
      calories: 2200,
      carbsG: 220,
      proteinG: 140,
      fatG: 70,
    };

  const caloriesLeft = Math.max(0, macroTargets.calories - totals.calories);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDateKey(toDateKey(selectedDate));
    }
  };

  const openEntryDetails = (entryId: string) => {
    navigation.navigate('EntryDetail', {
      dateKey,
      entryId,
    });
  };

  const submitInlineEntry = async () => {
    const value = draftText.trim();

    if (!user || !userDoc || isSubmitting) {
      return;
    }

    if (value.length < 3) {
      setSubmitError('Please type at least 3 characters.');
      inputRef.current?.focus();
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const entryId = await createProcessingEntry(user.uid, dateKey, {
      mealText: value,
      source: 'text',
    });

    setDraftText('');
    inputRef.current?.focus();

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
    } catch (analysisError) {
      const reason =
        analysisError instanceof Error ? analysisError.message : 'Could not estimate nutrition.';
      await markEntryAsError(user.uid, dateKey, entryId, reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-today" style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardLayer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.mascotWrap}>
            <Text style={styles.mascotText}>Amy</Text>
          </View>

          <Pressable
            style={styles.headerPill}
            onPress={() => setShowPicker(true)}
            testID="today-date-pill">
            <Text style={styles.headerPillLabel}>
              {dateKey === toDateKey(new Date()) ? 'Today' : formatDatePill(dateKey)}
            </Text>
          </Pressable>

          <Pressable
            style={styles.headerPill}
            onPress={() => navigation.getParent()?.navigate('SettingsTab' as never)}
            testID="today-streak-settings-pill">
            <Text style={styles.headerPillLabel}>{`${FIRE_ICON} ${streakCount}`}</Text>
            <Text style={styles.headerIcon}>{GEAR_ICON}</Text>
          </Pressable>
        </View>

        {showPicker ? (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            testID="today-date-picker"
          />
        ) : null}

        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EntryRow entry={item} onCaloriesPress={openEntryDetails} />}
          contentContainerStyle={[
            styles.listContent,
            isKeyboardVisible ? styles.listContentKeyboard : styles.listContentGoals,
          ]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.inlineComposerWrap}>
              <View style={styles.inlineComposerRow}>
                <TextInput
                  ref={inputRef}
                  value={draftText}
                  onFocus={() => setIsKeyboardVisible(true)}
                  onBlur={() => setIsKeyboardVisible(false)}
                  onChangeText={value => {
                    setDraftText(value);
                    if (submitError) {
                      setSubmitError(null);
                    }
                  }}
                  placeholder="Start by typing what you ate."
                  placeholderTextColor="#8A8A8A"
                  style={styles.inlineComposerInput}
                  multiline
                  autoCorrect
                  testID="today-inline-input"
                />
                <Text style={styles.inlineDots}>...</Text>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
              {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
            </View>
          }
          ListEmptyComponent={<View style={styles.emptySpacer} testID="today-empty-state" />}
          ListFooterComponent={
            <View
              style={
                isKeyboardVisible
                  ? styles.listFooterSpacer
                  : isGoalsExpanded
                    ? styles.listFooterGoalsSpacer
                    : styles.listFooterGoalsCollapsedSpacer
              }
            />
          }
          testID="today-entry-list"
        />

        {isKeyboardVisible ? (
          <View style={styles.bottomDock} testID="today-bottom-dock">
            <View style={styles.leftCaloriesPill}>
              <Text style={styles.leftCaloriesText}>{`${FIRE_ICON} ${caloriesLeft.toLocaleString()} left`}</Text>
            </View>

            <Pressable
              style={[styles.circleAction, styles.circleActionBlue]}
              onPress={() => inputRef.current?.focus()}
              testID="today-mic-button">
              <Text style={styles.circleActionBlueLabel}>{MIC_ICON}</Text>
            </Pressable>

            <Pressable
              style={[styles.circleAction, isSubmitting && styles.circleActionDisabled]}
              onPress={() => submitInlineEntry().catch(() => undefined)}
              disabled={isSubmitting}
              testID="today-quick-add-button">
              <Text style={styles.circleActionPlus}>{isSubmitting ? '...' : '+'}</Text>
            </Pressable>

            <Pressable
              style={styles.circleAction}
              onPress={() => navigation.navigate('AddEntryModal', { dateKey })}
              testID="today-keyboard-button">
              <Text style={styles.circleActionKeyboard}>{KEYBOARD_ICON}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.goalsDock} testID="today-goals-dock">
            {isGoalsExpanded ? (
              <View style={styles.goalsCard}>
                <Text style={styles.goalsTitle}>Goals</Text>

                <GoalRow
                  icon={FIRE_ICON}
                  iconStyle={styles.goalIconCalories}
                  fillStyle={styles.goalFillCalories}
                  label="Calories"
                  value={totals.calories}
                  target={macroTargets.calories}
                />

                <GoalRow
                  icon={HEART_ICON}
                  iconStyle={styles.goalIconCarbs}
                  fillStyle={styles.goalFillCarbs}
                  label="Carbs"
                  value={totals.macros.carbsG}
                  target={macroTargets.carbsG}
                />

                <GoalRow
                  icon={PROTEIN_ICON}
                  iconStyle={styles.goalIconProtein}
                  fillStyle={styles.goalFillProtein}
                  label="Protein"
                  value={totals.macros.proteinG}
                  target={macroTargets.proteinG}
                />

                <GoalRow
                  icon={FAT_ICON}
                  iconStyle={styles.goalIconFat}
                  fillStyle={styles.goalFillFat}
                  label="Fat"
                  value={totals.macros.fatG}
                  target={macroTargets.fatG}
                />
              </View>
            ) : null}

            <Pressable
              style={styles.floatingSummaryPill}
              onPress={() => setIsGoalsExpanded(prev => !prev)}
              testID="today-goals-toggle-pill">
              <View style={styles.floatingMetric}>
                <Text style={styles.floatingIconCalories}>{FIRE_ICON}</Text>
                <Text style={styles.floatingValue}>{totals.calories.toLocaleString()}</Text>
              </View>

              <Text style={styles.floatingDot}>.</Text>

              <View style={styles.floatingMetric}>
                <Text style={styles.floatingMacroLabelCarbs}>C</Text>
                <Text style={styles.floatingValue}>{totals.macros.carbsG}</Text>
              </View>

              <Text style={styles.floatingDot}>.</Text>

              <View style={styles.floatingMetric}>
                <Text style={styles.floatingMacroLabelProtein}>P</Text>
                <Text style={styles.floatingValue}>{totals.macros.proteinG}</Text>
              </View>

              <Text style={styles.floatingDot}>.</Text>

              <View style={styles.floatingMetric}>
                <Text style={styles.floatingMacroLabelFat}>F</Text>
                <Text style={styles.floatingValue}>{totals.macros.fatG}</Text>
              </View>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  keyboardLayer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  mascotWrap: {
    width: 64,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotText: {
    color: '#4F46E5',
    fontSize: 26,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  headerPill: {
    minWidth: 96,
    height: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F1EEE7',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...elevation.card,
  },
  headerPillLabel: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
  },
  headerIcon: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    minHeight: '100%',
  },
  listContentKeyboard: {
    paddingBottom: 164,
  },
  listContentGoals: {
    paddingBottom: 430,
  },
  inlineComposerWrap: {
    minHeight: 120,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  inlineComposerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inlineComposerInput: {
    flex: 1,
    ...typography.body,
    fontSize: 21,
    lineHeight: 32,
    minHeight: 80,
    maxHeight: 180,
    paddingVertical: 0,
  },
  inlineDots: {
    color: '#BEB7AF',
    fontSize: 24,
    letterSpacing: 1.2,
    marginTop: 2,
    minWidth: 30,
    textAlign: 'right',
  },
  loader: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '500',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  entryText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '500',
  },
  entryRightTap: {
    alignItems: 'flex-end',
    minWidth: 96,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  entryCalories: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  entrySources: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  emptySpacer: {
    minHeight: 140,
  },
  listFooterSpacer: {
    height: 60,
  },
  listFooterGoalsSpacer: {
    height: 360,
  },
  listFooterGoalsCollapsedSpacer: {
    height: 108,
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  leftCaloriesPill: {
    width: 162,
    maxWidth: '45%',
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F1EEE7',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    ...elevation.card,
  },
  leftCaloriesText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  circleAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F1EEE7',
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.card,
  },
  circleActionBlue: {
    backgroundColor: '#F6FBFF',
  },
  circleActionBlueLabel: {
    color: '#2D9CDB',
    fontSize: 16,
  },
  circleActionPlus: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '500',
    marginTop: -1,
  },
  circleActionKeyboard: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  circleActionDisabled: {
    opacity: 0.6,
  },
  goalsDock: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: spacing.md,
  },
  goalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#E7E2D9',
    ...elevation.card,
  },
  goalsTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  goalRow: {
    marginBottom: spacing.sm,
  },
  goalRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  goalRowIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalIconCalories: {
    color: '#F97316',
  },
  goalIconCarbs: {
    color: '#FF3B30',
  },
  goalIconProtein: {
    color: '#F5B81A',
  },
  goalIconFat: {
    color: '#A855F7',
  },
  goalLabel: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  goalValue: {
    color: '#202124',
    fontSize: 16,
    fontWeight: '700',
  },
  goalTarget: {
    color: '#787D88',
    fontWeight: '400',
    fontSize: 16,
  },
  goalTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.round,
    backgroundColor: '#DBDBDF',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: radius.round,
  },
  goalFillCalories: {
    backgroundColor: '#F5B81A',
  },
  goalFillCarbs: {
    backgroundColor: '#FF3B30',
  },
  goalFillProtein: {
    backgroundColor: '#FF3B30',
  },
  goalFillFat: {
    backgroundColor: '#35C759',
  },
  floatingSummaryPill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E6E2DA',
    paddingHorizontal: spacing.md,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...elevation.card,
  },
  floatingMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  floatingIconCalories: {
    color: '#F97316',
    fontSize: 14,
  },
  floatingMacroLabelCarbs: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingMacroLabelProtein: {
    color: '#F5B81A',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingMacroLabelFat: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingValue: {
    color: '#202124',
    fontSize: 15,
    fontWeight: '700',
  },
  floatingDot: {
    color: '#C9CDD4',
    fontSize: 12,
    fontWeight: '700',
  },
});
