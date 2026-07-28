import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore, SUBSCRIPTION_PLANS, SubscriptionTier } from '../../src/store/useSubscriptionStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const { tier, subscribe, cancelSubscription } = useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(tier === 'free' ? 'pro' : tier);

  const currentPlan = SUBSCRIPTION_PLANS[tier];
  const selectedPlan = SUBSCRIPTION_PLANS[selectedTier];

  const handleSubscribe = () => {
    if (selectedTier === tier) {
      Alert.alert('Current Plan', "You're already on this plan!");
      return;
    }

    Alert.alert(
      `Upgrade to ${selectedPlan.name}`,
      `Subscribe for ${selectedPlan.price}${selectedPlan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            subscribe(selectedTier);
            Alert.alert('Welcome!', `You're now on ${selectedPlan.name}! 🎉`);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Subscription',
      'You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            cancelSubscription();
            Alert.alert('Cancelled', 'Your subscription has been cancelled.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="diamond" size={32} color={Colors.xpGold} />
        <Text style={styles.title}>FitPulse Premium</Text>
        <Text style={styles.subtitle}>Unlock your full potential</Text>
      </View>

      {/* Current Plan */}
      {tier !== 'free' && (
        <Card style={styles.currentPlan}>
          <View style={styles.currentRow}>
            <View>
              <Text style={styles.currentLabel}>Current Plan</Text>
              <Text style={styles.currentName}>{currentPlan.name}</Text>
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Plan Selection */}
      <View style={styles.planRow}>
        {(['pro', 'elite'] as const).map((t) => {
          const plan = SUBSCRIPTION_PLANS[t];
          const isSelected = selectedTier === t;
          const isCurrent = tier === t;

          return (
            <TouchableOpacity
              key={t}
              style={[styles.planCard, isSelected && styles.planCardActive, isCurrent && styles.planCardCurrent]}
              onPress={() => setSelectedTier(t)}
            >
              {t === 'elite' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              <Text style={[styles.planName, isSelected && styles.planNameActive]}>{plan.name}</Text>
              <Text style={[styles.planPrice, isSelected && styles.planPriceActive]}>{plan.price}</Text>
              <Text style={[styles.planPeriod, isSelected && styles.planPeriodActive]}>{plan.period}</Text>

              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Features */}
      <Card style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        {selectedPlan.features.map((feature, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </Card>

      {/* Limits */}
      <Card style={styles.limitsCard}>
        <Text style={styles.sectionTitle}>Your Limits</Text>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>AI Meal Analysis</Text>
          <Text style={styles.limitValue}>
            {selectedPlan.limits.aiMealsPerDay === -1 ? 'Unlimited' : `${selectedPlan.limits.aiMealsPerDay}/day`}
          </Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>AI Workout Coaching</Text>
          <Ionicons name={selectedPlan.limits.aiWorkoutAnalysis ? 'checkmark' : 'close'} size={18} color={selectedPlan.limits.aiWorkoutAnalysis ? Colors.success : Colors.error} />
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Advanced Stats</Text>
          <Ionicons name={selectedPlan.limits.advancedStats ? 'checkmark' : 'close'} size={18} color={selectedPlan.limits.advancedStats ? Colors.success : Colors.error} />
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Custom Workout Plans</Text>
          <Text style={styles.limitValue}>
            {selectedPlan.limits.customWorkoutPlans === -1 ? 'Unlimited' : selectedPlan.limits.customWorkoutPlans}
          </Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Friend Challenges</Text>
          <Text style={styles.limitValue}>
            {selectedPlan.limits.friendChallenges === -1 ? 'Unlimited' : selectedPlan.limits.friendChallenges}
          </Text>
        </View>
        <View style={styles.limitRow}>
          <Text style={styles.limitLabel}>Ad-Free Experience</Text>
          <Ionicons name={selectedPlan.limits.adFree ? 'checkmark' : 'close'} size={18} color={selectedPlan.limits.adFree ? Colors.success : Colors.error} />
        </View>
      </Card>

      {/* CTA */}
      <Button
        title={tier === selectedTier ? 'Current Plan' : `Upgrade to ${selectedPlan.name}`}
        variant={tier === selectedTier ? 'secondary' : 'primary'}
        onPress={handleSubscribe}
        disabled={tier === selectedTier}
        style={styles.ctaBtn}
      />

      {tier !== 'free' && (
        <Button
          title="Restore Purchases"
          variant="ghost"
          onPress={() => Alert.alert('Restore', 'Checking for previous purchases...')}
        />
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  title: { ...Typography.displaySmall, color: Colors.text, marginTop: Spacing.sm },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  currentPlan: { marginBottom: Spacing.lg },
  currentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentLabel: { ...Typography.labelSmall, color: Colors.textMuted },
  currentName: { ...Typography.labelLarge, color: Colors.primary },
  cancelText: { ...Typography.label, color: Colors.error },
  planRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  planCard: { flex: 1, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  planCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  planCardCurrent: { borderColor: Colors.success },
  popularBadge: { backgroundColor: Colors.xpGold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: Spacing.sm },
  popularText: { ...Typography.labelSmall, color: Colors.textInverse, fontWeight: '700' },
  planName: { ...Typography.label, color: Colors.textMuted },
  planNameActive: { color: Colors.text },
  planPrice: { ...Typography.displaySmall, color: Colors.textMuted, marginTop: Spacing.xs },
  planPriceActive: { color: Colors.primary },
  planPeriod: { ...Typography.bodySmall, color: Colors.textMuted },
  planPeriodActive: { color: Colors.textSecondary },
  currentBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: Spacing.sm },
  currentBadgeText: { ...Typography.labelSmall, color: Colors.success },
  featuresCard: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  featureText: { ...Typography.body, color: Colors.textSecondary, flex: 1 },
  limitsCard: { marginBottom: Spacing.lg },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  limitLabel: { ...Typography.body, color: Colors.textSecondary },
  limitValue: { ...Typography.label, color: Colors.primary },
  ctaBtn: { marginBottom: Spacing.sm },
});
