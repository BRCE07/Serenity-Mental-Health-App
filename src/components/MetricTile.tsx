import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Label, Txt } from './ui';
import { Sparkline } from './Sparkline';
import { colors } from '../theme';

export function MetricTile({
  icon, label, value, unit, tint, series,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit?: string;
  tint: string;
  series?: number[];
}) {
  return (
    <Card style={{ flex: 1, minWidth: '46%', gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={icon} size={16} color={tint} />
        <Label>{label}</Label>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Txt v="value">{value}</Txt>
        {unit ? <Txt v="body" color={colors.muted}>{unit}</Txt> : null}
      </View>
      <View style={{ height: 36 }}>{series ? <Sparkline data={series} width={120} height={36} color={tint} /> : null}</View>
    </Card>
  );
}
