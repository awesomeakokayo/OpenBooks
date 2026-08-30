import { auth } from "@/auth";
import { checkRateLimit, getClientIdentifier, getRateLimitForPath } from "@/lib/security/rateLimit";

export default auth(async (req) => {
  const isAuth = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Static assets in /public (images, SVGs, fonts, etc.) must never be
  // redirected to /login or spend a rate-limit budget.
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (isStaticAsset) return;

  // Rate-limit API and public invoice traffic before application handlers run.
  // Sensitive authentication/recovery endpoints use tighter limits.
  const limit = getRateLimitForPath(pathname);
  if (limit) {
    const ip = getClientIdentifier(req);
    const identity = req.auth?.user?.id ? `user:${req.auth.user.id}` : `ip:${ip}`;
    const result = await checkRateLimit(`${identity}:${pathname}`, limit);

    if (!result.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": String(Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          "RateLimit-Remaining": "0",
          "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      });
    }
  }

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/auth-error",
    "/api/auth",
    "/api/register",
    "/api/verify-email",
    "/api/password-reset",
    "/invoice",
    "/api/invoice",
  ];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // The marketing site is an entrance, not the authenticated home. Once a
  // user has an active session, returning to `/` should take them back to the
  // workspace instead of asking them to start the journey again.
  if (isAuth && pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  // An authenticated user who visits sign-in should continue to their workspace.
  if (isAuth && pathname === "/login") {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (!isPublic && !isAuth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
