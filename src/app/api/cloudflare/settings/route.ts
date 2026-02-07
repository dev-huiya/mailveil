import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getSettings,
  enableEmailRouting,
  disableEmailRouting,
} from "@/lib/cloudflare";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await getSettings();
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
    const { enabled } = await request.json();
    const data = enabled
      ? await enableEmailRouting()
      : await disableEmailRouting();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
