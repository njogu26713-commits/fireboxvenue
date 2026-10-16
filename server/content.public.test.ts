import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  addService: vi.fn().mockResolvedValue(undefined),
  addProject: vi.fn().mockResolvedValue(undefined),
  deleteService: vi.fn().mockResolvedValue(undefined),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  updateService: vi.fn().mockResolvedValue(undefined),
  updateProject: vi.fn().mockResolvedValue(undefined),
  getServices: vi.fn().mockResolvedValue([]),
  getProjects: vi.fn().mockResolvedValue([]),
}));

vi.mock("./db", () => dbMocks);

const anonymousCaller = () =>
  appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
const adminCaller = () =>
  appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
    isAdminPasscode: true,
  });

describe("content procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list service and project records", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const result = await caller.content.list();

    expect(result).toEqual({ products: [], services: [] });
    expect(dbMocks.getServices).toHaveBeenCalledOnce();
    expect(dbMocks.getProjects).toHaveBeenCalledOnce();
  });

  it("rejects anonymous content management", async () => {
    await expect(
      anonymousCaller().content.addService({
        title: "Unauthorized",
        description: "Should not be written.",
        sortOrder: 0,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.addService).not.toHaveBeenCalled();
  });

  it("allows a passcode-authenticated admin to manage content", async () => {
    const caller = adminCaller();

    await caller.content.addService({
      title: "Signal Design",
      description: "A studio capability.",
      imageUrl: "https://signal.example.com",
      liveUrl: "https://signal.example.com",
      githubUrl: "https://github.com/firebox/signal",
      sortOrder: 1,
    });
    await caller.content.updateProject({
      id: 4,
      title: "Terminal",
      client: "R&D",
      description: "A project record.",
      imageUrl: "",
      liveUrl: "https://terminal.example.com",
      githubUrl: "https://github.com/firebox/terminal",
      sortOrder: 2,
    });
    await caller.content.deleteService({ id: 2 });
    await caller.content.deleteProject({ id: 5 });

    expect(dbMocks.addService).toHaveBeenCalledWith({
      title: "Signal Design",
      description: "A studio capability.",
      imageUrl: "https://signal.example.com",
      liveUrl: "https://signal.example.com",
      githubUrl: "https://github.com/firebox/signal",
      sortOrder: 1,
    });
    expect(dbMocks.updateProject).toHaveBeenCalledWith(4, {
      title: "Terminal",
      client: "R&D",
      description: "A project record.",
      imageUrl: "",
      liveUrl: "https://terminal.example.com",
      githubUrl: "https://github.com/firebox/terminal",
      sortOrder: 2,
    });
    expect(dbMocks.deleteService).toHaveBeenCalledWith(2);
    expect(dbMocks.deleteProject).toHaveBeenCalledWith(5);
  });
});
