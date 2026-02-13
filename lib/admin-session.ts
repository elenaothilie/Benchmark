import "server-only";

import crypto from "node:crypto";

export const ADMIN_COOKIE = "wallboard_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-only-secret-change-me";
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "changeme";
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

export function createSessionToken() {
  const issuedAt = Date.now();
  const payload = String(issuedAt);
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (signPayload(payload) !== sig) return false;

  const issuedAt = Number(payload);
  if (Number.isNaN(issuedAt)) return false;

  const ageSeconds = Math.floor((Date.now() - issuedAt) / 1000);
  return ageSeconds <= SESSION_TTL_SECONDS;
}

export const adminSessionMaxAge = SESSION_TTL_SECONDS;
