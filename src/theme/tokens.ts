export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  textPrimary: '#1F1F1F',
  textSecondary: '#666666',
  border: '#E8E3DA',
  shadow: '#000000',
  accent: '#FF7A00',
  accentSoft: '#FFF2E6',
  success: '#2E7D32',
  warning: '#B65E00',
  error: '#B3261E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 24,
  round: 999,
};

export const elevation = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
};

