import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { listDestinations, createDestination } from "@/lib/cloudflare";
import { isValidEmail } from "@/lib/validation";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await listDestinations();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/destinations:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }
    const data = await createDestination(email);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/destinations:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
