import type { Track } from "@/types/models"

/**
 * Derive title/artist from a filename when embedded tags aren't available.
 * Handles common patterns like "Artist - Title", "01 - Title", "01. Title".
 *
 * NOTE: expo-media-library exposes filename + duration + album, but not full
 * ID3/Vorbis tags (artist/genre/year). For real tag reading, plug a native tag
 * reader into `enrichWithTags` below — the rest of the app already consumes the
 * Track shape, so nothing downstream changes.
 */
export function parseFromFilename(filename: string): { title: string; artist?: string; trackNumber?: number } {
  const base = filename.replace(/\.[a-z0-9]+$/i, "").trim()
  // Leading track number: "01 - ", "01. ", "01 "
  const numMatch = base.match(/^(\d{1,3})\s*[-.)]?\s+(.*)$/)
  let working = base
  let trackNumber: number | undefined
  if (numMatch && numMatch[2]) {
    trackNumber = parseInt(numMatch[1] as string, 10)
    working = numMatch[2]
  }
  // "Artist - Title"
  const dash = working.split(" - ")
  if (dash.length >= 2) {
    const artist = dash[0]?.trim()
    const title = dash.slice(1).join(" - ").trim()
    return { title: title || working, artist: artist || undefined, trackNumber }
  }
  return { title: working || filename, trackNumber }
}

/** Hook for a future native tag reader. Currently a passthrough. */
export async function enrichWithTags(track: Track): Promise<Track> {
  return track
}
