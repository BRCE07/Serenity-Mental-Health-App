import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { WorkoutRow } from '../../src/components/WorkoutRow';
import { useHealth } from '../../src/state/HealthContext';
import { fmtNumber, lastSevenDayLabels } from '../../src/lib/format';
import { colors } from '../../src/theme';

export default function Activity() {
  const { summary: s, workouts } = useHealth();
  const days = lastSevenDayLabels();
  const max = Math.max(s.stepsGoal, ...s.weekSteps);
  const avg = s.weekSteps.reduce((a, b) => a + b, 0) / s.weekSteps.length;

  return (
    <Screen>
      <Txt v="title">Activity</Txt>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <Label>Daily average</Label>
            <Txt v="value" style={{ fontSize: 24 }}>{fmtNumber(avg)} <Txt v="body" color={colors.muted}>steps</Txt></Txt>
          </View>
          <Label>Goal {fmtNumber(s.stepsGoal)}</Label>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, width: '100%' }}>
          {s.weekSteps.map((v, i) => {
            const isToday = i === s.weekSteps.length - 1;
            const h = Math.max(8, (v / max) * 120);
            return (
              <View key={i} style={{ alignItems: 'center', gap: 8, flex: 1 }}>
                <LinearGradient
                  colors={isToday ? colors.move : [colors.cardHi, colors.track]}
                  style={{ width: 22, height: h, borderRadius: 11 }}
                />
                <Label color={isToday ? colors.text : colors.faint}>{days[i]}</Label>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 10 }}>
          <Label>Active</Label>
          <Txt v="value" style={{ fontSize: 24 }}>{s.activeMinutes}<Txt v="body" color={colors.muted}> / {s.activeGoal} min</Txt></Txt>
        </Card>
        <Card style={{ flex: 1, gap: 10 }}>
          <Label>Energy</Label>
          <Txt v="value" style={{ fontSize: 24 }}>{fmtNumber(s.calories)}<Txt v="body" color={colors.muted}> kcal</Txt></Txt>
        </Card>
      </View>

      <Card style={{ paddingBottom: 6 }}>
        <Txt v="h2">Workouts</Txt>
        {workouts.length === 0 ? (
          <Txt color={colors.muted} style={{ paddingVertical: 16 }}>No workouts found yet.</Txt>
        ) : (
          workouts.map((w, i) => <WorkoutRow key={w.id} w={w} last={i === workouts.length - 1} />)
        )}
      </Card>
    </Screen>
  );
}
