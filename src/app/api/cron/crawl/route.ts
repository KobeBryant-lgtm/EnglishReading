import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";
import { logEvent } from "@/lib/logger";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || cronSecret.length < 24 || authHeader !== `Bearer ${cronSecret}`) {
    logEvent("warn", "cron_unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    logEvent("info", "cron_crawl_started");
    const result = await runCrawlTask();
    logEvent("info", "cron_crawl_completed", {
      totalFetched: result.totalFetched,
      errorCount: result.errors.length,
    });
    return NextResponse.json({
      message: "定时抓取完成",
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch (e) {
    logEvent("error", "cron_crawl_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "抓取失败", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
