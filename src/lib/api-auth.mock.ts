import "server-only";
import { NextResponse } from "next/server";

export async function requireAuth(): Promise<NextResponse | null> {
  return null;
}
