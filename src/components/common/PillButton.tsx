import React from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

type PillButtonProps = {
  label: string;
  onPress?: () => void;
  rightLabel?: string;
  testID?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
};

export const PillButton = ({
  label,
  onPress,
  rightLabel,
  testID,
  style,
  labelStyle,
}: PillButtonProps) => {
  return (
    <Pressable style={[styles.pill, style]} onPress={onPress} testID={testID}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...elevation.card,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  rightLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});

