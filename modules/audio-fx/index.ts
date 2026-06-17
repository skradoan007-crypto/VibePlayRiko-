import { requireNativeModule } from "expo-modules-core"

// Native Android audio-effects module (android.media.audiofx).
// Throws on platforms where it is not linked (iOS / web / Expo Go);
// callers must guard with try/catch. Prefer importing via
// requireNativeModule("AudioFx") directly in DSP code.
export default requireNativeModule("AudioFx")
