import { cookies } from "next/headers";
import crypto from "crypto";

export interface SessionUser {
  id: string;
  username: string;
  role: "ADMIN" | "USER";
}

interface SessionPayload extends SessionUser {
  exp: number; // timestamp in seconds
}

const COOKIE_NAME = "tuyul_tracker_session";
const SESSION_MAX_AGE_DAYS = 30;

function getSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "tuyul-tracker-fallback-session-secret-key-32-chars-long"
  );
}

/**
 * Sign payload to create JWT-like token (header.payload.signature)
 */
export function signToken(payload: SessionPayload): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verify signed token and return payload if valid
 */
export function verifyToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(data)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates session and sets HttpOnly cookie
 */
export async function createSessionCookie(user: SessionUser) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_DAYS * 24 * 60 * 60;
  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role,
    exp,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

/**
 * Deletes the session cookie
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Gets currently logged in user session from cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.id,
    username: payload.username,
    role: payload.role,
  };
}
