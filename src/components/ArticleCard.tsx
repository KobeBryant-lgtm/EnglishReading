"use client";

import Link from "next/link";
import { DIFFICULTY_LABELS, SOURCES } from "@/types";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    summary?: string;
    imageUrl?: string;
    difficulty: string;
    wordCount: number;
    publishedAt?: string | Date;
    crawledAt: string | Date;
  };
}

const SOURCE_MAP: Record<string, { name: string; color: string }> = {};
SOURCES.forEach((s) => {
  SOURCE_MAP[s.name] = { name: s.nameCn, color: s.color };
});

export default function ArticleCard({ article }: ArticleCardProps) {
  const sourceInfo = SOURCE_MAP[article.source] || {
    name: article.source,
    color: "#6b7280",
  };

  const difficultyClass = `difficulty-${article.difficulty}`;
  const difficultyLabel = DIFFICULTY_LABELS[article.difficulty] || article.difficulty;
  const timeAgo = getTimeAgo(article.publishedAt || article.crawledAt);

  return (
    <Link href={`/articles/${article.id}`} className="no-underline block">
      <div className="card p-5 group cursor-pointer">
        <div className="flex items-center gap-2 mb-3">
          <span className="source-tag">
            {sourceInfo.name}
          </span>
          <span className={`difficulty-tag ${difficultyClass}`}>
            {difficultyLabel}
          </span>
          <span
            className="text-xs ml-auto"
            style={{ color: "var(--text-muted)" }}
          >
            {article.wordCount}词 / {timeAgo}
          </span>
        </div>

        <h3
          className="text-sm font-medium mb-2 leading-relaxed"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--serif)",
            letterSpacing: "-0.01em",
          }}
        >
          {article.title}
        </h3>

        {article.summary && (
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            {article.summary}
          </p>
        )}
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
