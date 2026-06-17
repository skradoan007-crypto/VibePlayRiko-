import { create } from "zustand"
import type { Album, Artist, FolderNode, Genre, ScanProgress, Track } from "@/types/models"
import { scanLibrary } from "@/core/metadata/scanner"
import { buildIndexes } from "@/core/metadata/aggregate"
import {
  getAllTracks,
  upsertTracks,
  countTracks,
  findDuplicateGroups,
} from "@/core/db/trackRepository"
import { resetDb } from "@/core/db/database"
import { useFavoritesStore } from "./favoritesStore"
import { useHistoryStore } from "./historyStore"

type LibraryState = {
  tracks: Track[]
  artists: Artist[]
  albums: Album[]
  genres: Genre[]
  folders: FolderNode[]
  duplicates: Track[][]
  loaded: boolean
  progress: ScanProgress
  loadFromDb: () => void
  rescan: () => Promise<void>
  enrich: (t: Track) => Track
  enrichedTracks: () => Track[]
}

const idleProgress: ScanProgress = { phase: "idle", scanned: 0, total: 0, duplicates: 0 }

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  artists: [],
  albums: [],
  genres: [],
  folders: [],
  duplicates: [],
  loaded: false,
  progress: idleProgress,

  enrich: (t) => {
    const fav = useFavoritesStore.getState()
    const hist = useHistoryStore.getState()
    return {
      ...t,
      isFavorite: fav.isFavorite(t.id),
      playCount: hist.playCount(t.id),
      lastPlayedMs: hist.lastPlayed(t.id),
    }
  },

  enrichedTracks: () => get().tracks.map((t) => get().enrich(t)),

  loadFromDb: () => {
    const tracks = getAllTracks()
    const idx = buildIndexes(tracks)
    set({ tracks, ...idx, loaded: true })
  },

  rescan: async () => {
    const found = await scanLibrary((progress) => set({ progress }))
    if (found.length === 0 && get().progress.phase === "error") return
    resetDb()
    upsertTracks(found)
    const tracks = getAllTracks()
    const idx = buildIndexes(tracks)
    const duplicates = findDuplicateGroups()
    set({
      tracks,
      ...idx,
      duplicates,
      loaded: true,
      progress: {
        phase: "done",
        scanned: tracks.length,
        total: countTracks(),
        duplicates: duplicates.reduce((s, g) => s + (g.length - 1), 0),
      },
    })
  },
}))
