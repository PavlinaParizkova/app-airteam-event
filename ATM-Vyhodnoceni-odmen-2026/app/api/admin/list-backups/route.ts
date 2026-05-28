/**
 * GET /api/admin/list-backups
 * Vrátí seznam dostupných záloh z Vercel Blob. Admin only.
 */
import { NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json({ ok: false, error: "BLOB_READ_WRITE_TOKEN není nastaven — zálohy nejsou k dispozici." });
  }

  try {
    const { blobs } = await list({ prefix: "backups/", token: blobToken });
    const sorted = blobs
      .sort((a, b) => b.uploadedAt.toISOString().localeCompare(a.uploadedAt.toISOString()))
      .map((b) => ({ url: b.url, pathname: b.pathname, uploadedAt: b.uploadedAt }));
    return NextResponse.json({ ok: true, count: sorted.length, backups: sorted });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
