import React, { useEffect } from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useTheme } from "@/theme"

/** Visual height of the floating dock (excludes the safe-area gap below it). */
export const DOCK_HEIGHT = 60
export const DOCK_GAP = 10

type IconPair = { on: string; off: string }

const ICONS: Record<string, IconPair> = {
  browse: { on: "albums", off: "albums-outline" },
  library: { on: "library", off: "library-outline" },
  playlists: { on: "list", off: "list-outline" },
  shuffle: { on: "shuffle", off: "shuffle-outline" },
  settings: { on: "settings", off: "settings-outline" },
}

const LABELS: Record<string, string> = {
  browse: "Browse",
  library: "Library",
  playlists: "Playlists",
  shuffle: "Shuffle",
  settings: "Settings",
}

type TabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string }> }
  navigation: {
    emit: (e: {
      type: string
      target: string
      canPreventDefault: boolean
    }) => { defaultPrevented: boolean }
    navigate: (name: string) => void
  }
}

const SPRING = { damping: 14, stiffness: 190, mass: 0.7 }

function TabItem({
  focused,
  routeName,
  active,
  inactive,
  onPress,
}: {
  focused: boolean
  routeName: string
  active: string
  inactive: string
  onPress: () => void
}) {
  const p = useSharedValue(focused ? 1 : 0)
  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, SPRING)
  }, [focused, p])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(p.value, [0, 1], [1, 1.18]) },
      { translateY: interpolate(p.value, [0, 1], [0, -2]) },
    ],
  }))
  const pillStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scaleX: interpolate(p.value, [0, 1], [0.5, 1]) }],
  }))
  const dotStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scale: interpolate(p.value, [0, 1], [0, 1]) }],
  }))

  const pair = ICONS[routeName] ?? { on: "ellipse", off: "ellipse-outline" }
  const iconName = focused ? pair.on : pair.off
  const pillColor = active + "22"

  return (
    <Pressable style={styles.item} onPress={onPress} hitSlop={6}>
      <Animated.View
        style={[styles.pill, pillStyle, { backgroundColor: pillColor }]}
        pointerEvents="none"
      />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={iconName as never}
          size={23}
          color={focused ? active : inactive}
        />
      </Animated.View>
      <Animated.View
        style={[styles.dot, dotStyle, { backgroundColor: active }]}
        pointerEvents="none"
      />
    </Pressable>
  )
}

/** Floating frosted-glass navigation dock that always clears the system nav bar. */
export function GlassTabBar({ state, navigation }: TabBarProps) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const active = theme.accent
  const inactive = theme.colors.onSurfaceVariant

  const dockStyle = [
    styles.dock,
    {
      marginBottom: insets.bottom + DOCK_GAP,
      borderColor: theme.glass.border.light,
      backgroundColor:
        theme.mode === "amoled" ? "rgba(10,14,20,0.74)" : "rgba(255,255,255,0.60)",
    },
    theme.elevation.floating,
  ]

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={dockStyle}>
        <BlurView
          intensity={theme.glass.blur.strong}
          tint={theme.mode === "amoled" ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index
            const onPress = () => {
              Haptics.selectionAsync().catch(() => {})
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
            }
            return (
              <TabItem
                key={route.key}
                focused={focused}
                routeName={route.name}
                active={active}
                inactive={inactive}
                onPress={onPress}
              />
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  dock: {
    marginHorizontal: 16,
    height: DOCK_HEIGHT,
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: "hidden",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  pill: {
    position: "absolute",
    top: 9,
    width: 50,
    height: 30,
    borderRadius: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 5,
  },
})
