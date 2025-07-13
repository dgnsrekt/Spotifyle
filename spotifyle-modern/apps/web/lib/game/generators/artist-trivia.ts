import { db } from "@spotifyle/database";
import type { Artist } from "../../spotify/types";

export interface ArtistTriviaOptions {
  gameId: string;
  artists: Artist[];
  difficulty: "easy" | "medium" | "hard";
}

export async function generateArtistTrivia(options: ArtistTriviaOptions) {
  const { gameId, artists, difficulty } = options;
  
  // Number of questions based on difficulty
  const questionCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;
  
  // Generate questions for random artists
  const selectedArtists = artists
    .sort(() => Math.random() - 0.5)
    .slice(0, questionCount);
  
  // Create stages for each question
  for (let i = 0; i < selectedArtists.length; i++) {
    const artist = selectedArtists[i];
    const questionType = Math.floor(Math.random() * 3);
    
    let question: any;
    let choices: string[];
    let correctAnswer: string;
    
    switch (questionType) {
      case 0: // Genre question
        question = {
          type: "genre",
          text: `What genre is ${artist.name} primarily associated with?`,
          artistId: artist.id,
          artistName: artist.name,
        };
        
        // In a real implementation, we'd fetch actual genres
        const genres = ["Pop", "Rock", "Hip Hop", "Electronic", "Jazz"];
        correctAnswer = artist.genres?.[0] || genres[0];
        choices = shuffleArray([
          correctAnswer,
          ...genres.filter(g => g !== correctAnswer).slice(0, 3)
        ]);
        break;
        
      case 1: // Popularity question
        question = {
          type: "popularity",
          text: `How popular is ${artist.name} on Spotify?`,
          artistId: artist.id,
          artistName: artist.name,
        };
        
        const popularity = artist.popularity || 50;
        correctAnswer = getPopularityRange(popularity);
        choices = [
          "Underground (0-20)",
          "Rising (21-40)",
          "Popular (41-60)",
          "Very Popular (61-80)",
          "Superstar (81-100)"
        ].filter(choice => {
          // Include correct answer and some others
          return choice === correctAnswer || Math.random() > 0.5;
        }).slice(0, 4);
        break;
        
      case 2: // Follower question
        question = {
          type: "followers",
          text: `Approximately how many followers does ${artist.name} have?`,
          artistId: artist.id,
          artistName: artist.name,
        };
        
        const followers = artist.followers?.total || 100000;
        correctAnswer = getFollowerRange(followers);
        choices = [
          "< 10k",
          "10k - 100k",
          "100k - 1M",
          "1M - 10M",
          "> 10M"
        ].filter(choice => {
          return choice === correctAnswer || Math.random() > 0.5;
        }).slice(0, 4);
        break;
        
      default:
        throw new Error("Invalid question type");
    }
    
    await db.stage.create({
      data: {
        gameId,
        order: i + 1,
        question,
        choices,
        correctAnswer,
        timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 20 : 15,
        points: difficulty === "easy" ? 100 : difficulty === "medium" ? 150 : 200,
      },
    });
  }
  
  return {
    stageCount: selectedArtists.length,
    difficulty,
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPopularityRange(popularity: number): string {
  if (popularity <= 20) return "Underground (0-20)";
  if (popularity <= 40) return "Rising (21-40)";
  if (popularity <= 60) return "Popular (41-60)";
  if (popularity <= 80) return "Very Popular (61-80)";
  return "Superstar (81-100)";
}

function getFollowerRange(followers: number): string {
  if (followers < 10000) return "< 10k";
  if (followers < 100000) return "10k - 100k";
  if (followers < 1000000) return "100k - 1M";
  if (followers < 10000000) return "1M - 10M";
  return "> 10M";
}