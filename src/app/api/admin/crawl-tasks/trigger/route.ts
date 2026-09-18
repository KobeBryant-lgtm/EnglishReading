import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "crawl-admin",
    identifier: "global",
    limit: 1,
    windowMs: 5 * 60 * 1000,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const { source } = await request.json().catch(() => ({ source: undefined }));
    const result = await runCrawlTask(source || undefined, "manual");

    return NextResponse.json({
      message: "抓取完成",
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "触发抓取失败" },
      { status: 500 }
    );
  }
}
