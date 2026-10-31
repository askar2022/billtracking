import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";
import { findReceiptById } from "@/lib/queries";
import { receiptPath } from "@/lib/receipts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const receipt = await findReceiptById(id);

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  try {
    const file = await readFile(receiptPath(receipt.fileName));
    return new NextResponse(Uint8Array.from(file), {
      headers: {
        "Content-Type": receipt.mimeType,
        "Content-Disposition": `inline; filename="${receipt.originalName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Receipt file is missing" }, { status: 404 });
  }
}
