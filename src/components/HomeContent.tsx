"use client";

import { useState, useEffect, useCallback } from "react";
import ArticleCard from "@/components/ArticleCard";
import DailyRecommend from "@/components/DailyRecommend";
import { SOURCES, DIFFICULTY_LABELS } from "@/types";

interface ArticleSummary {
  id: string;
  title: string;
  source: string;
  summary?: string;
  imageUrl?: string;
  difficulty: string;
  wordCount: number;
  publishedAt?: string;
  crawledAt: string;
}

export default function HomeContent() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [filter, setFilter] = useState({ source: "", difficulty: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (filter.source) params.set("source", filter.source);
      if (filter.difficulty) params.set("difficulty", filter.difficulty);
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      const res = await fetch("/api/crawl", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPage(1);
        fetchArticles();
      }
    } catch {
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--serif)", letterSpacing: "-0.02em" }}
        >
          每日外刊精读
        </h1>
      </div>

      {/* Daily Recommendation */}
      <DailyRecommend />

      <div
        className="filter-bar flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8 pb-4 sm:pb-5"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <select
          value={filter.source}
          onChange={(e) => { setFilter((f) => ({ ...f, source: e.target.value })); setPage(1); }}
          className="select-field flex-1 sm:flex-none sm:w-auto"
        >
          <option value="">全部来源</option>
          {SOURCES.map((s) => (
            <option key={s.name} value={s.name}>{s.nameCn}</option>
          ))}
        </select>

        <select
          value={filter.difficulty}
          onChange={(e) => { setFilter((f) => ({ ...f, difficulty: e.target.value })); setPage(1); }}
          className="select-field flex-1 sm:flex-none sm:w-auto"
        >
          <option value="">全部难度</option>
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <button
          onClick={handleCrawl}
          disabled={crawling}
          className="btn-ghost w-full sm:w-auto sm:ml-auto"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
          {crawling ? "抓取中..." : "更新文章"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse" style={{ height: "120px" }} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 sm:py-24">
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>暂无文章</p>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            点击「更新文章」从外刊获取最新内容
          </p>
          <button onClick={handleCrawl} disabled={crawling} className="btn-primary">
            {crawling ? "抓取中..." : "获取文章"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8 sm:mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost"
                style={{ opacity: page === 1 ? 0.4 : 1 }}
              >
                上一页
              </button>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost"
                style={{ opacity: page === totalPages ? 0.4 : 1 }}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
