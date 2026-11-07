import React, { useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Chip, Label, Screen, Txt } from '../../src/components/ui';
import { Button, CrisisNotice, Field, Header } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { SEED_POSTS, hasCrisisLanguage } from '../../src/mind/content';
import { colors } from '../../src/theme';

function timeAgo(date: Date): string {
  const mins = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export default function Community() {
  const { data, addPost, deletePost, toggleHug, newAlias } = useMind();
  const [text, setText] = useState('');

  const seed = useMemo(
    () => SEED_POSTS.map((p) => ({
      id: p.id, alias: p.alias, text: p.text, hugs: p.hugs, mine: false,
      date: new Date(Date.now() - p.minutesAgo * 60000),
    })),
    [],
  );
  const mine = data.posts.map((p) => ({ ...p, date: new Date(p.date) }));
  const feed = [...mine, ...seed];

  const share = () => {
    const t = text.trim();
    if (!t) return;
    const post = () => { addPost(t); setText(''); };
    if (hasCrisisLanguage(t)) {
      Alert.alert(
        'Before you post',
        'It sounds like you may be going through something very heavy. This community is peer support, not crisis care. Would you like to see crisis support first?',
        [
          { text: 'Post anyway', onPress: post },
          { text: 'Get help now', onPress: () => router.push('/mind/help') },
        ],
      );
      return;
    }
    post();
  };

  return (
    <Screen>
      <Header title="Community" subtitle="Share and support, anonymously." />

      <Chip color={colors.warn}>Preview · posts stay on this device</Chip>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="person-circle" size={22} color={colors.recover[0]} />
            <Txt>Posting as <Txt v="h2" style={{ fontSize: 15 }}>{data.alias}</Txt></Txt>
          </View>
          <Pressable onPress={newAlias} hitSlop={8}>
            <Ionicons name="shuffle" size={20} color={colors.muted} />
          </Pressable>
        </View>
        <Field value={text} onChangeText={setText} placeholder="What's on your mind?" multiline minHeight={90} maxLength={500} />
        <CrisisNotice text={text} />
        <Button label="Share anonymously" icon="send" onPress={share} disabled={!text.trim()} />
      </Card>

      <Card style={{ gap: 6 }}>
        <Label>Community guidelines</Label>
        <Txt color={colors.muted} style={{ fontSize: 13, lineHeight: 19 }}>
          Be kind. Do not share names, contacts or other identifying details. Do not give medical advice. If someone seems in danger, encourage them to use a crisis line.
        </Txt>
      </Card>

      {feed.map((p) => {
        const hugged = data.hugged.includes(p.id);
        return (
          <Card key={p.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.cardHi,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Txt v="label">{p.alias.split(' ').map((w) => w[0]).join('')}</Txt>
                </View>
                <Txt v="h2" style={{ fontSize: 15 }}>{p.alias}{p.mine ? ' (you)' : ''}</Txt>
              </View>
              <Txt color={colors.faint} style={{ fontSize: 12 }}>{timeAgo(p.date)}</Txt>
            </View>
            <Txt style={{ fontSize: 15, lineHeight: 22 }}>{p.text}</Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Pressable onPress={() => toggleHug(p.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} hitSlop={8}>
                <Ionicons name={hugged ? 'heart' : 'heart-outline'} size={20} color={hugged ? colors.move[1] : colors.muted} />
                <Txt color={colors.muted} style={{ fontSize: 13 }}>
                  {p.hugs + (hugged ? 1 : 0)} {hugged ? 'Hug sent' : 'Send a hug'}
                </Txt>
              </Pressable>
              {p.mine && (
                <Pressable onPress={() => deletePost(p.id)} hitSlop={8}>
                  <Txt color={colors.faint} style={{ fontSize: 13 }}>Delete</Txt>
                </Pressable>
              )}
            </View>
          </Card>
        );
      })}

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        Seed posts are illustrative. A live community needs a backend with moderation before launch.
      </Txt>
    </Screen>
  );
}
