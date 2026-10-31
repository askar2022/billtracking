import { CategoryManager } from "@/components/categories/CategoryManager";
import { listCategories } from "@/lib/queries";

export const metadata = {
  title: "Expense categories",
};

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expense categories</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Start with Services and software, Hardware and equipment, Staff, and Other.
          Examples: Vercel, Supabase, Twilio, Resend, and Hexnode belong in services and
          software. Tablets and other purchased devices belong in hardware and equipment.
          This app records purchases. It does not decide deductibility or depreciation.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
