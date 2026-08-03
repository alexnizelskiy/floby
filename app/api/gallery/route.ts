import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveImage, StorageError } from "@/lib/storage";
import { createGalleryItem, getPublishedGallery } from "@/lib/gallery";

const CLEANING_TYPES = new Set(["regular", "general", "post_renovation"]);

export async function GET() {
  try {
    const items = await getPublishedGallery(12);
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: true, items: [] });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  // Executors upload from the field (pending); staff upload published directly.
  const canUpload =
    user?.role === "executor" || user?.role === "manager" || user?.role === "admin";
  if (!canUpload) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  const before = form.get("before");
  const after = form.get("after");
  if (!(before instanceof File) || !(after instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_files" }, { status: 422 });
  }

  const title = (form.get("title") as string | null)?.slice(0, 120).trim() || null;
  const rawType = (form.get("cleaningType") as string | null) ?? "";
  const cleaningType = CLEANING_TYPES.has(rawType) ? rawType : null;
  const bookingId = (form.get("bookingId") as string | null) || null;

  try {
    const [beforeUrl, afterUrl] = await Promise.all([
      saveImage(before, "gallery"),
      saveImage(after, "gallery"),
    ]);
    const isStaffUser = user?.role === "manager" || user?.role === "admin";
    const id = await createGalleryItem({
      beforeUrl,
      afterUrl,
      title,
      cleaningType,
      bookingId,
      createdBy: user!.id,
      published: isStaffUser,
    });
    return NextResponse.json({ ok: true, id, published: isStaffUser });
  } catch (err) {
    if (err instanceof StorageError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 422 });
    }
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
  }
}
