import { create } from "zustand"
import { persist } from "zustand/middleware"
import { zustandStorage } from "@/utils/persist"
import type { ID, Playlist } from "@/types/models"

type PlaylistState = {
  playlists: Playlist[]
  create: (name: string, trackIds?: ID[]) => Playlist
  rename: (id: ID, name: string) => void
  remove: (id: ID) => void
  addTracks: (id: ID, trackIds: ID[]) => void
  removeTrack: (id: ID, trackId: ID) => void
}

function uid(): string {
  return `pl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],
      create: (name, trackIds = []) => {
        const now = Date.now()
        const pl: Playlist = { id: uid(), name, trackIds, createdMs: now, updatedMs: now }
        set((s) => ({ playlists: [...s.playlists, pl] }))
        return pl
      },
      rename: (id, name) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id ? { ...p, name, updatedMs: Date.now() } : p,
          ),
        })),
      remove: (id) => set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
      addTracks: (id, trackIds) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id
              ? { ...p, trackIds: [...new Set([...p.trackIds, ...trackIds])], updatedMs: Date.now() }
              : p,
          ),
        })),
      removeTrack: (id, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === id
              ? { ...p, trackIds: p.trackIds.filter((t) => t !== trackId), updatedMs: Date.now() }
              : p,
          ),
        })),
    }),
    { name: "vibeplay-playlists", storage: zustandStorage },
  ),
)
