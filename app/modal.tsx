/**
 * modal.tsx — 미사용 fallback (premium 모달은 /modal/premium 사용)
 * 직접 접근 시 홈으로 리다이렉트
 */
import { Redirect } from 'expo-router';

export default function ModalFallback() {
  return <Redirect href="/(tabs)" />;
}
