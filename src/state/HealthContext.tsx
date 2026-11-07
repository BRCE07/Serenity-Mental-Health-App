import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DaySummary, SourceId, Workout } from '../types';
import { demoSummary, demoWorkouts } from '../data/demo';
import { connectors, swapToRealConnector } from '../integrations/registry';
import { useAuth } from './AuthContext';
import {
  saveSummary, loadLatestSummary, saveWorkout, loadWorkouts,
} from '../lib/localStorage';
import { apiSaveSummary, apiSaveWorkout } from '../lib/api';

type Connections = Record<SourceId, boolean>;

interface HealthState {
  summary: DaySummary;
  workouts: Workout[];
  connections: Connections;
  /** true while nothing is connected and we're showing sample data */
  isDemo: boolean;
  busy: SourceId | null;
  error: string | null;
  connect(id: SourceId): Promise<void>;
  disconnect(id: SourceId): Promise<void>;
  refresh(): Promise<void>;
  /** Persist a summary to local storage + server */
  saveToStorage(summary: DaySummary): Promise<void>;
  /** Persist a workout to local storage + server */
  saveWorkoutToStorage(workout: Workout): Promise<void>;
}

const Ctx = createContext<HealthState | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DaySummary>(demoSummary);
  const [workouts, setWorkouts] = useState<Workout[]>(demoWorkouts);
  const [connections, setConnections] = useState<Connections>({ apple: false, strava: false, garmin: false, googleFit: false });
  const [busy, setBusy] = useState<SourceId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const conn: Connections = { apple: false, strava: false, garmin: false, googleFit: false };
    for (const id of Object.keys(connectors) as SourceId[]) {
      conn[id] = await connectors[id].isConnected().catch(() => false);
    }
    setConnections(conn);

    let nextSummary = demoSummary;
    let realWorkouts: Workout[] = [];
    const errors: string[] = [];

    // First, load from local storage
    const localSummary = await loadLatestSummary();
    if (localSummary) nextSummary = localSummary;

    const localWorkouts = await loadWorkouts();
    if (localWorkouts.length > 0) realWorkouts = localWorkouts;

    // Then, try to fetch from connected sources
    for (const id of Object.keys(conn) as SourceId[]) {
      if (!conn[id]) continue;
      const c = connectors[id];
      try {
        if (c.fetchSummary) nextSummary = { ...nextSummary, ...(await c.fetchSummary()) };
        if (c.fetchWorkouts) realWorkouts = realWorkouts.concat(await c.fetchWorkouts());
      } catch (e: any) {
        errors.push(`${c.name}: ${e?.message ?? 'failed to sync'}`);
      }
    }

    const anyConnected = Object.values(conn).some(Boolean);
    realWorkouts.sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));
    setSummary(nextSummary);
    setWorkouts(realWorkouts.length ? realWorkouts : demoWorkouts);
    setError(errors.length ? errors.join('\n') : null);

    // Auto-save loaded data to local storage so it persists across sessions
    if (nextSummary !== demoSummary || anyConnected) {
      await saveSummary(nextSummary);
    }
    if (realWorkouts.length > 0) {
      // Merge with existing workouts (avoid duplicates)
      const existing = await loadWorkouts();
      const existingIds = new Set(existing.map(w => `${w.id}-${w.startDate}`));
      const newOnes = realWorkouts.filter(w => !existingIds.has(`${w.id}-${w.startDate}`));
      if (newOnes.length) newOnes.forEach(saveWorkout);
    }
  }, []);

  // Save summary to local storage + server
  const saveToStorage = useCallback(async (s: DaySummary) => {
    await saveSummary(s);
    if (token) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await apiSaveSummary(token, {
          date: today,
          steps: s.steps ?? 0,
          steps_goal: s.stepsGoal ?? 10000,
          active_minutes: s.activeMinutes ?? 0,
          active_goal: s.activeGoal ?? 60,
          calories: s.calories ?? 0,
          calories_goal: s.caloriesGoal ?? 700,
          resting_hr: s.restingHR ?? null,
          hrv_ms: s.hrv ?? null,
          sleep_minutes: s.sleepMinutes ?? null,
          sleep_score: s.sleepScore ?? null,
          sleep_stages: s.sleepStages || { deep: 0, core: 0, rem: 0, awake: 0 },
        });
      } catch { /* offline — local save already worked */ }
    }
  }, [token]);

  // Save workout to local storage + server
  const saveWorkoutToStorage = useCallback(async (w: Workout) => {
    await saveWorkout(w);
    if (token) {
      try {
        await apiSaveWorkout(token, {
          type: w.type,
          name: w.name,
          start_date: new Date(w.startDate).toISOString(),
          end_date: w.endDate ? new Date(w.endDate).toISOString() : undefined,
          distance_meters: w.distance ?? 0,
          duration_seconds: w.duration ?? 0,
          avg_heart_rate: w.heartRate,
          elevation_m: w.elevation,
          calories: w.calories,
          source: w.source,
        });
      } catch { /* offline — local save already worked */ }
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const connect = useCallback(async (id: SourceId) => {
    setBusy(id);
    setError(null);
    try {
      const result = await connectors[id].connect();
      if (result && !result.success) {
        setError(result.error ?? result.message ?? 'Connection failed');
        return;
      }
      // Swap to real connector after successful Google Fit auth
      // so all future load() calls use the real SDK, not mock
      if (id === 'googleFit') {
        swapToRealConnector();
      }
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Could not connect');
    } finally {
      setBusy(null);
    }
  }, [load]);

  const disconnect = useCallback(async (id: SourceId) => {
    setBusy(id);
    try {
      await connectors[id].disconnect();
      await load();
    } finally {
      setBusy(null);
    }
  }, [load]);

  const value = useMemo<HealthState>(
    () => ({
      summary,
      workouts,
      connections,
      isDemo: !Object.values(connections).some(Boolean),
      busy,
      error,
      connect,
      disconnect,
      refresh: load,
      saveToStorage,
      saveWorkoutToStorage,
    }),
    [summary, workouts, connections, busy, error, connect, disconnect, load, saveToStorage, saveWorkoutToStorage],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHealth(): HealthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHealth must be used inside HealthProvider');
  return v;
}
