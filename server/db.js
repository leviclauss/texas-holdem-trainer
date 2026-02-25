import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'rangeiq.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL DEFAULT 'Guest',
      elo_overall INTEGER NOT NULL DEFAULT 1000,
      elo_preflop INTEGER NOT NULL DEFAULT 1000,
      elo_flop INTEGER NOT NULL DEFAULT 1000,
      elo_turn INTEGER NOT NULL DEFAULT 1000,
      elo_river INTEGER NOT NULL DEFAULT 1000,
      streak INTEGER NOT NULL DEFAULT 0,
      last_activity_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      scenario_id INTEGER NOT NULL,
      user_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      rating_change INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS range_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      range_id INTEGER NOT NULL,
      overlap_score REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_challenge_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id),
      challenge_date TEXT NOT NULL,
      scenario_id INTEGER NOT NULL,
      user_answer TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, challenge_date)
    );
  `);

  // Seed data is loaded from JSON files on each server start but stored in memory
  // No need to persist scenarios/concepts in SQLite - they're static
}

export function loadSeedData() {
  const seedDir = join(__dirname, '..', 'seed');
  const scenarios = JSON.parse(readFileSync(join(seedDir, 'scenarios.json'), 'utf-8'));
  const ranges = JSON.parse(readFileSync(join(seedDir, 'ranges.json'), 'utf-8'));
  const concepts = JSON.parse(readFileSync(join(seedDir, 'concepts.json'), 'utf-8'));
  return { scenarios, ranges, concepts };
}
