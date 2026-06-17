import { create } from "zustand"
import { persist } from "zustand/middleware"
import { zustandStorage } from "@/utils/persist"
import type { ID } from "@/types/models"

type FavoritesState = {
  ids: Record<ID, true>
  toggle: (id: ID) => void
  isFavorite: (id: ID) => boolean
  list: () => ID[]
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: {},
      toggle: (id) =>
        set((s) => {
          const next = { ...s.ids }
          if (next[id]) delete next[id]
          else next[id] = true
          return { ids: next }
        }),
      isFavorite: (id) => !!get().ids[id],
      list: () => Object.keys(get().ids),
    }),
    { name: "vibeplay-favorites", storage: zustandStorage },
  ),
)
