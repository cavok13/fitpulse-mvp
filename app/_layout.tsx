import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../src/store/useAppStore';

export default function RootLayout() {
  const user = useAppStore((s) => s.user);
  const isOnboarded = user.name !== 'Athlete' && user.goals.length > 0;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        {!isOnboarded && <Stack.Screen name="onboarding" />}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
