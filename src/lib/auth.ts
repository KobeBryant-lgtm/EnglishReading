import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const ACCESS_TOKEN_EXPIRES = "24h";
const REFRESH_TOKEN_EXPIRES = "7d";
const MIN_SECRET_LENGTH = 24;

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be configured with at least ${MIN_SECRET_LENGTH} characters`);
  }
  return secret;
}

function hashCaptchaAnswer(captchaId: string, answer: number): string {
  return createHmac("sha256", getJwtSecret())
    .update(`${captchaId}:${answer}`)
    .digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRES });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function generateCaptcha() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const answer = a + b;
  const captchaId = Math.random().toString(36).substring(2, 10);
  return { captchaId, question: `${a} + ${b} = ?`, answer };
}

export async function storeCaptcha(captchaId: string, answer: number) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  await Promise.all([
    prisma.captchaChallenge.upsert({
      where: { id: captchaId },
      create: {
        id: captchaId,
        answerHash: hashCaptchaAnswer(captchaId, answer),
        expiresAt,
      },
      update: {
        answerHash: hashCaptchaAnswer(captchaId, answer),
        expiresAt,
      },
    }),
    prisma.captchaChallenge.deleteMany({
      where: { expiresAt: { lt: now } },
    }),
  ]);
}

export async function verifyCaptcha(captchaId: string, userAnswer: number): Promise<boolean> {
  if (!Number.isFinite(userAnswer)) return false;

  try {
    // Deleting first makes each challenge single-use even when the answer is
    // wrong and prevents concurrent replay across serverless instances.
    const challenge = await prisma.captchaChallenge.delete({
      where: { id: captchaId },
    });
    if (challenge.expiresAt <= new Date()) return false;

    const expected = Buffer.from(challenge.answerHash, "hex");
    const received = Buffer.from(hashCaptchaAnswer(captchaId, userAnswer), "hex");
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}
