/**
 * useStreak — 연속 달성일 계산
 * - 어제부터 역순으로 completed=1인 날이 연속되는 일수
 */
import { useCallback, useEffect, useState } from 'react';
import { getDb } from './use-database';

export function useStreak(dbReady: boolean, todayCompleted: boolean) {
  const [streak, setStreak] = useState(0);

  const calc = useCallback(async () => {
    if (!dbReady) return;
    try {
      // 완료된 모든 날짜 (내림차순)
      const rows = await getDb().getAllAsync<{ date: string }>(
        `SELECT date FROM daily_tasks
         WHERE completed = 1
         ORDER BY date DESC`
      );

      if (rows.length === 0) {
        setStreak(todayCompleted ? 1 : 0);
        return;
      }

      const dates = rows.map((r) => r.date);
      const today = new Date();
      let count = todayCompleted ? 1 : 0;
      let cursor = new Date(today);
      cursor.setDate(cursor.getDate() - 1); // 어제부터 시작

      for (let i = 0; i < dates.length; i++) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const expected = `${y}-${m}-${d}`;
        if (dates[i] === expected) {
          count++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(count);
    } catch (e) {
      console.error('[useStreak] 계산 실패', e);
    }
  }, [dbReady, todayCompleted]);

  useEffect(() => {
    calc();
  }, [calc]);

  return streak;
}
