import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { colors, spacing } from '../../theme/tokens';
import { AppCard } from './AppCard';

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
  return (
    <Animatable.View animation="fadeInUp" duration={320} useNativeDriver>
      <AppCard onPress={onPress} testID={testID} style={styles.card} contentStyle={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {typeof toggleValue === 'boolean' ? (
          <Switch value={toggleValue} onValueChange={onToggle} />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </AppCard>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#9A9388',
    fontSize: 22,
    lineHeight: 22,
  },
});