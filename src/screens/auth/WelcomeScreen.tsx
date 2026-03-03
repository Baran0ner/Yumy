import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { colors, spacing, typography } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <ScreenContainer testID="screen-welcome" style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      </View>

      <View style={styles.bulletWrap}>
        <Text style={styles.bullet}>{`• ${t('welcome.bullet1')}`}</Text>
        <Text style={styles.bullet}>{`• ${t('welcome.bullet2')}`}</Text>
        <Text style={styles.bullet}>{`• ${t('welcome.bullet3')}`}</Text>
      </View>

      <AppButton onPress={() => navigation.navigate('SignIn')} testID="welcome-continue-button">
        {t('common.continue')}
      </AppButton>
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
});