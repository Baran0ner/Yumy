import React from 'react';
import { StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { colors, spacing } from '../../theme/tokens';
import { AppCard } from './AppCard';

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
    <Animatable.View animation="fadeInUp" duration={280} useNativeDriver>
      <AppCard onPress={onPress} testID={testID} style={[styles.card, style]} contentStyle={styles.content}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
      </AppCard>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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