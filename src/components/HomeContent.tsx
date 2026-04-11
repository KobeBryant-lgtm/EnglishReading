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
  const [filter, setFilter] = useState({ source: "", difficulty: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [todayCount, setTodayCount] = useState(0);

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

  const fetchTodayCount = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?limit=1&today=true");
      const data = await res.json();
      setTodayCount(data.todayCount || 0);
    } catch {}
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => { fetchTodayCount(); }, [fetchTodayCount]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--serif)", letterSpacing: "-0.02em" }}
        >
          每日外刊精读
        </h1>
        {todayCount > 0 && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--accent-light)",
            color: "var(--success)",
            fontSize: 13,
            padding: "6px 14px",
            borderRadius: 20,
            marginTop: 12,
          }}>
            ✅ 今日已自动更新 {todayCount} 篇文章
          </div>
        )}
      </div>

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
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            系统将每日自动抓取最新外刊文章
          </p>
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
