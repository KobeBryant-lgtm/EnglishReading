import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

import { PrismaClient } from "@prisma/client";
import { crawlAllSources } from "../src/lib/crawler";

const prisma = new PrismaClient();

async function main() {
  console.log("外刊爬虫启动...\n");

  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxy) {
    console.log(`检测到代理配置: ${proxy.replace(/\/\/.*@/, '//***@')}`);
  } else {
    console.log("未检测到代理配置（HTTPS_PROXY），国内网络可能无法访问外刊");
    console.log("请在 .env.local 中设置 HTTPS_PROXY=http://127.0.0.1:端口\n");
  }

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
      message: `抓取 ${articles.length} 篇，保存 ${saved} 篇，跳过 ${skipped} 篇重复`,
    },
  });

  console.log(`\n保存 ${saved} 篇新文章，跳过 ${skipped} 篇重复`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("爬虫运行失败:", e);
  process.exit(1);
});
