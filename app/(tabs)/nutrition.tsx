import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore';
import { analyzeMealFromText, MealAnalysis } from '../../src/services/aiService';
import Card from '../../src/components/Card';
import NutritionMacroBar from '../../src/components/NutritionMacroBar';
import ProgressBar from '../../src/components/ProgressBar';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const user = useAppStore((s) => s.user);
  const dailyNutrition = useAppStore((s) => s.dailyNutrition);
  const addMeal = useAppStore((s) => s.addMeal);
  const removeMeal = useAppStore((s) => s.removeMeal);
  const addWater = useAppStore((s) => s.addWater);
  const addXP = useAppStore((s) => s.addXP);
  const { tier, canUseFeature, trackAiMealUse } = useSubscriptionStore();

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');

  // AI Analysis state
  const [aiMode, setAiMode] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<MealAnalysis | null>(null);

  const { totals, targets, entries, water } = dailyNutrition;

  const handleAiAnalyze = async () => {
    if (!aiDescription.trim()) {
      Alert.alert('Enter Meal', 'Describe what you ate');
      return;
    }

    if (!canUseFeature('aiMealsPerDay')) {
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve used all your AI meal analyses for today. Upgrade to Pro for unlimited!',
        [
          { text: 'Upgrade', onPress: () => {} },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    setAiLoading(true);
    try {
      const result = await analyzeMealFromText(aiDescription);
      setAiResult(result);
      trackAiMealUse();
    } catch (error) {
      Alert.alert('Error', 'Could not analyze meal. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAiMeal = () => {
    if (!aiResult) return;
    addMeal({
      type: mealType,
      name: aiResult.name,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
    });
    addXP(15);
    setAiResult(null);
    setAiDescription('');
    setAiMode(false);
    Alert.alert('Meal Logged!', '+15 XP for using AI analysis');
  };

  const handleAddMeal = () => {
    if (!mealName.trim() || !mealCalories) {
      Alert.alert('Error', 'Please enter meal name and calories');
      return;
    }
    addMeal({
      type: mealType,
      name: mealName,
      calories: parseInt(mealCalories) || 0,
      protein: parseInt(mealProtein) || 0,
      carbs: parseInt(mealCarbs) || 0,
      fat: parseInt(mealFat) || 0,
    });
    addXP(10);
    setMealName('');
    setMealCalories('');
    setMealProtein('');
    setMealCarbs('');
    setMealFat('');
    setShowAddMeal(false);
    Alert.alert('Meal Logged!', '+10 XP');
  };

  const quickMeals = [
    { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, emoji: '🍌' },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, emoji: '🍗' },
    { name: 'Rice (1 cup)', calories: 206, protein: 4, carbs: 45, fat: 0, emoji: '🍚' },
    { name: 'Egg', calories: 78, protein: 6, carbs: 1, fat: 5, emoji: '🥚' },
    { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 1, emoji: '🥛' },
    { name: 'Protein Shake', calories: 120, protein: 25, carbs: 3, fat: 1, emoji: '🥤' },
  ];

  const waterPercentage = Math.min((water / targets.water) * 100, 100);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>
            {totals.calories === 0
              ? 'Log your first meal to start tracking'
              : `${Math.round(totals.calories)} of ${targets.calories} cal`
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setAiMode(false); setShowAddMeal(!showAddMeal); }}>
          <Ionicons name={showAddMeal ? 'close' : 'add'} size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* AI Quick Log */}
      <Card variant="gradient" style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={24} color={Colors.primary} />
          <Text style={styles.aiTitle}>AI Meal Scanner</Text>
          {tier === 'free' && (
            <View style={styles.freeTag}>
              <Text style={styles.freeTagText}>3/day free</Text>
            </View>
          )}
        </View>
        <Text style={styles.aiDesc}>Describe your meal and AI will estimate nutrition</Text>

        <View style={styles.aiInput}>
          <TextInput
            style={styles.aiTextInput}
            placeholder='e.g., "grilled chicken with rice and broccoli"'
            placeholderTextColor={Colors.textMuted}
            value={aiDescription}
            onChangeText={setAiDescription}
            multiline
          />
          <Button
            title={aiLoading ? 'Analyzing...' : 'Analyze'}
            variant="primary"
            size="sm"
            onPress={handleAiAnalyze}
            disabled={aiLoading || !aiDescription.trim()}
          />
        </View>

        {aiResult && (
          <View style={styles.aiResult}>
            <View style={styles.aiResultHeader}>
              <Text style={styles.aiResultName}>{aiResult.name}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{Math.round(aiResult.confidence * 100)}% sure</Text>
              </View>
            </View>
            <View style={styles.aiMacros}>
              <View style={styles.aiMacro}>
                <Text style={styles.aiMacroValue}>{aiResult.calories}</Text>
                <Text style={styles.aiMacroLabel}>cal</Text>
              </View>
              <View style={styles.aiMacro}>
                <Text style={[styles.aiMacroValue, { color: Colors.error }]}>{aiResult.protein}g</Text>
                <Text style={styles.aiMacroLabel}>protein</Text>
              </View>
              <View style={styles.aiMacro}>
                <Text style={[styles.aiMacroValue, { color: Colors.warning }]}>{aiResult.carbs}g</Text>
                <Text style={styles.aiMacroLabel}>carbs</Text>
              </View>
              <View style={styles.aiMacro}>
                <Text style={[styles.aiMacroValue, { color: Colors.info }]}>{aiResult.fat}g</Text>
                <Text style={styles.aiMacroLabel}>fat</Text>
              </View>
            </View>
            {aiResult.suggestions.length > 0 && (
              <Text style={styles.aiSuggestion}>{aiResult.suggestions[0]}</Text>
            )}
            <View style={styles.aiActions}>
              <Button title="Accept & Log" variant="primary" size="sm" onPress={handleAcceptAiMeal} />
              <Button title="Edit" variant="ghost" size="sm" onPress={() => {
                setMealCalories(String(aiResult.calories));
                setMealProtein(String(aiResult.protein));
                setMealCarbs(String(aiResult.carbs));
                setMealFat(String(aiResult.fat));
                setMealName(aiResult.name);
                setAiResult(null);
                setAiMode(false);
                setShowAddMeal(true);
              }} />
            </View>
          </View>
        )}
      </Card>

      {/* Calorie Overview */}
      <Card variant="gradient" style={styles.calorieCard}>
        <Text style={styles.calorieLabel}>Today's Calories</Text>
        <Text style={styles.calorieValue}>{Math.round(totals.calories)}</Text>
        <Text style={styles.calorieTarget}>of {targets.calories} target</Text>
        <ProgressBar progress={Math.min(totals.calories / targets.calories, 1)} color={Colors.accent} height={8} style={styles.calorieProgress} />
      </Card>

      {/* Macros */}
      <Card style={styles.macroCard}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <NutritionMacroBar
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          proteinTarget={targets.protein}
          carbsTarget={targets.carbs}
          fatTarget={targets.fat}
        />
      </Card>

      {/* Water Tracking */}
      <Card style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <Text style={styles.sectionTitle}>Water</Text>
          <Text style={styles.waterCount}>{water}/{targets.water} glasses</Text>
        </View>
        <ProgressBar progress={waterPercentage / 100} color={Colors.info} height={8} />
        <TouchableOpacity style={styles.waterBtn} onPress={() => { addWater(1); addXP(2); }}>
          <Ionicons name="water" size={20} color={Colors.info} />
          <Text style={styles.waterBtnText}>+1 Glass (+2 XP)</Text>
        </TouchableOpacity>
      </Card>

      {/* Manual Add Meal Form */}
      {showAddMeal && !aiMode && (
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Log Meal</Text>

          <View style={styles.mealTypeRow}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <TouchableOpacity key={type} style={[styles.mealTypeBtn, mealType === type && styles.mealTypeActive]} onPress={() => setMealType(type)}>
                <Text style={[styles.mealTypeText, mealType === type && styles.mealTypeTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput style={styles.input} placeholder="Meal name" placeholderTextColor={Colors.textMuted} value={mealName} onChangeText={setMealName} />
          <TextInput style={styles.input} placeholder="Calories" placeholderTextColor={Colors.textMuted} value={mealCalories} onChangeText={setMealCalories} keyboardType="numeric" />
          <View style={styles.macroRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Protein (g)" placeholderTextColor={Colors.textMuted} value={mealProtein} onChangeText={setMealProtein} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Carbs (g)" placeholderTextColor={Colors.textMuted} value={mealCarbs} onChangeText={setMealCarbs} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Fat (g)" placeholderTextColor={Colors.textMuted} value={mealFat} onChangeText={setMealFat} keyboardType="numeric" />
          </View>

          <Button title="Add Meal" variant="primary" onPress={handleAddMeal} />
        </Card>
      )}

      {/* Quick Add */}
      {!showAddMeal && !aiMode && (
        <>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickGrid}>
            {quickMeals.map((meal, i) => (
              <TouchableOpacity key={i} style={styles.quickItem} onPress={() => {
                Alert.alert(
                  `Add ${meal.name}?`,
                  `${meal.calories} cal, ${meal.protein}g protein`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Add',
                      onPress: () => {
                        addMeal({ type: 'snack', name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat });
                        addXP(5);
                      },
                    },
                  ]
                );
              }}>
                <Text style={styles.quickEmoji}>{meal.emoji}</Text>
                <Text style={styles.quickName}>{meal.name}</Text>
                <Text style={styles.quickCal}>{meal.calories} cal</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Today's Meals Log */}
      {entries.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {entries.map((entry) => (
            <Card key={entry.id} style={styles.mealLogCard}>
              <View style={styles.mealLogRow}>
                <View style={styles.mealLogInfo}>
                  <Text style={styles.mealLogType}>{entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</Text>
                  <Text style={styles.mealLogName}>{entry.name}</Text>
                  <Text style={styles.mealLogMacros}>{entry.calories} cal • {entry.protein}P • {entry.carbs}C • {entry.fat}F</Text>
                </View>
                <TouchableOpacity onPress={() => removeMeal(entry.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </>
      )}

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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  aiCard: { marginBottom: Spacing.lg },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  aiTitle: { ...Typography.h3, color: Colors.text, flex: 1 },
  freeTag: { backgroundColor: Colors.warning + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  freeTagText: { ...Typography.labelSmall, color: Colors.warning },
  aiDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  aiInput: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' },
  aiTextInput: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.body, color: Colors.text, minHeight: 44, maxHeight: 100 },
  aiResult: { marginTop: Spacing.md, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md },
  aiResultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  aiResultName: { ...Typography.labelLarge, color: Colors.text, flex: 1 },
  confidenceBadge: { backgroundColor: Colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  confidenceText: { ...Typography.labelSmall, color: Colors.primary },
  aiMacros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  aiMacro: { alignItems: 'center' },
  aiMacroValue: { ...Typography.h3, color: Colors.text },
  aiMacroLabel: { ...Typography.labelSmall, color: Colors.textMuted },
  aiSuggestion: { ...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic', marginBottom: Spacing.md },
  aiActions: { flexDirection: 'row', gap: Spacing.sm },
  calorieCard: { marginBottom: Spacing.lg, alignItems: 'center' },
  calorieLabel: { ...Typography.labelLarge, color: Colors.textSecondary },
  calorieValue: { ...Typography.displayLarge, color: Colors.text, marginVertical: Spacing.sm },
  calorieTarget: { ...Typography.body, color: Colors.textMuted },
  calorieProgress: { marginTop: Spacing.md, width: '100%' },
  macroCard: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  waterCard: { marginBottom: Spacing.lg },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterCount: { ...Typography.labelLarge, color: Colors.info },
  waterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.info + '15', borderRadius: BorderRadius.md, gap: Spacing.xs },
  waterBtnText: { ...Typography.label, color: Colors.info },
  formCard: { marginBottom: Spacing.lg },
  mealTypeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  mealTypeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceLight },
  mealTypeActive: { backgroundColor: Colors.primary },
  mealTypeText: { ...Typography.labelSmall, color: Colors.textMuted },
  mealTypeTextActive: { color: Colors.textInverse },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.body, color: Colors.text, marginBottom: Spacing.sm },
  macroRow: { flexDirection: 'row', gap: Spacing.sm },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickItem: { width: '31%', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  quickEmoji: { fontSize: 24, marginBottom: 4 },
  quickName: { ...Typography.labelSmall, color: Colors.text, textAlign: 'center' },
  quickCal: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2 },
  mealLogCard: { marginBottom: Spacing.sm },
  mealLogRow: { flexDirection: 'row', alignItems: 'center' },
  mealLogInfo: { flex: 1 },
  mealLogType: { ...Typography.labelSmall, color: Colors.primary },
  mealLogName: { ...Typography.labelLarge, color: Colors.text },
  mealLogMacros: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
});
