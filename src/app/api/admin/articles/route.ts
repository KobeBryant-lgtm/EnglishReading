import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const source = searchParams.get("source");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = { isDeleted: false };
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (source) where.source = source;
    if (difficulty) where.difficulty = difficulty;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { crawledAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          source: true,
          difficulty: true,
          wordCount: true,
          viewCount: true,
          isDailyRecommend: true,
          publishedAt: true,
          crawledAt: true,
          _count: { select: { favorites: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles: articles.map((a) => ({ ...a, favoriteCount: a._count.favorites })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "获取文章列表失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, summary, difficulty, isDailyRecommend } = await request.json();
    if (!id) return NextResponse.json({ error: "缺少文章ID" }, { status: 400 });

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(difficulty !== undefined && { difficulty }),
        ...(isDailyRecommend !== undefined && { isDailyRecommend }),
      },
    });

    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "更新文章失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "缺少文章ID" }, { status: 400 });

    await prisma.article.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
