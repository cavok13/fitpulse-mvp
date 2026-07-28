import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';

interface BadgeProps {
  name: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const rarityColors = {
  bronze: ['#CD7F32', '#A0522D'],
  silver: ['#C0C0C0', '#808080'],
  gold: ['#FFD700', '#DAA520'],
  platinum: ['#E5E4E2', '#A8A8A8'],
  diamond: ['#B9F2FF', '#40E0D0'],
};

const raritySize = { sm: 48, md: 64, lg: 80 };

export default function Badge({ name, icon, rarity, unlocked, size = 'md' }: BadgeProps) {
  const dim = raritySize[size];
  const [light, dark] = rarityColors[rarity];

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: unlocked ? light + '30' : Colors.surfaceLight, borderColor: unlocked ? light : Colors.border, borderWidth: 2, opacity: unlocked ? 1 : 0.4 }]}>
        <Ionicons name={icon as any} size={dim * 0.45} color={unlocked ? light : Colors.textMuted} />
      </View>
      <Text style={[styles.name, { color: unlocked ? Colors.text : Colors.textMuted }]} numberOfLines={1}>{name}</Text>
      {size !== 'sm' && <Text style={[styles.rarity, { color: unlocked ? light : Colors.textMuted }]}>{rarity.toUpperCase()}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginRight: Spacing.md },
  badge: { alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  name: { ...Typography.labelSmall, textAlign: 'center', maxWidth: 70 },
  rarity: { ...Typography.labelSmall, fontSize: 8, marginTop: 2 },
});
