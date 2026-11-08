import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  Booking, Contact, JournalEntry, MindData, MoodEntry, Post, Region, ReminderSettings,
} from '../mind/types';
import { randomAlias } from '../mind/content';
import { applyReminders } from '../mind/notifications';

const KEY = 'lumen.mind.v1';
const KEY_ENCRYPTED = 'lumen.mind.encrypted';

const defaults = (): MindData => ({
  moods: [],
  journal: [],
  bookings: [],
  posts: [],
  hugged: [],
  contacts: [],
  region: 'PH',
  reminders: {
    checkin: { on: false, h: 20, m: 0 },
    journal: { on: false, h: 21, m: 0 },
    motivation: { on: false, h: 9, m: 0 },
  },
  alias: randomAlias(),
});

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface MindState {
  data: MindData;
  loaded: boolean;
  /** Latest mood logged today (1-5) or null */
  todayMood: number | null;
  addMood(e: Omit<MoodEntry, 'id' | 'date'>): void;
  saveJournal(e: { id?: string; title: string; body: string }): void;
  deleteJournal(id: string): void;
  addBooking(b: Omit<Booking, 'id' | 'status'>): void;
  cancelBooking(id: string): void;
  addPost(text: string): void;
  deletePost(id: string): void;
  toggleHug(id: string): void;
  newAlias(): void;
  addContact(c: Omit<Contact, 'id'>): void;
  removeContact(id: string): void;
  setRegion(r: Region): void;
  setReminders(r: ReminderSettings): Promise<void>;
  /** Average mood for each of the last n days, oldest first. null = no entries */
  moodByDay(n: number): (number | null)[];
}

const Ctx = createContext<MindState | null>(null);

export function MindProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MindData>(defaults);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY_ENCRYPTED);
        if (raw) {
          const parsed = { ...defaults(), ...(JSON.parse(raw) as Partial<MindData>) };
          setData(parsed);
          applyReminders(parsed.reminders).catch(() => {});
        }
      } catch {
        // Corrupt or unavailable storage: fall back to defaults
      }
      loadedRef.current = true;
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    SecureStore.setItemAsync(KEY_ENCRYPTED, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const patch = useCallback((fn: (d: MindData) => Partial<MindData>) => {
    setData((d) => ({ ...d, ...fn(d) }));
  }, []);

  const todayMood = useMemo(() => {
    const now = new Date();
    const todays = data.moods.filter((m) => sameDay(new Date(m.date), now));
    return todays.length ? todays[todays.length - 1].mood : null;
  }, [data.moods]);

  const value = useMemo<MindState>(
    () => ({
      data,
      loaded,
      todayMood,
      addMood: (e) => patch((d) => ({ moods: [...d.moods, { ...e, id: uid(), date: new Date().toISOString() }] })),
      saveJournal: ({ id, title, body }) =>
        patch((d) => {
          const now = new Date().toISOString();
          if (id && d.journal.some((j) => j.id === id)) {
            return { journal: d.journal.map((j) => (j.id === id ? { ...j, title, body, updated: now } : j)) };
          }
          const entry: JournalEntry = { id: uid(), date: now, updated: now, title, body };
          return { journal: [entry, ...d.journal] };
        }),
      deleteJournal: (id) => patch((d) => ({ journal: d.journal.filter((j) => j.id !== id) })),
      addBooking: (b) => patch((d) => ({ bookings: [...d.bookings, { ...b, id: uid(), status: 'requested' }] })),
      cancelBooking: (id) => patch((d) => ({ bookings: d.bookings.filter((b) => b.id !== id) })),
      addPost: (text) =>
        patch((d) => {
          const p: Post = { id: uid(), alias: d.alias, text, date: new Date().toISOString(), hugs: 0, mine: true };
          return { posts: [p, ...d.posts] };
        }),
      deletePost: (id) => patch((d) => ({ posts: d.posts.filter((p) => p.id !== id) })),
      toggleHug: (id) =>
        patch((d) => ({
          hugged: d.hugged.includes(id) ? d.hugged.filter((x) => x !== id) : [...d.hugged, id],
        })),
      newAlias: () => patch(() => ({ alias: randomAlias() })),
      addContact: (c) => patch((d) => ({ contacts: [...d.contacts, { ...c, id: uid() }] })),
      removeContact: (id) => patch((d) => ({ contacts: d.contacts.filter((c) => c.id !== id) })),
      setRegion: (region) => patch(() => ({ region })),
      setReminders: async (reminders) => {
        patch(() => ({ reminders }));
        await applyReminders(reminders);
      },
      moodByDay: (n) => {
        const out: (number | null)[] = [];
        for (let i = n - 1; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          const entries = data.moods.filter((m) => sameDay(new Date(m.date), day));
          out.push(entries.length ? entries.reduce((a, m) => a + m.mood, 0) / entries.length : null);
        }
        return out;
      },
    }),
    [data, loaded, todayMood, patch],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMind(): MindState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMind must be used inside MindProvider');
  return v;
}
