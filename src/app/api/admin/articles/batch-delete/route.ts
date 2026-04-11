import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "请选择要删除的文章" }, { status: 400 });
    }

    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "批量删除成功" });
  } catch {
    return NextResponse.json({ error: "批量删除失败" }, { status: 500 });
  }
}
