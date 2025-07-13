// Re-export base types from shared types
export type {
  SpotifyUser,
  SpotifyImage,
  SpotifyTokenResponse,
  SpotifyError,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyTopItems,
} from "@/types/spotify";

// Extended Artist type with additional fields needed for game generation
export interface Artist {
  id: string;
  name: string;
  href: string;
  uri: string;
  genres?: string[];
  popularity?: number;
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
}

// Extended Track type with album information
export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number | null;
      width: number | null;
    }>;
    release_date: string;
    uri: string;
    href: string;
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
  href: string;
  popularity?: number;
}

// API Response types
export interface TopArtistsResponse {
  items: Artist[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  previous: string | null;
  next: string | null;
}

export interface TopTracksResponse {
  items: Track[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  previous: string | null;
  next: string | null;
}

export interface ArtistTopTracksResponse {
  tracks: Track[];
}