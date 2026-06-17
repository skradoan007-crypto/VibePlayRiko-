import { Platform } from "react-native"
import { AudioEngine } from "@/core/audio/AudioEngine"

/**
 * Modification Lab DSP layer.
 *
 * Real & audible on EVERY build (via expo-av):
 *   - Speed / Tempo (pitch-corrected rate)
 *   - Pitch (rate without pitch correction)
 *   - Pre-amp / Volume
 *
 * Real on NATIVE Android builds (via the bundled `audio-fx` Expo module that
 * wraps android.media.audiofx): 10-band Equalizer, Bass boost, Treble, Vocal
 * presence and Reverb. These attach to the global output mix, so they colour
 * everything the player outputs. On Expo Go / iOS / web the native module is
 * absent and these gracefully no-op (Speed / Pitch / Pre-amp still work).
 */

export type DspState = {
  // 10-band EQ gains in dB (-12..+12).
  bands: number[]
  bassBoost: number // 0..1
  trebleBoost: number // 0..1
  vocal: number // 0..1
  reverb: number // 0..1
  echo: number // 0..1
  stereoWidth: number // 0..1
  preamp: number // 0..1 (volume)
  speed: number // 0.5..2.0 (tempo, pitch preserved)
  pitch: number // 0.5..2.0 (pitch shift)
}

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const DEFAULT_DSP: DspState = {
  bands: new Array(EQ_FREQUENCIES.length).fill(0),
  bassBoost: 0,
  trebleBoost: 0,
  vocal: 0,
  reverb: 0,
  echo: 0,
  stereoWidth: 0,
  preamp: 1,
  speed: 1,
  pitch: 1,
}

// ---------------------------------------------------------------------------
// Native bridge (android.media.audiofx via the local `audio-fx` Expo module)
// ---------------------------------------------------------------------------

type NativeFxModule = {
  isAvailable: () => boolean
  setEnabled: (enabled: boolean) => void
  getNumberOfBands: () => number
  getCenterFrequencies: () => number[] // milliHz
  getBandLevelRange: () => number[] // [minMb, maxMb]
  setBandLevels: (levels: number[]) => void // millibels per native band
  setBassBoost: (strength: number) => void // 0..1000
  setReverbPreset: (preset: number) => void // 0..6
  release: () => void
}

function loadNativeFx(): NativeFxModule | null {
  if (Platform.OS !== "android") return null
  try {
    // Lazy require so Expo Go / web never crash when the native module is absent.
    const core = require("expo-modules-core")
    const mod = core.requireNativeModule("AudioFx") as NativeFxModule
    return mod && mod.isAvailable() ? mod : null
  } catch {
    return null
  }
}

const NativeFx = loadNativeFx()

export const NATIVE_FX_AVAILABLE = NativeFx != null

// Cache the device EQ topology (band count + center freqs + level range).
let topology: { count: number; centersHz: number[]; minMb: number; maxMb: number } | null = null

function nativeTopology() {
  if (!NativeFx) return null
  if (topology) return topology
  try {
    const count = NativeFx.getNumberOfBands()
    const centersHz = NativeFx.getCenterFrequencies().map((mHz) => mHz / 1000)
    const range = NativeFx.getBandLevelRange()
    topology = { count, centersHz, minMb: range[0] ?? -1500, maxMb: range[1] ?? 1500 }
    return topology
  } catch {
    return null
  }
}

// Map our fixed 10-band dB model + bass/treble/vocal onto the device's native
// EQ bands, returning per-band millibel levels.
function nativeBandLevels(state: DspState): number[] {
  const topo = nativeTopology()
  if (!topo) return []
  const out: number[] = []
  for (let i = 0; i < topo.count; i++) {
    const hz = topo.centersHz[i] ?? 0
    let gainDb = 0
    let best = Infinity
    for (let j = 0; j < EQ_FREQUENCIES.length; j++) {
      const d = Math.abs(EQ_FREQUENCIES[j] - hz)
      if (d < best) {
        best = d
        gainDb = state.bands[j] ?? 0
      }
    }
    if (hz <= 250) gainDb += state.bassBoost * 9
    if (hz >= 4000) gainDb += state.trebleBoost * 9
    if (hz >= 500 && hz <= 4000) gainDb += state.vocal * 5
    const mb = Math.round(gainDb * 100)
    out.push(Math.max(topo.minMb, Math.min(topo.maxMb, mb)))
  }
  return out
}

// PresetReverb: 0 NONE, 1 SMALLROOM, 2 MEDIUMROOM, 3 LARGEROOM, 4 MEDIUMHALL, 5 LARGEHALL, 6 PLATE
function reverbToPreset(v: number): number {
  if (v <= 0.02) return 0
  return Math.max(1, Math.min(6, Math.round(v * 6)))
}

export async function applyDsp(state: DspState): Promise<void> {
  // expo-av path — always real.
  await AudioEngine.setVolume(state.preamp)
  if (state.pitch !== 1) {
    await AudioEngine.setRate(state.pitch, false)
  } else {
    await AudioEngine.setRate(state.speed, true)
  }

  // Native effects path — real on Android builds.
  if (NativeFx) {
    try {
      const active =
        state.bands.some((b) => b !== 0) ||
        state.bassBoost > 0 ||
        state.trebleBoost > 0 ||
        state.vocal > 0 ||
        state.reverb > 0
      NativeFx.setEnabled(active)
      NativeFx.setBandLevels(nativeBandLevels(state))
      NativeFx.setBassBoost(Math.round(Math.max(0, Math.min(1, state.bassBoost)) * 1000))
      NativeFx.setReverbPreset(reverbToPreset(state.reverb))
    } catch {
      // ignore native failures; expo-av effects still applied
    }
  }
}
