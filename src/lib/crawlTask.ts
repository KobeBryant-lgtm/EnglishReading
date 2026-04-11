import { prisma } from "@/lib/db";
import { crawlSource, estimateDifficulty } from "@/lib/crawler";
import { SOURCES } from "@/types";
import type { SourceConfig } from "@/types";

export async function runCrawlTask(sourceName?: string) {
  const sources = sourceName
    ? SOURCES.filter((s) => s.name === sourceName)
    : SOURCES;

  const task = await prisma.crawlTask.create({
    data: {
      sourceName: sourceName || "全部来源",
      triggerType: "auto",
      status: "running",
      startedAt: new Date(),
    },
  });

  let totalFetched = 0;
  const errors: string[] = [];

  try {
    for (const source of sources) {
      try {
        const articles = await crawlSource(source);

        for (const article of articles) {
          const difficulty = estimateDifficulty(article.content);

          const existing = await prisma.article.findFirst({
            where: { sourceUrl: article.sourceUrl },
          });

          if (!existing) {
            await prisma.article.create({
              data: {
                title: article.title,
                source: article.source,
                sourceUrl: article.sourceUrl,
                author: article.author,
                content: article.content,
                summary: article.summary,
                imageUrl: article.imageUrl,
                difficulty,
                wordCount: article.wordCount,
                publishedAt: article.publishedAt,
              },
            });
            totalFetched++;
          }
        }
      } catch (e) {
        const errMsg = `${source.nameCn}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(errMsg);
      }
    }

    await prisma.crawlTask.update({
      where: { id: task.id },
      data: {
        status: errors.length === sources.length ? "failed" : "success",
        articlesFetched: totalFetched,
        errorLog: errors.length > 0 ? errors.join("\n") : null,
        finishedAt: new Date(),
      },
    });

    return { totalFetched, errors };
  } catch (e) {
    await prisma.crawlTask.update({
      where: { id: task.id },
      data: {
        status: "failed",
        articlesFetched: totalFetched,
        errorLog: e instanceof Error ? e.message : String(e),
        finishedAt: new Date(),
      },
    });

    return { totalFetched, errors: [e instanceof Error ? e.message : String(e)] };
  }
}
