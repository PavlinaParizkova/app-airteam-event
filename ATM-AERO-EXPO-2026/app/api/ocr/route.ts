/**
 * OCR přes Google Gemini 2.5 Flash.
 *
 * Dostane URL obrázku (typicky thumbnail z Google Drive nebo Vercel Blob),
 * stáhne ho, pošle do Gemini Vision a vrátí vyčtený text.
 *
 * Pokud jde o vizitku, model vrací rovnou strukturovaný přepis
 * (Jméno / Pozice / Společnost / Telefon / Email / Web / Adresa).
 *
 * Proměnná prostředí: GEMINI_API_KEY (AI Studio, zdarma, 1500 req/den).
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const OCR_PROMPT = `Jsi asistent pro rychlé čtení vizitek a poznámek na veletrhu AERO EXPO.
Přečti VEŠKERÝ viditelný text z obrázku.

Postupuj takto:
1. Pokud jde o vizitku firmy / osoby, vrať strukturovaně v tomto formátu (vynechej řádky, které na vizitce nejsou):

Jméno: <celé jméno>
Pozice: <job title>
Společnost: <název firmy>
Divize: <divize / oddělení, je-li uvedena>
Telefon: <mezinárodní formát s mezerami>
Email: <email>
Web: <web bez https://>
Adresa: <adresa jedním řádkem>
Poznámky: <další text na vizitce – claim, motto, ...>

2. Pokud jde o ručně psanou poznámku, ceník, leták, plakát nebo jiný materiál,
vrať přesně přepsaný text zachovávající řádkování. Nic nepřidávej.

3. Pokud nic čitelného na obrázku není, vrať jediný řádek:
(text nečitelný)

Vždy piš v češtině. Žádné úvody ani komentáře – jen samotný přepis.`;

async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const resp = await fetch(url, { redirect: "follow" });
  if (!resp.ok) {
    throw new Error(`Obrázek se nepodařilo stáhnout (HTTP ${resp.status}).`);
  }
  const mimeType = resp.headers.get("content-type")?.split(";")[0].trim() || "image/jpeg";
  const arrayBuffer = await resp.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return { base64, mimeType };
}

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Chybí GEMINI_API_KEY na Vercelu. Zdarma ho získáte na aistudio.google.com → Get API key.",
      },
      { status: 500 },
    );
  }

  let payload: { imageUrl?: string; imageBase64?: string; mimeType?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatné tělo požadavku." }, { status: 400 });
  }

  let base64: string;
  let mimeType: string;
  try {
    if (payload.imageBase64) {
      base64 = payload.imageBase64;
      mimeType = payload.mimeType || "image/jpeg";
    } else if (payload.imageUrl) {
      // URL může být absolutní (Google Drive) nebo relativní (/api/blob) – převedeme na absolutní
      let url = payload.imageUrl;
      if (url.startsWith("/")) {
        const origin = new URL(request.url).origin;
        url = new URL(url, origin).href;
      }
      const res = await urlToBase64(url);
      base64 = res.base64;
      mimeType = res.mimeType;
    } else {
      return NextResponse.json(
        { error: "Chybí imageUrl nebo imageBase64." },
        { status: 400 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Nepodařilo se načíst obrázek." },
      { status: 500 },
    );
  }

  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: OCR_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = (await geminiRes.json()) as GeminiResponse;

    if (!geminiRes.ok) {
      const msg = data.error?.message ?? `Gemini vrátil HTTP ${geminiRes.status}`;
      return NextResponse.json({ error: `Gemini: ${msg}` }, { status: 502 });
    }

    if (data.promptFeedback?.blockReason) {
      return NextResponse.json(
        {
          error: `Gemini obrázek zablokoval: ${data.promptFeedback.blockReason}.`,
        },
        { status: 502 },
      );
    }

    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
    if (!text) {
      return NextResponse.json(
        { error: "Gemini nevrátil žádný text." },
        { status: 502 },
      );
    }

    return NextResponse.json({ text });
  } catch (e) {
    console.error("OCR error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "OCR selhalo." },
      { status: 500 },
    );
  }
}
