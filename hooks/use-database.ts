/**
 * useDatabase — SQLite DB 초기화 및 공통 쿼리 유틸
 * expo-sqlite v15(Expo 54) API 사용
 */
import * as SQLite from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

export type DailyTask = {
  id: number;
  date: string;          // YYYY-MM-DD
  title: string;
  note: string;
  completed: number;     // 0 | 1
  completed_at: string | null;
  created_at: string;
};

export type HistoryRow = DailyTask;

const DB_NAME = 'one_thing.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      date         TEXT    NOT NULL UNIQUE,
      title        TEXT    NOT NULL DEFAULT '',
      note         TEXT    NOT NULL DEFAULT '',
      completed    INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function useDatabaseReady(): boolean {
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initDb()
      .then(() => setReady(true))
      .catch((e) => console.error('[DB] 초기화 실패', e));
  }, []);

  return ready;
}
