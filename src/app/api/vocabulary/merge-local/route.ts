import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { words } = await request.json();
    if (!Array.isArray(words)) {
      return NextResponse.json({ error: "数据格式错误" }, { status: 400 });
    }

    let merged = 0;
    let skipped = 0;

    for (const w of words) {
      if (!w.word) continue;

      const existing = await prisma.vocabulary.findUnique({
        where: { userId_word: { userId, word: w.word } },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.vocabulary.create({
        data: {
          userId,
          word: w.word,
          definition: w.definition || null,
          phonetic: w.phonetic || null,
          partOfSpeech: w.partOfSpeech || null,
          exampleSentence: w.exampleSentence || null,
          articleId: w.articleId || null,
          mastered: w.mastered || false,
          status: w.mastered ? "mastered" : "learning",
        },
      });
      merged++;
    }

    return NextResponse.json({ merged, skipped, total: words.length });
  } catch {
    return NextResponse.json({ error: "合并失败" }, { status: 500 });
  }
}
