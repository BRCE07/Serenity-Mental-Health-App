# Lumen

A calm, modern health app: one daily **Balance** score built from Move, Recover and Heart, with Apple Health (Apple Watch) and Strava connections.

Built with Expo (React Native) + TypeScript + expo-router. Dark-first, minimal.

## Screens
- **Today**: tri-ring Balance score, one-line insight, key metrics, recent workouts
- **Activity**: 7-day steps, active minutes, energy, all workouts
- **Recovery**: sleep stages, heart rate today, HRV and resting HR trends
- **Sources**: connect Apple Health, Strava, Garmin (via Strava)

The app starts with **sample data**. Once you connect a source it switches to real data.

## Run it

1. Install Node.js LTS (https://nodejs.org) and, for iPhone builds, a Mac with Xcode.
2. In this folder:
   ```
   npm install
   npx expo install --fix      # aligns package versions with your Expo SDK
   copy .env.example .env      # then fill in Strava keys
   ```
3. Because HealthKit and OAuth deep links need native code, use a **dev build**, not Expo Go:
   ```
   npx expo run:ios --device   # Apple Health / Apple Watch (needs a real iPhone + Mac)
   npx expo run:android        # Android works too (sample data + Strava; no HealthKit)
   ```
   Without a Mac you can use EAS Build: `npx eas build --profile development --platform ios`.

## Integrations

| Source | Status |
|---|---|
| **Apple Health / Apple Watch** | Implemented via `react-native-health`. Apple Watch writes to HealthKit, so reading HealthKit covers it. iPhone only. |
| **Strava** | Implemented: OAuth + `GET /athlete/activities`. Create an app at https://www.strava.com/settings/api and set **Authorization Callback Domain** to `redirect`. |
| **Garmin** | Not direct. Garmin's API is server-to-server and requires partner approval. Workaround: in Garmin Connect enable Strava under Partner Apps; Lumen then reads your Garmin activities through Strava. |

> Strava client secret: the prototype reads it from `EXPO_PUBLIC_STRAVA_CLIENT_SECRET`, which ships inside the app. For production, do the token exchange on your own backend.

Add another source by implementing `Connector` ([src/types.ts](src/types.ts)) and registering it in [src/integrations/registry.ts](src/integrations/registry.ts).

## Mind (mental wellbeing)
A fifth tab, **Mind**, adds:

| Feature | Where | Notes |
|---|---|---|
| Daily mood tracker | `app/mind/mood.tsx` | 5-step "weather" scale, tags, notes, 14-day strip. Today's mood feeds the **Recover** ring on the Today screen. |
| Private journaling | `app/mind/journal.tsx` | Stored only on-device (AsyncStorage). Writing prompts included. |
| Stress management & coping | `app/mind/coping.tsx` | Animated guided breathing (Box, 4-7-8, Calm) plus step-by-step strategies. |
| Mental health information | `app/mind/learn.tsx` | Plain-language guides: stress, anxiety, depression, burnout, sleep, panic. |
| Counseling booking | `app/mind/counseling.tsx` | Browse by specialty, pick day/time/session type, manage requests. **Fictional sample counselors; bookings are local requests.** |
| Emergency hotlines & contacts | `app/mind/help.tsx` | Philippines (default), US, elsewhere. One-tap call/text. Add your own trusted contacts. |
| Anonymous community | `app/mind/community.tsx` | Random alias, posts, "send a hug". **Preview only: posts stay on the device.** |
| Gentle reminders & notes | `app/mind/reminders.tsx` | Local notifications for check-in, journaling and a rotating motivational note. Off by default. |

Safety touches: crisis language in notes, journal or community posts surfaces a link to crisis support; a "Need help now?" button sits at the top of Mind.

Content and hotline data live in [src/mind/content.ts](src/mind/content.ts). Hotline numbers were checked against public sources in Nov 2026, but numbers change, so re-verify before release.

### Before a real launch
- Counseling and community need a **backend** (accounts, scheduling, payments, and **moderation** for the community).
- Have a licensed clinician review the information and coping content.
- Mood, journal and health data are sensitive: add an app lock (biometrics) and review privacy laws (e.g. the Philippine Data Privacy Act, HIPAA/GDPR if applicable).

## Notes
- Dependencies are installed and `npm run typecheck` passes. A full Android JS bundle (`npx expo export --platform android`) builds successfully.
- If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (a network that re-signs HTTPS traffic), run it with Node using the Windows certificate store, keeping TLS verification on: `$env:NODE_OPTIONS="--use-system-ca"`.
- New Architecture is disabled in `app.json` because `react-native-health` is untested with it.
- Not yet run on a device or emulator. Expect small runtime fixes (e.g. HealthKit field names).
