import React, { useEffect } from "react"
import { StyleSheet, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { useTheme } from "@/theme"

/** Slowly drifting glow orb — gives the glass backdrop a living, ambient motion. */
function useFloat(range: number, duration: number) {
  const v = useSharedValue(0)
  useEffect(() => {
    v.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [v, duration])
  return useAnimatedStyle(() => ({
    transform: [
      { translateY: (v.value - 0.5) * range },
      { translateX: (v.value - 0.5) * range * 0.6 },
      { scale: 1 + v.value * 0.08 },
    ],
  }))
}

/** Soft liquid-glass ambient backdrop with floating glow orbs. */
export function AmbientBackground({ children }: { children?: React.ReactNode }) {
  const { theme } = useTheme()
  const isAmoled = theme.mode === "amoled"
  const aStyle = useFloat(42, 6000)
  const bStyle = useFloat(56, 7600)
  const cStyle = useFloat(34, 8400)

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.background }]}>
      {!isAmoled ? (
        <>
          <Animated.View style={[styles.orb, styles.orbA, aStyle, { backgroundColor: theme.glass.glow.cyan }]} />
          <Animated.View style={[styles.orb, styles.orbB, bStyle, { backgroundColor: theme.glass.glow.primary }]} />
          <Animated.View style={[styles.orb, styles.orbC, cStyle, { backgroundColor: theme.glass.glow.pink }]} />
        </>
      ) : null}
      <LinearGradient
        colors={
          isAmoled
            ? ["#000000", "#05070C", "#000000"]
            : ["rgba(234,244,255,0.2)", "rgba(255,255,255,0.05)", "rgba(187,222,251,0.25)"]
        }
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  orb: { position: "absolute", borderRadius: 999, opacity: 0.55 },
  orbA: { width: 320, height: 320, top: -80, left: -60 },
  orbB: { width: 280, height: 280, top: 220, right: -80 },
  orbC: { width: 360, height: 360, bottom: -120, left: 40 },
})
