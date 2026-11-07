import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Header, SwitchRow } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { ensurePermission } from '../../src/mind/notifications';
import { noteForDay } from '../../src/mind/content';
import { ReminderSettings, TimedReminder } from '../../src/mind/types';
import { colors, radius } from '../../src/theme';

type Key = keyof ReminderSettings;

const ROWS: { key: Key; label: string; sub: string }[] = [
  { key: 'checkin', label: 'Mood check-in', sub: 'A daily nudge to log how you feel' },
  { key: 'journal', label: 'Journal moment', sub: 'A quiet reminder to write a few lines' },
  { key: 'motivation', label: 'Motivational note', sub: 'A different kind word each day' },
];

const fmt = (h: number, m: number) => {
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const shift = (r: TimedReminder, mins: number): TimedReminder => {
  const total = (r.h * 60 + r.m + mins + 1440) % 1440;
  return { ...r, h: Math.floor(total / 60), m: total % 60 };
};

export default function Reminders() {
  const { data, setReminders } = useMind();
  const [busy, setBusy] = useState(false);
  const r = data.reminders;

  const update = async (key: Key, next: TimedReminder) => {
    if (busy) return;
    setBusy(true);
    try {
      if (next.on && !r[key].on) {
        const ok = await ensurePermission();
        if (!ok) {
          Alert.alert('Notifications are off', 'Allow notifications for Lumen in your device settings to receive reminders.');
          return;
        }
      }
      await setReminders({ ...r, [key]: next });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Reminders" subtitle="Gentle nudges, never pushy. Off by default." />

      <Card style={{ gap: 8 }}>
        <Label>Today's note</Label>
        <Txt v="h2" style={{ fontSize: 20, lineHeight: 28 }}>{noteForDay()}</Txt>
      </Card>

      {ROWS.map((row) => {
        const t = r[row.key];
        return (
          <Card key={row.key} style={{ gap: 16 }}>
            <SwitchRow label={row.label} sub={row.sub} value={t.on} onValueChange={(on) => update(row.key, { ...t, on })} />
            {t.on && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Label>Time</Label>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Stepper icon="remove" onPress={() => update(row.key, shift(t, -30))} />
                  <Txt v="h2" style={{ minWidth: 78, textAlign: 'center' }}>{fmt(t.h, t.m)}</Txt>
                  <Stepper icon="add" onPress={() => update(row.key, shift(t, 30))} />
                </View>
              </View>
            )}
          </Card>
        );
      })}

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        Motivational notes are scheduled for the next two weeks and refresh each time you open Lumen.
      </Txt>
    </Screen>
  );
}

function Stepper({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={{
        width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.cardHi,
        borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}
