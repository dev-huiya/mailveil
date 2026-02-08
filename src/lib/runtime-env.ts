declare global {
  interface Window {
    __ENV__?: { emailDomain: string };
  }
}

/** 서버에서 주입한 런타임 환경변수 (client에서만 사용) */
export function getEmailDomain(): string {
  if (typeof window === "undefined") return "example.com";
  return window.__ENV__?.emailDomain ?? "example.com";
}
