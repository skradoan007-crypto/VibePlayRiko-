import React, { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassSurface } from "@/components/GlassSurface"
import { Visualizer } from "@/components/Visualizer"
import { SeekBar } from "@/components/SeekBar"
import { PressableScale } from "@/components/PressableScale"
import { usePlayerStore } from "@/stores/playerStore"
import { useFavoritesStore } from "@/stores/favoritesStore"
import { useTheme } from "@/theme"

export default function NowPlaying() {
  const { theme } = useTheme()
  const router = useRouter()
  const current = usePlayerStore((s) => (s.currentIndex >= 0 ? s.queue[s.currentIndex] : undefined))
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const repeat = usePlayerStore((s) => s.repeat)
  const shuffleOn = usePlayerStore((s) => s.shuffleOn)
  const toggle = usePlayerStore((s) => s.toggle)
  const next = usePlayerStore((s) => s.next)
  const previous = usePlayerStore((s) => s.previous)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const isFav = useFavoritesStore((s) => (current ? !!s.ids[current.id] : false))
  const toggleFav = useFavoritesStore((s) => s.toggle)

  const translateY = useSharedValue(0)
  const spin = useSharedValue(0)
  const breathe = useSharedValue(0)

  const goBack = () => router.back()
  const openModify = () => router.push("/modify")

  useEffect(() => {
    if (isPlaying) {
      spin.value = withRepeat(withTiming(1, { duration: 12000, easing: Easing.linear }), -1, false)
      breathe.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)
    } else {
      breathe.value = withTiming(0, { duration: 400 })
    }
  }, [isPlaying, spin, breathe])

  const pan = Gesture.Pan()
    .activeOffsetY(16)
    .failOffsetY(-16)
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY)
    })
    .onEnd((e) => {
      if (e.translationY > 130 || e.velocityY > 900) {
        translateY.value = withTiming(900, { duration: 240 }, (done) => {
          if (done) runOnJS(goBack)()
        })
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 })
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))
  const artStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.03 }],
  }))
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }))

  if (!current) {
    return (
      <View style={styles.fill}>
        <AmbientBackground />
        <SafeAreaView style={styles.center}>
          <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>Nothing playing right now</Text>
          <PressableScale haptic={false} onPress={goBack}>
            <Text style={[styles.link, { color: theme.accent }]}>Go back</Text>
          </PressableScale>
        </SafeAreaView>
      </View>
    )
  }

  const repeatColor = repeat === "off" ? theme.colors.onSurfaceVariant : theme.accent
  const onPrev = () => void previous()
  const onNext = () => void next(false)
  const onToggle = () => void toggle()
  const onFav = () => toggleFav(current.id)

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.fill, sheetStyle]}>
          <SafeAreaView style={styles.fill}>
            <View style={styles.grabber}>
              <View style={[styles.grabBar, { backgroundColor: theme.colors.outlineVariant }]} />
            </View>
            <View style={styles.topbar}>
              <PressableScale hitSlop={12} scaleTo={0.85} onPress={goBack}>
                <Ionicons name="chevron-down" size={28} color={theme.colors.onSurface} />
              </PressableScale>
              <Text style={[styles.topTitle, { color: theme.colors.onSurfaceVariant }]}>Now Playing</Text>
              <PressableScale hitSlop={12} scaleTo={0.85} onPress={openModify}>
                <Ionicons name="options-outline" size={24} color={theme.colors.onSurface} />
              </PressableScale>
            </View>

            <View style={styles.artWrap}>
              <Animated.View style={artStyle}>
                <GlassSurface style={styles.art} radius={theme.radius.xl}>
                  <Animated.View style={[styles.haloWrap, ringStyle]}>
                    <View style={[styles.halo, { borderColor: theme.glass.border.accent }]} />
                  </Animated.View>
                  <Ionicons name="musical-notes" size={84} color={theme.accent} />
                  <View style={styles.viz}>
                    <Visualizer active={isPlaying} />
                  </View>
                </GlassSurface>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInUp.duration(450)} style={styles.meta}>
              <Text numberOfLines={1} style={[styles.trackTitle, { color: theme.colors.onSurface }]}>
                {current.title}
              </Text>
              <Text numberOfLines={1} style={[styles.artist, { color: theme.colors.onSurfaceVariant }]}>
                {`${current.artist}  \u00b7  ${current.album}`}
              </Text>
            </Animated.View>

            <View style={styles.seek}>
              <SeekBar />
            </View>

            <View style={styles.controls}>
              <PressableScale hitSlop={10} scaleTo={0.82} onPress={toggleShuffle}>
                <Ionicons name="shuffle" size={26} color={shuffleOn ? theme.accent : theme.colors.onSurfaceVariant} />
              </PressableScale>
              <PressableScale hitSlop={10} scaleTo={0.82} onPress={onPrev}>
                <Ionicons name="play-skip-back" size={34} color={theme.colors.onSurface} />
              </PressableScale>
              <PressableScale scaleTo={0.9} onPress={onToggle} style={[styles.playBtn, { backgroundColor: theme.accent }]}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={36} color={theme.colors.onPrimary} />
              </PressableScale>
              <PressableScale hitSlop={10} scaleTo={0.82} onPress={onNext}>
                <Ionicons name="play-skip-forward" size={34} color={theme.colors.onSurface} />
              </PressableScale>
              <PressableScale hitSlop={10} scaleTo={0.82} onPress={cycleRepeat}>
                <Ionicons name="repeat" size={26} color={repeatColor} />
              </PressableScale>
            </View>

            <View style={styles.bottomRow}>
              <PressableScale scaleTo={0.9} style={styles.bottomBtn} onPress={onFav}>
                <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? theme.colors.accentPink : theme.colors.onSurface} />
                <Text style={[styles.bottomLabel, { color: theme.colors.onSurface }]}>Favorite</Text>
              </PressableScale>
              <PressableScale scaleTo={0.9} style={styles.bottomBtn} onPress={openModify}>
                <Ionicons name="pulse-outline" size={22} color={theme.colors.onSurface} />
                <Text style={[styles.bottomLabel, { color: theme.colors.onSurface }]}>Modify</Text>
              </PressableScale>
            </View>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  empty: { fontSize: 16 },
  link: { fontSize: 15, fontWeight: "700" },
  grabber: { alignItems: "center", paddingTop: 8, paddingBottom: 2 },
  grabBar: { width: 40, height: 5, borderRadius: 999, opacity: 0.6 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  topTitle: { fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },
  artWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8 },
  art: { width: "100%", aspectRatio: 1, maxWidth: 360, alignItems: "center", justifyContent: "center" },
  haloWrap: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  halo: { width: "66%", aspectRatio: 1, borderRadius: 999, borderWidth: 2 },
  viz: { position: "absolute", bottom: 18, left: 0, right: 0, opacity: 0.9 },
  meta: { alignItems: "center", paddingHorizontal: 24, marginTop: 6, gap: 4 },
  trackTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  artist: { fontSize: 14, textAlign: "center" },
  seek: { paddingHorizontal: 20, marginTop: 14 },
  controls: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 16, marginTop: 18 },
  playBtn: { width: 72, height: 72, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: "auto", paddingBottom: 18, paddingTop: 12 },
  bottomBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 16 },
  bottomLabel: { fontSize: 14, fontWeight: "600" },
})
