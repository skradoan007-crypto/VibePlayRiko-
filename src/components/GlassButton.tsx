import React from "react"
import { Pressable, PressableProps, StyleSheet, Text, View } from "react-native"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useTheme } from "@/theme"

const AView = Animated.createAnimatedComponent(View)

type Props = PressableProps & {
  label?: string
  icon?: React.ReactNode
  variant?: "primary" | "glass"
}

/**
 * Rounded, floating soft-glass button with thin glowing edge,
 * spring touch animation and premium haptic feedback.
 */
export function GlassButton({ label, icon, variant = "glass", onPressIn, onPressOut, ...rest }: Props) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const isPrimary = variant === "primary"

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withSpring(0.95, theme.motion.spring)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, theme.motion.spring)
        onPressOut?.(e)
      }}
      {...rest}
    >
      <AView
        style={[
          animatedStyle,
          styles.base,
          { borderRadius: theme.radius.pill, borderColor: theme.glass.border.light },
          theme.elevation.floating,
          isPrimary && { backgroundColor: theme.accent },
        ]}
      >
        {!isPrimary && (
          <BlurView
            intensity={theme.glass.blur.base}
            tint={theme.mode === "amoled" ? "dark" : "light"}
            style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.pill }]}
          />
        )}
        {!isPrimary && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: theme.radius.pill, backgroundColor: theme.glass.fill.light },
            ]}
          />
        )}
        <View style={styles.row}>
          {icon}
          {label ? (
            <Text
              style={[
                styles.label,
                { color: isPrimary ? theme.colors.onPrimary : theme.colors.primary },
              ]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </AView>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 16, fontWeight: "600", letterSpacing: 0.2 },
})
