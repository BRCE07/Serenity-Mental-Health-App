import { DaySummary, Workout } from '../types';

const daysAgo = (n: number, hour = 7, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

// Deterministic pseudo-heart-rate curve for the day so far
const hrToday = Array.from({ length: 48 }, (_, i) => {
  const base = 58 + Math.sin(i / 5) * 6;
  const spike = i > 14 && i < 18 ? 55 : i > 30 && i < 33 ? 30 : 0;
  return Math.round(base + spike + ((i * 7) % 5));
});

export const demoSummary: DaySummary = {
  steps: 7420,
  stepsGoal: 10000,
  activeMinutes: 38,
  activeGoal: 60,
  calories: 540,
  caloriesGoal: 700,
  restingHr: 54,
  hrv: 62,
  sleepMinutes: 7 * 60 + 24,
  sleepScore: 84,
  sleepStages: { deep: 92, core: 241, rem: 98, awake: 13 },
  hrToday,
  weekSteps: [8120, 10450, 6230, 11800, 9040, 5120, 7420],
  weekHrv: [58, 61, 55, 63, 66, 60, 62],
  weekRhr: [56, 55, 57, 54, 53, 55, 54],
};

export const demoWorkouts: Workout[] = [
  {
    id: 'd1', source: 'demo', type: 'Run', name: 'Morning run',
    startDate: daysAgo(0, 6, 40), distanceM: 6240, movingSec: 1960, avgHr: 152, elevM: 48,
  },
  {
    id: 'd2', source: 'demo', type: 'Ride', name: 'Evening ride',
    startDate: daysAgo(1, 18, 10), distanceM: 24800, movingSec: 3720, avgHr: 138, elevM: 210,
  },
  {
    id: 'd3', source: 'demo', type: 'WeightTraining', name: 'Strength',
    startDate: daysAgo(2, 17, 30), distanceM: 0, movingSec: 2700, avgHr: 116,
  },
  {
    id: 'd4', source: 'demo', type: 'Walk', name: 'Lunch walk',
    startDate: daysAgo(3, 12, 20), distanceM: 3100, movingSec: 2300, avgHr: 104,
  },
];
