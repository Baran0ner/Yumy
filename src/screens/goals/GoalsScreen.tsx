import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useDaysSummary } from '../../hooks/useDaysSummary';
import { useUserSettingsActions } from '../../hooks/useUserSettingsActions';
import type { GoalsStackParamList } from '../../navigation/types';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<GoalsStackParamList, 'Goals'>;
type MacroKey = 'carbsG' | 'proteinG' | 'fatG';
type MacroTargetsState = {
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const defaultTargets: MacroTargetsState = {
  calories: 2200,
  carbsG: 220,
  proteinG: 140,
  fatG: 70,
};

type SymbolIconProps = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

const SymbolIcon = ({ label, backgroundColor, textColor }: SymbolIconProps): React.JSX.Element => (
  <View style={[styles.symbolIcon, { backgroundColor }]}>
    <Text style={[styles.symbolIconText, { color: textColor }]}>{label}</Text>
  </View>
);

type MacroRatioRowProps = {
  iconLabel: string;
  iconColor: string;
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  onDecrease: () => void;
  onIncrease: () => void;
  onScrubValueChange: (nextValue: number) => void;
  onScrubComplete: (nextValue: number) => void;
};

const MacroRatioRow = ({
  iconLabel,
  iconColor,
  label,
  value,
  min,
  max,
  color,
  onDecrease,
  onIncrease,
  onScrubValueChange,
  onScrubComplete,
}: MacroRatioRowProps): React.JSX.Element => {
  const progressPercent = clamp((value / max) * 100, 0, 100);
  const trackWidthRef = useRef<number>(1);

  const valueFromEvent = useCallback(
    (event: GestureResponderEvent) => {
      const width = trackWidthRef.current || 1;
      const x = clamp(event.nativeEvent.locationX, 0, width);
      const raw = min + (x / width) * (max - min);
      return Math.round(raw / 5) * 5;
    },
    [max, min],
  );

  const handleScrub = useCallback(
    (event: GestureResponderEvent, shouldCommit: boolean) => {
      const nextValue = clamp(valueFromEvent(event), min, max);
      onScrubValueChange(nextValue);
      if (shouldCommit) {
        onScrubComplete(nextValue);
      }
    },
    [max, min, onScrubComplete, onScrubValueChange, valueFromEvent],
  );

  return (
    <View style={styles.macroBlock}>
      <View style={styles.macroTopRow}>
        <View style={styles.macroNameWrap}>
          <View style={[styles.macroLabelIcon, { backgroundColor: iconColor }]}>
            <Text style={styles.macroLabelIconText}>{iconLabel}</Text>
          </View>
          <Text style={styles.macroLabel}>{label}</Text>
        </View>
        <View style={styles.macroValueControls}>
          <Text style={styles.macroValue}>{`${value}g`}</Text>
          <View style={styles.macroActions}>
            <Pressable style={styles.microButton} onPress={onDecrease}>
              <Text style={styles.microLabel}>-</Text>
            </Pressable>
            <Pressable style={styles.microButton} onPress={onIncrease}>
              <Text style={styles.microLabel}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View
        style={styles.sliderTrack}
        onLayout={event => {
          trackWidthRef.current = event.nativeEvent.layout.width || 1;
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={event => handleScrub(event, false)}
        onResponderMove={event => handleScrub(event, false)}
        onResponderRelease={event => handleScrub(event, true)}
        onResponderTerminate={event => handleScrub(event, true)}>
        <View style={[styles.sliderFill, { width: `${progressPercent}%`, backgroundColor: color }]}>
          <View style={[styles.sliderThumb, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

export const GoalsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const { user, userDoc } = useAuth();
  const { streakCount } = useDaysSummary(user?.uid ?? null);
  const { setMacroTargets } = useUserSettingsActions(user?.uid ?? null);

  const targets = useMemo<MacroTargetsState>(() => userDoc?.settings.macroTargets ?? defaultTargets, [userDoc]);
  const [draftTargets, setDraftTargets] = useState<MacroTargetsState>(targets);

  useEffect(() => {
    setDraftTargets(targets);
  }, [targets]);

  const updateTargets = useCallback(
    (
      updater: (prev: MacroTargetsState) => MacroTargetsState,
      persist: boolean = false,
    ) => {
      setDraftTargets(prev => {
        const next = updater(prev);
        if (persist) {
          setMacroTargets(next).catch(() => undefined);
        }
        return next;
      });
    },
    [setMacroTargets],
  );

  const bumpCalories = async (delta: number) => {
    updateTargets(
      prev => ({
        ...prev,
        calories: clamp(prev.calories + delta, 1200, 4500),
      }),
      true,
    );
  };

  const bumpMacro = async (key: MacroKey, delta: number) => {
    updateTargets(
      prev => ({
        ...prev,
        [key]: clamp(prev[key] + delta, 20, 400),
      }),
      true,
    );
  };

  const scrubMacro = (key: MacroKey, nextValue: number) => {
    updateTargets(prev => ({
      ...prev,
      [key]: clamp(nextValue, 20, 400),
    }));
  };

  const commitMacro = (key: MacroKey, nextValue: number) => {
    updateTargets(
      prev => ({
        ...prev,
        [key]: clamp(nextValue, 20, 400),
      }),
      true,
    );
  };

  return (
    <ScreenContainer testID="screen-goals" style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('goals.title')}</Text>
        <Pressable style={styles.moreButton} onPress={() => undefined}>
          <Text style={styles.moreButtonLabel}>...</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.eyebrowWrap}>
            <SymbolIcon label="TG" backgroundColor="#EEF1F8" textColor="#2F405D" />
            <Text style={styles.cardEyebrow}>{t('goals.dailyTarget')}</Text>
          </View>
          <SymbolIcon label="FX" backgroundColor="#FDEDDC" textColor="#C97310" />
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metric}>{draftTargets.calories}</Text>
          <Text style={styles.metricUnit}>kcal</Text>
        </View>
        <View style={styles.stepRow}>
          <Pressable
            style={styles.stepButton}
            onPress={() => bumpCalories(-100).catch(() => undefined)}
            testID="goals-calories-minus">
            <Text style={styles.stepButtonIcon}>-</Text>
            <Text style={styles.stepLabel}>100</Text>
          </Pressable>
          <Pressable
            style={styles.stepButton}
            onPress={() => bumpCalories(100).catch(() => undefined)}
            testID="goals-calories-plus">
            <Text style={styles.stepButtonIcon}>+</Text>
            <Text style={styles.stepLabel}>100</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.eyebrowWrap}>
            <SymbolIcon label="MC" backgroundColor="#F2F0E9" textColor="#636363" />
            <Text style={styles.cardEyebrow}>{t('goals.macroRatios')}</Text>
          </View>
          <View style={styles.balanceBadge}>
            <Text style={styles.balanceBadgeLabel}>BAL</Text>
          </View>
        </View>

        <MacroRatioRow
          iconLabel="PR"
          iconColor="#10B981"
          label={t('today.protein')}
          value={draftTargets.proteinG}
          min={20}
          max={300}
          color="#10B981"
          onDecrease={() => bumpMacro('proteinG', -5).catch(() => undefined)}
          onIncrease={() => bumpMacro('proteinG', 5).catch(() => undefined)}
          onScrubValueChange={value => scrubMacro('proteinG', value)}
          onScrubComplete={value => commitMacro('proteinG', value)}
        />
        <MacroRatioRow
          iconLabel="CB"
          iconColor="#F59E0B"
          label={t('today.carbs')}
          value={draftTargets.carbsG}
          min={20}
          max={400}
          color="#F59E0B"
          onDecrease={() => bumpMacro('carbsG', -5).catch(() => undefined)}
          onIncrease={() => bumpMacro('carbsG', 5).catch(() => undefined)}
          onScrubValueChange={value => scrubMacro('carbsG', value)}
          onScrubComplete={value => commitMacro('carbsG', value)}
        />
        <MacroRatioRow
          iconLabel="FT"
          iconColor="#F43F5E"
          label={t('today.fat')}
          value={draftTargets.fatG}
          min={20}
          max={150}
          color="#F43F5E"
          onDecrease={() => bumpMacro('fatG', -5).catch(() => undefined)}
          onIncrease={() => bumpMacro('fatG', 5).catch(() => undefined)}
          onScrubValueChange={value => scrubMacro('fatG', value)}
          onScrubComplete={value => commitMacro('fatG', value)}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.eyebrowWrap}>
            <SymbolIcon label="ST" backgroundColor="#FFF4E8" textColor="#C97310" />
            <Text style={styles.cardEyebrow}>{t('goals.currentStreak')}</Text>
          </View>
          <SymbolIcon label="FX" backgroundColor="#FFF4E8" textColor="#C97310" />
        </View>
        <View style={styles.streakMetricRow}>
          <Text style={styles.streakCount}>{streakCount}</Text>
          <Text style={styles.streakUnit}>{t('goals.days')}</Text>
        </View>
        <Text style={styles.streakHint}>{t('goals.streakHint')}</Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('StreaksBadges')}
          testID="goals-streaks-badges-button">
          <Text style={styles.secondaryLabel}>{t('goals.seeStreaksBadges')}</Text>
          <Text style={styles.secondaryIcon}>{'>'}</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('MacroPlan')}
        testID="goals-nutrition-plan-button">
        <Text style={styles.primaryLabel}>{t('goals.nutritionPlanPresets')}</Text>
        <View style={styles.primaryIconWrap}>
          <Text style={styles.primaryIcon}>{'->'}</Text>
        </View>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonLabel: {
    color: '#7B7B7B',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0ECE3',
    padding: spacing.md,
    gap: spacing.sm,
    ...elevation.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  symbolIcon: {
    minWidth: 26,
    height: 26,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  symbolIconText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  cardEyebrow: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  metric: {
    color: colors.textPrimary,
    fontSize: 52,
    fontWeight: '700',
    lineHeight: 56,
    letterSpacing: -1,
  },
  metricUnit: {
    color: '#8A8A8A',
    fontSize: 15,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  stepButton: {
    flex: 1,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stepButtonIcon: {
    color: '#444444',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLabel: {
    color: '#3B3B3B',
    fontWeight: '600',
    fontSize: 15,
  },
  balanceBadge: {
    backgroundColor: '#F2F0E9',
    borderRadius: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  balanceBadgeLabel: {
    color: '#6B6B6B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  macroBlock: {
    marginTop: spacing.sm,
    gap: 6,
  },
  macroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroLabelIcon: {
    width: 24,
    height: 24,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroLabelIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  macroLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  macroValueControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  macroActions: {
    flexDirection: 'row',
    gap: 6,
  },
  microButton: {
    width: 24,
    height: 24,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microLabel: {
    color: '#5D5D5D',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 16,
  },
  sliderTrack: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: radius.round,
    justifyContent: 'center',
  },
  sliderFill: {
    height: 4,
    borderRadius: radius.round,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sliderThumb: {
    width: 12,
    height: 12,
    borderRadius: radius.round,
    marginRight: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  streakMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakCount: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.7,
  },
  streakUnit: {
    color: '#5F6672',
    fontSize: 16,
    fontWeight: '500',
  },
  streakHint: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  secondaryButton: {
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryLabel: {
    color: '#3D3D3D',
    fontWeight: '500',
    fontSize: 14,
  },
  secondaryIcon: {
    color: '#707070',
    fontSize: 18,
  },
  primaryButton: {
    marginTop: spacing.xs,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: '#1E2B42',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  primaryIconWrap: {
    width: 24,
    height: 24,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '700',
  },
});




