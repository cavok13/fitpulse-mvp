import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../src/store/useAppStore';
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore';
import {
  searchFood,
  getFoodByBarcode,
  scanBarcode,
  calculateNutrition,
  FoodSearchResult,
  CalculatedMeal,
} from '../../src/services/nutritionApi';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function CalorieCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const addMeal = useAppStore((s) => s.addMeal);
  const addXP = useAppStore((s) => s.addXP);
  const { tier } = useSubscriptionStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);

  // Quantity state
  const [quantity, setQuantity] = useState('100');
  const [quantityUnit, setQuantityUnit] = useState<'g' | 'servings'>('g');

  // Calculated result
  const [calculated, setCalculated] = useState<CalculatedMeal['calculated'] | null>(null);

  // Barcode state
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchFood(searchQuery, 10);
      setSearchResults(results);
      if (results.length === 0) {
        Alert.alert('No Results', `No foods found for "${searchQuery}". Try a different search.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not search foods. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleBarcodeScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const barcode = await scanBarcode();
      if (!barcode) {
        Alert.alert('Scan Failed', 'Could not read barcode. Try again.');
        return;
      }

      const food = await getFoodByBarcode(barcode);
      if (food) {
        setSelectedFood(food);
        setSearchResults([]);
        setSearchQuery(food.name);
        updateCalculation(food, quantity, quantityUnit);
      } else {
        Alert.alert('Food Not Found', `No nutrition data found for barcode: ${barcode}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not scan barcode. Please try again.');
    } finally {
      setIsScanning(false);
    }
  }, [quantity, quantityUnit]);

  const selectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setSearchResults([]);
    setSearchQuery(food.name);
    updateCalculation(food, quantity, quantityUnit);
  };

  const updateCalculation = useCallback((food: FoodSearchResult, qty: string, unit: 'g' | 'servings') => {
    const qtyNum = parseFloat(qty) || 0;
    let grams = qtyNum;

    if (unit === 'servings') {
      grams = qtyNum * food.servingSize;
    }

    const result = calculateNutrition(food, grams);
    setCalculated(result);
  }, []);

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (selectedFood) {
      updateCalculation(selectedFood, value, quantityUnit);
    }
  };

  const handleUnitChange = (unit: 'g' | 'servings') => {
    setQuantityUnit(unit);
    if (selectedFood) {
      updateCalculation(selectedFood, quantity, unit);
    }
  };

  const handleAddToLog = () => {
    if (!selectedFood || !calculated) return;

    addMeal({
      type: 'snack', // Will be categorized by user
      name: `${selectedFood.name} (${quantity}${quantityUnit === 'g' ? 'g' : ' servings'})`,
      calories: calculated.calories,
      protein: calculated.protein,
      carbs: calculated.carbs,
      fat: calculated.fat,
    });

    addXP(15);

    Alert.alert(
      'Added to Log!',
      `${selectedFood.name}\n${calculated.calories} cal • ${calculated.protein}P • ${calculated.carbs}C • ${calculated.fat}F\n\n+15 XP earned!`,
      [{ text: 'OK' }]
    );

    // Reset
    setSelectedFood(null);
    setCalculated(null);
    setSearchQuery('');
    setQuantity('100');
  };

  const getQuickQuantities = () => {
    if (!selectedFood) return [];
    return [
      { label: '50g', grams: 50 },
      { label: '100g', grams: 100 },
      { label: '150g', grams: 150 },
      { label: '200g', grams: 200 },
      { label: '1 serving', grams: selectedFood.servingSize, unit: 'servings' as const },
      { label: '2 servings', grams: selectedFood.servingSize * 2, unit: 'servings' as const },
    ];
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Calorie Calculator</Text>
          <Text style={styles.subtitle}>Search food or scan barcode</Text>
        </View>
      </View>

      {/* Search Bar */}
      <Card style={styles.searchCard}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder='e.g., "chicken breast"'
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.barcodeBtn} onPress={handleBarcodeScan} disabled={isScanning}>
            {isScanning ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="barcode" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        <Button
          title={isSearching ? 'Searching...' : 'Search Food'}
          variant="primary"
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          style={styles.searchBtn}
        />
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedFood && (
        <Card style={styles.resultsCard}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((food) => (
            <TouchableOpacity key={food.id} style={styles.resultItem} onPress={() => selectFood(food)}>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{food.name}</Text>
                {food.brand && <Text style={styles.resultBrand}>{food.brand}</Text>}
                <Text style={styles.resultNutrition}>
                  {food.nutrition.calories} cal • {food.nutrition.protein}P • {food.nutrition.carbs}C • {food.nutrition.fat}F per 100g
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Selected Food & Calculator */}
      {selectedFood && (
        <>
          {/* Food Info Card */}
          <Card variant="gradient" style={styles.foodCard}>
            <View style={styles.foodHeader}>
              <View style={styles.foodIcon}>
                <Ionicons name="restaurant" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{selectedFood.name}</Text>
                {selectedFood.brand && <Text style={styles.foodBrand}>{selectedFood.brand}</Text>}
              </View>
              <TouchableOpacity onPress={() => { setSelectedFood(null); setCalculated(null); setSearchQuery(''); }}>
                <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Nutrition per 100g */}
            <View style={styles.nutritionPer100}>
              <Text style={styles.nutritionPer100Title}>Per 100g:</Text>
              <View style={styles.nutritionPer100Row}>
                <View style={styles.nutritionPer100Item}>
                  <Text style={styles.nutritionPer100Value}>{selectedFood.nutrition.calories}</Text>
                  <Text style={styles.nutritionPer100Label}>cal</Text>
                </View>
                <View style={styles.nutritionPer100Item}>
                  <Text style={[styles.nutritionPer100Value, { color: Colors.error }]}>{selectedFood.nutrition.protein}g</Text>
                  <Text style={styles.nutritionPer100Label}>protein</Text>
                </View>
                <View style={styles.nutritionPer100Item}>
                  <Text style={[styles.nutritionPer100Value, { color: Colors.warning }]}>{selectedFood.nutrition.carbs}g</Text>
                  <Text style={styles.nutritionPer100Label}>carbs</Text>
                </View>
                <View style={styles.nutritionPer100Item}>
                  <Text style={[styles.nutritionPer100Value, { color: Colors.info }]}>{selectedFood.nutrition.fat}g</Text>
                  <Text style={styles.nutritionPer100Label}>fat</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Quantity Input */}
          <Card style={styles.quantityCard}>
            <Text style={styles.sectionTitle}>Enter Quantity</Text>

            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, quantityUnit === 'g' && styles.unitBtnActive]}
                onPress={() => handleUnitChange('g')}
              >
                <Text style={[styles.unitBtnText, quantityUnit === 'g' && styles.unitBtnTextActive]}>Grams</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, quantityUnit === 'servings' && styles.unitBtnActive]}
                onPress={() => handleUnitChange('servings')}
              >
                <Text style={[styles.unitBtnText, quantityUnit === 'servings' && styles.unitBtnTextActive]}>Servings</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quantityInputRow}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                placeholder="100"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.quantityUnit}>{quantityUnit === 'g' ? 'grams' : `× ${selectedFood.servingSize}g`}</Text>
            </View>

            {/* Quick Quantities */}
            <View style={styles.quickQuantities}>
              {getQuickQuantities().map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickQtyBtn}
                  onPress={() => {
                    setQuantity(String(q.grams));
                    if (q.unit) setQuantityUnit(q.unit);
                    updateCalculation(selectedFood, String(q.grams), q.unit || quantityUnit);
                  }}
                >
                  <Text style={styles.quickQtyText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Calculated Result */}
          {calculated && (
            <Card variant="gradient" style={styles.resultCard}>
              <Text style={styles.sectionTitle}>Calculated Nutrition</Text>
              <View style={styles.resultMacros}>
                <View style={styles.resultMacro}>
                  <Text style={styles.resultMacroValue}>{calculated.calories}</Text>
                  <Text style={styles.resultMacroLabel}>Calories</Text>
                </View>
                <View style={styles.resultMacro}>
                  <Text style={[styles.resultMacroValue, { color: Colors.error }]}>{calculated.protein}g</Text>
                  <Text style={styles.resultMacroLabel}>Protein</Text>
                </View>
                <View style={styles.resultMacro}>
                  <Text style={[styles.resultMacroValue, { color: Colors.warning }]}>{calculated.carbs}g</Text>
                  <Text style={styles.resultMacroLabel}>Carbs</Text>
                </View>
                <View style={styles.resultMacro}>
                  <Text style={[styles.resultMacroValue, { color: Colors.info }]}>{calculated.fat}g</Text>
                  <Text style={styles.resultMacroLabel}>Fat</Text>
                </View>
              </View>

              <View style={styles.formula}>
                <Text style={styles.formulaText}>
                  {quantity}{quantityUnit === 'g' ? 'g' : ` servings`} × {selectedFood.nutrition.calories} cal/100g = {calculated.calories} cal
                </Text>
              </View>

              <Button
                title="Add to Daily Log"
                variant="primary"
                onPress={handleAddToLog}
                style={styles.addBtn}
              />
            </Card>
          )}
        </>
      )}

      {/* Tips Card */}
      {!selectedFood && searchResults.length === 0 && (
        <Card style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.tipRow}>
            <Ionicons name="search" size={20} color={Colors.primary} />
            <Text style={styles.tipText}>Search by food name (e.g., "chicken breast")</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="barcode" size={20} color={Colors.primary} />
            <Text style={styles.tipText}>Scan a barcode for packaged foods</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="calculator" size={20} color={Colors.primary} />
            <Text style={styles.tipText}>Enter quantity in grams or servings</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.tipText}>Add to your daily nutrition log</Text>
          </View>
        </Card>
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
  searchCard: { marginBottom: Spacing.lg },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text, paddingVertical: Spacing.md },
  barcodeBtn: { width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  searchBtn: { width: '100%' },
  resultsCard: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultInfo: { flex: 1 },
  resultName: { ...Typography.labelLarge, color: Colors.text },
  resultBrand: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  resultNutrition: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 4 },
  foodCard: { marginBottom: Spacing.lg },
  foodHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  foodIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  foodName: { ...Typography.h3, color: Colors.text },
  foodBrand: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  nutritionPer100: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md },
  nutritionPer100Title: { ...Typography.labelSmall, color: Colors.textMuted, marginBottom: Spacing.sm },
  nutritionPer100Row: { flexDirection: 'row', justifyContent: 'space-around' },
  nutritionPer100Item: { alignItems: 'center' },
  nutritionPer100Value: { ...Typography.labelLarge, color: Colors.text },
  nutritionPer100Label: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 2 },
  quantityCard: { marginBottom: Spacing.lg },
  unitToggle: { flexDirection: 'row', backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: 3, marginBottom: Spacing.md },
  unitBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  unitBtnActive: { backgroundColor: Colors.primary },
  unitBtnText: { ...Typography.label, color: Colors.textMuted },
  unitBtnTextActive: { color: Colors.textInverse },
  quantityInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  quantityInput: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.bodyLarge, color: Colors.text, textAlign: 'center' },
  quantityUnit: { ...Typography.body, color: Colors.textSecondary, minWidth: 80 },
  quickQuantities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickQtyBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.sm },
  quickQtyText: { ...Typography.labelSmall, color: Colors.primary },
  resultCard: { marginBottom: Spacing.lg },
  resultMacros: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  resultMacro: { alignItems: 'center' },
  resultMacroValue: { ...Typography.h2, color: Colors.text },
  resultMacroLabel: { ...Typography.labelSmall, color: Colors.textMuted, marginTop: 4 },
  formula: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.sm, padding: Spacing.sm, marginBottom: Spacing.md },
  formulaText: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center' },
  addBtn: { width: '100%' },
  tipsCard: { marginBottom: Spacing.lg },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  tipText: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
});
