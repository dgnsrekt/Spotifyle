import { PrismaClient, GameType, GameStatus } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// Spotify-like data for realistic seeds
const SPOTIFY_ARTISTS = [
  { id: 'artist1', name: 'Taylor Swift', image: 'https://i.scdn.co/image/taylor-swift.jpg', genres: ['pop', 'country'] },
  { id: 'artist2', name: 'Drake', image: 'https://i.scdn.co/image/drake.jpg', genres: ['hip-hop', 'rap'] },
  { id: 'artist3', name: 'The Weeknd', image: 'https://i.scdn.co/image/the-weeknd.jpg', genres: ['r&b', 'pop'] },
  { id: 'artist4', name: 'Dua Lipa', image: 'https://i.scdn.co/image/dua-lipa.jpg', genres: ['pop', 'dance'] },
  { id: 'artist5', name: 'Post Malone', image: 'https://i.scdn.co/image/post-malone.jpg', genres: ['hip-hop', 'pop'] },
  { id: 'artist6', name: 'Billie Eilish', image: 'https://i.scdn.co/image/billie-eilish.jpg', genres: ['pop', 'alternative'] },
  { id: 'artist7', name: 'Ed Sheeran', image: 'https://i.scdn.co/image/ed-sheeran.jpg', genres: ['pop', 'folk'] },
  { id: 'artist8', name: 'Ariana Grande', image: 'https://i.scdn.co/image/ariana-grande.jpg', genres: ['pop', 'r&b'] },
]

const TRACK_NAMES = [
  'Midnight Dreams', 'Electric Heart', 'Golden Hour', 'Neon Lights',
  'Crystal Sky', 'Velvet Thunder', 'Cosmic Love', 'Silver Lining',
  'Purple Rain', 'Diamond Eyes', 'Starlight', 'Ocean Drive',
  'Fire & Ice', 'Moonlight Shadow', 'Phoenix Rising', 'Echo Chamber'
]

const ALBUM_NAMES = [
  'Metamorphosis', 'Celestial', 'Utopia', 'Dystopia',
  'Renaissance', 'Infinity', 'Paradox', 'Synthesis',
  'Kaleidoscope', 'Nebula', 'Prism', 'Aurora'
]

// Helper functions
function generateGameCode(): string {
  return faker.string.alphanumeric({ length: 6, casing: 'upper' })
}

function generateSpotifyId(): string {
  return faker.string.alphanumeric({ length: 22 })
}

function generateArtistTriviaQuestion(artist: typeof SPOTIFY_ARTISTS[0]) {
  const questions = [
    `What genre is ${artist.name} primarily known for?`,
    `Which album made ${artist.name} famous?`,
    `When did ${artist.name} release their first single?`,
    `What is ${artist.name}'s most streamed song?`,
    `Which artist has ${artist.name} collaborated with?`,
  ]
  
  return {
    text: faker.helpers.arrayElement(questions),
    artistId: artist.id,
    artistName: artist.name,
    artistImage: artist.image,
  }
}

function generateFindTrackArtQuestion() {
  const track = faker.helpers.arrayElement(TRACK_NAMES)
  const album = faker.helpers.arrayElement(ALBUM_NAMES)
  const artist = faker.helpers.arrayElement(SPOTIFY_ARTISTS)
  
  return {
    trackName: track,
    trackId: generateSpotifyId(),
    artistName: artist.name,
    correctAlbumArt: `https://i.scdn.co/image/album-${faker.number.int({ min: 1, max: 100 })}.jpg`,
  }
}

function generateMultipleTrackQuestion() {
  const tracks = faker.helpers.arrayElements(TRACK_NAMES, 4)
  const artist = faker.helpers.arrayElement(SPOTIFY_ARTISTS)
  
  return {
    prompt: `Which track is by ${artist.name}?`,
    artistName: artist.name,
    tracks: tracks.map(track => ({
      id: generateSpotifyId(),
      name: track,
      preview_url: `https://p.scdn.co/mp3-preview/${generateSpotifyId()}.mp3`
    }))
  }
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')
  
  // Delete in correct order to respect foreign key constraints
  await prisma.answer.deleteMany()
  await prisma.gameSession.deleteMany()
  await prisma.stage.deleteMany()
  await prisma.game.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Database cleaned')
}

async function seedUsers() {
  console.log('👤 Seeding users...')
  
  const users = []
  
  // Create test user with known credentials
  const testUser = await prisma.user.create({
    data: {
      email: 'test@spotifyle.app',
      name: 'Test User',
      spotifyId: 'test-spotify-id',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      profile: {
        create: {
          gamesPlayed: faker.number.int({ min: 10, max: 100 }),
          gamesWon: faker.number.int({ min: 0, max: 50 }),
          totalScore: faker.number.int({ min: 1000, max: 50000 }),
          favoriteArtists: faker.helpers.arrayElements(SPOTIFY_ARTISTS, 3),
          favoriteGenres: faker.helpers.arrayElements(['pop', 'rock', 'hip-hop', 'jazz', 'electronic'], 3),
        }
      }
    }
  })
  users.push(testUser)
  
  // Create random users
  for (let i = 0; i < 9; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        spotifyId: generateSpotifyId(),
        image: faker.image.avatar(),
        profile: {
          create: {
            gamesPlayed: faker.number.int({ min: 0, max: 200 }),
            gamesWon: faker.number.int({ min: 0, max: 100 }),
            totalScore: faker.number.int({ min: 0, max: 100000 }),
            favoriteArtists: faker.helpers.arrayElements(SPOTIFY_ARTISTS, faker.number.int({ min: 1, max: 5 })),
            favoriteGenres: faker.helpers.arrayElements(['pop', 'rock', 'hip-hop', 'jazz', 'electronic', 'country', 'r&b'], faker.number.int({ min: 1, max: 4 })),
          }
        }
      }
    })
    users.push(user)
  }
  
  console.log(`✅ Created ${users.length} users`)
  return users
}

async function seedGames(users: any[]) {
  console.log('🎮 Seeding games...')
  
  const games = []
  const gameTypes = Object.values(GameType)
  
  // Create various games
  for (let i = 0; i < 15; i++) {
    const creator = faker.helpers.arrayElement(users)
    const gameType = faker.helpers.arrayElement(gameTypes)
    const status = faker.helpers.arrayElement([GameStatus.WAITING, GameStatus.IN_PROGRESS, GameStatus.COMPLETED])
    
    const game = await prisma.game.create({
      data: {
        code: generateGameCode(),
        type: gameType,
        status,
        maxStages: faker.number.int({ min: 3, max: 10 }),
        maxPlayers: faker.number.int({ min: 2, max: 8 }),
        creatorId: creator.id,
        startedAt: status !== GameStatus.WAITING ? faker.date.recent() : null,
        endedAt: status === GameStatus.COMPLETED ? faker.date.recent() : null,
      }
    })
    
    // Create stages for the game
    const stageCount = game.maxStages
    for (let j = 0; j < stageCount; j++) {
      let question: any
      let choices: any[]
      let correctAnswer: string
      
      switch (gameType) {
        case GameType.ARTIST_TRIVIA:
          const artistQuestion = generateArtistTriviaQuestion(faker.helpers.arrayElement(SPOTIFY_ARTISTS))
          question = artistQuestion
          choices = faker.helpers.shuffle([
            ...faker.helpers.arrayElements(SPOTIFY_ARTISTS[0].genres, 3),
            faker.helpers.arrayElement(SPOTIFY_ARTISTS[0].genres)
          ])
          correctAnswer = faker.helpers.arrayElement(choices)
          break
          
        case GameType.FIND_TRACK_ART:
          const artQuestion = generateFindTrackArtQuestion()
          question = artQuestion
          choices = [
            artQuestion.correctAlbumArt,
            ...Array(3).fill(null).map(() => `https://i.scdn.co/image/album-${faker.number.int({ min: 1, max: 100 })}.jpg`)
          ]
          correctAnswer = artQuestion.correctAlbumArt
          break
          
        case GameType.MULTIPLE_TRACK_LOCKIN:
          const trackQuestion = generateMultipleTrackQuestion()
          question = trackQuestion
          choices = trackQuestion.tracks.map(t => t.id)
          correctAnswer = faker.helpers.arrayElement(choices)
          break
      }
      
      await prisma.stage.create({
        data: {
          gameId: game.id,
          question,
          choices,
          correctAnswer,
          timeLimit: faker.number.int({ min: 15, max: 60 }),
          points: faker.number.int({ min: 50, max: 200 }),
          order: j + 1,
        }
      })
    }
    
    // Add players to non-waiting games
    if (status !== GameStatus.WAITING) {
      const playerCount = faker.number.int({ min: 2, max: Math.min(6, users.length) })
      const players = faker.helpers.arrayElements(users, playerCount)
      
      for (const player of players) {
        const session = await prisma.gameSession.create({
          data: {
            gameId: game.id,
            playerId: player.id,
            finalScore: status === GameStatus.COMPLETED ? faker.number.int({ min: 0, max: 1000 }) : null,
            position: status === GameStatus.COMPLETED ? faker.number.int({ min: 1, max: playerCount }) : null,
          }
        })
        
        // Add answers for completed games
        if (status === GameStatus.COMPLETED) {
          const stages = await prisma.stage.findMany({
            where: { gameId: game.id },
            orderBy: { order: 'asc' }
          })
          
          for (const stage of stages) {
            const isCorrect = faker.datatype.boolean({ probability: 0.7 })
            await prisma.answer.create({
              data: {
                sessionId: session.id,
                stageId: stage.id,
                answer: isCorrect ? stage.correctAnswer : faker.helpers.arrayElement(stage.choices as string[]),
                isCorrect,
                timeSpent: faker.number.int({ min: 1000, max: stage.timeLimit * 1000 }),
                points: isCorrect ? stage.points : 0,
              }
            })
          }
        }
      }
    }
    
    games.push(game)
  }
  
  console.log(`✅ Created ${games.length} games with stages and sessions`)
  return games
}

async function seedActiveSession(testUser: any) {
  console.log('🔐 Creating active session for test user...')
  
  const session = await prisma.session.create({
    data: {
      sessionToken: 'test-session-token',
      userId: testUser.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    }
  })
  
  console.log('✅ Created active session for test user')
  return session
}

async function main() {
  console.log('🌱 Starting seed process...')
  
  try {
    // Clean database first
    await cleanDatabase()
    
    // Seed data
    const users = await seedUsers()
    const games = await seedGames(users)
    
    // Create active session for test user
    const testUser = users.find(u => u.email === 'test@spotifyle.app')
    if (testUser) {
      await seedActiveSession(testUser)
    }
    
    // Print summary
    console.log('\n📊 Seed Summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Games: ${games.length}`)
    console.log(`- Test user: test@spotifyle.app`)
    console.log(`- Session token: test-session-token`)
    
    console.log('\n✨ Seed completed successfully!')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })