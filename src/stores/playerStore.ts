import { create } from "zustand"
import type { RepeatMode, Track } from "@/types/models"
import { AudioEngine } from "@/core/audio/AudioEngine"
import { applyStrategy, type ShuffleContext } from "@/features/shuffle"
import { useHistoryStore } from "./historyStore"

type PlayerState = {
  baseQueue: Track[] // unshuffled source order
  queue: Track[] // active order (possibly shuffled)
  currentIndex: number
  isPlaying: boolean
  isBuffering: boolean
  positionMs: number
  durationMs: number
  repeat: RepeatMode
  shuffleOn: boolean
  shuffleStrategyId: string
  rate: number
  bootstrapped: boolean

  bootstrap: () => Promise<void>
  current: () => Track | undefined
  setQueueAndPlay: (tracks: Track[], startIndex?: number) => Promise<void>
  playTrackAt: (index: number) => Promise<void>
  toggle: () => Promise<void>
  next: (auto?: boolean) => Promise<void>
  previous: () => Promise<void>
  seekTo: (ms: number) => Promise<void>
  setRepeat: (m: RepeatMode) => void
  cycleRepeat: () => void
  toggleShuffle: () => void
  setShuffleStrategy: (id: string) => void
  applyShuffleOrder: (order: Track[]) => Promise<void>
  addToQueue: (t: Track) => void
  playNextUp: (t: Track) => void
  setRate: (r: number) => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  baseQueue: [],
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  isBuffering: false,
  positionMs: 0,
  durationMs: 0,
  repeat: "off",
  shuffleOn: false,
  shuffleStrategyId: "true-random",
  rate: 1,
  bootstrapped: false,

  bootstrap: async () => {
    if (get().bootstrapped) return
    await AudioEngine.configure()
    AudioEngine.setStatusListener((s) => {
      set({
        positionMs: s.positionMs,
        durationMs: s.durationMs || get().durationMs,
        isPlaying: s.isPlaying,
        isBuffering: s.isBuffering,
      })
      if (s.didJustFinish) void get().next(true)
    })
    set({ bootstrapped: true })
  },

  current: () => {
    const { queue, currentIndex } = get()
    return currentIndex >= 0 ? queue[currentIndex] : undefined
  },

  setQueueAndPlay: async (tracks, startIndex = 0) => {
    if (tracks.length === 0) return
    await get().bootstrap()
    set({ baseQueue: tracks, queue: tracks, currentIndex: -1 })
    await get().playTrackAt(startIndex)
  },

  playTrackAt: async (index) => {
    const { queue } = get()
    const track = queue[index]
    if (!track) return
    set({ currentIndex: index, durationMs: track.durationMs || 0, positionMs: 0 })
    await AudioEngine.load(track, true)
    useHistoryStore.getState().recordPlay(track.id)
  },

  toggle: async () => {
    const { isPlaying, currentIndex } = get()
    if (currentIndex < 0) return
    if (isPlaying) await AudioEngine.pause()
    else await AudioEngine.play()
  },

  next: async (auto = false) => {
    const { queue, currentIndex, repeat } = get()
    if (queue.length === 0) return
    if (auto && repeat === "one") {
      await AudioEngine.seekTo(0)
      await AudioEngine.play()
      return
    }
    let nextIndex = currentIndex + 1
    if (nextIndex >= queue.length) {
      if (repeat === "all" || !auto) nextIndex = 0
      else {
        await AudioEngine.pause()
        return
      }
    }
    await get().playTrackAt(nextIndex)
  },

  previous: async () => {
    const { currentIndex, positionMs, queue } = get()
    if (queue.length === 0) return
    if (positionMs > 4000) {
      await AudioEngine.seekTo(0)
      return
    }
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1
    await get().playTrackAt(prevIndex)
  },

  seekTo: async (ms) => {
    set({ positionMs: ms })
    await AudioEngine.seekTo(ms)
  },

  setRepeat: (repeat) => set({ repeat }),
  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  toggleShuffle: () => {
    const { shuffleOn, baseQueue, shuffleStrategyId, current } = get()
    const playing = current()
    if (shuffleOn) {
      // Restore base order, keep current track
      const idx = playing ? baseQueue.findIndex((t) => t.id === playing.id) : 0
      set({ shuffleOn: false, queue: baseQueue, currentIndex: Math.max(0, idx) })
    } else {
      const ctx: ShuffleContext = {
        now: Date.now(),
        recentIds: useHistoryStore.getState().recentlyPlayed(40),
      }
      let order = applyStrategy(shuffleStrategyId, baseQueue, ctx)
      if (playing) {
        order = [playing, ...order.filter((t) => t.id !== playing.id)]
      }
      set({ shuffleOn: true, queue: order, currentIndex: 0 })
    }
  },

  setShuffleStrategy: (shuffleStrategyId) => set({ shuffleStrategyId }),

  applyShuffleOrder: async (order) => {
    if (order.length === 0) return
    await get().bootstrap()
    set({ baseQueue: order, queue: order, shuffleOn: true, currentIndex: -1 })
    await get().playTrackAt(0)
  },

  addToQueue: (t) => set((s) => ({ queue: [...s.queue, t], baseQueue: [...s.baseQueue, t] })),

  playNextUp: (t) =>
    set((s) => {
      const queue = [...s.queue]
      queue.splice(s.currentIndex + 1, 0, t)
      return { queue }
    }),

  setRate: async (rate) => {
    set({ rate })
    await AudioEngine.setRate(rate, true)
  },
}))
