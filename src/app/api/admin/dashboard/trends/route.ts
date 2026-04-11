import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const articles = await prisma.article.groupBy({
      by: ["crawledAt"],
      where: { isDeleted: false, crawledAt: { gte: since } },
      _count: { id: true },
      orderBy: { crawledAt: "asc" },
    });

    const users = await prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const articleTrend = articles.map((a) => ({
      date: a.crawledAt.toISOString().split("T")[0],
      count: a._count.id,
    }));

    const userTrend = users.map((u) => ({
      date: u.createdAt.toISOString().split("T")[0],
      count: u._count.id,
    }));

    const sourceDistribution = await prisma.article.groupBy({
      by: ["source"],
      where: { isDeleted: false },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const topArticles = await prisma.article.findMany({
      where: { isDeleted: false },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, title: true, viewCount: true },
    });

    return NextResponse.json({
      articleTrend,
      userTrend,
      sourceDistribution: sourceDistribution.map((s) => ({
        source: s.source,
        count: s._count.id,
      })),
      topArticles,
    });
  } catch {
    return NextResponse.json({ error: "获取趋势数据失败" }, { status: 500 });
  }
}
