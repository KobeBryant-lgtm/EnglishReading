import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runCrawlTask } from "@/lib/crawlTask";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.crawlTask.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });

    const result = await runCrawlTask(task.sourceName === "全部来源" ? undefined : task.sourceName);

    return NextResponse.json({
      message: "重试完成",
      totalFetched: result.totalFetched,
    });
  } catch {
    return NextResponse.json({ error: "重试失败" }, { status: 500 });
  }
}
