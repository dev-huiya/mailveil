import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { listRules, createRule } from "@/lib/cloudflare";
import type { CreateRuleRequest } from "@/types/cloudflare";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await listRules();
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
    const body: CreateRuleRequest = await request.json();
    const data = await createRule(body);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
