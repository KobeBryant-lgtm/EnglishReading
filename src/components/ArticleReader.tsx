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
  paragraphIndex: number;
}

interface ParagraphGroup {
  index: number;
  sentences: SentenceState[];
}

export default function ArticleReader({ content, articleId }: ArticleReaderProps) {
  const [paragraphs, setParagraphs] = useState<ParagraphGroup[]>(() =>
    groupByParagraphs(splitIntoSentences(content))
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
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});
  const readerRef = useRef<HTMLDivElement>(null);

  const getSentenceKey = (paraIdx: number, sentIdx: number) => `${paraIdx}-${sentIdx}`;

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
    async (paraIdx: number, sentIdx: number) => {
      const key = getSentenceKey(paraIdx, sentIdx);
      if (translationCache[key]) {
        setParagraphs((prev) =>
          prev.map((p) =>
            p.index === paraIdx
              ? {
                  ...p,
                  sentences: p.sentences.map((s, i) =>
                    i === sentIdx ? { ...s, translation: translationCache[key], translating: false } : s
                  ),
                }
              : p
          )
        );
        return;
      }

      setParagraphs((prev) =>
        prev.map((p) =>
          p.index === paraIdx
            ? {
                ...p,
                sentences: p.sentences.map((s, i) => (i === sentIdx ? { ...s, translating: true } : s)),
              }
            : p
        )
      );

      try {
        const para = paragraphs.find((p) => p.index === paraIdx);
        const sentence = para?.sentences[sentIdx];
        if (!sentence) return;

        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentence.text }),
        });
        const data = await res.json();
        setTranslationCache((prev) => ({ ...prev, [key]: data.translatedText }));
        setParagraphs((prev) =>
          prev.map((p) =>
            p.index === paraIdx
              ? {
                  ...p,
                  sentences: p.sentences.map((s, i) =>
                    i === sentIdx ? { ...s, translation: data.translatedText, translating: false } : s
                  ),
                }
              : p
          )
        );
      } catch {
        setParagraphs((prev) =>
          prev.map((p) =>
            p.index === paraIdx
              ? {
                  ...p,
                  sentences: p.sentences.map((s, i) => (i === sentIdx ? { ...s, translating: false } : s)),
                }
              : p
          )
        );
      }
    },
    [paragraphs, translationCache]
  );

  const translateAll = useCallback(async () => {
    setTranslatingAll(true);
    for (const para of paragraphs) {
      for (let i = 0; i < para.sentences.length; i++) {
        const key = getSentenceKey(para.index, i);
        if (translationCache[key]) continue;
        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: para.sentences[i].text }),
          });
          const data = await res.json();
          setTranslationCache((prev) => ({ ...prev, [key]: data.translatedText }));
          setParagraphs((prev) =>
            prev.map((p) =>
              p.index === para.index
                ? {
                    ...p,
                    sentences: p.sentences.map((s, j) =>
                      j === i ? { ...s, translation: data.translatedText, translating: false } : s
                    ),
                  }
                : p
            )
          );
        } catch { continue; }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    setTranslatingAll(false);
    setShowAllTranslations(true);
  }, [paragraphs, translationCache]);

  const toggleTranslations = useCallback(() => {
    if (!showAllTranslations && paragraphs.some((p) => p.sentences.some((s) => !s.translation))) {
      translateAll();
    } else {
      setShowAllTranslations(!showAllTranslations);
    }
  }, [showAllTranslations, paragraphs, translateAll]);

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

      <div className="article-content" style={{ fontFamily: "var(--serif)" }}>
        {paragraphs.map((para, paraIdx) => (
          <div key={para.index} style={{ marginBottom: paraIdx < paragraphs.length - 1 ? "1.8em" : 0 }}>
            {para.sentences.map((sentence, sentIdx) => (
              <span key={sentIdx}>
                <span
                  className={`sentence ${sentence.translation && showAllTranslations ? "translated" : ""}`}
                  onClick={() => translateSentence(para.index, sentIdx)}
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

function splitIntoSentences(text: string): SentenceState[] {
  const result: SentenceState[] = [];

  if (text.includes("\n\n") || text.includes("\r\n\r\n")) {
    const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/);
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx].trim();
      if (!para) continue;
      const sentences = extractSentences(para);
      sentences.forEach((s) => result.push({ text: s, translating: false, paragraphIndex: pIdx }));
    }
  } else {
    const allSentences = extractSentences(text);
    const SENTENCES_PER_PARA = 4;
    let pIdx = 0;
    for (let i = 0; i < allSentences.length; i += SENTENCES_PER_PARA) {
      const chunk = allSentences.slice(i, i + SENTENCES_PER_PARA);
      chunk.forEach((s) => result.push({ text: s, translating: false, paragraphIndex: pIdx }));
      pIdx++;
    }
  }

  return result.filter((s) => s.text.length > 0);
}

function extractSentences(text: string): string[] {
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

  return result;
}

function groupByParagraphs(sentences: SentenceState[]): ParagraphGroup[] {
  const groups: Map<number, SentenceState[]> = new Map();
  for (const s of sentences) {
    if (!groups.has(s.paragraphIndex)) groups.set(s.paragraphIndex, []);
    groups.get(s.paragraphIndex)!.push(s);
  }
  return Array.from(groups.entries()).map(([index, sentences]) => ({ index, sentences }));
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
