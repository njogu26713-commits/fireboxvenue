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

const anonymousCaller = () =>
  appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
const adminCaller = () =>
  appRouter.createCaller({
    user: null,
    req: {} as never,
    res: {} as never,
    isAdminPasscode: true,
  });

describe("blog procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists published posts and resolves an article by slug", async () => {
    const caller = anonymousCaller();
    await caller.blog.list();
    await caller.blog.getBySlug({ slug: "signal-to-system" });

    expect(dbMocks.getBlogPosts).toHaveBeenCalledWith();
    expect(dbMocks.getBlogPostBySlug).toHaveBeenCalledWith("signal-to-system");
  });

  it("rejects anonymous access to drafts and blog management", async () => {
    const caller = anonymousCaller();
    await expect(caller.blog.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.blog.add({
        title: "Blocked",
        slug: "blocked",
        excerpt: "Blocked.",
        category: "article",
        content: "Blocked.",
        imageUrl: "",
        videoUrl: "",
        author: "Firebox Studios",
        status: "draft",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getBlogPosts).not.toHaveBeenCalled();
    expect(dbMocks.addBlogPost).not.toHaveBeenCalled();
  });

  it("creates, updates, and deletes a real blog post", async () => {
    const caller = adminCaller();
    const input = {
      title: "Signal to system",
      slug: "signal-to-system",
      excerpt: "A short summary.",
      category: "tutorial" as const,
      content: "The full article.",
      imageUrl: "",
      videoUrl: "https://youtu.be/tutorial123",
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
        videoUrl: input.videoUrl,
        publishedAt: expect.any(Date),
      })
    );
    expect(dbMocks.updateBlogPost).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        status: "draft",
        imageUrl: null,
        videoUrl: input.videoUrl,
        publishedAt: null,
      })
    );
    expect(dbMocks.deleteBlogPost).toHaveBeenCalledWith(7);
  });
});
