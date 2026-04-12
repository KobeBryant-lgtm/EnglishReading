import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";

export async function GET(request: Request) {
  try {
    console.log("[Cron] 开始执行定时抓取...");
    const result = await runCrawlTask();
    console.log(`[Cron] 抓取完成: 新增 ${result.totalFetched} 篇, 错误: ${result.errors.length}`);
    return NextResponse.json({
      message: "定时抓取完成",
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch (e) {
    console.error("[Cron] 抓取失败:", e);
    return NextResponse.json({ error: "抓取失败", detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
