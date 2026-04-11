import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const source = searchParams.get("source");

    const where: any = { userId };
    if (source) {
      where.article = { source };
    }

    const [favorites, total] = await Promise.all([
      prisma.userFavorite.findMany({
        where,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              source: true,
              difficulty: true,
              wordCount: true,
              imageUrl: true,
              summary: true,
              publishedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.userFavorite.count({ where }),
    ]);

    return NextResponse.json({
      favorites,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "获取收藏列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: "缺少文章ID" }, { status: 400 });
    }

    const existing = await prisma.userFavorite.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });

    if (existing) {
      return NextResponse.json({ error: "已收藏" }, { status: 409 });
    }

    const favorite = await prisma.userFavorite.create({
      data: { userId, articleId },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch {
    return NextResponse.json({ error: "收藏失败" }, { status: 500 });
  }
}
