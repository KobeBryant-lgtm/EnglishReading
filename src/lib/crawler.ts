import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SOURCES, type SourceConfig } from "@/types";

function getProxyUrl(): string {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
}

function getRssParser(): Parser {
  const proxyUrl = getProxyUrl();
  return new Parser({
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    requestOptions: proxyUrl ? {
      agent: new HttpsProxyAgent(proxyUrl),
    } : undefined,
  });
}

interface CrawledArticle {
  title: string;
  source: string;
  sourceUrl: string;
  author?: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  publishedAt?: Date;
  wordCount: number;
  difficulty?: string;
}

function estimateDifficulty(content: string): string {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "kaoyan";
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  const longWords = words.filter((w) => w.length > 8).length;
  const longWordRatio = longWords / words.length;
  if (longWordRatio < 0.08 && avgWordLength < 5) return "cet4";
  if (longWordRatio < 0.12 && avgWordLength < 5.5) return "cet6";
  if (longWordRatio < 0.18) return "kaoyan";
  return "beyond";
}

async function fetchViaProxy(url: string): Promise<string> {
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    try {
      const nodeFetch = await import("node-fetch");
      const fetchFn = nodeFetch.default;
      const agent = new HttpsProxyAgent(proxyUrl);
      const response = await fetchFn(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(20000),
        agent,
      } as Parameters<typeof fetchFn>[1]);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    } catch (e) {
      console.warn(`    代理请求失败: ${e instanceof Error ? e.message : e}`);
    }
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function fetchViaRss2Json(rssUrl: string): Promise<Parser.Output<Parser.Item> | null> {
  const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  try {
    const response = await fetch(rss2jsonUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== "ok" || !data.items) return null;

    return {
      title: data.feed?.title || "",
      items: data.items.map((item: { title?: string; link?: string; pubDate?: string; author?: string; content?: string; description?: string; thumbnail?: string; enclosure?: { link?: string } }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        creator: item.author,
        content: item.content || item.description,
        contentSnippet: item.description?.replace(/<[^>]*>/g, "").trim(),
        enclosure: item.thumbnail ? { url: item.thumbnail } : item.enclosure?.link ? { url: item.enclosure.link } : undefined,
      })),
    } as Parser.Output<Parser.Item>;
  } catch {
    return null;
  }
}

async function fetchViaAllOrigins(url: string): Promise<string | null> {
  const aoUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  try {
    const response = await fetch(aoUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

interface FullArticleResult {
  content: string;
  imageUrl?: string;
}

async function fetchFullArticle(url: string): Promise<FullArticleResult> {
  try {
    const html = await fetchViaProxy(url);
    return {
      content: extractArticleContent(html),
      imageUrl: extractImageUrl(html),
    };
  } catch {}

  const aoHtml = await fetchViaAllOrigins(url);
  if (aoHtml) {
    return {
      content: extractArticleContent(aoHtml),
      imageUrl: extractImageUrl(aoHtml),
    };
  }

  return { content: "" };
}

function extractArticleContent(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, aside, .ad, .advertisement, .social, .share, .comments, .newsletter, .related").remove();

  const selectors = [
    "article", '[role="article"]', ".article-body", ".article-content",
    ".story-body", ".content-body", "#article-body", ".post-content",
    ".entry-content", ".article__body", ".dcr-1yxrmvz",
    "[data-component='article-body']",
  ];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      const text = el.text().trim();
      if (text.length > 200) return text.replace(/\s+/g, " ").trim();
    }
  }

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  return bodyText.length > 200 ? bodyText : "";
}

function extractImageUrl(html: string): string | undefined {
  const $ = cheerio.load(html);

  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) return ogImage;

  const twitterImage = $('meta[name="twitter:image"]').attr("content");
  if (twitterImage) return twitterImage;

  const articleImage = $('meta[property="article:image"]').attr("content");
  if (articleImage) return articleImage;

  const firstLargeImg = $("article img, .article-body img, .content-body img").first().attr("src");
  if (firstLargeImg && !firstLargeImg.includes("icon") && !firstLargeImg.includes("logo")) {
    return firstLargeImg;
  }

  return undefined;
}

async function crawlSource(source: SourceConfig): Promise<CrawledArticle[]> {
  console.log(`正在抓取: ${source.nameCn}`);

  try {
    const proxyUrl = getProxyUrl();
    let feed: Parser.Output<Parser.Item>;

    const methods: string[] = [];

    if (proxyUrl) {
      methods.push("proxy");
    }
    methods.push("direct", "rss2json", "allorigins");

    feed = await tryFetchFeed(source.rssUrl, proxyUrl);

    const articles: CrawledArticle[] = [];
    const items = feed.items.slice(0, 5);

    for (const item of items) {
      const link = item.link;
      if (!link) continue;

      let content = "";
      let imageUrl: string | undefined = item.enclosure?.url || undefined;

      if (item.content && item.content.length > 200) {
        const $ = cheerio.load(item.content || "");
        content = $.text().replace(/\s+/g, " ").trim();
      }

      if (item.contentSnippet && content.length < 200) {
        content = item.contentSnippet.replace(/\s+/g, " ").trim();
      }

      if (content.length < 100) {
        const fullArticle = await fetchFullArticle(link);
        content = fullArticle.content;
        if (!imageUrl && fullArticle.imageUrl) {
          imageUrl = fullArticle.imageUrl;
        }
      }

      if (!content || content.length < 100) continue;

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      if (wordCount < 80) continue;

      const summary = item.contentSnippet || content.substring(0, 200) + "...";

      articles.push({
        title: item.title || "Untitled",
        source: source.name,
        sourceUrl: link,
        author: item.creator || undefined,
        content,
        summary: summary.substring(0, 300),
        imageUrl,
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        wordCount,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`  ${source.nameCn}: 获取 ${articles.length} 篇文章`);
    return articles;
  } catch (error) {
    console.error(`  ${source.nameCn} 抓取失败:`, error instanceof Error ? error.message : error);
    return [];
  }
}

async function tryFetchFeed(rssUrl: string, proxyUrl: string): Promise<Parser.Output<Parser.Item>> {
  if (proxyUrl) {
    try {
      const rssText = await fetchViaProxy(rssUrl);
      const rssParser = getRssParser();
      return await rssParser.parseString(rssText);
    } catch {}
  }

  try {
    const rssParser = getRssParser();
    return await rssParser.parseURL(rssUrl);
  } catch {}

  const rss2jsonResult = await fetchViaRss2Json(rssUrl);
  if (rss2jsonResult) return rss2jsonResult;

  const aoRssText = await fetchViaAllOrigins(rssUrl);
  if (aoRssText) {
    try {
      const rssParser = getRssParser();
      return await rssParser.parseString(aoRssText);
    } catch {}
  }

  throw new Error("所有获取方式均失败");
}

export async function crawlAllSources(): Promise<CrawledArticle[]> {
  console.log("开始抓取所有外刊源...");
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    console.log(`使用代理: ${proxyUrl.replace(/\/\/.*@/, '//***@')}`);
  } else {
    console.log("未配置代理，将通过 rss2json / allorigins 中转获取");
  }

  const allArticles: CrawledArticle[] = [];

  for (const source of SOURCES) {
    const articles = await crawlSource(source);
    allArticles.push(...articles);
  }

  for (const article of allArticles) {
    article.difficulty = estimateDifficulty(article.content);
  }

  console.log(`\n总计抓取 ${allArticles.length} 篇文章`);
  return allArticles;
}

export { crawlSource, estimateDifficulty, fetchFullArticle };
