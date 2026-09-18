import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "crawl-manual",
    identifier: "global",
    limit: 1,
    windowMs: 5 * 60 * 1000,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  try {
    const result = await runCrawlTask(undefined, "manual");

    return NextResponse.json({
      success: true,
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: "爬取失败，请稍后重试" },
      { status: 500 }
    );
  }
}
