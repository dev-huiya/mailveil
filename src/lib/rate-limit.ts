const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ENTRIES = 1000;

// Use globalThis to prevent HMR from creating duplicate Maps/intervals
const RATE_LIMIT_KEY = "__rateLimit" as const;

interface RateLimitStore {
  attempts: Map<string, { count: number; firstAttempt: number }>;
  cleanupTimer: ReturnType<typeof setInterval> | null;
}

function getStore(): RateLimitStore {
  const g = globalThis as unknown as Record<string, RateLimitStore>;
  if (!g[RATE_LIMIT_KEY]) {
    g[RATE_LIMIT_KEY] = { attempts: new Map(), cleanupTimer: null };
  }
  return g[RATE_LIMIT_KEY];
}

function cleanupExpired() {
  const { attempts } = getStore();
  const now = Date.now();
  for (const [ip, record] of attempts) {
    if (now - record.firstAttempt > WINDOW_MS) {
      attempts.delete(ip);
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const { attempts } = getStore();
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (record.firstAttempt + WINDOW_MS - now) / 1000
    );
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    retryAfterSeconds: 0,
  };
}

export function recordFailedAttempt(ip: string): void {
  const { attempts } = getStore();
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    // Evict oldest entries if at capacity
    if (attempts.size >= MAX_ENTRIES) {
      cleanupExpired();
      // If still at capacity after cleanup, drop oldest
      if (attempts.size >= MAX_ENTRIES) {
        const oldest = attempts.keys().next().value;
        if (oldest) attempts.delete(oldest);
      }
    }
    attempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

export function clearAttempts(ip: string): void {
  getStore().attempts.delete(ip);
}

// Periodic cleanup - safe against HMR re-registration
if (typeof setInterval !== "undefined") {
  const store = getStore();
  if (!store.cleanupTimer) {
    store.cleanupTimer = setInterval(cleanupExpired, 30 * 60 * 1000);
  }
}
