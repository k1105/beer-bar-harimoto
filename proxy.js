import { NextResponse } from "next/server";

export default function proxy(request) {
  const authCookie = request.cookies.get("auth");

  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /api/auth (login API)
     * - /_next (Next.js internals)
     * - /favicon.ico, /icons, etc.
     */
    "/((?!login|api/auth|_next|favicon\\.ico).*)",
  ],
};
