import { create } from "zustand"
import { persist } from "zustand/middleware"
import { zustandStorage } from "@/utils/persist"

export type ThemePref = "system" | "light" | "amoled"

type SettingsState = {
  theme: ThemePref
  accent: string
  amoled: boolean
  animationsEnabled: boolean
  gesturesEnabled: boolean
  // scan
  autoRescanOnLaunch: boolean
  excludeShortClips: boolean
  minClipSeconds: number
  // playback
  resumeOnLaunch: boolean
  gaplessHint: boolean
  defaultRate: number
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      accent: "#1565C0",
      amoled: false,
      animationsEnabled: true,
      gesturesEnabled: true,
      autoRescanOnLaunch: false,
      excludeShortClips: true,
      minClipSeconds: 30,
      resumeOnLaunch: true,
      gaplessHint: true,
      defaultRate: 1,
      set: (key, value) => set({ [key]: value } as Partial<SettingsState>),
    }),
    { name: "vibeplay-settings", storage: zustandStorage },
  ),
)
