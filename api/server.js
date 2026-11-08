require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();

// ─── Rate Limiting ───────────────────────────────────────────
// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(generalLimiter);

// Stricter limiter for auth endpoints: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── DB Pool ─────────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'serenity',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection on startup
db.query('SELECT 1').catch(() => {
  console.log('⚠️  MySQL not reachable — API will return 503');
});

// ─── Auth Middleware ─────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const user = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || 'serenity-secret-change-me');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Routes ──────────────────────────────────────────────────

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'email, password, and username required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
      [email.toLowerCase(), hash, username]
    );
    const userId = result[0].insertId;
    const token = jwt.sign({ id: userId, email: email.toLowerCase() }, process.env.JWT_SECRET || 'serenity-secret-change-me', { expiresIn: '30d' });
    res.status(201).json({ user: { id: userId, email: email.toLowerCase(), username }, token });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'serenity-secret-change-me', { expiresIn: '30d' });
    res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get profile
app.get('/api/user', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, email, username, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Daily Summaries ─────────────────────────────────────────

// Upsert daily summary
app.post('/api/summaries', authenticate, async (req, res) => {
  try {
    const { date, steps, steps_goal, active_minutes, active_goal, calories, calories_goal, resting_hr, hrv_ms, sleep_minutes, sleep_score, sleep_stages, week_steps, week_hrv, week_rhr } = req.body;
    const ss = sleep_stages || {};
    const weekStepsJson = week_steps ? JSON.stringify(week_steps) : null;
    const weekHrvJson = week_hrv ? JSON.stringify(week_hrv) : null;
    const weekRhrJson = week_rhr ? JSON.stringify(week_rhr) : null;

    await db.query(`INSERT INTO daily_summaries
      (user_id, date, steps, steps_goal, active_minutes, active_goal, calories, calories_goal,
       resting_hr, hrv_ms, sleep_minutes, sleep_score,
       deep_sleep_min, core_sleep_min, rem_sleep_min, awake_min,
       week_steps, week_hrv, week_rhr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        steps=VALUES(steps), steps_goal=VALUES(steps_goal),
        active_minutes=VALUES(active_minutes), active_goal=VALUES(active_goal),
        calories=VALUES(calories), calories_goal=VALUES(calories_goal),
        resting_hr=VALUES(resting_hr), hrv_ms=VALUES(hrv_ms),
        sleep_minutes=VALUES(sleep_minutes), sleep_score=VALUES(sleep_score),
        deep_sleep_min=VALUES(deep_sleep_min), core_sleep_min=VALUES(core_sleep_min),
        rem_sleep_min=VALUES(rem_sleep_min), awake_min=VALUES(awake_min),
        week_steps=VALUES(week_steps), week_hrv=VALUES(week_hrv), week_rhr=VALUES(week_rhr)`,
      [req.user.id, date, steps ?? 0, steps_goal ?? 10000, active_minutes ?? 0, active_goal ?? 60,
       calories ?? 0, calories_goal ?? 700, resting_hr, hrv_ms, sleep_minutes, sleep_score,
       ss.deep, ss.core, ss.rem, ss.awake,
       weekStepsJson, weekHrvJson, weekRhrJson]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Save summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get summaries for date range
app.get('/api/summaries', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT * FROM daily_summaries WHERE user_id = ?';
    const params = [req.user.id];
    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }
    sql += ' ORDER BY date DESC';
    const [rows] = await db.query(sql, params);
    res.json({ summaries: rows });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Workouts ────────────────────────────────────────────────

// Create workout
app.post('/api/workouts', authenticate, async (req, res) => {
  try {
    const { type, name, start_date, end_date, distance_meters, duration_seconds, avg_heart_rate, elevation_m, calories, source } = req.body;
    const result = await db.query(
      `INSERT INTO workouts (user_id, type, name, start_date, end_date, distance_meters, duration_seconds, avg_heart_rate, elevation_m, calories, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, name || null, start_date, end_date || null, distance_meters ?? 0, duration_seconds ?? 0, avg_heart_rate, elevation_m, calories, source || 'manual']
    );
    res.status(201).json({ id: result[0].insertId, ok: true });
  } catch (err) {
    console.error('Save workout error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workouts
app.get('/api/workouts', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    let sql = 'SELECT * FROM workouts WHERE user_id = ?';
    const params = [req.user.id];
    if (from) { sql += ' AND start_date >= ?'; params.push(from); }
    if (to) { sql += ' AND start_date <= ?'; params.push(to); }
    sql += ' ORDER BY start_date DESC';
    const [rows] = await db.query(sql, params);
    res.json({ workouts: rows });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch {
    res.status(503).json({ ok: false, db: 'disconnected' });
  }
});

// ─── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serenity API running on port ${PORT}`);
});
