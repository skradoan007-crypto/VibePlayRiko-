import type { Album, Artist, FolderNode, Genre, Track } from "@/types/models"

/** Build artist/album/genre/folder indexes from a flat track list. */
export function buildIndexes(tracks: Track[]) {
  const artists = new Map<string, Artist>()
  const albums = new Map<string, Album>()
  const genres = new Map<string, Genre>()
  const folders = new Map<string, FolderNode>()

  for (const t of tracks) {
    // Artist
    const aKey = t.artist || "Unknown Artist"
    const artist = artists.get(aKey) ?? { id: aKey, name: aKey, trackIds: [], albumIds: [] }
    artist.trackIds.push(t.id)
    artists.set(aKey, artist)

    // Album
    const alKey = `${t.album}::${t.albumArtist ?? t.artist}`
    const album = albums.get(alKey) ?? {
      id: alKey,
      name: t.album,
      artist: t.albumArtist ?? t.artist,
      artworkUri: t.artworkUri,
      year: t.year,
      trackIds: [],
    }
    album.trackIds.push(t.id)
    albums.set(alKey, album)
    if (!artist.albumIds.includes(alKey)) artist.albumIds.push(alKey)

    // Genre
    if (t.genre) {
      const g = genres.get(t.genre) ?? { id: t.genre, name: t.genre, trackIds: [] }
      g.trackIds.push(t.id)
      genres.set(t.genre, g)
    }

    // Folder
    const f = folders.get(t.folderPath) ?? {
      path: t.folderPath,
      name: t.folderName,
      trackIds: [],
      subfolderPaths: [],
    }
    f.trackIds.push(t.id)
    folders.set(t.folderPath, f)
  }

  return {
    artists: [...artists.values()].sort((a, b) => a.name.localeCompare(b.name)),
    albums: [...albums.values()].sort((a, b) => a.name.localeCompare(b.name)),
    genres: [...genres.values()].sort((a, b) => a.name.localeCompare(b.name)),
    folders: [...folders.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
}
