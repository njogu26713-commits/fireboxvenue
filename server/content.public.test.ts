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

describe("content procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list service and project records", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const result = await caller.content.list();

    expect(result).toEqual({ services: [], projects: [] });
    expect(dbMocks.getServices).toHaveBeenCalledOnce();
    expect(dbMocks.getProjects).toHaveBeenCalledOnce();
  });

  it("allows the open prototype admin flow to create and update content", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    await caller.content.addService({ title: "Signal Design", description: "A studio capability.", sortOrder: 1 });
    await caller.content.updateProject({ id: 4, title: "Terminal", client: "R&D", description: "A project record.", imageUrl: "", sortOrder: 2 });
    await caller.content.deleteService({ id: 2 });
    await caller.content.deleteProject({ id: 5 });

    expect(dbMocks.addService).toHaveBeenCalledWith({ title: "Signal Design", description: "A studio capability.", sortOrder: 1 });
    expect(dbMocks.updateProject).toHaveBeenCalledWith(4, { title: "Terminal", client: "R&D", description: "A project record.", imageUrl: "", sortOrder: 2 });
    expect(dbMocks.deleteService).toHaveBeenCalledWith(2);
    expect(dbMocks.deleteProject).toHaveBeenCalledWith(5);
  });
});
