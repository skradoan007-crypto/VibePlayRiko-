import React, { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { useTheme } from "@/theme"

/**
 * Reactive bar visualizer.
 * NOTE: A true FFT spectrum needs native audio-tap access (not exposed by expo-av).
 * This is a tasteful playback-reactive animation; swap in real PCM/FFT data when a
 * native audio module is added.
 */
function Bar({ delay, active }: { delay: number; active: boolean }) {
  const { theme } = useTheme()
  const h = useSharedValue(0.2)
  useEffect(() => {
    if (active) {
      h.value = withRepeat(
        withTiming(1, { duration: 420 + delay, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      )
    } else {
      h.value = withTiming(0.18, { duration: 300 })
    }
  }, [active, delay, h])
  const style = useAnimatedStyle(() => ({ height: `${h.value * 100}%` }))
  return (
    <Animated.View
      style={[styles.bar, style, { backgroundColor: theme.accent, borderRadius: theme.radius.sm }]}
    />
  )
}

export function Visualizer({ active, bars = 28 }: { active: boolean; bars?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: bars }).map((_, i) => (
        <Bar key={i} delay={(i % 7) * 60} active={active} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", height: 64, gap: 4, justifyContent: "center" },
  bar: { width: 4, opacity: 0.85 },
})
