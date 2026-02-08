declare global {
  interface Window {
    __ENV__?: { emailDomain: string };
  }
}

/** 런타임 환경변수 EMAIL_DOMAIN — SSR에서도 실제 값을 반환하여 hydration mismatch 방지 */
export function getEmailDomain(): string {
  if (typeof window === "undefined") {
    return process.env.EMAIL_DOMAIN || process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "example.com";
  }
  return window.__ENV__?.emailDomain ?? "example.com";
}
