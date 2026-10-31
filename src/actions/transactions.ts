"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseDateInput } from "@/lib/dates";
import { dollarsToCents } from "@/lib/money";
import {
  deleteReceiptRecord,
  deleteTransactionRecord,
  findReceiptByTransactionId,
  getTransaction,
  insertReceipt,
  insertTransaction,
  updateTransactionRecord,
} from "@/lib/queries";
import { deleteReceiptFile, saveReceipt } from "@/lib/receipts";
import { fieldErrors, transactionSchema } from "@/lib/validations";

export type TransactionActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function persistReceipt(transactionId: string, file: File | null, replace = false) {
  if (!file || file.size === 0) return;

  const saved = await saveReceipt(file);

  if (replace) {
    const existing = await findReceiptByTransactionId(transactionId);
    if (existing) {
      await deleteReceiptFile(existing.fileName);
      await deleteReceiptRecord(existing.id);
    }
  }

  await insertReceipt({
    transactionId,
    fileName: saved.fileName,
    originalName: saved.originalName,
    mimeType: saved.mimeType,
    sizeBytes: saved.sizeBytes,
  });
}

function parseTransaction(formData: FormData) {
  return transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description"),
    vendor: formData.get("vendor") || undefined,
    payer: formData.get("payer") || undefined,
    paidBy: formData.get("paidBy") || undefined,
    notes: formData.get("notes") || undefined,
    productId: formData.get("productId") || undefined,
    categoryId: formData.get("categoryId") || undefined,
  });
}

function toData(values: ReturnType<typeof transactionSchema.parse>) {
  const date = parseDateInput(values.date);
  if (!date) {
    throw new Error("Enter a valid date.");
  }

  return {
    type: values.type,
    amountCents: dollarsToCents(values.amount),
    date,
    description: values.description,
    vendor: values.type === "expense" ? values.vendor ?? null : null,
    payer: values.type === "income" ? values.payer ?? null : null,
    paidBy: values.type === "expense" ? values.paidBy ?? null : null,
    notes: values.notes ?? null,
    productId: values.productId ?? null,
    categoryId: values.type === "expense" ? values.categoryId ?? null : null,
  };
}

export async function createTransaction(
  _prev: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  await requireUser();
  const parsed = parseTransaction(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const receipt = formData.get("receipt");
  const file = receipt instanceof File ? receipt : null;

  try {
    const created = await insertTransaction(toData(parsed.data));
    await persistReceipt(created.id, file);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save this transaction.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/products");
  revalidatePath("/reports");
  redirect("/transactions");
}

export async function updateTransaction(
  id: string,
  _prev: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  await requireUser();

  const existing = await getTransaction(id);
  if (!existing) {
    return { error: "This transaction was not found." };
  }

  const parsed = parseTransaction(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const receipt = formData.get("receipt");
  const file = receipt instanceof File ? receipt : null;

  try {
    await updateTransactionRecord(id, toData(parsed.data));
    await persistReceipt(id, file, true);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not update this transaction.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath(`/transactions/${id}`);
  revalidatePath("/products");
  revalidatePath("/reports");
  redirect(`/transactions/${id}`);
}

export async function deleteTransaction(id: string) {
  await requireUser();
  const existing = await getTransaction(id);
  if (!existing) {
    return { error: "This transaction was not found." };
  }

  if (existing.receipt) {
    await deleteReceiptFile(existing.receipt.fileName);
  }
  await deleteTransactionRecord(id);

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/products");
  revalidatePath("/reports");
  redirect("/transactions");
}

export async function removeReceipt(transactionId: string) {
  await requireUser();
  const receipt = await findReceiptByTransactionId(transactionId);
  if (!receipt) {
    return { error: "No receipt is attached." };
  }

  await deleteReceiptFile(receipt.fileName);
  await deleteReceiptRecord(receipt.id);

  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath("/transactions");
  revalidatePath("/reports");
}
