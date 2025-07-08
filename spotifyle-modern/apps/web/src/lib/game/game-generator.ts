/**
 * Game Generation Service
 * Generates game content based on user's Spotify data
 */

import type { GameType, GameConfig } from '@/lib/schemas/game-config'
import type { SpotifyArtist, SpotifyTrack } from '@spotifyle/spotify'
import { getUserTopItems } from '@spotifyle/spotify'

export interface GameStage {
  question: {
    text: string
    type: 'text' | 'audio' | 'image'
    mediaUrl?: string
  }
  choices: Array<{
    id: string
    text: string
    imageUrl?: string
  }>
  correctAnswer: string
  timeLimit: number
  points: number
  order: number
}

export interface GeneratedGame {
  stages: GameStage[]
  metadata: {
    totalQuestions: number
    totalPoints: number
    estimatedDuration: number
  }
}

/**
 * Generate a complete game based on configuration
 */
export async function generateGame(
  config: GameConfig,
  userId: string,
  accessToken: string
): Promise<GeneratedGame> {
  switch (config.type) {
    case 'artist-trivia':
      return generateArtistTriviaGame(config, userId, accessToken)
    case 'find-track-art':
      return generateFindTrackArtGame(config, userId, accessToken)
    case 'multiple-track-lockin':
      return generateMultipleTrackLockinGame(config, userId, accessToken)
    default:
      throw new Error(`Unknown game type: ${config.type}`)
  }
}

/**
 * Generate Artist Trivia game
 */
async function generateArtistTriviaGame(
  config: GameConfig,
  userId: string,
  accessToken: string
): Promise<GeneratedGame> {
  // Fetch user's top artists
  const { items: artists } = await getUserTopItems(
    userId,
    accessToken,
    'artists',
    { limit: 50 }
  )

  if (artists.length < 4) {
    throw new Error('Not enough artists to generate trivia questions')
  }

  const stages: GameStage[] = []
  const usedArtists = new Set<string>()

  for (let i = 0; i < config.questionCount; i++) {
    // Select a random artist that hasn't been used
    const availableArtists = artists.filter(a => !usedArtists.has(a.id))
    if (availableArtists.length === 0) {
      // Reset if we've used all artists
      usedArtists.clear()
      availableArtists.push(...artists)
    }

    const targetArtist = availableArtists[Math.floor(Math.random() * availableArtists.length)]
    usedArtists.add(targetArtist.id)

    // Generate different types of questions
    const questionType = Math.floor(Math.random() * 3)
    let stage: GameStage

    switch (questionType) {
      case 0:
        stage = generateGenreQuestion(targetArtist, artists, i, config)
        break
      case 1:
        stage = generatePopularityQuestion(targetArtist, artists, i, config)
        break
      case 2:
        stage = generateFollowerQuestion(targetArtist, artists, i, config)
        break
      default:
        stage = generateGenreQuestion(targetArtist, artists, i, config)
    }

    stages.push(stage)
  }

  return {
    stages,
    metadata: {
      totalQuestions: config.questionCount,
      totalPoints: stages.reduce((sum, s) => sum + s.points, 0),
      estimatedDuration: config.questionCount * config.timeLimit
    }
  }
}

/**
 * Generate a genre-based question
 */
function generateGenreQuestion(
  targetArtist: SpotifyArtist,
  allArtists: SpotifyArtist[],
  order: number,
  config: GameConfig
): GameStage {
  const genre = targetArtist.genres[0] || 'music'
  
  // Find other artists - for genre questions, we want artists that don't share this specific genre
  let wrongArtists = allArtists
    .filter(a => a.id !== targetArtist.id && !a.genres.includes(genre))
  
  // If not enough artists with different genres, just use other artists
  if (wrongArtists.length < 3) {
    wrongArtists = allArtists.filter(a => a.id !== targetArtist.id)
  }
  
  // Ensure we have at least 3 wrong choices
  if (wrongArtists.length < 3) {
    throw new Error(`Not enough artists to generate choices. Have ${wrongArtists.length}, need at least 3`)
  }
  
  const wrongChoices = wrongArtists
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      text: a.name,
      imageUrl: a.images[0]?.url
    }))

  const correctChoice = {
    id: targetArtist.id,
    text: targetArtist.name,
    imageUrl: targetArtist.images[0]?.url
  }

  const choices = [...wrongChoices, correctChoice].sort(() => Math.random() - 0.5)

  return {
    question: {
      text: `Which artist is known for ${genre} music?`,
      type: 'text'
    },
    choices,
    correctAnswer: targetArtist.id,
    timeLimit: config.timeLimit,
    points: config.difficulty === 'hard' ? 150 : config.difficulty === 'medium' ? 100 : 50,
    order: order + 1
  }
}

/**
 * Generate a popularity-based question
 */
function generatePopularityQuestion(
  targetArtist: SpotifyArtist,
  allArtists: SpotifyArtist[],
  order: number,
  config: GameConfig
): GameStage {
  // Sort artists by popularity
  const sortedByPopularity = [...allArtists].sort((a, b) => b.popularity - a.popularity)
  const targetRank = sortedByPopularity.findIndex(a => a.id === targetArtist.id) + 1

  let questionText: string
  if (targetRank <= 5) {
    questionText = "Which of these artists is one of your TOP 5 most popular?"
  } else if (targetRank <= 10) {
    questionText = "Which artist is in your TOP 10 most popular?"
  } else {
    questionText = "Which artist has been gaining popularity in your listening?"
  }

  // Select wrong answers from different popularity ranges
  let wrongChoices = allArtists
    .filter(a => a.id !== targetArtist.id)
    .filter(a => {
      const artistRank = sortedByPopularity.findIndex(x => x.id === a.id) + 1
      // Only filter by rank difference if we have enough artists
      return allArtists.length <= 10 || Math.abs(artistRank - targetRank) > 2
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      text: a.name,
      imageUrl: a.images[0]?.url
    }))
  
  // Fallback if not enough choices
  if (wrongChoices.length < 3) {
    wrongChoices = allArtists
      .filter(a => a.id !== targetArtist.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        text: a.name,
        imageUrl: a.images[0]?.url
      }))
  }

  const correctChoice = {
    id: targetArtist.id,
    text: targetArtist.name,
    imageUrl: targetArtist.images[0]?.url
  }

  const choices = [...wrongChoices, correctChoice].sort(() => Math.random() - 0.5)

  return {
    question: {
      text: questionText,
      type: 'text'
    },
    choices,
    correctAnswer: targetArtist.id,
    timeLimit: config.timeLimit,
    points: config.difficulty === 'hard' ? 200 : config.difficulty === 'medium' ? 125 : 75,
    order: order + 1
  }
}

/**
 * Generate a follower count question
 */
function generateFollowerQuestion(
  targetArtist: SpotifyArtist,
  allArtists: SpotifyArtist[],
  order: number,
  config: GameConfig
): GameStage {
  const followerCount = targetArtist.followers.total
  
  let questionText: string
  if (followerCount > 1000000) {
    questionText = `Which artist has over ${Math.floor(followerCount / 1000000)} million followers?`
  } else if (followerCount > 100000) {
    questionText = `Which artist has over ${Math.floor(followerCount / 100000) * 100}K followers?`
  } else {
    questionText = "Which of these is an up-and-coming artist you follow?"
  }

  // Select artists with different follower ranges
  let wrongChoices = allArtists
    .filter(a => a.id !== targetArtist.id)
    .filter(a => {
      const ratio = a.followers.total / followerCount
      return ratio < 0.5 || ratio > 2 // Different magnitude
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(a => ({
      id: a.id,
      text: a.name,
      imageUrl: a.images[0]?.url
    }))
  
  // Fallback if not enough choices
  if (wrongChoices.length < 3) {
    wrongChoices = allArtists
      .filter(a => a.id !== targetArtist.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        text: a.name,
        imageUrl: a.images[0]?.url
      }))
  }

  const correctChoice = {
    id: targetArtist.id,
    text: targetArtist.name,
    imageUrl: targetArtist.images[0]?.url
  }

  const choices = [...wrongChoices, correctChoice].sort(() => Math.random() - 0.5)

  return {
    question: {
      text: questionText,
      type: 'text'
    },
    choices,
    correctAnswer: targetArtist.id,
    timeLimit: config.timeLimit,
    points: config.difficulty === 'hard' ? 175 : config.difficulty === 'medium' ? 125 : 75,
    order: order + 1
  }
}

/**
 * Generate Find Track Art game
 */
async function generateFindTrackArtGame(
  config: GameConfig,
  userId: string,
  accessToken: string
): Promise<GeneratedGame> {
  // Fetch user's top tracks
  const { items: tracks } = await getUserTopItems(
    userId,
    accessToken,
    'tracks',
    { limit: 50 }
  )

  if (tracks.length < 4) {
    throw new Error('Not enough tracks to generate album art questions')
  }

  const stages: GameStage[] = []
  const usedTracks = new Set<string>()

  for (let i = 0; i < config.questionCount; i++) {
    // Select a random track that hasn't been used
    const availableTracks = tracks.filter(t => !usedTracks.has(t.id) && t.album.images.length > 0)
    if (availableTracks.length === 0) {
      usedTracks.clear()
      availableTracks.push(...tracks.filter(t => t.album.images.length > 0))
    }

    const targetTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)]
    usedTracks.add(targetTrack.id)

    // Find other tracks with different album art
    const wrongChoices = tracks
      .filter(t => t.id !== targetTrack.id && t.album.id !== targetTrack.album.id && t.album.images.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(t => ({
        id: t.id,
        text: t.album.name,
        imageUrl: t.album.images[0]?.url
      }))

    const correctChoice = {
      id: targetTrack.id,
      text: targetTrack.album.name,
      imageUrl: targetTrack.album.images[0]?.url
    }

    const choices = [...wrongChoices, correctChoice].sort(() => Math.random() - 0.5)

    stages.push({
      question: {
        text: `Which album cover is for "${targetTrack.name}" by ${targetTrack.artists[0].name}?`,
        type: 'text'
      },
      choices,
      correctAnswer: targetTrack.id,
      timeLimit: config.timeLimit,
      points: config.difficulty === 'hard' ? 150 : config.difficulty === 'medium' ? 100 : 50,
      order: i + 1
    })
  }

  return {
    stages,
    metadata: {
      totalQuestions: config.questionCount,
      totalPoints: stages.reduce((sum, s) => sum + s.points, 0),
      estimatedDuration: config.questionCount * config.timeLimit
    }
  }
}

/**
 * Generate Multiple Track Lock-in game
 */
async function generateMultipleTrackLockinGame(
  config: GameConfig,
  userId: string,
  accessToken: string
): Promise<GeneratedGame> {
  // Fetch user's top tracks
  const { items: tracks } = await getUserTopItems(
    userId,
    accessToken,
    'tracks',
    { limit: 50 }
  )

  if (tracks.length < 4) {
    throw new Error('Not enough tracks to generate audio questions')
  }

  const stages: GameStage[] = []
  const usedTracks = new Set<string>()

  for (let i = 0; i < config.questionCount; i++) {
    // Select a random track that hasn't been used
    const availableTracks = tracks.filter(t => !usedTracks.has(t.id) && t.preview_url)
    if (availableTracks.length === 0) {
      usedTracks.clear()
      availableTracks.push(...tracks.filter(t => t.preview_url))
    }

    if (availableTracks.length === 0) {
      throw new Error('Not enough tracks with preview URLs for audio game')
    }

    const targetTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)]
    usedTracks.add(targetTrack.id)

    // Select wrong answers based on difficulty
    let wrongChoices: SpotifyTrack[]
    
    if (config.difficulty === 'hard') {
      // For hard, select tracks from the same artist or genre
      wrongChoices = tracks
        .filter(t => t.id !== targetTrack.id && 
          (t.artists[0].id === targetTrack.artists[0].id || 
           t.artists.some(a => targetTrack.artists.map(ta => ta.id).includes(a.id))))
        .slice(0, 3)
      
      // If not enough from same artist, add similar tracks
      if (wrongChoices.length < 3) {
        const additional = tracks
          .filter(t => t.id !== targetTrack.id && !wrongChoices.map(w => w.id).includes(t.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 - wrongChoices.length)
        wrongChoices.push(...additional)
      }
    } else {
      // For easy/medium, select random different tracks
      wrongChoices = tracks
        .filter(t => t.id !== targetTrack.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
    }

    const choices = [...wrongChoices, targetTrack]
      .sort(() => Math.random() - 0.5)
      .map(t => ({
        id: t.id,
        text: `${t.name} - ${t.artists[0].name}`,
        imageUrl: t.album.images[2]?.url // Small image
      }))

    stages.push({
      question: {
        text: "Listen to the track preview and identify the correct song",
        type: 'audio',
        mediaUrl: targetTrack.preview_url!
      },
      choices,
      correctAnswer: targetTrack.id,
      timeLimit: config.timeLimit,
      points: config.difficulty === 'hard' ? 200 : config.difficulty === 'medium' ? 150 : 100,
      order: i + 1
    })
  }

  return {
    stages,
    metadata: {
      totalQuestions: config.questionCount,
      totalPoints: stages.reduce((sum, s) => sum + s.points, 0),
      estimatedDuration: config.questionCount * config.timeLimit
    }
  }
}

/**
 * Save generated game to database
 */
export async function saveGeneratedGame(
  gameId: string,
  generatedGame: GeneratedGame
): Promise<void> {
  // This would be implemented when we set up the database service
  // For now, this is a placeholder
  console.log('Saving game:', gameId, generatedGame)
}