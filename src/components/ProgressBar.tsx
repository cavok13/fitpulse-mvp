import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  label?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({ progress, color = Colors.primary, height = 8, label, showPercentage, style }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && <Text style={[styles.percentage, { color }]}>{Math.round(clampedProgress * 100)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View style={[styles.fill, { width: `${clampedProgress * 100}%`, backgroundColor: color, borderRadius: height / 2, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  label: { ...Typography.label, color: Colors.textSecondary },
  percentage: { ...Typography.label, color: Colors.primary },
  track: { backgroundColor: Colors.surfaceLight, overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
});
