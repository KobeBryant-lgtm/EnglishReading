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

    const [history, total] = await Promise.all([
      prisma.readingHistory.findMany({
        where: { userId },
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
            },
          },
        },
        orderBy: { lastReadAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.readingHistory.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "获取阅读历史失败" }, { status: 500 });
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

    const existing = await prisma.readingHistory.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });

    if (existing) {
      await prisma.readingHistory.update({
        where: { id: existing.id },
        data: { lastReadAt: new Date() },
      });
    } else {
      await prisma.readingHistory.create({
        data: { userId, articleId },
      });
    }

    return NextResponse.json({ message: "记录成功" });
  } catch {
    return NextResponse.json({ error: "记录阅读历史失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.readingHistory.deleteMany({
        where: { id, userId },
      });
    } else {
      await prisma.readingHistory.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ message: "删除成功" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
