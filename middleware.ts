import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Update session on every request if it exists
  const response = await updateSession(request);
  if (response) return response;

  const currentUser = request.cookies.get("session")?.value;

  if (currentUser && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!currentUser && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\.png$).*)"],
};

