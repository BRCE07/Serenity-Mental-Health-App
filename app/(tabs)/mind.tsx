import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { MoodStrip } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { MOODS, noteForDay } from '../../src/mind/content';
import { colors, radius } from '../../src/theme';

type Tile = { title: string; sub: string; icon: keyof typeof Ionicons.glyphMap; href: string; tint: string };

const TILES: Tile[] = [
  { title: 'Journal', sub: 'Private, on your device', icon: 'book', href: '/mind/journal', tint: colors.recover[0] },
  { title: 'Calm down', sub: 'Breathing and coping', icon: 'leaf', href: '/mind/coping', tint: colors.heart[0] },
  { title: 'Talk to someone', sub: 'Book a counselor', icon: 'chatbubbles', href: '/mind/counseling', tint: colors.move[0] },
  { title: 'Learn', sub: 'Understand how you feel', icon: 'bulb', href: '/mind/learn', tint: colors.recover[0] },
  { title: 'Community', sub: 'Anonymous support', icon: 'people', href: '/mind/community', tint: colors.heart[0] },
  { title: 'Reminders', sub: 'Gentle nudges', icon: 'notifications', href: '/mind/reminders', tint: colors.move[0] },
];

export default function Mind() {
  const { moodByDay, todayMood } = useMind();
  const week = moodByDay(14);
  const logged = week.filter((v): v is number => v != null);
  const avg = logged.length ? logged.reduce((a, b) => a + b, 0) / logged.length : null;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt v="title">Mind</Txt>
        <Pressable
          onPress={() => router.push('/mind/help')}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9,
            borderRadius: radius.pill, backgroundColor: colors.cardHi, borderWidth: 1, borderColor: colors.move[1],
          }}
        >
          <Ionicons name="call" size={15} color={colors.move[1]} />
          <Txt v="label" color={colors.move[1]}>Need help now?</Txt>
        </Pressable>
      </View>

      <Card style={{ gap: 8 }}>
        <Label>Note for today</Label>
        <Txt v="h2" style={{ fontSize: 20, lineHeight: 28 }}>{noteForDay()}</Txt>
      </Card>

      <Pressable onPress={() => router.push('/mind/mood')}>
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <Txt v="h2">{todayMood ? 'Checked in today' : 'How are you feeling?'}</Txt>
              <Txt color={colors.muted} style={{ fontSize: 13 }}>
                {avg ? `Average over 14 days: ${MOODS[Math.round(avg) - 1].label}` : 'Start your mood tracker'}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.faint} />
          </View>
          <MoodStrip values={week} size={16} />
        </Card>
      </Pressable>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {TILES.map((t) => (
          <Pressable key={t.title} onPress={() => router.push(t.href as any)} style={{ flexBasis: '47.5%', flexGrow: 1 }}>
            <Card style={{ gap: 14, minHeight: 130 }}>
              <View
                style={{
                  width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.cardHi,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name={t.icon} size={20} color={t.tint} />
              </View>
              <View style={{ gap: 2 }}>
                <Txt v="h2" style={{ fontSize: 16 }}>{t.title}</Txt>
                <Txt color={colors.muted} style={{ fontSize: 13, lineHeight: 18 }}>{t.sub}</Txt>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        Lumen supports your wellbeing but is not a substitute for professional care or emergency services.
      </Txt>
    </Screen>
  );
}
