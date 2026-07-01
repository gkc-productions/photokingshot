import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "photokingshot_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET is required for PhotoKingShot admin session signing.");
  }

  return secret;
}

function signAdminSession(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createAdminSessionCookieValue() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `v1:${issuedAt}`;
  return `${payload}.${signAdminSession(payload)}`;
}

function isSignedAdminSessionValid(value: string) {
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return false;

  const [version, issuedAtValue, extraPayload] = payload.split(":");
  if (version !== "v1" || !issuedAtValue || extraPayload) return false;

  const issuedAt = Number(issuedAtValue);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(issuedAt) || issuedAt > now + 60 || now - issuedAt > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const expected = signAdminSession(payload);
  const valueBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return Boolean(process.env.ADMIN_PASSWORD && token && isSignedAdminSessionValid(token));
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminSession(password: string) {
  const store = await cookies();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    throw new Error("Cannot create PhotoKingShot admin session for invalid credentials.");
  }

  store.set(COOKIE_NAME, createAdminSessionCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
