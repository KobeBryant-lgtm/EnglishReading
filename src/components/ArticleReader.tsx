"use client";

import { useState, useCallback, useRef } from "react";
import WordPopup from "./WordPopup";
import type { DictionaryResult } from "@/types";

interface ArticleReaderProps {
  content: string;
  articleId: string;
}

interface SentenceState {
  text: string;
  translation?: string;
  translating: boolean;
}

export default function ArticleReader({ content, articleId }: ArticleReaderProps) {
  const [sentences, setSentences] = useState<SentenceState[]>(() =>
    splitIntoSentences(content).map((text) => ({ text, translating: false }))
  );
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [translatingAll, setTranslatingAll] = useState(false);

  const [popupState, setPopupState] = useState<{
    word: string;
    result: DictionaryResult | null;
    loading: boolean;
    position: { x: number; y: number };
    visible: boolean;
  }>({
    word: "",
    result: null,
    loading: false,
    position: { x: 0, y: 0 },
    visible: false,
  });

  const [vocabularySet, setVocabularySet] = useState<Set<string>>(new Set());
  const [translationCache, setTranslationCache] = useState<Record<number, string>>({});
  const readerRef = useRef<HTMLDivElement>(null);

  const handleWordClick = useCallback(
    async (word: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const cleanWord = word.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
      if (!cleanWord || cleanWord.length < 2) return;

      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setPopupState({
        word: cleanWord,
        result: null,
        loading: true,
        position: { x: rect.left, y: rect.bottom + 6 },
        visible: true,
      });

      try {
        const res = await fetch(`/api/dictionary?word=${encodeURIComponent(cleanWord)}`);
        const data: DictionaryResult = await res.json();
        setPopupState((prev) => ({ ...prev, result: data, loading: false }));
      } catch {
        setPopupState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  const handleAddToVocabulary = useCallback(
    async (word: string, data: { definition?: string; phonetic?: string; partOfSpeech?: string }) => {
      try {
        await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word, articleId, ...data }),
        });
        setVocabularySet((prev) => new Set(prev).add(word));
      } catch {}
    },
    [articleId]
  );

  const translateSentence = useCallback(
    async (index: number) => {
      if (translationCache[index]) {
        setSentences((prev) =>
          prev.map((s, i) => i === index ? { ...s, translation: translationCache[index], translating: false } : s)
        );
        return;
      }

      setSentences((prev) => prev.map((s, i) => (i === index ? { ...s, translating: true } : s)));

      try {
        const sentence = sentences[index];
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentence.text }),
        });
        const data = await res.json();
        setTranslationCache((prev) => ({ ...prev, [index]: data.translatedText }));
        setSentences((prev) =>
          prev.map((s, i) => i === index ? { ...s, translation: data.translatedText, translating: false } : s)
        );
      } catch {
        setSentences((prev) => prev.map((s, i) => (i === index ? { ...s, translating: false } : s)));
      }
    },
    [sentences, translationCache]
  );

  const translateAll = useCallback(async () => {
    setTranslatingAll(true);
    const untranslated = sentences.map((s, i) => ({ ...s, index: i })).filter((s) => !s.translation && !translationCache[s.index]);

    for (const sentence of untranslated) {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentence.text }),
        });
        const data = await res.json();
        setTranslationCache((prev) => ({ ...prev, [sentence.index]: data.translatedText }));
        setSentences((prev) =>
          prev.map((s, i) => i === sentence.index ? { ...s, translation: data.translatedText, translating: false } : s)
        );
      } catch { continue; }
      await new Promise((r) => setTimeout(r, 300));
    }

    setTranslatingAll(false);
    setShowAllTranslations(true);
  }, [sentences, translationCache]);

  const toggleTranslations = useCallback(() => {
    if (!showAllTranslations && sentences.some((s) => !s.translation)) {
      translateAll();
    } else {
      setShowAllTranslations(!showAllTranslations);
    }
  }, [showAllTranslations, sentences, translateAll]);

  return (
    <div ref={readerRef} className="relative">
      <div className="flex items-center gap-3 mb-8 pb-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <button onClick={toggleTranslations} disabled={translatingAll} className="btn-primary">
          {translatingAll ? "翻译中..." : showAllTranslations ? "隐藏翻译" : "全文翻译"}
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          点击单词查词 / 点击句子翻译
        </span>
      </div>

      <div className="article-content space-y-1" style={{ fontFamily: "var(--serif)" }}>
        {sentences.map((sentence, index) => (
          <span key={index}>
            <span
              className={`sentence ${sentence.translation && showAllTranslations ? "translated" : ""}`}
              onClick={() => translateSentence(index)}
            >
              {renderSentenceWithClickableWords(sentence.text, handleWordClick)}
            </span>
            {sentence.translation && (showAllTranslations || sentence.translation) && (
              <span
                className="translation-bubble"
                style={{ display: showAllTranslations || sentence.translation ? "block" : "none" }}
              >
                {sentence.translating ? "翻译中..." : sentence.translation}
              </span>
            )}
          </span>
        ))}
      </div>

      {popupState.visible && (
        <WordPopup
          word={popupState.word}
          result={popupState.result}
          loading={popupState.loading}
          position={popupState.position}
          onAddToVocabulary={handleAddToVocabulary}
          onClose={() => setPopupState((prev) => ({ ...prev, visible: false }))}
          isInVocabulary={vocabularySet.has(popupState.word)}
        />
      )}
    </div>
  );
}

function splitIntoSentences(text: string): string[] {
  const result: string[] = [];
  const regex = /[^.!?]+[.!?]+\s*/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    result.push(match[0].trim());
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining) result.push(remaining);
  }

  return result.filter((s) => s.length > 0);
}

function renderSentenceWithClickableWords(
  text: string,
  onWordClick: (word: string, event: React.MouseEvent) => void
): React.ReactNode[] {
  const parts = text.split(/(\b[a-zA-Z]+\b)/g);
  return parts.map((part, i) => {
    if (/^[a-zA-Z]+$/.test(part)) {
      return (
        <span key={i} className="word" onClick={(e) => onWordClick(part, e)}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
