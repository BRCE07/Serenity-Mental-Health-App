import React, { useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Screen, Txt, Input } from '../../src/components/ui';
import { useAuth } from '../../src/state/AuthContext';
import { colors, radius, space } from '../../src/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await register(email.trim(), password, username.trim());
    setBusy(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      setError(result.error ?? 'Registration failed');
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.lg }}>
        <View style={{ gap: space.xl, alignItems: 'center' }}>
          <Txt v="title" style={{ textAlign: 'center' }}>Create account</Txt>
          <Txt color={colors.muted} style={{ textAlign: 'center', fontSize: 14 }}>
            Sign up to sync your health data across devices
          </Txt>

          <Card style={{ width: '100%', gap: space.md }}>
            <View style={{ gap: space.sm }}>
            <Txt v="label" color={colors.text}>Username</Txt>
            <Input
              placeholder="Your name"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={{ gap: space.sm }}>
            <Txt v="label" color={colors.text}>Email</Txt>
            <Input
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={{ gap: space.sm }}>
            <Txt v="label" color={colors.text}>Password</Txt>
            <Input
              placeholder="Min 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          {error ? (
            <Txt color="rgba(255,130,130,0.9)" style={{ fontSize: 13 }}>{error}</Txt>
          ) : null}

          <View style={{ height: 46, borderRadius: radius.pill, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="h2" style={{ fontSize: 15 }} color={colors.bg}>
              {busy ? 'Creating account...' : 'Create Account'}
            </Txt>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: space.xs }}>
          <Txt color={colors.muted} style={{ fontSize: 14 }}>Already have an account?</Txt>
          <Pressable onPress={() => router.back()}>
            <Txt
              color={colors.good}
              style={{ fontSize: 14, fontWeight: '600' }}
            >
              Sign in
            </Txt>
          </Pressable>
        </View>
      </View>
      </View>
    </Screen>
  );
}
