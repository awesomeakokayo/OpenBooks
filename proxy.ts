import { auth } from "@/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Static assets in /public (images, SVGs, fonts, etc.) must never be
  // redirected to /login by the application auth layer.
  const isStaticAsset = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (isStaticAsset) return;

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

  if (!isPublic && !isAuth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
