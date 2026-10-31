import { TransactionForm } from "@/components/transactions/TransactionForm";
import { listCategories, listProducts } from "@/lib/queries";

export const metadata = {
  title: "Add transaction",
};

export default async function NewTransactionPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add transaction</h1>
        <p className="mt-1 text-sm text-slate-500">
          Amounts are stored in USD. Owner contributions are not treated as app income.
        </p>
      </div>
      <TransactionForm products={products} categories={categories} />
    </div>
  );
}
