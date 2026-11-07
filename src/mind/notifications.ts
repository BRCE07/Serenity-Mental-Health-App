import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ReminderSettings } from './types';
import { NOTES } from './content';

const CHANNEL = 'reminders';
const { SchedulableTriggerInputTypes: T } = Notifications;

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Gentle reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Cancels everything and re-schedules according to the settings. Safe to call often. */
export async function applyReminders(r: ReminderSettings): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (r.checkin.on) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'How are you feeling?', body: 'Take a moment to check in with yourself.' },
      trigger: { type: T.DAILY, hour: r.checkin.h, minute: r.checkin.m, channelId: CHANNEL },
    });
  }

  if (r.journal.on) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'A quiet moment', body: 'Write a few lines in your private journal.' },
      trigger: { type: T.DAILY, hour: r.journal.h, minute: r.journal.m, channelId: CHANNEL },
    });
  }

  if (r.motivation.on) {
    // One-off notifications for the next 14 days so each carries a different note.
    const now = Date.now();
    const base = Math.floor((now - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(r.motivation.h, r.motivation.m, 0, 0);
      if (d.getTime() <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: 'A note for you', body: NOTES[(base + i) % NOTES.length] },
        trigger: { type: T.DATE, date: d, channelId: CHANNEL },
      });
    }
  }
}
