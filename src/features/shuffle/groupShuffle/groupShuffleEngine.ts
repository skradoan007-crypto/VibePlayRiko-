import type { Track } from "@/types/models"
import { shuffleArray, weightedPick } from "@/utils/sort"
import { decadeOf } from "@/utils/format"
import type { GroupByKey, GroupPlanEntry, GroupShuffleConfig } from "./types"

function groupKey(t: Track, key: GroupByKey): string {
  switch (key) {
    case "artist":
      return t.artist || "Unknown Artist"
    case "album":
      return t.album || "Unknown Album"
    case "genre":
      return t.genre || "Unknown Genre"
    case "folder":
      return t.folderName || "Folder"
    case "year":
      return t.year ? String(t.year) : "Unknown"
    case "decade":
      return decadeOf(t.year)
    case "mood":
      return t.mood || t.genre || "Unknown"
    case "customTag":
      return t.genre || t.album || "Tag"
  }
}

export type GroupShuffleResult = {
  order: Track[]
  plan: GroupPlanEntry[]
  groups: { name: string; size: number; score: number }[]
}

/**
 * Flagship Group Shuffle scheduler.
 * Builds groups by the chosen key, then schedules group order according to the
 * selected mode, honouring min-per-group, max-consecutive, pins, exclusions,
 * underplayed preference and the diversity slider. Emits a human-readable plan.
 */
export function generateGroupShuffle(
  tracks: Track[],
  config: GroupShuffleConfig,
  recentGroupNames: string[] = [],
): GroupShuffleResult {
  const excluded = new Set(config.excludedGroups)
  const recent = new Set(recentGroupNames)

  // Build groups
  const map = new Map<string, Track[]>()
  for (const t of tracks) {
    const k = groupKey(t, config.groupBy)
    if (excluded.has(k)) continue
    const arr = map.get(k) ?? []
    arr.push(t)
    map.set(k, arr)
  }

  let groupNames = [...map.keys()]
  if (config.skipRecentGroups && groupNames.length > recent.size) {
    groupNames = groupNames.filter((g) => !recent.has(g))
  }

  // Group scoring: underplayed preference + pins
  const groupScore = (name: string): number => {
    const items = map.get(name) ?? []
    const avgPlays = items.reduce((s, t) => s + t.playCount, 0) / Math.max(1, items.length)
    let score = config.preferUnderplayed ? 1 / (1 + avgPlays) : 1
    if (config.pinnedGroups.includes(name)) score *= 3
    return score
  }

  // Order groups by mode
  const orderedGroups = orderGroups(groupNames, config, groupScore)

  // Intra-group song ordering
  const songOrderForMode = (name: string): Track[] => {
    const items = map.get(name) ?? []
    const sequential = config.mode === "randomGroups-sequentialSongs"
    return sequential
      ? [...items].sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0) || a.title.localeCompare(b.title))
      : shuffleArray(items)
  }

  // Emit interleaved order honouring minPerGroup + maxConsecutive + diversity
  const order: Track[] = []
  const plan: GroupPlanEntry[] = []
  const cursors = new Map<string, number>()
  const buffers = new Map(orderedGroups.map((g) => [g, songOrderForMode(g)]))
  let lastGroup = ""
  let consecutive = 0
  let remaining = [...buffers.values()].reduce((s, b) => s + b.length, 0)

  // diversity controls how many songs we take per visit before rotating
  const takePerVisit = Math.max(
    config.minPerGroup,
    Math.round(config.maxConsecutive * (1 - config.diversity)) || config.minPerGroup,
  )

  let gi = 0
  let safety = remaining * 4 + 10
  while (remaining > 0 && safety-- > 0) {
    const name = orderedGroups[gi % orderedGroups.length] as string
    gi++
    const buf = buffers.get(name)!
    const cur = cursors.get(name) ?? 0
    if (cur >= buf.length) continue

    const take = Math.min(takePerVisit, buf.length - cur)
    for (let k = 0; k < take; k++) {
      const track = buf[cur + k]!
      if (name === lastGroup && consecutive >= config.maxConsecutive) break
      order.push(track)
      remaining--
      if (name === lastGroup) consecutive++
      else {
        consecutive = 1
        lastGroup = name
      }
      cursors.set(name, (cursors.get(name) ?? 0) + 1)
      plan.push({
        group: name,
        reason: reasonFor(name, config, groupScore(name)),
      })
    }
  }

  return {
    order,
    plan,
    groups: orderedGroups.map((g) => ({
      name: g,
      size: (map.get(g) ?? []).length,
      score: Number(groupScore(g).toFixed(3)),
    })),
  }
}

function orderGroups(
  names: string[],
  config: GroupShuffleConfig,
  score: (n: string) => number,
): string[] {
  const pinnedFirst = (arr: string[]) => [
    ...arr.filter((n) => config.pinnedGroups.includes(n)),
    ...arr.filter((n) => !config.pinnedGroups.includes(n)),
  ]
  switch (config.mode) {
    case "sequentialGroups-randomSongs":
      return pinnedFirst([...names].sort((a, b) => a.localeCompare(b)))
    case "randomGroups-sequentialSongs":
    case "randomGroups-randomSongs":
      return pinnedFirst(shuffleArray(names))
    case "weighted": {
      const pool = [...names]
      const out: string[] = []
      while (pool.length) {
        const pick = weightedPick(pool, pool.map(score))!
        out.push(pick)
        pool.splice(pool.indexOf(pick), 1)
      }
      return pinnedFirst(out)
    }
    case "equalRotation":
    case "noRepeatGroup":
    default:
      return pinnedFirst(shuffleArray(names))
  }
}

function reasonFor(name: string, config: GroupShuffleConfig, score: number): string {
  if (config.pinnedGroups.includes(name)) return "Pinned group"
  if (config.preferUnderplayed && score > 0.5) return "Underplayed \u2014 boosted"
  if (config.mode === "equalRotation") return "Equal rotation"
  if (config.mode.startsWith("weighted")) return `Weighted pick (score ${score})`
  return "Scheduled"
}
