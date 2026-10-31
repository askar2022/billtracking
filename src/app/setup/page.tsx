import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupForm } from "@/components/auth/AuthForms";
import { userCount } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Create owner account",
};

export default async function SetupPage() {
  let existingUsers = 0;
  try {
    existingUsers = await userCount();
  } catch (error) {
    return (
      <AuthFrame
        title="Can't reach the database"
        subtitle={friendlyError(
          error,
          "Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
        )}
      >
        <p className="text-sm text-slate-600">
          Use the service_role key, not the anon key. Then run supabase/schema.sql in the
          Supabase SQL editor.
        </p>
      </AuthFrame>
    );
  }

  if (existingUsers > 0) {
    redirect("/login");
  }

  return (
    <AuthFrame
      title="Create the owner account"
      subtitle="This is the first account for Automation LLC. Use a strong password."
    >
      <SetupForm />
    </AuthFrame>
  );
}
