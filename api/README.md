# Serenity API Server

Node.js/Express backend for Serenity health app. Runs on **port 3000**.

## Prerequisites

1. **XAMPP MySQL** must be running
2. **Node.js** installed (v18+)

## Quick Setup

### 1. Install dependencies
```bash
cd api
npm install
```

### 2. Create the database
Open phpMyAdmin (`http://localhost/phpmyadmin`) or run:
```bash
mysql < schema.sql
```

### 3. Start the server
**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
npm start
```

The server will be available at `http://localhost:3000` or `http://<your-computer-ip>:3000`.

## Configuration

Edit `api/.env`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Your MySQL password (blank by default)
DB_NAME=serenity
JWT_SECRET=serenity-secret-change-me
PORT=3000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/user` | Yes | Get profile |
| POST | `/api/summaries` | Yes | Save daily summary |
| GET | `/api/summaries` | Yes | Get summaries (date range via `?from=&to=`) |
| POST | `/api/workouts` | Yes | Save workout |
| GET | `/api/workouts` | Yes | Get workouts (date range via `?from=&to=`) |
| GET | `/api/health` | No | Health check |

## Connect Mobile App

For the **development** build, the app uses `http://10.0.2.2:3000` (Android emulator alias for localhost).

For **production** (physical device), edit `src/lib/api.ts` and replace:
```ts
const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'http://<YOUR_SERVER_IP>:3000';
```
with your computer's local IP address (e.g., `http://192.168.1.100:3000`). Both devices must be on the same WiFi network.
