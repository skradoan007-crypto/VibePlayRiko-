import React, { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useColorScheme } from "react-native"
import { palette } from "./colors"
import { glass } from "./glass"
import { spacing, radius, typography, motion, elevation } from "./tokens"

export type ThemeMode = "light" | "amoled" | "system"

export type Theme = {
  mode: Exclude<ThemeMode, "system">
  accent: string
  colors: typeof palette & {
    background: string
    surface: string
    surfaceVariant: string
    onSurface: string
  }
  glass: typeof glass
  spacing: typeof spacing
  radius: typeof radius
  typography: typeof typography
  motion: typeof motion
  elevation: typeof elevation
}

type ThemeContextValue = {
  theme: Theme
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function buildTheme(resolved: "light" | "amoled", accent: string): Theme {
  const isAmoled = resolved === "amoled"
  return {
    mode: resolved,
    accent,
    colors: {
      ...palette,
      background: isAmoled ? palette.amoledBackground : palette.background,
      surface: isAmoled ? palette.amoledSurface : palette.surface,
      surfaceVariant: isAmoled ? palette.amoledSurfaceVariant : palette.surfaceVariant,
      onSurface: isAmoled ? palette.amoledOnSurface : palette.onSurface,
    },
    glass,
    spacing,
    radius,
    typography,
    motion,
    elevation,
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme()
  const [mode, setMode] = useState<ThemeMode>("system")
  const [accent, setAccent] = useState<string>(palette.primary)

  const resolved: "light" | "amoled" =
    mode === "system" ? (system === "dark" ? "amoled" : "light") : mode

  const theme = useMemo(() => buildTheme(resolved, accent), [resolved, accent])

  const handleSetAccent = useCallback((value: string) => setAccent(value), [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, mode, setMode, setAccent: handleSetAccent }),
    [theme, mode, handleSetAccent],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}
