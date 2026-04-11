import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";

export async function GET() {
  const cronSecret = process.env.CRON_SECRET;
  try {
    const result = await runCrawlTask();
    return NextResponse.json({
      message: "定时抓取完成",
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch (e) {
    return NextResponse.json({ error: "抓取失败" }, { status: 500 });
  }
}
