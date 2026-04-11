import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

    const updated = await prisma.article.update({
      where: { id },
      data: { isDailyRecommend: !article.isDailyRecommend },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
