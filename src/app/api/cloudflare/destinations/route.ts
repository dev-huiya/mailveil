import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { listDestinations, createDestination } from "@/lib/cloudflare";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await listDestinations();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    const data = await createDestination(email);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
