import React from 'react';
import { Pressable, Switch, TextInput, View, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Label, Txt } from './ui';
import { colors, radius } from '../theme';
import { hasCrisisLanguage } from '../mind/content';
import { MOODS } from '../mind/content';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ gap: 10 }}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/mind'))}
        hitSlop={12}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.muted} />
        <Txt color={colors.muted}>Back</Txt>
      </Pressable>
      <Txt v="title">{title}</Txt>
      {subtitle ? <Txt color={colors.muted}>{subtitle}</Txt> : null}
    </View>
  );
}

export function Button({
  label, onPress, variant = 'primary', icon, disabled, style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = variant === 'primary' ? colors.text : variant === 'danger' ? colors.move[1] : colors.cardHi;
  const fg = variant === 'secondary' ? colors.text : colors.bg;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 48, borderRadius: radius.pill, backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20,
          borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Txt v="h2" color={fg} style={{ fontSize: 15 }}>{label}</Txt>
    </Pressable>
  );
}

export function Pill({
  label, selected, onPress, color = colors.accent,
}: { label: string; selected?: boolean; onPress?: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill,
        backgroundColor: selected ? color : colors.cardHi,
        borderWidth: 1, borderColor: selected ? color : colors.border,
      }}
    >
      <Txt v="body" color={selected ? colors.bg : colors.text} style={{ fontSize: 14, fontWeight: '600' }}>{label}</Txt>
    </Pressable>
  );
}

export function Field({
  value, onChangeText, placeholder, multiline, minHeight = 48, maxLength, secureEntry, keyboardType,
}: {
  value: string; onChangeText: (t: string) => void; placeholder?: string; multiline?: boolean;
  minHeight?: number; maxLength?: number; secureEntry?: boolean; keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.faint}
      multiline={multiline}
      maxLength={maxLength}
      secureTextEntry={secureEntry}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={{
        minHeight, color: colors.text, fontSize: 16, lineHeight: 22,
        backgroundColor: colors.cardHi, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: 16, paddingVertical: multiline ? 14 : 10,
      }}
    />
  );
}

export function SwitchRow({
  label, sub, value, onValueChange,
}: { label: string; sub?: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="h2" style={{ fontSize: 16 }}>{label}</Txt>
        {sub ? <Txt color={colors.muted} style={{ fontSize: 13, lineHeight: 18 }}>{sub}</Txt> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.track, true: colors.recover[1] }}
        thumbColor={colors.text}
      />
    </View>
  );
}

/** Appears under a text box if the text contains crisis language. */
export function CrisisNotice({ text }: { text: string }) {
  if (!hasCrisisLanguage(text)) return null;
  return (
    <Card style={{ borderColor: colors.move[1], gap: 10, backgroundColor: colors.cardHi }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Ionicons name="heart" size={20} color={colors.move[1]} />
        <Txt v="h2" style={{ fontSize: 16 }}>You do not have to face this alone</Txt>
      </View>
      <Txt color={colors.muted} style={{ fontSize: 14 }}>
        It sounds like things are really heavy right now. Free, confidential support is available any time.
      </Txt>
      <Button label="See crisis support" variant="danger" icon="call" onPress={() => router.push('/mind/help')} />
    </Card>
  );
}

export function MoodStrip({ values, size = 18 }: { values: (number | null)[]; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {values.map((v, i) => {
        const color = v == null ? colors.track : MOODS[Math.min(4, Math.max(0, Math.round(v) - 1))].color;
        return <View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
      })}
    </View>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Label>{children}</Label>;
}
