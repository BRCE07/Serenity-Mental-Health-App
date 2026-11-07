import React from 'react';
import {
  KeyboardAvoidingView, Platform, StyleProp, Text as RNText, TextStyle, View, ViewStyle, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../theme';

type Variant = keyof typeof type;

export function Txt({
  v = 'body', color = colors.text, style, children, numberOfLines,
}: {
  v?: Variant; color?: string; style?: StyleProp<TextStyle>; children: React.ReactNode; numberOfLines?: number;
}) {
  return (
    <RNText numberOfLines={numberOfLines} style={[type[v], { color }, style]}>
      {children}
    </RNText>
  );
}

export function Label({ children, color = colors.muted }: { children: React.ReactNode; color?: string }) {
  return (
    <Txt v="label" color={color} style={{ textTransform: 'uppercase' }}>
      {children}
    </Txt>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: space.lg + 2,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Screen({
  children, onRefresh, refreshing = false,
}: {
  children: React.ReactNode; onRefresh?: () => void; refreshing?: boolean;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: space.xl, paddingBottom: 120, gap: space.lg }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.muted} /> : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Chip({ children, color = colors.muted }: { children: React.ReactNode; color?: string }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: colors.cardHi,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Txt v="label" color={color}>
        {children}
      </Txt>
    </View>
  );
}
