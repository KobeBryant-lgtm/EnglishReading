import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, generateAccessToken, generateRefreshToken, verifyCaptcha } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "账号已被禁用" }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const access_token = generateAccessToken(tokenPayload);
    const refresh_token = generateRefreshToken(tokenPayload);

    return NextResponse.json({
      access_token,
      refresh_token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
