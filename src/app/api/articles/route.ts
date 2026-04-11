import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const difficulty = searchParams.get("difficulty");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search");
  const today = searchParams.get("today");

  const where: Record<string, unknown> = { isDeleted: false };

  if (source) where.source = source;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [articles, total, todayCount] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { crawledAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        source: true,
        summary: true,
        imageUrl: true,
        difficulty: true,
        wordCount: true,
        publishedAt: true,
        crawledAt: true,
      },
    }),
    prisma.article.count({ where }),
    prisma.article.count({
      where: {
        isDeleted: false,
        crawledAt: { gte: todayStart },
      },
    }),
  ]);

  return NextResponse.json({
    articles,
    todayCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
