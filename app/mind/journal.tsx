import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Button, CrisisNotice, Field, Header, Pill } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { colors } from '../../src/theme';
import { JournalEntry } from '../../src/mind/types';

const PROMPTS = [
  'Today I am grateful for…',
  'What is weighing on me is…',
  'One small win today was…',
  'Something I need right now is…',
];

export default function Journal() {
  const { data, saveJournal, deleteJournal } = useMind();
  // null = list view, 'new' = new entry, otherwise entry id
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const open = (e: JournalEntry | null) => {
    setEditing(e ? e.id : 'new');
    setTitle(e?.title ?? '');
    setBody(e?.body ?? '');
  };
  const close = () => setEditing(null);

  const save = () => {
    if (!body.trim() && !title.trim()) return;
    saveJournal({ id: editing && editing !== 'new' ? editing : undefined, title: title.trim(), body: body.trim() });
    close();
  };

  const remove = () => {
    if (!editing || editing === 'new') return close();
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteJournal(editing); close(); } },
    ]);
  };

  if (editing) {
    return (
      <Screen>
        <Pressable onPress={close} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
          <Ionicons name="chevron-back" size={20} color={colors.muted} />
          <Txt color={colors.muted}>Journal</Txt>
        </Pressable>
        <Txt v="title">{editing === 'new' ? 'New entry' : 'Edit entry'}</Txt>

        <Field value={title} onChangeText={setTitle} placeholder="Title (optional)" maxLength={80} />
        <Field value={body} onChangeText={setBody} placeholder="Write freely. Only you can see this." multiline minHeight={220} />

        <View style={{ gap: 8 }}>
          <Label>Need a starting point?</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PROMPTS.map((p) => (
              <Pill key={p} label={p} onPress={() => setBody((b) => (b ? `${b}\n\n${p} ` : `${p} `))} />
            ))}
          </View>
        </View>

        <CrisisNotice text={`${title} ${body}`} />

        <Button label="Save entry" onPress={save} disabled={!body.trim() && !title.trim()} />
        {editing !== 'new' && <Button label="Delete" variant="secondary" icon="trash" onPress={remove} />}
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Journal" subtitle="A private space to untangle your thoughts." />

      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Ionicons name="lock-closed" size={20} color={colors.good} />
        <Txt color={colors.muted} style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>
          Entries are stored only on this device. They are never uploaded or shared.
        </Txt>
      </Card>

      <Button label="New entry" icon="add" onPress={() => open(null)} />

      {data.journal.length === 0 ? (
        <Txt color={colors.muted} style={{ textAlign: 'center', paddingVertical: 24 }}>
          Nothing here yet. Even one sentence counts.
        </Txt>
      ) : (
        data.journal.map((e) => (
          <Pressable key={e.id} onPress={() => open(e)}>
            <Card style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt v="h2" style={{ fontSize: 16, flex: 1 }} numberOfLines={1}>
                  {e.title || new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </Txt>
                <Txt color={colors.faint} style={{ fontSize: 12 }}>
                  {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Txt>
              </View>
              <Txt color={colors.muted} numberOfLines={3} style={{ fontSize: 14, lineHeight: 20 }}>{e.body}</Txt>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}
