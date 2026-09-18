import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Prisma.VocabularyWhereInput = { userId };
    if (status === "learning") where.mastered = false;
    if (status === "mastered") where.mastered = true;
    if (search) where.word = { contains: search, mode: "insensitive" };

    const [vocabulary, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          article: {
            select: { title: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.vocabulary.count({ where }),
    ]);

    return NextResponse.json({ vocabulary, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "获取生词列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { word, definition, phonetic, partOfSpeech, exampleSentence, articleId } = body;

    if (!word) {
      return NextResponse.json({ error: "请提供单词" }, { status: 400 });
    }

    const existing = await prisma.vocabulary.findUnique({
      where: { userId_word: { userId, word } },
    });

    if (existing) {
      const updated = await prisma.vocabulary.update({
        where: { id: existing.id },
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
        userId,
      },
    });

    return NextResponse.json(vocab);
  } catch {
    return NextResponse.json({ error: "添加生词失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "请提供单词ID" }, { status: 400 });
    }

    const where: Prisma.VocabularyWhereInput = {
      id,
      userId,
    };

    await prisma.vocabulary.deleteMany({ where });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { id, mastered, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "请提供单词ID" }, { status: 400 });
    }

    const updateData: Prisma.VocabularyUpdateInput = {
      reviewCount: { increment: 1 },
      lastReviewedAt: new Date(),
    };
    if (mastered !== undefined) updateData.mastered = mastered;
    if (status) updateData.status = status;

    const target = await prisma.vocabulary.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "单词不存在" }, { status: 404 });
    }

    const updated = await prisma.vocabulary.update({
      where: { id: target.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
