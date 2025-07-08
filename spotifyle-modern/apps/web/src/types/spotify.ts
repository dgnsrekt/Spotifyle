// Spotify API Types

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images?: SpotifyImage[]
  product?: string
  country?: string
  followers?: {
    total: number
  }
}

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_token?: string
}

export interface SpotifyError {
  error: string
  error_description?: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  duration_ms: number
  preview_url: string | null
  uri: string
  href: string
}

export interface SpotifyArtist {
  id: string
  name: string
  href: string
  uri: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
  uri: string
  href: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  images: SpotifyImage[]
  tracks: {
    total: number
    href: string
  }
  owner: {
    id: string
    display_name: string
  }
}

export interface SpotifyTopItems<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  href: string
  previous: string | null
  next: string | null
}