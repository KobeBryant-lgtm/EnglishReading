import { NextResponse } from "next/server";
import { runCrawlTask } from "@/lib/crawlTask";

export async function POST(request: Request) {
  try {
    const { source } = await request.json();
    const result = await runCrawlTask(source || undefined);

    return NextResponse.json({
      message: "抓取完成",
      totalFetched: result.totalFetched,
      errors: result.errors,
    });
  } catch {
    return NextResponse.json({ error: "触发抓取失败" }, { status: 500 });
  }
}
