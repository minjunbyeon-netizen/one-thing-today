/**
 * explore.tsx — 히스토리 화면으로 리다이렉트
 * (기존 탭 파일 유지, 탭 레이아웃에서 제거됨)
 */
import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/(tabs)/history" />;
}
