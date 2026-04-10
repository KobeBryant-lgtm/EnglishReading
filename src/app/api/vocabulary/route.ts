import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const vocabulary = await prisma.vocabulary.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        select: { title: true },
      },
    },
  });

  return NextResponse.json(vocabulary);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { word, definition, phonetic, partOfSpeech, exampleSentence, articleId } = body;

  if (!word) {
    return NextResponse.json({ error: "请提供单词" }, { status: 400 });
  }

  const existing = await prisma.vocabulary.findUnique({
    where: { word },
  });

  if (existing) {
    const updated = await prisma.vocabulary.update({
      where: { word },
      data: {
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
        ...(definition && { definition }),
        ...(phonetic && { phonetic }),
        ...(partOfSpeech && { partOfSpeech }),
        ...(exampleSentence && { exampleSentence }),
      },
    });
    return NextResponse.json(updated);
  }

  const vocab = await prisma.vocabulary.create({
    data: {
      word,
      definition,
      phonetic,
      partOfSpeech,
      exampleSentence,
      articleId,
    },
  });

  return NextResponse.json(vocab);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "请提供单词ID" }, { status: 400 });
  }

  await prisma.vocabulary.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { id, mastered } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "请提供单词ID" }, { status: 400 });
  }

  const updated = await prisma.vocabulary.update({
    where: { id },
    data: {
      mastered,
      reviewCount: { increment: 1 },
      lastReviewedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
