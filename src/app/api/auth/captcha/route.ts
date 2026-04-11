import { NextResponse } from "next/server";
import { generateCaptcha, storeCaptcha } from "@/lib/auth";

export async function GET() {
  const { captchaId, question } = generateCaptcha();
  const captcha = generateCaptcha();
  storeCaptcha(captcha.captchaId, captcha.answer);

  return NextResponse.json({
    captchaId: captcha.captchaId,
    question: captcha.question,
  });
}
