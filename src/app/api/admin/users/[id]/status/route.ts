import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!["active", "disabled"].includes(status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, username: true, status: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
