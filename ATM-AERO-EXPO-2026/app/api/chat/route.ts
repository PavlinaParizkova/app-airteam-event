import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();
const KEY = "aero-expo-chat-v1";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  editedAt?: string;
};

export async function GET() {
  try {
    const data = await redis.get<ChatMessage[]>(KEY);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { author, text } = await request.json() as { author: string; text: string };
    if (!author || !text?.trim()) {
      return NextResponse.json({ error: "Chybí autor nebo text." }, { status: 400 });
    }
    const current = (await redis.get<ChatMessage[]>(KEY)) ?? [];
    const updated: ChatMessage[] = [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      },
    ];
    await redis.set(KEY, updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při ukládání." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, text } = await request.json() as { id: string; text: string };
    if (!id || !text?.trim()) {
      return NextResponse.json({ error: "Chybí ID nebo text." }, { status: 400 });
    }
    const current = (await redis.get<ChatMessage[]>(KEY)) ?? [];
    const updated = current.map((msg) =>
      (msg.id ?? msg.timestamp) === id
        ? { ...msg, id: msg.id ?? msg.timestamp, text: text.trim(), editedAt: new Date().toISOString() }
        : msg
    );
    await redis.set(KEY, updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Chyba při úpravě." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await redis.set(KEY, []);
    return NextResponse.json([]);
  } catch {
    return NextResponse.json({ error: "Chyba při mazání." }, { status: 500 });
  }
}
