export function checkRateLimit(_ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  return { allowed: true, remaining: 99, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(_ip: string): void {}

export function clearAttempts(_ip: string): void {}
