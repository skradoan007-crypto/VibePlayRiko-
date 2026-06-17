import React, { useMemo, useState } from "react"
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
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AmbientBackground } from "@/components/AmbientBackground"
import { GlassSurface } from "@/components/GlassSurface"
import { GlassButton } from "@/components/GlassButton"
import { PressableScale } from "@/components/PressableScale"
import { TrackRow } from "@/components/TrackRow"
import { useTheme } from "@/theme"
import { usePlaylistStore } from "@/stores/playlistStore"
import { usePlayerStore } from "@/stores/playerStore"
import { useLibraryStore } from "@/stores/libraryStore"
import { msToClock } from "@/utils/format"
import type { Track } from "@/types/models"

export default function PlaylistDetailScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const playlist = usePlaylistStore((s) => s.playlists.find((p) => p.id === id))
  const renamePlaylist = usePlaylistStore((s) => s.rename)
  const removePlaylist = usePlaylistStore((s) => s.remove)
  const addTracks = usePlaylistStore((s) => s.addTracks)
  const removeTrack = usePlaylistStore((s) => s.removeTrack)

  const libTracks = useLibraryStore((s) => s.tracks)
  const enrich = useLibraryStore((s) => s.enrich)
  const setQueueAndPlay = usePlayerStore((s) => s.setQueueAndPlay)
  const applyShuffleOrder = usePlayerStore((s) => s.applyShuffleOrder)
  const currentId = usePlayerStore((s) =>
    s.currentIndex >= 0 ? s.queue[s.currentIndex]?.id : undefined,
  )

  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState(false)
  const [renameText, setRenameText] = useState("")

  const onText = theme.colors.onSurface
  const sub = theme.colors.onSurfaceVariant

  const tracks = useMemo<Track[]>(() => {
    if (!playlist) return []
    const byId = new Map(libTracks.map((t) => [t.id, t]))
    const out: Track[] = []
    for (const tid of playlist.trackIds) {
      const t = byId.get(tid)
      if (t) out.push(enrich(t))
    }
    return out
  }, [playlist, libTracks, enrich])

  const totalMs = useMemo(
    () => tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0),
    [tracks],
  )

  const goBack = () => router.back()

  if (!playlist) {
    return (
      <View style={styles.fill}>
        <AmbientBackground />
        <SafeAreaView style={styles.center}>
          <Text style={[styles.missing, { color: sub }]}>Playlist not found</Text>
          <PressableScale haptic={false} onPress={goBack}>
            <Text style={[styles.link, { color: theme.accent }]}>Go back</Text>
          </PressableScale>
        </SafeAreaView>
      </View>
    )
  }

  const pl = playlist

  const playAll = async () => {
    if (tracks.length === 0) return
    await setQueueAndPlay(tracks, 0)
    router.push("/now-playing")
  }

  const shufflePlay = async () => {
    if (tracks.length === 0) return
    const shuffled = [...tracks]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const a = shuffled[i]!
      const b = shuffled[j]!
      shuffled[i] = b
      shuffled[j] = a
    }
    await applyShuffleOrder(shuffled)
    router.push("/now-playing")
  }

  const playFrom = async (index: number) => {
    await setQueueAndPlay(tracks, index)
    router.push("/now-playing")
  }

  const confirmRemoveTrack = (track: Track) => {
    Alert.alert("Remove track", `Remove \u201c${track.title}\u201d from this playlist?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeTrack(pl.id, track.id) },
    ])
  }

  const submitRename = () => {
    const name = renameText.trim()
    if (name) renamePlaylist(pl.id, name)
    setRenaming(false)
  }

  const promptRename = () => {
    setRenameText(pl.name)
    setRenaming(true)
  }

  const openOptions = () => {
    Alert.alert(pl.name, undefined, [
      { text: "Rename", onPress: promptRename },
      {
        text: "Delete playlist",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete playlist", `Delete \u201c${pl.name}\u201d?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                removePlaylist(pl.id)
                goBack()
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const openAdd = () => {
    setSelected(new Set())
    setSearch("")
    setAdding(true)
  }

  const toggleSelect = (tid: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tid)) next.delete(tid)
      else next.add(tid)
      return next
    })

  const confirmAdd = () => {
    if (selected.size > 0) addTracks(pl.id, [...selected])
    setAdding(false)
  }

  const inPlaylist = new Set(pl.trackIds)
  const query = search.trim().toLowerCase()
  const candidates = libTracks.filter((t) => {
    if (inPlaylist.has(t.id)) return false
    if (!query) return true
    return (
      t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)
    )
  })

  const count = pl.trackIds.length

  const Header = (
    <View style={styles.hero}>
      <GlassSurface style={styles.heroArtPad} radius={theme.radius.xl}>
        <View style={styles.heroArt}>
          <Ionicons name="musical-notes" size={64} color={theme.accent} />
        </View>
      </GlassSurface>
      <Text numberOfLines={2} style={[styles.heroTitle, { color: onText }]}>
        {pl.name}
      </Text>
      <Text style={[styles.heroStats, { color: sub }]}>
        {(count === 1 ? "1 track" : `${count} tracks`) +
          (totalMs > 0 ? `  \u00b7  ${msToClock(totalMs)}` : "")}
      </Text>
      <View style={styles.heroButtons}>
        <GlassButton
          label="Play all"
          variant="primary"
          icon={<Ionicons name="play" size={18} color={theme.colors.onPrimary} />}
          disabled={tracks.length === 0}
          onPress={() => void playAll()}
        />
        <GlassButton
          label="Shuffle"
          variant="glass"
          icon={<Ionicons name="shuffle" size={18} color={theme.colors.primary} />}
          disabled={tracks.length === 0}
          onPress={() => void shufflePlay()}
        />
      </View>
      <PressableScale
        scaleTo={0.95}
        style={[
          styles.addBtn,
          { borderColor: theme.glass.border.light, backgroundColor: theme.glass.fill.faint },
        ]}
        onPress={openAdd}
      >
        <Ionicons name="add" size={20} color={theme.accent} />
        <Text style={[styles.addLabel, { color: onText }]}>Add tracks</Text>
      </PressableScale>
      {tracks.length > 0 ? (
        <Text style={[styles.hint, { color: sub }]}>Long-press a track to remove it</Text>
      ) : null}
    </View>
  )

  const renderTrack = ({ item, index }: { item: Track; index: number }) => (
    <TrackRow
      track={item}
      active={item.id === currentId}
      onPress={() => void playFrom(index)}
      onLongPress={() => confirmRemoveTrack(item)}
    />
  )

  const renderCandidate = ({ item }: { item: Track }) => {
    const checked = selected.has(item.id)
    return (
      <PressableScale scaleTo={0.98} haptic={false} onPress={() => toggleSelect(item.id)}>
        <View style={styles.candidate}>
          <Ionicons
            name={checked ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={checked ? theme.accent : sub}
          />
          <View style={styles.candidateMeta}>
            <Text numberOfLines={1} style={[styles.candidateTitle, { color: onText }]}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={[styles.candidateSub, { color: sub }]}>
              {item.artist}
              {item.durationMs ? `  \u00b7  ${msToClock(item.durationMs)}` : ""}
            </Text>
          </View>
        </View>
      </PressableScale>
    )
  }

  return (
    <View style={styles.fill}>
      <AmbientBackground />
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.topbar}>
          <PressableScale hitSlop={12} scaleTo={0.85} onPress={goBack}>
            <Ionicons name="chevron-back" size={28} color={onText} />
          </PressableScale>
          <Text numberOfLines={1} style={[styles.topTitle, { color: sub }]}>
            Playlist
          </Text>
          <PressableScale hitSlop={12} scaleTo={0.85} onPress={openOptions}>
            <Ionicons name="ellipsis-horizontal" size={24} color={onText} />
          </PressableScale>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          renderItem={renderTrack}
          ListHeaderComponent={Header}
          ListEmptyComponent={
            <View style={styles.emptyTracks}>
              <Text style={[styles.emptyText, { color: sub }]}>
                No tracks yet. Tap "Add tracks" to build this playlist.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      <Modal
        visible={adding}
        animationType="slide"
        onRequestClose={() => setAdding(false)}
      >
        <View style={styles.fill}>
          <AmbientBackground />
          <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
            <View style={styles.topbar}>
              <PressableScale hitSlop={12} scaleTo={0.85} onPress={() => setAdding(false)}>
                <Ionicons name="close" size={26} color={onText} />
              </PressableScale>
              <Text style={[styles.topTitle, { color: sub }]}>Add tracks</Text>
              <PressableScale hitSlop={12} scaleTo={0.85} onPress={confirmAdd}>
                <Text
                  style={[
                    styles.doneText,
                    { color: selected.size > 0 ? theme.accent : sub },
                  ]}
                >
                  {selected.size > 0 ? `Add (${selected.size})` : "Add"}
                </Text>
              </PressableScale>
            </View>
            <View
              style={[
                styles.searchWrap,
                { borderColor: theme.glass.border.light, backgroundColor: theme.glass.fill.faint },
              ]}
            >
              <Ionicons name="search" size={18} color={sub} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search your library"
                placeholderTextColor={sub}
                style={[styles.searchInput, { color: onText }]}
              />
            </View>
            <FlatList
              data={candidates}
              keyExtractor={(t) => t.id}
              renderItem={renderCandidate}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.addList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyTracks}>
                  <Text style={[styles.emptyText, { color: sub }]}>
                    {libTracks.length === 0
                      ? "Your library is empty. Scan your music in Settings first."
                      : "No matching tracks to add."}
                  </Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={renaming} transparent animationType="fade" onRequestClose={() => setRenaming(false)}>
        <Pressable style={styles.backdrop} onPress={() => setRenaming(false)}>
          <Pressable style={styles.dialogWrap} onPress={() => {}}>
            <GlassSurface style={styles.dialogPad} radius={theme.radius.lg}>
              <View style={styles.dialogInner}>
                <Text style={[styles.dialogTitle, { color: onText }]}>Rename playlist</Text>
                <TextInput
                  value={renameText}
                  onChangeText={setRenameText}
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
                  onSubmitEditing={submitRename}
                />
                <View style={styles.dialogActions}>
                  <PressableScale scaleTo={0.92} style={styles.dialogBtn} onPress={() => setRenaming(false)}>
                    <Text style={[styles.dialogBtnText, { color: sub }]}>Cancel</Text>
                  </PressableScale>
                  <PressableScale
                    scaleTo={0.92}
                    style={[styles.dialogBtn, { backgroundColor: theme.accent }]}
                    onPress={submitRename}
                  >
                    <Text style={[styles.dialogBtnText, { color: theme.colors.onPrimary }]}>Save</Text>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  missing: { fontSize: 16 },
  link: { fontSize: 15, fontWeight: "700" },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topTitle: { fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },
  doneText: { fontSize: 15, fontWeight: "700" },
  listContent: { paddingHorizontal: 12, paddingBottom: 48 },
  hero: { alignItems: "center", paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14, gap: 12 },
  heroArtPad: { alignSelf: "center" },
  heroArt: { width: 132, height: 132, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  heroStats: { fontSize: 13 },
  heroButtons: { flexDirection: "row", gap: 12, marginTop: 4 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    marginTop: 2,
  },
  addLabel: { fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 12, marginTop: 2 },
  emptyTracks: { alignItems: "center", paddingTop: 30, paddingHorizontal: 30 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  addList: { paddingHorizontal: 16, paddingBottom: 24 },
  candidate: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  candidateMeta: { flex: 1 },
  candidateTitle: { fontSize: 15, fontWeight: "600" },
  candidateSub: { fontSize: 12, marginTop: 2 },
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
