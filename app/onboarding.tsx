/**
 * 온보딩 화면 — 첫 실행 1회만 표시 (3페이지)
 */
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
// AsyncStorage optional import
let AsyncStorage: { setItem: (k: string, v: string) => Promise<void> } | null = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch {}

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'ott_onboarding_done';

type Page = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  bgDark: string;
};

const PAGES: Page[] = [
  {
    id: '1',
    emoji: '🎯',
    title: '하루에 딱 한 가지',
    subtitle: '할 일이 너무 많으면 아무것도 못 해요.\n오늘 가장 중요한 한 가지만 정하세요.',
    bg: '#F0EDFF',
    bgDark: '#1A1730',
  },
  {
    id: '2',
    emoji: '🔥',
    title: '매일 쌓이는 습관',
    subtitle: '연속으로 달성할수록 스트릭이 늘어요.\n작은 성공이 모여 큰 변화를 만들어요.',
    bg: '#FFF3ED',
    bgDark: '#1A1208',
  },
  {
    id: '3',
    emoji: '✨',
    title: '단순하게, 꾸준하게',
    subtitle: '복잡한 기능 없이 오직 한 가지에 집중.\n지금 시작해보세요.',
    bg: '#EDFFF3',
    bgDark: '#071A0F',
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Page>>(null);

  const handleNext = () => {
    if (currentIndex < PAGES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await AsyncStorage?.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const renderItem: ListRenderItem<Page> = ({ item }) => {
    const bg = isDark ? item.bgDark : item.bg;
    return (
      <View style={[styles.page, { width: SCREEN_WIDTH, backgroundColor: bg }]}>
        <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
        <ThemedText style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: isDark ? '#AAAAAA' : '#555555' }]}>
          {item.subtitle}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: isDark ? '#0F0F0F' : '#FFFFFF' }]}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* 하단 컨트롤 */}
      <View style={styles.footer}>
        {/* 점 인디케이터 */}
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? '#6C63FF' : '#CCCCCC',
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* 버튼 */}
        <View style={styles.buttons}>
          {currentIndex < PAGES.length - 1 && (
            <Pressable style={styles.skipBtn} onPress={handleFinish}>
              <ThemedText style={styles.skipText}>{'건너뛰기'}</ThemedText>
            </Pressable>
          )}
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <ThemedText style={styles.nextText}>
              {currentIndex === PAGES.length - 1 ? '시작하기' : '다음'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    padding: 24,
    paddingBottom: 12,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  } as any,
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  skipText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
