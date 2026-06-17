import Constants from "expo-constants"

/**
 * Centralised, typed access to runtime configuration.
 * Never read process.env directly outside this file.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  env?: string
  eas?: { projectId?: string }
}

export type AppEnv = "development" | "preview" | "production"

const rawEnv = (process.env.EXPO_PUBLIC_ENV ?? extra.env ?? "development") as AppEnv

export const ENV = {
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "VibePlay – Riko",
  packageName: "com.rikodev.music",
  version: Constants.expoConfig?.version ?? "1.0.0",
  env: rawEnv,
  isDev: rawEnv === "development",
  isPreview: rawEnv === "preview",
  isProduction: rawEnv === "production",
  easProjectId: extra.eas?.projectId,
} as const

export type Env = typeof ENV
