import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { SetupForm } from "@/components/auth/AuthForms";
import { userCount } from "@/lib/auth";

export const metadata = {
  title: "Create owner account",
};

export default async function SetupPage() {
  if ((await userCount()) > 0) {
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
