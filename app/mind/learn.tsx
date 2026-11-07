import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Button, Header } from '../../src/components/controls';
import { ARTICLES, Article, WHEN_TO_SEEK_HELP } from '../../src/mind/content';
import { colors, radius } from '../../src/theme';

function ArticleCard({ a }: { a: Article }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((o) => !o)}>
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.cardHi,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name={a.icon} size={20} color={colors.recover[0]} />
          </View>
          <Txt v="h2" style={{ flex: 1 }}>{a.title}</Txt>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
        </View>
        <Txt color={colors.muted} style={{ fontSize: 14, lineHeight: 21 }}>{a.summary}</Txt>
        {open && (
          <View style={{ gap: 16 }}>
            <Bullets label="Common signs" items={a.signs} color={colors.move[0]} />
            <Bullets label="What can help" items={a.helps} color={colors.good} />
          </View>
        )}
      </Card>
    </Pressable>
  );
}

function Bullets({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Label color={color}>{label}</Label>
      {items.map((t) => (
        <View key={t} style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginTop: 8 }} />
          <Txt style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{t}</Txt>
        </View>
      ))}
    </View>
  );
}

export default function Learn() {
  return (
    <Screen>
      <Header title="Learn" subtitle="Plain-language guides to common mental health topics." />

      {ARTICLES.map((a) => (
        <ArticleCard key={a.id} a={a} />
      ))}

      <Card style={{ gap: 12 }}>
        <Txt v="h2">When to seek help</Txt>
        <Txt color={colors.muted} style={{ fontSize: 14, lineHeight: 21 }}>{WHEN_TO_SEEK_HELP}</Txt>
        <Button label="Talk to a counselor" icon="chatbubbles" onPress={() => router.push('/mind/counseling')} />
        <Button label="Crisis support" icon="call" variant="secondary" onPress={() => router.push('/mind/help')} />
      </Card>

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        General information only. It is not a diagnosis or medical advice.
      </Txt>
    </Screen>
  );
}
