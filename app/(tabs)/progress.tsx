import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import Card from '../../src/components/Card';
import ProgressBar from '../../src/components/ProgressBar';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const achievements = useAppStore((s) => s.achievements);
  const workoutHistory = useAppStore((s) => s.workoutHistory);

  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'history'>('stats');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = user.xp;
  const avgWorkout = user.stats.totalWorkouts > 0
    ? Math.round(user.stats.totalMinutes / user.stats.totalWorkouts)
    : 0;

  // Weekly stats from history
  const weeklyWorkouts = workoutHistory.filter((w) => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return new Date(w.date) >= d;
  }).length;

  const stats = [
    { label: 'Total Workouts', value: user.stats.totalWorkouts, icon: 'fitness', color: Colors.primary },
    { label: 'Total Minutes', value: user.stats.totalMinutes.toLocaleString(), icon: 'time', color: Colors.success },
    { label: 'Total Calories', value: user.stats.totalCalories > 999 ? `${(user.stats.totalCalories / 1000).toFixed(1)}k` : user.stats.totalCalories, icon: 'flame', color: Colors.accent },
    { label: 'Avg Workout', value: `${avgWorkout}min`, icon: 'trending-up', color: Colors.info },
    { label: 'Current Streak', value: `${user.streak} days`, icon: 'flame', color: Colors.warning },
    { label: 'Level', value: user.level, icon: 'star', color: Colors.xpGold },
    { label: 'Total XP', value: totalXP.toLocaleString(), icon: 'flash', color: Colors.xpGold },
    { label: 'Personal Records', value: user.stats.personalRecords, icon: 'trophy', color: Colors.warning },
    { label: 'Badges Earned', value: unlockedCount, icon: 'ribbon', color: Colors.primary },
    { label: 'Weekly Workouts', value: weeklyWorkouts, icon: 'calendar', color: Colors.success },
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>
          {user.stats.totalWorkouts === 0
            ? 'Start working out to see your stats!'
            : `${user.stats.totalWorkouts} workouts • Level ${user.level}`
          }
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['stats', 'achievements', 'history'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <>
          <View style={styles.statsGrid}>
            {stats.map((stat, i) => (
              <Card key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>

          {/* Motivational */}
          {user.stats.totalWorkouts === 0 && (
            <Card variant="gradient" style={styles.motivationCard}>
              <Ionicons name="trophy" size={48} color={Colors.xpGold} />
              <Text style={styles.motivationTitle}>Your Stats Will Appear Here</Text>
              <Text style={styles.motivationText}>Complete workouts, log meals, and stay active to see your progress!</Text>
            </Card>
          )}
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <>
          <Card style={styles.achievementSummary}>
            <Text style={styles.achievementTitle}>{unlockedCount}/{achievements.length} Unlocked</Text>
            <ProgressBar progress={achievements.length > 0 ? unlockedCount / achievements.length : 0} color={Colors.xpGold} height={6} />
          </Card>

          {achievements.map((achievement) => (
            <Card key={achievement.id} style={styles.achieveCard}>
              <View style={[styles.achieveRow, !achievement.unlocked && { opacity: 0.6 }]}>
                <View style={[styles.achieveIcon, achievement.unlocked && styles.achieveIconUnlocked]}>
                  <Ionicons name={achievement.icon as any} size={24} color={achievement.unlocked ? Colors.xpGold : Colors.textMuted} />
                </View>
                <View style={styles.achieveInfo}>
                  <Text style={[styles.achieveName, !achievement.unlocked && styles.achieveNameLocked]}>{achievement.name}</Text>
                  <Text style={styles.achieveDesc}>{achievement.description}</Text>
                  <View style={styles.achieveMeta}>
                    <Text style={styles.achieveXP}>+{achievement.xpReward} XP</Text>
                    <Text style={[styles.achieveRarity, { color: getRarityColor(achievement.rarity) }]}>{achievement.rarity}</Text>
                  </View>
                </View>
                {achievement.unlocked ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                ) : (
                  <Text style={styles.achieveProgress}>{achievement.progress}/{achievement.target}</Text>
                )}
              </View>
            </Card>
          ))}
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {workoutHistory.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Workout History</Text>
              <Text style={styles.emptyText}>Complete your first workout to start building your history!</Text>
            </Card>
          ) : (
            workoutHistory.map((workout) => (
              <Card key={workout.id} style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyName}>{workout.name}</Text>
                    <Text style={styles.historySub}>{workout.date} • {workout.duration}min • {workout.calories}cal • {workout.exercises} exercises</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'bronze': return '#CD7F32';
    case 'silver': return Colors.textSecondary;
    case 'gold': return Colors.xpGold;
    case 'platinum': return Colors.info;
    case 'diamond': return Colors.primary;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  title: { ...Typography.displaySmall, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: 3, marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.label, color: Colors.textMuted },
  tabTextActive: { color: Colors.textInverse },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: { width: '48%', marginBottom: Spacing.sm },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { ...Typography.h2, color: Colors.text },
  statLabel: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 4 },
  motivationCard: { alignItems: 'center', paddingVertical: Spacing.xxl, marginTop: Spacing.md },
  motivationTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.sm },
  motivationText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  achievementSummary: { marginBottom: Spacing.lg },
  achievementTitle: { ...Typography.labelLarge, color: Colors.text, marginBottom: Spacing.sm },
  achieveCard: { marginBottom: Spacing.sm },
  achieveLocked: { opacity: 0.6 },
  achieveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  achieveIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  achieveIconUnlocked: { backgroundColor: Colors.xpGold + '20' },
  achieveInfo: { flex: 1 },
  achieveName: { ...Typography.labelLarge, color: Colors.text },
  achieveNameLocked: { color: Colors.textMuted },
  achieveDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  achieveMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  achieveXP: { ...Typography.labelSmall, color: Colors.xpGold },
  achieveRarity: { ...Typography.labelSmall, textTransform: 'capitalize' },
  achieveProgress: { ...Typography.labelSmall, color: Colors.textMuted },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.md },
  emptyText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  historyCard: { marginBottom: Spacing.sm },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  historyIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success + '20', alignItems: 'center', justifyContent: 'center' },
  historyName: { ...Typography.labelLarge, color: Colors.text },
  historySub: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
});
