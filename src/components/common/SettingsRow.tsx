import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, elevation, radius, spacing } from '../../theme/tokens';

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  testID?: string;
};

export const SettingsRow = ({
  title,
  subtitle,
  onPress,
  toggleValue,
  onToggle,
  testID,
}: SettingsRowProps) => {
  const content = (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {typeof toggleValue === 'boolean' ? (
        <Switch value={toggleValue} onValueChange={onToggle} />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} testID={testID}>
        {content}
      </Pressable>
    );
  }

  return <View testID={testID}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    ...elevation.card,
  },
  textWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 24,
    lineHeight: 24,
  },
});

