import type { Track } from "@/types/models"
import { getDb } from "./database"

type Row = {
  id: string
  uri: string
  filename: string
  title: string
  artist: string
  album: string
  albumArtist: string | null
  genre: string | null
  durationMs: number
  trackNumber: number | null
  year: number | null
  folderPath: string
  folderName: string
  sizeBytes: number
  dateAddedMs: number
  artworkUri: string | null
  contentHash: string | null
}

function rowToTrack(r: Row): Track {
  return {
    id: r.id,
    uri: r.uri,
    filename: r.filename,
    title: r.title,
    artist: r.artist,
    album: r.album,
    albumArtist: r.albumArtist ?? undefined,
    genre: r.genre ?? undefined,
    durationMs: r.durationMs,
    trackNumber: r.trackNumber ?? undefined,
    year: r.year ?? undefined,
    folderPath: r.folderPath,
    folderName: r.folderName,
    sizeBytes: r.sizeBytes,
    dateAddedMs: r.dateAddedMs,
    artworkUri: r.artworkUri ?? undefined,
    playCount: 0,
    isFavorite: false,
  }
}

/** Bulk upsert scanned tracks inside a single transaction (fast for large libraries). */
export function upsertTracks(tracks: Track[]): void {
  const db = getDb()
  db.withTransactionSync(() => {
    const stmt = db.prepareSync(
      `INSERT OR REPLACE INTO tracks
       (id, uri, filename, title, artist, album, albumArtist, genre, durationMs, trackNumber, year, folderPath, folderName, sizeBytes, dateAddedMs, artworkUri, contentHash)
       VALUES ($id,$uri,$filename,$title,$artist,$album,$albumArtist,$genre,$durationMs,$trackNumber,$year,$folderPath,$folderName,$sizeBytes,$dateAddedMs,$artworkUri,$contentHash)`,
    )
    try {
      for (const t of tracks) {
        stmt.executeSync({
          $id: t.id,
          $uri: t.uri,
          $filename: t.filename,
          $title: t.title,
          $artist: t.artist,
          $album: t.album,
          $albumArtist: t.albumArtist ?? null,
          $genre: t.genre ?? null,
          $durationMs: t.durationMs,
          $trackNumber: t.trackNumber ?? null,
          $year: t.year ?? null,
          $folderPath: t.folderPath,
          $folderName: t.folderName,
          $sizeBytes: t.sizeBytes,
          $dateAddedMs: t.dateAddedMs,
          $artworkUri: t.artworkUri ?? null,
          $contentHash: `${t.title}|${t.durationMs}|${t.sizeBytes}`.toLowerCase(),
        })
      }
    } finally {
      stmt.finalizeSync()
    }
  })
}

export function getAllTracks(): Track[] {
  const db = getDb()
  const rows = db.getAllSync<Row>("SELECT * FROM tracks ORDER BY title COLLATE NOCASE ASC")
  return rows.map(rowToTrack)
}

export function countTracks(): number {
  const db = getDb()
  const r = db.getFirstSync<{ c: number }>("SELECT COUNT(*) as c FROM tracks")
  return r?.c ?? 0
}

/** Groups of duplicates by (title|duration|size) signature with more than one member. */
export function findDuplicateGroups(): Track[][] {
  const db = getDb()
  const dupHashes = db.getAllSync<{ contentHash: string }>(
    "SELECT contentHash FROM tracks GROUP BY contentHash HAVING COUNT(*) > 1",
  )
  return dupHashes.map(({ contentHash }) =>
    db
      .getAllSync<Row>("SELECT * FROM tracks WHERE contentHash = ?", [contentHash])
      .map(rowToTrack),
  )
}
