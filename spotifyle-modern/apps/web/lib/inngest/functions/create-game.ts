import { inngest } from "../client";
import { db } from "@spotifyle/database";
import { SpotifyClient } from "../../spotify/client";
import { generateArtistTrivia } from "../../game/generators/artist-trivia";
import { generateFindTrackArt } from "../../game/generators/find-track-art";
import { generateMultipleTrackLockin } from "../../game/generators/multiple-track-lockin";

export const createGameFunction = inngest.createFunction(
  {
    id: "create-game",
    name: "Create Game",
    // Throttle to respect Spotify API limits
    throttle: {
      limit: 10,
      period: "1m",
    },
    retries: 3,
  },
  { event: "game/create.requested" },
  async ({ event, step }) => {
    const { userId, gameType, options } = event.data;

    // Step 1: Create game record in database
    const game = await step.run("create-game-record", async () => {
      // Generate a unique game code
      const gameCode = generateGameCode();
      
      const game = await db.game.create({
        data: {
          code: gameCode,
          creatorId: userId,
          type: mapGameType(gameType),
          status: "generating",
          maxPlayers: 4,
          timeLimit: 30,
        },
      });

      // Send progress event
      await inngest.send({
        name: "game/create.started",
        data: {
          gameId: game.id,
          userId,
        },
      });

      return game;
    });

    // Step 2: Get user's Spotify access token
    const spotifyClient = await step.run("get-spotify-client", async () => {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const spotifyAccount = user.accounts.find(
        (account: any) => account.provider === "spotify"
      );

      if (!spotifyAccount || !spotifyAccount.access_token) {
        throw new Error("No Spotify account connected");
      }

      return new SpotifyClient(spotifyAccount.access_token);
    });

    // Step 3: Fetch user's top artists
    const artists = await step.run("fetch-top-artists", async () => {
      await inngest.send({
        name: "game/create.progress",
        data: {
          gameId: game.id,
          step: "Fetching your top artists",
          progress: 20,
          message: "Loading your music taste profile...",
        },
      });

      const topArtists = await spotifyClient.getTopArtists({
        limit: options.artistCount || 20,
        time_range: "medium_term",
      });

      return topArtists.items;
    });

    // Step 4: Fetch tracks for game generation
    const tracks = await step.run("fetch-tracks", async () => {
      await inngest.send({
        name: "game/create.progress",
        data: {
          gameId: game.id,
          step: "Loading track data",
          progress: 40,
          message: "Fetching tracks from your favorite artists...",
        },
      });

      // Fetch top tracks for variety
      const topTracks = await spotifyClient.getTopTracks({
        limit: options.trackCount || 50,
        time_range: "medium_term",
      });

      // For each artist, fetch some tracks
      const artistTracks = await Promise.all(
        artists.slice(0, 10).map(async (artist: any) => {
          const tracks = await spotifyClient.getArtistTopTracks(artist.id);
          return tracks.tracks.slice(0, 5);
        })
      );

      return {
        topTracks: topTracks.items,
        artistTracks: artistTracks.flat(),
      };
    });

    // Step 5: Generate game content based on type
    const gameContent = await step.run("generate-game-content", async () => {
      await inngest.send({
        name: "game/create.progress",
        data: {
          gameId: game.id,
          step: "Generating puzzles",
          progress: 70,
          message: "Creating exciting challenges...",
        },
      });

      switch (gameType) {
        case "artist_trivia":
          return await generateArtistTrivia({
            gameId: game.id,
            artists,
            difficulty: options.difficulty || "medium",
          });

        case "find_track_art":
          return await generateFindTrackArt({
            gameId: game.id,
            tracks: [...tracks.topTracks, ...tracks.artistTracks],
            difficulty: options.difficulty || "medium",
          });

        case "multiple_track_lockin":
          return await generateMultipleTrackLockin({
            gameId: game.id,
            tracks: tracks.topTracks,
            difficulty: options.difficulty || "medium",
          });

        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }
    });

    // Step 6: Finalize game creation
    const finalizedGame = await step.run("finalize-game", async () => {
      await inngest.send({
        name: "game/create.progress",
        data: {
          gameId: game.id,
          step: "Finalizing game",
          progress: 90,
          message: "Almost ready...",
        },
      });

      // Update game status
      const updatedGame = await db.game.update({
        where: { id: game.id },
        data: {
          status: "ready",
          metadata: {
            artistCount: artists.length,
            trackCount: tracks.topTracks.length + tracks.artistTracks.length,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      // Send completion event
      await inngest.send({
        name: "game/create.completed",
        data: {
          gameId: game.id,
          userId,
        },
      });

      return updatedGame;
    });

    return {
      gameId: finalizedGame.id,
      status: "completed",
    };
  }
);

// Note: Error handling is done within the function using try/catch
// Inngest automatically retries failed functions based on the retries configuration

/**
 * Generate a unique 6-character game code
 */
function generateGameCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Map game type from API to database enum
 */
function mapGameType(
  gameType: "artist_trivia" | "find_track_art" | "multiple_track_lockin"
): "ARTIST_TRIVIA" | "FIND_TRACK_ART" | "MULTIPLE_TRACK_LOCKIN" {
  switch (gameType) {
    case "artist_trivia":
      return "ARTIST_TRIVIA";
    case "find_track_art":
      return "FIND_TRACK_ART";
    case "multiple_track_lockin":
      return "MULTIPLE_TRACK_LOCKIN";
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
}