import { create } from "zustand"
import * as DocumentPicker from "expo-document-picker"
// SDK 54: expo-file-system v19 ships a new API; the classic StorageAccessFramework
// + getInfoAsync helpers used here now live under the /legacy entry point.
import * as FileSystem from "expo-file-system/legacy"
import type { SortDir, SortKey, Track } from "@/types/models"
import { parseFromFilename } from "@/core/metadata/parseName"
import { sortTracks } from "@/utils/sort"

/**
 * MODE 1 — Browse Folder + Pick One Music.
 * Deliberately SEPARATE from the scanned library (libraryStore). Ephemeral,
 * lightweight: the user picks files/a folder via the Storage Access Framework,
 * we list the audio entries and let them play one instantly.
 */
type BrowseState = {
  currentDirUri?: string
  entries: Track[]
  query: string
  sortKey: SortKey
  sortDir: SortDir
  loading: boolean
  pickFiles: () => Promise<void>
  openFolder: () => Promise<void>
  setQuery: (q: string) => void
  setSort: (key: SortKey, dir?: SortDir) => void
  visibleEntries: () => Track[]
  clear: () => void
}

function toTrack(uri: string, name: string, size = 0, modMs = Date.now()): Track {
  const parsed = parseFromFilename(name)
  const decoded = (() => {
    try {
      return decodeURIComponent(uri)
    } catch {
      return uri
    }
  })()
  const folderPath = decoded.slice(0, decoded.lastIndexOf("/")) || "/"
  const folderName = folderPath.split("/").filter(Boolean).pop() ?? "Folder"
  return {
    id: uri,
    uri,
    filename: name,
    title: parsed.title,
    artist: parsed.artist ?? "Unknown Artist",
    album: "Unknown Album",
    durationMs: 0,
    trackNumber: parsed.trackNumber,
    folderPath,
    folderName,
    sizeBytes: size,
    dateAddedMs: modMs,
    playCount: 0,
    isFavorite: false,
  }
}

const AUDIO_EXT = /\.(mp3|m4a|aac|flac|wav|ogg|opus|wma|aiff)$/i

export const useBrowseStore = create<BrowseState>((set, get) => ({
  entries: [],
  query: "",
  sortKey: "name",
  sortDir: "asc",
  loading: false,

  pickFiles: async () => {
    set({ loading: true })
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: false,
      })
      if (res.canceled) return
      const entries = res.assets.map((a) =>
        toTrack(a.uri, a.name ?? "track", a.size ?? 0, Date.now()),
      )
      set({ entries })
    } finally {
      set({ loading: false })
    }
  },

  // Android: pick a directory via SAF and list its audio files.
  openFolder: async () => {
    set({ loading: true })
    try {
      const saf = FileSystem.StorageAccessFramework
      const perm = await saf.requestDirectoryPermissionsAsync()
      if (!perm.granted) return
      const dirUri = perm.directoryUri
      const fileUris = await saf.readDirectoryAsync(dirUri)
      const entries: Track[] = []
      for (const fileUri of fileUris) {
        const name = decodeURIComponent(fileUri.split("/").pop() ?? fileUri)
        if (!AUDIO_EXT.test(name)) continue
        let size = 0
        try {
          const info = await FileSystem.getInfoAsync(fileUri, { size: true })
          if (info.exists && "size" in info) size = info.size ?? 0
        } catch {
          // ignore stat errors
        }
        entries.push(toTrack(fileUri, name, size))
      }
      set({ currentDirUri: dirUri, entries })
    } finally {
      set({ loading: false })
    }
  },

  setQuery: (query) => set({ query }),
  setSort: (sortKey, sortDir) => set((s) => ({ sortKey, sortDir: sortDir ?? s.sortDir })),

  visibleEntries: () => {
    const { entries, query, sortKey, sortDir } = get()
    const q = query.trim().toLowerCase()
    const filtered = q
      ? entries.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.filename.toLowerCase().includes(q),
        )
      : entries
    return sortTracks(filtered, sortKey, sortDir)
  },

  clear: () => set({ entries: [], currentDirUri: undefined, query: "" }),
}))
