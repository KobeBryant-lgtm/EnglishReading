import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { nameCn: "asc" },
    });

    const articleCounts = await prisma.article.groupBy({
      by: ["source"],
      where: { isDeleted: false },
      _count: { _all: true },
    });
    const countBySource = new Map(
      articleCounts.map((item) => [item.source, item._count._all])
    );
    const sourcesWithCount = sources.map((source) => ({
      ...source,
      articleCount: countBySource.get(source.name) || 0,
    }));

    return NextResponse.json(sourcesWithCount);
  } catch {
    return NextResponse.json({ error: "获取来源列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, nameCn, category, feedUrl, color, description } = await request.json();
    if (!name || !nameCn) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }

    const source = await prisma.source.create({
      data: { name, nameCn, category, feedUrl, color, description },
    });

    return NextResponse.json(source, { status: 201 });
  } catch {
    return NextResponse.json({ error: "新增来源失败" }, { status: 500 });
  }
}
