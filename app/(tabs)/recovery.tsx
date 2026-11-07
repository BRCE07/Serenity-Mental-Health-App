import React from 'react';
import { View, Dimensions } from 'react-native';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Sparkline } from '../../src/components/Sparkline';
import { useHealth } from '../../src/state/HealthContext';
import { fmtMinutes } from '../../src/lib/format';
import { colors, radius } from '../../src/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const hrSparklineWidth = Math.min(300, SCREEN_W - 48);

export default function Recovery() {
  const { summary: s } = useHealth();
  const st = s.sleepStages;
  const total = st.deep + st.core + st.rem + st.awake || 1;
  const parts = [
    { key: 'Deep', min: st.deep, color: colors.recover[1] },
    { key: 'Core', min: st.core, color: colors.recover[0] },
    { key: 'REM', min: st.rem, color: colors.heart[0] },
    { key: 'Awake', min: st.awake, color: colors.move[0] },
  ];

  return (
    <Screen>
      <Txt v="title">Recovery</Txt>

      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <Label>Last night</Label>
            <Txt v="value" style={{ fontSize: 24 }}>{fmtMinutes(s.sleepMinutes)}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Label>Sleep score</Label>
            <Txt v="value" style={{ fontSize: 24 }} color={colors.recover[0]}>{s.sleepScore}</Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', height: 14, borderRadius: radius.pill, overflow: 'hidden', gap: 2 }}>
          {parts.map((p) => (
            <View key={p.key} style={{ flex: p.min / total, backgroundColor: p.color }} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {parts.map((p) => (
            <View key={p.key} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color }} />
                <Label>{p.key}</Label>
              </View>
              <Txt v="h2" style={{ fontSize: 16 }}>{fmtMinutes(p.min)}</Txt>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <Label>Heart rate today</Label>
        <Txt v="value" style={{ fontSize: 24 }}>
          {s.hrToday.length ? Math.min(...s.hrToday) : '--'}–{s.hrToday.length ? Math.max(...s.hrToday) : '--'}
          <Txt v="body" color={colors.muted}> bpm</Txt>
        </Txt>
        <Sparkline data={s.hrToday} width={hrSparklineWidth} height={80} color={colors.heart[0]} dot={false} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Card style={{ flex: 1, gap: 10 }}>
          <Label>HRV</Label>
          <Txt v="value" style={{ fontSize: 24 }}>{s.hrv}<Txt v="body" color={colors.muted}> ms</Txt></Txt>
          <Sparkline data={s.weekHrv} width={110} height={34} color={colors.heart[0]} />
        </Card>
        <Card style={{ flex: 1, gap: 10 }}>
          <Label>Resting HR</Label>
          <Txt v="value" style={{ fontSize: 24 }}>{s.restingHr}<Txt v="body" color={colors.muted}> bpm</Txt></Txt>
          <Sparkline data={s.weekRhr} width={110} height={34} color={colors.heart[0]} />
        </Card>
      </View>
    </Screen>
  );
}
