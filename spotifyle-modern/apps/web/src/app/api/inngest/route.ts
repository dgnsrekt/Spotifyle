import { serve } from "inngest/next";
import { inngest } from "../../../../lib/inngest/client";
import { createGameFunction } from "../../../../lib/inngest/functions/create-game";
import { syncSpotifyDataFunction } from "../../../../lib/inngest/functions/sync-spotify-data";

/**
 * Inngest API endpoint
 * This serves the Inngest dev server UI in development
 * and handles function execution in production
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    createGameFunction,
    syncSpotifyDataFunction,
  ],
  /**
   * Inngest will send logs here in local development
   * In production, logs are managed by Inngest Cloud
   */
  serveHost: process.env.NODE_ENV === "development" ? "http://127.0.0.1:3000" : undefined,
});