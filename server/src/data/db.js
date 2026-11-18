import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'carepal.db');
const db = new Database(dbPath);

// Enable WAL mode for performance and concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS nurses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      specialty TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      avatar_url TEXT,
      city TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS care_visits (
      id TEXT PRIMARY KEY,
      nurse_id TEXT NOT NULL,
      family_name TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_age INTEGER,
      care_type TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (nurse_id) REFERENCES nurses(id)
    );

    CREATE TABLE IF NOT EXISTS feedback_tokens (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      visit_id TEXT NOT NULL,
      nurse_id TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- active, submitted, expired
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      submitted_at TEXT,
      FOREIGN KEY (visit_id) REFERENCES care_visits(id),
      FOREIGN KEY (nurse_id) REFERENCES nurses(id)
    );

    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      token_id TEXT NOT NULL,
      visit_id TEXT NOT NULL,
      nurse_id TEXT NOT NULL,
      punctuality INTEGER NOT NULL CHECK(punctuality BETWEEN 1 AND 5),
      care_quality INTEGER NOT NULL CHECK(care_quality BETWEEN 1 AND 5),
      hygiene INTEGER NOT NULL CHECK(hygiene BETWEEN 1 AND 5),
      behaviour INTEGER NOT NULL CHECK(behaviour BETWEEN 1 AND 5),
      average_rating REAL NOT NULL,
      nps_score INTEGER NOT NULL CHECK(nps_score BETWEEN 0 AND 10),
      raw_comment TEXT,
      sanitized_comment TEXT,
      has_profanity INTEGER DEFAULT 0,
      sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
      triage_status TEXT DEFAULT 'pending', -- pending, contacted, resolved, dismissed
      triage_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (token_id) REFERENCES feedback_tokens(id),
      FOREIGN KEY (visit_id) REFERENCES care_visits(id),
      FOREIGN KEY (nurse_id) REFERENCES nurses(id)
    );

    CREATE INDEX IF NOT EXISTS idx_tokens_token ON feedback_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_nurse ON feedbacks(nurse_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON feedbacks(created_at);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_triage ON feedbacks(triage_status);
  `);
}

// Auto-run schema init on import
initSchema();

export default db;
