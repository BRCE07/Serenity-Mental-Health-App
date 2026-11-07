/**
 * API client — talks to the Serenity backend.
 * Server is configured via API_URL env var, defaults to localhost:3000.
 */

const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'http://<YOUR_SERVER_IP>:3000';

interface AuthResponse {
  user: { id: number; email: string; username: string };
  token: string;
}

interface ServerSummary {
  id: number;
  user_id: number;
  date: string;
  steps: number;
  steps_goal: number;
  active_minutes: number;
  active_goal: number;
  calories: number;
  calories_goal: number;
  resting_hr: number | null;
  hrv_ms: number | null;
  sleep_minutes: number | null;
  sleep_score: number | null;
  deep_sleep_min: number | null;
  core_sleep_min: number | null;
  rem_sleep_min: number | null;
  awake_min: number | null;
  week_steps: string | null;
  week_hrv: string | null;
  week_rhr: string | null;
}

interface ServerWorkout {
  id: number;
  user_id: number;
  type: string;
  name: string | null;
  start_date: string;
  end_date: string | null;
  distance_meters: number;
  duration_seconds: number;
  avg_heart_rate: number | null;
  elevation_m: number | null;
  calories: number | null;
  source: string;
}

function withAuth(headers: Record<string, string> = {}): Record<string, string> {
  return { 'Content-Type': 'application/json', ...headers };
}

async function fetchJson<T>(url: string, options: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────

export async function apiRegister(email: string, password: string, username: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: withAuth(),
    body: JSON.stringify({ email, password, username }),
  });
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: withAuth(),
    body: JSON.stringify({ email, password }),
  });
}

export async function apiProfile(token: string): Promise<{ user: { id: number; email: string; username: string; created_at: string } }> {
  return fetchJson(`${API_URL}/api/user`, {
    headers: withAuth({ Authorization: `Bearer ${token}` }),
  });
}

export async function apiHealthCheck(): Promise<{ ok: boolean; db: string }> {
  return fetchJson(`${API_URL}/api/health`, { method: 'GET' });
}

// ─── Summaries ───────────────────────────────────────────────

export async function apiSaveSummary(token: string, summary: {
  date: string;
  steps: number;
  steps_goal: number;
  active_minutes: number;
  active_goal: number;
  calories: number;
  calories_goal: number;
  resting_hr?: number | null;
  hrv_ms?: number | null;
  sleep_minutes?: number | null;
  sleep_score?: number | null;
  sleep_stages?: { deep: number; core: number; rem: number; awake: number };
  week_steps?: number[];
  week_hrv?: number[];
  week_rhr?: number[];
}): Promise<void> {
  await fetchJson(`${API_URL}/api/summaries`, {
    method: 'POST',
    headers: withAuth({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify(summary),
  });
}

export async function apiGetSummaries(token: string, from?: string, to?: string): Promise<{ summaries: ServerSummary[] }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return fetchJson(`${API_URL}/api/summaries${qs ? '?' + qs : ''}`, {
    headers: withAuth({ Authorization: `Bearer ${token}` }),
  });
}

// ─── Workouts ────────────────────────────────────────────────

export async function apiSaveWorkout(token: string, workout: {
  type: string;
  name?: string;
  start_date: string;
  end_date?: string;
  distance_meters?: number;
  duration_seconds?: number;
  avg_heart_rate?: number;
  elevation_m?: number;
  calories?: number;
  source?: string;
}): Promise<{ id: number; ok: boolean }> {
  return fetchJson(`${API_URL}/api/workouts`, {
    method: 'POST',
    headers: withAuth({ Authorization: `Bearer ${token}` }),
    body: JSON.stringify(workout),
  });
}

export async function apiGetWorkouts(token: string, from?: string, to?: string): Promise<{ workouts: ServerWorkout[] }> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return fetchJson(`${API_URL}/api/workouts${qs ? '?' + qs : ''}`, {
    headers: withAuth({ Authorization: `Bearer ${token}` }),
  });
}

// ─── Server Config ───────────────────────────────────────────

export { API_URL };
