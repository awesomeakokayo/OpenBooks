import { auth } from "@/auth";

export default auth((req) => {
  const isAuth = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/webhooks", "/invoice"];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!isPublic && !isAuth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
