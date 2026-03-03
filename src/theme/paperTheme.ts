import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { colors, radius } from './tokens';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.textPrimary,
    onPrimary: colors.surface,
    primaryContainer: colors.accentSoft,
    secondary: colors.accent,
    onSecondary: colors.textPrimary,
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: '#F7F4EE',
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.error,
    onError: colors.surface,
  },
};