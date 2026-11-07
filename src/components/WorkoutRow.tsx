import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Txt } from './ui';
import { colors, radius } from '../theme';
import { Workout } from '../types';
import { fmtDistance, fmtDuration, relativeDay, sportIcon } from '../lib/format';

const SOURCE_LABEL: Record<Workout['source'], string> = {
  apple: 'Apple Watch', strava: 'Strava', garmin: 'Garmin', demo: 'Sample', googleFit: 'Google Fit',
};

export function WorkoutRow({ w, last }: { w: Workout; last?: boolean }) {
  const meta = [fmtDistance(w.distanceM), fmtDuration(w.movingSec), w.avgHr ? `${w.avgHr} bpm` : '']
    .filter(Boolean)
    .join('  ·  ');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.cardHi,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Ionicons name={sportIcon(w.type)} size={20} color={colors.move[0]} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="h2" numberOfLines={1} style={{ fontSize: 16 }}>{w.name}</Txt>
        <Txt v="body" color={colors.muted} style={{ fontSize: 13 }}>{meta}</Txt>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Txt v="body" color={colors.muted} style={{ fontSize: 13 }}>{relativeDay(w.startDate)}</Txt>
        <Txt v="label" color={colors.faint}>{SOURCE_LABEL[w.source]}</Txt>
      </View>
    </View>
  );
}
