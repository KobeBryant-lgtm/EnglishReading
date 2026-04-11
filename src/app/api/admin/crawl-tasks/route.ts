import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [tasks, total] = await Promise.all([
      prisma.crawlTask.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.crawlTask.count(),
    ]);

    return NextResponse.json({ tasks, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "获取任务列表失败" }, { status: 500 });
  }
}
