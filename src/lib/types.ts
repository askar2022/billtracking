import { parseDateInput } from "@/lib/dates";
import type {
  CategoryRow,
  ProductRow,
  ReceiptRow,
  TransactionRow,
  UserRow,
} from "@/lib/database.types";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  isOverhead: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Receipt = {
  id: string;
  transactionId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

export type TransactionRecord = {
  id: string;
  type: string;
  amountCents: number;
  date: Date;
  description: string;
  vendor: string | null;
  payer: string | null;
  paidBy: string | null;
  notes: string | null;
  productId: string | null;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: Product | null;
  category: Category | null;
  receipt: Receipt | null;
};

function asDate(value: string) {
  return parseDateInput(value.slice(0, 10)) ?? new Date(value);
}

function asDateTime(value: string) {
  return new Date(value);
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: asDateTime(row.created_at),
    updatedAt: asDateTime(row.updated_at),
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isOverhead: row.is_overhead,
    archived: row.archived,
    createdAt: asDateTime(row.created_at),
    updatedAt: asDateTime(row.updated_at),
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    archived: row.archived,
    createdAt: asDateTime(row.created_at),
    updatedAt: asDateTime(row.updated_at),
  };
}

export function mapReceipt(row: ReceiptRow): Receipt {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    fileName: row.file_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: asDateTime(row.created_at),
  };
}

export function mapTransaction(
  row: TransactionRow & {
    product?: ProductRow | ProductRow[] | null;
    category?: CategoryRow | CategoryRow[] | null;
    receipt?: ReceiptRow | ReceiptRow[] | null;
  },
): TransactionRecord {
  const product = one(row.product);
  const category = one(row.category);
  const receipt = one(row.receipt);

  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    date: asDate(row.date),
    description: row.description,
    vendor: row.vendor,
    payer: row.payer,
    paidBy: row.paid_by,
    notes: row.notes,
    productId: row.product_id,
    categoryId: row.category_id,
    createdAt: asDateTime(row.created_at),
    updatedAt: asDateTime(row.updated_at),
    product: product ? mapProduct(product) : null,
    category: category ? mapCategory(category) : null,
    receipt: receipt ? mapReceipt(receipt) : null,
  };
}

export const TRANSACTION_SELECT =
  "id, type, amount_cents, date, description, vendor, payer, paid_by, notes, product_id, category_id, created_at, updated_at, product:products(*), category:categories(*), receipt:receipts(*)";
