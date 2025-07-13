import { NextRequest, NextResponse } from "next/server";
import { db } from "@spotifyle/database";
import { getServerSession } from "../../../../../../lib/auth/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get game status
    const game = await db.game.findUnique({
      where: { id: params.gameId },
      select: {
        id: true,
        status: true,
        metadata: true,
        creatorId: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this game
    if (game.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Map database status to frontend status
    const statusMap: Record<string, string> = {
      generating: "creating",
      ready: "ready",
      failed: "failed",
      CREATING: "creating",
      WAITING: "ready",
      IN_PROGRESS: "in_progress",
      COMPLETED: "completed",
    };

    // Extract progress information from metadata if available
    const metadata = game.metadata as any;
    const progress = metadata?.progress || (game.status === "ready" ? 100 : 50);
    const message = metadata?.message || getStatusMessage(game.status);

    return NextResponse.json({
      gameId: game.id,
      status: statusMap[game.status] || game.status,
      progress,
      message,
      error: game.status === "failed" ? metadata?.error : undefined,
    });
  } catch (error) {
    console.error("Error fetching game status:", error);
    return NextResponse.json(
      { error: "Failed to fetch game status" },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "generating":
    case "CREATING":
      return "Creating your game...";
    case "ready":
    case "WAITING":
      return "Game is ready to play!";
    case "failed":
      return "Failed to create game";
    case "IN_PROGRESS":
      return "Game in progress";
    case "COMPLETED":
      return "Game completed";
    default:
      return "Processing...";
  }
}