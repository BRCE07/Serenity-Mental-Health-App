import React, { useState } from 'react';
import { Keyboard, Pressable, View, Image, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Card, Screen, Txt, Input, Label } from '../../src/components/ui';
import { useAuth } from '../../src/state/AuthContext';
import { colors, radius, space, type } from '../../src/theme';

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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Large background logo watermark */}
      <Image
        source={require('../../assets/icon.png')}
        style={{
          position: 'absolute',
          top: 40,
          alignSelf: 'center',
          width: 300,
          height: 300,
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
            <Txt v="title" style={{ textAlign: 'center', fontSize: 32 }}>Create account</Txt>
            <Txt color={colors.muted} style={{ textAlign: 'center', fontSize: 15, maxWidth: 260, lineHeight: 22 }}>
              Sign up to sync your health data across devices
            </Txt>
          </View>

          {/* Form Card */}
          <Card style={{ width: '100%', gap: space.md, paddingTop: space.md }}>
            {/* Username */}
            <View style={{ gap: space.xs }}>
              <Label>Username</Label>
              <Input
                placeholder="Your name"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
                placeholder="Min 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
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

            {/* Create Account Button */}
            <Pressable
              onPress={handleRegister}
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
                {busy ? 'Creating account...' : 'Create Account'}
              </Txt>
            </Pressable>
          </Card>

          {/* Login link */}
          <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
            <Txt color={colors.muted} style={{ fontSize: 14 }}>Already have an account?</Txt>
            <Pressable onPress={() => router.back()}>
              <Txt color="#6bc5b7" style={{ fontSize: 14, fontWeight: '600' }}>
                Sign in
              </Txt>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
