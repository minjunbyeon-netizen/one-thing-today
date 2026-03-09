/**
 * StreakBadge — 연속 달성일 표시 배지
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type Props = {
  streak: number;
  size?: 'small' | 'medium' | 'large';
};

export function StreakBadge({ streak, size = 'medium' }: Props) {
  const fontSize = size === 'small' ? 18 : size === 'large' ? 36 : 24;
  const labelSize = size === 'small' ? 10 : size === 'large' ? 14 : 12;

  if (streak === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.fire, { fontSize: fontSize + 4 }]}>
        {'🔥'}
      </ThemedText>
      <ThemedText style={[styles.count, { fontSize }]}>
        {streak}
      </ThemedText>
      <ThemedText style={[styles.label, { fontSize: labelSize }]}>
        {'일 연속'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fire: {
    lineHeight: 32,
  },
  count: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  label: {
    color: '#888888',
    marginTop: 2,
  },
});
