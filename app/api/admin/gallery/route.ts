import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getAllGallery } from "@/lib/gallery";

export async function GET() {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const items = await getAllGallery();
  return NextResponse.json({ ok: true, items });
}
