/**
 * Create a test user for development
 * Run with: npx tsx scripts/create-test-user.ts
 */

import { db } from "@spotifyle/database";

async function createTestUser() {
  console.log("Creating test user for development...\n");

  try {
    // Check if test user already exists
    const existingUser = await db.user.findUnique({
      where: { id: "test-user-123" },
    });

    if (existingUser) {
      console.log("✅ Test user already exists!");
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      return;
    }

    // Create test user
    const testUser = await db.user.create({
      data: {
        id: "test-user-123",
        email: "test@example.com",
        name: "Test User",
        spotifyId: "test-spotify-123",
        emailVerified: new Date(),
      },
    });

    console.log("✅ Test user created successfully!");
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);

    // Create a test Spotify account (for the Inngest function)
    const testAccount = await db.account.create({
      data: {
        userId: testUser.id,
        type: "oauth",
        provider: "spotify",
        providerAccountId: "test-spotify-123",
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        token_type: "Bearer",
        scope: "user-read-private user-read-email user-top-read",
      },
    });

    console.log("\n✅ Test Spotify account created!");
    console.log(`   Provider: ${testAccount.provider}`);
    console.log(`   Account ID: ${testAccount.providerAccountId}`);

    console.log("\n🎉 Test user setup complete!");
    console.log("\nYou can now test game creation with:");
    console.log("curl -X POST http://127.0.0.1:3000/api/game/create \\");
    console.log("  -H \"Content-Type: application/json\" \\");
    console.log("  -d '{\"gameType\": \"artist_trivia\", \"options\": {\"difficulty\": \"medium\"}}'");

  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await db.$disconnect();
  }
}

createTestUser();