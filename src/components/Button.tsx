import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, fullWidth, style }: ButtonProps) {
  const sizeStyles = { sm: styles.sm, md: styles.md, lg: styles.lg };
  const textSize = { sm: Typography.buttonSmall, md: Typography.button, lg: { ...Typography.button, fontSize: 18 } };

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[fullWidth && { width: '100%' }, style]}>
        <LinearGradient colors={disabled ? ['#555', '#444'] : Colors.gradients.primary} style={[styles.base, sizeStyles[size]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[styles.primaryText, textSize[size]]}>{title}</Text>}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.base, sizeStyles[size], styles.outline, fullWidth && { width: '100%' }, style]}>
        {loading ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={[styles.outlineText, textSize[size]]}>{title}</Text>}
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.base, sizeStyles[size], styles.ghost, fullWidth && { width: '100%' }, style]}>
        <Text style={[styles.ghostText, textSize[size]]}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.base, sizeStyles[size], styles.secondary, fullWidth && { width: '100%' }, style]}>
      {loading ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={[styles.secondaryText, textSize[size]]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
  primaryText: { color: '#fff', fontWeight: '600' },
  outline: { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'transparent' },
  outlineText: { color: Colors.primary, fontWeight: '600' },
  secondary: { backgroundColor: Colors.surfaceLight },
  secondaryText: { color: Colors.text, fontWeight: '600' },
  ghost: { backgroundColor: 'transparent' },
  ghostText: { color: Colors.primary, fontWeight: '600' },
});
