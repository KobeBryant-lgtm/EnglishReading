import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateAccessToken, generateRefreshToken, verifyCaptcha } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password, captchaId, captchaAnswer } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请填写用户名和密码" }, { status: 400 });
    }

    if (username.length < 4 || username.length > 20) {
      return NextResponse.json({ error: "用户名需4-20位" }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "用户名仅限字母/数字/下划线" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    if (!captchaId || captchaAnswer === undefined) {
      return NextResponse.json({ error: "请填写验证码" }, { status: 400 });
    }

    if (!verifyCaptcha(captchaId, Number(captchaAnswer))) {
      return NextResponse.json({ error: "验证码错误" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        nickname: username,
      },
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
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
