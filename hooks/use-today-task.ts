/**
 * useTodayTask — 오늘 날짜의 DailyTask CRUD
 * - 앱 포그라운드 복귀 시 날짜 변경 감지 → 자동 리셋
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getDb, DailyTask } from './use-database';

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function fetchOrCreate(date: string): Promise<DailyTask> {
  const db = getDb();
  const existing = await db.getFirstAsync<DailyTask>(
    'SELECT * FROM daily_tasks WHERE date = ?',
    [date]
  );
  if (existing) return existing;

  await db.runAsync(
    'INSERT INTO daily_tasks (date, title, note, completed) VALUES (?, ?, ?, 0)',
    [date, '', '']
  );
  const created = await db.getFirstAsync<DailyTask>(
    'SELECT * FROM daily_tasks WHERE date = ?',
    [date]
  );
  return created!;
}

export function useTodayTask(dbReady: boolean) {
  const [task, setTask] = useState<DailyTask | null>(null);
  const [loading, setLoading] = useState(true);
  const currentDate = useRef(todayString());

  const load = useCallback(async () => {
    if (!dbReady) return;
    try {
      const date = todayString();
      currentDate.current = date;
      const row = await fetchOrCreate(date);
      setTask(row);
    } catch (e) {
      console.error('[useTodayTask] load 실패', e);
    } finally {
      setLoading(false);
    }
  }, [dbReady]);

  // 앱 포그라운드 복귀 시 날짜 체크
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        const now = todayString();
        if (now !== currentDate.current) {
          load();
        }
      }
    });
    return () => sub.remove();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const updateTitle = useCallback(async (title: string) => {
    if (!task) return;
    await getDb().runAsync(
      'UPDATE daily_tasks SET title = ? WHERE id = ?',
      [title, task.id]
    );
    setTask((prev) => prev ? { ...prev, title } : prev);
  }, [task]);

  const updateNote = useCallback(async (note: string) => {
    if (!task) return;
    await getDb().runAsync(
      'UPDATE daily_tasks SET note = ? WHERE id = ?',
      [note, task.id]
    );
    setTask((prev) => prev ? { ...prev, note } : prev);
  }, [task]);

  const toggleComplete = useCallback(async () => {
    if (!task) return;
    const nextCompleted = task.completed === 0 ? 1 : 0;
    const completedAt = nextCompleted === 1
      ? new Date().toISOString()
      : null;
    await getDb().runAsync(
      'UPDATE daily_tasks SET completed = ?, completed_at = ? WHERE id = ?',
      [nextCompleted, completedAt, task.id]
    );
    setTask((prev) => prev
      ? { ...prev, completed: nextCompleted, completed_at: completedAt }
      : prev
    );
  }, [task]);

  return { task, loading, updateTitle, updateNote, toggleComplete, reload: load };
}
