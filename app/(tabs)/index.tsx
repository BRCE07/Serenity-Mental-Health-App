import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMind } from '../../src/state/MindContext';
import { MOODS } from '../../src/mind/content';
import { Card, Chip, Label, Screen, Txt } from '../../src/components/ui';
import { Rings } from '../../src/components/Rings';
import { MetricTile } from '../../src/components/MetricTile';
import { WorkoutRow } from '../../src/components/WorkoutRow';
import { useHealth } from '../../src/state/HealthContext';
import { computeScores, insight } from '../../src/lib/score';
import { fmtMinutes, fmtNumber, greeting } from '../../src/lib/format';
import { colors } from '../../src/theme';

export default function Today() {
  const { summary: s, workouts, isDemo, refresh } = useHealth();
  const { todayMood } = useMind();
  const [refreshing, setRefreshing] = useState(false);
  const sc = computeScores(s, todayMood);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ gap: 6 }}>
        <Label>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Label>
        <Txt v="title">{greeting()}</Txt>
      </View>

      {isDemo && (
        <Chip color={colors.warn}>Sample data · connect a source in Sources</Chip>
      )}

      <Card style={{ alignItems: 'center', gap: 20, paddingVertical: 28 }}>
        <Rings
          rings={[
            { value: sc.move, colors: colors.move },
            { value: sc.recover, colors: colors.recover },
            { value: sc.heart, colors: colors.heart },
          ]}
        >
          <Txt v="hero">{sc.balance}</Txt>
          <Label>Balance</Label>
        </Rings>

        <View style={{ flexDirection: 'row', gap: 22 }}>
          <Legend color={colors.move[0]} label="Move" pct={sc.move} />
          <Legend color={colors.recover[0]} label="Recover" pct={sc.recover} />
          <Legend color={colors.heart[0]} label="Heart" pct={sc.heart} />
        </View>

        <Txt v="body" color={colors.muted} style={{ textAlign: 'center', paddingHorizontal: 8 }}>
          {insight(sc, todayMood)}
        </Txt>
      </Card>

      <Pressable onPress={() => router.push('/mind/mood')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardHi,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons
              name={todayMood ? MOODS[todayMood - 1].icon : 'add'}
              size={22}
              color={todayMood ? MOODS[todayMood - 1].color : colors.text}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Txt v="h2" style={{ fontSize: 16 }}>
              {todayMood ? `Feeling ${MOODS[todayMood - 1].label.toLowerCase()} today` : 'How are you feeling?'}
            </Txt>
            <Txt color={colors.muted} style={{ fontSize: 13 }}>
              {todayMood ? 'Tap to add another check-in' : 'A 10-second mood check-in'}
            </Txt>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.faint} />
        </Card>
      </Pressable>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <MetricTile icon="footsteps" label="Steps" value={fmtNumber(s.steps)} tint={colors.move[0]} series={s.weekSteps} />
        <MetricTile icon="moon" label="Sleep" value={fmtMinutes(s.sleepMinutes)} tint={colors.recover[0]} />
        <MetricTile icon="heart" label="Resting HR" value={String(s.restingHr)} unit="bpm" tint={colors.heart[0]} series={s.weekRhr} />
        <MetricTile icon="pulse" label="HRV" value={String(s.hrv)} unit="ms" tint={colors.heart[0]} series={s.weekHrv} />
      </View>

      <Card style={{ paddingBottom: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt v="h2">Recent workouts</Txt>
          <Pressable onPress={() => router.push('/activity')} hitSlop={10}>
            <Txt v="body" color={colors.accent} style={{ fontSize: 14 }}>See all</Txt>
          </Pressable>
        </View>
        {workouts.length === 0 ? (
          <Txt color={colors.muted} style={{ paddingVertical: 16 }}>No workouts yet.</Txt>
        ) : (
          workouts.slice(0, 3).map((w, i, arr) => <WorkoutRow key={w.id} w={w} last={i === arr.length - 1} />)
        )}
      </Card>
    </Screen>
  );
}

function Legend({ color, label, pct }: { color: string; label: string; pct: number }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Label>{label}</Label>
      </View>
      <Txt v="h2">{Math.round(Math.min(pct, 1) * 100)}%</Txt>
    </View>
  );
}
