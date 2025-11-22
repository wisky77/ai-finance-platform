import { NextResponse } from "next/server";

// Keep this list minimal to avoid regex bloat in matcher
const protectedRoutes = ["/dashboard", "/account", "/transaction"];

// Very small, cookie-only guard to avoid heavy bundles in Edge
export default function middleware(req) {
  const { nextUrl, cookies } = req;

  // Fast path: skip if not a protected route
  const isProtected = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // Supabase sets sb-access-token when the user is authenticated
  // (naming may vary by setup; this is the common default)
  const hasAccessToken = Boolean(cookies.get("sb-access-token")?.value);

  if (!hasAccessToken) {
    const signInUrl = new URL("/sign-in", req.url);
    // Optionally preserve return path
    signInUrl.searchParams.set("redirect", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes only if you want to gate them by cookie, otherwise remove this line
    // "/(api|trpc)(.*)",
  ],
};
