import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/logger";

interface RateLimitOptions {
  scope: string;
  limit: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent") || "unknown";
  const raw = forwardedFor || realIp || userAgent;
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export async function consumeRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const identifier = options.identifier || getClientIdentifier(request);
  const key = createHash("sha256")
    .update(`${options.scope}:${identifier}`)
    .digest("hex");
  const expiresAt = new Date(Date.now() + options.windowMs);

  try {
    const rows = await prisma.$queryRaw<Array<{ count: number; expiresAt: Date }>>(Prisma.sql`
      INSERT INTO "RateLimitBucket" ("key", "count", "windowStart", "expiresAt", "updatedAt")
      VALUES (${key}, 1, NOW(), ${expiresAt}, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "windowStart" = CASE
          WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN NOW()
          ELSE "RateLimitBucket"."windowStart"
        END,
        "expiresAt" = CASE
          WHEN "RateLimitBucket"."expiresAt" <= NOW() THEN ${expiresAt}
          ELSE "RateLimitBucket"."expiresAt"
        END,
        "updatedAt" = NOW()
      RETURNING "count", "expiresAt"
    `);

    const bucket = rows[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(bucket.expiresAt).getTime() - Date.now()) / 1000)
    );

    return {
      allowed: bucket.count <= options.limit,
      remaining: Math.max(0, options.limit - bucket.count),
      retryAfterSeconds,
    };
  } catch (error) {
    // Availability wins for ordinary reads if the limiter table is temporarily
    // unavailable. Sensitive crawl routes also have explicit authorization.
    logEvent("error", "rate_limit_failed", {
      scope: options.scope,
      error: error instanceof Error ? error.message : String(error),
    });
    return { allowed: true, remaining: 0, retryAfterSeconds: 1 };
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { error: "请求过于频繁，请稍后再试" },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    }
  );
}
