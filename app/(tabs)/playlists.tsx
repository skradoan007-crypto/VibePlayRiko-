import React, { useState } from "react"
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import Animated, { FadeInDown } from "react-native-reanimated"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassSurface } from "@/components/GlassSurface"
import { PressableScale } from "@/components/PressableScale"
import { useTheme } from "@/theme"
import { usePlaylistStore } from "@/stores/playlistStore"
import { usePlayerStore } from "@/stores/playerStore"
import { resolvePlaylistTracks } from "@/utils/playlistTracks"
import type { Playlist } from "@/types/models"

type DialogState = {
  visible: boolean
  mode: "create" | "rename"
  id?: string
  text: string
}

const closedDialog: DialogState = { visible: false, mode: "create", text: "" }

export default function PlaylistsScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const playlists = usePlaylistStore((s) => s.playlists)
  const createPlaylist = usePlaylistStore((s) => s.create)
  const renamePlaylist = usePlaylistStore((s) => s.rename)
  const removePlaylist = usePlaylistStore((s) => s.remove)
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay)

  const [dialog, setDialog] = useState<DialogState>(closedDialog)

  const onText = theme.colors.onSurface
  const sub = theme.colors.onSurfaceVariant

  const openCreate = () => setDialog({ visible: true, mode: "create", text: "" })
  const openRename = (pl: Playlist) =>
    setDialog({ visible: true, mode: "rename", id: pl.id, text: pl.name })
  const closeDialog = () => setDialog(closedDialog)

  const submitDialog = () => {
    const name = dialog.text.trim()
    if (!name) return
    if (dialog.mode === "create") createPlaylist(name)
    else if (dialog.id) renamePlaylist(dialog.id, name)
    closeDialog()
  }

  const confirmDelete = (pl: Playlist) => {
    Alert.alert("Delete playlist", `Delete \u201c${pl.name}\u201d? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => removePlaylist(pl.id) },
    ])
  }

  const openActions = (pl: Playlist) => {
    Alert.alert(pl.name, undefined, [
      { text: "Rename", onPress: () => openRename(pl) },
      { text: "Delete", style: "destructive", onPress: () => confirmDelete(pl) },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const openDetail = (pl: Playlist) => router.push(`/playlist/${pl.id}`)

  const playPlaylist = async (pl: Playlist) => {
    const tracks = resolvePlaylistTracks(pl.trackIds)
    if (tracks.length === 0) {
      Alert.alert("Empty playlist", "Add some tracks before playing.")
      return
    }
    await setQueueAndPlay(tracks, 0)
    router.push("/now-playing")
  }

  const renderItem = ({ item, index }: { item: Playlist; index: number }) => {
    const count = item.trackIds.length
    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).duration(360)}>
        <PressableScale
          scaleTo={0.97}
          onPress={() => openDetail(item)}
          onLongPress={() => openActions(item)}
        >
          <GlassSurface style={styles.cardPad} radius={theme.radius.lg}>
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.art,
                  { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.md },
                ]}
              >
                <Ionicons name="musical-notes" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.meta}>
                <Text numberOfLines={1} style={[styles.name, { color: onText }]}>
                  {item.name}
                </Text>
                <Text numberOfLines={1} style={[styles.count, { color: sub }]}>
                  {count === 1 ? "1 track" : `${count} tracks`}
                </Text>
              </View>
              <PressableScale
                scaleTo={0.86}
                hitSlop={8}
                style={[styles.playBtn, { backgroundColor: theme.accent }]}
                onPress={() => void playPlaylist(item)}
              >
                <Ionicons name="play" size={20} color={theme.colors.onPrimary} />
              </PressableScale>
              <PressableScale
                scaleTo={0.86}
                hitSlop={8}
                style={styles.moreBtn}
                onPress={() => openActions(item)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={sub} />
              </PressableScale>
            </View>
          </GlassSurface>
        </PressableScale>
      </Animated.View>
    )
  }

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.flex1}>
            <Text style={[styles.title, { color: onText }]}>Playlists</Text>
            <Text style={[styles.subtitle, { color: sub }]}>
              {playlists.length === 1 ? "1 playlist" : `${playlists.length} playlists`}
            </Text>
          </View>
          <PressableScale
            scaleTo={0.9}
            style={[styles.newBtn, { backgroundColor: theme.accent }]}
            onPress={openCreate}
          >
            <Ionicons name="add" size={22} color={theme.colors.onPrimary} />
            <Text style={[styles.newLabel, { color: theme.colors.onPrimary }]}>New</Text>
          </PressableScale>
        </View>

        <FlatList
          data={playlists}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="albums-outline" size={48} color={sub} />
              <Text style={[styles.emptyTitle, { color: onText }]}>No playlists yet</Text>
              <Text style={[styles.emptyText, { color: sub }]}>
                Tap "New" to create your first playlist, then add tracks from your library.
              </Text>
            </View>
          }
        />
      </SafeAreaView>

      <Modal visible={dialog.visible} transparent animationType="fade" onRequestClose={closeDialog}>
        <Pressable style={styles.backdrop} onPress={closeDialog}>
          <Pressable style={styles.dialogWrap} onPress={() => {}}>
            <GlassSurface style={styles.dialogPad} radius={theme.radius.lg}>
              <View style={styles.dialogInner}>
                <Text style={[styles.dialogTitle, { color: onText }]}>
                  {dialog.mode === "create" ? "New playlist" : "Rename playlist"}
                </Text>
                <TextInput
                  value={dialog.text}
                  onChangeText={(text) => setDialog((d) => ({ ...d, text }))}
                  placeholder="Playlist name"
                  placeholderTextColor={sub}
                  style={[
                    styles.input,
                    {
                      color: onText,
                      borderColor: theme.glass.border.light,
                      backgroundColor: theme.glass.fill.faint,
                    },
                  ]}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={submitDialog}
                />
                <View style={styles.dialogActions}>
                  <PressableScale scaleTo={0.92} style={styles.dialogBtn} onPress={closeDialog}>
                    <Text style={[styles.dialogBtnText, { color: sub }]}>Cancel</Text>
                  </PressableScale>
                  <PressableScale
                    scaleTo={0.92}
                    style={[styles.dialogBtn, { backgroundColor: theme.accent }]}
                    onPress={submitDialog}
                  >
                    <Text style={[styles.dialogBtnText, { color: theme.colors.onPrimary }]}>
                      {dialog.mode === "create" ? "Create" : "Save"}
                    </Text>
                  </PressableScale>
                </View>
              </View>
            </GlassSurface>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  flex1: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: 0.2 },
  subtitle: { fontSize: 13, marginTop: 2 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  newLabel: { fontSize: 15, fontWeight: "700" },
  listContent: { paddingHorizontal: 16, paddingBottom: 160, gap: 12 },
  cardPad: { padding: 12 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  art: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  meta: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700" },
  count: { fontSize: 12, marginTop: 3 },
  playBtn: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  moreBtn: { width: 30, height: 40, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 90, paddingHorizontal: 40, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  dialogWrap: { width: "100%", maxWidth: 380 },
  dialogPad: { padding: 18 },
  dialogInner: { gap: 14 },
  dialogTitle: { fontSize: 17, fontWeight: "700" },
  input: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  dialogBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  dialogBtnText: { fontSize: 15, fontWeight: "700" },
})
