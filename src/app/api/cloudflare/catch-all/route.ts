import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getCatchAll, updateCatchAll } from "@/lib/cloudflare";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await getCatchAll();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/catch-all:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = await updateCatchAll(body);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/catch-all:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
