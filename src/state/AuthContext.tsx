import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DaySummary, SourceId, Workout } from '../types';
import { demoSummary, demoWorkouts } from '../data/demo';
import { getUser, saveSummary, loadLatestSummary, saveWorkout, loadWorkouts, getUser as getUserStored } from '../lib/localStorage';

type Connections = Record<SourceId, boolean>;

interface AuthState {
  user: { id: number; email: string; username: string } | null;
  token: string | null;
  login(email: string, password: string): Promise<{ ok: boolean; error?: string }>;
  register(email: string, password: string, username: string): Promise<{ ok: boolean; error?: string }>;
  logout(): Promise<void>;
  isAuthenticated: boolean;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; email: string; username: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Always show login gate on app launch.
    // Stored credentials are cleared so the auth screen appears every time.
    getUserStored().then(() => {
      setUser(null);
      setToken(null);
    }).catch(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { apiLogin } = await import('../lib/api');
      const { setUser: setStored } = await import('../lib/localStorage');
      const resp = await apiLogin(email, password);
      const localUser = { id: resp.user.id, email: resp.user.email, username: resp.user.username, token: resp.token };
      await setStored(localUser);
      setUser(localUser);
      setToken(localUser.token);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'Login failed' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { apiRegister } = await import('../lib/api');
      const { setUser: setStored } = await import('../lib/localStorage');
      const resp = await apiRegister(email, password, username);
      const localUser = { id: resp.user.id, email: resp.user.email, username: resp.user.username, token: resp.token };
      await setStored(localUser);
      setUser(localUser);
      setToken(localUser.token);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'Registration failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    const { clearUser } = await import('../lib/localStorage');
    await clearUser();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  }), [user, token, login, register, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
