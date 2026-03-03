import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, typography } from '../../theme/tokens';

export const SplashScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer testID="screen-splash" style={styles.container}>
      <View style={styles.centered}>
        <Text style={styles.logo}>Amy Journal</Text>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    ...typography.title,
    fontSize: 34,
    letterSpacing: -0.8,
  },
});

