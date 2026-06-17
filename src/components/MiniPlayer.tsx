import React, { useEffect } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { GlassSurface } from "./GlassSurface"
import { useTheme } from "@/theme"
import { usePlayerStore } from "@/stores/playerStore"

const SPRING = { damping: 18, stiffness: 240, mass: 0.7 }

export function MiniPlayer() {
  const { theme } = useTheme()
  const router = useRouter()
  const current = usePlayerStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex] : undefined))
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const toggle = usePlayerStore((s) => s.toggle)
  const next = usePlayerStore((s) => s.next)
  const positionMs = usePlayerStore((s) => s.positionMs)
  const durationMs = usePlayerStore((s) => s.durationMs)

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0
  const w = useSharedValue(0)
  const scale = useSharedValue(1)
  useEffect(() => {
    w.value = withTiming(progress, { duration: 300 })
  }, [progress, w])
  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }))
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const open = () => router.push("/now-playing")
  const onIn = () => {
    scale.value = withSpring(0.98, SPRING)
  }
  const onOut = () => {
    scale.value = withSpring(1, SPRING)
  }
  const onToggle = () => {
    Haptics.selectionAsync().catch(() => {})
    void toggle()
  }
  const onNext = () => {
    void next(false)
  }

  if (!current) return null

  return (
    <Animated.View entering={FadeInUp.duration(420)} style={bodyStyle}>
      <GlassSurface style={styles.wrap} radius={theme.radius.lg}>
        <Pressable style={styles.inner} onPress={open} onPressIn={onIn} onPressOut={onOut}>
          <View style={[styles.art, { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.sm }]}>
            <Ionicons name="musical-notes" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.meta}>
            <Text numberOfLines={1} style={[styles.title, { color: theme.colors.onSurface }]}>
              {current.title}
            </Text>
            <Text numberOfLines={1} style={[styles.sub, { color: theme.colors.onSurfaceVariant }]}>
              {current.artist}
            </Text>
          </View>
          <Pressable hitSlop={10} onPress={onToggle}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={theme.accent} />
          </Pressable>
          <Pressable hitSlop={10} onPress={onNext}>
            <Ionicons name="play-skip-forward" size={22} color={theme.colors.onSurface} />
          </Pressable>
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.outlineVariant }]}>
          <Animated.View style={[styles.progressFill, fillStyle, { backgroundColor: theme.accent }]} />
        </View>
      </GlassSurface>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 10, marginBottom: 6, overflow: "hidden" },
  inner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10 },
  art: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  meta: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600" },
  sub: { fontSize: 12, marginTop: 1 },
  progressTrack: { height: 2, width: "100%" },
  progressFill: { height: 2 },
})
