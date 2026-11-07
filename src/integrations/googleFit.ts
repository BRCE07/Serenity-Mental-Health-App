/**
 * Health Connect connector (v3 API) — bridges Huawei Watch Fit 4 → Huawei Health →
 * Google Fit → Health Connect → this app.
 *
 * Huawei Watch Fit 4 syncs to the Huawei Health app, which syncs to Google Fit.
 * Android 14+ includes Health Connect in the OS; on Android 13 it's a separate
 * install from Google Play. This connector reads real health data from Health Connect:
 * heart rate, sleep records, workouts, steps, and active minutes.
 *
 * Setup steps for the user:
 *   1. Pair Huawei Watch Fit 4 with the Huawei Health app on your phone
 *   2. In Huawei Health: Settings → Connected Devices → Google Fit → enable sync
 *   3. Install Health Connect from Google Play (Android 13 only; Android 14+ is pre-installed)
 *   4. In this app: Settings → Health Sources → Health Connect → Connect
 *   5. Approve the permission prompts when requested
 */

import {
  getSdkStatus,
  requestPermission,
  readRecords,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

// ─── Health Connect Provider Package ─────────────────────────────────────────

// Android 13–16: com.google.android.healthconnect
// Android 17+:  com.google.android.healthconnect (built-in; .controller is the launcher)
const HEALTH_CONNECT_PROVIDER =
  'com.google.android.healthconnect';

// ─── Permission Constants ────────────────────────────────────────────────────

// Health Connect v3 uses record-type-based permissions (not string-based)
// Format: { recordType: 'Steps', accessType: 'read' }
// See: react-native-health-connect/src/types/index.ts

const HEALTH_PERMISSIONS = [
  { recordType: 'Steps', accessType: 'read' as const },
  { recordType: 'HeartRate', accessType: 'read' as const },
  { recordType: 'Sleep', accessType: 'read' as const },
  { recordType: 'ActiveCaloriesBurned', accessType: 'read' as const },
  { recordType: 'ExerciseTime', accessType: 'read' as const },
  { recordType: 'Weight', accessType: 'read' as const },
  { recordType: 'Height', accessType: 'read' as const },
  { recordType: 'Speed', accessType: 'read' as const },
  { recordType: 'Distance', accessType: 'read' as const },
  { recordType: 'TotalCaloriesBurned', accessType: 'read' as const },
  { recordType: 'Session', accessType: 'read' as const },
  { recordType: 'ReadHealthDataHistory', accessType: 'read' as const },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HcHeartRateSample {
  startDate: string;
  endDate: string;
  bpm: number;
}

export interface HcSleepSample {
  startDate: string;
  endDate: string;
  stage: string;
}

export interface HcWorkoutSession {
  sessionId: string;
  activityType: string;
  startDate: string;
  endDate: string;
  calories?: number;
  distance?: number;
}

export interface HcDailyStepCount {
  date: string;
  steps: number;
}

export interface HcDailyMoveMinutes {
  date: string;
  minutes: number;
}

export interface HcNightlySleep {
  date: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  stages: Record<string, number>;
  dominantStage: string;
}

export interface DaySummaryData {
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRate?: number;
  sleepMinutes?: number;
  workouts: number;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function mapSleepStage(code: string): string {
  switch (code) {
    case 'AWAKE':
      return 'awake';
    case 'SLEEPING':
    case 'ASLEEP':
    case 'SLEEP':
      return 'asleep';
    case 'LIGHT':
      return 'light';
    case 'DEEP':
      return 'deep';
    case 'REM':
      return 'rem';
    default:
      return 'unknown';
  }
}

function mapActivityType(name: string): string {
  const map: Record<string, string> = {
    RUNNING: 'running',
    WALKING: 'walking',
    CYCLING: 'cycling',
    SWIMMING: 'swimming',
    HIKING: 'hiking',
    ROWING: 'rowing',
    WORKOUT: 'workout',
    STAIR_CLIMBING: 'stair_climbing',
    HIIT: 'hiit',
    YOGA: 'yoga',
    WALKING_NORDIC: 'walking_nordic',
    SKIING: 'skiing',
    TENNIS: 'tennis',
    BADMINTON: 'badminton',
    FOOTBALL_AMERICAN: 'football',
    FOOTBALL_ASSOCIATION: 'soccer',
    BASEBALL: 'baseball',
    BASKETBALL: 'basketball',
    GOLF: 'golf',
  };
  return map[name] || name.toLowerCase();
}

// ─── Connector class ─────────────────────────────────────────────────────────

class HealthConnectConnector {
  private sdkAvailable = false;
  private permissionsGranted = false;

  private async checkSdkStatus(): Promise<boolean> {
    try {
      const status = await getSdkStatus(HEALTH_CONNECT_PROVIDER);
      this.sdkAvailable = status === SdkAvailabilityStatus.SDK_AVAILABLE;
      return this.sdkAvailable;
    } catch {
      this.sdkAvailable = false;
      return false;
    }
  }

  async isAuthorized(): Promise<boolean> {
    const sdkOk = await this.checkSdkStatus();
    if (!sdkOk) return false;
    try {
      // Use getGrantedPermissions() — this is a silent check, no dialog
      const { getGrantedPermissions } = await import('react-native-health-connect');
      const granted = await getGrantedPermissions();
      this.permissionsGranted = granted.length > 0;
      return this.permissionsGranted;
    } catch {
      return false;
    }
  }

  async authorize(): Promise<{ success: boolean; message?: string }> {
    try {
      const sdkOk = await this.checkSdkStatus();
      if (!sdkOk) {
        return {
          success: false,
          message:
            'Health Connect is not installed. Install from Google Play (Android 13) or use Android 14+ where it is pre-installed.',
        };
      }

      const granted = await requestPermission(HEALTH_PERMISSIONS);
      this.permissionsGranted = granted.length > 0;

      if (this.permissionsGranted) {
        return { success: true, message: 'Health Connect connected' };
      }
      return {
        success: false,
        message:
          'Permissions denied. Please open Health Connect settings and grant access to your health data.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `Health Connect error: ${msg}` };
    }
  }

  async openSettings(): Promise<void> {
    openHealthConnectSettings();
  }

  async disconnect(): Promise<void> {
    this.sdkAvailable = false;
    this.permissionsGranted = false;
  }

  // ─── Heart Rate ───────────────────────────────────────────────────────────

  async getHeartRate(): Promise<HcHeartRateSample[]> {
    if (!(await this.checkSdkStatus())) return [];
    if (!(await this.isAuthorized())) return [];

    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    try {
      const res = await readRecords('HeartRate', {
        startTime: start.toISOString(),
        endTime: today.toISOString(),
      });

      return res.records
        .map((r: any) => ({
          startDate: r.startTime,
          endDate: r.endTime,
          bpm: parseInt(r.values.beatsPerMinute, 10),
        }))
        .filter(r => r.bpm > 0);
    } catch {
      return [];
    }
  }

  async getDailyAvgHeartRate(
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    if (!(await this.checkSdkStatus())) return {};

    try {
      const res = await readRecords('HeartRate', {
        startTime: startDate,
        endTime: endDate,
      });

      const map: Record<string, number[]> = {};
      for (const r of res.records) {
        const d = r.startTime.split('T')[0];
        const bpm = parseInt(r.values.beatsPerMinute, 10);
        if (bpm <= 0) continue;
        if (!map[d]) map[d] = [];
        map[d].push(bpm);
      }
      const result: Record<string, number> = {};
      for (const [d, vals] of Object.entries(map)) {
        result[d] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
      return result;
    } catch {
      return {};
    }
  }

  // ─── Sleep ────────────────────────────────────────────────────────────────

  async getSleepData(): Promise<HcSleepSample[]> {
    if (!(await this.checkSdkStatus())) return [];
    if (!(await this.isAuthorized())) return [];

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    try {
      const res = await readRecords('Sleep', {
        startTime: weekAgo.toISOString(),
        endTime: today.toISOString(),
      });

      return res.records
        .map((r: any) => ({
          startDate: r.startTime,
          endDate: r.endTime,
          stage: mapSleepStage(r.values.stage),
        }))
        .sort((a: any, b: any) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
    } catch {
      return [];
    }
  }

  async getNightlySleep(
    startDate: string,
    endDate: string
  ): Promise<HcNightlySleep[]> {
    if (!(await this.checkSdkStatus())) return [];

    try {
      const res = await readRecords('Sleep', {
        startTime: startDate,
        endTime: endDate,
      });

      const groups: Record<string, any[]> = {};
      for (const r of res.records) {
        const d = r.startTime.split('T')[0];
        if (!groups[d]) groups[d] = [];
        groups[d].push(r);
      }

      return Object.entries(groups)
        .map(([nightDate, records]) => {
          records.sort(
            (a: any, b: any) =>
              new Date(a.startTime).getTime() -
              new Date(b.startTime).getTime()
          );
          const startTime = records[0].startTime;
          const endTime = records[records.length - 1].endTime;
          const durationMs =
            new Date(endTime).getTime() - new Date(startTime).getTime();

          const stages: Record<string, number> = {};
          let dominantStage = 'asleep';
          let maxDur = 0;
          for (const r of records) {
            const stage = mapSleepStage(r.values.stage);
            const dur =
              new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
            stages[stage] = (stages[stage] || 0) + dur;
            if (dur > maxDur) {
              maxDur = dur;
              dominantStage = stage;
            }
          }

          return {
            date: nightDate,
            startTime,
            endTime,
            durationMs,
            stages,
            dominantStage,
          };
        })
        .sort((a: any, b: any) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  // ─── Steps ────────────────────────────────────────────────────────────────

  async getDailySteps(
    startDate: string,
    endDate: string
  ): Promise<HcDailyStepCount[]> {
    if (!(await this.checkSdkStatus())) return [];

    try {
      const res = await readRecords('Steps', {
        startTime: startDate,
        endTime: endDate,
      });

      const map: Record<string, number> = {};
      for (const r of res.records) {
        const d = r.startTime.split('T')[0];
        map[d] = (map[d] || 0) + parseInt(r.values.count, 10);
      }
      return Object.entries(map)
        .map(([date, steps]) => ({ date, steps }))
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  // ─── Calories ─────────────────────────────────────────────────────────────

  async getDailyCalories(
    startDate: string,
    endDate: string
  ): Promise<Record<string, number>> {
    if (!(await this.checkSdkStatus())) return {};

    try {
      const res = await readRecords('ActiveCaloriesBurned', {
        startTime: startDate,
        endTime: endDate,
      });

      const map: Record<string, number> = {};
      for (const r of res.records) {
        const d = r.startTime.split('T')[0];
        map[d] = (map[d] || 0) + parseFloat(r.values.totalCalories);
      }
      return map;
    } catch {
      return {};
    }
  }

  // ─── Active Minutes ──────────────────────────────────────────────────────

  async getDailyMoveMinutes(
    startDate: string,
    endDate: string
  ): Promise<HcDailyMoveMinutes[]> {
    if (!(await this.checkSdkStatus())) return [];

    try {
      const res = await readRecords('ExerciseTime', {
        startTime: startDate,
        endTime: endDate,
      });

      const map: Record<string, number> = {};
      for (const r of res.records) {
        const d = r.startTime.split('T')[0];
        const mins = parseFloat(r.values.totalDuration) / 60000;
        map[d] = (map[d] || 0) + mins;
      }
      return Object.entries(map)
        .map(([date, minutes]) => ({ date, minutes: Math.round(minutes) }))
        .sort((a, b) => b.date.localeCompare(a.date));
    } catch {
      return [];
    }
  }

  // ─── Workouts / Sessions ──────────────────────────────────────────────────

  async getWorkoutSessions(
    startDate: string,
    endDate: string
  ): Promise<HcWorkoutSession[]> {
    if (!(await this.checkSdkStatus())) return [];

    try {
      const res = await readRecords('Session', {
        startTime: startDate,
        endTime: endDate,
      });

      return res.records
        .map((r: any) => ({
          sessionId: r.metadata?.sessionId || r.startTime,
          activityType: r.name || 'workout',
          startDate: r.startTime,
          endDate: r.endTime,
          calories: r.totalCaloriesBurned
            ? parseFloat(r.totalCaloriesBurned)
            : undefined,
          distance: r.totalDistance ? parseFloat(r.totalDistance) : undefined,
        }))
        .sort((a: any, b: any) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
    } catch {
      return [];
    }
  }

  // ─── Today Summary ────────────────────────────────────────────────────────

  async getTodaySummary(): Promise<DaySummaryData> {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const todayStr = now.toISOString().split('T')[0];
    const startDate = start.toISOString();
    const endDate = now.toISOString();

    const [
      steps,
      calories,
      moveMinutes,
      avgHr,
      nightlySleep,
      sessions,
    ] = await Promise.all([
      this.getDailySteps(startDate, endDate),
      this.getDailyCalories(startDate, endDate),
      this.getDailyMoveMinutes(startDate, endDate),
      this.getDailyAvgHeartRate(startDate, endDate),
      this.getNightlySleep(startDate, endDate),
      this.getWorkoutSessions(startDate, endDate),
    ]);

    const totalSteps =
      steps.find(s => s.date === todayStr)?.steps ??
      steps.reduce((a, b) => a + b.steps, 0);
    const totalCal =
      calories[todayStr] ?? Object.values(calories).reduce((a, b) => a + b, 0);
    const totalMoveMin =
      moveMinutes.find(m => m.date === todayStr)?.minutes ??
      moveMinutes.reduce((a, b) => a + b.minutes, 0);
    const hr = avgHr[todayStr];
    const sleepMin =
      nightlySleep[0] !== undefined
        ? Math.round(nightlySleep[0].durationMs / 60000)
        : undefined;

    return {
      steps: totalSteps,
      calories: Math.round(totalCal),
      activeMinutes: totalMoveMin,
      heartRate: hr,
      sleepMinutes: sleepMin,
      workouts: sessions.length,
    };
  }

  mapWorkoutType(name: string): string {
    return mapActivityType(name);
  }
}

export const healthConnect = new HealthConnectConnector();
export default healthConnect;
