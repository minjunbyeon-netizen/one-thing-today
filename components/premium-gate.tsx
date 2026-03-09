/**
 * PremiumGate — 프리미엄 잠금 컴포넌트
 * 프리미엄 기능에 씌우는 게이트
 */
import React, { ReactNode } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  isPremium: boolean;
  children: ReactNode;
  onUpgradePress: () => void;
  featureName?: string;
};

export function PremiumGate({ isPremium, children, onUpgradePress, featureName }: Props) {
  if (isPremium) return <>{children}</>;

  return (
    <View style={styles.wrapper}>
      <View style={styles.blurred} pointerEvents="none">
        {children}
      </View>
      <ThemedView style={styles.overlay}>
        <ThemedText style={styles.lock}>{'🔒'}</ThemedText>
        <ThemedText style={styles.title}>
          {featureName ? `${featureName}은\n프리미엄 기능입니다` : '프리미엄 기능'}
        </ThemedText>
        <Pressable style={styles.button} onPress={onUpgradePress}>
          <ThemedText style={styles.buttonText}>{'프리미엄 업그레이드'}</ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  blurred: {
    opacity: 0.15,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
  },
  lock: {
    fontSize: 32,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
