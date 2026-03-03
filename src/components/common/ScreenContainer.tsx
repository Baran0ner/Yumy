import React from 'react';
import { SafeAreaView, StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors, spacing } from '../../theme/tokens';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
};

export const ScreenContainer = ({ children, style, testID }: ScreenContainerProps) => {
  return (
    <SafeAreaView style={styles.safeArea} testID={testID}>
      <LinearGradient
        colors={['#FCFBF8', '#F8F5EE', '#F7F4EC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <Animatable.View
          animation="fadeInUp"
          duration={280}
          easing="ease-out-cubic"
          useNativeDriver
          style={[styles.content, style]}>
          {children}
        </Animatable.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
