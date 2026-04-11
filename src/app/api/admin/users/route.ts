import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (search) where.username = { contains: search, mode: "insensitive" };
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          nickname: true,
          avatarUrl: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: { favorites: true, vocabulary: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        favoritesCount: u._count.favorites,
        vocabularyCount: u._count.vocabulary,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 });
  }
}
