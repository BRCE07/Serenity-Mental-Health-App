# Serenity

A calm, modern health and wellbeing app: one daily **Balance** score built from Move, Recover and Heart data, with Apple Health (Apple Watch), Strava, Garmin, and Google Fit connections.

Built with Expo (React Native) + TypeScript + expo-router. Dark-first, minimal design.

## Screens

| Tab | What it shows |
|---|---|
| **Today** | Tri-ring Balance score, one-line insight, key metrics, recent workouts |
| **Activity** | 7-day steps, active minutes, energy, all workouts |
| **Recovery** | Sleep stages, heart rate today, HRV and resting HR trends |
| **Mind** | Mood tracker, journaling, coping strategies, mental health guides, emergency contacts |
| **Settings** | Profile editing, hobby tags, health source connectors, account management, sync status |

The app starts with **sample data**. Connect a health source to switch to real data.

---

## Quick Start

### Prerequisites

- **Node.js** LTS (https://nodejs.org)
- For Android builds: JDK 17+ (https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- For iOS builds: Mac with Xcode
- For HealthKit (Apple Watch): A real iPhone (not simulator)

### Install & Run

```bash
# 1. Clone and install
git clone https://github.com/itsmenexus23/Serenity-Mental-Health-App.git
cd Serenity-Mental-Health-App
npm install
npx expo install --fix

# 2. Configure environment variables
copy .env.example .env
# Edit .env and add your Strava API keys (see Integrations below)

# 3. Run the app
npx expo run:android          # Android build
npx expo run:ios --device     # iOS build (needs real iPhone + Mac)
```

> **Note:** HealthKit and OAuth deep links require a **dev build**, not Expo Go.

---

## Backend (Optional — for cloud sync)

The backend enables **account-based sync** so your health data follows you across devices.

### Step 1: Set up MySQL

1. Install XAMPP (https://www.apachefriends.org) and start the **MySQL** service.
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Click **SQL** tab, then **Open** the file:
   ```
   api/schema.sql
   ```
4. Click **Go** to create the database tables (`users`, `health_data`, `workouts`, `profiles`, `user_hobbies`).

### Step 2: Configure the backend

1. Copy the `.env` file:
   ```bash
   cd api
   copy .env.example .env
   ```
2. Edit `api/.env` and fill in your MySQL credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   JWT_SECRET=your_random_secret_string_here
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```
   The server runs at **http://localhost:3000**.

### Step 3: Connect the app to your backend

In the app, go to **Settings → Server Health**. The status will show `Online` when connected. Health data will automatically sync when online and store locally when offline.

---

## Integrations (Smartwatches & Health Apps)

### Apple Health / Apple Watch (iOS)

Apple Watch data flows through HealthKit on the iPhone.

1. Wear your Apple Watch and complete a workout (open the **Workout** app, choose an activity type, tap **Start**).
2. Open Serenity → **Settings** → tap **Apple Health**.
3. Grant permission when iOS prompts you.
4. Data (steps, heart rate, sleep, workouts) will sync automatically.

**Requirements:** iPhone with iOS 13+, Apple Watch (Series 3 or later), real device (not simulator).

### Strava

Strava syncs running, cycling, swimming and other activities.

1. Create a developer app: https://www.strava.com/settings/api
2. Fill in:
   - **Application Name**: `Serenity`
   - **Category**: Select any
   - **Website**: `https://example.com`
   - **Authorization Callback Domain**: `redirect` (this is required)
3. Copy your **Client ID** and **Client Secret**.
4. Paste them into `Serenity/.env`:
   ```env
   EXPO_PUBLIC_STRAVA_CLIENT_ID=your_client_id
   EXPO_PUBLIC_STRAVA_CLIENT_SECRET=your_client_secret
   ```
5. In the app: **Settings → Strava → Connect**. Follow the OAuth flow to authorize.

> **Warning:** Client secrets in the `.env` ship inside the app bundle. For production, do the token exchange on your own backend instead of in the app.

### Garmin

Garmin does not offer a direct public API. Workaround:

1. Install **Garmin Connect** on your phone.
2. Open Garmin Connect → **Settings** → **Connected Apps**.
3. Find **Strava** and enable it under Partner Apps.
4. Authorize Garmin Connect to share data with Strava.
5. Connect Strava in Serenity (see above). Garmin data will flow through Strava automatically.

Activities synced: runs, rides, hikes, swims (if recorded as Strava-compatible activities).

### Google Fit (Android)

Google Fit syncs steps, heart rate, workouts and sleep data.

1. Install Google Fit from the Play Store if you don't have it.
2. In the app: **Settings → Google Fit → Connect**.
3. Grant permissions.
4. Data syncs automatically.

> Google Fit requires the `react-native-google-fit` native module. If building for Android, ensure you have Android Studio and SDK 33+ installed.

---

## Mind Tab Features

### Mood Tracker (`app/mind/mood.tsx`)

Log your daily mood on a 5-step "weather" scale (☀️ Great → 🌧️ Low). Add tags and optional notes. Shows a 14-day mood strip. Today's mood feeds the **Recover** ring on the Today screen.

### Journaling (`app/mind/journal.tsx`)

Private, device-only journaling with writing prompts. All data stays on-device via AsyncStorage (no cloud sync for journals).

### Stress Management (`app/mind/coping.tsx`)

Guided breathing exercises (Box, 4-7-8, Calm techniques) with step-by-step animations. Plus practical coping strategies for anxiety, stress and burnout.

### Mental Health Guides (`app/mind/learn.tsx`)

Plain-language articles covering: stress, anxiety, depression, burnout, sleep hygiene and panic attacks.

### Counseling Booking (`app/mind/counseling.tsx`)

Browse fictional sample counselors by specialty, pick day/time/session type. Bookings are stored locally (preview feature — no live backend yet).

### Emergency Contacts (`app/mind/help.tsx`)

One-tap call/text for crisis hotlines (Philippines, US, international). Add your own trusted contacts.

### Community (`app/mind/community.tsx`)

Anonymous posts with random aliases and "send a hug" support. **Preview only** — posts stay on-device (no server yet).

### Reminders (`app/mind/reminders.tsx`)

Local notifications for daily check-ins, journaling prompts and rotating motivational notes. Off by default.

---

## Settings Tab

| Section | What it does |
|---|---|
| **Profile** | Display name, avatar, edit profile modal |
| **Hobbies** | Tag picker with 20 preset options, stored locally |
| **Health Sources** | Connect Apple Health, Strava, Garmin (via Strava), Google Fit |
| **Account** | Sign out (clears local session, returns to login) |
| **Server Status** | Shows if the optional backend is reachable |

---

## Account System

### Login / Sign Up

- Open the app → login screen appears (always, on fresh launch).
- **Sign Up**: Create an account with email, username and password (min 6 chars).
- **Sign In**: Enter registered credentials.
- Credentials are stored locally for login form convenience but you must log in each time the app opens.

### Cloud Sync

- Data loads from **local storage** (AsyncStorage) first.
- When online, the app syncs with the backend API automatically.
- Data persists locally even when offline — sync resumes when connection returns.

---

## Building for Production

### Android APK

```bash
cd android
bash ./gradlew assembleRelease --no-daemon --console=plain
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### iOS App Store

```bash
npx eas build --profile production --platform ios
```

Requires an Apple Developer account and EAS account setup.

---

## Adding a New Health Source

1. Implement the `Connector` interface in `src/types.ts`:
   ```typescript
   interface Connector {
     id: SourceId;
     title: string;
     icon: string;
     connect(): Promise<void>;
     disconnect(): Promise<void>;
     isConnected: boolean;
   }
   ```
2. Register it in `src/integrations/registry.ts`.
3. Add the data-fetching logic to your connector implementation.

---

## Notes

- Dependencies are installed and `npm run typecheck` passes. A full Android JS bundle (`npx expo export --platform android`) builds successfully.
- If `npm install` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (a network that re-signs HTTPS traffic), run it with Node using the Windows certificate store, keeping TLS verification on: `$env:NODE_OPTIONS="--use-system-ca"`.
- New Architecture is disabled in `app.json` because `react-native-health` is untested with it.
- Not yet run on a device or emulator. Expect small runtime fixes (e.g. HealthKit field names).

---

## License

This project is licensed under the **Serenity License** — an open-source license that permits use, study, and sharing, but **prohibits commercial resale**. See [LICENSE](LICENSE) for full terms.

Key restrictions:
- You may not sell, sublicense, or monetize this software or derivative works as a standalone product.
- Violations result in immediate termination of rights and may be subject to legal action, including injunctive relief, statutory damages, and publication of the violation.
- All copies must retain the copyright notice and AI-assistance disclaimer.

## AI Assistance Disclaimer

This project was developed with the assistance of **artificial intelligence tools** alongside human developers. AI was used to assist with code generation, debugging, documentation, and iterative improvement throughout the project lifecycle.

The content, features, and functionality of this software are the result of collaborative human-AI development. While every effort has been made to ensure quality and accuracy, users should exercise their own judgment when relying on any information or functionality provided by this application.
