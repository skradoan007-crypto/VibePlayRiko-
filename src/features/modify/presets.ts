import { DEFAULT_DSP, type DspState } from "./dsp"

export interface EqPreset {
  id: string
  name: string
  state: DspState
}

const withBands = (bands: number[], extra: Partial<DspState> = {}): DspState => ({
  ...DEFAULT_DSP,
  bands,
  ...extra,
})

export const BUILT_IN_PRESETS: EqPreset[] = [
  { id: "flat", name: "Flat", state: withBands([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { id: "bass", name: "Bass Boost", state: withBands([6, 5, 4, 2, 0, 0, 0, 0, 0, 0], { bassBoost: 0.6 }) },
  { id: "treble", name: "Treble Boost", state: withBands([0, 0, 0, 0, 0, 1, 3, 5, 6, 6], { trebleBoost: 0.5 }) },
  { id: "vocal", name: "Vocal", state: withBands([-2, -1, 0, 2, 4, 4, 3, 1, 0, -1], { vocal: 0.5 }) },
  { id: "electronic", name: "Electronic", state: withBands([5, 4, 1, 0, -1, 1, 2, 4, 5, 5]) },
  { id: "rock", name: "Rock", state: withBands([4, 3, 2, 0, -1, -1, 1, 3, 4, 4]) },
  { id: "acoustic", name: "Acoustic", state: withBands([3, 3, 2, 1, 1, 1, 2, 2, 2, 1]) },
  { id: "night", name: "Late Night", state: withBands([2, 1, 0, 0, 1, 1, 0, -1, -2, -3], { reverb: 0.2 }) },
]
