import { NextResponse } from "next/server";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { deleteGalleryItem, setGalleryPublished } from "@/lib/gallery";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { published?: boolean };
  if (typeof body.published !== "boolean") {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }
  await setGalleryPublished(id, body.published);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!isStaff(user)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const { id } = await params;
  await deleteGalleryItem(id);
  return NextResponse.json({ ok: true });
}
