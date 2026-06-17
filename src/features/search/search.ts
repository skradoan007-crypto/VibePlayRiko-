import type { Track } from "@/types/models"

export type SearchScope = "title" | "artist" | "album" | "folder" | "filename" | "lyrics"

export interface SearchResults {
  tracks: Track[]
  artists: string[]
  albums: string[]
  folders: string[]
}

function matches(track: Track, q: string, scopes: Set<SearchScope>): boolean {
  if (scopes.has("title") && track.title.toLowerCase().includes(q)) return true
  if (scopes.has("artist") && track.artist.toLowerCase().includes(q)) return true
  if (scopes.has("album") && track.album.toLowerCase().includes(q)) return true
  if (scopes.has("folder") && track.folderName.toLowerCase().includes(q)) return true
  if (scopes.has("filename") && track.filename.toLowerCase().includes(q)) return true
  return false
}

const ALL_SCOPES: SearchScope[] = ["title", "artist", "album", "folder", "filename", "lyrics"]

/** Unified library search across title/artist/album/folder/filename (+lyrics hook). */
export function searchLibrary(
  tracks: Track[],
  query: string,
  scopes: SearchScope[] = ALL_SCOPES,
): SearchResults {
  const q = query.trim().toLowerCase()
  if (!q) return { tracks: [], artists: [], albums: [], folders: [] }
  const scopeSet = new Set(scopes)
  const matched = tracks.filter((t) => matches(t, q, scopeSet))
  const artists = [...new Set(matched.map((t) => t.artist))].slice(0, 20)
  const albums = [...new Set(matched.map((t) => t.album))].slice(0, 20)
  const folders = [...new Set(matched.map((t) => t.folderName))].slice(0, 20)
  return { tracks: matched.slice(0, 200), artists, albums, folders }
}
