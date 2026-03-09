/**
 * useHistory — 날짜별 달성 기록 조회
 * - 무료: 최근 7일만
 * - 프리미엄: 무제한
 */
import { useCallback, useEffect, useState } from 'react';
import { getDb, HistoryRow } from './use-database';

export type HistoryItem = HistoryRow & { isLocked: boolean };

export function useHistory(dbReady: boolean, isPremium: boolean) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!dbReady) return;
    try {
      // 오늘 제외한 최근 90일 데이터 (title이 있는 것만)
      const rows = await getDb().getAllAsync<HistoryRow>(
        `SELECT * FROM daily_tasks
         WHERE date < date('now','localtime')
           AND title != ''
         ORDER BY date DESC
         LIMIT 90`
      );

      const FREE_LIMIT = 7;
      const items: HistoryItem[] = rows.map((row, idx) => ({
        ...row,
        isLocked: !isPremium && idx >= FREE_LIMIT,
      }));
      setHistory(items);
    } catch (e) {
      console.error('[useHistory] load 실패', e);
    } finally {
      setLoading(false);
    }
  }, [dbReady, isPremium]);

  useEffect(() => {
    load();
  }, [load]);

  return { history, loading, reload: load };
}
