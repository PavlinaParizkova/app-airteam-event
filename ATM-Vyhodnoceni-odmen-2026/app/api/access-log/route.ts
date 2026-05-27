import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/app/lib/getAuth";
import { appendAccessLog, listAccessLogs } from "@/app/lib/access-log";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let path = "/";
  try {
    const body = (await req.json()) as { path?: string };
    if (body.path && typeof body.path === "string") {
      path = body.path.startsWith("/") ? body.path : `/${body.path}`;
    }
  } catch {
    /* prázdné tělo OK */
  }

  await appendAccessLog({
    email: email.toLowerCase(),
    name: session.user?.name ?? email,
    path,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAuth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await listAccessLogs(1000);
  return NextResponse.json({ entries });
}
