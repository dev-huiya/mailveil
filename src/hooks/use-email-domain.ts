"use client";

import { getEmailDomain } from "@/lib/runtime-env";

/** 런타임 환경변수 EMAIL_DOMAIN (서버에서 주입) */
export function useEmailDomain(): string {
  return getEmailDomain();
}
