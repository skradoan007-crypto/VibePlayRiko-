import React from "react"
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native"
import * as Haptics from "expo-haptics"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

const SPRING = { damping: 16, stiffness: 240, mass: 0.7 }

type Props = PressableProps & {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  scaleTo?: number
  haptic?: boolean
}

/**
 * Universal press primitive used across the whole app.
 * Springy scale-down on touch + light haptic — the base of the
 * "Android 17" tactile feel (tap feedback everywhere).
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.94,
  haptic = true,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, SPRING)
        if (haptic) Haptics.selectionAsync().catch(() => {})
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING)
        onPressOut?.(e)
      }}
      {...rest}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  )
}
