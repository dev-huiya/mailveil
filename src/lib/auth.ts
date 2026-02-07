import "server-only";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production"
);

const AUTH_PIN = process.env.AUTH_PIN || "000000";

export function getPinLength(): number {
  return AUTH_PIN.length;
}

export function verifyPin(pin: string): boolean {
  if (pin.length !== AUTH_PIN.length) return false;
  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < pin.length; i++) {
    result |= pin.charCodeAt(i) ^ AUTH_PIN.charCodeAt(i);
  }
  return result === 0;
}

export async function createToken(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
