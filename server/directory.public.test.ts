import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getDirectoryItems: vi.fn().mockResolvedValue([]),
  addDirectoryItem: vi.fn().mockResolvedValue(undefined),
  updateDirectoryItem: vi.fn().mockResolvedValue(undefined),
  deleteDirectoryItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", () => dbMocks);

describe("directory procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list a directory section", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
    const result = await caller.directory.list({ section: "products" });

    expect(result).toEqual([]);
    expect(dbMocks.getDirectoryItems).toHaveBeenCalledWith("products");
  });

  it("allows the open prototype admin flow to manage directory entries", async () => {
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });

    await caller.directory.add({ section: "developers", title: "SDK", description: "Developer tools.", href: "", sortOrder: 1 });
    await caller.directory.update({ id: 7, section: "docs", title: "API Reference", description: "Technical reference.", href: "https://docs.example.com", sortOrder: 2 });
    await caller.directory.delete({ id: 7 });

    expect(dbMocks.addDirectoryItem).toHaveBeenCalledWith({ section: "developers", title: "SDK", description: "Developer tools.", href: null, sortOrder: 1 });
    expect(dbMocks.updateDirectoryItem).toHaveBeenCalledWith(7, { section: "docs", title: "API Reference", description: "Technical reference.", href: "https://docs.example.com", sortOrder: 2 });
    expect(dbMocks.deleteDirectoryItem).toHaveBeenCalledWith(7);
  });
});
