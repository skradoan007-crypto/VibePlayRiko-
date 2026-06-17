import type { ID, Track } from "@/types/models"
import { useLibraryStore } from "@/stores/libraryStore"

/**
 * Resolve a playlist's stored track IDs into full, enriched Track objects.
 * Preserves the playlist's saved order and silently skips IDs whose track is
 * no longer present in the library (e.g. the file was removed on a rescan).
 */
export function resolvePlaylistTracks(trackIds: ID[]): Track[] {
  const lib = useLibraryStore.getState()
  const byId = new Map(lib.tracks.map((t) => [t.id, t]))
  const out: Track[] = []
  for (const id of trackIds) {
    const t = byId.get(id)
    if (t) out.push(lib.enrich(t))
  }
  return out
}
