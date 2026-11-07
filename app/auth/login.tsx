import React, { useState } from 'react';
import { Keyboard, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Screen, Txt, Input } from '../../src/components/ui';
import { useAuth } from '../../src/state/AuthContext';
import { colors, radius, space } from '../../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await login(email.trim(), password);
    setBusy(false);
    if (result.ok) {
      router.replace('/(tabs)');
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.lg }}>
      <View style={{ gap: space.xl, alignItems: 'center' }}>
        <Txt v="title" style={{ textAlign: 'center' }}>Welcome back</Txt>
        <Txt color={colors.muted} style={{ textAlign: 'center', fontSize: 14 }}>
          Sign in to sync your health data
        </Txt>

        <Card style={{ width: '100%', gap: space.md }}>
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
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? (
            <Txt color="rgba(255,130,130,0.9)" style={{ fontSize: 13 }}>{error}</Txt>
          ) : null}

          <View style={{ height: 46, borderRadius: radius.pill, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' }}>
            <Txt v="h2" style={{ fontSize: 15 }} color={colors.bg}>
              {busy ? 'Signing in...' : 'Sign In'}
            </Txt>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: space.xs }}>
          <Txt color={colors.muted} style={{ fontSize: 14 }}>Don't have an account?</Txt>
          <Pressable onPress={() => router.push('/auth/register')}>
            <Txt
              color={colors.good}
              style={{ fontSize: 14, fontWeight: '600' }}
            >
              Create one
            </Txt>
          </Pressable>
        </View>
      </View>
      </View>
    </Screen>
  );
}
