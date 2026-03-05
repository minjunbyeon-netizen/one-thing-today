// ============================================================
// 오늘 하나 — SQLite 데이터베이스 유틸리티
// expo-sqlite v16 사용 (동기 API)
// ============================================================

import * as SQLite from 'expo-sqlite';
import { CheckIn, AppSettings, MissionCategory } from '../types';

// DB 파일명
const DB_NAME = 'onethingtoday.db';

// DB 인스턴스 (싱글톤)
let _db: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
  }
  return _db;
}

// ──────────────────────────────────────────────────────────
// 초기화 — 테이블 생성
// ──────────────────────────────────────────────────────────

export function initDatabase(): void {
  const db = getDb();

  // 체크인 테이블
  db.execSync(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      mission_id TEXT NOT NULL,
      mission_text TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'undone',
      memo TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 앱 설정 테이블 (행이 1개인 키-값 테이블)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 기본 설정 삽입 (없을 때만)
  const existingSettings = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM settings'
  );
  if (existingSettings && existingSettings.count === 0) {
    _insertDefaultSettings(db);
  }
}

function _insertDefaultSettings(db: SQLite.SQLiteDatabase): void {
  const defaults: Record<string, string> = {
    morningTime: '08:00',
    eveningTime: '21:00',
    selectedCategories: 'all',
    notificationEnabled: 'true',
    streakCount: '0',
    lastCheckinDate: '',
    onboardingDone: 'false',
  };

  for (const [key, value] of Object.entries(defaults)) {
    db.runSync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }
}

// ──────────────────────────────────────────────────────────
// CheckIn CRUD
// ──────────────────────────────────────────────────────────

/** 특정 날짜의 체크인 조회 */
export function getCheckin(date: string): CheckIn | null {
  const db = getDb();
  const row = db.getFirstSync<{
    id: number;
    date: string;
    mission_id: string;
    mission_text: string;
    category: string;
    status: string;
    memo: string | null;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM checkins WHERE date = ?', [date]);

  if (!row) return null;
  return _rowToCheckin(row);
}

/** 체크인 저장 (없으면 생성, 있으면 업데이트) */
export function saveCheckin(
  date: string,
  missionId: string,
  missionText: string,
  category: MissionCategory,
  status: CheckIn['status'],
  memo?: string
): CheckIn {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = getCheckin(date);

  if (existing) {
    // 업데이트
    db.runSync(
      `UPDATE checkins
       SET status = ?, memo = ?, updated_at = ?
       WHERE date = ?`,
      [status, memo ?? null, now, date]
    );
    return { ...existing, status, memo, updatedAt: now };
  } else {
    // 신규 생성
    db.runSync(
      `INSERT INTO checkins (date, mission_id, mission_text, category, status, memo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, missionId, missionText, category, status, memo ?? null, now, now]
    );
    const created = getCheckin(date);
    if (!created) throw new Error('checkin 저장 실패');
    return created;
  }
}

/** 최근 N일 체크인 목록 조회 */
export function getRecentCheckins(days: number = 30): CheckIn[] {
  const db = getDb();
  const rows = db.getAllSync<{
    id: number;
    date: string;
    mission_id: string;
    mission_text: string;
    category: string;
    status: string;
    memo: string | null;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT * FROM checkins ORDER BY date DESC LIMIT ?',
    [days]
  );
  return rows.map(_rowToCheckin);
}

/** 최근 N일간 완료된 미션 ID 목록 (중복 방지용) */
export function getRecentMissionIds(days: number = 7): string[] {
  const db = getDb();
  const cutoff = _dateBeforeDays(days);
  const rows = db.getAllSync<{ mission_id: string }>(
    "SELECT mission_id FROM checkins WHERE date >= ? AND status = 'done'",
    [cutoff]
  );
  return rows.map((r) => r.mission_id);
}

/** 전체 체크인 개수 */
export function getTotalCheckinCount(): number {
  const db = getDb();
  const result = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM checkins WHERE status = 'done'"
  );
  return result?.count ?? 0;
}

// ──────────────────────────────────────────────────────────
// Settings CRUD
// ──────────────────────────────────────────────────────────

/** 전체 설정 조회 */
export function getSettings(): AppSettings {
  const db = getDb();
  const rows = db.getAllSync<{ key: string; value: string }>(
    'SELECT key, value FROM settings'
  );
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return _mapToSettings(map);
}

/** 특정 설정 값 업데이트 */
export function updateSetting(key: keyof AppSettings, value: unknown): void {
  const db = getDb();
  const strValue =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  db.runSync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key as string, strValue]
  );
}

/** 여러 설정 일괄 업데이트 */
export function updateSettings(partial: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(partial)) {
    updateSetting(key as keyof AppSettings, value);
  }
}

// ──────────────────────────────────────────────────────────
// 스트릭 계산
// ──────────────────────────────────────────────────────────

/** 현재 연속 실천 일수 계산 */
export function getStreak(): number {
  const db = getDb();
  const rows = db.getAllSync<{ date: string }>(
    "SELECT date FROM checkins WHERE status = 'done' ORDER BY date DESC"
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  let expectedDate = _today();

  for (const row of rows) {
    if (row.date === expectedDate) {
      streak++;
      expectedDate = _dateBeforeDays(1, expectedDate);
    } else if (row.date < expectedDate) {
      // 오늘 아직 체크인 안 했으면 어제부터 계산
      if (streak === 0 && row.date === _dateBeforeDays(1)) {
        streak++;
        expectedDate = _dateBeforeDays(2);
      } else {
        break;
      }
    }
  }

  return streak;
}

// ──────────────────────────────────────────────────────────
// 내부 헬퍼
// ──────────────────────────────────────────────────────────

function _rowToCheckin(row: {
  id: number;
  date: string;
  mission_id: string;
  mission_text: string;
  category: string;
  status: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
}): CheckIn {
  return {
    id: row.id,
    date: row.date,
    missionId: row.mission_id,
    missionText: row.mission_text,
    category: row.category as MissionCategory,
    status: row.status as CheckIn['status'],
    memo: row.memo ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function _mapToSettings(map: Record<string, string>): AppSettings {
  let selectedCategories: AppSettings['selectedCategories'] = 'all';
  if (map.selectedCategories && map.selectedCategories !== 'all') {
    try {
      selectedCategories = JSON.parse(map.selectedCategories) as MissionCategory[];
    } catch {
      selectedCategories = 'all';
    }
  }

  return {
    morningTime: map.morningTime ?? '08:00',
    eveningTime: map.eveningTime ?? '21:00',
    selectedCategories,
    notificationEnabled: map.notificationEnabled === 'true',
    streakCount: parseInt(map.streakCount ?? '0', 10),
    lastCheckinDate: map.lastCheckinDate || undefined,
    onboardingDone: map.onboardingDone === 'true',
  };
}

/** YYYY-MM-DD 형식의 오늘 날짜 */
function _today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** N일 전 날짜 반환 (기준일 미지정 시 오늘 기준) */
function _dateBeforeDays(days: number, from?: string): string {
  const base = from ? new Date(from) : new Date();
  base.setDate(base.getDate() - days);
  return base.toISOString().slice(0, 10);
}
