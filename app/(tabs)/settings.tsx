import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { openAiApiKey, usdaApiKey, setOpenAiApiKey, setUsdaApiKey, hasOpenAiKey, hasUsdaKey } = useSettingsStore();

  const [localOpenAiKey, setLocalOpenAiKey] = useState(openAiApiKey);
  const [localUsdaKey, setLocalUsdaKey] = useState(usdaApiKey);
  const [testingOpenAi, setTestingOpenAi] = useState(false);
  const [testingUsda, setTestingUsda] = useState(false);

  const handleSaveKeys = () => {
    setOpenAiApiKey(localOpenAiKey.trim());
    setUsdaApiKey(localUsdaKey.trim());
    Alert.alert('Keys Saved', 'API keys have been updated. They are stored in memory for this session.');
  };

  const handleTestOpenAi = async () => {
    if (!localOpenAiKey.trim()) {
      Alert.alert('No Key', 'Please enter an OpenAI API key first.');
      return;
    }
    setTestingOpenAi(true);
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${localOpenAiKey.trim()}`,
        },
      });
      if (response.ok) {
        Alert.alert('Connection OK', 'OpenAI API key is valid and working!');
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert('Connection Failed', data.error?.message || `HTTP ${response.status}: Invalid key or API error.`);
      }
    } catch (error: any) {
      Alert.alert('Network Error', error?.message || 'Could not reach OpenAI API. Check your internet connection.');
    } finally {
      setTestingOpenAi(false);
    }
  };

  const handleTestUsda = async () => {
    if (!localUsdaKey.trim()) {
      Alert.alert('No Key', 'Please enter a USDA API key first.');
      return;
    }
    setTestingUsda(true);
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${localUsdaKey.trim()}&query=chicken&pageSize=1`
      );
      if (response.ok) {
        Alert.alert('Connection OK', 'USDA API key is valid and working!');
      } else {
        const data = await response.json().catch(() => ({}));
        Alert.alert('Connection Failed', data.error?.message || `HTTP ${response.status}: Invalid key or API error.`);
      }
    } catch (error: any) {
      Alert.alert('Network Error', error?.message || 'Could not reach USDA API. Check your internet connection.');
    } finally {
      setTestingUsda(false);
    }
  };

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

      {/* API Keys Section */}
      <Text style={styles.sectionTitle}>API Keys</Text>
      <Card style={styles.apiCard}>
        <View style={styles.apiIconRow}>
          <Ionicons name="sparkles" size={20} color={Colors.success} />
          <Text style={styles.apiLabel}>OpenAI API Key</Text>
          {hasOpenAiKey() && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.statusText}>Set</Text>
            </View>
          )}
        </View>
        <Text style={styles.apiDescription}>
          Used for AI meal analysis and workout suggestions via GPT-4o.
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

        <View style={styles.divider} />

        <View style={styles.apiIconRow}>
          <Ionicons name="leaf" size={20} color={Colors.info} />
          <Text style={styles.apiLabel}>USDA FoodData Central Key</Text>
          {hasUsdaKey() && (
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.statusText}>Set</Text>
            </View>
          )}
        </View>
        <Text style={styles.apiDescription}>
          Used for searching the USDA nutrition database. Get a free key at fdc.nal.usda.gov.
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

        <Button
          title="Save Keys"
          variant="primary"
          onPress={handleSaveKeys}
          style={styles.saveBtn}
        />
      </Card>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.aboutCard}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Build</Text>
          <Text style={styles.aboutValue}>MVP</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.aboutNote}>
          API keys are stored in memory only and will be cleared when the app restarts. No keys are transmitted to third parties beyond the intended API calls.
        </Text>
        <View style={styles.divider} />
        <Text style={styles.aboutNote}>
          Get your API keys:{'\n'}
          • OpenAI: platform.openai.com/api-keys{'\n'}
          • USDA: fdc.nal.usda.gov/api-key-signup.html
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
  apiCard: { marginBottom: Spacing.lg },
  apiIconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  apiLabel: { ...Typography.labelLarge, color: Colors.text, flex: 1 },
  apiDescription: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { ...Typography.labelSmall, color: Colors.success },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: BorderRadius.md, padding: Spacing.md, ...Typography.body, color: Colors.text, marginBottom: Spacing.sm },
  apiActions: { flexDirection: 'row', marginBottom: Spacing.sm },
  saveBtn: { marginTop: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.lg },
  aboutCard: { marginBottom: Spacing.lg },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  aboutLabel: { ...Typography.body, color: Colors.textSecondary },
  aboutValue: { ...Typography.labelLarge, color: Colors.text },
  aboutNote: { ...Typography.bodySmall, color: Colors.textMuted, lineHeight: 20 },
});
