import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Txt, Input } from '../../src/components/ui';
import { useHealth } from '../../src/state/HealthContext';
import { useAuth } from '../../src/state/AuthContext';
import { connectorList } from '../../src/integrations/registry';
import { apiHealthCheck } from '../../src/lib/api';
import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { colors, radius, space } from '../../src/theme';
import { Connector, UserProfile } from '../../src/types';

const KEY_PROFILE = 'serenity:profile';
const HOBBY_OPTIONS = [
  'Running', 'Cycling', 'Hiking', 'Swimming', 'Weightlifting',
  'Yoga', 'Martial Arts', 'Team Sports', 'Dancing', 'Camping',
  'Photography', 'Reading', 'Music', 'Gaming', 'Cooking',
  'Gardening', 'Fishing', 'Skiing', 'Surfing', 'Art & Painting',
];

export default function Settings() {
  const { connections, busy, error, connect, disconnect, isDemo } = useHealth();
  const { user, logout } = useAuth();
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile>({ displayName: '', hobbies: [] });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    apiHealthCheck().then(r => setServerReachable(r.ok)).catch(() => setServerReachable(false));
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY_PROFILE);
      if (raw) setProfile(JSON.parse(raw));
    } catch { /* ignore */ }
  };

  const saveProfile = async () => {
    setSaving(true);
    const updated = { ...profile, displayName: editName };
    setProfile(updated);
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(updated));
    setSaving(false);
    setEditing(false);
  };

  const toggleHobby = (hobby: string) => {
    const hobbies = profile.hobbies.includes(hobby)
      ? profile.hobbies.filter(h => h !== hobby)
      : [...profile.hobbies, hobby];
    setProfile({ ...profile, hobbies });
  };

  const handleConnect = async (id: Connector['id']) => {
    setConnecting(id);
    try {
      await connect(id);
    } catch { /* handled by context */ }
    setConnecting(null);
  };

  const handleDisconnect = async (id: Connector['id']) => {
    await disconnect(id);
  };

  const handleLogout = async () => {
    Alert.alert('Sign out', 'Sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Txt v="title">Settings</Txt>
        <Txt color={colors.muted}>
          Account, profile, and health sources.
        </Txt>
      </View>

      {/* Account Card */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 52, height: 52, borderRadius: 26, backgroundColor: colors.good,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <RNText style={{ fontSize: 22, fontWeight: '700', color: colors.bg }}>
              {user?.username?.charAt(0)?.toUpperCase() ?? 'U'}
            </RNText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt v="h2">{user?.username}</Txt>
            <Txt color={colors.muted} style={{ fontSize: 13 }}>{user?.email}</Txt>
          </View>
          <Ionicons name="cloud-done" size={20} color={serverReachable === true ? colors.good : serverReachable === false ? colors.faint : colors.muted} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4,
            paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill,
            backgroundColor: serverReachable === true ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.06)',
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: serverReachable === true ? colors.good : colors.faint }} />
            <Txt v="label" style={{ fontSize: 11 }} color={serverReachable === true ? colors.good : colors.faint}>
              {serverReachable === true ? 'Synced' : 'Offline'}
            </Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={handleLogout} style={({ pressed }) => ({
            flex: 1, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(255,100,100,0.12)',
            opacity: pressed ? 0.8 : 1,
          })}>
            <Txt v="body" style={{ fontSize: 14, color: 'rgba(255,100,100,0.8)' }}>Sign Out</Txt>
          </Pressable>
          <Pressable onPress={() => { setEditName(user?.username ?? ''); setEditing(true); }} style={({ pressed }) => ({
            flex: 1, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
            backgroundColor: colors.cardHi, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1,
          })}>
            <Txt v="body" style={{ fontSize: 14 }}>Edit Profile</Txt>
          </Pressable>
        </View>
      </Card>

      {/* ── Profile & Hobbies ───────────────────────────────── */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="person-circle-outline" size={20} color={colors.text} />
          <Txt v="h2">Profile</Txt>
        </View>
        <View style={{ gap: 8, paddingHorizontal: 4 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt v="label" color={colors.muted}>Display Name</Txt>
              <Txt v="body">{profile.displayName || user?.username || 'Not set'}</Txt>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <Txt v="label" color={colors.muted}>Hobbies & Interests</Txt>
            {profile.hobbies.length === 0 ? (
              <Txt color={colors.faint} style={{ fontSize: 13 }}>Tap "Edit Profile" to add hobbies.</Txt>
            ) : (
              <View style={{ flexDirection: 'flex-wrap', gap: 6 }}>
                {profile.hobbies.map(h => (
                  <View key={h} style={{
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill,
                    backgroundColor: 'rgba(110,231,183,0.12)', borderWidth: 1, borderColor: 'rgba(110,231,183,0.3)',
                  }}>
                    <Txt v="label" style={{ fontSize: 11 }} color={colors.good}>{h}</Txt>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>

      {/* ── Health Sources ──────────────────────────────────── */}
      <View style={{ gap: 6 }}>
        <Txt v="label">Health Data Sources</Txt>
      </View>

      {isDemo && (
        <Card style={{ borderColor: colors.warn, backgroundColor: colors.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle" size={18} color={colors.warn} />
            <RNText style={{ fontSize: 13, color: colors.warn, lineHeight: 18 }}>
              Using simulated data. Connect a source below to pull real data.
            </RNText>
          </View>
        </Card>
      )}

      {connectorList.map((c) => {
        const isGarmin = c.id === 'garmin';
        const connected = connections[c.id];
        const isBusy = connecting === c.id || (isGarmin && connecting === 'strava') || busy === c.id || (isGarmin && busy === 'strava');
        const disabled = !isGarmin && !c.available;

        // Garmin goes through Strava until a backend exists
        const label = isGarmin
          ? connections.strava ? 'Syncing via Strava' : 'Use via Strava'
          : connected ? 'Disconnect' : 'Connect';
        const onPress = () => {
          if (isGarmin) {
            if (!connections.strava) handleConnect('strava');
            return;
          }
          return connected ? handleDisconnect(c.id) : handleConnect(c.id);
        };

        return (
          <Card key={c.id} style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.cardHi,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name={c.id === 'apple' ? 'watch' : c.id === 'strava' ? 'bicycle' : c.id === 'garmin' ? 'navigate-circle' : 'heart'} size={24} color={connected ? colors.good : colors.text} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="h2">{c.name}</Txt>
                <Txt color={colors.muted} style={{ fontSize: 13, lineHeight: 18 }}>{c.tagline}</Txt>
              </View>
              {connected && <Ionicons name="checkmark-circle" size={22} color={colors.good} />}
            </View>

            {(disabled || isGarmin) && c.unavailableReason ? (
              <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17 }}>{c.unavailableReason}</Txt>
            ) : null}

            {isGarmin && !c.unavailableReason && !connected && (
              <Txt color={colors.faint} style={{ fontSize: 12, lineHeight: 17 }}>
                Connect Garmin Connect to Strava (Garmin Connect &gt; Settings &gt; Partner Apps), then use Strava to sync.
              </Txt>
            )}

            <Pressable
              disabled={disabled || isBusy || (isGarmin && connections.strava)}
              onPress={onPress}
              style={({ pressed }) => ({
                height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
                backgroundColor: connected && !isGarmin ? colors.cardHi : disabled ? colors.track : colors.text,
                opacity: pressed ? 0.8 : 1,
                borderWidth: connected && !isGarmin ? 1 : 0,
                borderColor: colors.border,
              })}
            >
              {isBusy ? (
                <ActivityIndicator color={colors.muted} />
              ) : (
                <Txt
                  v="h2"
                  style={{ fontSize: 15 }}
                  color={connected && !isGarmin ? colors.text : disabled ? colors.faint : colors.bg}
                >
                  {label}
                </Txt>
              )}
            </Pressable>
          </Card>
        );
      })}

      {error ? (
        <Card style={{ borderColor: colors.warn }}>
          <Txt color={colors.warn} style={{ fontSize: 13 }}>{error}</Txt>
        </Card>
      ) : null}

      {/* App version & copyright */}
      <View style={{ paddingHorizontal: 4, marginTop: 8 }}>
        <Txt v="label" style={{ fontSize: 10, lineHeight: 15, textAlign: 'center', color: colors.faint }}>
          Serenity v1.1.3
          {'\n'}
          © 2026 GAntiGrav
        </Txt>
      </View>

      {/* ── Edit Profile Modal ──────────────────────────────── */}
      <Modal visible={editing} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{ width: '90%', gap: 16, maxWidth: 400 }}>
            <Txt v="title" style={{ fontSize: 18 }}>Edit Profile</Txt>

            <View style={{ gap: 6 }}>
              <Txt v="label">Display Name</Txt>
              <Input
                placeholder="Your name"
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="words"
              />
            </View>

            <View style={{ gap: 8 }}>
              <Txt v="label">Hobbies &amp; Interests</Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {HOBBY_OPTIONS.map(hobby => {
                  const active = profile.hobbies.includes(hobby);
                  return (
                    <Pressable
                      key={hobby}
                      onPress={() => toggleHobby(hobby)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: radius.pill,
                        backgroundColor: active ? colors.good : colors.cardHi,
                        borderWidth: 1,
                        borderColor: active ? colors.good : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Txt v="label" style={{ fontSize: 12 }} color={active ? colors.bg : colors.text}>
                        {hobby}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => { setEditing(false); }} style={{ flex: 1, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardHi, borderWidth: 1, borderColor: colors.border }}>
                <Txt v="body" style={{ fontSize: 14 }}>Cancel</Txt>
              </Pressable>
              <Pressable onPress={saveProfile} style={{ flex: 1, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, opacity: saving ? 0.6 : 1 }}>
                {saving ? (
                  <ActivityIndicator color={colors.bg} />
                ) : (
                  <Txt v="h2" style={{ fontSize: 15 }} color={colors.bg}>Save</Txt>
                )}
              </Pressable>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}
