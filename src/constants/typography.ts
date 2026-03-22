// ============================================================
// 오늘 하나 — 타이포그래피 상수
// Apple SF Pro 기반, 시스템 폰트 사용
// ============================================================

import { Platform, TextStyle } from 'react-native';

// 시스템 폰트 패밀리
export const FontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  default: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif',
  },
});

// 폰트 사이즈 스케일 (4pt 그리드 기반)
export const FontSize = {
  xs: 11,    // 캡션, 레이블
  sm: 13,    // 보조 텍스트
  base: 15,  // 본문 기본
  md: 17,    // 본문 강조, 버튼
  lg: 20,    // 소제목
  xl: 24,    // 제목
  '2xl': 28, // 큰 제목
  '3xl': 34, // 화면 제목
  '4xl': 40, // 히어로 텍스트
} as const;

// 줄 간격 (line-height)
export const LineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

// 자주 쓰는 텍스트 스타일 조합
export const Typography = {
  // 화면 제목
  screenTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
    lineHeight: FontSize['3xl'] * 1.2,
  } as TextStyle,

  // 섹션 제목
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.3,
    lineHeight: FontSize.xl * 1.3,
  } as TextStyle,

  // 카드 제목
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.2,
    lineHeight: FontSize.lg * 1.4,
  } as TextStyle,

  // 버튼 텍스트
  button: {
    fontSize: FontSize.md,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0,
  } as TextStyle,

  // 본문
  body: {
    fontSize: FontSize.base,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: FontSize.base * 1.5,
  } as TextStyle,

  // 보조 텍스트
  caption: {
    fontSize: FontSize.sm,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: FontSize.sm * 1.4,
  } as TextStyle,

  // 최소 레이블
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.3,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  } as TextStyle,

  // 숫자 (스트릭 등)
  numeralLarge: {
    fontSize: FontSize['4xl'],
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: -1,
  } as TextStyle,
} as const;
