import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getServices: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Signal Product",
      description: "A product built for high-voltage digital work.",
    },
  ]),
  getProjects: vi.fn().mockResolvedValue([
    {
      id: 2,
      title: "Studio Service",
      description: "A service for building interactive worlds.",
    },
  ]),
  getBlogPosts: vi.fn().mockResolvedValue([
    {
      id: 3,
      title: "Signal Notes",
      excerpt: "Field notes from the Firebox team.",
      slug: "signal-notes",
    },
  ]),
  getFaqs: vi.fn().mockResolvedValue([
    {
      id: 4,
      question: "What is the signal?",
      answer: "The signal is the work we make together.",
    },
  ]),
  getDirectoryItems: vi.fn().mockResolvedValue([
    {
      id: 5,
      section: "docs",
      title: "Setup Guide",
      description: "Start here.",
      href: null,
    },
  ]),
  getTeamMembers: vi.fn().mockResolvedValue([
    {
      id: 6,
      name: "Signal Operator",
      role: "Creative Director",
      bio: "Builds the transmission.",
    },
  ]),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

describe("search procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns published app content and valid in-app destinations", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as never,
      res: {} as never,
    });

    const result = await caller.search.list();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Signal Product",
          category: "PRODUCT",
          href: "/products",
        }),
        expect.objectContaining({
          title: "Studio Service",
          category: "SERVICE",
          href: "/services",
        }),
        expect.objectContaining({
          title: "Signal Notes",
          category: "BLOG",
          href: "/blog/signal-notes",
        }),
        expect.objectContaining({
          title: "What is the signal?",
          category: "FAQ",
          href: "/support#faq",
        }),
        expect.objectContaining({
          title: "Setup Guide",
          category: "DOCS",
          href: "/docs/5",
        }),
        expect.objectContaining({
          title: "Signal Operator",
          category: "TEAM",
          href: "/team",
        }),
      ])
    );
    expect(result.every(item => item.category !== "PAGE")).toBe(true);
    expect(dbMocks.getBlogPosts).toHaveBeenCalledWith();
    expect(dbMocks.getDirectoryItems).toHaveBeenCalledWith();
    expect(dbMocks.getTeamMembers).toHaveBeenCalledWith();
  });
});
