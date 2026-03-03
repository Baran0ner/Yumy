import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Surface, TouchableRipple, useTheme } from 'react-native-paper';
import { radius, spacing } from '../../theme/tokens';

type AppCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export const AppCard = ({ children, onPress, style, contentStyle, testID }: AppCardProps) => {
  const theme = useTheme();

  return (
    <Surface
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
        style,
      ]}
      elevation={1}
      testID={onPress ? undefined : testID}>
      {onPress ? (
        <TouchableRipple onPress={onPress} style={styles.ripple} borderless={false} testID={testID}>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </TouchableRipple>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ripple: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
});
