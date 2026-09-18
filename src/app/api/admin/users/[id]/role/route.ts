import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

class AdminGuardError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role } = await request.json();
    const currentUserId = request.headers.get("x-user-id");

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 });
    }

    if (currentUserId === id && role !== "admin") {
      return NextResponse.json({ error: "不能降低当前登录账号的管理员权限" }, { status: 400 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({
        where: { id },
        select: { role: true, status: true },
      });
      if (!target) throw new AdminGuardError("用户不存在", 404);

      if (target.role === "admin" && role === "user" && target.status === "active") {
        const activeAdminCount = await tx.user.count({
          where: { role: "admin", status: "active" },
        });
        if (activeAdminCount <= 1) {
          throw new AdminGuardError("必须至少保留一名正常状态的管理员", 400);
        }
      }

      return tx.user.update({
        where: { id },
        data: { role },
        select: { id: true, username: true, role: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof AdminGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to change user role:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
