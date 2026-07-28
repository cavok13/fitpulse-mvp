import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'gradient';
}

export default function Card({ children, style, onPress, variant = 'default' }: CardProps) {
  if (variant === 'gradient') {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <LinearGradient colors={Colors.gradients.card} style={[styles.card, style]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {children}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={[styles.card, variant === 'elevated' && styles.elevated, style]}>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  elevated: {
    ...Shadows.md,
    backgroundColor: Colors.surfaceElevated,
  },
});
