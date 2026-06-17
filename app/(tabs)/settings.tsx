import React from "react"
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassSurface } from "@/components/GlassSurface"
import { useTheme, palette } from "@/theme"
import type { ThemeMode } from "@/theme"
import { useSettingsStore } from "@/stores/settingsStore"
import { useLibraryStore } from "@/stores/libraryStore"
import { useHistoryStore } from "@/stores/historyStore"
import { PressableScale } from "@/components/PressableScale"

const ACCENTS = [
  palette.primary,
  palette.accentCyan,
  palette.accentViolet,
  palette.accentPink,
  palette.accentMint,
  palette.accentAmber,
]
const THEME_MODES: ThemeMode[] = ["system", "light", "amoled"]

function switchTrack(accent: string) {
  return { false: "#9AA3B2", true: accent }
}

export default function SettingsScreen() {
  const { theme, mode, setMode, setAccent } = useTheme()
  const animationsEnabled = useSettingsStore((s) => s.animationsEnabled)
  const autoRescan = useSettingsStore((s) => s.autoRescanOnLaunch)
  const resumeOnLaunch = useSettingsStore((s) => s.resumeOnLaunch)
  const set = useSettingsStore((s) => s.set)
  const rescan = useLibraryStore((s) => s.rescan)
  const trackCount = useLibraryStore((s) => s.tracks.length)
  const clearHistory = useHistoryStore((s) => s.clear)

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.h1, { color: theme.colors.onSurface }]}>Settings</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>Appearance</Text>
          <GlassSurface style={styles.card} radius={theme.radius.lg}>
            <Text style={[styles.cardLabel, { color: theme.colors.onSurface }]}>Theme</Text>
            <View style={styles.segments}>
              {THEME_MODES.map((m) => (
                <PressableScale
                  key={m}
                  scaleTo={0.92}
                  onPress={() => setMode(m)}
                  style={[
                    styles.segment,
                    { backgroundColor: mode === m ? theme.accent : theme.glass.fill.faint, borderColor: theme.glass.border.light },
                  ]}
                >
                  <Text style={[styles.segmentText, { color: mode === m ? theme.colors.onPrimary : theme.colors.onSurface }]}>
                    {m}
                  </Text>
                </PressableScale>
              ))}
            </View>
            <Text style={[styles.cardLabel, { color: theme.colors.onSurface, marginTop: 16 }]}>Accent</Text>
            <View style={styles.swatches}>
              {ACCENTS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setAccent(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c, borderColor: theme.accent === c ? theme.colors.onSurface : "transparent" },
                  ]}
                />
              ))}
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Animations</Text>
              <Switch
                value={animationsEnabled}
                onValueChange={(v) => set("animationsEnabled", v)}
                trackColor={switchTrack(theme.accent)}
                thumbColor="#FFFFFF"
              />
            </View>
          </GlassSurface>

          <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>Library</Text>
          <GlassSurface style={styles.card} radius={theme.radius.lg}>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Re-scan on launch</Text>
              <Switch
                value={autoRescan}
                onValueChange={(v) => set("autoRescanOnLaunch", v)}
                trackColor={switchTrack(theme.accent)}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: theme.colors.onSurface }]}>Resume last track on launch</Text>
              <Switch
                value={resumeOnLaunch}
                onValueChange={(v) => set("resumeOnLaunch", v)}
                trackColor={switchTrack(theme.accent)}
                thumbColor="#FFFFFF"
              />
            </View>
            <PressableScale scaleTo={0.97} style={styles.actionRow} onPress={() => void rescan()}>
              <Ionicons name="sync" size={20} color={theme.accent} />
              <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>{`Re-scan library (${trackCount} tracks)`}</Text>
            </PressableScale>
            <PressableScale scaleTo={0.97} style={styles.actionRow} onPress={() => clearHistory()}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>Clear play history</Text>
            </PressableScale>
          </GlassSurface>

          <Text style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>About</Text>
          <GlassSurface style={styles.card} radius={theme.radius.lg}>
            <Text style={[styles.aboutTitle, { color: theme.colors.onSurface }]}>VibePlay – Riko</Text>
            <Text style={[styles.aboutText, { color: theme.colors.onSurfaceVariant }]}>
              Offline music player · v1.0.0\nLight Neon Glass · Advanced Shuffle · Modification Lab
            </Text>
          </GlassSurface>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  h1: { fontSize: 30, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingBottom: 200, gap: 8 },
  section: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 14, marginBottom: 4 },
  card: { padding: 16, gap: 6 },
  cardLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  segments: { flexDirection: "row", gap: 8 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 1, alignItems: "center" },
  segmentText: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  swatches: { flexDirection: "row", gap: 12, marginTop: 4 },
  swatch: { width: 34, height: 34, borderRadius: 999, borderWidth: 3 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  rowLabel: { fontSize: 15, flex: 1, paddingRight: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  actionText: { fontSize: 15 },
  aboutTitle: { fontSize: 18, fontWeight: "700" },
  aboutText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
})
