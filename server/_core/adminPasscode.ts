import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

export const ADMIN_PASSCODE_COOKIE = "firebox_admin_passcode";
export const ADMIN_PASSCODE_MIN_LENGTH = 16;
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type LoginAttemptWindow = { attempts: number; resetsAt: number };
const loginAttempts = new Map<string, LoginAttemptWindow>();

export function isAdminPasscodeConfigured() {
  return ENV.adminPasscode.length >= ADMIN_PASSCODE_MIN_LENGTH;
}

export function verifyAdminPasscode(passcode: string) {
  if (!isAdminPasscodeConfigured()) return false;
  const expected = createHash("sha256").update(ENV.adminPasscode).digest();
  const supplied = createHash("sha256").update(passcode).digest();
  return timingSafeEqual(expected, supplied);
}

export function adminPasscodeRetryAfterMs(ip: string) {
  const attemptWindow = loginAttempts.get(ip);
  if (!attemptWindow) return 0;
  if (Date.now() >= attemptWindow.resetsAt) {
    loginAttempts.delete(ip);
    return 0;
  }
  return attemptWindow.attempts >= MAX_FAILED_ATTEMPTS
    ? attemptWindow.resetsAt - Date.now()
    : 0;
}

export function recordFailedAdminPasscodeAttempt(ip: string) {
  const now = Date.now();
  let attemptWindow = loginAttempts.get(ip);
  if (!attemptWindow || now >= attemptWindow.resetsAt) {
    attemptWindow = { attempts: 0, resetsAt: now + LOGIN_WINDOW_MS };
  }
  attemptWindow.attempts += 1;
  loginAttempts.set(ip, attemptWindow);
}

export function clearAdminPasscodeAttempts(ip: string) {
  loginAttempts.delete(ip);
}

function makeSignature(expiresAt: string, nonce: string) {
  const signingSecret = ENV.cookieSecret || ENV.adminPasscode;
  const passcodeFingerprint = createHash("sha256")
    .update(ENV.adminPasscode)
    .digest("hex");
  return createHmac("sha256", signingSecret)
    .update(
      `firebox-admin-session:v1:${passcodeFingerprint}:${expiresAt}:${nonce}`
    )
    .digest("hex");
}

function createSessionToken() {
  const expiresAt = String(
    Math.floor((Date.now() + ADMIN_SESSION_TTL_MS) / 1000)
  );
  const nonce = randomBytes(16).toString("hex");
  return `${expiresAt}.${nonce}.${makeSignature(expiresAt, nonce)}`;
}

export function hasValidAdminPasscodeSession(req: Request) {
  if (!isAdminPasscodeConfigured()) return false;
  const token = parseCookieHeader(req.headers.cookie ?? "")[
    ADMIN_PASSCODE_COOKIE
  ];
  if (!token) return false;
  const [expiresAt, nonce, signature, extra] = token.split(".");
  if (
    extra !== undefined ||
    !/^\d{10,}$/.test(expiresAt ?? "") ||
    !/^[a-f0-9]{32}$/.test(nonce ?? "") ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  ) {
    return false;
  }

  const expiration = Number(expiresAt) * 1000;
  const now = Date.now();
  if (expiration <= now || expiration > now + ADMIN_SESSION_TTL_MS + 60_000) {
    return false;
  }
  const expected = Buffer.from(makeSignature(expiresAt, nonce), "hex");
  const provided = Buffer.from(signature, "hex");
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

function adminCookieOptions(req: Request) {
  const base = getSessionCookieOptions(req);
  return {
    ...base,
    // SameSite=None is needed for HTTPS previews embedded cross-site; local HTTP
    // development uses Lax because browsers reject None without Secure.
    sameSite: base.secure ? ("none" as const) : ("lax" as const),
  };
}

export function setAdminPasscodeSessionCookie(req: Request, res: Response) {
  if (!isAdminPasscodeConfigured()) {
    throw new Error("Admin passcode is not configured.");
  }
  res.cookie(ADMIN_PASSCODE_COOKIE, createSessionToken(), {
    ...adminCookieOptions(req),
    maxAge: ADMIN_SESSION_TTL_MS,
  });
}

export function clearAdminPasscodeSessionCookie(req: Request, res: Response) {
  res.clearCookie(ADMIN_PASSCODE_COOKIE, adminCookieOptions(req));
}
