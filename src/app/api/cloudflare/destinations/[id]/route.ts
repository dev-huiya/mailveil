import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getDestination, deleteDestination } from "@/lib/cloudflare";
import { isValidId } from "@/lib/validation";

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
    const data = await getDestination(id);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/destinations/[id]:", (e as Error).message);
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
    const data = await deleteDestination(id);
    return NextResponse.json(data);
  } catch (e) {
    console.error("[API] cloudflare/destinations/[id]:", (e as Error).message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
