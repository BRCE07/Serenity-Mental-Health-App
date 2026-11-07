import { DaySummary } from '../types';

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export interface Scores {
  move: number; // 0..1
  recover: number; // 0..1
  heart: number; // 0..1
  balance: number; // 0..100
}

/**
 * @param mood today's logged mood 1-5 (optional). When present it is blended into Recover,
 *             so how you feel counts alongside how you slept.
 */
export function computeScores(s: DaySummary, mood?: number | null): Scores {
  const move = clamp(0.6 * (s.steps / s.stepsGoal) + 0.4 * (s.activeMinutes / s.activeGoal));
  const sleep = clamp(s.sleepScore / 100);
  const recover = mood ? 0.65 * sleep + 0.35 * ((mood - 1) / 4) : sleep;
  const hrvPart = clamp(s.hrv / 80);
  const rhrPart = clamp(1 - (s.restingHr - 45) / 40);
  const heart = 0.5 * hrvPart + 0.5 * rhrPart;
  const balance = Math.round(100 * (0.35 * Math.min(move, 1) + 0.35 * recover + 0.3 * heart));
  return { move, recover, heart, balance };
}

export function insight(sc: Scores, mood?: number | null): string {
  if (mood && mood <= 2) return 'Your mood is low today. Be gentle with yourself. A breathing exercise or a chat with someone can help.';
  if (sc.recover < 0.5) return 'Recovery is low today. Keep it easy and aim for an early night.';
  if (sc.move >= 1) return 'Move goal complete. Nice work. Wind down well tonight.';
  if (sc.recover > 0.75 && sc.move < 0.5)
    return 'You are well rested with plenty of room to move. A good day for a harder session.';
  return 'Steady day. A short walk would close your Move ring.';
}
