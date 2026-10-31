import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS, type TransactionType } from "@/lib/constants";
import { enumerateMonths, monthKey, toDateInput } from "@/lib/dates";
import { getSupabase, throwIfError } from "@/lib/supabase";
import {
  TRANSACTION_SELECT,
  mapCategory,
  mapProduct,
  mapReceipt,
  mapTransaction,
  type TransactionRecord,
} from "@/lib/types";

export type { TransactionRecord };

export type TransactionFilters = {
  start: Date;
  end: Date;
  productId?: string;
  categoryId?: string;
  type?: TransactionType;
};

let seedPromise: Promise<void> | null = null;

export async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const supabase = getSupabase();
      const products = await supabase.from("products").select("id", { count: "exact", head: true });
      if (products.error) throw new Error(products.error.message);
      if ((products.count ?? 0) === 0) {
        const inserted = await supabase.from("products").insert(
          DEFAULT_PRODUCTS.map((product) => ({
            name: product.name,
            description: product.description,
            is_overhead: product.isOverhead,
          })),
        );
        if (inserted.error && !inserted.error.message.includes("duplicate")) {
          throw new Error(inserted.error.message);
        }
      }

      const categories = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true });
      if (categories.error) throw new Error(categories.error.message);
      if ((categories.count ?? 0) === 0) {
        const inserted = await supabase
          .from("categories")
          .insert(DEFAULT_CATEGORIES.map((name) => ({ name })));
        if (inserted.error && !inserted.error.message.includes("duplicate")) {
          throw new Error(inserted.error.message);
        }
      }
    })();
  }

  return seedPromise;
}

export async function listProducts(includeArchived = false) {
  await ensureSeedData();
  const supabase = getSupabase();
  let query = supabase.from("products").select("*").order("is_overhead", { ascending: false }).order("name");
  if (!includeArchived) {
    query = query.eq("archived", false);
  }
  const { data, error } = await query;
  return throwIfError(error, data ?? [], "Could not load products").map(mapProduct);
}

export async function listCategories(includeArchived = false) {
  await ensureSeedData();
  const supabase = getSupabase();
  let query = supabase.from("categories").select("*").order("name");
  if (!includeArchived) {
    query = query.eq("archived", false);
  }
  const { data, error } = await query;
  return throwIfError(error, data ?? [], "Could not load categories").map(mapCategory);
}

function applyFilters<Query extends { gte: (column: string, value: string) => Query; lte: (column: string, value: string) => Query; eq: (column: string, value: string) => Query }>(
  query: Query,
  filters: TransactionFilters,
) {
  let next = query.gte("date", toDateInput(filters.start)).lte("date", toDateInput(filters.end));
  if (filters.productId) next = next.eq("product_id", filters.productId);
  if (filters.categoryId) next = next.eq("category_id", filters.categoryId);
  if (filters.type) next = next.eq("type", filters.type);
  return next;
}

export async function listTransactions(filters: TransactionFilters) {
  const supabase = getSupabase();
  const query = applyFilters(
    supabase
      .from("transactions")
      .select(TRANSACTION_SELECT)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    filters,
  );
  const { data, error } = await query;
  return throwIfError(error, data ?? [], "Could not load transactions").map((row) =>
    mapTransaction(row as Parameters<typeof mapTransaction>[0]),
  );
}

export async function getTransaction(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .select(TRANSACTION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapTransaction(data as Parameters<typeof mapTransaction>[0]) : null;
}

export async function getTotals(filters: TransactionFilters) {
  const supabase = getSupabase();
  const query = applyFilters(
    supabase.from("transactions").select("type, amount_cents"),
    filters,
  );
  const { data, error } = await query;
  const rows = throwIfError(error, data ?? [], "Could not load totals");

  const totals = {
    income: 0,
    expense: 0,
    owner_contribution: 0,
    owner_draw: 0,
  };

  for (const row of rows) {
    if (row.type in totals) {
      totals[row.type as keyof typeof totals] += row.amount_cents;
    }
  }

  return {
    ...totals,
    net: totals.income - totals.expense,
  };
}

export async function getMonthlySeries(filters: TransactionFilters) {
  const supabase = getSupabase();
  const query = applyFilters(
    supabase.from("transactions").select("date, type, amount_cents").in("type", ["income", "expense"]),
    filters,
  ).order("date");
  const { data, error } = await query;
  const transactions = throwIfError(error, data ?? [], "Could not load monthly totals");

  const months = enumerateMonths(filters.start, filters.end);
  const series = months.map((key) => ({
    key,
    income: 0,
    expense: 0,
  }));
  const index = new Map(series.map((item, i) => [item.key, i]));

  for (const transaction of transactions) {
    const key = monthKey(asLocalDate(transaction.date));
    const i = index.get(key);
    if (i == null) continue;
    if (transaction.type === "income") {
      series[i].income += transaction.amount_cents;
    } else if (transaction.type === "expense") {
      series[i].expense += transaction.amount_cents;
    }
  }

  return series;
}

export async function getCategorySpending(filters: TransactionFilters) {
  const supabase = getSupabase();
  const query = applyFilters(
    supabase
      .from("transactions")
      .select("amount_cents, category:categories(name)")
      .eq("type", "expense"),
    filters,
  );
  const { data, error } = await query;
  const expenses = throwIfError(
    error,
    (data ?? []) as Array<{
      amount_cents: number;
      category: { name: string } | { name: string }[] | null;
    }>,
    "Could not load category spending",
  );

  const totals = new Map<string, number>();
  for (const expense of expenses) {
    const category = Array.isArray(expense.category) ? expense.category[0] : expense.category;
    const name = category?.name ?? "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + expense.amount_cents);
  }

  return [...totals.entries()]
    .map(([name, amountCents]) => ({ name, amountCents }))
    .sort((a, b) => b.amountCents - a.amountCents);
}

export async function getProductTotals(filters: TransactionFilters) {
  const products = await listProducts();
  const supabase = getSupabase();
  const query = applyFilters(
    supabase
      .from("transactions")
      .select("product_id, type, amount_cents")
      .in("type", ["income", "expense"])
      .not("product_id", "is", null),
    filters,
  );
  const { data, error } = await query;
  const transactions = throwIfError(error, data ?? [], "Could not load product totals");

  return products.map((product) => {
    const rows = transactions.filter((item) => item.product_id === product.id);
    const income = rows
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount_cents, 0);
    const expense = rows
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount_cents, 0);
    return {
      ...product,
      income,
      expense,
      net: income - expense,
    };
  });
}

export async function findUserById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function countUsers() {
  const supabase = getSupabase();
  const { count, error } = await supabase.from("users").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createUser(values: {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: values.name,
      email: values.email,
      password_hash: values.passwordHash,
      role: values.role,
    })
    .select("*")
    .single();
  return throwIfError(error, data, "Could not create the owner account");
}

export async function updateUser(
  id: string,
  values: { name: string; email: string; passwordHash: string },
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .update({
      name: values.name,
      email: values.email,
      password_hash: values.passwordHash,
    })
    .eq("id", id)
    .select("*")
    .single();
  return throwIfError(error, data, "Could not update settings");
}

export async function findProductById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function findProductByName(name: string, exceptId?: string) {
  const supabase = getSupabase();
  let query = supabase.from("products").select("*").eq("name", name).eq("archived", false);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function insertProduct(values: { name: string; description?: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from("products").insert({
    name: values.name,
    description: values.description,
    is_overhead: false,
  });
  if (error) throw new Error(error.message);
}

export async function updateProductRecord(
  id: string,
  values: { name: string; description?: string } | { archived: boolean },
) {
  const supabase = getSupabase();
  const payload =
    "archived" in values
      ? { archived: values.archived }
      : { name: values.name, description: values.description };
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function findCategoryById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCategory(data) : null;
}

export async function findCategoryByName(name: string, exceptId?: string) {
  const supabase = getSupabase();
  let query = supabase.from("categories").select("*").eq("name", name).eq("archived", false);
  if (exceptId) query = query.neq("id", exceptId);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapCategory(data) : null;
}

export async function insertCategory(name: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("categories").insert({ name });
  if (error) throw new Error(error.message);
}

export async function updateCategoryRecord(
  id: string,
  values: { name: string } | { archived: boolean },
) {
  const supabase = getSupabase();
  const { error } = await supabase.from("categories").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertTransaction(values: {
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
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: values.type,
      amount_cents: values.amountCents,
      date: toDateInput(values.date),
      description: values.description,
      vendor: values.vendor,
      payer: values.payer,
      paid_by: values.paidBy,
      notes: values.notes,
      product_id: values.productId,
      category_id: values.categoryId,
    })
    .select("id")
    .single();
  return throwIfError(error, data, "Could not save this transaction");
}

export async function updateTransactionRecord(
  id: string,
  values: Parameters<typeof insertTransaction>[0],
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("transactions")
    .update({
      type: values.type,
      amount_cents: values.amountCents,
      date: toDateInput(values.date),
      description: values.description,
      vendor: values.vendor,
      payer: values.payer,
      paid_by: values.paidBy,
      notes: values.notes,
      product_id: values.productId,
      category_id: values.categoryId,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTransactionRecord(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function findReceiptByTransactionId(transactionId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("transaction_id", transactionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReceipt(data) : null;
}

export async function findReceiptById(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("receipts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReceipt(data) : null;
}

export async function insertReceipt(values: {
  transactionId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("receipts").insert({
    transaction_id: values.transactionId,
    file_name: values.fileName,
    original_name: values.originalName,
    mime_type: values.mimeType,
    size_bytes: values.sizeBytes,
  });
  if (error) throw new Error(error.message);
}

export async function deleteReceiptRecord(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function asLocalDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}
