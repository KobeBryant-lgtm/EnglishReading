import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      translations: {
        orderBy: { paragraphIndex: "asc" },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "文章未找到" }, { status: 404 });
  }

  return NextResponse.json(article);
}
