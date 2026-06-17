import React from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassButton } from "@/components/GlassButton"
import { GlassSurface } from "@/components/GlassSurface"
import { TrackRow } from "@/components/TrackRow"
import Animated, { FadeInDown } from "react-native-reanimated"
import { useBrowseStore } from "@/stores/browseStore"
import { usePlayerStore } from "@/stores/playerStore"
import { useTheme } from "@/theme"

/** MODE 1 — Browse + Pick One. Ephemeral, separate from the scanned Library tab. */
export default function BrowseScreen() {
  const { theme } = useTheme()
  const loading = useBrowseStore((s) => s.loading)
  const pickFiles = useBrowseStore((s) => s.pickFiles)
  const openFolder = useBrowseStore((s) => s.openFolder)
  const visibleEntries = useBrowseStore((s) => s.visibleEntries)
  const entries = useBrowseStore((s) => s.entries)
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay)
  const currentId = usePlayerStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex]?.id : undefined))

  const data = visibleEntries()

  const renderItem = (row: { item: (typeof data)[number]; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(Math.min(row.index, 8) * 40)}>
      <TrackRow
        track={row.item}
        active={row.item.id === currentId}
        onPress={() => void setQueueAndPlay(data, row.index)}
      />
    </Animated.View>
  )

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.h1, { color: theme.colors.onSurface }]}>Browse</Text>
          <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
            Pick a folder or a single track for instant play — kept separate from your library.
          </Text>
        </View>

        <View style={styles.actions}>
          <GlassButton
            variant="primary"
            label="Open folder"
            icon={<Ionicons name="folder-open" size={18} color={theme.colors.onPrimary} />}
            onPress={() => void openFolder()}
          />
          <GlassButton
            label="Pick files"
            icon={<Ionicons name="document-outline" size={18} color={theme.colors.primary} />}
            onPress={() => void pickFiles()}
          />
        </View>

        {data.length === 0 ? (
          <GlassSurface style={styles.empty} radius={theme.radius.lg}>
            <Ionicons name="musical-notes-outline" size={42} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {loading ? "Reading folder\u2026" : "No tracks yet. Open a folder or pick files to begin."}
            </Text>
          </GlassSurface>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(t) => t.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  h1: { fontSize: 30, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  list: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 188 },
  empty: { margin: 16, padding: 28, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
})
