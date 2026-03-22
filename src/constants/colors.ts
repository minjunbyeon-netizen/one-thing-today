// ============================================================
// 오늘 하나 — 색상 상수 (디자인 가이드 기준)
// Apple HIG + Nike 미니멀 스타일
// ============================================================

export const Colors = {
  // 기본 팔레트
  black: '#000000',        // 가장 강한 텍스트, 헤드라인
  label: '#1D1D1F',        // 본문 텍스트 (Apple SF 기준)
  white: '#FFFFFF',        // 카드 배경, 모달
  background: '#F5F5F7',   // 앱 기본 배경
  accent: '#0071E3',       // 포인트 컬러 단 1개 (Apple Blue)

  // 상태 색상
  success: '#34C759',      // 완료
  fail: '#FF3B30',         // 실패
  warning: '#FF9F0A',      // 경고

  // 텍스트 계층
  textPrimary: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',

  // 비활성 / 구분선
  disabled: '#AEAEB2',
  border: '#E5E5EA',
  separator: '#D1D1D6',

  // 카드 및 서피스
  cardBg: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // 카테고리별 색상 (포인트 컬러와 조화되는 팔레트)
  categories: {
    relationship: '#0071E3',  // 파란색 — 연결·소통
    selfcare: '#34C759',      // 초록색 — 건강·활력
    gratitude: '#5E5CE6',     // 보라색 — 따뜻함·공감
    restraint: '#FF9F0A',     // 주황색 — 절제·조절
    environment: '#30D158',   // 밝은 초록 — 자연·지구
    growth: '#636366',        // 중간 회색 — 깊이·지혜
  } as const,

  // 카테고리 배경 (연한 버전)
  categoryBg: {
    relationship: '#EBF4FF',
    selfcare: '#EDFFF3',
    gratitude: '#F0EFFF',
    restraint: '#FFF5E6',
    environment: '#EDFFF5',
    growth: '#F2F2F7',
  } as const,
} as const;

export type ColorKey = keyof typeof Colors;
