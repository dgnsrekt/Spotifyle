import { db } from "@spotifyle/database";
import type { Track } from "../../spotify/types";

export interface MultipleTrackLockinOptions {
  gameId: string;
  tracks: Track[];
  difficulty: "easy" | "medium" | "hard";
}

export async function generateMultipleTrackLockin(options: MultipleTrackLockinOptions) {
  const { gameId, tracks, difficulty } = options;
  
  // Filter tracks that have preview URLs
  const tracksWithPreview = tracks.filter(track => track.preview_url);
  
  if (tracksWithPreview.length < 4) {
    throw new Error("Not enough tracks with preview URLs");
  }
  
  // Number of stages based on difficulty
  const stageCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;
  // Number of tracks to play simultaneously
  const simultaneousTracks = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  
  for (let i = 0; i < stageCount; i++) {
    // Select tracks to play simultaneously
    const selectedTracks = tracksWithPreview
      .sort(() => Math.random() - 0.5)
      .slice(0, simultaneousTracks);
    
    // Pick one as the correct answer
    const correctTrack = selectedTracks[Math.floor(Math.random() * selectedTracks.length)];
    
    // Add some decoy tracks for choices
    const decoyTracks = tracksWithPreview
      .filter(t => !selectedTracks.find(st => st.id === t.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - simultaneousTracks);
    
    const allChoices = [...selectedTracks, ...decoyTracks].sort(() => Math.random() - 0.5);
    
    const question = {
      type: "multiple_track_lockin",
      instruction: `${simultaneousTracks} tracks will play at once. Identify: "${correctTrack.name}"`,
      targetTrackName: correctTrack.name,
      targetArtistName: correctTrack.artists[0]?.name || "Unknown Artist",
      tracksToPlay: selectedTracks.map(t => ({
        id: t.id,
        previewUrl: t.preview_url,
        volume: 1.0 / simultaneousTracks, // Equal volume for all tracks
      })),
    };
    
    const choices = allChoices.map(track => ({
      trackId: track.id,
      trackName: track.name,
      artistName: track.artists[0]?.name || "Unknown Artist",
      albumName: track.album.name,
      albumArt: track.album.images[2]?.url || track.album.images[0]?.url || "",
    }));
    
    await db.stage.create({
      data: {
        gameId,
        order: i + 1,
        question,
        choices,
        correctAnswer: correctTrack.id,
        timeLimit: difficulty === "easy" ? 45 : difficulty === "medium" ? 35 : 25,
        points: difficulty === "easy" ? 150 : difficulty === "medium" ? 200 : 300,
      },
    });
  }
  
  return {
    stageCount,
    difficulty,
    simultaneousTracks,
  };
}