import { NextResponse } from "next/server";
import { verifyToken, generateAccessToken, generateRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: "缺少 refresh_token" }, { status: 400 });
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "refresh_token 无效或已过期" }, { status: 401 });
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    });

    return NextResponse.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } catch {
    return NextResponse.json({ error: "刷新 token 失败" }, { status: 500 });
  }
}
