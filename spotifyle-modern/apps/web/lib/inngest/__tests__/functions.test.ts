import { createGameFunction } from "../functions/create-game";
import { syncSpotifyDataFunction } from "../functions/sync-spotify-data";

describe("Inngest Functions", () => {
  describe("createGameFunction", () => {
    it("should be properly configured", () => {
      expect(createGameFunction).toBeDefined();
      expect(typeof createGameFunction).toBe("object");
      expect(createGameFunction.id()).toBe("create-game");
    });

    it("should have proper configuration", () => {
      const config = (createGameFunction as any).opts;
      expect(config).toBeDefined();
      expect(config.id).toBe("create-game");
      expect(config.name).toBe("Create Game");
      expect(config.throttle).toEqual({
        limit: 10,
        period: "1m",
      });
      expect(config.retries).toBe(3);
    });
  });

  describe("syncSpotifyDataFunction", () => {
    it("should be properly configured", () => {
      expect(syncSpotifyDataFunction).toBeDefined();
      expect(typeof syncSpotifyDataFunction).toBe("object");
      expect(syncSpotifyDataFunction.id()).toBe("sync-spotify-data");
    });

    it("should have proper configuration", () => {
      const config = (syncSpotifyDataFunction as any).opts;
      expect(config).toBeDefined();
      expect(config.id).toBe("sync-spotify-data");
      expect(config.name).toBe("Sync Spotify Data");
      expect(config.throttle).toEqual({
        limit: 5,
        period: "1m",
        key: "event.data.userId",
      });
      expect(config.retries).toBe(2);
    });
  });
});