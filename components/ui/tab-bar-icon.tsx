// ============================================================
// 오늘 하나 — 탭 바 아이콘 컴포넌트
// @expo/vector-icons Feather (라인 스타일 stroke only)
// ============================================================

import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface TabBarIconProps {
  name: FeatherIconName;
  color: string;
  focused: boolean;
}

export default function TabBarIcon({ name, color, focused }: TabBarIconProps) {
  return (
    <Feather
      name={name}
      size={focused ? 22 : 20}
      color={color}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    // 아이콘 자체 여백
  },
});
