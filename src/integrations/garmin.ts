import { Connector } from '../types';

/**
 * Garmin placeholder.
 *
 * The official Garmin Health / Activity API is server-to-server: Garmin pushes data to a
 * webhook on YOUR backend, and access requires approval as a Garmin Connect Developer
 * Program partner (https://developer.garmin.com/gc-developer-program/). A mobile app
 * cannot call it directly.
 *
 * Until you have that, the practical route is: Garmin Connect -> Strava (auto-sync) -> Lumen.
 * The Sources screen offers this. When you have a backend, implement this connector by
 * calling your own API and returning Workout[] / DaySummary fields.
 */
export const garmin: Connector = {
  id: 'garmin',
  name: 'Garmin',
  tagline: 'Sync through Strava today. Direct link needs a backend.',
  available: false,
  unavailableReason:
    'Garmin\'s API needs a backend and partner approval. Connect Garmin Connect to Strava (Garmin Connect > Settings > Partner Apps) and Lumen will pick up your activities.',
  async isConnected() {
    return false;
  },
  async connect() {
    throw new Error(garmin.unavailableReason);
  },
  async disconnect() {},
};
