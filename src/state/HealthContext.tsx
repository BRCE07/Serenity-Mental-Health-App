import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DaySummary, SourceId, Workout } from '../types';
import { demoSummary, demoWorkouts } from '../data/demo';
import { connectors, swapToRealConnector } from '../integrations/registry';

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
}

const Ctx = createContext<HealthState | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
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
    setSummary(anyConnected ? nextSummary : demoSummary);
    setWorkouts(anyConnected && realWorkouts.length ? realWorkouts : anyConnected ? [] : demoWorkouts);
    setError(errors.length ? errors.join('\n') : null);
  }, []);

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
    }),
    [summary, workouts, connections, busy, error, connect, disconnect, load],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHealth(): HealthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHealth must be used inside HealthProvider');
  return v;
}
