import { Connector, DaySummary } from '../types';
import { appleHealth } from './appleHealth';
import { strava } from './strava';
import { garmin } from './garmin';
import { healthConnect } from './googleFit';
import { mockHealthConnect } from './mockHealthConnect';

// Start with mock as default; if real Health Connect is available,
// replace it before any load() runs.
let connector: Connector = mockHealthConnect;

function makeRealConnector(): Connector {
  return {
    id: 'googleFit',
    name: 'Health Connect',
    description:
      'Read heart rate, sleep, steps, and workouts from Android Health Connect (synced from Huawei Watch via Google Fit)',
    sourceId: 'googleFit',
    category: 'health',
    setupGuide: [
      'Pair your Huawei Watch Fit 4 with the Huawei Health app',
      'In Huawei Health: Settings → Connected Devices → Google Fit → enable sync',
      'Install Health Connect from Google Play (Android 13) or use pre-installed (Android 14+)',
      'Return here and tap Connect — Health Connect will ask you to approve data access',
    ],
    async isConnected() {
      return healthConnect.isAuthorized();
    },
    async connect() {
      const auth = await healthConnect.authorize();
      if (auth.success) {
        return { success: true, message: 'Health Connect connected' };
      }
      return { success: false, message: auth.message ?? 'Authorization failed' };
    },
    async disconnect() {
      await healthConnect.disconnect();
    },
    async fetchSummary() {
      const summary = await healthConnect.getTodaySummary();
      return summary as DaySummary;
    },
    async fetchWorkouts() {
      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      const sessions = await healthConnect.getWorkoutSessions(
        start.toISOString(),
        now.toISOString()
      );
      return sessions.map((s) => ({
        id: s.sessionId,
        type: healthConnect.mapWorkoutType(s.activityType),
        durationMinutes: Math.round(
          (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 60000
        ),
        calories: s.calories ?? undefined,
        distance: s.distance ? s.distance / 1000 : undefined,
        startDate: s.startDate,
        endDate: s.endDate,
        source: 'googleFit',
      }));
    },
  };
}

// Try to upgrade to real Health Connect on module init
// (runs on the next tick, before React renders)
// Only checks SDK availability — does NOT call isAuthorized()
// because that would show a permission dialog at startup.
// The real connector is swapped in when the user taps "Connect" in UI.
let _swapped = false;

export function swapToRealConnector(): void {
  if (!_swapped) {
    _swapped = true;
    connector = makeRealConnector();
  }
}

Promise.resolve().then(async () => {
  try {
    const status = await healthConnect.getSdkStatus
      ? (await import('react-native-health-connect')).getSdkStatus('com.google.android.healthconnect')
      : 3; // default to available
    // Only swap if SDK is available AND already authorized
    // (e.g. user re-opened app after first-time permission grant)
    const authorized = await healthConnect.isAuthorized();
    if (authorized) {
      connector = makeRealConnector();
    }
  } catch {
    // real SDK unavailable — keep mock
  }
});

export const connectors: Record<string, Connector> = {
  apple: appleHealth,
  strava,
  garmin,
  googleFit: connector,
};

export const connectorList: Connector[] = [appleHealth, strava, garmin, connector];
