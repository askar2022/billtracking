import { notFound } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { transactionFormValues } from "@/app/(app)/transactions/[id]/page";
import { getTransaction, listCategories, listProducts } from "@/lib/queries";

export const metadata = {
  title: "Edit transaction",
};

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, products, categories] = await Promise.all([
    getTransaction(id),
    listProducts(),
    listCategories(),
  ]);
  if (!transaction) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit transaction</h1>
        <p className="mt-1 text-sm text-slate-500">
          The original created time stays the same. Only the updated time changes.
        </p>
      </div>
      <TransactionForm
        products={products}
        categories={categories}
        transaction={transactionFormValues(transaction)}
      />
    </div>
  );
}
