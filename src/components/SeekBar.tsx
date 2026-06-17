import React from "react"
import { StyleSheet, Text, View } from "react-native"
import Slider from "@react-native-community/slider"
import { useTheme } from "@/theme"
import { msToClock } from "@/utils/format"
import { usePlayerStore } from "@/stores/playerStore"

export function SeekBar() {
  const { theme } = useTheme()
  const positionMs = usePlayerStore((s) => s.positionMs)
  const durationMs = usePlayerStore((s) => s.durationMs)
  const seekTo = usePlayerStore((s) => s.seekTo)
  const [scrubbing, setScrubbing] = React.useState<number | null>(null)

  const value = scrubbing ?? positionMs
  const max = Math.max(durationMs, 1)

  return (
    <View style={styles.wrap}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={max}
        value={Math.min(value, max)}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.colors.outlineVariant}
        thumbTintColor={theme.accent}
        onSlidingStart={() => setScrubbing(positionMs)}
        onValueChange={(v) => setScrubbing(v)}
        onSlidingComplete={(v) => {
          setScrubbing(null)
          void seekTo(v)
        }}
      />
      <View style={styles.times}>
        <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>{msToClock(value)}</Text>
        <Text style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>{msToClock(durationMs)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  slider: { width: "100%", height: 36 },
  times: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6, marginTop: -4 },
  time: { fontSize: 12, fontVariant: ["tabular-nums"] },
})
