"use client";

import Link from "next/link";
import { DIFFICULTY_LABELS, SOURCES } from "@/types";
import { generateCoverImageUrl } from "@/lib/coverGenerator";

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
  const artCoverUrl = generateCoverImageUrl(article.title, article.source);

  return (
    <Link href={`/articles/${article.id}`} className="no-underline block">
      <div className="card-modern group cursor-pointer overflow-hidden">
        <div className="flex flex-row">
          <div
            className="article-image-wrapper flex-shrink-0 w-32 sm:w-40 md:w-44 lg:w-48 relative overflow-hidden"
            style={{ backgroundImage: `url("${artCoverUrl}")`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="image-overlay"></div>
          </div>

          <div className="article-content-wrapper p-4 sm:p-5 flex-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
              <span className="source-tag">{sourceInfo.name}</span>
              <span className={`difficulty-tag ${difficultyClass}`}>
                {difficultyLabel}
              </span>
            </div>

            <h3
              className="text-sm sm:text-base font-medium mb-2 leading-relaxed line-clamp-2"
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
                className="text-xs leading-relaxed line-clamp-2 mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {article.summary}
              </p>
            )}

            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <span>{article.wordCount}词</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
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
