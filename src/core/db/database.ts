import * as SQLite from "expo-sqlite"
import { CREATE_STATEMENTS, SCHEMA_VERSION } from "./schema"

let _db: SQLite.SQLiteDatabase | null = null

/** Open (once) and migrate the library database. Uses the modern synchronous expo-sqlite API. */
export function getDb(): SQLite.SQLiteDatabase {
  if (_db) return _db
  _db = SQLite.openDatabaseSync("vibeplay.db")
  _db.execSync(CREATE_STATEMENTS)
  const row = _db.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key = ?", [
    "schemaVersion",
  ])
  if (!row) {
    _db.runSync("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", [
      "schemaVersion",
      String(SCHEMA_VERSION),
    ])
  }
  return _db
}

export function resetDb(): void {
  const db = getDb()
  db.execSync("DELETE FROM tracks;")
}
