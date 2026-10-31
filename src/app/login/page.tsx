import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { LoginForm } from "@/components/auth/AuthForms";
import { COMPANY_NAME } from "@/lib/constants";
import { userCount } from "@/lib/auth";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  if ((await userCount()) === 0) {
    redirect("/setup");
  }

  return (
    <AuthFrame title="Sign in" subtitle={`Private bookkeeping for ${COMPANY_NAME}.`}>
      <LoginForm />
    </AuthFrame>
  );
}
