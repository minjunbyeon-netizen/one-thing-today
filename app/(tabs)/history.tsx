// ============================================================
// 오늘 하나 — 히스토리 (캘린더 뷰)
// ============================================================

import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/src/constants/colors';
import { FontSize } from '@/src/constants/typography';
import { CATEGORY_LABELS } from '@/src/types';
import type { CheckIn } from '@/src/types';
import { getCheckinsByMonth } from '@/src/utils/database';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function toDayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const grid: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  // 6행 완성을 위해 패딩
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

function formatKoDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const dow = WEEKDAYS[new Date(dateStr).getDay()];
  return `${m}월 ${d}일 ${dow}요일`;
}

export default function HistoryScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [checkinMap, setCheckinMap] = useState<Record<string, CheckIn>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const today = now.toISOString().slice(0, 10);

  useFocusEffect(
    useCallback(() => {
      loadMonth(viewYear, viewMonth);
    }, [viewYear, viewMonth])
  );

  function loadMonth(year: number, month: number) {
    const list = getCheckinsByMonth(toYearMonth(year, month));
    const map: Record<string, CheckIn> = {};
    for (const c of list) map[c.date] = c;
    setCheckinMap(map);
    setSelected(null);
  }

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
    const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
    // 미래 달은 이동 불가
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth() + 1)) return;
    setViewYear(nextY); setViewMonth(nextM);
  }

  const isNextDisabled =
    viewYear > now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth >= now.getMonth() + 1);

  const grid = buildCalendarGrid(viewYear, viewMonth);
  const selectedCheckin = selected ? checkinMap[selected] : null;

  // 이번 달 통계
  const monthCheckins = Object.values(checkinMap);
  const doneCount = monthCheckins.filter(c => c.status === 'done').length;
  const totalCount = monthCheckins.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>기록</Text>
          {totalCount > 0 && (
            <Text style={styles.headerStat}>
              이번 달 {doneCount}/{totalCount} 완료
            </Text>
          )}
        </View>

        {/* 월 네비게이션 */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={8}>
            <Feather name="chevron-left" size={22} color={Colors.label} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {viewYear}년 {viewMonth}월
          </Text>
          <Pressable
            onPress={nextMonth}
            style={[styles.navBtn, isNextDisabled && styles.navBtnDisabled]}
            hitSlop={8}
            disabled={isNextDisabled}
          >
            <Feather name="chevron-right" size={22} color={isNextDisabled ? Colors.disabled : Colors.label} />
          </Pressable>
        </View>

        {/* 캘린더 */}
        <View style={styles.calendar}>
          {/* 요일 헤더 */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <Text
                key={d}
                style={[
                  styles.weekdayLabel,
                  i === 0 && styles.sundayLabel,
                  i === 6 && styles.saturdayLabel,
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* 날짜 그리드 */}
          {Array.from({ length: grid.length / 7 }, (_, week) => (
            <View key={week} style={styles.weekRow}>
              {grid.slice(week * 7, week * 7 + 7).map((day, idx) => {
                if (!day) return <View key={idx} style={styles.dayCell} />;
                const dateKey = toDayKey(viewYear, viewMonth, day);
                const checkin = checkinMap[dateKey];
                const isToday = dateKey === today;
                const isSelected = dateKey === selected;
                const isFuture = dateKey > today;

                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.dayCell,
                      isToday && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                      pressed && !isFuture && styles.dayCellPressed,
                    ]}
                    onPress={() => !isFuture && setSelected(isSelected ? null : dateKey)}
                    disabled={isFuture}
                  >
                    <Text
                      style={[
                        styles.dayNum,
                        idx === 0 && styles.sundayNum,
                        idx === 6 && styles.saturdayNum,
                        isFuture && styles.dayNumFuture,
                        isSelected && styles.dayNumSelected,
                        isToday && !isSelected && styles.dayNumToday,
                      ]}
                    >
                      {day}
                    </Text>
                    {/* 상태 점 */}
                    {checkin && (
                      <View
                        style={[
                          styles.statusDot,
                          checkin.status === 'done'
                            ? styles.dotDone
                            : styles.dotUndone,
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotDone]} />
            <Text style={styles.legendText}>완료</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotUndone]} />
            <Text style={styles.legendText}>미완료</Text>
          </View>
        </View>

        {/* 선택된 날짜 상세 */}
        {selected && (
          <View style={styles.detailCard}>
            <Text style={styles.detailDate}>{formatKoDate(selected)}</Text>
            {selectedCheckin ? (
              <>
                {/* 카테고리 + 상태 */}
                <View style={styles.detailMeta}>
                  <View
                    style={[
                      styles.categoryChip,
                      { backgroundColor: Colors.categoryBg[selectedCheckin.category] },
                    ]}
                  >
                    <Text style={[styles.categoryChipText, { color: Colors.categories[selectedCheckin.category] }]}>
                      {CATEGORY_LABELS[selectedCheckin.category]}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Feather
                      name={selectedCheckin.status === 'done' ? 'check-circle' : 'circle'}
                      size={13}
                      color={selectedCheckin.status === 'done' ? Colors.success : Colors.disabled}
                    />
                    <Text style={[
                      styles.statusText,
                      { color: selectedCheckin.status === 'done' ? Colors.success : Colors.disabled },
                    ]}>
                      {selectedCheckin.status === 'done' ? '완료' : '미완료'}
                    </Text>
                  </View>
                </View>
                {/* 미션 텍스트 */}
                <Text style={styles.detailMission}>{selectedCheckin.missionText}</Text>
                {/* 메모 */}
                {selectedCheckin.memo ? (
                  <Text style={styles.detailMemo}>"{selectedCheckin.memo}"</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.detailEmpty}>기록이 없는 날이에요.</Text>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  screenTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  headerStat: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  // 월 네비게이션
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  monthTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.label,
    letterSpacing: -0.3,
  },

  // 캘린더
  calendar: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingVertical: 10,
  },
  sundayLabel: { color: Colors.fail },
  saturdayLabel: { color: Colors.accent },

  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 8,
    margin: 1,
  },
  dayCellToday: {
    backgroundColor: Colors.background,
  },
  dayCellSelected: {
    backgroundColor: Colors.accent,
  },
  dayCellPressed: { opacity: 0.7 },

  dayNum: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: Colors.label,
  },
  sundayNum: { color: Colors.fail },
  saturdayNum: { color: Colors.accent },
  dayNumFuture: { color: Colors.disabled },
  dayNumSelected: { color: Colors.white, fontWeight: '600' },
  dayNumToday: { fontWeight: '700' },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotDone: { backgroundColor: Colors.success },
  dotUndone: { backgroundColor: Colors.separator },

  // 범례
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // 상세 카드
  detailCard: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 12,
  },
  detailDate: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.label,
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  detailMission: {
    fontSize: FontSize.base,
    color: Colors.label,
    lineHeight: FontSize.base * 1.55,
  },
  detailMemo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  detailEmpty: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
});
