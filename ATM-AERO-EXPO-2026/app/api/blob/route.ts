/**
 * Proxy pro staré přílohy uložené ve Vercel Blob (/api/blob?p=…).
 * Vyžaduje BLOB_READ_WRITE_TOKEN (stejný jako u uploadu). Po plném přechodu na Disk
 * můžete token nechat kvůli čtení starých zápisů, nebo je po migraci odstranit.
 */
import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

async function streamBlob(
  ref: string,
): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  for (const access of ["private", "public"] as const) {
    try {
      const result = await get(ref, { access });
      if (result?.statusCode === 200 && result.stream) {
        return { stream: result.stream, contentType: result.blob.contentType };
      }
    } catch {
      // zkusíme druhou úroveň přístupu (legacy veřejné objekty vs. nové soukromé)
    }
  }
  return null;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Nepřihlášen", { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse("Blob store není nakonfigurován", { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const p = searchParams.get("p");
  const u = searchParams.get("u");
  const ref = p ?? u;
  if (!ref) {
    return new NextResponse("Chybí parametr p nebo u", { status: 400 });
  }

  const data = await streamBlob(ref);
  if (!data) {
    return new NextResponse("Soubor nenalezen", { status: 404 });
  }

  return new NextResponse(data.stream, {
    headers: {
      "Content-Type": data.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
