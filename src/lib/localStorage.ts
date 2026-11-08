/**
 * Local storage adapter — saves all health data to AsyncStorage
 * so the app works offline immediately, without any external setup.
 * Auth credentials (tokens) are stored in SecureStore for encryption.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DaySummary, Workout } from '../types';

const KEY_USER = 'serenity:user';
const KEY_SUMMARY = 'serenity:summary';
const KEY_WORKOUTS = 'serenity:workouts';
const KEY_TOKEN = 'serenity:token';

export interface LocalUser {
  id: number;
  email: string;
  username: string;
  token: string;
}

export async function getUser(): Promise<LocalUser | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_USER);
    const token = await SecureStore.getItemAsync(KEY_TOKEN);
    if (!raw || !token) return null;
    const user = JSON.parse(raw) as LocalUser;
    return { ...user, token };
  } catch { return null; }
}

export async function setUser(user: LocalUser): Promise<void> {
  // Extract token for SecureStore; store rest in AsyncStorage
  const { token, ...userWithoutToken } = user;
  await AsyncStorage.setItem(KEY_USER, JSON.stringify(userWithoutToken));
  await SecureStore.setItemAsync(KEY_TOKEN, token);
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEY_USER);
  await SecureStore.deleteItemAsync(KEY_TOKEN);
}

// ─── Day Summary ─────────────────────────────────────────────

function summaryKey(date: string): string {
  return `${KEY_SUMMARY}:${date}`;
}

export async function saveSummary(summary: DaySummary): Promise<void> {
  const key = summaryKey(new Date().toISOString().split('T')[0]);
  await AsyncStorage.setItem(key, JSON.stringify(summary));
  // Also keep a "latest" key for quick access
  await AsyncStorage.setItem(KEY_SUMMARY, JSON.stringify(summary));
}

export async function loadLatestSummary(): Promise<DaySummary | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SUMMARY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function loadSummaryByDate(date: string): Promise<DaySummary | null> {
  try {
    const raw = await AsyncStorage.getItem(summaryKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function getAllSummaries(): Promise<DaySummary[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const summaryKeys = keys.filter(k => k.startsWith(KEY_SUMMARY) && k !== KEY_SUMMARY);
    const values = await AsyncStorage.multiGet(summaryKeys);
    return values
      .filter(([_, v]) => v !== null)
      .map(([_, v]) => JSON.parse(v!)) as DaySummary[];
  } catch { return []; }
}

// ─── Workouts ────────────────────────────────────────────────

export async function saveWorkout(workout: Workout): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY_WORKOUTS);
  const list: Workout[] = raw ? JSON.parse(raw) : [];
  list.push(workout);
  await AsyncStorage.setItem(KEY_WORKOUTS, JSON.stringify(list));
}

export async function loadWorkouts(): Promise<Workout[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_WORKOUTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function clearWorkouts(): Promise<void> {
  await AsyncStorage.removeItem(KEY_WORKOUTS);
}

// ─── Clear All ───────────────────────────────────────────────

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEY_USER, KEY_SUMMARY, KEY_WORKOUTS,
  ]);
}
