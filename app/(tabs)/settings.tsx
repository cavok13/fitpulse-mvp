import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore, AiProvider, GROQ_MODELS } from '../../src/store/useSettingsStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const store = useSettingsStore();

  // AI Provider
  const [localAiProvider, setLocalAiProvider] = useState<AiProvider>(store.aiProvider);
  const [localGroqKey, setLocalGroqKey] = useState(store.groqApiKey);
  const [localGroqModel, setLocalGroqModel] = useState(store.groqModel);
  const [localOpenAiKey, setLocalOpenAiKey] = useState(store.openAiApiKey);
  const [localUsdaKey, setLocalUsdaKey] = useState(store.usdaApiKey);

  // Testing
  const [testingGroq, setTestingGroq] = useState(false);
  const [testingOpenAi, setTestingOpenAi] = useState(false);
  const [testingUsda, setTestingUsda] = useState(false);

  const handleSave = () => {
    store.setAiProvider(localAiProvider);
    store.setGroqApiKey(localGroqKey.trim());
    store.setGroqModel(localGroqModel);
    store.setOpenAiApiKey(localOpenAiKey.trim());
    store.setUsdaApiKey(localUsdaKey.trim());
    Alert.alert('Settings Saved', 'Your preferences have been updated for this session.');
  };

  const handleTestGroq = async () => {
    if (!localGroqKey.trim()) {
      Alert.alert('No Key', 'Enter your Groq API key first. Get one free at console.groq.com');
      return;
    }
    setTestingGroq(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${localGroqKey.trim()}` },
      });
      if (response.ok) {
        const data = await response.json();
        const modelCount = data.data?.length || 0;
        Alert.alert('✅ Connected!', `Groq API works! ${modelCount} open-source models available (Llama 3, Mixtral, Gemma) — all free.`);
      } else {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Connection Failed', err.error?.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('Network Error', error?.message || 'Could not reach Groq API.');
    } finally {
      setTestingGroq(false);
    }
  };

  const handleTestOpenAi = async () => {
    if (!localOpenAiKey.trim()) {
      Alert.alert('No Key', 'Enter an OpenAI API key first.');
      return;
    }
    setTestingOpenAi(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${localOpenAiKey.trim()}` },
      });
      if (response.ok) {
        Alert.alert('✅ Connected!', 'OpenAI API key is valid.');
      } else {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Connection Failed', err.error?.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('Network Error', error?.message || 'Could not reach OpenAI API.');
    } finally {
      setTestingOpenAi(false);
    }
  };

  const handleTestUsda = async () => {
    if (!localUsdaKey.trim()) {
      Alert.alert('No Key', 'Enter your USDA API key first. Get one free at fdc.nal.usda.gov');
      return;
    }
    setTestingUsda(true);
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${localUsdaKey.trim()}&query=chicken&pageSize=1`
      );
      if (response.ok) {
        Alert.alert('✅ Connected!', 'USDA API key is valid! Your nutrition search will now use the full USDA database.');
      } else {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Connection Failed', err.error?.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      Alert.alert('Network Error', error?.message || 'Could not reach USDA API.');
    } finally {
      setTestingUsda(false);
    }
  };

  const aiProviders: { key: AiProvider; label: string; icon: string; desc: string }[] = [
    { key: 'groq', label: 'Groq (FREE)', icon: 'sparkles', desc: 'Free, open-source AI (Llama 3, Mixtral, Gemma). No credit card needed.' },
    { key: 'openai', label: 'OpenAI (Paid)', icon: 'cloud', desc: 'GPT-4o mini and GPT-4o. Requires paid API key.' },
    { key: 'local', label: 'Local (Offline)', icon: 'phone-portrait', desc: 'No API key needed. Built-in estimation (less accurate).' },
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your app preferences</Text>
        </View>
        <Ionicons name="settings-outline" size={28} color={Colors.primary} />
      </View>

      {/* Section: AI Provider */}
      <Text style={styles.sectionTitle}>AI Assistant</Text>
      <Card style={styles.card}>
        <Text style={styles.cardDesc}>Choose how meal analysis & workout insights are powered:</Text>
        <View style={styles.providerRow}>
          {aiProviders.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.providerBtn, localAiProvider === p.key && styles.providerBtnActive]}
              onPress={() => { setLocalAiProvider(p.key); if (p.key === 'local') { setLocalGroqKey(''); setLocalOpenAiKey(''); } }}
            >
              <Ionicons name={p.icon as any} size={18} color={localAiProvider === p.key ? Colors.textInverse : Colors.primary} />
              <Text style={[styles.providerLabel, localAiProvider === p.key && styles.providerLabelActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.providerDesc}>{aiProviders.find(p => p.key === localAiProvider)?.desc}</Text>
      </Card>

      {/* API Key Inputs (based on provider) */}
      {(localAiProvider === 'groq') && (
        <Card style={styles.card}>
          <View style={styles.fieldHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.success} />
            <Text style={styles.fieldLabel}>Groq API Key</Text>
            {store.hasGroqKey() && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.statusText}>Saved</Text>
              </View>
            )}
          </View>
          <Text style={styles.fieldDesc}>
            Get your free API key at console.groq.com (no credit card required).
          </Text>
          <TextInput
            style={styles.input}
            placeholder="gsk_..."
            placeholderTextColor={Colors.textMuted}
            value={localGroqKey}
            onChangeText={setLocalGroqKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <View style={styles.apiActions}>
            <Button
              title={testingGroq ? 'Testing...' : 'Test Connection'}
              variant="outline"
              size="sm"
              onPress={handleTestGroq}
              disabled={testingGroq || !localGroqKey.trim()}
            />
          </View>

          {/* Model Selector */}
          <Text style={styles.modelLabel}>Model:</Text>
          <View style={styles.modelRow}>
            {GROQ_MODELS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.modelBtn, localGroqModel === m.value && styles.modelBtnActive]}
                onPress={() => setLocalGroqModel(m.value)}
              >
                <Text style={[styles.modelBtnText, localGroqModel === m.value && styles.modelBtnTextActive]}>
                  {m.label.split(' (')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {(localAiProvider === 'openai') && (
        <Card style={styles.card}>
          <View style={styles.fieldHeader}>
            <Ionicons name="cloud" size={20} color={Colors.warning} />
            <Text style={styles.fieldLabel}>OpenAI API Key</Text>
            {store.hasOpenAiKey() && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.statusText}>Saved</Text>
              </View>
            )}
          </View>
          <Text style={styles.fieldDesc}>
            Used for GPT-4o powered analysis. Get a key at platform.openai.com/api-keys.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="sk-..."
            placeholderTextColor={Colors.textMuted}
            value={localOpenAiKey}
            onChangeText={setLocalOpenAiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <View style={styles.apiActions}>
            <Button
              title={testingOpenAi ? 'Testing...' : 'Test Connection'}
              variant="outline"
              size="sm"
              onPress={handleTestOpenAi}
              disabled={testingOpenAi || !localOpenAiKey.trim()}
            />
          </View>
        </Card>
      )}

      {/* Section: USDA Nutrition Database */}
      <Text style={styles.sectionTitle}>Nutrition Data</Text>
      <Card style={styles.card}>
        <View style={styles.fieldHeader}>
          <Ionicons name="leaf" size={20} color={Colors.info} />
          <Text style={styles.fieldLabel}>USDA FoodData Central Key</Text>
          {store.hasUsdaKey() && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.statusText}>Saved</Text>
            </View>
          )}
        </View>
        <Text style={styles.fieldDesc}>
          Free government nutrition database. Get your key at fdc.nal.usda.gov/api-key-signup.html
        </Text>
        <TextInput
          style={styles.input}
          placeholder="DEMO_KEY"
          placeholderTextColor={Colors.textMuted}
          value={localUsdaKey}
          onChangeText={setLocalUsdaKey}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <View style={styles.apiActions}>
          <Button
            title={testingUsda ? 'Testing...' : 'Test Connection'}
            variant="outline"
            size="sm"
            onPress={handleTestUsda}
            disabled={testingUsda || !localUsdaKey.trim()}
          />
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title="Save All Settings"
        variant="primary"
        onPress={handleSave}
        style={styles.saveBtn}
      />

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>AI Provider</Text>
          <Text style={styles.aboutValue}>{localAiProvider === 'groq' ? 'Groq (Free, Open-Source)' : localAiProvider === 'openai' ? 'OpenAI' : 'Local (Offline)'}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.aboutNote}>
          API keys are stored in memory only and cleared when the app restarts.{'\n\n'}
          Groq runs open-source models: Llama 3 (Meta), Mixtral (Mistral), Gemma (Google).
        </Text>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  title: { ...Typography.displaySmall, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.sm },
  card: { marginBottom: Spacing.lg },
  cardDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  providerRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  providerBtn: { flex: 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs, alignItems: 'center', borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceLight, gap: 4, borderWidth: 1, borderColor: Colors.border },
  providerBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  providerLabel: { ...Typography.labelSmall, color: Colors.text, textAlign: 'center', fontSize: 10 },
  providerLabelActive: { color: Colors.textInverse },
  providerDesc: { ...Typography.bodySmall, color: Colors.textMuted, fontStyle: 'italic' },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  fieldLabel: { ...Typography.labelLarge, color: Colors.text, flex: 1 },
  fieldDesc: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { ...Typography.labelSmall, color: Colors.success },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.body, color: Colors.text, marginBottom: Spacing.sm },
  apiActions: { flexDirection: 'row', marginBottom: Spacing.sm },
  modelLabel: { ...Typography.labelSmall, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  modelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  modelBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.sm },
  modelBtnActive: { backgroundColor: Colors.primary },
  modelBtnText: { ...Typography.labelSmall, color: Colors.text },
  modelBtnTextActive: { color: Colors.textInverse },
  saveBtn: { marginBottom: Spacing.lg },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md },
  aboutCard: { marginBottom: Spacing.lg },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  aboutLabel: { ...Typography.body, color: Colors.textSecondary },
  aboutValue: { ...Typography.labelLarge, color: Colors.text },
  aboutNote: { ...Typography.bodySmall, color: Colors.textMuted, lineHeight: 20 },
});
