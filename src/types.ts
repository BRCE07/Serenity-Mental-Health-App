export type SourceId = 'apple' | 'strava' | 'garmin' | 'googleFit';
export type WorkoutSource = SourceId | 'demo' | 'googleFit';

export interface UserProfile {
  displayName: string;
  hobbies: string[];
}

export interface Workout {
  id: string;
  source: WorkoutSource;
  /** Free-form sport name, e.g. "Run", "Ride", "WeightTraining" */
  type: string;
  name: string;
  startDate: string; // ISO
  distanceM: number;
  movingSec: number;
  avgHr?: number;
  elevM?: number;
  calories?: number;
}

/** Minutes spent in each sleep stage */
export interface SleepStages {
  deep: number;
  core: number;
  rem: number;
  awake: number;
}

export interface DaySummary {
  steps: number;
  stepsGoal: number;
  activeMinutes: number;
  activeGoal: number;
  calories: number;
  caloriesGoal: number;
  restingHr: number;
  hrv: number; // ms
  sleepMinutes: number;
  sleepScore: number; // 0-100
  sleepStages: SleepStages;
  hrToday: number[];
  /** Last 7 days, oldest first, today last */
  weekSteps: number[];
  weekHrv: number[];
  weekRhr: number[];
}

/**
 * Every data source (Apple Health, Strava, Garmin...) implements this.
 * Add a new source by creating a connector and registering it in
 * src/integrations/registry.ts.
 */
export interface Connector {
  id: SourceId;
  name: string;
  tagline: string;
  /** false if the source can't work on this device/build */
  available: boolean;
  unavailableReason?: string;
  isConnected(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  fetchSummary?(): Promise<Partial<DaySummary>>;
  fetchWorkouts?(): Promise<Workout[]>;
}
