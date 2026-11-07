import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Button, CrisisNotice, Field, Header, MoodStrip, Pill } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { MOODS, MOOD_TAGS } from '../../src/mind/content';
import { colors, radius } from '../../src/theme';

export default function MoodScreen() {
  const { data, addMood, moodByDay } = useMind();
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [savedMood, setSavedMood] = useState<number | null>(null);

  const toggle = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const save = () => {
    if (!mood) return;
    addMood({ mood, tags, note: note.trim() || undefined });
    setSavedMood(mood);
    setMood(null); setTags([]); setNote('');
  };

  const recent = [...data.moods].reverse().slice(0, 8);
  const week = moodByDay(14);

  return (
    <Screen>
      <Header title="Mood" subtitle="Check in with yourself. Patterns appear over time." />

      {savedMood ? (
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="checkmark-circle" size={22} color={colors.good} />
            <Txt v="h2">Saved. Thanks for checking in.</Txt>
          </View>
          {savedMood <= 2 ? (
            <>
              <Txt color={colors.muted}>Low days happen. A few things that can help right now:</Txt>
              <Button label="Try a breathing exercise" icon="leaf" variant="secondary" onPress={() => router.push('/mind/coping')} />
              <Button label="Talk to someone" icon="chatbubbles" variant="secondary" onPress={() => router.push('/mind/counseling')} />
              <Button label="Crisis support" icon="call" variant="secondary" onPress={() => router.push('/mind/help')} />
            </>
          ) : (
            <Txt color={colors.muted}>Nice. Keep noticing what supports your good days.</Txt>
          )}
          <Pressable onPress={() => setSavedMood(null)}>
            <Txt color={colors.accent}>Add another check-in</Txt>
          </Pressable>
        </Card>
      ) : (
        <Card style={{ gap: 20 }}>
          <Txt v="h2">How are you feeling right now?</Txt>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MOODS.map((m) => {
              const sel = mood === m.value;
              return (
                <Pressable key={m.value} onPress={() => setMood(m.value)} style={{ alignItems: 'center', gap: 8 }}>
                  <View
                    style={{
                      width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: sel ? m.color : colors.cardHi,
                      borderWidth: 1, borderColor: sel ? m.color : colors.border,
                    }}
                  >
                    <Ionicons name={m.icon} size={26} color={sel ? colors.bg : m.color} />
                  </View>
                  <Label color={sel ? colors.text : colors.faint}>{m.label}</Label>
                </Pressable>
              );
            })}
          </View>

          {mood ? (
            <>
              <View style={{ gap: 10 }}>
                <Label>What is influencing it?</Label>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {MOOD_TAGS.map((t) => (
                    <Pill key={t} label={t} selected={tags.includes(t)} onPress={() => toggle(t)} />
                  ))}
                </View>
              </View>
              <Field value={note} onChangeText={setNote} placeholder="Add a note (optional)" multiline minHeight={80} />
              <CrisisNotice text={note} />
              <Button label="Save check-in" onPress={save} />
            </>
          ) : null}
        </Card>
      )}

      <Card style={{ gap: 14 }}>
        <Txt v="h2">Last 14 days</Txt>
        <MoodStrip values={week} size={16} />
      </Card>

      {recent.length > 0 && (
        <Card style={{ gap: 4, paddingBottom: 8 }}>
          <Txt v="h2" style={{ marginBottom: 6 }}>History</Txt>
          {recent.map((e, i) => {
            const m = MOODS[e.mood - 1];
            return (
              <View
                key={e.id}
                style={{
                  flexDirection: 'row', gap: 14, alignItems: 'center', paddingVertical: 12,
                  borderBottomWidth: i === recent.length - 1 ? 0 : 1, borderBottomColor: colors.border,
                }}
              >
                <View
                  style={{
                    width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.cardHi,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Ionicons name={m.icon} size={19} color={m.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt v="h2" style={{ fontSize: 15 }}>{m.label}{e.tags.length ? `  ·  ${e.tags.join(', ')}` : ''}</Txt>
                  {e.note ? <Txt color={colors.muted} style={{ fontSize: 13 }} numberOfLines={2}>{e.note}</Txt> : null}
                </View>
                <Txt color={colors.faint} style={{ fontSize: 12 }}>
                  {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Txt>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
