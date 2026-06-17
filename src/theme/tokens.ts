/** Spacing, radius, typography and motion tokens (8pt-based, premium spacing). */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const

export const typography = {
  family: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  size: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    title: 20,
    headline: 28,
    display: 36,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const

export const motion = {
  fast: 180,
  base: 280,
  slow: 460,
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
} as const

export const elevation = {
  soft: {
    shadowColor: "#1565C0",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  floating: {
    shadowColor: "#1565C0",
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
} as const
