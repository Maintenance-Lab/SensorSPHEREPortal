// Minimal node-sqlite3-compatible shim backed by Node's built-in node:sqlite.
// Provides just enough of the sqlite3 package API for Sequelize's sqlite
// dialect and src/sqlite.ts — no native compilation required (Node >= 22.5,
// unflagged in Node >= 23.4).
import { DatabaseSync, StatementSync, type SQLInputValue } from 'node:sqlite';

export const OPEN_READONLY = 0x00000001;
export const OPEN_READWRITE = 0x00000002;
export const OPEN_CREATE = 0x00000004;

type Callback = (err?: Error | null, result?: unknown) => void;
type RunResult = { lastID: number; changes: number };

const SQLITE_ERROR_CODES: Record<number, string> = {
  1: 'SQLITE_ERROR',
  5: 'SQLITE_BUSY',
  6: 'SQLITE_LOCKED',
  9: 'SQLITE_INTERRUPT',
  14: 'SQLITE_CANTOPEN',
  19: 'SQLITE_CONSTRAINT',
  257: 'SQLITE_CONSTRAINT_CHECK',
  262: 'SQLITE_CONSTRAINT_TRIGGER',
  275: 'SQLITE_CONSTRAINT_RECURSIVE',
  531: 'SQLITE_CONSTRAINT_ROWID',
  787: 'SQLITE_CONSTRAINT_FOREIGNKEY',
  1555: 'SQLITE_CONSTRAINT_PRIMARYKEY',
  1811: 'SQLITE_CONSTRAINT_NOTNULL',
  2067: 'SQLITE_CONSTRAINT_UNIQUE',
  261: 'SQLITE_CONSTRAINT_FUNCTION',
};

function toSqliteError(err: unknown): Error {
  const e = err as { message?: string; errcode?: number };
  const wrapped = new Error(e?.message || String(err));
  wrapped.name = 'Error';
  if (e?.errcode !== undefined) {
    (wrapped as Error & { errno?: number }).errno = e.errcode;
  }
  const code = e?.errcode !== undefined ? (SQLITE_ERROR_CODES[e.errcode] ?? 'SQLITE_ERROR') : 'SQLITE_ERROR';
  (wrapped as Error & { code?: string }).code = code;
  return wrapped;
}

type Params = SQLInputValue[] | Readonly<Record<string, SQLInputValue>> | null | undefined;

// node:sqlite only binds numbers/strings/null (and bigints/blobs); node-sqlite3
// also accepts booleans, Dates and undefined and coerces them itself. Mirror that.
function coerceValue(value: unknown): SQLInputValue {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') return value;
  if (value instanceof Uint8Array || ArrayBuffer.isView(value)) return value as unknown as SQLInputValue;
  return String(value);
}

function coerceParams(params: Params): Params {
  if (params == null) return params;
  if (Array.isArray(params)) return params.map(coerceValue);
  const out: Record<string, SQLInputValue> = {};
  for (const key of Object.keys(params)) {
    out[key] = coerceValue((params as Record<string, unknown>)[key]);
  }
  return out;
}

/**
 * Executes a statement on a prepared statement, mirroring node-sqlite3 binding
 * semantics:
 *  - arrays bind positionally (`?`),
 *  - plain objects bind named parameters (`$name`, `:name`, `@name`).
 */
function bindStatement(statement: StatementSync, params: Params, mode: 'run' | 'get' | 'all'): unknown {
  if (mode === 'run') {
    if (Array.isArray(params) && params.length > 0) return statement.run(...(params as SQLInputValue[]));
    if (params && !Array.isArray(params)) return statement.run(params as Record<string, SQLInputValue>);
    return statement.run();
  }
  if (mode === 'get') {
    if (Array.isArray(params) && params.length > 0) return statement.get(...(params as SQLInputValue[]));
    if (params && !Array.isArray(params)) return statement.get(params as Record<string, SQLInputValue>);
    return statement.get();
  }
  if (Array.isArray(params) && params.length > 0) return statement.all(...(params as SQLInputValue[]));
  if (params && !Array.isArray(params)) return statement.all(params as Record<string, SQLInputValue>);
  return statement.all();
}

type StatementLike = { lastID: number; changes: number };

// node-sqlite3 invokes `run`/`get`/`all` callbacks with `this` bound to the
// Statement that executed, exposing `lastID` and `changes`. Sequelize's sqlite
// query handler reads `metaData.changes`/`metaData.lastID` and checks
// `metaData.constructor.name === 'Statement'`, so mirror that shape.
function makeStatementResult(lastID: number, changes: number): StatementLike {
  const stmt: Record<string, unknown> = { lastID, changes };
  Object.defineProperty(stmt, 'constructor', {
    value: { name: 'Statement' },
    enumerable: false,
    writable: false,
    configurable: true,
  });
  return stmt as unknown as StatementLike;
}

export class Database {
  filename: string;
  private _db: DatabaseSync | null;

  constructor();
  constructor(filename?: string);
  constructor(filename?: string, callback?: Callback);
  constructor(filename?: string, mode?: number | Callback, callback?: Callback) {
    this.filename = filename || ':memory:';
    let cb: Callback | undefined;
    if (typeof mode === 'function') {
      cb = mode;
    } else if (typeof callback === 'function') {
      cb = callback;
    }
    try {
      // Match node-sqlite3's defaults: foreign key enforcement starts OFF
      // (Sequelize's sqlite dialect relies on this when dropping tables).
      this._db = new DatabaseSync(this.filename === ':memory:' ? ':memory:' : this.filename, {
        enableForeignKeyConstraints: false,
      });
      if (cb) process.nextTick(cb, null, this);
    } catch (err) {
      this._db = null;
      if (cb) process.nextTick(cb, toSqliteError(err));
      else throw err;
    }
  }

  serialize(fn: () => void): this {
    fn();
    return this;
  }

  private _runMethod(method: 'run' | 'get' | 'all', sql: string, params: Params, cb?: Callback): this {
    const respond = (err: Error | null, thisArg: unknown, result: unknown) => {
      if (cb) process.nextTick(() => cb.call(thisArg as Callback, err, result));
    };
    try {
      if (!this._db) throw new Error('SQLite database is closed');
      const statement = this._db.prepare(sql);
      const result = bindStatement(statement, coerceParams(params), method);
      if (method === 'run') {
        const changes = result as { changes: number | bigint; lastInsertRowid: number | bigint };
        respond(null, makeStatementResult(Number(changes.lastInsertRowid), Number(changes.changes)), null);
      } else {
        respond(null, makeStatementResult(0, 0), result);
      }
    } catch (err) {
      respond(toSqliteError(err), makeStatementResult(0, 0), null);
    }
    return this;
  }

  run(sql: string, callback?: Callback): this;
  run(sql: string, params: Params, callback?: Callback): this;
  run(sql: string, paramsOrCallback?: Params | Callback, maybeCallback?: Callback): this {
    if (typeof paramsOrCallback === 'function') {
      return this._runMethod('run', sql, [], paramsOrCallback as Callback);
    }
    return this._runMethod('run', sql, paramsOrCallback as Params, maybeCallback);
  }

  get(sql: string, callback?: Callback): this;
  get(sql: string, params: Params, callback?: Callback): this;
  get(sql: string, paramsOrCallback?: Params | Callback, maybeCallback?: Callback): this {
    if (typeof paramsOrCallback === 'function') {
      return this._runMethod('get', sql, [], paramsOrCallback as Callback);
    }
    return this._runMethod('get', sql, paramsOrCallback as Params, maybeCallback);
  }

  all(sql: string, callback?: Callback): this;
  all(sql: string, params: Params, callback?: Callback): this;
  all(sql: string, paramsOrCallback?: Params | Callback, maybeCallback?: Callback): this {
    if (typeof paramsOrCallback === 'function') {
      return this._runMethod('all', sql, [], paramsOrCallback as Callback);
    }
    return this._runMethod('all', sql, paramsOrCallback as Params, maybeCallback);
  }

  exec(sql: string, callback?: Callback): this {
    try {
      if (!this._db) throw new Error('SQLite database is closed');
      this._db.exec(sql);
      if (callback) process.nextTick(callback, null, this);
    } catch (err) {
      if (callback) process.nextTick(callback, toSqliteError(err));
      else throw err;
    }
    return this;
  }

  close(callback?: Callback): this {
    if (this._db) {
      try {
        this._db.close();
      } catch (err) {
        if (callback) process.nextTick(callback, toSqliteError(err));
        return this;
      }
      this._db = null;
    }
    if (callback) process.nextTick(callback, null);
    return this;
  }
}

const sqlite3 = {
  Database,
  OPEN_READONLY,
  OPEN_READWRITE,
  OPEN_CREATE,
};

// Mirror the real `sqlite3` package's default export so `import sqlite3 from
// 'sqlite3'`-style code keeps working (`sqlite3.Database`, `sqlite3.OPEN_*`).
export default sqlite3;