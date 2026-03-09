import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
// AsyncStorage optional import
let AsyncStorage: { getItem: (k: string) => Promise<string | null> } | null = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TaskProvider } from '@/contexts/TaskContext';

const ONBOARDING_KEY = 'ott_onboarding_done';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage?.getItem(ONBOARDING_KEY);
      if (!done) {
        router.replace('/onboarding');
      }
      setOnboardingChecked(true);
    })();
  }, []);

  if (!onboardingChecked) return null; // 체크 완료 전까지 렌더 블로킹

  return (
    <TaskProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="modal/premium"
            options={{
              presentation: 'modal',
              title: '프리미엄',
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TaskProvider>
  );
}
