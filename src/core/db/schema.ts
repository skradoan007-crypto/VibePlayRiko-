/** SQLite schema for the scanned music library (Mode 2). Optimised for large libraries. */
export const SCHEMA_VERSION = 1

export const CREATE_STATEMENTS = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY NOT NULL,
  uri TEXT NOT NULL,
  filename TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL DEFAULT 'Unknown Artist',
  album TEXT NOT NULL DEFAULT 'Unknown Album',
  albumArtist TEXT,
  genre TEXT,
  durationMs INTEGER NOT NULL DEFAULT 0,
  trackNumber INTEGER,
  year INTEGER,
  folderPath TEXT NOT NULL,
  folderName TEXT NOT NULL,
  sizeBytes INTEGER NOT NULL DEFAULT 0,
  dateAddedMs INTEGER NOT NULL DEFAULT 0,
  artworkUri TEXT,
  contentHash TEXT
);

CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);
CREATE INDEX IF NOT EXISTS idx_tracks_folder ON tracks(folderPath);
CREATE INDEX IF NOT EXISTS idx_tracks_hash ON tracks(contentHash);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
`
