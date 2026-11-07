export type Region = 'PH' | 'US' | 'INTL';

export interface MoodEntry {
  id: string;
  date: string; // ISO
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  note?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO created
  updated: string; // ISO
  title: string;
  body: string;
}

export type SessionMode = 'video' | 'chat' | 'in-person';

export interface Booking {
  id: string;
  counselorId: string;
  startISO: string;
  mode: SessionMode;
  note?: string;
  status: 'requested';
}

export interface Post {
  id: string;
  alias: string;
  text: string;
  date: string; // ISO
  hugs: number;
  mine?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface TimedReminder {
  on: boolean;
  h: number;
  m: number;
}

export interface ReminderSettings {
  checkin: TimedReminder;
  journal: TimedReminder;
  motivation: TimedReminder;
}

export interface MindData {
  moods: MoodEntry[];
  journal: JournalEntry[];
  bookings: Booking[];
  posts: Post[];
  hugged: string[]; // post ids the user hugged
  contacts: Contact[];
  region: Region;
  reminders: ReminderSettings;
  alias: string;
}
