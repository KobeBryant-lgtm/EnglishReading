import { prisma } from "@/lib/db";
import { crawlSource, estimateDifficulty } from "@/lib/crawler";
import { SOURCES } from "@/types";
import { logEvent } from "@/lib/logger";

type CrawlTriggerType = "auto" | "manual";

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
) {
  const queue = [...items];
  const workers = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) await worker(item);
      }
    }
  );
  await Promise.all(workers);
}

export async function runCrawlTask(
  sourceName?: string,
  triggerType: CrawlTriggerType = "auto"
) {
  const now = new Date();
  await Promise.all([
    prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.captchaChallenge.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  const sources = sourceName
    ? SOURCES.filter((s) => s.name === sourceName)
    : SOURCES;

  if (sources.length === 0) {
    throw new Error("未找到指定的文章来源");
  }

  const staleBefore = new Date(Date.now() - 20 * 60 * 1000);
  const task = await prisma.$transaction(async (tx) => {
    await tx.crawlTask.updateMany({
      where: { status: "running", startedAt: { lt: staleBefore } },
      data: {
        status: "failed",
        errorLog: "任务运行超过20分钟，已自动标记为失败",
        finishedAt: new Date(),
      },
    });

    const runningTask = await tx.crawlTask.findFirst({
      where: { status: "running", startedAt: { gte: staleBefore } },
      select: { id: true },
    });
    if (runningTask) {
      throw new Error("已有爬虫任务正在运行，请稍后再试");
    }

    return tx.crawlTask.create({
      data: {
        sourceName: sourceName || "全部来源",
        triggerType,
        status: "running",
        startedAt: new Date(),
      },
    });
  });

  let totalFetched = 0;
  const errors: string[] = [];
  const configuredConcurrency = Number.parseInt(process.env.CRAWL_CONCURRENCY || "4", 10);
  const concurrency = Math.min(5, Math.max(1, configuredConcurrency || 4));

  logEvent("info", "crawl_task_started", {
    taskId: task.id,
    sourceCount: sources.length,
    concurrency,
    triggerType,
  });

  try {
    await runWithConcurrency(sources, concurrency, async (source) => {
      try {
        const articles = await crawlSource(source);
        const result = await prisma.article.createMany({
          data: articles.map((article) => ({
            title: article.title,
            source: article.source,
            sourceUrl: article.sourceUrl,
            author: article.author,
            content: article.content,
            summary: article.summary,
            imageUrl:
              article.imageUrl && article.imageUrl.length <= 512
                ? article.imageUrl
                : undefined,
            difficulty: estimateDifficulty(article.content),
            wordCount: article.wordCount,
            publishedAt: article.publishedAt,
          })),
          skipDuplicates: true,
        });
        totalFetched += result.count;
        logEvent("info", "crawl_source_completed", {
          taskId: task.id,
          source: source.name,
          discovered: articles.length,
          inserted: result.count,
        });
      } catch (e) {
        const errMsg = `${source.nameCn}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(errMsg);
        logEvent("error", "crawl_source_failed", {
          taskId: task.id,
          source: source.name,
          error: errMsg,
        });
      }
    });

    await prisma.crawlTask.update({
      where: { id: task.id },
      data: {
        status: errors.length === sources.length ? "failed" : "success",
        articlesFetched: totalFetched,
        errorLog: errors.length > 0 ? errors.join("\n") : null,
        finishedAt: new Date(),
      },
    });

    logEvent("info", "crawl_task_completed", {
      taskId: task.id,
      totalFetched,
      errorCount: errors.length,
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

    const errorMessage = e instanceof Error ? e.message : String(e);
    logEvent("error", "crawl_task_failed", {
      taskId: task.id,
      totalFetched,
      error: errorMessage,
    });
    return { totalFetched, errors: [errorMessage] };
  }
}
