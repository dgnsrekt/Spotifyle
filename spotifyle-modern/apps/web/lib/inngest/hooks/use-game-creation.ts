import { useState } from "react";
import type { InngestEvents } from "../client";
import { toast } from "sonner";

export type GameCreationOptions = {
  gameType: InngestEvents["game/create.requested"]["data"]["gameType"];
  artistCount?: number;
  trackCount?: number;
  difficulty?: "easy" | "medium" | "hard";
};

export type GameCreationState = {
  isCreating: boolean;
  progress: number;
  message: string;
  gameId?: string;
  error?: string;
};

export function useGameCreation() {
  const [state, setState] = useState<GameCreationState>({
    isCreating: false,
    progress: 0,
    message: "",
  });

  const createGame = async (
    userId: string,
    options: GameCreationOptions
  ) => {
    try {
      setState({
        isCreating: true,
        progress: 0,
        message: "Starting game creation...",
      });

      // Send the event to Inngest
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          gameType: options.gameType,
          options: {
            artistCount: options.artistCount,
            trackCount: options.trackCount,
            difficulty: options.difficulty,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start game creation");
      }

      const { gameId } = await response.json();

      setState((prev) => ({
        ...prev,
        gameId,
        message: "Game creation started...",
      }));

      // Poll for progress updates
      // In production, you'd use WebSockets or SSE for real-time updates
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(`/api/game/${gameId}/status`);
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          
          setState((prev) => ({
            ...prev,
            progress: status.progress || prev.progress,
            message: status.message || prev.message,
          }));

          if (status.status === "ready") {
            clearInterval(pollInterval);
            setState((prev) => ({
              ...prev,
              isCreating: false,
              progress: 100,
              message: "Game ready!",
            }));
            toast.success("Game created successfully!");
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setState((prev) => ({
              ...prev,
              isCreating: false,
              error: status.error || "Game creation failed",
            }));
            toast.error("Failed to create game");
          }
        }
      }, 1000);

      // Clean up interval after 2 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (state.isCreating) {
          setState((prev) => ({
            ...prev,
            isCreating: false,
            error: "Game creation timed out",
          }));
          toast.error("Game creation timed out");
        }
      }, 120000);

      return gameId;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isCreating: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      toast.error("Failed to create game");
      throw error;
    }
  };

  const reset = () => {
    setState({
      isCreating: false,
      progress: 0,
      message: "",
      gameId: undefined,
      error: undefined,
    });
  };

  return {
    createGame,
    reset,
    ...state,
  };
}