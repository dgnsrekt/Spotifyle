import type { 
  Artist, 
  Track, 
  TopArtistsResponse, 
  TopTracksResponse,
  ArtistTopTracksResponse 
} from "./types";

/**
 * Simplified Spotify client for Inngest functions
 * Uses an access token directly (no token management)
 */
export class SpotifyClient {
  private readonly accessToken: string;
  private readonly baseUrl = "https://api.spotify.com/v1";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async getTopArtists(params: {
    limit?: number;
    offset?: number;
    time_range?: "short_term" | "medium_term" | "long_term";
  } = {}): Promise<TopArtistsResponse> {
    const queryParams = new URLSearchParams({
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
      time_range: params.time_range || "medium_term",
    });

    return this.request<TopArtistsResponse>(
      `/me/top/artists?${queryParams.toString()}`
    );
  }

  async getTopTracks(params: {
    limit?: number;
    offset?: number;
    time_range?: "short_term" | "medium_term" | "long_term";
  } = {}): Promise<TopTracksResponse> {
    const queryParams = new URLSearchParams({
      limit: (params.limit || 20).toString(),
      offset: (params.offset || 0).toString(),
      time_range: params.time_range || "medium_term",
    });

    return this.request<TopTracksResponse>(
      `/me/top/tracks?${queryParams.toString()}`
    );
  }

  async getArtistTopTracks(
    artistId: string,
    market: string = "US"
  ): Promise<ArtistTopTracksResponse> {
    return this.request<ArtistTopTracksResponse>(
      `/artists/${artistId}/top-tracks?market=${market}`
    );
  }

  async getArtist(artistId: string): Promise<Artist> {
    return this.request<Artist>(`/artists/${artistId}`);
  }

  async getTrack(trackId: string): Promise<Track> {
    return this.request<Track>(`/tracks/${trackId}`);
  }

  async getArtists(artistIds: string[]): Promise<{ artists: Artist[] }> {
    const ids = artistIds.slice(0, 50).join(","); // Max 50 IDs
    return this.request<{ artists: Artist[] }>(`/artists?ids=${ids}`);
  }

  async getTracks(trackIds: string[]): Promise<{ tracks: Track[] }> {
    const ids = trackIds.slice(0, 50).join(","); // Max 50 IDs
    return this.request<{ tracks: Track[] }>(`/tracks?ids=${ids}`);
  }
}