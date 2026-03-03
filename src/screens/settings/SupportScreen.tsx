import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

export const SupportScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer testID="screen-support" style={styles.container}>
      <Text style={styles.title}>Support</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Need help?</Text>
        <Text style={styles.text}>Reach out and include your app version and device model.</Text>
        <Pressable
          style={styles.button}
          onPress={() => Linking.openURL('mailto:support@example.com')}
          testID="support-email-button">
          <Text style={styles.buttonLabel}>Email support@example.com</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  button: {
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: colors.surface,
    fontWeight: '700',
  },
});

