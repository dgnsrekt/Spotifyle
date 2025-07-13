import { db } from "@spotifyle/database";
import type { Track } from "../../spotify/types";

export interface FindTrackArtOptions {
  gameId: string;
  tracks: Track[];
  difficulty: "easy" | "medium" | "hard";
}

export async function generateFindTrackArt(options: FindTrackArtOptions) {
  const { gameId, tracks, difficulty } = options;
  
  // Filter tracks that have album art
  const tracksWithArt = tracks.filter(track => 
    track.album?.images && track.album.images.length > 0
  );
  
  if (tracksWithArt.length < 4) {
    throw new Error("Not enough tracks with album art");
  }
  
  // Number of stages based on difficulty
  const stageCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;
  
  for (let i = 0; i < stageCount; i++) {
    // Select a random track as the correct answer
    const correctTrack = tracksWithArt[Math.floor(Math.random() * tracksWithArt.length)];
    
    // Select 3 other tracks as wrong answers
    const wrongTracks = tracksWithArt
      .filter(t => t.id !== correctTrack.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Create the question
    const question = {
      type: "find_track_art",
      trackName: correctTrack.name,
      artistName: correctTrack.artists[0]?.name || "Unknown Artist",
      previewUrl: correctTrack.preview_url,
      correctAlbumArt: correctTrack.album.images[0]?.url,
    };
    
    // Create choices (album arts)
    const allTracks = [correctTrack, ...wrongTracks].sort(() => Math.random() - 0.5);
    const choices = allTracks.map(track => ({
      albumId: track.album.id,
      albumName: track.album.name,
      albumArt: track.album.images[0]?.url || "",
      artistName: track.artists[0]?.name || "Unknown Artist",
    }));
    
    await db.stage.create({
      data: {
        gameId,
        order: i + 1,
        question,
        choices,
        correctAnswer: correctTrack.album.id,
        timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 20 : 15,
        points: difficulty === "easy" ? 100 : difficulty === "medium" ? 150 : 200,
      },
    });
  }
  
  return {
    stageCount,
    difficulty,
  };
}