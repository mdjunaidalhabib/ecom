import { NextResponse } from "next/server";

/**
 * Base64URL decode (Edge safe)
 */
function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

/**
 * Check JWT expiration (Edge compatible)
 */
function isJwtExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = base64UrlDecode(parts[1]);
    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

/**
 * NEXT.JS PROXY (NEW SYSTEM)
 */
export function proxy(req) {
  const token = req.cookies.get("admin_token")?.value || "";
  const { pathname, origin } = req.nextUrl;

  // =============================
  // LOGIN PAGE
  // =============================
  if (pathname === "/login") {
    if (token && !isJwtExpired(token)) {
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    }
    return NextResponse.next();
  }

  // =============================
  // PROTECT ADMIN ROUTES
  // =============================
  if (pathname.startsWith("/admin")) {
    if (!token || isJwtExpired(token)) {
      const res = NextResponse.redirect(`${origin}/login`);
      res.cookies.set("admin_token", "", {
        path: "/",
        expires: new Date(0),
        sameSite: "none",
        secure: true,
      });
      return res;
    }
  }

  return NextResponse.next();
}

/**
 * APPLY PROXY TO ROUTES
 */
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
