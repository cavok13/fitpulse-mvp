import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import Card from './Card';
import ProgressBar from './ProgressBar';

interface QuestCardProps {
  name: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
}

export default function QuestCard({ name, description, xpReward, completed, progress, target }: QuestCardProps) {
  return (
    <Card variant="default" style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, completed && styles.iconDone]}>
          <Ionicons name={completed ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={completed ? Colors.success : Colors.textMuted} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, completed && styles.nameDone]}>{name}</Text>
          <Text style={styles.desc}>{description}</Text>
          <ProgressBar progress={progress / target} color={completed ? Colors.success : Colors.primary} height={4} />
        </View>
        <View style={styles.xpBadge}>
          <Ionicons name="star" size={12} color={Colors.xpGold} />
          <Text style={styles.xpText}>+{xpReward}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: Spacing.md },
  iconDone: {},
  info: { flex: 1, marginRight: Spacing.sm },
  name: { ...Typography.labelLarge, color: Colors.text, marginBottom: 2 },
  nameDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  desc: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: Spacing.xs },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.xpGold + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm, gap: 4 },
  xpText: { ...Typography.labelSmall, color: Colors.xpGold },
});
