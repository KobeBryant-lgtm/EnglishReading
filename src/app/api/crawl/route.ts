import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { crawlAllSources } from "@/lib/crawler";

export async function POST() {
  try {
    const articles = await crawlAllSources();

    let saved = 0;
    let skipped = 0;

    for (const article of articles) {
      const existing = await prisma.article.findFirst({
        where: { sourceUrl: article.sourceUrl },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.article.create({
        data: {
          title: article.title,
          source: article.source,
          sourceUrl: article.sourceUrl,
          author: article.author,
          content: article.content,
          summary: article.summary,
          imageUrl: article.imageUrl,
          difficulty: (article as typeof article & { difficulty: string }).difficulty || "kaoyan",
          wordCount: article.wordCount,
          publishedAt: article.publishedAt,
        },
      });
      saved++;
    }

    await prisma.crawlLog.create({
      data: {
        source: "all",
        status: "success",
        count: saved,
        message: `抓取 ${articles.length} 篇，保存 ${saved} 篇，跳过 ${skipped} 篇`,
      },
    });

    return NextResponse.json({
      success: true,
      crawled: articles.length,
      saved,
      skipped,
    });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      { error: "爬取失败，请稍后重试" },
      { status: 500 }
    );
  }
}
