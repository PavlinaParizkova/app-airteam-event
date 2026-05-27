import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "aero-expo-sizes-v1";

type SizeSelections = Record<string, { polo: string; bomber: string }>;

export async function GET() {
  try {
    const data = await redis.get<SizeSelections>(KEY);
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, polo, bomber } = await request.json() as {
      name: string;
      polo: string;
      bomber: string;
    };

    if (!name) {
      return NextResponse.json({ error: "Chybí jméno člena." }, { status: 400 });
    }

    const current = (await redis.get<SizeSelections>(KEY)) ?? {};
    const updated: SizeSelections = {
      ...current,
      [name]: { polo: polo ?? "", bomber: bomber ?? "" },
    };
    await redis.set(KEY, updated);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await redis.set(KEY, {});
    return NextResponse.json({});
  } catch {
    return NextResponse.json({ error: "Chyba při resetování." }, { status: 500 });
  }
}
