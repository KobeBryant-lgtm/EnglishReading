import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await prisma.crawlTask.findUnique({ where: { id } });
    if (!task) return NextResponse.json({ error: "任务不存在" }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "获取日志失败" }, { status: 500 });
  }
}
