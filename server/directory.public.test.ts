import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getDirectoryItems: vi.fn().mockResolvedValue([]),
  addDirectoryItem: vi.fn().mockResolvedValue(undefined),
  updateDirectoryItem: vi.fn().mockResolvedValue(undefined),
  deleteDirectoryItem: vi.fn().mockResolvedValue(undefined),
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

describe("directory procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list a directory section", async () => {
    const result = await anonymousCaller().directory.list({ section: "products" });
    expect(result).toEqual([]);
    expect(dbMocks.getDirectoryItems).toHaveBeenCalledWith("products");
  });

  it("rejects anonymous directory changes", async () => {
    await expect(
      anonymousCaller().directory.add({
        section: "developers",
        title: "Blocked",
        description: "Blocked.",
        href: "",
        sortOrder: 0,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.addDirectoryItem).not.toHaveBeenCalled();
  });

  it("allows a passcode-authenticated admin to manage directory entries", async () => {
    const caller = adminCaller();

    await caller.directory.add({
      section: "developers",
      title: "SDK",
      description: "Developer tools.",
      href: "",
      sortOrder: 1,
    });
    await caller.directory.update({
      id: 7,
      section: "docs",
      title: "API Reference",
      description: "Technical reference.",
      href: "https://docs.example.com",
      sortOrder: 2,
    });
    await caller.directory.delete({ id: 7 });

    expect(dbMocks.addDirectoryItem).toHaveBeenCalledWith({
      section: "developers",
      title: "SDK",
      description: "Developer tools.",
      href: null,
      sortOrder: 1,
    });
    expect(dbMocks.updateDirectoryItem).toHaveBeenCalledWith(7, {
      section: "docs",
      title: "API Reference",
      description: "Technical reference.",
      href: "https://docs.example.com",
      sortOrder: 2,
    });
    expect(dbMocks.deleteDirectoryItem).toHaveBeenCalledWith(7);
  });
});
