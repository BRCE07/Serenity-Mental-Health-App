import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Connector, Workout } from '../types';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'lumen.strava.tokens';
const CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? '';
// PROTOTYPE ONLY. Bundled into the app binary. Move the token exchange to a backend for production.
const CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET ?? '';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
}

async function loadTokens(): Promise<Tokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}

async function saveTokens(t: Tokens) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(t));
  } catch (err) {
    console.error('Failed to save Strava tokens:', err);
  }
}

async function tokenRequest(body: Record<string, string>): Promise<Tokens> {
  const res = await fetch(discovery.tokenEndpoint!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...body }),
  });
  if (!res.ok) throw new Error(`Strava token request failed (${res.status})`);
  const j = await res.json();
  return { accessToken: j.access_token, refreshToken: j.refresh_token, expiresAt: j.expires_at };
}

async function getValidAccessToken(): Promise<string> {
  let t = await loadTokens();
  if (!t) throw new Error('Strava is not connected');
  if (t.expiresAt - 60 < Date.now() / 1000) {
    t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refreshToken });
    await saveTokens(t);
  }
  return t.accessToken;
}

export const strava: Connector = {
  id: 'strava',
  name: 'Strava',
  tagline: 'Runs, rides and every workout you log',
  available: !!CLIENT_ID,
  unavailableReason: 'Add EXPO_PUBLIC_STRAVA_CLIENT_ID to your .env file (see README).',

  async isConnected() {
    return !!(await loadTokens());
  },

  async connect() {
    if (!CLIENT_ID) return { success: false, error: 'Strava is not configured. To enable Strava sync, create a free developer app at strava.com/settings/api and add the Client ID to your app settings.' };
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'lumen', path: 'redirect' });
    const request = new AuthSession.AuthRequest({
      clientId: CLIENT_ID,
      redirectUri,
      scopes: ['read', 'activity:read_all'],
      usePKCE: false, // Strava does not support PKCE
      extraParams: { approval_prompt: 'auto' },
    });
    const result = await request.promptAsync(discovery);
    if (result.type !== 'success') throw new Error('Strava sign-in was cancelled');
    const tokens = await tokenRequest({
      grant_type: 'authorization_code',
      code: result.params.code,
    });
    await saveTokens(tokens);
  },

  async disconnect() {
    try {
      const token = await getValidAccessToken();
      await fetch(discovery.revocationEndpoint!, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch {
      // Best effort; always clear local tokens
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async fetchWorkouts(): Promise<Workout[]> {
    const token = await getValidAccessToken();
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Strava activities request failed (${res.status})`);
    const list = (await res.json()) as any[];
    return list.map((a) => ({
      id: `strava-${a.id}`,
      source: 'strava' as const,
      type: a.sport_type ?? a.type ?? 'Workout',
      name: a.name,
      startDate: a.start_date_local ?? a.start_date,
      distanceM: a.distance ?? 0,
      movingSec: a.moving_time ?? 0,
      avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
      elevM: a.total_elevation_gain ?? undefined,
      calories: a.kilojoules ? Math.round(a.kilojoules * 0.239) : undefined,
    }));
  },
};
