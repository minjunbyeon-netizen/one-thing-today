// ============================================================
// 오늘 하나 — Bottom Tab 네비게이션 레이아웃
// 홈 / 히스토리 / 설정 3탭 구성
// ============================================================

import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { Colors } from '@/src/constants/colors';
import { FontSize } from '@/src/constants/typography';
import TabBarIcon from '@/components/ui/tab-bar-icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        // 햅틱 피드백은 TabBarIcon 내부에서 처리
      }}
    >
      {/* 홈 탭 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      {/* 히스토리 탭 */}
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
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
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="sliders" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.select({ ios: 88, android: 68, default: 68 }),
    paddingBottom: Platform.select({ ios: 24, android: 8, default: 8 }),
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
