import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RingSpec {
  value: number; // 0..1
  colors: [string, string];
}

/** Concentric animated progress rings with centered content. */
export function Rings({
  rings, size = 260, stroke = 16, gap = 9, children,
}: {
  rings: RingSpec[]; size?: number; stroke?: number; gap?: number; children?: React.ReactNode;
}) {
  const progress = useRef(rings.map(() => new Animated.Value(0))).current;
  const key = rings.map((r) => r.value.toFixed(3)).join('|');

  useEffect(() => {
    Animated.stagger(
      130,
      rings.map((r, i) =>
        Animated.timing(progress[i], {
          toValue: Math.min(1, Math.max(0, r.value)),
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const c = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          {rings.map((r, i) => (
            <LinearGradient key={i} id={`ring${i}`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={r.colors[0]} />
              <Stop offset="1" stopColor={r.colors[1]} />
            </LinearGradient>
          ))}
        </Defs>
        {rings.map((_, i) => {
          const radius = (size - stroke) / 2 - i * (stroke + gap);
          const circ = 2 * Math.PI * radius;
          return (
            <React.Fragment key={i}>
              <Circle cx={c} cy={c} r={radius} stroke={colors.track} strokeWidth={stroke} fill="none" />
              <AnimatedCircle
                cx={c}
                cy={c}
                r={radius}
                stroke={`url(#ring${i})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${circ}`}
                strokeDashoffset={progress[i].interpolate({ inputRange: [0, 1], outputRange: [circ, 0] })}
                rotation={-90}
                origin={`${c}, ${c}`}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      {children}
    </View>
  );
}
