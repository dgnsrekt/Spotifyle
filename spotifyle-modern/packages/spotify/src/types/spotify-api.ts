/**
 * Spotify Web API Types
 * Based on Spotify Web API Reference: https://developer.spotify.com/documentation/web-api/reference/
 */

// Base types
export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyExternalUrls {
  spotify: string
}

export interface SpotifyExternalIds {
  isrc?: string
  ean?: string
  upc?: string
}

export interface SpotifyFollowers {
  href: string | null
  total: number
}

export interface SpotifyRestrictions {
  reason: 'market' | 'product' | 'explicit'
}

// User types
export interface SpotifyUser {
  id: string
  display_name: string | null
  email?: string
  external_urls: SpotifyExternalUrls
  followers: SpotifyFollowers
  href: string
  images: SpotifyImage[]
  type: 'user'
  uri: string
  country?: string
  explicit_content?: {
    filter_enabled: boolean
    filter_locked: boolean
  }
  product?: 'premium' | 'free' | 'open'
}

// Artist types
export interface SpotifyArtist {
  id: string
  name: string
  external_urls: SpotifyExternalUrls
  followers?: SpotifyFollowers
  genres?: string[]
  href: string
  images?: SpotifyImage[]
  popularity?: number
  type: 'artist'
  uri: string
}

export interface SpotifyArtistSimplified {
  id: string
  name: string
  external_urls: SpotifyExternalUrls
  href: string
  type: 'artist'
  uri: string
}

// Album types
export interface SpotifyAlbum {
  id: string
  name: string
  album_type: 'album' | 'single' | 'compilation'
  total_tracks: number
  available_markets: string[]
  external_urls: SpotifyExternalUrls
  href: string
  images: SpotifyImage[]
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  restrictions?: SpotifyRestrictions
  type: 'album'
  uri: string
  artists: SpotifyArtistSimplified[]
  tracks?: SpotifyPagingObject<SpotifyTrackSimplified>
  copyrights?: SpotifyCopyright[]
  external_ids?: SpotifyExternalIds
  genres?: string[]
  label?: string
  popularity?: number
}

export interface SpotifyAlbumSimplified {
  id: string
  name: string
  album_type: 'album' | 'single' | 'compilation'
  total_tracks: number
  available_markets: string[]
  external_urls: SpotifyExternalUrls
  href: string
  images: SpotifyImage[]
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  restrictions?: SpotifyRestrictions
  type: 'album'
  uri: string
  artists: SpotifyArtistSimplified[]
  album_group?: 'album' | 'single' | 'compilation' | 'appears_on'
}

interface SpotifyComment {
  text: string
  type: 'P' | 'C'
}

interface SpotifyCompany {
  name: string
  type: 'P' | 'C'
}

type SpotifyCopyright = SpotifyComment | SpotifyCompany

// Track types
export interface SpotifyTrack {
  id: string
  name: string
  album: SpotifyAlbumSimplified
  artists: SpotifyArtistSimplified[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: SpotifyExternalIds
  external_urls: SpotifyExternalUrls
  href: string
  is_playable?: boolean
  linked_from?: SpotifyTrackLink
  restrictions?: SpotifyRestrictions
  popularity: number
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
  is_local: boolean
}

export interface SpotifyTrackSimplified {
  id: string
  name: string
  artists: SpotifyArtistSimplified[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: SpotifyExternalUrls
  href: string
  is_playable?: boolean
  linked_from?: SpotifyTrackLink
  restrictions?: SpotifyRestrictions
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
  is_local: boolean
}

interface SpotifyTrackLink {
  external_urls: SpotifyExternalUrls
  href: string
  id: string
  type: 'track'
  uri: string
}

// Playlist types
export interface SpotifyPlaylist {
  id: string
  name: string
  collaborative: boolean
  description: string | null
  external_urls: SpotifyExternalUrls
  followers: SpotifyFollowers
  href: string
  images: SpotifyImage[]
  owner: SpotifyUser
  public: boolean | null
  snapshot_id: string
  tracks: SpotifyPagingObject<SpotifyPlaylistTrack>
  type: 'playlist'
  uri: string
}

export interface SpotifyPlaylistSimplified {
  id: string
  name: string
  collaborative: boolean
  description: string | null
  external_urls: SpotifyExternalUrls
  href: string
  images: SpotifyImage[]
  owner: SpotifyUser
  public: boolean | null
  snapshot_id: string
  tracks: {
    href: string
    total: number
  }
  type: 'playlist'
  uri: string
}

export interface SpotifyPlaylistTrack {
  added_at: string | null
  added_by: SpotifyUser | null
  is_local: boolean
  track: SpotifyTrack | SpotifyEpisode | null
}

// Podcast types (simplified)
export interface SpotifyEpisode {
  id: string
  name: string
  type: 'episode'
  uri: string
}

// Paging object
export interface SpotifyPagingObject<T> {
  href: string
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
  items: T[]
}

// Search types
export interface SpotifySearchResult {
  tracks?: SpotifyPagingObject<SpotifyTrack>
  artists?: SpotifyPagingObject<SpotifyArtist>
  albums?: SpotifyPagingObject<SpotifyAlbumSimplified>
  playlists?: SpotifyPagingObject<SpotifyPlaylistSimplified>
}

// Audio features
export interface SpotifyAudioFeatures {
  id: string
  acousticness: number
  analysis_url: string
  danceability: number
  duration_ms: number
  energy: number
  instrumentalness: number
  key: number
  liveness: number
  loudness: number
  mode: number
  speechiness: number
  tempo: number
  time_signature: number
  track_href: string
  type: 'audio_features'
  uri: string
  valence: number
}

// User's top items
export interface SpotifyTopItemsResponse<T> extends SpotifyPagingObject<T> {
  // Same as paging object but for top items
}

// Recently played
export interface SpotifyRecentlyPlayedTrack {
  track: SpotifyTrack
  played_at: string
  context: SpotifyContext | null
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedTrack[]
  next: string | null
  cursors: {
    after: string
    before: string
  }
  limit: number
  href: string
}

export interface SpotifyContext {
  type: 'artist' | 'playlist' | 'album' | 'show'
  href: string
  external_urls: SpotifyExternalUrls
  uri: string
}

// API Error types
export interface SpotifyApiErrorResponse {
  error: {
    status: number
    message: string
  }
}

// Token types
export interface SpotifyTokenResponse {
  access_token: string
  token_type: 'Bearer'
  scope: string
  expires_in: number
  refresh_token?: string
}

// Time range type
export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term'

// Request parameters
export interface SpotifyApiParams {
  limit?: number
  offset?: number
  market?: string
  time_range?: SpotifyTimeRange
  after?: string
  before?: string
}

export interface SpotifySearchParams extends SpotifyApiParams {
  q: string
  type: ('album' | 'artist' | 'playlist' | 'track')[]
  include_external?: 'audio'
}

// Artist's top tracks
export interface SpotifyArtistTopTracksResponse {
  tracks: SpotifyTrack[]
}