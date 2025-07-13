import { Inngest } from "inngest";

/**
 * Inngest client for handling async jobs
 * Used for game generation, Spotify data fetching, and other background tasks
 */
export const inngest = new Inngest({
  id: "spotifyle",
  // In production, set the INNGEST_EVENT_KEY environment variable
  eventKey: process.env.INNGEST_EVENT_KEY || "NO_EVENT_KEY_SET",
  // Disable warnings for local development
  isDev: process.env.NODE_ENV === "development",
  // Set the base URL for local development
  baseUrl: process.env.INNGEST_BASE_URL,
  // Disable logging in development
  logger: process.env.NODE_ENV === "development" ? undefined : console,
});

// Define event types for type safety
export type InngestEvents = {
  "game/create.requested": {
    data: {
      userId: string;
      gameType: "artist_trivia" | "find_track_art" | "multiple_track_lockin";
      options: {
        artistCount?: number;
        trackCount?: number;
        difficulty?: "easy" | "medium" | "hard";
      };
    };
  };
  "game/create.started": {
    data: {
      gameId: string;
      userId: string;
    };
  };
  "game/create.progress": {
    data: {
      gameId: string;
      step: string;
      progress: number; // 0-100
      message: string;
    };
  };
  "game/create.completed": {
    data: {
      gameId: string;
      userId: string;
    };
  };
  "game/create.failed": {
    data: {
      gameId: string;
      userId: string;
      error: string;
    };
  };
  "spotify/data.sync": {
    data: {
      userId: string;
      syncType: "artists" | "tracks" | "all";
    };
  };
};