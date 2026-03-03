import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { colors, radius, spacing } from '../../theme/tokens';

const links = [
  { id: 'privacy', label: 'Privacy Policy', url: 'https://example.com/privacy' },
  { id: 'terms', label: 'Terms of Service', url: 'https://example.com/terms' },
  { id: 'support', label: 'Support FAQ', url: 'https://example.com/support' },
];

export const PrivacyTermsScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer testID="screen-privacy-terms" style={styles.container}>
      <Text style={styles.title}>Privacy & Terms</Text>
      <View style={styles.list}>
        {links.map(item => (
          <Pressable
            key={item.id}
            style={styles.row}
            onPress={() => Linking.openURL(item.url)}
            testID={`privacy-link-${item.id}`}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 24,
  },
});

