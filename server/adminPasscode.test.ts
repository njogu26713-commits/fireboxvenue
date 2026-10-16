import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import { appRouter } from "./routers";
import { ENV } from "./_core/env";
import {
  ADMIN_PASSCODE_COOKIE,
  hasValidAdminPasscodeSession,
  verifyAdminPasscode,
} from "./_core/adminPasscode";
import { adminProcedure, router } from "./_core/trpc";

const TEST_PASSCODE = "test-only-admin-passcode-2026";
const originalPasscode = ENV.adminPasscode;
const originalCookieSecret = ENV.cookieSecret;

function fakeRequest(ip = "198.51.100.10"): Request {
  return {
    headers: {},
    protocol: "https",
    ip,
    socket: { remoteAddress: ip },
  } as unknown as Request;
}

function fakeResponse() {
  let cookieName = "";
  let cookieValue = "";
  let cookieOptions: Record<string, unknown> = {};
  const response = {
    cookie: (name: string, value: string, options: Record<string, unknown>) => {
      cookieName = name;
      cookieValue = value;
      cookieOptions = options;
    },
    clearCookie: vi.fn(),
  };
  return {
    response,
    get cookieName() {
      return cookieName;
    },
    get cookieValue() {
      return cookieValue;
    },
    get cookieOptions() {
      return cookieOptions;
    },
  };
}

function createCaller(ip?: string) {
  const req = fakeRequest(ip);
  const res = fakeResponse();
  const caller = appRouter.createCaller({
    user: null,
    req: req as never,
    res: res.response as never,
    isAdminPasscode: false,
  });
  return { caller, req, res };
}

describe("admin passcode authentication", () => {
  afterEach(() => {
    ENV.adminPasscode = originalPasscode;
    ENV.cookieSecret = originalCookieSecret;
  });

  it("verifies the configured secret without accepting a wrong passcode", () => {
    ENV.adminPasscode = TEST_PASSCODE;
    expect(verifyAdminPasscode(TEST_PASSCODE)).toBe(true);
    expect(verifyAdminPasscode("incorrect-passcode")).toBe(false);
  });

  it("keeps login disabled for a short passcode and reports only configuration status", async () => {
    ENV.adminPasscode = "too-short";
    const { caller } = createCaller("198.51.100.11");
    await expect(caller.auth.adminPasscodeStatus()).resolves.toEqual({
      configured: false,
      isAdmin: false,
      passcodeAuthenticated: false,
      minPasscodeLength: 16,
    });
  });

  it("issues a secure HTTP-only cookie and grants the admin procedure", async () => {
    ENV.adminPasscode = TEST_PASSCODE;
    ENV.cookieSecret = "test-cookie-signing-secret-that-is-long-enough";
    const { caller, req, res } = createCaller("198.51.100.20");

    await expect(
      caller.auth.adminPasscodeLogin({ passcode: TEST_PASSCODE })
    ).resolves.toEqual({ success: true });

    expect(res.cookieName).toBe(ADMIN_PASSCODE_COOKIE);
    expect(res.cookieOptions).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 12 * 60 * 60 * 1000,
    });

    req.headers.cookie = `${res.cookieName}=${res.cookieValue}`;
    expect(hasValidAdminPasscodeSession(req)).toBe(true);

    const adminGate = router({
      whoami: adminProcedure.query(({ ctx }) => ctx.user.role),
    });
    const gatedCaller = adminGate.createCaller({
      user: null,
      req: req as never,
      res: res.response as never,
      isAdminPasscode: hasValidAdminPasscodeSession(req),
    });
    await expect(gatedCaller.whoami()).resolves.toBe("admin");
  });

  it("requires the passcode even when the account role is admin", async () => {
    const adminGate = router({
      whoami: adminProcedure.query(({ ctx }) => ctx.user.role),
    });
    const caller = adminGate.createCaller({
      user: {
        id: 1,
        openId: "oauth-admin",
        name: "OAuth Admin",
        email: "admin@example.test",
        loginMethod: "oauth",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: fakeRequest() as never,
      res: fakeResponse().response as never,
      isAdminPasscode: false,
    });

    await expect(caller.whoami()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not grant access for an incorrect passcode and rate-limits repeated failures", async () => {
    ENV.adminPasscode = TEST_PASSCODE;
    const ip = "198.51.100.31";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { caller } = createCaller(ip);
      await expect(
        caller.auth.adminPasscodeLogin({ passcode: "wrong-passcode" })
      ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }

    const { caller } = createCaller(ip);
    await expect(
      caller.auth.adminPasscodeLogin({ passcode: TEST_PASSCODE })
    ).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("rejects old sessions after the configured passcode changes", async () => {
    ENV.adminPasscode = TEST_PASSCODE;
    const { caller, req, res } = createCaller("198.51.100.44");
    await caller.auth.adminPasscodeLogin({ passcode: TEST_PASSCODE });
    req.headers.cookie = `${res.cookieName}=${res.cookieValue}`;
    expect(hasValidAdminPasscodeSession(req)).toBe(true);

    ENV.adminPasscode = "a-different-strong-admin-passcode";
    expect(hasValidAdminPasscodeSession(req)).toBe(false);
  });

  it("clears the passcode session cookie on sign-out", async () => {
    const { caller, res } = createCaller("198.51.100.55");
    await caller.auth.adminPasscodeLogout();
    expect(res.response.clearCookie).toHaveBeenCalledWith(
      ADMIN_PASSCODE_COOKIE,
      expect.objectContaining({ httpOnly: true, path: "/" })
    );
  });
});
