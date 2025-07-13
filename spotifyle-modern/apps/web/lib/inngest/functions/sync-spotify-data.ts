import { inngest } from "../client";
import { db } from "@spotifyle/database";
import { SpotifyClient } from "../../spotify/client";

export const syncSpotifyDataFunction = inngest.createFunction(
  {
    id: "sync-spotify-data",
    name: "Sync Spotify Data",
    // Rate limit to avoid hitting Spotify API limits
    throttle: {
      limit: 5,
      period: "1m",
      key: "event.data.userId",
    },
    retries: 2,
  },
  { event: "spotify/data.sync" },
  async ({ event, step }) => {
    const { userId, syncType } = event.data;

    // Step 1: Get user's Spotify client
    const spotifyClient = await step.run("get-spotify-client", async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const spotifyAccount = user.accounts.find(
        (account) => account.provider === "spotify"
      );

      if (!spotifyAccount || !spotifyAccount.access_token) {
        throw new Error("No Spotify account connected");
      }

      return new SpotifyClient(spotifyAccount.access_token);
    });

    // Step 2: Sync artists if requested
    if (syncType === "artists" || syncType === "all") {
      await step.run("sync-artists", async () => {
        const topArtists = await spotifyClient.getTopArtists({
          limit: 50,
          time_range: "long_term",
        });

        // Store artists in cache or database
        await db.userSpotifyData.upsert({
          where: { userId },
          create: {
            userId,
            topArtists: topArtists.items,
            lastSyncedAt: new Date(),
          },
          update: {
            topArtists: topArtists.items,
            lastSyncedAt: new Date(),
          },
        });

        return topArtists.items.length;
      });
    }

    // Step 3: Sync tracks if requested
    if (syncType === "tracks" || syncType === "all") {
      await step.run("sync-tracks", async () => {
        const topTracks = await spotifyClient.getTopTracks({
          limit: 50,
          time_range: "long_term",
        });

        // Store tracks in cache or database
        await db.userSpotifyData.upsert({
          where: { userId },
          create: {
            userId,
            topTracks: topTracks.items,
            lastSyncedAt: new Date(),
          },
          update: {
            topTracks: topTracks.items,
            lastSyncedAt: new Date(),
          },
        });

        return topTracks.items.length;
      });
    }

    // Step 4: Update user's last sync time
    await step.run("update-sync-time", async () => {
      await db.user.update({
        where: { id: userId },
        data: {
          metadata: {
            lastSpotifySync: new Date().toISOString(),
          },
        },
      });
    });

    return {
      userId,
      syncType,
      synced: true,
    };
  }
);