// ============================================================
// 오늘 하나 — 스트릭 격려 문구
// 스트릭 숫자에 따라 동적으로 반환
// ============================================================

export function getStreakMessage(streak: number): string {
  if (streak >= 30) return '한 달, 당신은 해냈습니다';
  if (streak >= 14) return '2주를 달려왔어요';
  if (streak >= 7) return '일주일을 해냈어요';
  if (streak >= 3) return `${streak}일째 이어가고 있어요`;
  if (streak === 2) return '이틀 연속이에요';
  if (streak === 1) return '첫 번째 약속을 지켰어요';
  return '오늘도 지켰어요';
}
