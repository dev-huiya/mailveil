import "server-only";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "demo-jwt-secret-do-not-use-in-production"
);

const DEMO_PIN = "123456";

export function getPinLength(): number {
  return DEMO_PIN.length;
}

export function verifyPin(pin: string): boolean {
  return pin === DEMO_PIN;
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
