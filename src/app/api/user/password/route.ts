import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function PUT(request: Request) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写旧密码和新密码" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码至少6位" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const isValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "旧密码错误" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ message: "密码修改成功" });
  } catch {
    return NextResponse.json({ error: "修改密码失败" }, { status: 500 });
  }
}
