import { palette } from "./colors"

/**
 * Light Neon Glass tokens — the liquid-glass layer applied on top of brand colors.
 * Soft translucent fills, frosted blur, thin glowing borders, ambient glow.
 */
export const glass = {
  blur: {
    subtle: 18,
    base: 36,
    strong: 60,
  },
  // Translucent surface fills (light mode)
  fill: {
    light: "rgba(255,255,255,0.55)",
    mid: "rgba(255,255,255,0.38)",
    faint: "rgba(255,255,255,0.24)",
  },
  // Thin glowing edges
  border: {
    light: "rgba(255,255,255,0.70)",
    primary: "rgba(21,101,192,0.35)",
    accent: "rgba(0,229,255,0.45)",
  },
  // Ambient glow colors
  glow: {
    primary: "rgba(41,98,255,0.35)",
    cyan: "rgba(0,229,255,0.30)",
    pink: "rgba(255,77,141,0.25)",
  },
  // Liquid gradient stops for backgrounds
  gradient: {
    ambient: [palette.surfaceAlt, palette.surface, palette.primaryContainer],
    aurora: [palette.accentCyan, palette.primary, palette.accentViolet],
  },
} as const

export type Glass = typeof glass
