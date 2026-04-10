"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ArticleReader from "@/components/ArticleReader";
import { SOURCES, DIFFICULTY_LABELS } from "@/types";

interface ArticleData {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  author?: string;
  content: string;
  summary?: string;
  difficulty: string;
  wordCount: number;
  publishedAt?: string;
  crawledAt: string;
  translations: { paragraphIndex: number; translatedText: string }[];
}

const SOURCE_MAP: Record<string, { name: string; color: string }> = {};
SOURCES.forEach((s) => {
  SOURCE_MAP[s.name] = { name: s.nameCn, color: s.color };
});

export default function ArticleDetailContent({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
          <div className="h-3 rounded w-1/3" style={{ backgroundColor: "var(--bg-secondary)" }} />
          <div className="space-y-3 mt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 rounded" style={{ backgroundColor: "var(--bg-secondary)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-5 py-16 sm:py-24 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>文章未找到</p>
        <Link href="/" className="inline-block mt-4 text-sm no-underline" style={{ color: "var(--accent)" }}>
          返回首页
        </Link>
      </div>
    );
  }

  const sourceInfo = SOURCE_MAP[article.source] || { name: article.source, color: "#6b7280" };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-5 py-6 sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs no-underline mb-6 sm:mb-8"
        style={{ color: "var(--text-muted)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回列表
      </Link>

      <article>
        <header className="mb-6 sm:mb-8" style={{ paddingBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="source-tag">{sourceInfo.name}</span>
            <span className={`difficulty-tag difficulty-${article.difficulty}`}>
              {DIFFICULTY_LABELS[article.difficulty] || article.difficulty}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {article.wordCount}词
            </span>
          </div>

          <h1
            className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug mb-3 sm:mb-4"
            style={{ color: "var(--text-primary)", fontFamily: "var(--serif)", letterSpacing: "-0.01em" }}
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            {article.author && <span>{article.author}</span>}
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString("zh-CN")}</span>
            )}
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline inline-flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              原文
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </header>

        <div
          className="font-size-selector flex items-center gap-2 mb-6 sm:mb-8 pb-4"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>字号</span>
          {[16, 18, 20, 22].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className="px-3 py-2 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: fontSize === size ? "var(--accent)" : "transparent",
                color: fontSize === size ? "#fff" : "var(--text-muted)",
                border: fontSize === size ? "1px solid var(--accent)" : "1px solid var(--border-color)",
                minHeight: "44px",
                minWidth: "44px",
              }}
            >
              {size}
            </button>
          ))}
        </div>

        <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }}>
          <ArticleReader content={article.content} articleId={article.id} />
        </div>
      </article>
    </div>
  );
}
