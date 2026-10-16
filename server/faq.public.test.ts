import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getFaqs: vi.fn().mockResolvedValue([]),
  addFaq: vi.fn().mockResolvedValue(undefined),
  updateFaq: vi.fn().mockResolvedValue(undefined),
  deleteFaq: vi.fn().mockResolvedValue(undefined),
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

describe("faq procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list FAQ records", async () => {
    const result = await anonymousCaller().faq.list();
    expect(result).toEqual([]);
    expect(dbMocks.getFaqs).toHaveBeenCalledOnce();
  });

  it("rejects anonymous FAQ management", async () => {
    await expect(
      anonymousCaller().faq.add({
        question: "Blocked?",
        answer: "Blocked.",
        sortOrder: 0,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.addFaq).not.toHaveBeenCalled();
  });

  it("allows a passcode-authenticated admin to manage FAQs", async () => {
    const caller = adminCaller();

    await caller.faq.add({
      question: "What does Firebox build?",
      answer: "We build digital worlds, identities, and interactive experiences.",
      sortOrder: 1,
    });
    await caller.faq.update({
      id: 4,
      question: "What does Firebox create?",
      answer: "We create high-voltage digital experiences.",
      sortOrder: 2,
    });
    await caller.faq.delete({ id: 4 });

    expect(dbMocks.addFaq).toHaveBeenCalledWith({
      question: "What does Firebox build?",
      answer: "We build digital worlds, identities, and interactive experiences.",
      sortOrder: 1,
    });
    expect(dbMocks.updateFaq).toHaveBeenCalledWith(4, {
      question: "What does Firebox create?",
      answer: "We create high-voltage digital experiences.",
      sortOrder: 2,
    });
    expect(dbMocks.deleteFaq).toHaveBeenCalledWith(4);
  });
});
