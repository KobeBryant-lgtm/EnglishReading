import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: { nameCn: "asc" },
    });

    const sourcesWithCount = await Promise.all(
      sources.map(async (s) => {
        const articleCount = await prisma.article.count({
          where: { source: s.name, isDeleted: false },
        });
        return { ...s, articleCount };
      })
    );

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
