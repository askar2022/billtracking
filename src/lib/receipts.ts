import "server-only";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { ALLOWED_RECEIPT_TYPES, MAX_RECEIPT_BYTES } from "@/lib/constants";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

export type SavedReceipt = {
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

export function isAllowedReceipt(file: File) {
  return (
    (ALLOWED_RECEIPT_TYPES as readonly string[]).includes(file.type) &&
    file.size > 0 &&
    file.size <= MAX_RECEIPT_BYTES
  );
}

export async function saveReceipt(file: File): Promise<SavedReceipt> {
  if (!isAllowedReceipt(file)) {
    throw new Error("Upload a JPG, PNG, WebP, or PDF receipt up to 8 MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const extension = EXTENSIONS[file.type] ?? "";
  const fileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return {
    fileName,
    originalName: file.name.slice(0, 180) || fileName,
    mimeType: file.type,
    sizeBytes: file.size,
  };
}

export function receiptPath(fileName: string) {
  const safeName = path.basename(fileName);
  return path.join(UPLOAD_DIR, safeName);
}

export async function deleteReceiptFile(fileName: string) {
  try {
    await unlink(receiptPath(fileName));
  } catch {
    // The database row is the source of truth; missing files should not block deletes.
  }
}
