import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { listRules, createRule } from "@/lib/cloudflare";
import { validateCreateRule } from "@/lib/validation";
import type { CreateRuleRequest } from "@/types/cloudflare";

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await listRules();
    if (Array.isArray(data.result)) {
      data.result = data.result.filter(
        (rule) => rule.matchers?.[0]?.type !== "all"
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/rules:", (e as Error).message);
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
    const body = await request.json();
    const error = validateCreateRule(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    const data = await createRule(body as CreateRuleRequest);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/rules:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
