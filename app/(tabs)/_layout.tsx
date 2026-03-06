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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: tabBarHeight, paddingBottom: tabBarPaddingBottom }],
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
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
