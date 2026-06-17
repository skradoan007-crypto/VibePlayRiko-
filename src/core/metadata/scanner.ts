import * as MediaLibrary from "expo-media-library"
import type { ScanProgress, Track } from "@/types/models"
import { parseFromFilename } from "./parseName"

function folderFromUri(uri: string, filename: string): { folderPath: string; folderName: string } {
  let path = uri
  try {
    path = decodeURIComponent(uri)
  } catch {
    // keep raw
  }
  const idx = path.lastIndexOf("/")
  const folderPath = idx > 0 ? path.slice(0, idx) : "/"
  const parts = folderPath.split("/").filter(Boolean)
  const folderName = parts[parts.length - 1] ?? "Internal Storage"
  return { folderPath, folderName }
}

function assetToTrack(asset: MediaLibrary.Asset): Track {
  const parsed = parseFromFilename(asset.filename)
  const { folderPath, folderName } = folderFromUri(asset.uri, asset.filename)
  return {
    id: asset.id,
    uri: asset.uri,
    filename: asset.filename,
    title: parsed.title,
    artist: parsed.artist ?? "Unknown Artist",
    album: "Unknown Album",
    genre: undefined,
    durationMs: Math.round((asset.duration ?? 0) * 1000),
    trackNumber: parsed.trackNumber,
    folderPath,
    folderName,
    sizeBytes: 0,
    dateAddedMs: Math.round((asset.creationTime ?? asset.modificationTime ?? Date.now())),
    playCount: 0,
    isFavorite: false,
  }
}

export async function ensureAudioPermission(): Promise<boolean> {
  const current = await MediaLibrary.getPermissionsAsync()
  if (current.granted) return true
  const req = await MediaLibrary.requestPermissionsAsync()
  return req.granted
}

/**
 * Recursive full-library scan (Mode 2). Streams progress via onProgress.
 * Pages through the entire audio media set, resolving album names per asset.
 */
export async function scanLibrary(
  onProgress: (p: ScanProgress) => void,
): Promise<Track[]> {
  onProgress({ phase: "requesting", scanned: 0, total: 0, duplicates: 0 })
  const granted = await ensureAudioPermission()
  if (!granted) {
    onProgress({ phase: "error", scanned: 0, total: 0, duplicates: 0, message: "Permission denied" })
    return []
  }

  const tracks: Track[] = []
  const seen = new Set<string>()
  let duplicates = 0
  let after: MediaLibrary.AssetRef | undefined
  let total = 0
  let hasNext = true

  onProgress({ phase: "scanning", scanned: 0, total: 0, duplicates: 0 })

  while (hasNext) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 200,
      after,
      sortBy: [MediaLibrary.SortBy.creationTime],
    })
    total = page.totalCount
    for (const asset of page.assets) {
      const track = assetToTrack(asset)
      const sig = `${track.title}|${track.durationMs}`.toLowerCase()
      if (seen.has(sig)) duplicates++
      seen.add(sig)
      tracks.push(track)
    }
    onProgress({
      phase: "scanning",
      scanned: tracks.length,
      total,
      duplicates,
      currentFolder: tracks[tracks.length - 1]?.folderName,
    })
    hasNext = page.hasNextPage
    after = page.endCursor
  }

  onProgress({ phase: "indexing", scanned: tracks.length, total, duplicates })
  return tracks
}
