type LogLevel = "info" | "warn" | "error";

export function logEvent(
  level: LogLevel,
  event: string,
  details: Record<string, unknown> = {}
) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    ...details,
  });

  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}
