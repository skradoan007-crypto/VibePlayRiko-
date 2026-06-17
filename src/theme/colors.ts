/**
 * VibePlay – Riko color identity.
 * Material 3 · Light Blue primary · light background · colourful accents.
 * These are the canonical brand colors. The Light Neon Glass layer (see glass.ts)
 * is applied ON TOP of these — it never replaces them.
 */
export const palette = {
  // — Primary (Material 3 Light Blue) —
  primary: "#1565C0",
  onPrimary: "#FFFFFF",
  primaryContainer: "#D6E3FF",
  onPrimaryContainer: "#001B3D",

  // — Secondary / Tertiary —
  secondary: "#00A6FF",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#CDE5FF",
  tertiary: "#7C4DFF",
  onTertiary: "#FFFFFF",

  // — Colourful accents (used for glow, charts, highlights) —
  accentCyan: "#00E5FF",
  accentMint: "#1DE9B6",
  accentPink: "#FF4D8D",
  accentAmber: "#FFB300",
  accentViolet: "#8C5BFF",

  // — Surfaces / background (light) —
  background: "#F5F9FF",
  onBackground: "#171C22",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF2FE",
  surfaceVariant: "#DEE7F4",
  onSurface: "#171C22",
  onSurfaceVariant: "#434A54",

  // — Lines / states —
  outline: "#73798A",
  outlineVariant: "#C3CAD7",
  error: "#BA1A1A",
  success: "#2E7D32",
  warning: "#ED6C02",

  // — AMOLED / dark surfaces (for AMOLED mode in Settings) —
  amoledBackground: "#000000",
  amoledSurface: "#0A0E14",
  amoledSurfaceVariant: "#141A24",
  amoledOnSurface: "#E7ECF4",
} as const

export type Palette = typeof palette
export type ColorToken = keyof Palette
