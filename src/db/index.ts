import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "task_management.db";

let database: SQLite.SQLiteDatabase | null = null;
let schemaReady = false;

const SCHEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS projects (
  project_id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_description TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  logo_uri TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  task_id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  date TEXT NOT NULL DEFAULT '',
  start_time TEXT NOT NULL DEFAULT '',
  end_time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('to-do', 'inprogress', 'done')),
  FOREIGN KEY (project_id) REFERENCES projects (project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

const INITIALIZED_KEY = "initialized";

async function migrateDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>("PRAGMA table_info(tasks)");
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has("start_time")) {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN start_time TEXT NOT NULL DEFAULT "";');
  }

  if (!columnNames.has("end_time")) {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN end_time TEXT NOT NULL DEFAULT "";');
  }

  if (!columnNames.has("date")) {
    await db.execAsync('ALTER TABLE tasks ADD COLUMN date TEXT NOT NULL DEFAULT "";');
  }
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return database;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await openDatabase();

  if (!schemaReady) {
    await db.execAsync(SCHEMA);
    await migrateDatabase(db);
    schemaReady = true;
  }

  return db;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initDatabase();
}

export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const db = await openDatabase();
    const table = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'app_settings'",
    );

    if (!table) {
      return false;
    }

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = ?",
      INITIALIZED_KEY,
    );

    return row?.value === "1";
  } catch {
    return false;
  }
}

export async function markDatabaseInitialized(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
    INITIALIZED_KEY,
    "1",
  );
}

export async function setupDatabase(): Promise<void> {
  await initDatabase();
  await markDatabaseInitialized();
}
