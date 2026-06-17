import React, { useEffect } from "react"
import { Image, StyleSheet, Text, View } from "react-native"
import MaskedView from "@react-native-masked-view/masked-view"
import { LinearGradient } from "expo-linear-gradient"
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import { useTheme } from "@/theme"

const R_MASK = require("../../../assets/r-mask.png")
const R_W = 220
const R_H = Math.round((R_W * 451) / 530)
const FIELD = Math.round(R_W * 2.4)

// Brand-spectrum colours that sweep through the R like Google's "G" loader.
const SWEEP_COLORS = ["#1565C0", "#00E5FF", "#1DE9B6", "#FFB300", "#FF4D8D", "#8C5BFF", "#1565C0"]
const BAR_COLORS = ["#00E5FF", "#1565C0", "#8C5BFF"]
const P_TL = { x: 0, y: 0 }
const P_BR = { x: 1, y: 1 }
const P_R = { x: 1, y: 0 }

/**
 * Authentic startup loader.
 * The brand R is used as a live mask: a multi-colour brand-spectrum gradient
 * rotates behind it so the colours sweep around the letter like the Google "G"
 * loading animation. "Enjoy Your Life Different" fades up beneath it, and a
 * gradient progress bar fills before the app is revealed.
 */
export function SplashExperience({ onDone }: { onDone: () => void }) {
  const { theme } = useTheme()
  const spin = useSharedValue(0)
  const breathe = useSharedValue(0)
  const enter = useSharedValue(0)
  const tagline = useSharedValue(0)
  const progress = useSharedValue(0)

  const finish = () => onDone()

  useEffect(() => {
    enter.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.4)) })
    spin.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false)
    breathe.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }), -1, true)
    tagline.value = withDelay(480, withTiming(1, { duration: 760 }))
    progress.value = withDelay(
      260,
      withTiming(1, { duration: 2700, easing: Easing.inOut(Easing.cubic) }, (done) => {
        if (done) runOnJS(finish)()
      }),
    )
  }, [enter, spin, breathe, tagline, progress])

  const fieldStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }))

  const rStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ scale: interpolate(enter.value, [0, 1], [0.7, 1]) * (1 + breathe.value * 0.04) }],
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: interpolate(tagline.value, [0, 1], [14, 0]) }],
  }))

  const brandStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
  }))

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  const bg =
    theme.mode === "amoled"
      ? ["#000000", "#05070C", "#0A0E14"]
      : ["#F5F9FF", "#EAF2FE", "#E3ECFF"]

  return (
    <View style={styles.fill}>
      <LinearGradient colors={bg} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <Animated.View style={[styles.rWrap, rStyle]}>
          <MaskedView
            style={styles.mask}
            maskElement={<Image source={R_MASK} style={styles.maskImg} resizeMode="contain" />}
          >
            <View style={styles.fieldClip}>
              <Animated.View style={[styles.field, fieldStyle]}>
                <LinearGradient colors={SWEEP_COLORS} start={P_TL} end={P_BR} style={StyleSheet.absoluteFill} />
              </Animated.View>
            </View>
          </MaskedView>
        </Animated.View>

        <Animated.Text style={[styles.brand, brandStyle, { color: theme.colors.onBackground }]}>
          VibePlay – Riko
        </Animated.Text>

        <Animated.View style={taglineStyle}>
          <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>Enjoy Your Life Different</Text>
        </Animated.View>

        <View style={[styles.barTrack, { backgroundColor: theme.glass.fill.faint }]}>
          <Animated.View style={[styles.barFill, barStyle]}>
            <LinearGradient colors={BAR_COLORS} start={P_TL} end={P_R} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  rWrap: { width: R_W, height: R_H, alignItems: "center", justifyContent: "center" },
  mask: { width: R_W, height: R_H },
  maskImg: { width: R_W, height: R_H },
  fieldClip: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  field: { width: FIELD, height: FIELD },
  brand: { marginTop: 34, fontSize: 24, fontWeight: "800", letterSpacing: 0.4 },
  tagline: { marginTop: 8, fontSize: 13, fontWeight: "600", letterSpacing: 1.6, textTransform: "uppercase" },
  barTrack: { marginTop: 26, width: 180, height: 4, borderRadius: 999, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 999, overflow: "hidden" },
})
