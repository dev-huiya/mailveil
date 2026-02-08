import type { NextConfig } from "next";

const isDemoMode = process.env.DEMO_MODE === "true";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["http://172.30.1.90"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  ...(isDemoMode && {
    turbopack: {
      resolveAlias: {
        "@/lib/cloudflare": "@/lib/cloudflare.mock",
        "@/lib/auth": "@/lib/auth.mock",
        "@/lib/api-auth": "@/lib/api-auth.mock",
        "@/lib/rate-limit": "@/lib/rate-limit.mock",
      },
    },
  }),
};

export default nextConfig;
