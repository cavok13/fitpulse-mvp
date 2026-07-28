import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import Button from '../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../src/theme';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const setUser = useAppStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);

  const goals = [
    { key: 'lose', label: 'Lose Weight', icon: 'flame' },
    { key: 'gain', label: 'Build Muscle', icon: 'barbell' },
    { key: 'endurance', label: 'Improve Endurance', icon: 'heart' },
    { key: 'flexibility', label: 'Increase Flexibility', icon: 'body' },
    { key: 'health', label: 'General Health', icon: 'medical' },
  ];

  const levels = [
    { key: 'beginner', label: 'Beginner', desc: 'New to fitness' },
    { key: 'intermediate', label: 'Intermediate', desc: '6+ months experience' },
    { key: 'advanced', label: 'Advanced', desc: '2+ years experience' },
  ];

  const handleComplete = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue');
      return;
    }
    if (!goal) {
      Alert.alert('Goal Required', 'Please select your fitness goal');
      return;
    }
    if (!experience) {
      Alert.alert('Experience Required', 'Please select your experience level');
      return;
    }

    setUser({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: '',
      avatar: undefined,
      bio: '',
      level: 1,
      xp: 0,
      streak: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      goals: [goal],
      experience,
      stats: {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalCalories: 0,
        personalRecords: 0,
        friendsCount: 0,
        badgesCount: 0,
      },
    });
  };

  const canProceed = name.trim() && goal && experience;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="flash" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>FitPulse</Text>
          <Text style={styles.tagline}>Your personalized fitness journey</Text>
        </View>

        {/* Step 1: Name */}
        <View style={styles.section}>
          <Text style={styles.stepLabel}>What's your name?</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
          />
        </View>

        {/* Step 2: Goal */}
        <View style={styles.section}>
          <Text style={styles.stepLabel}>What's your main goal?</Text>
          <View style={styles.optionGrid}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[styles.optionCard, goal === g.key && styles.optionActive]}
                onPress={() => setGoal(g.key)}
              >
                <Ionicons name={g.icon as any} size={24} color={goal === g.key ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.optionText, goal === g.key && styles.optionTextActive]}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 3: Experience */}
        <View style={styles.section}>
          <Text style={styles.stepLabel}>Your experience level?</Text>
          <View style={styles.levelRow}>
            {levels.map((l) => (
              <TouchableOpacity
                key={l.key}
                style={[styles.levelCard, experience === l.key && styles.levelActive]}
                onPress={() => setExperience(l.key)}
              >
                <Text style={[styles.levelLabel, experience === l.key && styles.levelTextActive]}>{l.label}</Text>
                <Text style={[styles.levelDesc, experience === l.key && styles.levelDescActive]}>{l.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <Button
          title="Start My Journey"
          variant="primary"
          onPress={handleComplete}
          disabled={!canProceed}
          style={styles.ctaBtn}
        />
        <Text style={styles.disclaimer}>You can update your profile anytime in settings</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: Spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logo: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  appName: { ...Typography.displayMedium, color: Colors.text },
  tagline: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { marginBottom: Spacing.xl },
  stepLabel: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  nameInput: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.lg, ...Typography.bodyLarge, color: Colors.text },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionCard: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md },
  optionActive: { backgroundColor: Colors.primary + '20', borderWidth: 1, borderColor: Colors.primary },
  optionText: { ...Typography.label, color: Colors.textMuted },
  optionTextActive: { color: Colors.primary },
  levelRow: { flexDirection: 'row', gap: Spacing.sm },
  levelCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  levelActive: { backgroundColor: Colors.primary, borderWidth: 1, borderColor: Colors.primary },
  levelLabel: { ...Typography.label, color: Colors.textMuted },
  levelDesc: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  levelTextActive: { color: Colors.textInverse },
  levelDescActive: { color: Colors.textInverse + 'CC' },
  ctaBtn: { marginTop: Spacing.lg },
  disclaimer: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
});
