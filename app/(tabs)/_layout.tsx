import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';
import { useSubscriptionStore } from '../../src/store/useSubscriptionStore';

export default function TabLayout() {
  const tier = useSubscriptionStore((s) => s.tier);
  const isPremium = tier !== 'free';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="workouts" options={{ title: 'Workouts', tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size} color={color} /> }} />
      <Tabs.Screen name="social" options={{ title: 'Social', tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ color, size }) => <Ionicons name="nutrition" size={size} color={color} /> }} />
      <Tabs.Screen name="calculator" options={{ title: 'Calculator', tabBarIcon: ({ color, size }) => <Ionicons name="calculator" size={size} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }} />
      <Tabs.Screen name="premium" options={{
        title: isPremium ? 'Premium' : 'Upgrade',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={isPremium ? 'diamond' : 'diamond-outline'} size={size} color={isPremium ? Colors.xpGold : color} />
        ),
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
