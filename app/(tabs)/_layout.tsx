import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

const icon = (name: keyof typeof Ionicons.glyphMap, focused: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused: f }: { color: string; focused: boolean }) =>
    <Ionicons name={f ? focused : name} size={24} color={color} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.faint,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('sunny-outline', 'sunny') }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity', tabBarIcon: icon('flame-outline', 'flame') }} />
      <Tabs.Screen name="recovery" options={{ title: 'Recovery', tabBarIcon: icon('moon-outline', 'moon') }} />
      <Tabs.Screen name="mind" options={{ title: 'Mind', tabBarIcon: icon('heart-circle-outline', 'heart-circle') }} />
      <Tabs.Screen name="sources" options={{ title: 'Sources', tabBarIcon: icon('link-outline', 'link') }} />
    </Tabs>
  );
}
