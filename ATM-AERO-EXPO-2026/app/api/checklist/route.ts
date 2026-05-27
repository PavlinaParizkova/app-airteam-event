import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

type ChecklistState = Record<string, boolean>;

function keyFor(name: string) {
  return `aero-expo-checklist-${name}-v1`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("key");
    if (!name) return NextResponse.json({ error: "Chybí parametr key." }, { status: 400 });
    const data = await redis.get<ChecklistState>(keyFor(name));
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { key, checked } = await request.json() as { key: string; checked: ChecklistState };
    if (!key) return NextResponse.json({ error: "Chybí key." }, { status: 400 });
    await redis.set(keyFor(key), checked);
    return NextResponse.json(checked);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}
