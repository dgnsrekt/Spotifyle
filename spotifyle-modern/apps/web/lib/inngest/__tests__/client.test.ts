import { inngest } from "../client";

describe("Inngest Client", () => {
  it("should be initialized with correct configuration", () => {
    expect(inngest).toBeDefined();
    expect(inngest.id).toBe("spotifyle");
  });

  it("should have event types defined", () => {
    // Type-only test to ensure our event types are properly defined
    type EventKeys = keyof typeof inngest["_events"];
    const eventKeys: EventKeys[] = [
      "game/create.requested",
      "game/create.started",
      "game/create.progress",
      "game/create.completed",
      "game/create.failed",
      "spotify/data.sync",
    ];
    
    // This test passes if TypeScript compiles successfully
    expect(eventKeys).toBeDefined();
  });
});