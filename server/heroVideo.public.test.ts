import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const serviceMocks = vi.hoisted(() => ({
  getHomepageHeroVideoUrl: vi.fn().mockResolvedValue("/firebox-tech-loop.mp4"),
  updateHomepageHeroVideoUrl: vi.fn().mockResolvedValue(undefined),
  storeHomepageHeroVideo: vi
    .fn()
    .mockResolvedValue("/api/homepage-hero-video?v=0123456789abcdef01234567"),
}));

vi.mock("./db", () => ({
  getHomepageHeroVideoUrl: serviceMocks.getHomepageHeroVideoUrl,
  updateHomepageHeroVideoUrl: serviceMocks.updateHomepageHeroVideoUrl,
  storeHomepageHeroVideo: serviceMocks.storeHomepageHeroVideo,
}));

const anonymousCaller = () =>
  appRouter.createCaller({ user: null, req: {} as never, res: {} as never });

const adminCaller = () =>
  appRouter.createCaller({
    user: {
      id: 1,
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@example.test",
      loginMethod: "test",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as never,
    res: {} as never,
  });

describe("homepage loop video settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lets the public homepage read the active video source", async () => {
    serviceMocks.getHomepageHeroVideoUrl.mockResolvedValue(
      "/manus-storage/homepage/hero-loop_test.mp4"
    );
    await expect(anonymousCaller().siteSettings.heroVideo()).resolves.toBe(
      "/manus-storage/homepage/hero-loop_test.mp4"
    );
    expect(serviceMocks.getHomepageHeroVideoUrl).toHaveBeenCalledOnce();
  });

  it("restricts changing the source URL to administrators", async () => {
    await expect(
      anonymousCaller().siteSettings.updateHeroVideo({
        url: "https://cdn.example.test/loop.mp4",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(serviceMocks.updateHomepageHeroVideoUrl).not.toHaveBeenCalled();
  });

  it("allows an admin to save an HTTPS source URL", async () => {
    await adminCaller().siteSettings.updateHeroVideo({
      url: "https://cdn.example.test/loop.mp4",
    });
    expect(serviceMocks.updateHomepageHeroVideoUrl).toHaveBeenCalledWith(
      "https://cdn.example.test/loop.mp4"
    );
  });

  it("stores a valid MP4 through the app database and activates it", async () => {
    const mp4Header = Buffer.alloc(12);
    mp4Header.writeUInt32BE(12, 0);
    mp4Header.write("ftyp", 4, "ascii");

    await expect(
      adminCaller().siteSettings.uploadHeroVideo({
        mimeType: "video/mp4",
        dataBase64: mp4Header.toString("base64"),
      })
    ).resolves.toBe("/api/homepage-hero-video?v=0123456789abcdef01234567");

    expect(serviceMocks.storeHomepageHeroVideo).toHaveBeenCalledWith(
      mp4Header,
      "video/mp4"
    );
  });

  it("rejects mismatched or malformed video data before storage", async () => {
    await expect(
      adminCaller().siteSettings.uploadHeroVideo({
        mimeType: "video/mp4",
        dataBase64: Buffer.from("not an mp4 file").toString("base64"),
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(serviceMocks.storeHomepageHeroVideo).not.toHaveBeenCalled();
  });
});
