import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA_VERSION = 1;

const DEFAULT_CATEGORIES: [string, string][] = [
  ['Comida', '#ef6c00'],
  ['Transporte', '#1e88e5'],
  ['Hogar', '#8e24aa'],
  ['Salud', '#e53935'],
  ['Ocio', '#43a047'],
  ['Otros', '#757575'],
];

async function migrate(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (current < 1) {
      await db.execAsync(`
        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL DEFAULT '#757575',
          monthly_budget REAL
        );
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          default_price REAL
        );
        CREATE TABLE expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          amount REAL NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
          note TEXT
        );
        CREATE TABLE incomes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          amount REAL NOT NULL,
          source TEXT NOT NULL,
          note TEXT
        );
        CREATE INDEX idx_expenses_date ON expenses(date);
        CREATE INDEX idx_incomes_date ON incomes(date);
      `);
      for (const [name, color] of DEFAULT_CATEGORIES) {
        await db.runAsync('INSERT INTO categories (name, color) VALUES (?, ?)', name, color);
      }
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('gastos.db');
      await db.execAsync('PRAGMA foreign_keys = ON');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}
