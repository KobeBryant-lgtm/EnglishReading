import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "readeng-v2-secret-key-change-in-production";

const PUBLIC_API_PATHS = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/captcha",
  "/api/articles",
  "/api/daily",
  "/api/dictionary",
  "/api/translate",
  "/api/sources",
  "/api/vocabulary",
  "/api/crawl",
  "/api/cron/crawl",
];

const ADMIN_API_PREFIX = "/api/admin";

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PATHS.some(
    (p) => pathname === p || (pathname.startsWith(p + "/") && !pathname.startsWith("/api/articles/daily-recommend"))
  );
}

async function verifyTokenEdge(token: string): Promise<{ userId: string; username: string; role: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureInput = `${parts[0]}.${parts[1]}`;
    const signatureBytes = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(signatureInput)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));

    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (isPublicApiPath(pathname)) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const payload = await verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: "登录已过期，请重新登录" }, { status: 401 });
    }

    if (pathname.startsWith(ADMIN_API_PREFIX) && payload.role !== "admin") {
      return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-username", payload.username);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
