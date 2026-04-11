import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "readeng-v2-secret-key-change-in-production";
const ACCESS_TOKEN_EXPIRES = "24h";
const REFRESH_TOKEN_EXPIRES = "7d";

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
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

const captchaStore = new Map<string, { answer: number; expiresAt: number }>();

export function storeCaptcha(captchaId: string, answer: number) {
  captchaStore.set(captchaId, {
    answer,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  if (captchaStore.size > 1000) {
    const now = Date.now();
    for (const [key, value] of captchaStore) {
      if (value.expiresAt < now) captchaStore.delete(key);
    }
  }
}

export function verifyCaptcha(captchaId: string, userAnswer: number): boolean {
  const stored = captchaStore.get(captchaId);
  if (!stored) return false;
  captchaStore.delete(captchaId);
  if (Date.now() > stored.expiresAt) return false;
  return stored.answer === userAnswer;
}
