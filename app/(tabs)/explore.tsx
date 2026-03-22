<<<<<<< HEAD
/**
 * explore.tsx — 히스토리 화면으로 리다이렉트
 * (기존 탭 파일 유지, 탭 레이아웃에서 제거됨)
 */
import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/(tabs)/history" />;
=======
// 더 이상 사용하지 않는 화면 — 홈으로 리다이렉트
import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/(tabs)" />;
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
}
