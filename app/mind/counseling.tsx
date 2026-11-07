import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Chip, Label, Screen, Txt } from '../../src/components/ui';
import { Button, Field, Header, Pill } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { COUNSELORS, Counselor, SPECIALTIES, slotsFor } from '../../src/mind/content';
import { SessionMode } from '../../src/mind/types';
import { colors, radius } from '../../src/theme';

const MODE_LABEL: Record<SessionMode, string> = { video: 'Video', chat: 'Chat', 'in-person': 'In person' };
const MODE_ICON: Record<SessionMode, keyof typeof Ionicons.glyphMap> = {
  video: 'videocam', chat: 'chatbubble', 'in-person': 'location',
};

const fmtSlot = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export default function Counseling() {
  const { data, addBooking, cancelBooking } = useMind();
  const [filter, setFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Counselor | null>(null);

  const list = useMemo(
    () => (filter ? COUNSELORS.filter((c) => c.specialties.includes(filter)) : COUNSELORS),
    [filter],
  );
  const upcoming = [...data.bookings].sort((a, b) => +new Date(a.startISO) - +new Date(b.startISO));

  if (selected) {
    return (
      <BookingForm
        counselor={selected}
        taken={data.bookings.map((b) => `${b.counselorId}|${b.startISO}`)}
        onBack={() => setSelected(null)}
        onConfirm={(startISO, mode, note) => {
          addBooking({ counselorId: selected.id, startISO, mode, note });
          setSelected(null);
          Alert.alert('Session requested', `${selected.name} · ${fmtDay(new Date(startISO))} at ${fmtSlot(new Date(startISO))}`);
        }}
      />
    );
  }

  return (
    <Screen>
      <Header title="Talk to someone" subtitle="Book a confidential session with a licensed professional." />

      <Chip color={colors.warn}>Sample directory · fictional profiles</Chip>

      {upcoming.length > 0 && (
        <View style={{ gap: 12 }}>
          <Label>My sessions</Label>
          {upcoming.map((b) => {
            const c = COUNSELORS.find((x) => x.id === b.counselorId);
            const d = new Date(b.startISO);
            return (
              <Card key={b.id} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name={MODE_ICON[b.mode]} size={20} color={colors.heart[0]} />
                  <View style={{ flex: 1 }}>
                    <Txt v="h2" style={{ fontSize: 16 }}>{c?.name ?? 'Counselor'}</Txt>
                    <Txt color={colors.muted} style={{ fontSize: 13 }}>
                      {fmtDay(d)} · {fmtSlot(d)} · {MODE_LABEL[b.mode]}
                    </Txt>
                  </View>
                  <Chip color={colors.good}>Requested</Chip>
                </View>
                <Pressable onPress={() => cancelBooking(b.id)}>
                  <Txt color={colors.muted} style={{ fontSize: 13 }}>Cancel session</Txt>
                </Pressable>
              </Card>
            );
          })}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pill label="All" selected={!filter} onPress={() => setFilter(null)} />
        {SPECIALTIES.map((s) => (
          <Pill key={s} label={s} selected={filter === s} onPress={() => setFilter(filter === s ? null : s)} />
        ))}
      </ScrollView>

      {list.map((c) => (
        <Pressable key={c.id} onPress={() => setSelected(c)}>
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 52, height: 52, borderRadius: 26, backgroundColor: colors.cardHi,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Txt v="h2">{c.name.replace('Dr. ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt v="h2" style={{ fontSize: 17 }}>{c.name}</Txt>
                <Txt color={colors.muted} style={{ fontSize: 13 }}>{c.title} · {c.years} yrs</Txt>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {c.specialties.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </View>
          </Card>
        </Pressable>
      ))}

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        Bookings are saved on this device as requests. Connect a scheduling backend to confirm real appointments.
      </Txt>
    </Screen>
  );
}

function BookingForm({
  counselor, taken, onBack, onConfirm,
}: {
  counselor: Counselor;
  taken: string[];
  onBack: () => void;
  onConfirm: (startISO: string, mode: SessionMode, note?: string) => void;
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode>(counselor.modes[0]);
  const [note, setNote] = useState('');

  const days = Array.from({ length: 7 }, (_, i) => i);
  const slots = slotsFor(counselor.id, dayOffset).filter((d) => !taken.includes(`${counselor.id}|${d.toISOString()}`));

  return (
    <Screen>
      <Pressable onPress={onBack} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
        <Ionicons name="chevron-back" size={20} color={colors.muted} />
        <Txt color={colors.muted}>All counselors</Txt>
      </Pressable>

      <View style={{ gap: 4 }}>
        <Txt v="title">{counselor.name}</Txt>
        <Txt color={colors.muted}>{counselor.title} · {counselor.languages.join(', ')}</Txt>
      </View>
      <Txt color={colors.muted} style={{ lineHeight: 22 }}>{counselor.bio}</Txt>

      <Card style={{ gap: 16 }}>
        <Label>Choose a day</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {days.map((i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            return (
              <Pill
                key={i}
                label={i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                selected={dayOffset === i}
                onPress={() => { setDayOffset(i); setSlot(null); }}
              />
            );
          })}
        </ScrollView>

        <Label>Choose a time</Label>
        {slots.length === 0 ? (
          <Txt color={colors.muted} style={{ fontSize: 14 }}>No openings this day. Try another.</Txt>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {slots.map((d) => (
              <Pill key={d.toISOString()} label={fmtSlot(d)} selected={slot === d.toISOString()} onPress={() => setSlot(d.toISOString())} color={colors.heart[0]} />
            ))}
          </View>
        )}

        <Label>Session type</Label>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {counselor.modes.map((m) => (
            <Pill key={m} label={MODE_LABEL[m]} selected={mode === m} onPress={() => setMode(m)} color={colors.recover[0]} />
          ))}
        </View>

        <Field value={note} onChangeText={setNote} placeholder="Anything you'd like them to know? (optional)" multiline minHeight={80} />
      </Card>

      <Button label="Request session" onPress={() => slot && onConfirm(slot, mode, note.trim() || undefined)} disabled={!slot} />
      <Txt color={colors.faint} style={{ fontSize: 12, textAlign: 'center' }}>
        If you are in crisis, do not wait for an appointment. Use Get help now.
      </Txt>
    </Screen>
  );
}
