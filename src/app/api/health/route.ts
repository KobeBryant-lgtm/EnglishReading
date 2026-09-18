import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const jwtConfigured = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 24);
  const cronConfigured = Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 24);

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "unavailable",
        configuration: {
          jwt: jwtConfigured ? "configured" : "missing",
          cron: cronConfigured ? "configured" : "missing",
        },
      },
      { status: 503 }
    );
  }

  const healthy = jwtConfigured && cronConfigured;
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      database: "available",
      configuration: {
        jwt: jwtConfigured ? "configured" : "missing",
        cron: cronConfigured ? "configured" : "missing",
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
