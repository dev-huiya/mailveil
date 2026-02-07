import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getRule, updateRule, deleteRule } from "@/lib/cloudflare";
import { isValidId, validateUpdateRule } from "@/lib/validation";
import type { UpdateRuleRequest } from "@/types/cloudflare";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const data = await getRule(id);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/rules/[id]:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const body = await request.json();
    const error = validateUpdateRule(body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    const data = await updateRule(id, body as UpdateRuleRequest);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/rules/[id]:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const data = await deleteRule(id);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/rules/[id]:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
