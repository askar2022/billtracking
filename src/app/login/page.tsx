import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { LoginForm } from "@/components/auth/AuthForms";
import { COMPANY_NAME } from "@/lib/constants";
import { userCount } from "@/lib/auth";
import { friendlyError } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  let existingUsers = 0;
  try {
    existingUsers = await userCount();
  } catch (error) {
    return (
      <AuthFrame
        title="Can't reach the database"
        subtitle={friendlyError(error, "Check the Supabase values in Vercel.")}
      >
        <p className="text-sm text-slate-600">
          Use the service_role key, not the anon key.
        </p>
      </AuthFrame>
    );
  }

  if (existingUsers === 0) {
    redirect("/setup");
  }

  return (
    <AuthFrame title="Sign in" subtitle={`Private bookkeeping for ${COMPANY_NAME}.`}>
      <LoginForm />
    </AuthFrame>
  );
}
