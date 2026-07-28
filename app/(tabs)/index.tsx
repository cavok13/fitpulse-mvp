import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import Card from '../../src/components/Card';
import StatCard from '../../src/components/StatCard';
import QuestCard from '../../src/components/QuestCard';
import ProgressBar from '../../src/components/ProgressBar';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const dailyQuests = useAppStore((s) => s.dailyQuests);
  const workoutHistory = useAppStore((s) => s.workoutHistory);
  const addXP = useAppStore((s) => s.addXP);
  const completeQuest = useAppStore((s) => s.completeQuest);

  const xpForNextLevel = user.level * 500;
  const xpProgress = (user.xp % xpForNextLevel) / xpForNextLevel;

  // Calculate which days have workouts from history
  const today = new Date().getDay();
  const adjustedDay = today === 0 ? 6 : today - 1;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello, {user.name} 👋</Text>
          <Text style={styles.subtitle}>
            {user.stats.totalWorkouts === 0
              ? "Ready to start your fitness journey?"
              : user.streak > 0
                ? `${user.streak} day streak — keep going!`
                : "Let's get back to training!"
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.streakBadge} onPress={() => Alert.alert('Streak', `You're on a ${user.streak}-day streak!`)}>
          <Ionicons name="flame" size={20} color={Colors.accent} />
          <Text style={styles.streakText}>{user.streak}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Workouts" value={user.stats.totalWorkouts} icon="fitness" color={Colors.primary} />
        <StatCard label="Minutes" value={user.stats.totalMinutes.toLocaleString()} icon="time" color={Colors.success} />
        <StatCard label="Calories" value={user.stats.totalCalories > 999 ? `${(user.stats.totalCalories / 1000).toFixed(1)}k` : user.stats.totalCalories} icon="flame" color={Colors.accent} />
        <StatCard label="Records" value={user.stats.personalRecords} icon="trophy" color={Colors.warning} />
      </View>

      {/* Level Progress */}
      <Card variant="gradient" style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{user.level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {user.level}</Text>
            <Text style={styles.levelSub}>{user.xp} / {xpForNextLevel} XP to Level {user.level + 1}</Text>
          </View>
        </View>
        <ProgressBar progress={xpProgress} color={Colors.xpGold} height={6} />
        <TouchableOpacity style={styles.xpButton} onPress={() => { addXP(50); Alert.alert('XP Earned!', '+50 XP for checking in!'); }}>
          <Ionicons name="star" size={16} color={Colors.xpGold} />
          <Text style={styles.xpButtonText}>+50 XP Daily Check-in</Text>
        </TouchableOpacity>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Start Workout', 'Go to Workouts tab to start a session!')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="play" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.quickLabel}>Start{'\n'}Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Log Food', 'Go to Nutrition tab to log a meal!')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.success + '20' }]}>
            <Ionicons name="restaurant" size={24} color={Colors.success} />
          </View>
          <Text style={styles.quickLabel}>Log{'\n'}Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Progress', 'Go to Progress tab to track your gains!')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.accent + '20' }]}>
            <Ionicons name="trending-up" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.quickLabel}>View{'\n'}Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Activity */}
      <Card style={styles.weeklyCard}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.daysRow}>
          {DAYS.map((day, i) => {
            const hasWorkout = i <= adjustedDay && workoutHistory.length > 0;
            return (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayDot, i === adjustedDay && styles.dayDotToday, hasWorkout && i < adjustedDay && styles.dayDotActive]}>
                  {hasWorkout && i < adjustedDay && <Ionicons name="checkmark" size={12} color="#fff" />}
                  {i === adjustedDay && <View style={styles.todayDot} />}
                </View>
                <Text style={[styles.dayLabel, i === adjustedDay && styles.dayLabelToday]}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Daily Quests */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        <Text style={styles.questCount}>{dailyQuests.filter(q => q.completed).length}/{dailyQuests.length}</Text>
      </View>
      {dailyQuests.map((quest) => (
        <TouchableOpacity key={quest.id} onPress={() => {
          if (!quest.completed) {
            completeQuest(quest.id);
            addXP(quest.xpReward);
            Alert.alert('Quest Complete!', `+${quest.xpReward} XP earned!`);
          }
        }}>
          <QuestCard {...quest} />
        </TouchableOpacity>
      ))}

      {/* Motivational */}
      {user.stats.totalWorkouts === 0 && (
        <Card variant="gradient" style={styles.motivationCard}>
          <Ionicons name="rocket" size={32} color={Colors.primary} />
          <Text style={styles.motivationTitle}>Your Journey Starts Here</Text>
          <Text style={styles.motivationText}>Complete your first workout to start earning XP, building streaks, and unlocking achievements!</Text>
        </Card>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  greeting: { ...Typography.displaySmall, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, gap: 4 },
  streakText: { ...Typography.labelLarge, color: Colors.accent },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  levelCard: { marginBottom: Spacing.lg },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  levelBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.xpGold, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  levelNumber: { ...Typography.statSmall, color: Colors.textInverse },
  levelInfo: { flex: 1 },
  levelTitle: { ...Typography.h3, color: Colors.text },
  levelSub: { ...Typography.bodySmall, color: Colors.textSecondary },
  xpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.xpGold + '15', borderRadius: BorderRadius.md, gap: Spacing.xs },
  xpButtonText: { ...Typography.label, color: Colors.xpGold },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.xl },
  quickAction: { alignItems: 'center', gap: Spacing.sm },
  quickIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { ...Typography.labelSmall, color: Colors.textSecondary, textAlign: 'center' },
  weeklyCard: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  dayDotActive: { backgroundColor: Colors.primary },
  dayDotToday: { backgroundColor: Colors.surfaceElevated, borderWidth: 2, borderColor: Colors.primary },
  todayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  dayLabel: { ...Typography.labelSmall, color: Colors.textMuted },
  dayLabelToday: { color: Colors.primary, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.sm },
  questCount: { ...Typography.bodySmall, color: Colors.textMuted },
  motivationCard: { alignItems: 'center', paddingVertical: Spacing.xxl, marginTop: Spacing.md },
  motivationTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.sm },
  motivationText: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
