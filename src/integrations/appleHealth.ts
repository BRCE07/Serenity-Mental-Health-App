import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Connector, DaySummary, SleepStages, Workout } from '../types';

/**
 * Apple Health (HealthKit). Apple Watch data syncs into HealthKit automatically,
 * so reading HealthKit is how Lumen supports Apple Watch.
 *
 * Requires a custom dev build on a real iPhone (not Expo Go, not the simulator for most data):
 *   npx expo prebuild && npx expo run:ios --device
 */

const FLAG_KEY = 'lumen.apple.connected';
const isIOS = Platform.OS === 'ios';

let HK: any = null;
function kit() {
  if (!HK) HK = require('react-native-health').default;
  return HK;
}

const call = <T,>(method: string, opts: any = {}) =>
  new Promise<T>((resolve, reject) => {
    kit()[method](opts, (err: any, res: T) => (err ? reject(new Error(String(err))) : resolve(res)));
  });

const startOfDay = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
};

function downsample(values: number[], target: number): number[] {
  if (values.length <= target) return values;
  const size = values.length / target;
  return Array.from({ length: target }, (_, i) => {
    const slice = values.slice(Math.floor(i * size), Math.floor((i + 1) * size));
    return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
  });
}

async function sleepData(): Promise<{ minutes: number; stages: SleepStages; score: number } | null> {
  const start = startOfDay(1);
  start.setHours(18);
  const samples = await call<any[]>('getSleepSamples', {
    startDate: start.toISOString(),
    endDate: new Date().toISOString(),
  });
  const stages: SleepStages = { deep: 0, core: 0, rem: 0, awake: 0 };
  for (const s of samples) {
    const mins = (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 60000;
    switch (String(s.value).toUpperCase()) {
      case 'DEEP': stages.deep += mins; break;
      case 'CORE': case 'ASLEEP': stages.core += mins; break;
      case 'REM': stages.rem += mins; break;
      case 'AWAKE': stages.awake += mins; break;
    }
  }
  const minutes = stages.deep + stages.core + stages.rem;
  if (minutes < 30) return null;
  // Simple score: 8h of sleep = 100, lightly penalise awake time
  const score = Math.round(Math.max(0, Math.min(100, (minutes / 480) * 100 - stages.awake * 0.2)));
  return { minutes: Math.round(minutes), stages, score };
}

export const appleHealth: Connector = {
  id: 'apple',
  name: 'Apple Health',
  tagline: 'Apple Watch steps, heart rate, sleep and workouts',
  available: isIOS,
  unavailableReason: 'Apple Health is only available on iPhone.',

  async isConnected() {
    return isIOS && (await SecureStore.getItemAsync(FLAG_KEY)) === '1';
  },

  async connect() {
    if (!isIOS) throw new Error('Apple Health is only available on iPhone.');
    const { Permissions } = kit().Constants;
    const permissions = {
      permissions: {
        read: [
          Permissions.Steps,
          Permissions.HeartRate,
          Permissions.RestingHeartRate,
          Permissions.HeartRateVariability,
          Permissions.SleepAnalysis,
          Permissions.ActiveEnergyBurned,
          Permissions.AppleExerciseTime,
          Permissions.Workout,
        ],
        write: [],
      },
    };
    await new Promise<void>((resolve, reject) => {
      kit().initHealthKit(permissions, (err: any) => (err ? reject(new Error(String(err))) : resolve()));
    });
    // HealthKit never reveals whether READ access was granted, so we just remember we asked.
    await SecureStore.setItemAsync(FLAG_KEY, '1');
  },

  async disconnect() {
    // Read permissions can only be revoked in iOS Settings > Health > Data Access.
    await SecureStore.deleteItemAsync(FLAG_KEY);
  },

  async fetchSummary(): Promise<Partial<DaySummary>> {
    const out: Partial<DaySummary> = {};
    const now = new Date().toISOString();

    // Steps for the last 7 days
    const week: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const r = await call<{ value: number }>('getStepCount', { date: startOfDay(i).toISOString(), includeManuallyAdded: true });
      week.push(Math.round(r?.value ?? 0));
    }
    out.weekSteps = week;
    out.steps = week[6];

    // Heart rate today
    const hr = await call<any[]>('getHeartRateSamples', {
      startDate: startOfDay().toISOString(), endDate: now, ascending: true,
    });
    if (hr.length) out.hrToday = downsample(hr.map((s) => Math.round(s.value)), 48);

    // Resting heart rate
    try {
      const r = await call<{ value: number }>('getRestingHeartRate', {});
      if (r?.value) out.restingHr = Math.round(r.value);
    } catch { /* no data */ }

    // HRV (HealthKit stores SDNN; the library may report seconds, so normalise to ms)
    try {
      const hrv = await call<any[]>('getHeartRateVariabilitySamples', {
        startDate: startOfDay(1).toISOString(), endDate: now,
      });
      if (hrv.length) {
        const v = hrv[hrv.length - 1].value;
        out.hrv = Math.round(v < 1 ? v * 1000 : v);
      }
    } catch { /* no data */ }

    // Sleep
    try {
      const sl = await sleepData();
      if (sl) {
        out.sleepMinutes = sl.minutes;
        out.sleepStages = sl.stages;
        out.sleepScore = sl.score;
      }
    } catch { /* no data */ }

    // Active energy
    try {
      const e = await call<any[]>('getActiveEnergyBurned', { startDate: startOfDay().toISOString(), endDate: now });
      out.calories = Math.round(e.reduce((a, s) => a + (s.value ?? 0), 0));
    } catch { /* no data */ }

    return out;
  },

  async fetchWorkouts(): Promise<Workout[]> {
    const res = await call<any>('getAnchoredWorkouts', {
      startDate: startOfDay(30).toISOString(), endDate: new Date().toISOString(),
    });
    const MILE = 1609.34; // react-native-health returns miles by default
    return (res?.data ?? []).map((w: any) => ({
      id: `apple-${w.id ?? w.start}`,
      source: 'apple' as const,
      type: String(w.activityName ?? 'Workout'),
      name: String(w.activityName ?? 'Workout'),
      startDate: w.start,
      distanceM: (w.distance ?? 0) * MILE,
      movingSec: Math.max(0, (new Date(w.end).getTime() - new Date(w.start).getTime()) / 1000),
      calories: w.calories ? Math.round(w.calories) : undefined,
    }));
  },
};
