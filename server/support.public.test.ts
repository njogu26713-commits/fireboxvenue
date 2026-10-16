import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getSupportChannels: vi.fn().mockResolvedValue([]),
  getSupportMessages: vi.fn().mockResolvedValue([]),
  getQuickHelp: vi.fn().mockResolvedValue([]),
  getSupportCategories: vi.fn().mockResolvedValue([]),
  addQuickHelp: vi.fn().mockResolvedValue(undefined),
  updateQuickHelp: vi.fn().mockResolvedValue(undefined),
  deleteQuickHelp: vi.fn().mockResolvedValue(undefined),
  addSupportCategory: vi.fn().mockResolvedValue(undefined),
  updateSupportCategory: vi.fn().mockResolvedValue(undefined),
  deleteSupportCategory: vi.fn().mockResolvedValue(undefined),
  upsertSupportChannel: vi.fn().mockResolvedValue(undefined),
  addSupportMessage: vi.fn().mockResolvedValue(undefined),
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

describe("support procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows public readers to list configured channels", async () => {
    const result = await anonymousCaller().support.channels();
    expect(result).toEqual([]);
    expect(dbMocks.getSupportChannels).toHaveBeenCalledOnce();
  });

  it("rejects anonymous inbox reads and channel updates", async () => {
    const caller = anonymousCaller();
    await expect(caller.support.messages()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.support.saveChannel({
        platform: "telegram",
        label: "Telegram Support",
        value: "https://t.me/firebox",
        sortOrder: 2,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getSupportMessages).not.toHaveBeenCalled();
    expect(dbMocks.upsertSupportChannel).not.toHaveBeenCalled();
  });

  it("lets the public submit messages and passcode admins update channels", async () => {
    await adminCaller().support.saveChannel({
      platform: "telegram",
      label: "Telegram Support",
      value: "https://t.me/firebox",
      sortOrder: 2,
    });
    await anonymousCaller().support.submitMessage({
      name: "Ari",
      email: "ari@example.com",
      topic: "Projects",
      message: "I need help with a project.",
    });

    expect(dbMocks.upsertSupportChannel).toHaveBeenCalledWith({
      platform: "telegram",
      label: "Telegram Support",
      value: "https://t.me/firebox",
      sortOrder: 2,
    });
    expect(dbMocks.addSupportMessage).toHaveBeenCalledWith({
      name: "Ari",
      email: "ari@example.com",
      topic: "Projects",
      message: "I need help with a project.",
    });
  });

  it("keeps public support content readable and requires passcode for changes", async () => {
    const caller = anonymousCaller();
    const admin = adminCaller();

    expect(await caller.supportContent.quickHelp()).toEqual([]);
    expect(await caller.supportContent.categories()).toEqual([]);
    await admin.supportContent.addQuickHelp({
      title: "Reset access",
      description: "Recover your account.",
      href: "https://example.com/help",
      sortOrder: 1,
    });
    await admin.supportContent.addCategory({
      title: "Billing",
      description: "Invoices and payments.",
      sortOrder: 2,
    });

    expect(dbMocks.addQuickHelp).toHaveBeenCalledWith({
      title: "Reset access",
      description: "Recover your account.",
      href: "https://example.com/help",
      sortOrder: 1,
    });
    expect(dbMocks.addSupportCategory).toHaveBeenCalledWith({
      title: "Billing",
      description: "Invoices and payments.",
      sortOrder: 2,
    });
  });
});
