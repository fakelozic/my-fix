import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SessionPayload extends JWTPayload {
  user?: {
    id: number;
    username: string;
  };
  expires?: Date;
}

const secretKey = process.env.JWT_SECRET || "super-secret-key-change-me";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 week")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}

export async function login(formData: FormData) {
  // Verify credentials...
  // Create session
  const user = { username: formData.get("username") }; // Simplified
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });

  (await cookies()).set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    const decrypted = await decrypt(session);
    if (!decrypted?.user?.id) return null;

    // Verify user still exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decrypted.user.id as number),
    });

    if (!user) return null;

    return decrypted;
  } catch {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  try {
    const parsed = await decrypt(session);
    if (!parsed?.user?.id) return;

    // Verify user still exists in database during update/refresh
    const user = await db.query.users.findFirst({
        where: eq(users.id, parsed.user.id as number),
    });

    if (!user) {
        // If user is gone, we don't return a modified response with a new cookie
        // The middleware will handle the missing session redirect if needed
        return;
    }

    parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
      name: "session",
      value: await encrypt(parsed),
      httpOnly: true,
      expires: parsed.expires,
    });
    return res;
  } catch {
    return;
  }
}
