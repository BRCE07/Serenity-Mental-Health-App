import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Button, Header, Pill } from '../../src/components/controls';
import { BREATH_PATTERNS, BreathPattern, STRATEGIES, Strategy } from '../../src/mind/content';
import { colors, radius } from '../../src/theme';

function Breathing({ pattern }: { pattern: BreathPattern }) {
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const scale = useRef(new Animated.Value(0.55)).current;

  // Reset when the pattern changes
  useEffect(() => {
    setRunning(false);
    setIdx(0);
  }, [pattern.id]);

  useEffect(() => {
    if (!running) {
      Animated.timing(scale, { toValue: 0.55, duration: 400, useNativeDriver: true }).start();
      return;
    }
    const phase = pattern.phases[idx % pattern.phases.length];
    Animated.timing(scale, {
      toValue: phase.scale,
      duration: phase.sec * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    const t = setTimeout(() => setIdx((i) => (i + 1) % pattern.phases.length), phase.sec * 1000);
    return () => clearTimeout(t);
  }, [running, idx, pattern, scale]);

  const phase = pattern.phases[idx % pattern.phases.length];

  return (
    <View style={{ alignItems: 'center', gap: 20 }}>
      <View style={{ width: 240, height: 240, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute', width: 240, height: 240, borderRadius: 120,
            backgroundColor: colors.heart[1], opacity: 0.18, transform: [{ scale }],
          }}
        />
        <Animated.View
          style={{
            width: 170, height: 170, borderRadius: 85, backgroundColor: colors.recover[0], opacity: 0.9,
            transform: [{ scale }], alignItems: 'center', justifyContent: 'center',
          }}
        />
        <View style={{ position: 'absolute' }}>
          <Txt v="h2" color={colors.bg} style={{ fontSize: 22 }}>{running ? phase.label : 'Ready'}</Txt>
        </View>
      </View>
      <Button
        label={running ? 'Stop' : 'Start'}
        icon={running ? 'stop' : 'play'}
        onPress={() => { setIdx(0); setRunning((r) => !r); }}
        style={{ alignSelf: 'stretch' }}
      />
    </View>
  );
}

function StrategyCard({ s }: { s: Strategy }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((o) => !o)}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.cardHi,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name={s.icon} size={20} color={colors.heart[0]} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="h2" style={{ fontSize: 16 }}>{s.title}</Txt>
            <Txt color={colors.muted} style={{ fontSize: 13 }}>{s.minutes} min</Txt>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
        </View>
        {open && (
          <View style={{ gap: 10 }}>
            <Txt color={colors.muted} style={{ fontSize: 14 }}>{s.intro}</Txt>
            {s.steps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                <Txt color={colors.accent} style={{ fontWeight: '700', width: 18 }}>{i + 1}</Txt>
                <Txt style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{step}</Txt>
              </View>
            ))}
            {s.id === 'dump' && (
              <Button label="Open journal" icon="book" variant="secondary" onPress={() => router.push('/mind/journal')} />
            )}
            {s.id === 'reach' && (
              <Button label="My support contacts" icon="people" variant="secondary" onPress={() => router.push('/mind/help')} />
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export default function Coping() {
  const [pattern, setPattern] = useState(BREATH_PATTERNS[0]);

  return (
    <Screen>
      <Header title="Calm down" subtitle="Tools for stress, worry and overwhelm." />

      <Card style={{ gap: 18 }}>
        <Txt v="h2">Guided breathing</Txt>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {BREATH_PATTERNS.map((p) => (
            <Pill key={p.id} label={p.name} selected={p.id === pattern.id} onPress={() => setPattern(p)} />
          ))}
        </View>
        <Txt color={colors.muted} style={{ fontSize: 13 }}>{pattern.sub}</Txt>
        <Breathing pattern={pattern} />
      </Card>

      <Label>Coping strategies</Label>
      {STRATEGIES.map((s) => (
        <StrategyCard key={s.id} s={s} />
      ))}
    </Screen>
  );
}
