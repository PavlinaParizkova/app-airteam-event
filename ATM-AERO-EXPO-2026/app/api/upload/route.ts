/**
 * Nahrávání fotek: primárně Google Drive (env GOOGLE_DRIVE_*).
 * BLOB_READ_WRITE_TOKEN se použije jen když není nastavené GOOGLE_DRIVE_FOLDER_ID
 * nebo nejsou platné Drive údaje (viz logika níže). Token na Vercelu při výstraze
 * „Need To Rotate“ obnovte v Storage → Blob → přegenerujte a aktualizujte env.
 */
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import {
  isGoogleDriveFolderIdSet,
  isGoogleDriveUploadConfigured,
  uploadImageToGoogleDrive,
  validateGoogleDriveEnvForUpload,
} from "@/app/lib/google-drive-upload";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeFileName(name: string): string {
  const trimmed = name.trim() || "image.jpg";
  return trimmed.replace(/[^\w.\- ()[\]ČčŘřŽžÁáÉéÍíÓóÚúĎďĚěŇňŤť]/g, "_").slice(0, 200);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nepřihlášen" }, { status: 401 });
  }

  const useDrive = isGoogleDriveUploadConfigured();
  const driveFolderSet = isGoogleDriveFolderIdSet();
  const driveEnvError = validateGoogleDriveEnvForUpload();
  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  console.info(
    "[upload]",
    useDrive
      ? "using Google Drive"
      : driveFolderSet
        ? "Drive folder ID set but credentials incomplete — must not use Blob"
        : "Drive not configured, using Blob if token set",
  );

  if (driveFolderSet && driveEnvError) {
    return NextResponse.json(
      {
        error: `Google Drive: ${driveEnvError} Blob se v tomto režimu nepoužije.`,
      },
      { status: 500 },
    );
  }

  if (!useDrive && !useBlob) {
    return NextResponse.json(
      {
        error:
          "Není nastavené úložiště: buď Google Drive (GOOGLE_DRIVE_FOLDER_ID + service account), nebo Vercel Blob (BLOB_READ_WRITE_TOKEN).",
      },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Žádný soubor." }, { status: 400 });
    }

    const baseName = `${Date.now()}-${safeFileName(file.name)}`;

    if (useDrive) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "image/jpeg";
      const { url, fileId } = await uploadImageToGoogleDrive(baseName, buffer, mime);
      return NextResponse.json({ url, pathname: fileId, storage: "gdrive" as const });
    }

    const blob = await put(`aero-expo-2026/${baseName}`, file, {
      access: "private",
      addRandomSuffix: true,
    });

    const url = `/api/blob?p=${encodeURIComponent(blob.pathname)}`;
    return NextResponse.json({
      url,
      pathname: blob.pathname,
      storage: "blob" as const,
    });
  } catch (e) {
    console.error("Upload error:", e);
    const message = e instanceof Error ? e.message : "Upload selhal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
