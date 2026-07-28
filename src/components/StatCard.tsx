import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import Card from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatCard({ label, value, icon, color = Colors.primary, trend, trendValue }: StatCardProps) {
  return (
    <Card variant="default" style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && trendValue && (
        <View style={styles.trendRow}>
          <Ionicons
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove'}
            size={12}
            color={trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.textMuted}
          />
          <Text style={[styles.trendText, { color: trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.textMuted }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.sm, minWidth: 80 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  value: { ...Typography.stat, color: Colors.text, marginBottom: 2 },
  label: { ...Typography.labelSmall, color: Colors.textMuted, textAlign: 'center' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: 4 },
  trendText: { ...Typography.labelSmall },
});
