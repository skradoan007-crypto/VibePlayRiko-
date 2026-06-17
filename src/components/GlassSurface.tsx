import React from "react"
import { StyleSheet, View, ViewProps, Platform } from "react-native"
import { BlurView } from "expo-blur"
import { useTheme } from "@/theme"

type Props = ViewProps & {
  intensity?: number
  radius?: number
  glow?: boolean
}

/**
 * Frosted translucent glass panel — the core Light Neon Glass primitive.
 * Soft white fill, thin glowing border, ambient soft shadow.
 */
export function GlassSurface({
  children,
  style,
  intensity,
  radius: radiusProp,
  glow = true,
  ...rest
}: Props) {
  const { theme } = useTheme()
  const r = radiusProp ?? theme.radius.lg
  const blurAmount = intensity ?? theme.glass.blur.base
  const tint = theme.mode === "amoled" ? "dark" : "light"

  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius: r },
        glow && theme.elevation.soft,
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={blurAmount}
        tint={tint}
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: r,
            backgroundColor:
              theme.mode === "amoled" ? "rgba(20,26,36,0.55)" : theme.glass.fill.mid,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.glass.border.light,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    backgroundColor: "transparent",
  },
  content: {
    overflow: "hidden",
  },
})
