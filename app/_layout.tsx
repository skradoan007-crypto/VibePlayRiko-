import "react-native-gesture-handler"
import React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { Stack } from "expo-router"
import { ThemeProvider } from "@/theme"

const rootStyle = { flex: 1 }

const screenOptions = {
  headerShown: false,
  animation: "fade",
  contentStyle: { backgroundColor: "transparent" },
} as const

// Now Playing & Modification Lab slide up from the bottom like native sheets.
const sheetOptions = {
  animation: "slide_from_bottom",
  gestureEnabled: false,
} as const

/**
 * Root navigation + providers for VibePlay – Riko.
 * The cinematic loader gate lives in app/index.tsx.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={rootStyle}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="playlist/[id]" />
            <Stack.Screen name="now-playing" options={sheetOptions} />
            <Stack.Screen name="modify" options={sheetOptions} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
