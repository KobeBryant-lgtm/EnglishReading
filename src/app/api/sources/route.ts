import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { nameCn: "asc" },
    });

    return NextResponse.json(sources);
  } catch {
    return NextResponse.json({ error: "获取来源列表失败" }, { status: 500 });
  }
}
