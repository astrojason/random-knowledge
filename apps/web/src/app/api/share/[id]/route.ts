import { NextResponse } from "next/server";
import { getSharePreviewAdmin } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

/** Public on purpose: exposes only the title, category and sender so a friend without access sees what they were invited to. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const preview = await getSharePreviewAdmin(id);
    if (!preview) return NextResponse.json({ error: "Share not found" }, { status: 404 });
    return NextResponse.json(preview);
  } catch (err) {
    console.error("share preview failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load share" }, { status: 500 });
  }
}
