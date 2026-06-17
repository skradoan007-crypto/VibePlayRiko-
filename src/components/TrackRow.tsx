import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import type { Track } from "@/types/models"
import { useTheme } from "@/theme"
import { msToClock } from "@/utils/format"
import { useFavoritesStore } from "@/stores/favoritesStore"

type Props = {
  track: Track
  active?: boolean
  onPress: () => void
  onLongPress?: () => void
}

const SPRING = { damping: 18, stiffness: 240, mass: 0.7 }

export function TrackRow({ track, active, onPress, onLongPress }: Props) {
  const { theme } = useTheme()
  const isFav = useFavoritesStore((s) => !!s.ids[track.id])
  const toggleFav = useFavoritesStore((s) => s.toggle)

  const scale = useSharedValue(1)
  const heart = useSharedValue(1)
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }))

  const onFav = () => {
    heart.value = withSequence(withTiming(1.45, { duration: 130 }), withSpring(1, SPRING))
    Haptics.selectionAsync().catch(() => {})
    toggleFav(track.id)
  }
  const onIn = () => {
    scale.value = withSpring(0.97, SPRING)
  }
  const onOut = () => {
    scale.value = withSpring(1, SPRING)
  }

  const activeBg = active ? { backgroundColor: theme.glass.fill.light } : null

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} onPressIn={onIn} onPressOut={onOut}>
      <Animated.View style={[styles.row, rowStyle, { borderRadius: theme.radius.md }, activeBg]}>
        <View style={[styles.art, { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.sm }]}>
          <Ionicons name={active ? "musical-notes" : "musical-note"} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={[styles.title, { color: active ? theme.colors.primary : theme.colors.onSurface }]}>
            {track.title}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
            {track.artist}
            {track.durationMs ? `  \u00b7  ${msToClock(track.durationMs)}` : ""}
          </Text>
        </View>
        <Pressable hitSlop={10} onPress={onFav}>
          <Animated.View style={heartStyle}>
            <Ionicons
              name={isFav ? "heart" : "heart-outline"}
              size={20}
              color={isFav ? theme.colors.accentPink : theme.colors.onSurfaceVariant}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10, gap: 12 },
  art: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  meta: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600" },
  sub: { fontSize: 12, marginTop: 2 },
})
