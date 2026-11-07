import React, { useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Label, Screen, Txt } from '../../src/components/ui';
import { Button, Field, Header, Pill } from '../../src/components/controls';
import { useMind } from '../../src/state/MindContext';
import { HOTLINES, Hotline, REGION_LABEL } from '../../src/mind/content';
import { Region } from '../../src/mind/types';
import { colors, radius } from '../../src/theme';

const open = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert('Could not open', 'This device cannot place that call or open that link.'));

export default function Help() {
  const { data, setRegion, addContact, removeContact } = useMind();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);

  const lines = HOTLINES[data.region];
  const emergency = lines.filter((l) => l.emergency);
  const others = lines.filter((l) => !l.emergency);

  const saveContact = () => {
    if (!name.trim() || !phone.trim()) return;
    addContact({ name: name.trim(), phone: phone.trim() });
    setName(''); setPhone(''); setAdding(false);
  };

  return (
    <Screen>
      <Header title="Get help now" subtitle="You are not alone. These services are free and confidential." />

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(Object.keys(REGION_LABEL) as Region[]).map((r) => (
          <Pill key={r} label={REGION_LABEL[r]} selected={data.region === r} onPress={() => setRegion(r)} />
        ))}
      </View>

      {emergency.map((l) => (
        <Card key={l.id} style={{ gap: 12, borderColor: colors.move[1] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="warning" size={20} color={colors.move[1]} />
            <Txt v="h2">{l.name}</Txt>
          </View>
          <Txt color={colors.muted} style={{ fontSize: 14 }}>{l.desc}</Txt>
          <Button label={`Call ${l.display}`} icon="call" variant="danger" onPress={() => open(`tel:${l.dial}`)} />
        </Card>
      ))}

      <Label>Crisis and support lines</Label>
      {others.map((l) => (
        <HotlineCard key={l.id} l={l} />
      ))}

      <Label>My support contacts</Label>
      <Card style={{ gap: 12 }}>
        {data.contacts.length === 0 && !adding ? (
          <Txt color={colors.muted} style={{ fontSize: 14 }}>
            Add someone you trust so they are one tap away when you need them.
          </Txt>
        ) : null}
        {data.contacts.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardHi,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Txt v="h2" style={{ fontSize: 16 }}>{c.name[0].toUpperCase()}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt v="h2" style={{ fontSize: 15 }}>{c.name}</Txt>
              <Txt color={colors.muted} style={{ fontSize: 13 }}>{c.phone}</Txt>
            </View>
            <Pressable hitSlop={8} onPress={() => open(`tel:${c.phone.replace(/[^\d+]/g, '')}`)}>
              <Ionicons name="call" size={22} color={colors.good} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => removeContact(c.id)}>
              <Ionicons name="close-circle" size={22} color={colors.faint} />
            </Pressable>
          </View>
        ))}
        {adding ? (
          <View style={{ gap: 10 }}>
            <Field value={name} onChangeText={setName} placeholder="Name" />
            <Field value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label="Cancel" variant="secondary" onPress={() => setAdding(false)} style={{ flex: 1 }} />
              <Button label="Save" onPress={saveContact} disabled={!name.trim() || !phone.trim()} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <Button label="Add contact" icon="person-add" variant="secondary" onPress={() => setAdding(true)} />
        )}
      </Card>

      <Card style={{ gap: 10 }}>
        <Txt v="h2" style={{ fontSize: 16 }}>While you wait</Txt>
        <Txt color={colors.muted} style={{ fontSize: 14 }}>Slow breathing can take the edge off intense feelings.</Txt>
        <Button label="Breathe with me" icon="leaf" variant="secondary" onPress={() => router.push('/mind/coping')} />
      </Card>

      <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17, textAlign: 'center' }}>
        Numbers can change. Please verify with the provider if a line does not connect.
      </Txt>
    </Screen>
  );
}

function HotlineCard({ l }: { l: Hotline }) {
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Txt v="h2" style={{ fontSize: 16 }}>{l.name}</Txt>
        <Txt color={colors.muted} style={{ fontSize: 13, lineHeight: 18 }}>{l.desc}</Txt>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {l.dial ? (
          <Button label={`Call ${l.display}`} icon="call" onPress={() => open(`tel:${l.dial}`)} style={{ flex: 1 }} />
        ) : null}
        {l.textTo ? (
          <Button
            label={l.dial ? 'Text' : `Text ${l.display}`}
            icon="chatbubble"
            variant={l.dial ? 'secondary' : 'primary'}
            onPress={() => open(`sms:${l.textTo}`)}
            style={{ flex: l.dial ? 0.6 : 1 }}
          />
        ) : null}
        {l.url ? <Button label="Open website" icon="open" onPress={() => open(l.url!)} style={{ flex: 1 }} /> : null}
      </View>
    </Card>
  );
}
