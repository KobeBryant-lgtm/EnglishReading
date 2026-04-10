"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface VocabWord {
  id: string;
  word: string;
  definition?: string;
  phonetic?: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  articleId?: string;
  reviewCount: number;
  mastered: boolean;
  createdAt: string;
  article?: { title: string };
}

export default function VocabularyContent() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "learning" | "mastered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const fetchVocabulary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary");
      const data = await res.json();
      setWords(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVocabulary(); }, [fetchVocabulary]);

  const filteredWords = words.filter((w) => {
    if (filter === "learning" && w.mastered) return false;
    if (filter === "mastered" && !w.mastered) return false;
    if (searchQuery && !w.word.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleMastered = async (id: string, mastered: boolean) => {
    try {
      await fetch("/api/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, mastered: !mastered }),
      });
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, mastered: !mastered } : w)));
    } catch {}
  };

  const deleteWord = async (id: string) => {
    try {
      await fetch(`/api/vocabulary?id=${id}`, { method: "DELETE" });
      setWords((prev) => prev.filter((w) => w.id !== id));
    } catch {}
  };

  const learningCount = words.filter((w) => !w.mastered).length;
  const masteredCount = words.filter((w) => w.mastered).length;

  if (reviewMode && filteredWords.length > 0) {
    const currentWord = filteredWords[reviewIndex % filteredWords.length];
    return (
      <div className="max-w-lg mx-auto px-5 py-10">
        <button
          onClick={() => setReviewMode(false)}
          className="btn-ghost mb-8"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          退出复习
        </button>

        <div className="card p-10 text-center">
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            {reviewIndex + 1} / {filteredWords.length}
          </p>

          <h2
            className="text-3xl font-semibold mb-2"
            style={{ color: "var(--text-primary)", fontFamily: "var(--serif)" }}
          >
            {currentWord.word}
          </h2>

          {currentWord.phonetic && (
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              /{currentWord.phonetic}/
            </p>
          )}

          <div className="mb-10">
            {currentWord.partOfSpeech && (
              <span
                className="inline-block px-2 py-0.5 rounded text-xs mr-2 mb-2"
                style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
              >
                {currentWord.partOfSpeech}
              </span>
            )}
            <p className="text-base" style={{ color: "var(--text-primary)" }}>
              {currentWord.definition || "暂无释义"}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => { toggleMastered(currentWord.id, currentWord.mastered); setReviewIndex((i) => i + 1); }}
              className="btn-primary"
              style={{ backgroundColor: "var(--success)" }}
            >
              已掌握
            </button>
            <button onClick={() => setReviewIndex((i) => i + 1)} className="btn-ghost">
              下一个
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold mb-1.5"
          style={{ color: "var(--text-primary)", fontFamily: "var(--serif)", letterSpacing: "-0.02em" }}
        >
          生词本
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          共 {words.length} 词 / 学习中 {learningCount} / 已掌握 {masteredCount}
        </p>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 mb-8 pb-5"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <input
          type="text"
          placeholder="搜索单词..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field flex-1 min-w-[180px]"
        />

        <div className="flex gap-1">
          {(["all", "learning", "mastered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? "var(--accent)" : "transparent",
                color: filter === f ? "#fff" : "var(--text-muted)",
                border: filter === f ? "1px solid var(--accent)" : "1px solid var(--border-color)",
              }}
            >
              {f === "all" ? "全部" : f === "learning" ? "学习中" : "已掌握"}
            </button>
          ))}
        </div>

        {filteredWords.length > 0 && (
          <button
            onClick={() => { setReviewIndex(0); setReviewMode(true); }}
            className="btn-primary ml-auto"
          >
            开始复习
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-4 animate-pulse" style={{ height: "56px" }} />
          ))}
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
            {words.length === 0 ? "生词本为空" : "没有匹配的单词"}
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            {words.length === 0 ? "阅读文章时点击单词即可加入生词本" : "尝试调整筛选条件"}
          </p>
          {words.length === 0 && (
            <Link href="/" className="btn-primary no-underline">
              去阅读文章
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWords.map((word) => (
            <div key={word.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--serif)" }}
                  >
                    {word.word}
                  </span>
                  {word.phonetic && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      /{word.phonetic}/
                    </span>
                  )}
                  {word.partOfSpeech && (
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                    >
                      {word.partOfSpeech}
                    </span>
                  )}
                  {word.mastered && (
                    <span className="text-xs" style={{ color: "var(--success)" }}>已掌握</span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {word.definition || "暂无释义"}
                </p>
                {word.article && (
                  <Link
                    href={`/articles/${word.articleId}`}
                    className="text-xs no-underline mt-0.5 inline-block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {word.article.title}
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleMastered(word.id, word.mastered)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: word.mastered ? "transparent" : "var(--success)",
                    color: word.mastered ? "var(--text-muted)" : "#fff",
                    border: word.mastered ? "1px solid var(--border-color)" : "1px solid var(--success)",
                  }}
                >
                  {word.mastered ? "取消" : "掌握"}
                </button>
                <button
                  onClick={() => deleteWord(word.id)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--danger)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
