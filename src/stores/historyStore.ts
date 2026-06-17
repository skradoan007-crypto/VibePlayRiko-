import { create } from "zustand"
import { persist } from "zustand/middleware"
import { zustandStorage } from "@/utils/persist"
import type { ID } from "@/types/models"

type HistoryState = {
  playCounts: Record<ID, number>
  lastPlayedMs: Record<ID, number>
  recent: ID[] // most-recent-first, deduped
  recordPlay: (id: ID) => void
  playCount: (id: ID) => number
  lastPlayed: (id: ID) => number | undefined
  mostPlayed: (limit?: number) => ID[]
  recentlyPlayed: (limit?: number) => ID[]
  clear: () => void
}

const MAX_RECENT = 200

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      playCounts: {},
      lastPlayedMs: {},
      recent: [],
      recordPlay: (id) =>
        set((s) => {
          const recent = [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT)
          return {
            playCounts: { ...s.playCounts, [id]: (s.playCounts[id] ?? 0) + 1 },
            lastPlayedMs: { ...s.lastPlayedMs, [id]: Date.now() },
            recent,
          }
        }),
      playCount: (id) => get().playCounts[id] ?? 0,
      lastPlayed: (id) => get().lastPlayedMs[id],
      mostPlayed: (limit = 50) =>
        Object.entries(get().playCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id),
      recentlyPlayed: (limit = 50) => get().recent.slice(0, limit),
      clear: () => set({ playCounts: {}, lastPlayedMs: {}, recent: [] }),
    }),
    { name: "vibeplay-history", storage: zustandStorage },
  ),
)
