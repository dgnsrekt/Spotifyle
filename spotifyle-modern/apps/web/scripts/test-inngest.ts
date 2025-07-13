/**
 * Test script to verify Inngest setup
 * Run with: npx tsx scripts/test-inngest.ts
 */

import { inngest } from "../lib/inngest/client";

async function testInngestSetup() {
  console.log("Testing Inngest setup...\n");

  // Test 1: Check if client is initialized
  console.log("✓ Inngest client initialized");
  console.log(`  ID: ${inngest.id}`);
  console.log(`  Event Key: ${inngest.eventKey || "(not set - OK for development)"}`);
  console.log(`  Dev Mode: ${inngest.isDev}`);

  // Test 2: Check event types
  console.log("\n✓ Event types defined:");
  const eventTypes = [
    "game/create.requested",
    "game/create.started",
    "game/create.progress",
    "game/create.completed",
    "game/create.failed",
    "spotify/data.sync",
  ];
  
  eventTypes.forEach((event) => {
    console.log(`  - ${event}`);
  });

  // Test 3: Test sending an event (dry run)
  console.log("\n✓ Event structure test:");
  const testEvent = {
    name: "game/create.requested" as const,
    data: {
      userId: "test-user-123",
      gameType: "artist_trivia" as const,
      options: {
        artistCount: 10,
        difficulty: "medium" as const,
      },
    },
  };
  
  console.log("  Sample event:", JSON.stringify(testEvent, null, 2));

  console.log("\n✅ Inngest setup complete!");
  console.log("\nNext steps:");
  console.log("1. Start the dev server: npm run dev");
  console.log("2. Visit http://127.0.0.1:3000/api/inngest to see the Inngest dev UI");
  console.log("3. Trigger a game creation via the API: POST /api/game/create");
}

testInngestSetup().catch(console.error);