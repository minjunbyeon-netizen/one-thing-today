/**
 * CheckButton — 완료 체크 애니메이션 버튼
 * Reanimated 4.x + expo-haptics
 */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Props = {
  completed: boolean;
  onToggle: () => void;
  size?: number;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export function CheckButton({ completed, onToggle, size = 64 }: Props) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(completed ? 1 : 0, { damping: 15, stiffness: 120 });
  }, [completed]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', '#4CAF50']
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#CCCCCC', '#4CAF50']
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const handlePress = async () => {
    scale.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    await Haptics.impactAsync(
      completed
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Heavy
    );
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} accessibilityRole="checkbox" accessibilityState={{ checked: completed }}>
      <AnimatedView
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          animStyle,
        ]}
      >
        <AnimatedText style={[styles.check, checkStyle]}>
          {'✓'}
        </AnimatedText>
      </AnimatedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
