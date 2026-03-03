import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Button, useTheme, type ButtonProps } from 'react-native-paper';
import { radius } from '../../theme/tokens';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
type AppButtonSize = 'lg' | 'md' | 'sm';

type AppButtonProps = Omit<ButtonProps, 'mode' | 'children'> & {
  children: React.ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

const sizeMap: Record<AppButtonSize, { height: number; fontSize: number }> = {
  lg: { height: 52, fontSize: 16 },
  md: { height: 48, fontSize: 15 },
  sm: { height: 40, fontSize: 13 },
};

export const AppButton = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
  contentStyle,
  labelStyle,
  ...rest
}: AppButtonProps) => {
  const theme = useTheme();
  const sizeConfig = sizeMap[size];

  const mode: ButtonProps['mode'] =
    variant === 'text' ? 'text' : variant === 'outline' ? 'outlined' : 'contained';

  const buttonColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.error
        : undefined;

  const textColor =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'danger'
        ? theme.colors.onError
        : variant === 'text'
          ? theme.colors.onSurfaceVariant
          : theme.colors.onSurface;

  return (
    <Button
      mode={mode}
      buttonColor={buttonColor}
      textColor={textColor}
      contentStyle={[styles.content, { height: sizeConfig.height }, contentStyle]}
      labelStyle={[styles.label, { fontSize: sizeConfig.fontSize }, labelStyle]}
      style={[styles.button, variant === 'outline' && styles.outlined, style]}
      uppercase={false}
      {...rest}>
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
  },
  outlined: {
    borderWidth: 1,
  },
  content: {
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});