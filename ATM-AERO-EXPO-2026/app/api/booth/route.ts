import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "aero-expo-booth-v1";

export type BoothStatus = "booth" | "customer" | "offsite" | "away";

type BoothEntry = { status: BoothStatus; since: string };
type BoothState = Record<string, BoothEntry>;

export async function GET() {
  try {
    const data = await redis.get<BoothState>(KEY);
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, status } = await request.json() as { name: string; status: BoothStatus };
    if (!name || !status) return NextResponse.json({ error: "Chybí name nebo status." }, { status: 400 });
    const current = (await redis.get<BoothState>(KEY)) ?? {};
    const updated: BoothState = {
      ...current,
      [name]: { status, since: new Date().toISOString() },
    };
    await redis.set(KEY, updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}
