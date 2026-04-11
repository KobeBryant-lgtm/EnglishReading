import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            vocabulary: true,
            readingHistory: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      favoritesCount: user._count.favorites,
      vocabularyCount: user._count.vocabulary,
      readingCount: user._count.readingHistory,
    });
  } catch {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { nickname, avatarUrl } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatarUrl: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "更新用户信息失败" }, { status: 500 });
  }
}
