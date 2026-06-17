import React from "react"
import { StyleSheet, View } from "react-native"
import { Tabs } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { GlassTabBar, DOCK_HEIGHT, DOCK_GAP } from "@/components/GlassTabBar"
import { MiniPlayer } from "@/components/MiniPlayer"

const screenOptions = { headerShown: false, animation: "shift" } as const

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const miniBottom = insets.bottom + DOCK_GAP + DOCK_HEIGHT + 8
  const renderTabBar = (props: any) => <GlassTabBar {...props} />
  const miniStyle = [styles.mini, { bottom: miniBottom }]

  return (
    <View style={styles.fill}>
      <Tabs tabBar={renderTabBar} screenOptions={screenOptions}>
        <Tabs.Screen name="browse" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="playlists" />
        <Tabs.Screen name="shuffle" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <View style={miniStyle} pointerEvents="box-none">
        <MiniPlayer />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  mini: { position: "absolute", left: 0, right: 0 },
})
