import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from '../../config.js'

export type Db = Database.Database

/**
 * Esquema equivalente às migrations do backend PHP: pacientes anônimos,
 * tokens de acesso e log de tentativas (somente hashes).
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpf_hash TEXT NOT NULL UNIQUE,
  last_accessed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS access_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  abilities TEXT NOT NULL DEFAULT 'exames:read',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip_hash TEXT NOT NULL,
  cpf_hash TEXT,
  user_agent_hash TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS login_attempts_ip_hash_index ON login_attempts (ip_hash);
CREATE INDEX IF NOT EXISTS login_attempts_cpf_hash_index ON login_attempts (cpf_hash);
`

export function createDatabase(path: string = config.dbPath): Db {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true })
  }

  const db = new Database(path)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)

  return db
}
