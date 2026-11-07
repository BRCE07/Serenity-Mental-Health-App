/**
 * Mock Health Connect connector.
 * Generates realistic, time-seeded health data when the real
 * Health Connect SDK is unavailable (e.g. on emulators or
 * phones without Health Connect installed).
 *
 * Seed = YYYYMMDD, so data is deterministic for the whole day
 * but different each day — no two days look identical.
 *
 * On the real `connect()` path: delegates to the actual Health Connect
 * SDK to show the permission dialog. If authorization succeeds, the
 * registry swaps in the real connector automatically.
 */
import { ConnectorResult, DaySummary, Workout } from '../types';

// Import real SDK inside connect() to avoid circular import issues
const getRealSDK = () => require('../integrations/googleFit').healthConnect;
const getSwapper = () => require('../integrations/registry').swapToRealConnector;

// ─── Seeded PRNG (mulberry32) ───────────────────────────────
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul((a ^ (a >>> 15)) | 0, 1 | a);
    t = (t + Math.imul(t, t) | 0) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ─── Helpers ────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const daysAgo = (n: number, hour = 7, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

// ─── Mock Connector ─────────────────────────────────────────
let _mockConnected = true;

const mockHealthConnect: Connector = {
  id: 'googleFit',
  name: 'Health Connect',
  tagline: 'Syncs from your Huawei Watch — simulated on this device',
  available: true,
  setupGuide: [
    'Health Connect SDK not available on this device.',
    'This connector generates realistic mock data.',
    'To use real data, pair your Huawei Watch Fit 4 via Google Fit',
    'on a real Android phone with Health Connect installed.',
  ],

  async isConnected() {
    return _mockConnected; // toggled by disconnect()
  },

  async authorize(): Promise<ConnectorResult> {
    // Delegate to real SDK to show the permission dialog
    try {
      const sdk = getRealSDK();
      const result = await sdk.authorize();
      if (result.success) {
        getSwapper()(); // swap to real connector
        _mockConnected = true;
        return { success: true, message: 'Health Connect connected' };
      }
      return { success: false, error: result.message ?? 'Authorization failed' };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'Authorization failed' };
    }
  },

  async connect(): Promise<ConnectorResult> {
    // Delegate to real SDK to show the permission dialog
    try {
      const sdk = getRealSDK();
      const result = await sdk.authorize();
      if (result.success) {
        getSwapper()(); // swap to real connector
        _mockConnected = true;
        return { success: true, message: 'Health Connect connected' };
      }
      return { success: false, error: result.message ?? 'Authorization failed' };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'Authorization failed' };
    }
  },

  async disconnect() {
    try {
      const sdk = getRealSDK();
      await sdk.disconnect();
    } catch {
      // SDK may not be available
    }
    _mockConnected = false;
  },

  async fetchSummary(): Promise<DaySummary> {
    const rng = mulberry32(daySeed());

    const pick = (lo: number, hi: number) =>
      Math.round(lo + rng() * (hi - lo));
    const pickF = (lo: number, hi: number) =>
      lo + rng() * (hi - lo);

    const steps = pick(4200, 13500);
    const activeMin = pick(20, 90);
    const calories = pick(350, 900);
    const restingHr = pick(48, 68);
    const hrv = pick(35, 95);
    const sleepMinutes = pick(360, 540); // 6h–9h
    const sleepScore = pick(65, 96);
    const deepMin = pick(40, 120);
    const remMin = pick(50, 150);
    const coreMin = pick(120, 260);
    const awakeMin = pick(5, 40);

    // HR curve for the day (48 half-hour slots)
    const hrToday: number[] = Array.from({ length: 48 }, (_, i) => {
      const base = 58 + Math.sin((i / 5) * Math.PI) * 6;
      // simulate exercise spike around midday / evening
      const spike = i > 18 && i < 24 ? pickF(-20, 30) : 0;
      return clamp(Math.round(base + spike + ((i * 7 + pick(0, 4)) % 5)), 45, 180);
    });

    // 7-day step history
    const weekSteps = Array.from({ length: 7 }, () =>
      pick(3500, 14000)
    );

    // 7-day HRV
    const weekHrv = Array.from({ length: 7 }, () => pick(30, 90));

    // 7-day resting HR
    const weekRhr = Array.from({ length: 7 }, () => pick(48, 68));

    return {
      steps,
      stepsGoal: 10000,
      activeMinutes: activeMin,
      activeGoal: 60,
      calories,
      caloriesGoal: 700,
      restingHr,
      hrv,
      sleepMinutes,
      sleepScore,
      sleepStages: { deep: deepMin, core: coreMin, rem: remMin, awake: awakeMin },
      hrToday,
      weekSteps,
      weekHrv,
      weekRhr,
    };
  },

  async fetchWorkouts(): Promise<Workout[]> {
    const rng = mulberry32(daySeed());
    const pick = (lo: number, hi: number) =>
      Math.round(lo + rng() * (hi - lo));
    const pickF = (lo: number, hi: number) =>
      lo + rng() * (hi - lo);

    const activities: { type: string; icon: string; name: string }[] = [
      { type: 'Run', icon: 'run', name: 'Morning run' },
      { type: 'Walk', icon: 'walk', name: 'Evening walk' },
      { type: 'Ride', icon: 'bike', name: 'Bike commute' },
      { type: 'WeightTraining', icon: 'strength', name: 'Gym session' },
      { type: 'Yoga', icon: 'yoga', name: 'Yoga flow' },
      { type: 'Swim', icon: 'swim', name: 'Pool swim' },
    ];

    const nWorkouts = pick(1, 3);
    const workouts: Workout[] = [];

    for (let i = 0; i < nWorkouts; i++) {
      const act = activities[pick(0, activities.length - 1)];
      const durationMin = pick(15, 90);
      const avgHr = pick(90, 170);
      const distanceM = act.type === 'Run' || act.type === 'Walk'
        ? pick(1000, 8000)
        : act.type === 'Ride'
        ? pick(5000, 35000)
        : 0;
      const cal = pick(120, 700);

      workouts.push({
        id: `m${i}`,
        source: 'googleFit',
        type: act.type,
        name: act.name,
        startDate: daysAgo(i, 6 + pick(0, 14), pick(0, 59)),
        distanceM,
        movingSec: durationMin * 60,
        avgHr,
        calories: cal,
        elevM: act.type === 'Run' ? pick(0, 300) : act.type === 'Ride' ? pick(0, 800) : 0,
      });
    }

    workouts.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
    return workouts;
  },
};

export { mockHealthConnect };
