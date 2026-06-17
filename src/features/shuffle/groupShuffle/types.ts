export type GroupByKey =
  | "artist"
  | "album"
  | "genre"
  | "folder"
  | "year"
  | "decade"
  | "mood"
  | "customTag"

export type GroupShuffleMode =
  | "sequentialGroups-randomSongs"
  | "randomGroups-sequentialSongs"
  | "randomGroups-randomSongs"
  | "weighted"
  | "equalRotation"
  | "noRepeatGroup"

export interface GroupShuffleConfig {
  groupBy: GroupByKey
  mode: GroupShuffleMode
  minPerGroup: number
  maxConsecutive: number
  preferUnderplayed: boolean
  skipRecentGroups: boolean
  pinnedGroups: string[]
  excludedGroups: string[]
  diversity: number // 0..1, higher = switch groups more aggressively
}

export const DEFAULT_GROUP_CONFIG: GroupShuffleConfig = {
  groupBy: "artist",
  mode: "equalRotation",
  minPerGroup: 1,
  maxConsecutive: 2,
  preferUnderplayed: true,
  skipRecentGroups: false,
  pinnedGroups: [],
  excludedGroups: [],
  diversity: 0.6,
}

export interface GroupPlanEntry {
  group: string
  reason: string
}
