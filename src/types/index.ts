// ============================================================
// 오늘 하나 (One Thing Today) — 타입 정의
// ============================================================

// 미션 카테고리
export type MissionCategory =
  | 'relationship' // 인간관계
  | 'selfcare'     // 자기관리
  | 'gratitude'    // 감사·배려
  | 'restraint'    // 절제
  | 'environment'  // 환경·사회
  | 'growth';      // 성장

// 미션
export interface Mission {
  id: string;
  text: string;          // 전체 미션 텍스트
  shortText: string;     // 카드에 표시할 짧은 텍스트
  category: MissionCategory;
  difficulty: 1 | 2 | 3; // 1: 쉬움, 2: 보통, 3: 어려움
  tags: string[];
}

// 체크인 (하루 실천 기록)
export interface CheckIn {
  id: number;
  date: string;          // YYYY-MM-DD
  missionId: string;
  missionText: string;
  category: MissionCategory;
  status: 'done' | 'undone' | 'skipped';
  memo?: string;
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
}

// 앱 설정
export interface AppSettings {
  morningTime: string;                          // HH:mm — 아침 알림 시각
  eveningTime: string;                          // HH:mm — 저녁 알림 시각
  selectedCategories: MissionCategory[] | 'all'; // 선호 카테고리
  notificationEnabled: boolean;
  streakCount: number;                          // 연속 실천 일수
  lastCheckinDate?: string;                     // YYYY-MM-DD
  onboardingDone: boolean;
  nickname?: string;
}

// 카테고리 한국어 레이블 매핑
export const CATEGORY_LABELS: Record<MissionCategory, string> = {
  relationship: '인간관계',
  selfcare: '자기관리',
  gratitude: '감사·배려',
  restraint: '절제',
  environment: '환경·사회',
  growth: '성장',
};
