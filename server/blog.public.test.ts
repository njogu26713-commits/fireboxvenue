import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  addBlogPost: vi.fn().mockResolvedValue(undefined),
  updateBlogPost: vi.fn().mockResolvedValue(undefined),
  deleteBlogPost: vi.fn().mockResolvedValue(undefined),
  getBlogPosts: vi.fn().mockResolvedValue([]),
  getBlogPostBySlug: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", () => dbMocks);

describe("blog procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists published posts and resolves an article by slug", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    await caller.blog.list();
    await caller.blog.getBySlug({ slug: "signal-to-system" });

    expect(dbMocks.getBlogPosts).toHaveBeenCalledWith();
    expect(dbMocks.getBlogPostBySlug).toHaveBeenCalledWith("signal-to-system");
  });

  it("creates, updates, and deletes a real blog post", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });
    const input = {
      title: "Signal to system",
      slug: "signal-to-system",
      excerpt: "A short summary.",
      category: "tutorial" as const,
      content: "The full article.",
      imageUrl: "",
      author: "Firebox Studios",
      status: "published" as const,
    };

    await caller.blog.add(input);
    await caller.blog.update({ ...input, id: 7, status: "draft" });
    await caller.blog.delete({ id: 7 });

    expect(dbMocks.addBlogPost).toHaveBeenCalledWith(
      expect.objectContaining({
        title: input.title,
        category: "tutorial",
        imageUrl: null,
        publishedAt: expect.any(Date),
      })
    );
    expect(dbMocks.updateBlogPost).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        status: "draft",
        imageUrl: null,
        publishedAt: null,
      })
    );
    expect(dbMocks.deleteBlogPost).toHaveBeenCalledWith(7);
  });
});
