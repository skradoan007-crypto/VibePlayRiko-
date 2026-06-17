import React from "react"
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Slider from "@react-native-community/slider"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassSurface } from "@/components/GlassSurface"
import { PressableScale } from "@/components/PressableScale"
import { useTheme } from "@/theme"
import { useModifyStore } from "@/stores/modifyStore"
import { EQ_FREQUENCIES, NATIVE_FX_AVAILABLE } from "@/features/modify/dsp"
import { BUILT_IN_PRESETS } from "@/features/modify/presets"

function switchTrack(accent: string) {
  return { false: "#9AA3B2", true: accent }
}

type LabeledProps = {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
  accent: string
  track: string
  color: string
  live?: boolean
}

function LabeledSlider(props: LabeledProps) {
  const badgeBg = props.accent + "26"
  return (
    <View style={styles.labeledRow}>
      <View style={styles.labeledHead}>
        <View style={styles.labelWithBadge}>
          <Text style={[styles.bandLabel, { color: props.color }]}>{props.label}</Text>
          {props.live ? (
            <View style={[styles.liveBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.liveText, { color: props.accent }]}>LIVE</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.bandValue, { color: props.color }]}>
          {`${props.value.toFixed(2)}${props.suffix}`}
        </Text>
      </View>
      <Slider
        style={styles.fullSlider}
        minimumValue={props.min}
        maximumValue={props.max}
        value={props.value}
        minimumTrackTintColor={props.accent}
        maximumTrackTintColor={props.track}
        thumbTintColor={props.accent}
        onValueChange={props.onChange}
      />
    </View>
  )
}

export default function ModifyScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const dsp = useModifyStore((s) => s.dsp)
  const enabled = useModifyStore((s) => s.enabled)
  const setEnabled = useModifyStore((s) => s.setEnabled)
  const setBand = useModifyStore((s) => s.setBand)
  const setField = useModifyStore((s) => s.setField)
  const applyPreset = useModifyStore((s) => s.applyPreset)
  const reset = useModifyStore((s) => s.reset)

  const sub = theme.colors.onSurfaceVariant
  const track = theme.colors.outlineVariant
  const onText = theme.colors.onSurface
  const freqLabel = (hz: number) => (hz >= 1000 ? `${hz / 1000}k` : `${hz}`)
  const goBack = () => router.back()

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill}>
        <View style={styles.topbar}>
          <PressableScale hitSlop={12} scaleTo={0.85} onPress={goBack}>
            <Ionicons name="chevron-down" size={28} color={onText} />
          </PressableScale>
          <Text style={[styles.title, { color: onText }]}>Modification Lab</Text>
          <PressableScale hitSlop={12} scaleTo={0.85} onPress={reset}>
            <Ionicons name="refresh" size={22} color={onText} />
          </PressableScale>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(380)}>
            <GlassSurface style={styles.card} radius={theme.radius.lg}>
              <View style={styles.rowBetween}>
                <View style={styles.flex1}>
                  <Text style={[styles.cardTitle, { color: onText }]}>Audio effects</Text>
                  <Text style={[styles.cardSub, { color: sub }]}>Master enable for live DSP</Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={setEnabled}
                  trackColor={switchTrack(theme.accent)}
                  thumbColor="#FFFFFF"
                />
              </View>
            </GlassSurface>
          </Animated.View>

          {!NATIVE_FX_AVAILABLE ? (
            <Animated.View entering={FadeInDown.delay(60).duration(380)}>
              <View style={[styles.notice, { backgroundColor: theme.glass.fill.faint, borderColor: theme.glass.border.light }]}>
                <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
                <Text style={[styles.noticeText, { color: sub }]}>
                  Speed, Pitch and Pre-amp are fully active right now. The 10-band EQ, bass, treble and reverb are
                  saved to your profile and switch on automatically once the native audio-effects engine is enabled.
                </Text>
              </View>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(120).duration(380)}>
            <Text style={[styles.section, { color: sub }]}>Playback \u00b7 live</Text>
            <GlassSurface style={styles.card} radius={theme.radius.lg}>
              <LabeledSlider
                label="Speed"
                value={dsp.speed}
                min={0.5}
                max={2}
                suffix="x"
                onChange={(v) => setField("speed", v)}
                accent={theme.accent}
                track={track}
                color={onText}
                live
              />
              <LabeledSlider
                label="Pitch"
                value={dsp.pitch}
                min={0.5}
                max={2}
                suffix="x"
                onChange={(v) => setField("pitch", v)}
                accent={theme.colors.accentViolet}
                track={track}
                color={onText}
                live
              />
              <LabeledSlider
                label="Pre-amp"
                value={dsp.preamp}
                min={0}
                max={1}
                suffix=""
                onChange={(v) => setField("preamp", v)}
                accent={theme.colors.accentMint}
                track={track}
                color={onText}
                live
              />
            </GlassSurface>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(380)}>
            <Text style={[styles.section, { color: sub }]}>Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
              {BUILT_IN_PRESETS.map((p) => (
                <PressableScale key={p.id} scaleTo={0.9} onPress={() => applyPreset(p)}>
                  <View style={[styles.chip, { borderColor: theme.glass.border.light, backgroundColor: theme.glass.fill.faint }]}>
                    <Text style={[styles.chipText, { color: onText }]}>{p.name}</Text>
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(380)}>
            <Text style={[styles.section, { color: sub }]}>10-band equalizer</Text>
            <GlassSurface style={styles.card} radius={theme.radius.lg}>
              {EQ_FREQUENCIES.map((hz, i) => (
                <LabeledSlider
                  key={hz}
                  label={`${freqLabel(hz)} Hz`}
                  value={dsp.bands[i]}
                  min={-12}
                  max={12}
                  suffix=" dB"
                  onChange={(v) => setBand(i, v)}
                  accent={theme.accent}
                  track={track}
                  color={onText}
                />
              ))}
            </GlassSurface>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(380)}>
            <Text style={[styles.section, { color: sub }]}>Enhancers</Text>
            <GlassSurface style={styles.card} radius={theme.radius.lg}>
              <LabeledSlider label="Bass boost" value={dsp.bassBoost} min={0} max={1} suffix="" onChange={(v) => setField("bassBoost", v)} accent={theme.colors.accentPink} track={track} color={onText} />
              <LabeledSlider label="Treble boost" value={dsp.trebleBoost} min={0} max={1} suffix="" onChange={(v) => setField("trebleBoost", v)} accent={theme.colors.accentCyan} track={track} color={onText} />
              <LabeledSlider label="Vocal enhancer" value={dsp.vocal} min={0} max={1} suffix="" onChange={(v) => setField("vocal", v)} accent={theme.colors.accentAmber} track={track} color={onText} />
              <LabeledSlider label="Reverb" value={dsp.reverb} min={0} max={1} suffix="" onChange={(v) => setField("reverb", v)} accent={theme.colors.accentViolet} track={track} color={onText} />
              <LabeledSlider label="Echo" value={dsp.echo} min={0} max={1} suffix="" onChange={(v) => setField("echo", v)} accent={theme.colors.accentMint} track={track} color={onText} />
              <LabeledSlider label="Stereo width" value={dsp.stereoWidth} min={0} max={1} suffix="" onChange={(v) => setField("stereoWidth", v)} accent={theme.accent} track={track} color={onText} />
            </GlassSurface>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingBottom: 210, gap: 14 },
  card: { padding: 16, gap: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex1: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: 2 },
  section: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginLeft: 4, letterSpacing: 0.4 },
  notice: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth * 2, alignItems: "flex-start" },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  labeledRow: { gap: 4 },
  labeledHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  labelWithBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  bandLabel: { fontSize: 13, fontWeight: "600" },
  bandValue: { fontSize: 12, fontWeight: "600" },
  liveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  fullSlider: { width: "100%", height: 34 },
  presetRow: { gap: 8, paddingVertical: 2, paddingRight: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth * 2 },
  chipText: { fontSize: 13, fontWeight: "600" },
})
