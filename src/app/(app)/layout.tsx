import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AppShell userName={user.name} userRole={user.role}>
      {children}
    </AppShell>
  );
}
