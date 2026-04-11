import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalArticles, todayArticles, totalUsers, todayActiveUsers] = await Promise.all([
      prisma.article.count({ where: { isDeleted: false } }),
      prisma.article.count({ where: { isDeleted: false, crawledAt: { gte: todayStart } } }),
      prisma.user.count({ where: { status: "active" } }),
      prisma.user.count({ where: { status: "active", lastLoginAt: { gte: todayStart } } }),
    ]);

    return NextResponse.json({
      totalArticles,
      todayArticles,
      totalUsers,
      todayActiveUsers,
    });
  } catch {
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}
