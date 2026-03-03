import React from 'react';
import { SafeAreaView, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
};

export const ScreenContainer = ({ children, style, testID }: ScreenContainerProps) => {
  return (
    <SafeAreaView style={styles.safeArea} testID={testID}>
      <View style={[styles.content, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});

