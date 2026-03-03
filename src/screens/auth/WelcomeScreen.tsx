import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: Props): React.JSX.Element => {
  return (
    <ScreenContainer testID="screen-welcome" style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Track calories like writing in Notes.</Text>
        <Text style={styles.subtitle}>Type what you ate. Amy estimates calories and macros.</Text>
      </View>

      <View style={styles.bulletWrap}>
        <Text style={styles.bullet}>• Type meals naturally</Text>
        <Text style={styles.bullet}>• AI searches nutrition sources</Text>
        <Text style={styles.bullet}>• Daily totals update automatically</Text>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('SignIn')}
        testID="welcome-continue-button">
        <Text style={styles.primaryButtonLabel}>Continue</Text>
      </Pressable>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  headerWrap: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.title,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  subtitle: {
    ...typography.subtitle,
    lineHeight: 22,
  },
  bulletWrap: {
    gap: spacing.md,
  },
  bullet: {
    ...typography.body,
    color: colors.textSecondary,
  },
  primaryButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: spacing.md,
  },
  primaryButtonLabel: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});

