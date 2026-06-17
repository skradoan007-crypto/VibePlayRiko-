import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from "expo-av"
import type { Track } from "@/types/models"

export type EngineStatus = {
  positionMs: number
  durationMs: number
  isPlaying: boolean
  isBuffering: boolean
  didJustFinish: boolean
}

type StatusListener = (s: EngineStatus) => void

/**
 * Single source of truth for native audio. UI never touches expo-av directly —
 * it talks to playerStore, which drives this engine. Built on expo-av Audio.Sound
 * with our own queue logic living in the store.
 */
class AudioEngineImpl {
  private sound: Audio.Sound | null = null
  private listener: StatusListener | null = null
  private rate = 1
  private shouldCorrectPitch = true
  private volume = 1
  private configured = false

  async configure(): Promise<void> {
    if (this.configured) return
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    })
    this.configured = true
  }

  setStatusListener(l: StatusListener | null): void {
    this.listener = l
  }

  private handleStatus = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) {
      if ("error" in status && status.error) {
        // surface a stalled state
        this.listener?.({
          positionMs: 0,
          durationMs: 0,
          isPlaying: false,
          isBuffering: false,
          didJustFinish: false,
        })
      }
      return
    }
    const s = status as AVPlaybackStatusSuccess
    this.listener?.({
      positionMs: s.positionMillis ?? 0,
      durationMs: s.durationMillis ?? 0,
      isPlaying: s.isPlaying,
      isBuffering: s.isBuffering ?? false,
      didJustFinish: s.didJustFinish ?? false,
    })
  }

  async load(track: Track, autoPlay = true): Promise<void> {
    await this.configure()
    await this.unload()
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.uri },
      {
        shouldPlay: autoPlay,
        rate: this.rate,
        shouldCorrectPitch: this.shouldCorrectPitch,
        volume: this.volume,
        progressUpdateIntervalMillis: 400,
      },
      this.handleStatus,
    )
    this.sound = sound
  }

  async play(): Promise<void> {
    await this.sound?.playAsync()
  }

  async pause(): Promise<void> {
    await this.sound?.pauseAsync()
  }

  async seekTo(ms: number): Promise<void> {
    await this.sound?.setPositionAsync(Math.max(0, ms))
  }

  /** Speed/tempo control. With shouldCorrectPitch=true this is tempo; false changes pitch too. */
  async setRate(rate: number, correctPitch = true): Promise<void> {
    this.rate = rate
    this.shouldCorrectPitch = correctPitch
    await this.sound?.setRateAsync(rate, correctPitch)
  }

  async setVolume(v: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, v))
    await this.sound?.setVolumeAsync(this.volume)
  }

  async unload(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync()
      } catch {
        // ignore
      }
      this.sound = null
    }
  }
}

export const AudioEngine = new AudioEngineImpl()
