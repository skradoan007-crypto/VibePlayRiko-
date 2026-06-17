import React, { useCallback, useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { SplashExperience } from "@/features/splash/SplashExperience"
import { usePlayerStore } from "@/stores/playerStore"
import { useLibraryStore } from "@/stores/libraryStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { getDb } from "@/core/db/database"

SplashScreen.preventAutoHideAsync().catch(() => {})

/** Cinematic loader gate: warms the DB + audio engine, loads the library, then reveals the app. */
export default function Index() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const bootstrap = usePlayerStore((s) => s.bootstrap)
  const loadFromDb = useLibraryStore((s) => s.loadFromDb)
  const rescan = useLibraryStore((s) => s.rescan)
  const autoRescan = useSettingsStore((s) => s.autoRescanOnLaunch)

  useEffect(() => {
    let active = true
    async function prepare() {
      try {
        getDb()
        await bootstrap()
        loadFromDb()
        if (autoRescan) await rescan()
      } catch (err) {
        console.warn("Startup error", err)
      } finally {
        await SplashScreen.hideAsync().catch(() => {})
        if (active) setReady(true)
      }
    }
    void prepare()
    return () => {
      active = false
    }
  }, [autoRescan, bootstrap, loadFromDb, rescan])

  const handleDone = useCallback(() => {
    router.replace("/library")
  }, [router])

  return (
    <View style={styles.fill}>{ready ? <SplashExperience onDone={handleDone} /> : null}</View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
})
