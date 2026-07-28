import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import ProgressBar from '../../src/components/ProgressBar';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import { WorkoutPlan } from '../../src/types';
import { workoutPlans } from '../../src/data/mockData';

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const activeWorkout = useAppStore((s) => s.activeWorkout);
  const startWorkout = useAppStore((s) => s.startWorkout);
  const completeWorkout = useAppStore((s) => s.completeWorkout);
  const endWorkout = useAppStore((s) => s.endWorkout);
  const addXP = useAppStore((s) => s.addXP);
  const selectedPlan = useAppStore((s) => s.selectedPlan);
  const setSelectedPlan = useAppStore((s) => s.setSelectedPlan);
  const workoutHistory = useAppStore((s) => s.workoutHistory);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { key: 'all', label: 'All' },
    { key: 'strength', label: 'Strength' },
    { key: 'cardio', label: 'Cardio' },
    { key: 'flexibility', label: 'Flex' },
    { key: 'hiit', label: 'HIIT' },
  ];

  const filteredPlans = selectedCategory === 'all'
    ? workoutPlans
    : workoutPlans.filter(p => {
        if (selectedCategory === 'cardio') return p.goal === 'endurance';
        if (selectedCategory === 'flexibility') return p.goal === 'flexibility';
        if (selectedCategory === 'strength') return p.goal === 'muscle_gain' || p.goal === 'general_fitness';
        if (selectedCategory === 'hiit') return p.name.toLowerCase().includes('hiit') || p.name.toLowerCase().includes('power');
        return true;
      });

  const getTotalExercises = (plan: WorkoutPlan) => {
    return plan.sessions.reduce((acc, s) => acc + s.exercises.length, 0);
  };

  const getEstimatedDuration = (plan: WorkoutPlan) => {
    if (plan.sessions.length === 0) return 0;
    return Math.round(plan.sessions.reduce((acc, s) => acc + s.estimatedDuration, 0) / plan.sessions.length);
  };

  const handleStartPlan = useCallback((plan: WorkoutPlan) => {
    const firstSession = plan.sessions[0];
    setSelectedPlan(plan);
    startWorkout({
      planId: plan.id,
      session: firstSession,
      startedAt: new Date().toISOString(),
      elapsed: 0,
      caloriesBurned: 0,
    } as any);
    Alert.alert('Workout Started!', `Complete ${firstSession.name} to earn XP!`);
  }, [setSelectedPlan, startWorkout]);

  const handleCompleteWorkout = useCallback(() => {
    const minutes = Math.floor((Date.now() - new Date(activeWorkout?.startedAt || Date.now()).getTime()) / 60000) || 15;
    const calories = Math.floor(minutes * 8);
    completeWorkout(calories, Math.max(minutes, 10));
    addXP(Math.floor(minutes * 2));
    Alert.alert('Workout Complete!', `+${Math.floor(minutes * 2)} XP earned! 🔥`);
  }, [activeWorkout, completeWorkout, addXP]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return Colors.warning;
      case 'advanced': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  // Active Workout View
  if (activeWorkout) {
    const elapsed = Math.floor((Date.now() - new Date(activeWorkout.startedAt || Date.now()).getTime()) / 60000);
    const session = activeWorkout.session;
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingHorizontal: Spacing.lg }]}>
        <Card variant="gradient" style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <Ionicons name="fitness" size={32} color={Colors.primary} />
            <Text style={styles.activeTitle}>{session?.name || 'Workout'}</Text>
          </View>
          <Text style={styles.activeElapsed}>{Math.max(elapsed, 1)} min</Text>
          <Text style={styles.activeSub}>{session?.exercises?.length || 0} exercises</Text>

          <View style={styles.exerciseList}>
            {session?.exercises?.map((ex: any, i: number) => (
              <View key={i} style={styles.exerciseItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textMuted} />
                <Text style={styles.exerciseName}>{ex.exercise?.name || 'Exercise'}</Text>
                <Text style={styles.exerciseDetail}>{ex.sets}x{ex.reps}</Text>
              </View>
            ))}
          </View>

          <Button title="Complete Workout" variant="primary" onPress={handleCompleteWorkout} style={styles.completeBtn} />
          <Button title="End Workout" variant="ghost" onPress={() => { endWorkout(); Alert.alert('Workout Ended'); }} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>
            {workoutHistory.length === 0
              ? 'Choose a plan to get started'
              : `${workoutHistory.length} workouts completed`
            }
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.key} style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]} onPress={() => setSelectedCategory(cat.key)}>
            <Text style={[styles.catText, selectedCategory === cat.key && styles.catTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Workout */}
      {workoutHistory.length > 0 && (
        <Card style={styles.recentCard}>
          <Text style={styles.recentTitle}>Last Workout</Text>
          <View style={styles.recentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentName}>{workoutHistory[0].name}</Text>
              <Text style={styles.recentSub}>{workoutHistory[0].date} • {workoutHistory[0].duration}min • {workoutHistory[0].calories}cal</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          </View>
        </Card>
      )}

      {/* Plans */}
      <Text style={styles.sectionTitle}>Workout Plans</Text>
      {filteredPlans.map((plan) => {
        const totalExercises = getTotalExercises(plan);
        const avgDuration = getEstimatedDuration(plan);
        return (
          <Card key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={[styles.planIcon, { backgroundColor: getDifficultyColor(plan.difficulty) + '20' }]}>
                <Ionicons name={plan.goal === 'endurance' ? 'heart' : plan.goal === 'flexibility' ? 'body' : 'barbell'} size={20} color={getDifficultyColor(plan.difficulty)} />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planMeta}>{totalExercises} exercises • ~{avgDuration}min/session • {plan.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>

            {/* Progress */}
            <View style={styles.planProgress}>
              <ProgressBar progress={0} color={Colors.primary} height={4} />
              <Text style={styles.planProgressText}>0/{totalExercises} exercises</Text>
            </View>

            <View style={styles.planActions}>
              <Button title="Start Workout" variant="primary" size="sm" onPress={() => handleStartPlan(plan)} />
              <Button title="View" variant="ghost" size="sm" onPress={() => Alert.alert(plan.name, plan.description)} />
            </View>
          </Card>
        );
      })}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  title: { ...Typography.displaySmall, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  categories: { marginBottom: Spacing.lg },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceLight, marginRight: Spacing.sm },
  catChipActive: { backgroundColor: Colors.primary },
  catText: { ...Typography.label, color: Colors.textMuted },
  catTextActive: { color: Colors.textInverse },
  recentCard: { marginBottom: Spacing.lg },
  recentTitle: { ...Typography.labelSmall, color: Colors.textMuted, marginBottom: 8 },
  recentRow: { flexDirection: 'row', alignItems: 'center' },
  recentName: { ...Typography.labelLarge, color: Colors.text },
  recentSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  planCard: { marginBottom: Spacing.md },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  planIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  planInfo: { flex: 1 },
  planName: { ...Typography.labelLarge, color: Colors.text },
  planMeta: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  planDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  planProgress: { marginBottom: Spacing.md },
  planProgressText: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 4 },
  planActions: { flexDirection: 'row', gap: Spacing.sm },
  activeCard: { flex: 1 },
  activeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  activeTitle: { ...Typography.h2, color: Colors.text },
  activeElapsed: { ...Typography.displayMedium, color: Colors.primary, textAlign: 'center' },
  activeSub: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  exerciseList: { marginBottom: Spacing.lg, flex: 1 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  exerciseName: { ...Typography.body, color: Colors.text, flex: 1 },
  exerciseDetail: { ...Typography.labelSmall, color: Colors.textMuted },
  completeBtn: { marginBottom: Spacing.sm },
});
