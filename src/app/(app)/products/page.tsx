import { ProductManager } from "@/components/products/ProductManager";
import { PeriodFilter } from "@/components/PeriodFilter";
import { parsePeriod, type SearchRecord } from "@/lib/period";
import { getProductTotals } from "@/lib/queries";

export const metadata = {
  title: "Apps & products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchRecord>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params);
  const products = await getProductTotals({ start: period.start, end: period.end });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps & products</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Track income and expenses for ParentPickup, EnrollFlow, OurDugsi, Finiin, and
            other apps. Use Shared / LLC overhead for costs that support more than one
            product. Those costs are not split automatically.
          </p>
        </div>
        <PeriodFilter
          pathname="/products"
          period={period.period}
          from={period.from}
          to={period.to}
        />
      </div>
      <ProductManager products={products} />
    </div>
  );
}
