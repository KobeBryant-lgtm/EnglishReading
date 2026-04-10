import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000
    );

    const preferredDifficulties = ["kaoyan", "cet6", "cet4"];

    const articles = await prisma.article.findMany({
      where: {
        difficulty: { in: preferredDifficulties },
        summary: { not: null },
      },
      orderBy: [{ difficulty: "asc" }, { crawledAt: "desc" }],
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
    });

    if (articles.length === 0) {
      const fallback = await prisma.article.findFirst({
        orderBy: { crawledAt: "desc" },
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
      });

      return NextResponse.json({ article: fallback });
    }

    const index = dayOfYear % articles.length;
    const recommendedArticle = articles[index];

    return NextResponse.json({ article: recommendedArticle });
  } catch (error) {
    console.error("Error fetching daily recommendation:", error);
    return NextResponse.json({ article: null }, { status: 500 });
  }
}
