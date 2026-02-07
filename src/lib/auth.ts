import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || randomBytes(32).toString("hex")
  );
}

function getAuthPin(): string {
  const pin = process.env.AUTH_PIN;
  if (!pin && process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
    throw new Error("AUTH_PIN environment variable is required in production");
  }
  return pin || "000000";
}

const JWT_SECRET = getJwtSecretBytes();
const AUTH_PIN = getAuthPin();

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
