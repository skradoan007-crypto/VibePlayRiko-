import { create } from "zustand"
import { persist } from "zustand/middleware"
import { zustandStorage } from "@/utils/persist"
import { DEFAULT_DSP, applyDsp, type DspState } from "@/features/modify/dsp"
import { BUILT_IN_PRESETS, type EqPreset } from "@/features/modify/presets"

type ModifyState = {
  dsp: DspState
  enabled: boolean
  userPresets: EqPreset[]
  setBand: (index: number, db: number) => void
  setField: <K extends keyof DspState>(key: K, value: DspState[K]) => void
  applyPreset: (preset: EqPreset) => void
  savePreset: (name: string) => void
  setEnabled: (v: boolean) => void
  reset: () => void
  allPresets: () => EqPreset[]
}

// Push the effective DSP to the audio engine. When effects are disabled we send
// a clean signal so the master toggle is always meaningful, and every slider
// change is applied live (this is what makes Speed / Pitch / Pre-amp audible).
function push(state: DspState, enabled: boolean) {
  void applyDsp(enabled ? state : DEFAULT_DSP)
}

export const useModifyStore = create<ModifyState>()(
  persist(
    (set, get) => ({
      dsp: DEFAULT_DSP,
      enabled: true,
      userPresets: [],
      setBand: (index, db) =>
        set((s) => {
          const bands = [...s.dsp.bands]
          bands[index] = db
          const dsp = { ...s.dsp, bands }
          push(dsp, s.enabled)
          return { dsp }
        }),
      setField: (key, value) =>
        set((s) => {
          const dsp = { ...s.dsp, [key]: value }
          push(dsp, s.enabled)
          return { dsp }
        }),
      applyPreset: (preset) =>
        set((s) => {
          push(preset.state, s.enabled)
          return { dsp: preset.state }
        }),
      savePreset: (name) =>
        set((s) => ({
          userPresets: [
            ...s.userPresets,
            { id: `user_${Date.now().toString(36)}`, name, state: s.dsp },
          ],
        })),
      setEnabled: (enabled) =>
        set((s) => {
          push(s.dsp, enabled)
          return { enabled }
        }),
      reset: () =>
        set(() => {
          push(DEFAULT_DSP, true)
          return { dsp: DEFAULT_DSP }
        }),
      allPresets: () => [...BUILT_IN_PRESETS, ...get().userPresets],
    }),
    { name: "vibeplay-modify", storage: zustandStorage },
  ),
)
