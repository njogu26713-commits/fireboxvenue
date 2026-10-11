import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getPublishedTrackedProjects: vi.fn().mockResolvedValue([]),
  getTrackedProjects: vi.fn().mockResolvedValue([]),
  addTrackedProject: vi.fn().mockResolvedValue(undefined),
  updateTrackedProject: vi.fn().mockResolvedValue(undefined),
  deleteTrackedProject: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", () => dbMocks);

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

describe("project tracker procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("serves only the published-record query to public visitors", async () => {
    const published = [
      {
        id: 4,
        title: "Published release",
        description: "Public summary",
        status: "upcoming",
        published: true,
      },
    ];
    dbMocks.getPublishedTrackedProjects.mockResolvedValue(published);

    const result = await anonymousCaller().projectTracker.publicList();

    expect(result).toEqual(published);
    expect(dbMocks.getPublishedTrackedProjects).toHaveBeenCalledOnce();
    expect(dbMocks.getTrackedProjects).not.toHaveBeenCalled();
  });

  it("does not allow the public to read the full admin register", async () => {
    await expect(
      anonymousCaller().projectTracker.adminList()
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(dbMocks.getTrackedProjects).not.toHaveBeenCalled();
  });

  it("requires an abandonment reason before saving an abandoned record", async () => {
    await expect(
      adminCaller().projectTracker.add({
        title: "Retired concept",
        description: "A short overview.",
        status: "abandoned",
        abandonmentReason: "  ",
        published: false,
        sortOrder: 0,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(dbMocks.addTrackedProject).not.toHaveBeenCalled();
  });

  it("lets admins save a project with optional blank fields normalized to null", async () => {
    await adminCaller().projectTracker.add({
      title: "Next release",
      description: "A project in development.",
      status: "upcoming",
      plannedVersion: "2.0.0",
      plannedReleaseDate: "2026-11-01",
      published: false,
      sortOrder: 3,
    });

    expect(dbMocks.addTrackedProject).toHaveBeenCalledWith({
      title: "Next release",
      description: "A project in development.",
      status: "upcoming",
      releasedVersion: null,
      plannedVersion: "2.0.0",
      plannedReleaseDate: "2026-11-01",
      abandonmentReason: null,
      imageUrl: null,
      liveUrl: null,
      githubUrl: null,
      published: false,
      sortOrder: 3,
    });
  });

  it("rejects lifecycle writes from non-admin visitors", async () => {
    await expect(
      anonymousCaller().projectTracker.delete({ id: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.deleteTrackedProject).not.toHaveBeenCalled();
  });
});
