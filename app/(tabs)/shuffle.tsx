import React, { useState } from "react"
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassButton } from "@/components/GlassButton"
import { GlassSurface } from "@/components/GlassSurface"
import { useTheme } from "@/theme"
import { useLibraryStore } from "@/stores/libraryStore"
import { usePlayerStore } from "@/stores/playerStore"
import { useHistoryStore } from "@/stores/historyStore"
import {
  STRATEGIES,
  applyStrategy,
  generateGroupShuffle,
  DEFAULT_GROUP_CONFIG,
} from "@/features/shuffle"
import type { GroupByKey } from "@/features/shuffle"
import Animated, { FadeInDown } from "react-native-reanimated"
import { PressableScale } from "@/components/PressableScale"

const GROUP_KEYS: GroupByKey[] = ["artist", "album", "genre", "folder", "decade", "mood"]

export default function ShuffleScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const enrichedTracks = useLibraryStore((s) => s.enrichedTracks)
  const trackCount = useLibraryStore((s) => s.tracks.length)
  const setShuffleStrategy = usePlayerStore((s) => s.setShuffleStrategy)
  const applyShuffleOrder = usePlayerStore((s) => s.applyShuffleOrder)
  const selected = usePlayerStore((s) => s.shuffleStrategyId)
  const [groupBy, setGroupBy] = useState<GroupByKey>("artist")

  const runStrategy = async (id: string) => {
    setShuffleStrategy(id)
    const tracks = enrichedTracks()
    if (tracks.length === 0) return
    const ctx = { now: Date.now(), recentIds: useHistoryStore.getState().recentlyPlayed(40) }
    const order = applyStrategy(id, tracks, ctx)
    await applyShuffleOrder(order)
    router.push("/now-playing")
  }

  const runGroupShuffle = async () => {
    const tracks = enrichedTracks()
    if (tracks.length === 0) return
    const config = { ...DEFAULT_GROUP_CONFIG, groupBy }
    const result = generateGroupShuffle(tracks, config, [])
    await applyShuffleOrder(result.order)
    router.push("/now-playing")
  }

  const header = (
    <GlassSurface style={styles.groupCard} radius={theme.radius.lg}>
      <View style={styles.groupHead}>
        <Ionicons name="git-merge-outline" size={20} color={theme.accent} />
        <Text style={[styles.groupTitle, { color: theme.colors.onSurface }]}>Group Shuffle</Text>
      </View>
      <Text style={[styles.groupSub, { color: theme.colors.onSurfaceVariant }]}>
        Flagship engine — rotate evenly across groups, keep variety high, surface underplayed tracks.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {GROUP_KEYS.map((k) => (
          <PressableScale
            key={k}
            scaleTo={0.9}
            onPress={() => setGroupBy(k)}
            style={[
              styles.chip,
              { borderColor: theme.glass.border.light, backgroundColor: groupBy === k ? theme.accent : theme.glass.fill.faint },
            ]}
          >
            <Text style={[styles.chipText, { color: groupBy === k ? theme.colors.onPrimary : theme.colors.onSurface }]}>
              {k}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
      <View style={styles.groupBtn}>
        <GlassButton
          variant="primary"
          label="Start Group Shuffle"
          icon={<Ionicons name="shuffle" size={18} color={theme.colors.onPrimary} />}
          onPress={() => void runGroupShuffle()}
        />
      </View>
      <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>Shuffle modes</Text>
    </GlassSurface>
  )

  const renderItem = (row: { item: (typeof STRATEGIES)[number]; index: number }) => {
    const item = row.item
    const active = item.id === selected
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(Math.min(row.index, 8) * 45)}>
        <PressableScale
          scaleTo={0.97}
          onPress={() => void runStrategy(item.id)}
          style={[
            styles.stratCard,
            { borderColor: active ? theme.accent : theme.glass.border.light, backgroundColor: theme.glass.fill.faint },
          ]}
        >
          <View style={styles.stratText}>
            <Text style={[styles.stratName, { color: theme.colors.onSurface }]}>{item.name}</Text>
            <Text style={[styles.stratDesc, { color: theme.colors.onSurfaceVariant }]}>{item.description}</Text>
          </View>
          <Ionicons name="play-circle" size={28} color={active ? theme.accent : theme.colors.onSurfaceVariant} />
        </PressableScale>
      </Animated.View>
    )
  }

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[styles.h1, { color: theme.colors.onSurface }]}>Shuffle Lab</Text>
          <Text style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>{`${trackCount} tracks ready`}</Text>
        </View>
        <FlatList
          data={STRATEGIES}
          keyExtractor={(s) => s.id}
          ListHeaderComponent={header}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  h1: { fontSize: 30, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 140 },
  groupCard: { padding: 16, marginBottom: 14, gap: 10 },
  groupHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: { fontSize: 18, fontWeight: "700" },
  groupSub: { fontSize: 13, lineHeight: 18 },
  chips: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  groupBtn: { marginTop: 4, alignItems: "flex-start" },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 6 },
  stratCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
  },
  stratText: { flex: 1, paddingRight: 12 },
  stratName: { fontSize: 15, fontWeight: "600" },
  stratDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
})
