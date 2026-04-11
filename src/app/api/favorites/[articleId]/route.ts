import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ isFavorited: false });
  }

  try {
    const { articleId } = await params;
    const favorite = await prisma.userFavorite.findUnique({
      where: { userId_articleId: { userId, articleId } },
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch {
    return NextResponse.json({ isFavorited: false });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { articleId } = await params;
    await prisma.userFavorite.deleteMany({
      where: { userId, articleId },
    });

    return NextResponse.json({ message: "取消收藏成功" });
  } catch {
    return NextResponse.json({ error: "取消收藏失败" }, { status: 500 });
  }
}
