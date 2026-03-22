<<<<<<< HEAD
/**
 * modal.tsx — 미사용 fallback (premium 모달은 /modal/premium 사용)
 * 직접 접근 시 홈으로 리다이렉트
 */
import { Redirect } from 'expo-router';

export default function ModalFallback() {
  return <Redirect href="/(tabs)" />;
}
=======
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
>>>>>>> 81e4fa17891f5698fdcc40dace9599ffcd69b235
