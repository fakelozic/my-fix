"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function loginAction(prevState: unknown, formData: FormData) {
  const rawUsername = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!rawUsername || !password) {
    return { error: "Username and password are required." };
  }

  const username = rawUsername.toLowerCase();

  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  // Simplified registration: If user doesn't exist, create one.
  // In a real app, you'd separate login and register.
  let authenticatedUser = user;

  if (!user) {
     // Register new user
     const hashedPassword = await bcrypt.hash(password, 10);
     const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword
     }).returning();
     authenticatedUser = newUser;
  } else {
     // Verify password
     const isValid = await bcrypt.compare(password, user.password);
     if (!isValid) {
        return { error: "Invalid credentials." };
     }
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ user: { id: authenticatedUser!.id, username: authenticatedUser!.username }, expires });

  (await cookies()).set("session", session, { expires, httpOnly: true });

  redirect("/");
}

export async function logoutAction() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/login");
}
