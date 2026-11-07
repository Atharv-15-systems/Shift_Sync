import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

export interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
    all(...params: any[]): any[];
    get(...params: any[]): any;
  };
  transaction<T>(fn: () => T): () => T;
  close(): void;
}

class DatabaseWrapper implements SqliteDb {
  private db: DatabaseSync;

  constructor(targetPath: string) {
    this.db = new DatabaseSync(targetPath);
    // Performance and integrity pragmas
    this.db.exec('PRAGMA foreign_keys = ON;');
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  prepare(sql: string) {
    const stmt = this.db.prepare(sql);
    return {
      run: (...params: any[]) => stmt.run(...params),
      all: (...params: any[]) => stmt.all(...params),
      get: (...params: any[]) => stmt.get(...params)
    };
  }

  transaction<T>(fn: () => T): () => T {
    return () => {
      this.db.exec('BEGIN IMMEDIATE');
      try {
        const result = fn();
        this.db.exec('COMMIT');
        return result;
      } catch (err) {
        this.db.exec('ROLLBACK');
        throw err;
      }
    };
  }

  close(): void {
    this.db.close();
  }
}

let dbInstance: SqliteDb | null = null;

export function getDatabase(dbPath?: string): SqliteDb {
  if (dbInstance && !dbPath) {
    return dbInstance;
  }

  const targetPath = dbPath || process.env.DATABASE_PATH || path.resolve(process.cwd(), 'shiftsync.db');

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const instance = new DatabaseWrapper(targetPath);

  if (!dbPath) {
    dbInstance = instance;
  }

  return instance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // already closed
    }
    dbInstance = null;
  }
}
