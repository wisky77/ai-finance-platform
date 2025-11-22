import { NextResponse } from "next/server";

// Keep these lists minimal to avoid regex bloat in matcher
const protectedRoutes = ["/dashboard", "/account", "/transaction"];
const authRoutes = ["/sign-in", "/sign-up"];

// Very small, cookie-only guard to avoid heavy bundles in Edge
export default function middleware(req) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;

  // Supabase sets cookies when authenticated. Check common names.
  const hasAccessToken = Boolean(
    cookies.get("sb-access-token")?.value ||
    cookies.get("sb:token")?.value ||
    cookies.get("sb-refresh-token")?.value
  );

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If already authenticated and on an auth route, redirect to dashboard (or requested redirect)
  if (isAuthRoute && hasAccessToken) {
    const redirectParam = nextUrl.searchParams.get("redirect");
    const dest = redirectParam || "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Gate protected routes if not authenticated
  if (isProtected && !hasAccessToken) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // If you want to also guard API routes by cookie, uncomment:
    // "/(api|trpc)(.*)",
  ],
};
