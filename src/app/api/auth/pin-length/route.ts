import { NextResponse } from "next/server";
import { getPinLength } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ length: getPinLength() });
}
