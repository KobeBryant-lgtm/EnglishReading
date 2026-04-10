import { NextResponse } from "next/server";
import type { DictionaryResult } from "@/types";

const PART_OF_SPEECH_CN: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "interj.",
  determiner: "det.",
  abbreviation: "abbr.",
};

async function translateWithDeepL(text: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  const apiUrl = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2";

  if (!apiKey || apiKey === "your_deepl_api_key_here") return text;

  try {
    const response = await fetch(`${apiUrl}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        target_lang: "ZH",
        source_lang: "EN",
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data.translations?.[0]?.text || text;
  } catch {
    return text;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word")?.trim().toLowerCase();

  if (!word) {
    return NextResponse.json({ error: "请提供要查询的单词" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      const cnDef = await translateWithDeepL(word);
      return NextResponse.json({
        word,
        phonetic: "",
        meanings: [{
          partOfSpeech: "n./v.",
          definitions: [{
            definition: cnDef,
          }],
        }],
      } as DictionaryResult);
    }

    const data = await response.json();
    const entry = data[0];

    const phonetic = entry.phonetic || entry.phonetics?.find((p: { text?: string }) => p.text)?.text || "";

    const rawMeanings = (entry.meanings || []).slice(0, 3).map((m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => ({
      partOfSpeech: PART_OF_SPEECH_CN[m.partOfSpeech] || m.partOfSpeech,
      definitions: (m.definitions || []).slice(0, 2).map((d: { definition: string; example?: string }) => ({
        definition: d.definition,
        example: d.example,
      })),
    }));

    const definitionsToTranslate = rawMeanings.flatMap((m: { definitions: { definition: string }[] }) =>
      m.definitions.map((d: { definition: string }) => d.definition)
    );
    const examplesToTranslate = rawMeanings.flatMap((m: { definitions: { example?: string }[] }) =>
      m.definitions.filter((d: { example?: string }) => d.example).map((d: { example?: string }) => d.example || "")
    );

    const allTexts = [...definitionsToTranslate, ...examplesToTranslate];
    const batchText = allTexts.join("\n");

    let translatedBatch: string[];
    try {
      const apiKey = process.env.DEEPL_API_KEY;
      const apiUrl = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2";

      if (apiKey && apiKey !== "your_deepl_api_key_here") {
        const trRes = await fetch(`${apiUrl}/translate`, {
          method: "POST",
          headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            text: definitionsToTranslate.map((t: string) => t),
            target_lang: "ZH",
            source_lang: "EN",
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (trRes.ok) {
          const trData = await trRes.json();
          translatedBatch = (trData.translations || []).map((t: { text: string }) => t.text);
        } else {
          translatedBatch = definitionsToTranslate;
        }
      } else {
        translatedBatch = definitionsToTranslate;
      }
    } catch {
      translatedBatch = definitionsToTranslate;
    }

    let defIndex = 0;
    const meanings = rawMeanings.map((m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.map((d: { definition: string; example?: string }) => ({
        definition: translatedBatch[defIndex++] || d.definition,
        example: d.example,
      })),
    }));

    const result: DictionaryResult = {
      word: entry.word || word,
      phonetic,
      meanings,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Dictionary lookup error:", error);
    return NextResponse.json(
      { error: "词典查询失败" },
      { status: 500 }
    );
  }
}
