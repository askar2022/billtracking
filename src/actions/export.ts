"use server";

import { requireUser } from "@/lib/auth";
import { summaryToCsv, transactionsToCsv } from "@/lib/csv";
import { listTransactions, getCategorySpending, getProductTotals, getTotals } from "@/lib/queries";
import { firstValue, parsePeriod, type SearchRecord } from "@/lib/period";
import { centsToDollarInput } from "@/lib/money";
import { isTransactionType } from "@/lib/validations";

export async function exportTransactionsCsv(raw: SearchRecord) {
  await requireUser();
  const period = parsePeriod(raw);
  const typeValue = firstValue(raw.type);
  const transactions = await listTransactions({
    start: period.start,
    end: period.end,
    productId: firstValue(raw.productId) || undefined,
    categoryId: firstValue(raw.categoryId) || undefined,
    type: typeValue && isTransactionType(typeValue) ? typeValue : undefined,
  });
  return transactionsToCsv(transactions);
}

export async function exportSummaryCsv(raw: SearchRecord) {
  await requireUser();
  const period = parsePeriod(raw);
  const filters = {
    start: period.start,
    end: period.end,
    productId: firstValue(raw.productId) || undefined,
    categoryId: firstValue(raw.categoryId) || undefined,
  };
  const [totals, products, categories] = await Promise.all([
    getTotals(filters),
    getProductTotals(filters),
    getCategorySpending(filters),
  ]);

  const rows = [
    { Section: "Totals", Label: "App income", "Amount (USD)": centsToDollarInput(totals.income) },
    { Section: "Totals", Label: "Business expenses", "Amount (USD)": centsToDollarInput(totals.expense) },
    {
      Section: "Totals",
      Label: "Owner contributions",
      "Amount (USD)": centsToDollarInput(totals.owner_contribution),
    },
    { Section: "Totals", Label: "Owner draws", "Amount (USD)": centsToDollarInput(totals.owner_draw) },
    {
      Section: "Totals",
      Label: "Net business activity",
      "Amount (USD)": centsToDollarInput(totals.net),
    },
    ...products.map((product) => ({
      Section: "Apps / products",
      Label: product.name,
      "Amount (USD)": centsToDollarInput(product.net),
    })),
    ...categories.map((category) => ({
      Section: "Expense categories",
      Label: category.name,
      "Amount (USD)": centsToDollarInput(category.amountCents),
    })),
    {
      Section: "Period",
      Label: period.label,
      "Amount (USD)": "",
    },
  ];

  return summaryToCsv(rows);
}
