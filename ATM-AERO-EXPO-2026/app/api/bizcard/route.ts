import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const redis = Redis.fromEnv();
const KEY = "aero-expo-bizcard-v1";

export type BizCard = {
  email: string;
  name: string;
  position: string;
  division: string;
  phone: string;
  bizEmail: string;
  updatedAt: string;
};

export async function GET() {
  try {
    const data = await redis.get<BizCard[]>(KEY);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Nepřihlášen." }, { status: 401 });
    }

    const body = await request.json() as Omit<BizCard, "email" | "updatedAt">;
    const email = (session.user.email ?? "").toLowerCase();

    const existing = await redis.get<BizCard[]>(KEY) ?? [];
    const filtered = existing.filter((c) => c.email !== email);
    const updated: BizCard = {
      ...body,
      email,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(KEY, [...filtered, updated]);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}
