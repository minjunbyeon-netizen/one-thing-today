// 더 이상 사용하지 않는 화면 — 홈으로 리다이렉트
import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/(tabs)" />;
}
