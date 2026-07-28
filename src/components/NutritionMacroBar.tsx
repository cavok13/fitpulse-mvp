import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface NutritionMacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export default function NutritionMacroBar({ protein, carbs, fat, proteinTarget, carbsTarget, fatTarget }: NutritionMacroBarProps) {
  const total = protein + carbs + fat;
  const macros = [
    { label: 'Protein', value: protein, target: proteinTarget, color: Colors.primary },
    { label: 'Carbs', value: carbs, target: carbsTarget, color: Colors.accent },
    { label: 'Fat', value: fat, target: fatTarget, color: Colors.warning },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {macros.map((m, i) => {
          const pct = total > 0 ? (m.value / total) * 100 : 0;
          return <View key={i} style={[styles.segment, { width: `${pct}%`, backgroundColor: m.color }]} />;
        })}
      </View>
      <View style={styles.labels}>
        {macros.map((m, i) => (
          <View key={i} style={styles.labelItem}>
            <View style={[styles.dot, { backgroundColor: m.color }]} />
            <Text style={styles.labelText}>{m.label}</Text>
            <Text style={styles.valueText}>{m.value}g / {m.target}g</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.sm },
  barContainer: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: Colors.surfaceLight, marginBottom: Spacing.md },
  segment: { height: '100%' },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  labelItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  labelText: { ...Typography.labelSmall, color: Colors.textSecondary },
  valueText: { ...Typography.labelSmall, color: Colors.textMuted },
});
