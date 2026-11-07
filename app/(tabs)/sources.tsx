import React from 'react';
import { ActivityIndicator, Pressable, Text as RNText, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Txt } from '../../src/components/ui';
import { useHealth } from '../../src/state/HealthContext';
import { connectorList } from '../../src/integrations/registry';
import { colors, radius } from '../../src/theme';
import { Connector } from '../../src/types';
import { openHealthConnectSettings } from 'react-native-health-connect';

const ICONS: Record<Connector['id'], keyof typeof Ionicons.glyphMap> = {
  apple: 'watch',
  strava: 'bicycle',
  garmin: 'navigate-circle',
  googleFit: 'heart',
};

export default function Sources() {
  const { connections, busy, error, connect, disconnect } = useHealth();
  const isHealthConnectMocked = connections.googleFit && !connections.apple && !connections.strava && !connections.garmin;

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Txt v="title">Sources</Txt>
        <Txt color={colors.muted}>
          Bring your watch and training apps together in one calm place.
        </Txt>
      </View>

      {isHealthConnectMocked && (
        <Card style={{ borderColor: colors.warn, backgroundColor: colors.card }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="information-circle" size={18} color={colors.warn} />
            <RNText style={{ fontSize: 13, color: colors.warn, lineHeight: 18 }}>
              Health Connect SDK not found — showing simulated data. Real sync requires a
              Huawei Watch Fit 4 + Google Fit on a phone with Health Connect installed.
            </RNText>
          </View>
        </Card>
      )}

      {connectorList.map((c) => {
        const isGarmin = c.id === 'garmin';
        const connected = connections[c.id];
        const isBusy = busy === c.id || (isGarmin && busy === 'strava');
        const disabled = !isGarmin && !c.available;

        // Garmin goes through Strava until a backend exists
        const label = isGarmin
          ? connections.strava ? 'Syncing via Strava' : 'Use via Strava'
          : connected ? 'Disconnect' : 'Connect';
        const onPress = () => {
          if (isGarmin) {
            if (!connections.strava) connect('strava');
            return;
          }
          return connected ? disconnect(c.id) : connect(c.id);
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
                <Ionicons name={ICONS[c.id]} size={24} color={connected ? colors.good : colors.text} />
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

      <Pressable onPress={openHealthConnectSettings}>
        <Txt v="body" style={{ fontSize: 13, color: colors.good, textAlign: 'center' }}>
          Open Health Connect settings → check if Serenity is listed
        </Txt>
      </Pressable>
    </Screen>
  );
}
