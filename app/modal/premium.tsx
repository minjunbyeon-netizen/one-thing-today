/**
 * 프리미엄 모달 — 구독 플랜 선택 UI
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';

import { useTaskContext } from '@/contexts/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Plan = {
  id: 'monthly' | 'yearly' | 'lifetime';
  title: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  monthlyEquiv?: string;
};

const PLANS: Plan[] = [
  {
    id: 'monthly',
    title: '월간 구독',
    price: '2,900원',
    period: '/ 월',
  },
  {
    id: 'yearly',
    title: '연간 구독',
    price: '19,900원',
    period: '/ 년',
    badge: '43% 할인',
    badgeColor: '#FF6B35',
    monthlyEquiv: '월 1,658원',
  },
  {
    id: 'lifetime',
    title: '평생 이용권',
    price: '39,900원',
    period: '한 번만',
    badge: '한정',
    badgeColor: '#6C63FF',
  },
];

/**
 * 기능 목록 타입
 * comingSoon: true 이면 출시 예정 기능으로 표시 (dimmed + 예정 뱃지)
 */
type Feature = {
  icon: string;
  text: string;
  comingSoon?: boolean;
};

const FEATURES: Feature[] = [
  { icon: '📅', text: '히스토리 무제한 기록' },
  { icon: '⏱️', text: '집중 타이머 (포모도로)' },
  { icon: '🏠', text: '홈화면 위젯' },
  { icon: '☁️', text: '클라우드 동기화', comingSoon: true },
  { icon: '🎨', text: '테마 12종' },
  { icon: '📊', text: '상세 통계 & 달성률 그래프' },
];

export default function PremiumModal() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { activatePremium, isPremium } = useTaskContext();
  const [selectedPlan, setSelectedPlan] = useState<Plan['id']>('yearly');
  const [loading, setLoading] = useState(false);

  const bgColor = isDark ? '#0F0F0F' : '#FAFAFA';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const subColor = isDark ? '#8E8E93' : '#8E8E93';

  const handlePurchase = async () => {
    setLoading(true);
    try {
      // 실제 앱에서는 여기서 결제 SDK 호출
      // 테스트용: 바로 활성화
      await new Promise((r) => setTimeout(r, 800)); // 결제 시뮬레이션
      await activatePremium(selectedPlan);
      Alert.alert(
        '프리미엄 활성화 완료!',
        '이제 모든 프리미엄 기능을 사용할 수 있어요. 감사합니다! ✨',
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('오류', '결제 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
        <View style={styles.alreadyPremium}>
          <ThemedText style={styles.alreadyIcon}>{'✨'}</ThemedText>
          <ThemedText style={[styles.alreadyTitle, { color: textColor }]}>
            {'이미 프리미엄이에요!'}
          </ThemedText>
          <ThemedText style={[styles.alreadySub, { color: subColor }]}>
            {'모든 프리미엄 기능을 사용하고 있어요.'}
          </ThemedText>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <ThemedText style={styles.doneBtnText}>{'닫기'}</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <View style={styles.topSection}>
          <ThemedText style={styles.topIcon}>{'🚀'}</ThemedText>
          <ThemedText style={[styles.topTitle, { color: textColor }]}>
            {'프리미엄으로 업그레이드'}
          </ThemedText>
          <ThemedText style={[styles.topSub, { color: subColor }]}>
            {'더 강력하게, 더 오래, 더 스마트하게'}
          </ThemedText>
        </View>

        {/* 기능 목록 */}
        <View style={[styles.featuresCard, { backgroundColor: cardBg, borderColor }]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <ThemedText style={[styles.featureIcon, f.comingSoon && styles.featureIconDimmed]}>
                {f.icon}
              </ThemedText>
              <ThemedText style={[
                styles.featureText,
                { color: f.comingSoon ? subColor : textColor },
              ]}>
                {f.text}
              </ThemedText>
              {f.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <ThemedText style={styles.comingSoonText}>{'2026 Q3 예정'}</ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 플랜 선택 */}
        <ThemedText style={[styles.planSectionTitle, { color: subColor }]}>
          {'플랜 선택'}
        </ThemedText>
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: isSelected ? '#6C63FF' : borderColor,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {plan.badge && (
                  <View style={[styles.planBadge, { backgroundColor: plan.badgeColor }]}>
                    <ThemedText style={styles.planBadgeText}>{plan.badge}</ThemedText>
                  </View>
                )}
                <View style={styles.planLeft}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <ThemedText style={[styles.planTitle, { color: textColor }]}>
                      {plan.title}
                    </ThemedText>
                    {plan.monthlyEquiv && (
                      <ThemedText style={[styles.planEquiv, { color: '#6C63FF' }]}>
                        {plan.monthlyEquiv}
                      </ThemedText>
                    )}
                  </View>
                </View>
                <View style={styles.planRight}>
                  <ThemedText style={[styles.planPrice, { color: textColor }]}>
                    {plan.price}
                  </ThemedText>
                  <ThemedText style={[styles.planPeriod, { color: subColor }]}>
                    {plan.period}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* 구매 버튼 */}
        <Pressable
          style={[styles.purchaseBtn, loading && styles.purchaseBtnDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.purchaseBtnText}>
              {`${PLANS.find((p) => p.id === selectedPlan)?.price} 시작하기`}
            </ThemedText>
          )}
        </Pressable>

        <ThemedText style={[styles.legalText, { color: subColor }]}>
          {'구독은 언제든지 취소 가능합니다.\n구매 후 환불은 앱스토어 정책을 따릅니다.'}
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  topIcon: {
    fontSize: 48,
  },
  topTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  topSub: {
    fontSize: 15,
    textAlign: 'center',
  },
  featuresCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  featureIconDimmed: {
    opacity: 0.45,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  comingSoonBadge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
  },
  planSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#6C63FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6C63FF',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  planEquiv: {
    fontSize: 12,
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  planPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  purchaseBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  purchaseBtnDisabled: {
    opacity: 0.6,
  },
  purchaseBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  legalText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  alreadyPremium: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  alreadyIcon: {
    fontSize: 64,
  },
  alreadyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  alreadySub: {
    fontSize: 15,
    textAlign: 'center',
  },
  doneBtn: {
    marginTop: 12,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
