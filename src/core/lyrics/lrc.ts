import type { LyricLine } from "@/types/models"

const TIME_TAG = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g

/** Parse an .lrc lyrics string into time-sorted lines. Supports multiple tags per line. */
export function parseLrc(content: string): LyricLine[] {
  const lines: LyricLine[] = []
  for (const raw of content.split(/\r?\n/)) {
    TIME_TAG.lastIndex = 0
    const text = raw.replace(TIME_TAG, "").trim()
    let match: RegExpExecArray | null
    const stamps: number[] = []
    while ((match = TIME_TAG.exec(raw)) !== null) {
      const min = parseInt(match[1] ?? "0", 10)
      const sec = parseInt(match[2] ?? "0", 10)
      const fracRaw = match[3] ?? "0"
      const frac = parseInt(fracRaw.padEnd(3, "0").slice(0, 3), 10)
      stamps.push(min * 60000 + sec * 1000 + frac)
    }
    for (const timeMs of stamps) {
      if (text.length > 0) lines.push({ timeMs, text })
    }
  }
  return lines.sort((a, b) => a.timeMs - b.timeMs)
}

/** Index of the active lyric line for a given playback position. */
export function activeLineIndex(lines: LyricLine[], positionMs: number): number {
  if (lines.length === 0) return -1
  let lo = 0
  let hi = lines.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if ((lines[mid] as LyricLine).timeMs <= positionMs) {
      ans = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return ans
}
