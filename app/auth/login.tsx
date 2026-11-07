import React, { useState } from 'react';
import { Keyboard, Pressable, View, Image, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Card, Screen, Txt, Input, Label } from '../../src/components/ui';
import { useAuth } from '../../src/state/AuthContext';
import { colors, radius, space, type } from '../../src/theme';

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Large background logo watermark */}
      <Image
        source={require('../../assets/icon.png')}
        style={{
          position: 'absolute',
          top: 60,
          alignSelf: 'center',
          width: 280,
          height: 280,
          opacity: 0.08,
          resizeMode: 'contain',
        }}
        blurRadius={1}
      />

      <StatusBar barStyle="light-content" />

      {/* Top subtle gradient area */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: colors.bg,
      }}>
        <View style={{
          position: 'absolute',
          bottom: -40,
          left: -60,
          right: -60,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#1a3a4a',
          opacity: 0.5,
        }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.lg }}>
        <View style={{ gap: space.xl, alignItems: 'center', marginTop: 40 }}>
          {/* Brand section */}
          <View style={{ gap: space.sm, alignItems: 'center' }}>
            {/* Medium logo above text */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#1a3a4a',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#6bc5b7',
              marginBottom: space.sm,
            }}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </View>
            <Txt v="title" style={{ textAlign: 'center', fontSize: 32 }}>Welcome back</Txt>
            <Txt color={colors.muted} style={{ textAlign: 'center', fontSize: 15, maxWidth: 260, lineHeight: 22 }}>
              Sign in to sync your health and wellbeing data
            </Txt>
          </View>

          {/* Form Card */}
          <Card style={{ width: '100%', gap: space.md, paddingTop: space.md }}>
            {/* Email */}
            <View style={{ gap: space.xs }}>
              <Label>Email</Label>
              <Input
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={{ gap: space.xs }}>
              <Label>Password</Label>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
            </View>

            {/* Error */}
            {error ? (
              <View style={{
                backgroundColor: 'rgba(255,100,100,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255,100,100,0.2)',
                borderRadius: radius.sm,
                padding: space.sm,
              }}>
                <Txt color="rgba(255,130,130,0.9)" style={{ fontSize: 13 }}>{error}</Txt>
              </View>
            ) : null}

            {/* Sign In Button */}
            <Pressable
              onPress={handleLogin}
              disabled={busy}
              style={{
                height: 52,
                borderRadius: radius.md,
                backgroundColor: busy ? '#4a6a7a' : '#6bc5b7',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: busy ? 0.7 : 1,
                marginTop: space.xs,
              }}
            >
              <Txt v="h2" style={{ fontSize: 16, fontWeight: '600' }} color={colors.bg}>
                {busy ? 'Signing in...' : 'Sign In'}
              </Txt>
            </Pressable>
          </Card>

          {/* Register link */}
          <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
            <Txt color={colors.muted} style={{ fontSize: 14 }}>Don't have an account?</Txt>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Txt color="#6bc5b7" style={{ fontSize: 14, fontWeight: '600' }}>
                Create one
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
