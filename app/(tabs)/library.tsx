import React, { useMemo, useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassButton } from "@/components/GlassButton"
import { GlassSurface } from "@/components/GlassSurface"
import { TrackRow } from "@/components/TrackRow"
import { useLibraryStore } from "@/stores/libraryStore"
import { usePlayerStore } from "@/stores/playerStore"
import { useTheme } from "@/theme"
import Animated, { FadeInDown } from "react-native-reanimated"
import { searchLibrary } from "@/features/search/search"
import { formatCount } from "@/utils/format"

export default function LibraryScreen() {
  const { theme } = useTheme()
  const tracks = useLibraryStore((s) => s.tracks)
  const progress = useLibraryStore((s) => s.progress)
  const duplicates = useLibraryStore((s) => s.duplicates)
  const rescan = useLibraryStore((s) => s.rescan)
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay)
  const currentId = usePlayerStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex]?.id : undefined))
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const q = query.trim()
    if (!q) return tracks
    return searchLibrary(tracks, q).tracks
  }, [query, tracks])

  const scanning =
    progress.phase === "scanning" || progress.phase === "requesting" || progress.phase === "indexing"

  const renderItem = (row: { item: (typeof visible)[number]; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(Math.min(row.index, 8) * 40)}>
      <TrackRow
        track={row.item}
        active={row.item.id === currentId}
        onPress={() => void setQueueAndPlay(visible, row.index)}
      />
    </Animated.View>
  )

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.h1, { color: theme.colors.onSurface }]}>Library</Text>
            <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
              {formatCount(tracks.length)} tracks
              {duplicates.length > 0 ? `  \u00b7  ${duplicates.length} duplicate groups` : ""}
            </Text>
          </View>
          <GlassButton
            label={scanning ? "Scanning\u2026" : "Scan"}
            icon={<Ionicons name="sync" size={18} color={theme.colors.primary} />}
            disabled={scanning}
            onPress={() => void rescan()}
          />
        </View>

        <GlassSurface style={styles.searchBox} radius={theme.radius.pill}>
          <Ionicons name="search" size={18} color={theme.colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search songs, artists, albums"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={[styles.searchInput, { color: theme.colors.onSurface }]}
          />
        </GlassSurface>

        {scanning ? (
          <Text style={[styles.status, { color: theme.colors.onSurfaceVariant }]}>
            {`Scanned ${progress.scanned} files\u2026`}
          </Text>
        ) : null}

        {visible.length === 0 ? (
          <GlassSurface style={styles.empty} radius={theme.radius.lg}>
            <Ionicons name="library-outline" size={42} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {tracks.length === 0
                ? "Your library is empty. Tap Scan to index all music on this device."
                : "No matches for your search."}
            </Text>
          </GlassSurface>
        ) : (
          <FlatList
            data={visible}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  h1: { fontSize: 30, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 6 },
  status: { paddingHorizontal: 20, paddingTop: 10, fontSize: 12 },
  list: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 188 },
  empty: { margin: 16, padding: 28, alignItems: "center", gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
})
