import { NextResponse } from "next/server";

// Keep these lists minimal to avoid regex bloat in matcher
const protectedRoutes = ["/dashboard", "/account", "/transaction"];
const authRoutes = ["/sign-in", "/sign-up"];

// Very small, cookie-only guard to avoid heavy bundles in Edge
import { createServerClient } from "@supabase/ssr";

export default async function middleware(req) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Refresh Supabase session and get user on each request
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If already authenticated and on an auth route, redirect to dashboard (or requested redirect)
  if (isAuthRoute && user) {
    const redirectParam = nextUrl.searchParams.get("redirect");
    const dest = redirectParam || "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Gate protected routes if not authenticated
  if (isProtected && !user) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", pathname + nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // If you want to also guard API routes by cookie, uncomment:
    // "/(api|trpc)(.*)",
  ],
};
