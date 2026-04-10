"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { DictionaryResult } from "@/types";

interface WordPopupProps {
  word: string;
  result: DictionaryResult | null;
  loading: boolean;
  position: { x: number; y: number };
  onAddToVocabulary: (word: string, data: { definition?: string; phonetic?: string; partOfSpeech?: string }) => void;
  onClose: () => void;
  isInVocabulary: boolean;
}

export default function WordPopup({
  word, result, loading, position, onAddToVocabulary, onClose, isInVocabulary,
}: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as unknown as EventListener);
    };
  }, [onClose]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const adjustedPos = { ...position };
  if (typeof window !== "undefined" && !isMobile) {
    if (adjustedPos.x + 340 > window.innerWidth) adjustedPos.x = window.innerWidth - 360;
    if (adjustedPos.y + 280 > window.innerHeight) adjustedPos.y = position.y - 280;
    if (adjustedPos.x < 10) adjustedPos.x = 10;
    if (adjustedPos.y < 10) adjustedPos.y = 10;
  }

  return (
    <div
      ref={popupRef}
      className="word-popup"
      style={isMobile ? {} : { left: adjustedPos.x, top: adjustedPos.y }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--serif)" }}
          >
            {word}
          </span>
          {result?.phonetic && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              /{result.phonetic}/
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)", minHeight: "44px", minWidth: "44px" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {loading ? (
        <div className="py-6 text-center">
          <div className="animate-pulse text-xs" style={{ color: "var(--text-muted)" }}>查询中...</div>
        </div>
      ) : result ? (
        <div className="space-y-2.5">
          {result.meanings.map((meaning, i) => (
            <div key={i}>
              <span
                className="inline-block px-1.5 py-0.5 rounded text-xs font-medium mb-1"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {meaning.partOfSpeech}
              </span>
              {meaning.definitions.map((def, j) => (
                <div key={j} className="ml-1 mb-1">
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {j + 1}. {def.definition}
                  </p>
                  {def.example && (
                    <p className="text-xs italic ml-4 mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {def.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}

          <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "12px", paddingTop: "12px" }}>
            <button
              onClick={() => {
                if (result) {
                  const firstMeaning = result.meanings[0];
                  onAddToVocabulary(word, {
                    definition: firstMeaning?.definitions[0]?.definition,
                    phonetic: result.phonetic,
                    partOfSpeech: firstMeaning?.partOfSpeech,
                  });
                }
              }}
              disabled={isInVocabulary}
              className={isInVocabulary ? "btn-ghost w-full" : "btn-primary w-full"}
              style={isInVocabulary ? { opacity: 0.6, cursor: "default" } : {}}
            >
              {isInVocabulary ? "已加入生词本" : "加入生词本"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>未找到释义</p>
      )}
    </div>
  );
}
