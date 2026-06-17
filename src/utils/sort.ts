import type { SortDir, SortKey, Track } from "@/types/models"

export function sortTracks(tracks: Track[], key: SortKey, dir: SortDir = "asc"): Track[] {
  const factor = dir === "asc" ? 1 : -1
  const copy = [...tracks]
  copy.sort((a, b) => {
    let cmp = 0
    switch (key) {
      case "name":
        cmp = a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
        break
      case "date":
        cmp = a.dateAddedMs - b.dateAddedMs
        break
      case "size":
        cmp = a.sizeBytes - b.sizeBytes
        break
      case "duration":
        cmp = a.durationMs - b.durationMs
        break
    }
    if (cmp === 0) cmp = a.title.localeCompare(b.title)
    return cmp * factor
  })
  return copy
}

/** Fisher-Yates shuffle (pure). */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

export function weightedPick<T>(items: T[], weights: number[]): T | undefined {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0)
  if (total <= 0) return items[Math.floor(Math.random() * items.length)]
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= Math.max(0, weights[i] ?? 0)
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}
