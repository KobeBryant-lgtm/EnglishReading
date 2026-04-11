import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const source = await prisma.source.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameCn !== undefined && { nameCn: data.nameCn }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.feedUrl !== undefined && { feedUrl: data.feedUrl }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return NextResponse.json(source);
  } catch {
    return NextResponse.json({ error: "更新来源失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.source.delete({ where: { id } });
    return NextResponse.json({ message: "删除成功" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
