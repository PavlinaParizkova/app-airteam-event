import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "aero-expo-notes-v1";

type NotesState = { content: string; updatedAt: string; updatedBy: string };

export async function GET() {
  try {
    const data = await redis.get<NotesState>(KEY);
    return NextResponse.json(data ?? { content: "", updatedAt: "", updatedBy: "" });
  } catch {
    return NextResponse.json({ content: "", updatedAt: "", updatedBy: "" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content, updatedBy } = await request.json() as { content: string; updatedBy?: string };
    const updated: NotesState = {
      content: content ?? "",
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy ?? "",
    };
    await redis.set(KEY, updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}
