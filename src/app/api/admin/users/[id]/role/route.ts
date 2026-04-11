import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role } = await request.json();

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
