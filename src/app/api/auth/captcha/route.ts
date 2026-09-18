import { NextResponse } from "next/server";
import { generateCaptcha, storeCaptcha } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const rateLimit = await consumeRateLimit(request, {
    scope: "captcha",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  const captcha = generateCaptcha();
  await storeCaptcha(captcha.captchaId, captcha.answer);

  return NextResponse.json({
    captchaId: captcha.captchaId,
    question: captcha.question,
  });
}
