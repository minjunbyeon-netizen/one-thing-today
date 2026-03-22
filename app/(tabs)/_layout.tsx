<<<<<<< HEAD
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
=======
// ============================================================
// 오늘 하나 — Bottom Tab 네비게이션 레이아웃
// 홈 / 히스토리 / 설정 3탭 구성
// ============================================================

import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/src/constants/colors';
import { FontSize } from '@/src/constants/typography';
import TabBarIcon from '@/components/ui/tab-bar-icon';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // 갤럭시 하단 네비게이션 바 높이만큼 탭바를 늘려서 버튼이 가리지 않도록
  const tabBarHeight = Platform.select({
    ios: 88,
    android: 56 + insets.bottom,
    default: 68,
  });
  const tabBarPaddingBottom = Platform.select({
    ios: 24,
    android: insets.bottom + 4,
    default: 8,
  });
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235

  return (
    <Tabs
      screenOptions={{
<<<<<<< HEAD
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#222' : '#EEEEEE',
        },
      }}>
=======
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: tabBarHeight, paddingBottom: tabBarPaddingBottom }],
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      {/* 홈 탭 */}
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘',
<<<<<<< HEAD
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="sun.max.fill" color={color} />
          ),
        }}
      />
=======
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      {/* 히스토리 탭 */}
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
<<<<<<< HEAD
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="calendar" color={color} />
          ),
        }}
      />
=======
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="calendar" color={color} focused={focused} />
          ),
        }}
      />
      {/* 프로필 탭 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '나',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      {/* 설정 탭 */}
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
<<<<<<< HEAD
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="gearshape.fill" color={color} />
=======
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="sliders" color={color} focused={focused} />
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
          ),
        }}
      />
    </Tabs>
  );
}
<<<<<<< HEAD
=======

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    // 그림자 (iOS)
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    // 그림자 (Android)
    elevation: 8,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 4,
  },
});
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
