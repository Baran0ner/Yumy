import React, { forwardRef } from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { TextInput, useTheme, type TextInputProps } from 'react-native-paper';
import { radius } from '../../theme/tokens';

type AppInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<TextStyle>;
};

export const AppInput = forwardRef<any, AppInputProps>(
  ({ containerStyle, contentStyle, style, mode = 'outlined', ...rest }, ref) => {
    const theme = useTheme();

    return (
      <TextInput
        ref={ref}
        mode={mode}
        style={[styles.container, containerStyle, style]}
        contentStyle={[styles.content, contentStyle]}
        outlineStyle={styles.outline}
        activeOutlineColor={theme.colors.primary}
        outlineColor={theme.colors.outline}
        textColor={theme.colors.onSurface}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        {...rest}
      />
    );
  },
);

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  content: {
    fontSize: 15,
  },
  outline: {
    borderRadius: radius.md,
  },
});
