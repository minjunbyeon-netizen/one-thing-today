// ============================================================
// 오늘 하나 — 날짜 기반 미션 선택 로직
// 같은 날짜에는 항상 같은 미션을 선택 (시드 기반)
// 최근 7일 중복 방지
// ============================================================

import { Mission, MissionCategory, AppSettings } from '../types';
import { MISSIONS } from '../data/missions';
import { getRecentMissionIds } from './database';

// ──────────────────────────────────────────────────────────
// 오늘의 미션 선택
// ──────────────────────────────────────────────────────────

/**
 * 오늘 날짜와 설정을 기반으로 미션 하나를 선택한다.
 * 같은 날 항상 같은 미션이 반환된다 (날짜 시드).
 * 최근 7일에 완료한 미션은 제외된다.
 */
export function getTodayMission(settings?: Partial<AppSettings>): Mission {
  const today = _getToday();
  const seed = _dateSeed(today);

  // 사용 가능한 카테고리 필터
  const allowedCategories = _getAllowedCategories(settings);

  // 후보 미션 풀
  let pool = MISSIONS.filter((m) =>
    allowedCategories === 'all' || allowedCategories.includes(m.category)
  );

  // 최근 7일 완료 미션 제외 (DB 조회)
  try {
    const recentIds = getRecentMissionIds(7);
    const filtered = pool.filter((m) => !recentIds.includes(m.id));
    // 필터 후 풀이 너무 작으면 전체 사용
    if (filtered.length >= 3) {
      pool = filtered;
    }
  } catch {
    // DB 미초기화 상태 등에서는 필터 없이 진행
  }

  // 시드 기반 인덱스 선택
  const index = seed % pool.length;
  return pool[index];
}

/**
 * 특정 날짜의 미션을 가져온다 (히스토리 재생성용).
 * DB 기록이 없을 때 사용.
 */
export function getMissionForDate(
  dateStr: string,
  settings?: Partial<AppSettings>
): Mission {
  const seed = _dateSeed(dateStr);
  const allowedCategories = _getAllowedCategories(settings);

  const pool = MISSIONS.filter((m) =>
    allowedCategories === 'all' || allowedCategories.includes(m.category)
  );

  const index = seed % pool.length;
  return pool[index];
}

// ──────────────────────────────────────────────────────────
// 내부 헬퍼
// ──────────────────────────────────────────────────────────

/** YYYY-MM-DD → 정수 시드 변환 */
function _dateSeed(dateStr: string): number {
  // "2025-03-05" → 20250305
  const numeric = parseInt(dateStr.replace(/-/g, ''), 10);
  // 간단한 해시 (선형 합동법)
  return Math.abs((numeric * 1103515245 + 12345) & 0x7fffffff);
}

/** 오늘 날짜 YYYY-MM-DD */
function _getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 허용된 카테고리 반환 */
function _getAllowedCategories(
  settings?: Partial<AppSettings>
): MissionCategory[] | 'all' {
  if (!settings || !settings.selectedCategories) return 'all';
  return settings.selectedCategories;
}
