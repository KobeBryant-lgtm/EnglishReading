"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DIFFICULTY_LABELS, SOURCES } from "@/types";

interface ArticleData {
  id: string;
  title: string;
  source: string;
  summary?: string;
  imageUrl?: string;
  difficulty: string;
  wordCount: number;
  publishedAt?: string | Date;
  crawledAt: string | Date;
}

export default function DailyRecommend() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily")
      .then((res) => res.json())
      .then((data) => {
        if (data.article) setArticle(data.article);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="daily-recommend-card animate-pulse mb-8 sm:mb-10">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-6 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const sourceInfo = SOURCES.find((s) => s.name === article.source) || {
    nameCn: article.source,
    color: "#6b7280",
  };
  const difficultyLabel = DIFFICULTY_LABELS[article.difficulty] || article.difficulty;

  return (
    <Link href={`/articles/${article.id}`} className="no-underline block">
      <div className="daily-recommend-card group cursor-pointer mb-8 sm:mb-10 overflow-hidden relative">
        {article.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${article.imageUrl})` }}
          >
            <div className="absolute inset-0 daily-gradient-overlay"></div>
          </div>
        )}

        <div className={`relative z-10 ${article.imageUrl ? "text-white" : ""}`}>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <span className="daily-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              每日推荐
            </span>
            <span className="source-tag" style={!article.imageUrl ? {} : {
              background: "rgba(255,255,255,0.2)",
              borderColor: "rgba(255,255,255,0.3)",
              color: "#fff"
            }}>
              {sourceInfo.nameCn}
            </span>
            <span className={`difficulty-tag difficulty-${article.difficulty}`}>
              {difficultyLabel}
            </span>
          </div>

          <h2
            className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4 leading-tight"
            style={{
              fontFamily: "var(--serif)",
              letterSpacing: "-0.02em",
              textShadow: article.imageUrl ? "0 2px 20px rgba(0,0,0,0.3)" : "none"
            }}
          >
            {article.title}
          </h2>

          {article.summary && (
            <p
              className="text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4"
              style={{
                opacity: article.imageUrl ? 0.95 : undefined,
                color: article.imageUrl ? "#fff" : "var(--text-secondary)"
              }}
            >
              {article.summary}
            </p>
          )}

          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: article.imageUrl ? "rgba(255,255,255,0.85)" : "var(--text-muted)" }}
          >
            <span>{article.wordCount} 词</span>
            <span>·</span>
            <span>{getTimeAgo(article.publishedAt || article.crawledAt)}</span>
            <span className="ml-auto inline-flex items-center gap-1 daily-read-more">
              开始阅读
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return d.toLocaleDateString("zh-CN");
}
