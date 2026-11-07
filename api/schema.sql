-- Serenity health data database schema
-- Run this in phpMyAdmin or via MySQL CLI

CREATE DATABASE IF NOT EXISTS serenity;
USE serenity;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Daily health summaries (one per user per day)
CREATE TABLE IF NOT EXISTS daily_summaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  steps INT DEFAULT 0,
  steps_goal INT DEFAULT 10000,
  active_minutes INT DEFAULT 0,
  active_goal INT DEFAULT 60,
  calories INT DEFAULT 0,
  calories_goal INT DEFAULT 700,
  resting_hr INT DEFAULT NULL,
  hrv_ms INT DEFAULT NULL,
  sleep_minutes INT DEFAULT NULL,
  sleep_score INT DEFAULT NULL,
  deep_sleep_min INT DEFAULT NULL,
  core_sleep_min INT DEFAULT NULL,
  rem_sleep_min INT DEFAULT NULL,
  awake_min INT DEFAULT NULL,
  week_steps JSON DEFAULT NULL,
  week_hrv JSON DEFAULT NULL,
  week_rhr JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(200),
  start_date DATETIME NOT NULL,
  end_date DATETIME DEFAULT NULL,
  distance_meters INT DEFAULT 0,
  duration_seconds INT DEFAULT 0,
  avg_heart_rate INT DEFAULT NULL,
  elevation_m INT DEFAULT NULL,
  calories INT DEFAULT NULL,
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX idx_summaries_user_date ON daily_summaries(user_id, date);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, start_date DESC);
