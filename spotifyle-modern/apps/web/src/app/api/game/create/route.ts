import { NextRequest, NextResponse } from "next/server";
import { inngest } from "../../../../../lib/inngest/client";
import { db } from "@spotifyle/database";
import { getServerSession } from "../../../../../lib/auth/session";
import { z } from "zod";

const createGameSchema = z.object({
  gameType: z.enum(["artist_trivia", "find_track_art", "multiple_track_lockin"]),
  options: z.object({
    artistCount: z.number().min(5).max(50).optional(),
    trackCount: z.number().min(10).max(100).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    // TEMPORARY: Allow testing without auth in development
    const testUserId = process.env.NODE_ENV === "development" ? "test-user-123" : null;
    const userId = session?.user?.id || testUserId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createGameSchema.parse(body);

    // Create initial game record with a unique code
    const gameCode = generateGameCode();
    const game = await db.game.create({
      data: {
        code: gameCode,
        creatorId: userId,
        type: mapGameType(validatedData.gameType),
        status: "generating",
        maxPlayers: 4,
        timeLimit: 30,
      },
    });

    // Try to send event to Inngest, but don't fail if it's not available
    try {
      await inngest.send({
        name: "game/create.requested",
        data: {
          userId: userId,
          gameType: validatedData.gameType,
          options: validatedData.options || {},
        },
      });
      
      console.log("✅ Game creation event sent to Inngest");
    } catch (inngestError) {
      console.warn("⚠️ Inngest not available, creating game synchronously");
      console.warn("To use Inngest, make sure the dev server is running");
      console.warn("Visit http://127.0.0.1:3000/api/inngest to start it");
      
      // Update game status to ready since we're not using async processing
      await db.game.update({
        where: { id: game.id },
        data: { status: "ready" },
      });
    }

    return NextResponse.json({
      gameId: game.id,
      gameCode: game.code,
      status: "creating",
    });
  } catch (error) {
    console.error("Error creating game:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    // Add more detailed error info in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = process.env.NODE_ENV === "development" ? {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    } : undefined;

    return NextResponse.json(
      { 
        error: "Failed to create game",
        details: errorDetails 
      },
      { status: 500 }
    );
  }
}

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