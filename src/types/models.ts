export type ID = string

export type RepeatMode = "off" | "all" | "one"

export type SortKey = "name" | "date" | "size" | "duration"
export type SortDir = "asc" | "desc"

export interface Track {
  id: ID
  uri: string // playable URI (content:// or file://)
  filename: string
  title: string
  artist: string
  album: string
  albumArtist?: string
  genre?: string
  mood?: string
  durationMs: number
  trackNumber?: number
  year?: number
  folderPath: string
  folderName: string
  sizeBytes: number
  dateAddedMs: number
  artworkUri?: string
  // Dynamic stats (merged from stores at read time; defaults on scan)
  playCount: number
  lastPlayedMs?: number
  isFavorite: boolean
}

export interface Album {
  id: ID
  name: string
  artist: string
  artworkUri?: string
  year?: number
  trackIds: ID[]
}

export interface Artist {
  id: ID
  name: string
  trackIds: ID[]
  albumIds: ID[]
}

export interface Genre {
  id: ID
  name: string
  trackIds: ID[]
}

export interface FolderNode {
  path: string
  name: string
  trackIds: ID[]
  subfolderPaths: string[]
}

export interface Playlist {
  id: ID
  name: string
  trackIds: ID[]
  createdMs: number
  updatedMs: number
  isSmart?: boolean
}

export interface LyricLine {
  timeMs: number
  text: string
}

export interface ScanProgress {
  phase: "idle" | "requesting" | "scanning" | "indexing" | "done" | "error"
  scanned: number
  total: number
  currentFolder?: string
  duplicates: number
  message?: string
}
