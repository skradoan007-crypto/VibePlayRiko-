import type { Track } from "@/types/models"
import { shuffleArray, weightedPick } from "@/utils/sort"
import { decadeOf } from "@/utils/format"

export type ShuffleContext = {
  now?: number // epoch ms, for time-based
  recentIds?: string[] // recently played, for no-repeat / hidden gems
}

export type ShuffleStrategy = {
  id: string
  name: string
  description: string
  run: (tracks: Track[], ctx?: ShuffleContext) => Track[]
}

const hoursOf = (ms: number) => new Date(ms).getHours()

/** Group helper. */
function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const it of items) {
    const k = key(it)
    const arr = m.get(k) ?? []
    arr.push(it)
    m.set(k, arr)
  }
  return m
}

/** Round-robin interleave of grouped arrays. */
function interleave<T>(groups: T[][]): T[] {
  const out: T[] = []
  const queues = groups.map((g) => [...g])
  let remaining = queues.reduce((s, q) => s + q.length, 0)
  while (remaining > 0) {
    for (const q of queues) {
      const next = q.shift()
      if (next) {
        out.push(next)
        remaining--
      }
    }
  }
  return out
}

export const STRATEGIES: ShuffleStrategy[] = [
  {
    id: "true-random",
    name: "True Random",
    description: "Pure unbiased Fisher\u2013Yates shuffle.",
    run: (tracks) => shuffleArray(tracks),
  },
  {
    id: "smart",
    name: "Smart Shuffle",
    description: "Balances favorites, freshness and low play counts.",
    run: (tracks) => {
      const now = Date.now()
      const weights = tracks.map((t) => {
        const favBoost = t.isFavorite ? 1.6 : 1
        const playPenalty = 1 / (1 + t.playCount)
        const recencyBoost = t.lastPlayedMs ? Math.min(1, (now - t.lastPlayedMs) / 6.048e8) : 1
        return favBoost * playPenalty * (0.5 + recencyBoost)
      })
      return weightedOrder(tracks, weights)
    },
  },
  {
    id: "weighted",
    name: "Weighted Shuffle",
    description: "Less-played tracks surface more often.",
    run: (tracks) => weightedOrder(tracks, tracks.map((t) => 1 / (1 + t.playCount))),
  },
  {
    id: "least-played",
    name: "Least Played",
    description: "Lowest play counts first, randomised within ties.",
    run: (tracks) =>
      [...tracks].sort((a, b) => a.playCount - b.playCount || Math.random() - 0.5),
  },
  {
    id: "hidden-gems",
    name: "Hidden Gems",
    description: "Rarely-played tracks you haven't heard recently.",
    run: (tracks, ctx) => {
      const recent = new Set(ctx?.recentIds ?? [])
      const gems = tracks.filter((t) => t.playCount <= 2 && !recent.has(t.id))
      return shuffleArray(gems.length > 0 ? gems : tracks)
    },
  },
  {
    id: "no-repeat",
    name: "No Repeat",
    description: "Random order avoiding recently played tracks up front.",
    run: (tracks, ctx) => {
      const recent = new Set(ctx?.recentIds ?? [])
      const fresh = shuffleArray(tracks.filter((t) => !recent.has(t.id)))
      const rest = shuffleArray(tracks.filter((t) => recent.has(t.id)))
      return [...fresh, ...rest]
    },
  },
  {
    id: "mood",
    name: "Mood Shuffle",
    description: "Groups by mood tag (falls back to genre).",
    run: (tracks) => interleave([...groupBy(tracks, (t) => t.mood ?? t.genre ?? "\u2014").values()]),
  },
  {
    id: "genre",
    name: "Genre Shuffle",
    description: "Even rotation across genres.",
    run: (tracks) =>
      interleave([...groupBy(tracks, (t) => t.genre ?? "Unknown").values()].map(shuffleArray)),
  },
  {
    id: "artist-rotation",
    name: "Artist Rotation",
    description: "Cycles through artists so no one dominates.",
    run: (tracks) =>
      interleave([...groupBy(tracks, (t) => t.artist).values()].map(shuffleArray)),
  },
  {
    id: "year-decade",
    name: "Year / Decade",
    description: "Rotates evenly across decades.",
    run: (tracks) =>
      interleave([...groupBy(tracks, (t) => decadeOf(t.year)).values()].map(shuffleArray)),
  },
  {
    id: "recently-added",
    name: "Recently Added",
    description: "Newer additions weighted higher.",
    run: (tracks) => {
      const now = Date.now()
      return weightedOrder(
        tracks,
        tracks.map((t) => 1 / (1 + (now - t.dateAddedMs) / 8.64e7)),
      )
    },
  },
  {
    id: "time-based",
    name: "Time-Based",
    description: "Adapts to the time of day (calmer mornings, livelier nights).",
    run: (tracks, ctx) => {
      const hour = hoursOf(ctx?.now ?? Date.now())
      const lively = hour >= 17 || hour < 3
      const energetic = new Set(["dance", "pop", "electronic", "hip hop", "rock"])
      const scored = tracks.map((t) => {
        const g = (t.genre ?? "").toLowerCase()
        const isEnergetic = [...energetic].some((e) => g.includes(e))
        const weight = lively ? (isEnergetic ? 1.8 : 0.8) : isEnergetic ? 0.8 : 1.8
        return weight
      })
      return weightedOrder(tracks, scored)
    },
  },
]

/** Produce a full ordering by repeatedly weighted-picking without replacement. */
function weightedOrder(tracks: Track[], weights: number[]): Track[] {
  const pool = tracks.map((t, i) => ({ t, w: weights[i] ?? 1 }))
  const out: Track[] = []
  while (pool.length > 0) {
    const picked = weightedPick(
      pool.map((p) => p.t),
      pool.map((p) => p.w),
    )
    const idx = pool.findIndex((p) => p.t === picked)
    if (idx === -1) break
    out.push(pool[idx]!.t)
    pool.splice(idx, 1)
  }
  return out
}

export const STRATEGY_MAP: Record<string, ShuffleStrategy> = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s]),
)

export function applyStrategy(
  id: string,
  tracks: Track[],
  ctx?: ShuffleContext,
): Track[] {
  const strat = STRATEGY_MAP[id]
  return strat ? strat.run(tracks, ctx) : shuffleArray(tracks)
}
